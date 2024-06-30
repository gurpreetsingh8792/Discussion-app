import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Register from './components/Register';
import Login from './components/Login';
import DiscussionForm from './components/DiscussionForm';
import Discussions from './components/DiscussionList';
import Users from './components/UserList';
import UserDiscussions from './components/UserDiscussions';
import UserFollowRequests from './components/FollowRequests';
import { fetchUserDetails } from './api';
import ChangePassword from './components/ChangePassword';
import UserProfile from './components/UserProfile';


const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [userDetails, setUserDetails] = useState({});
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserDetails()
                .then(response => setUserDetails(response.data))
                .catch(error => console.error('Error fetching user details:', error));
        }
    }, [isAuthenticated]);

    return (
        <Router>
            <div>
                <h1>Discussion App</h1>
                {!isAuthenticated ? (
                    <nav>
                        <Link to="/register">Register</Link> | 
                        <Link to="/login">Login</Link>
                    </nav>
                ) : (
                    <nav>
                        <Link to="/create-discussion">Create Discussion</Link> | 
                        <Link to="/my-discussions">My Discussions</Link> |
                        <Link to="/my-follow-requests">My Follow Requests</Link> |
                        <Link to="/discussions">Search Discussions</Link> | 
                        <Link to="/users">Search Users</Link> |
                        <div className="profile-section" onClick={toggleProfileDropdown}>
                            <FaUserCircle className="profile-icon" size={24} />
                            <span>{userDetails.name || 'Profile'}</span>
                            {showProfileDropdown && (
                                <div className="profile-dropdown">
                                    <p><strong>Name:</strong> {userDetails.name}</p>
                                    <p><strong>Email:</strong> {userDetails.email}</p>
                                    <p><strong>Mobile:</strong> {userDetails.mobile}</p>
                                    <button onClick={handleLogout}>Logout</button>
                                   
                                    <Link to="/change-password">Change Password</Link>
                                    <button onClick={() => window.location.href = '/user-profile'}>Edit Profile</button>
                                </div>
                            )}
                        </div>
                    </nav>
                )}
                <Routes>
                    <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    {isAuthenticated && (
                        <>
                            <Route path="/create-discussion" element={<DiscussionForm />} />
                            <Route path="/my-discussions" element={<UserDiscussions />} />
                            <Route path="/my-follow-requests" element={<UserFollowRequests />} />
                            <Route path="/discussions" element={<Discussions />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="*" element={<Navigate to="/discussions" />} />
                            
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/user-profile" element={<UserProfile />} />
                        </>
                    )}
                    {!isAuthenticated && (
                        <Route path="*" element={<Navigate to="/login" />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
