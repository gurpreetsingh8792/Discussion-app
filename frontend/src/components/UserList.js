import React, { useState } from 'react';
import { fetchUsers, followUser, acceptFollowRequest } from '../api';
import { Container, UserList, UserItem, FollowButton } from '../styles';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    const handleSearch = () => {
        fetchUsers(search).then((response) => setUsers(response.data));
    };

    const handleFollow = (following_id) => {
        followUser({ following_id })
            .then(() => {
                alert('Follow request sent!');
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === following_id ? { ...user, status: 'pending' } : user
                    )
                );
            })
            .catch(() => {
                alert('Error sending follow request.');
            });
    };

    const handleAccept = (follower_id) => {
        acceptFollowRequest({ follower_id })
            .then(() => {
                alert('Follow request accepted!');
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === follower_id ? { ...user, status: 'accepted' } : user
                    )
                );
            })
            .catch(() => {
                alert('Error accepting follow request.');
            });
    };

    return (
        <Container>
            <h2>Users</h2>
            <input
                type="text"
                placeholder="Search users by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <UserList>
                {users.map((user) => (
                    <UserItem key={user.id}>
                        <span>{user.name} - {user.email}</span>
                        {user.status === 'accepted' ? (
                            <span>You are now friends</span>
                        ) : user.status === 'accept' ? (
                            <FollowButton onClick={() => handleAccept(user.id)}>Accept</FollowButton>
                        ) : user.status === 'pending' ? (
                            <FollowButton disabled>Pending</FollowButton>
                        ) : (
                            <FollowButton onClick={() => handleFollow(user.id)}>Follow</FollowButton>
                        )}
                    </UserItem>
                ))}
            </UserList>
        </Container>
    );
};

export default Users;
