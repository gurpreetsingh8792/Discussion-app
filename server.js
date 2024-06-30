const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const app = express();
const multer = require('multer');
const path = require('path');
const secretKey = 'your_secret_key';
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));



function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send('No token provided.');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');
        req.userId = decoded.id;
        next();
    });
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage });



app.post('/register', (req, res) => {
    const { name, mobile, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const query = 'INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)';
    db.run(query, [name, mobile, email, hashedPassword], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('users.mobile')) {
                    return res.status(400).send('Mobile number already in use.');
                }
                if (err.message.includes('users.email')) {
                    return res.status(400).send('Email already in use.');
                }
            }
            return res.status(500).send('Error registering user.');
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid email or password');
        }
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
        res.json({ auth: true, token });
    });
});


app.post('/discussions', verifyToken, upload.single('image'), (req, res) => {
    const { text, hashtags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Save the full URL
    const query = 'INSERT INTO discussions (user_id, text, image, hashtags) VALUES (?, ?, ?, ?)';
    db.run(query, [req.userId, text, image, hashtags], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(201).json({ id: this.lastID, text, hashtags, image });
    });
});


app.get('/user/discussions', verifyToken, (req, res) => {
    const query = 'SELECT * FROM discussions WHERE user_id = ?';
    db.all(query, [req.userId], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        const discussions = rows.map((row) => ({
            ...row,
            image: row.image ? `${req.protocol}://${req.get('host')}${row.image}` : null,
        }));

        res.json(discussions);
    });
});


app.put('/discussions/:id', verifyToken, (req, res) => {
    const { text, hashtags } = req.body;
    const { id } = req.params;
    const query = 'UPDATE discussions SET text = ?, hashtags = ? WHERE id = ? AND user_id = ?';
    db.run(query, [text, hashtags, id, req.userId], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(200).json({ message: 'Discussion updated successfully!' });
    });
});


app.delete('/discussions/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const query = 'DELETE FROM discussions WHERE id = ? AND user_id = ?';
    db.run(query, [id, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Discussion not found or unauthorized.' });
        db.run('DELETE FROM comments WHERE discussion_id = ?', [id]);
        db.run('DELETE FROM likes WHERE discussion_id = ?', [id]);
        res.status(200).json({ message: 'Discussion deleted successfully!' });
    });
});


app.get('/discussions/tags/:tag', verifyToken, (req, res) => {
    const { tag } = req.params;
    const query = 'SELECT * FROM discussions WHERE hashtags LIKE ? AND user_id != ?';
    db.all(query, [`%${tag}%`, req.userId], (err, rows) => {
        if (err) return res.status(500).send(err.message);

        const discussions = rows.map((row) => ({
            ...row,
            image: row.image ? `${req.protocol}://${req.get('host')}${row.image}` : null,
        }));
        res.json(discussions);
    });
});


app.get('/discussions/search', verifyToken, (req, res) => {
    const { text } = req.query;
    const query = 'SELECT * FROM discussions WHERE text LIKE ? AND user_id != ?';
    db.all(query, [`%${text}%`, req.userId], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        const discussions = rows.map((row) => ({
            ...row,
            image: row.image ? `${req.protocol}://${req.get('host')}${row.image}` : null,
        }));
        res.json(discussions);
    });
});


app.post('/discussions/:post_id/like', verifyToken, (req, res) => {
    const { post_id } = req.params;
    const user_id = req.userId;
    db.get(`SELECT * FROM likes WHERE discussion_id = ? AND user_id = ?`, [post_id, user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }
        db.run(`INSERT INTO likes (discussion_id, user_id) VALUES (?, ?)`, [post_id, user_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ status: 'success' });
        });
    });
});


app.get('/discussions/:post_id/likes/count', (req, res) => {
    const { post_id } = req.params;
    db.get(`SELECT COUNT(*) AS like_count FROM likes WHERE discussion_id = ?`, [post_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ like_count: row.like_count });
    });
});


app.get('/discussions/:post_id/likes', (req, res) => {
    const { post_id } = req.params;
    db.all(`SELECT u.id AS user_id, u.name
            FROM likes l
            JOIN users u ON l.user_id = u.id
            WHERE l.discussion_id = ?`,
        [post_id], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ likes: rows });
        });
});


app.post('/discussions/:post_id/comments', verifyToken, (req, res) => {
    const { post_id } = req.params;
    const { text, parent_comment_id } = req.body;
    const user_id = req.userId;  
    db.run(`INSERT INTO comments (discussion_id, user_id, text, parent_comment_id) VALUES (?, ?, ?, ?)`,
        [post_id, user_id, text, parent_comment_id || null],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ comment_id: this.lastID, status: 'success' });
        });
});


app.get('/discussions/:post_id/comments', (req, res) => {
    const { post_id } = req.params;
    db.all(`SELECT c.id AS comment_id, c.user_id, u.name, c.text, c.parent_comment_id, c.created_on
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.discussion_id = ?`,
        [post_id], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ comments: rows });
        });
});


app.get('/discussions/:post_id/comments/count', (req, res) => {
    const { post_id } = req.params;
    db.get(`SELECT COUNT(*) AS comment_count FROM comments WHERE discussion_id = ?`, [post_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ comment_count: row.comment_count });
    });
});


app.post('/comments/:comment_id/reply', verifyToken, (req, res) => {
    const { comment_id } = req.params;
    const { text } = req.body;
    const user_id = req.userId;  
    db.get(`SELECT discussion_id FROM comments WHERE id = ?`, [comment_id], (err, row) => {
        if (err || !row) {
            return res.status(500).json({ error: err ? err.message : "Comment not found" });
        }
        const discussion_id = row.discussion_id;
        db.run(`INSERT INTO comments (discussion_id, user_id, text, parent_comment_id) VALUES (?, ?, ?, ?)`,
            [discussion_id, user_id, text, comment_id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ comment_id: this.lastID, status: 'success' });
            });
    });
});


