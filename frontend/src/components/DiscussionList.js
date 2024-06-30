import React, { useEffect, useState } from 'react';
import { fetchDiscussionsByTag, fetchDiscussionsByText, likeDiscussion, fetchLikes, fetchLikesCount, fetchComments, fetchCommentsCount, createComment, replyToComment, likeComment, fetchCommentLikes, fetchCommentLikeCount, updateComment, deleteComment, incrementViewCount, fetchViewCount } from '../api';
import { Container, DiscussionList, DiscussionItem, Button } from '../styles';
import { FaHeart, FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const Discussions = () => {
    const [discussions, setDiscussions] = useState([]);
    const [tag, setTag] = useState('');
    const [text, setText] = useState('');
    const [comments, setComments] = useState({});
    const [likes, setLikes] = useState({});
    const [likesCount, setLikesCount] = useState({});
    const [commentsCount, setCommentsCount] = useState({});
    const [commentLikes, setCommentLikes] = useState({});
    const [commentLikeCount, setCommentLikeCount] = useState({});
    const [newComment, setNewComment] = useState('');
    const [editComment, setEditComment] = useState({});
    const [reply, setReply] = useState({});
    const [showLikes, setShowLikes] = useState({});
    const [showComments, setShowComments] = useState({});
    const [showCommentLikes, setShowCommentLikes] = useState({});
    const [hasSearched, setHasSearched] = useState(false);
    const [viewCounts, setViewCounts] = useState({});

    const fetchInitialData = async (searchTag, searchText) => {
        try {
            let discussionsResponse;

            if (searchTag) {
                discussionsResponse = await fetchDiscussionsByTag(searchTag);
            } else if (searchText) {
                discussionsResponse = await fetchDiscussionsByText(searchText);
            }

            if (discussionsResponse) {
                setDiscussions(discussionsResponse.data);

                discussionsResponse.data.forEach(async (discussion) => {
                    const likesCountResponse = await fetchLikesCount(discussion.id);
                    setLikesCount((prev) => ({
                        ...prev,
                        [discussion.id]: likesCountResponse.data.like_count
                    }));

                    const likesResponse = await fetchLikes(discussion.id);
                    setLikes((prev) => ({
                        ...prev,
                        [discussion.id]: likesResponse.data.likes
                    }));

                    const commentsCountResponse = await fetchCommentsCount(discussion.id);
                    setCommentsCount((prev) => ({
                        ...prev,
                        [discussion.id]: commentsCountResponse.data.comment_count
                    }));

                    const viewCountResponse = await fetchViewCount(discussion.id);
                    setViewCounts((prev) => ({
                        ...prev,
                        [discussion.id]: viewCountResponse.data.view_count
                    }));

                    await incrementViewCount(discussion.id);
                    setViewCounts((prev) => ({
                        ...prev,
                        [discussion.id]: prev[discussion.id] + 1 || 1
                    }));
                });

                setHasSearched(true);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
        }
    };

    const handleLike = (discussionId) => {
        likeDiscussion(discussionId)
            .then(() => {
                fetchLikesCount(discussionId)
                    .then((response) =>
                        setLikesCount((prev) => ({
                            ...prev,
                            [discussionId]: response.data.like_count
                        }))
                    )
                    .catch(() => alert('Error fetching likes count.'));

                fetchLikes(discussionId)
                    .then((response) =>
                        setLikes((prev) => ({
                            ...prev,
                            [discussionId]: response.data.likes
                        }))
                    )
                    .catch(() => alert('Error fetching likes.'));
            })
            .catch((error) => {
                alert(error.response.data.error);
            });
    };

    const handleFetchComments = (discussionId) => {
        fetchComments(discussionId)
            .then((response) => {
                setComments((prev) => ({ ...prev, [discussionId]: response.data.comments }));
                setCommentsCount((prev) => ({
                    ...prev,
                    [discussionId]: response.data.comments.length
                }));

                response.data.comments.forEach(async (comment) => {
                    const commentLikeCountResponse = await fetchCommentLikeCount(comment.comment_id);
                    setCommentLikeCount((prev) => ({
                        ...prev,
                        [comment.comment_id]: commentLikeCountResponse.data.like_count
                    }));

                    const commentLikesResponse = await fetchCommentLikes(comment.comment_id);
                    setCommentLikes((prev) => ({
                        ...prev,
                        [comment.comment_id]: commentLikesResponse.data.likes
                    }));
                });
            })
            .catch(() => alert('Error fetching comments.'));
    };

    const handleAddComment = (discussionId) => {
        createComment(discussionId, { text: newComment })
            .then(() => {
                setNewComment('');
                handleFetchComments(discussionId);
            })
            .catch(() => alert('Error adding comment.'));
    };

    const handleReplyToComment = (commentId, discussionId) => {
        replyToComment(commentId, { text: reply[commentId] })
            .then(() => {
                setReply((prev) => ({ ...prev, [commentId]: '' }));
                handleFetchComments(discussionId);
            })
            .catch(() => alert('Error replying to comment.'));
    };

    const handleCancelReply = (commentId) => {
        setReply((prev) => ({ ...prev, [commentId]: undefined }));
    };

    const handleLikeComment = (commentId) => {
        likeComment(commentId)
            .then(() => {
                fetchCommentLikeCount(commentId)
                    .then((response) =>
                        setCommentLikeCount((prev) => ({
                            ...prev,
                            [commentId]: response.data.like_count
                        }))
                    )
                    .catch(() => alert('Error fetching comment like count.'));

                fetchCommentLikes(commentId)
                    .then((response) =>
                        setCommentLikes((prev) => ({
                            ...prev,
                            [commentId]: response.data.likes
                        }))
                    )
                    .catch(() => alert('Error fetching comment likes.'));
            })
            .catch((error) => {
                alert(error.response.data.error);
            });
    };

    const handleEditComment = (commentId, discussionId) => {
        updateComment(commentId, { text: editComment[commentId] })
            .then(() => {
                alert('Comment updated successfully!');
                setEditComment((prev) => ({ ...prev, [commentId]: undefined }));
                handleFetchComments(discussionId);
            })
            .catch(() => alert('You cannot edit other users\' comments.'));
    };

    const handleDeleteComment = (commentId, discussionId) => {
        deleteComment(commentId)
            .then(() => {
                alert('Comment deleted successfully!');
                handleFetchComments(discussionId);
            })
            .catch(() => alert('You cannot delete other users\' comments.'));
    };

    const handleSearch = () => {
        if (tag || text) {
            fetchInitialData(tag, text);
        } else {
            alert('Please enter a tag or text to search.');
        }
    };

    return (
        <Container>
            <h2>Discussions</h2>
            <input
                type="text"
                placeholder="Search by tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
            />
            <input
                type="text"
                placeholder="Search by text"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
            {hasSearched && discussions.length === 0 && <p>No discussions found.</p>}
            {hasSearched && discussions.length > 0 && (
                <DiscussionList>
                    {discussions.map((discussion) => (
                        <DiscussionItem key={discussion.id}>
                            <p><strong>Text:</strong> {discussion.text}</p>
                            {discussion.image && <img src={discussion.image} alt="Discussion" style={{ maxWidth: '100%' }} />}
                            <p><strong>Hashtags:</strong> {discussion.hashtags}</p>
                            <p><strong>Created On:</strong> {discussion.created_on}</p>
                            <Button onClick={() => handleLike(discussion.id)}>Like</Button>
                            <span onClick={() => setShowLikes((prev) => ({ ...prev, [discussion.id]: !prev[discussion.id] }))}>
                                {likesCount[discussion.id] || 0} Likes
                            </span>
                            {showLikes[discussion.id] && (
                                <div>
                                    {likes[discussion.id]?.map((like) => (
                                        <p key={like.user_id}>{like.name}</p>
                                    ))}
                                </div>
                            )}
                            <span onClick={() => {
                                handleFetchComments(discussion.id);
                                setShowComments((prev) => ({ ...prev, [discussion.id]: !prev[discussion.id] }));
                            }}>
                                {commentsCount[discussion.id] || 0} Comments
                            </span>
                            {showComments[discussion.id] && (
                                <div>
                                    {comments[discussion.id]?.map((comment) => (
                                        <div key={comment.comment_id}>
                                            <p><strong>{comment.name}</strong>: {editComment[comment.comment_id] !== undefined ? (
                                                <input
                                                    type="text"
                                                    value={editComment[comment.comment_id]}
                                                    onChange={(e) => setEditComment((prev) => ({ ...prev, [comment.comment_id]: e.target.value }))}
                                                    placeholder="Edit comment..."
                                                />
                                            ) : (
                                                comment.text
                                            )}</p>
                                            <FaHeart
                                                onClick={() => handleLikeComment(comment.comment_id)}
                                                style={{ color: commentLikes[comment.comment_id]?.length ? 'red' : 'grey', cursor: 'pointer', marginRight: '5px' }}
                                            />
                                            <span onClick={() => setShowCommentLikes((prev) => ({ ...prev, [comment.comment_id]: !prev[comment.comment_id] }))}>
                                                {commentLikeCount[comment.comment_id] || 0}
                                            </span>
                                            {showCommentLikes[comment.comment_id] && (
                                                <div>
                                                    {commentLikes[comment.comment_id]?.map((like) => (
                                                        <p key={like.user_id}>{like.name}</p>
                                                    ))}
                                                </div>
                                            )}
                                            {editComment[comment.comment_id] === undefined ? (
                                                <FaEdit
                                                    onClick={() => setEditComment((prev) => ({ ...prev, [comment.comment_id]: comment.text }))}
                                                    style={{ cursor: 'pointer', marginRight: '5px' }}
                                                />
                                            ) : (
                                                <>
                                                    <Button onClick={() => handleEditComment(comment.comment_id, discussion.id)}>
                                                        Save
                                                    </Button>
                                                    <Button onClick={() => setEditComment((prev) => ({ ...prev, [comment.comment_id]: undefined }))}>
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            <FaTrashAlt
                                                onClick={() => handleDeleteComment(comment.comment_id, discussion.id)}
                                                style={{ cursor: 'pointer', marginRight: '5px' }}
                                            />
                                            {reply[comment.comment_id] === undefined && (
                                                <Button onClick={() => setReply((prev) => ({ ...prev, [comment.comment_id]: `@${comment.name} ` }))}>
                                                    Reply
                                                </Button>
                                            )}
                                            {reply[comment.comment_id] !== undefined && (
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={reply[comment.comment_id]}
                                                        onChange={(e) => setReply((prev) => ({ ...prev, [comment.comment_id]: e.target.value }))}
                                                        placeholder="Reply..."
                                                    />
                                                    <Button onClick={() => {
                                                        handleReplyToComment(comment.comment_id, discussion.id);
                                                        setReply((prev) => ({ ...prev, [comment.comment_id]: undefined }));
                                                    }}>Send</Button>
                                                    <Button onClick={() => handleCancelReply(comment.comment_id)}>Cancel</Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                    />
                                    <Button onClick={() => handleAddComment(discussion.id)}>Comment</Button>
                                </div>
                            )}
                            <p>
                                <FaEye /> {viewCounts[discussion.id] || 0} Views
                            </p>
                        </DiscussionItem>
                    ))}
                </DiscussionList>
            )}
        </Container>
    );
};

export default Discussions;