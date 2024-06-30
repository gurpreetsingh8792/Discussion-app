import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUser, fetchUserDetails, deleteUserAccount } from '../api';
import { FaTrashAlt } from 'react-icons/fa';

const UserProfile = () => {
    const [user, setUser] = useState({});
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails().then((response) => {
            setUser(response.data);
            setName(response.data.name);
            setMobile(response.data.mobile);
            setEmail(response.data.email);
        });
    }, []);

    const handleUpdate = () => {
        updateUser(user.id, { name, mobile, email })
            .then(() => {
                alert('Profile updated successfully');
                setMessage('Profile updated successfully');
                navigate('/');
            })
            .catch((error) => {
                setMessage(error.response.data.message || 'Error updating profile');
            });
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteUserAccount()
                .then(() => {
                    alert('Account deleted successfully');
                    navigate('/register');
                })
                .catch((error) => {
                    setMessage(error.response.data.message || 'Error deleting account');
                });
        }
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleUpdate}>Update</button>
            <FaTrashAlt onClick={handleDeleteAccount} style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} />
            {message && <p>{message}</p>}
        </div>
    );
};

export default UserProfile;