app.post('/comments/:comment_id/like', verifyToken, (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.userId;
    db.get(`SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [comment_id, user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'User has already liked this comment' });
        }
        db.run(`INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)`, [comment_id, user_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ status: 'success' });
        });
    });
});


app.get('/comments/:comment_id/likes', (req, res) => {
    const { comment_id } = req.params;
    db.all(`SELECT u.id AS user_id, u.name
            FROM comment_likes cl
            JOIN users u ON cl.user_id = u.id
            WHERE cl.comment_id = ?`, [comment_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ likes: rows });
    });
});


app.get('/comments/:comment_id/likes/count', (req, res) => {
    const { comment_id } = req.params;

    db.get(`SELECT COUNT(*) AS like_count FROM comment_likes WHERE comment_id = ?`, [comment_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ like_count: row.like_count });
    });
});


app.put('/comments/:comment_id', verifyToken, (req, res) => {
    const { comment_id } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    const query = 'UPDATE comments SET text = ? WHERE id = ? AND user_id = ?';
    db.run(query, [text, comment_id, userId], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('Comment not found or unauthorized.');
        res.status(200).json({ message: 'Comment updated successfully!' });
    });
});


app.delete('/comments/:comment_id', verifyToken, (req, res) => {
    const { comment_id } = req.params;
    const userId = req.userId;
    const query = 'DELETE FROM comments WHERE id = ? AND user_id = ?';
    db.run(query, [comment_id, userId], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('Comment not found or unauthorized.');
        res.status(200).json({ message: 'Comment deleted successfully!' });
    });
});


app.put('/discussions/:discussionId/view', verifyToken, (req, res) => {
    const { discussionId } = req.params;

    const query = 'UPDATE discussions SET view_count = view_count + 1 WHERE id = ?';
    db.run(query, [discussionId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'View count updated successfully!' });
    });
});


app.get('/discussions/:discussionId/view', (req, res) => {
    const { discussionId } = req.params;

    const query = 'SELECT view_count FROM discussions WHERE id = ?';
    db.get(query, [discussionId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ view_count: row ? row.view_count : 0 });
    });
});


app.post('/follow', verifyToken, (req, res) => {
    let { following_id } = req.body;
    let follower_id = req.userId;
    if (follower_id > following_id) {
        [follower_id, following_id] = [following_id, follower_id];
    }
    const query = `
        INSERT INTO follows (follower_id, following_id, status)
        VALUES (?, ?, "pending")
        ON CONFLICT(follower_id, following_id) DO UPDATE SET status = "pending"
        WHERE status != "accepted"
    `;
    db.run(query, [follower_id, following_id], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(201).json({ message: 'Follow request sent' });
    });
});


app.post('/accept-follow', verifyToken, (req, res) => {
    let { follower_id } = req.body;
    let following_id = req.userId;
    if (follower_id > following_id) {
        [follower_id, following_id] = [following_id, follower_id];
    }
    const query = `
        UPDATE follows
        SET status = "accepted"
        WHERE follower_id = ? AND following_id = ?
    `;
    db.run(query, [follower_id, following_id], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(200).json({ message: 'Follow request accepted' });
    });
});


app.get('/follow/requests', verifyToken, (req, res) => {
    const userId = req.userId; 
    const query = `
        SELECT u.id, u.name, u.email 
        FROM follows f 
        JOIN users u ON f.follower_id = u.id 
        WHERE f.following_id = ? AND f.status = 'pending'
    `;
    const params = [userId];
    console.log('Query:', query, 'Parameters:', params); 
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err.message); 
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});


app.get('/users/search', verifyToken, (req, res) => {
    const { name } = req.query;
    const userId = req.userId;
    const query = `
        SELECT u.id, u.name, u.email,
            CASE 
                WHEN f.status = 'accepted' THEN 'accepted'
                WHEN f.follower_id = ? AND f.status = 'pending' THEN 'pending'
                WHEN f.following_id = ? AND f.status = 'pending' THEN 'accept'
                ELSE 'follow'
            END AS status
        FROM users u
        LEFT JOIN follows f 
            ON (f.follower_id = u.id AND f.following_id = ?)
            OR (f.following_id = u.id AND f.follower_id = ?)
        WHERE u.name LIKE ? AND u.id != ?;
    `;
    const params = [userId, userId, userId, userId, `%${name}%`, userId];
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});


app.get('/user/details', verifyToken, (req, res) => {
    const userId = req.userId;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(row);
    });
});


app.post('/change-password', verifyToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;
    const query = 'SELECT password FROM users WHERE id = ?';
    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'User not found' });
        const isMatch = bcrypt.compareSync(oldPassword, row.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        db.run(updateQuery, [hashedPassword, userId], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error updating password' });
            res.status(200).json({ message: 'Password changed successfully' });
        });
    });
});


app.put('/users/:id', verifyToken, (req, res) => {
    const { name, mobile, email } = req.body;
    const { id } = req.params;
    const query = 'UPDATE users SET name = ?, mobile = ?, email = ? WHERE id = ? AND id = ?';
    db.run(query, [name, mobile, email, id, req.userId], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(200).json({ message: 'User profile updated successfully!' });
    });
});


app.delete('/users/delete', verifyToken, (req, res) => {
    const userId = req.userId;
    const query = 'DELETE FROM users WHERE id = ?';
    db.run(query, [userId], function (err) {
        if (err) {
            return res.status(500).send('Error deleting account');
        }
        res.status(200).json({ message: 'Account deleted successfully!' });
    });
});
app.get('/', (req, res) => {
    res.send('Welcome to the Discussion App API!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
