// Login.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../api';
import { Container, FormContainer, Input, Button, Error } from '../styles';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    return (
        <Container>
            <h2>Login</h2>
            <FormContainer>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={Yup.object({
                        email: Yup.string().email('Invalid email address').required('Required'),
                        password: Yup.string().required('Required'),
                    })}
                    onSubmit={(values, { setSubmitting }) => {
                        loginUser(values)
                            .then((response) => {
                                localStorage.setItem('token', response.data.token);
                                setIsAuthenticated(true);
                                alert('Login successful!');
                                navigate('/create-discussion');
                            })
                            .catch(() => {
                                alert('Error logging in.');
                            })
                            .finally(() => setSubmitting(false));
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Field as={Input} name="email" type="email" placeholder="Email" />
                            <ErrorMessage name="email" component={Error} />

                            <Field as={Input} name="password" type="password" placeholder="Password" />
                            <ErrorMessage name="password" component={Error} />

                            <Button type="submit" disabled={isSubmitting}>
                                Login
                            </Button>
                        </Form>
                    )}
                </Formik>
            </FormContainer>
        </Container>
    );
};

export default Login;
