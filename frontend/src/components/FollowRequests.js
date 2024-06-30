import React, { useState, useEffect } from 'react';
import { fetchFollowRequests, acceptFollowRequest } from '../api';
import { Container, UserList, UserItem, FollowButton } from '../styles';

const FollowRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchFollowRequests()
            .then((response) => setRequests(response.data))
            .catch(() => alert('Error fetching follow requests.'));
    }, []);

    const handleAcceptFollow = (follower_id) => {
        acceptFollowRequest({ follower_id })
            .then(() => {
                alert('Follow request accepted!');
                setRequests((prev) => prev.filter((req) => req.id !== follower_id));
            })
            .catch(() => {
                alert('Error accepting follow request.');
            });
    };

    return (
        <Container>
            <h2>Follow Requests</h2>
            <UserList>
                {requests.map((request) => (
                    <UserItem key={request.id}>
                        <span>{request.name} - {request.email}</span>
                        <FollowButton onClick={() => handleAcceptFollow(request.id)}>Accept Follow</FollowButton>
                    </UserItem>
                ))}
            </UserList>
        </Container>
    );
};

export default FollowRequests;
