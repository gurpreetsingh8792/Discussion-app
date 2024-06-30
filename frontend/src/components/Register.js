import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../api';
import { Container, FormContainer, Input, Button, Error } from '../styles';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <h2>Register</h2>
            <FormContainer>
                <Formik
                    initialValues={{ name: '', mobile: '', email: '', password: '' }}
                    validationSchema={Yup.object({
                        name: Yup.string().required('Required'),
                        mobile: Yup.string().required('Required'),
                        email: Yup.string().email('Invalid email address').required('Required'),
                        password: Yup.string()
                            .min(7, 'Must be at least 7 characters')
                            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
                            .matches(/[a-z]/, 'Must contain at least one lowercase letter')
                            .matches(/[0-9]/, 'Must contain at least one digit')
                            .matches(/[@$!%*?&]/, 'Must contain at least one special character')
                            .required('Required'),

                    })}
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        registerUser(values)
                            .then(() => {
                                alert('Registration successful!');
                                navigate('/login');
                            })
                            .catch((error) => {
                                if (error.response && error.response.data) {
                                    if (error.response.data.includes('Mobile number')) {
                                        setFieldError('mobile', 'Mobile number already in use.');
                                    }
                                    if (error.response.data.includes('Email')) {
                                        setFieldError('email', 'Email already in use.');
                                    }
                                } else {
                                    alert('Error registering user.');
                                }
                            })
                            .finally(() => setSubmitting(false));
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Field as={Input} name="name" type="text" placeholder="Name" />
                            <ErrorMessage name="name" component={Error} />

                            <Field as={Input} name="mobile" type="text" placeholder="Mobile" />
                            <ErrorMessage name="mobile" component={Error} />

                            <Field as={Input} name="email" type="email" placeholder="Email" />
                            <ErrorMessage name="email" component={Error} />

                            <Field as={Input} name="password" type="password" placeholder="Password" />
                            <ErrorMessage name="password" component={Error} />

                            <Button type="submit" disabled={isSubmitting}>
                                Register
                            </Button>
                        </Form>
                    )}
                </Formik>
            </FormContainer>
        </Container>
    );
};

export default Register;
