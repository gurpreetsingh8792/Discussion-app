import styled from 'styled-components';

export const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
`;

export const FormContainer = styled.div`
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
`;

export const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
`;

export const Button = styled.button`
    padding: 10px 20px;
    margin-top: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

export const Error = styled.div`
    color: red;
    font-size: 12px;
`;

export const DiscussionList = styled.ul`
    list-style: none;
    padding: 0;
`;

export const DiscussionItem = styled.li`
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
    text-align: left;
`;

export const UserList = styled.ul`
    list-style: none;
    padding: 0;
`;

export const UserItem = styled.li`
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
    text-align: left;
    display: flex;
    justify-content: space-between;
`;

export const FollowButton = styled(Button)`
    padding: 5px 10px;
    background-color: #28a745;

    &:hover {
        background-color: #218838;
    }
`;
