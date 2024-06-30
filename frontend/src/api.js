import axios from 'axios';

const API_URL = 'http://localhost:3000';

const headers = () => ({
    'x-access-token': localStorage.getItem('token'),
});

export const registerUser = (user) => axios.post(`${API_URL}/register`, user);
export const loginUser = (credentials) => axios.post(`${API_URL}/login`, credentials);
export const fetchUsers = (name) => axios.get(`${API_URL}/users/search?name=${name}`, { headers: headers() });
export const createDiscussion = (discussion) => axios.post(`${API_URL}/discussions`, discussion, { headers: headers() });
export const fetchDiscussionsByTag = (tag) => axios.get(`${API_URL}/discussions/tags/${tag}`, { headers: headers() });
export const fetchDiscussionsByText = (text) => axios.get(`${API_URL}/discussions/search?text=${text}`, { headers: headers() });
export const updateDiscussion = (id, data) => axios.put(`${API_URL}/discussions/${id}`, data, { headers: headers() });
export const deleteDiscussion = (id) => axios.delete(`${API_URL}/discussions/${id}`, { headers: headers() });
export const createComment = (postId, comment) => axios.post(`${API_URL}/discussions/${postId}/comments`, comment, { headers: headers() });
export const fetchComments = (postId) => axios.get(`${API_URL}/discussions/${postId}/comments`, { headers: headers() });
export const likeDiscussion = (postId) => axios.post(`${API_URL}/discussions/${postId}/like`, {}, { headers: headers() });
export const fetchLikes = (postId) => axios.get(`${API_URL}/discussions/${postId}/likes`, { headers: headers() });
export const fetchLikesCount = (postId) => axios.get(`${API_URL}/discussions/${postId}/likes/count`, { headers: headers() });
export const replyToComment = (commentId, reply) => axios.post(`${API_URL}/comments/${commentId}/reply`, reply, { headers: headers() });
export const fetchCommentsCount = (postId) => axios.get(`${API_URL}/discussions/${postId}/comments/count`, { headers: headers() });
export const likeComment = (commentId) => axios.post(`${API_URL}/comments/${commentId}/like`, {}, { headers: headers() });
export const fetchCommentLikes = (commentId) => axios.get(`${API_URL}/comments/${commentId}/likes`, { headers: headers() });
export const updateComment = (commentId, data) => axios.put(`${API_URL}/comments/${commentId}`, data, { headers: headers() });
export const deleteComment = (commentId) => axios.delete(`${API_URL}/comments/${commentId}`, { headers: headers() });
export const fetchCommentLikeCount = (commentId) => axios.get(`${API_URL}/comments/${commentId}/likes/count`, { headers: headers() });
export const incrementViewCount = (postId) => axios.put(`${API_URL}/discussions/${postId}/view`, {}, { headers: headers() });
export const fetchViewCount = (postId) => axios.get(`${API_URL}/discussions/${postId}/view`, { headers: headers() });
export const followUser = (data) => axios.post(`${API_URL}/follow`, data, { headers: headers() });
export const acceptFollowRequest = (data) => axios.post(`${API_URL}/accept-follow`, data, { headers: headers() });
export const fetchFollowRequests = () => axios.get(`${API_URL}/follow/requests`, { headers: headers() });
export const fetchUserDiscussions = () => axios.get(`${API_URL}/user/discussions`, { headers: headers() });
export const fetchUserDetails = () => axios.get(`${API_URL}/user/details`, { headers: headers() });
export const changePassword = (data) => axios.post(`${API_URL}/change-password`, data, { headers: headers() });
export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data, { headers: headers() });
export const deleteUserAccount = () => axios.delete(`${API_URL}/users/delete`, { headers: headers() });



