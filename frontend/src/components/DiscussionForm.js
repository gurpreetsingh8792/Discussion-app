import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createDiscussion } from '../api';
import { Container, FormContainer, Input, Button, Error } from '../styles';

const DiscussionForm = () => {
    const [imagePreview, setImagePreview] = useState(null);

    return (
        <Container>
            <h2>Create Discussion</h2>
            <FormContainer>
                <Formik
                    initialValues={{ text: '', image: null, hashtags: '' }}
                    validationSchema={Yup.object({
                        text: Yup.string().required('Text is required'),
                        hashtags: Yup.string().required('Hashtags are required'),
                        image: Yup.mixed().notRequired(),
                    })}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            alert('Please log in to post a discussion.');
                            setSubmitting(false);
                            return;
                        }

                        const formData = new FormData();
                        formData.append('text', values.text);
                        formData.append('hashtags', values.hashtags);
                        if (values.image) {
                            formData.append('image', values.image);
                        }

                        createDiscussion(formData)
                            .then(() => {
                                alert('Discussion created successfully!');
                                resetForm();
                                setImagePreview(null);
                            })
                            .catch(() => {
                                alert('Error creating discussion.');
                            })
                            .finally(() => setSubmitting(false));
                    }}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <input
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    setFieldValue('image', file);
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setImagePreview(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    } else {
                                        setImagePreview(null);
                                    }
                                }}
                            />
                            {imagePreview && (
                                <div style={{
                                    margin: '10px 0',
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    maxWidth: '300px'
                                }}>
                                    <img src={imagePreview} alt="Preview" style={{
                                        maxWidth: '100%',
                                        borderRadius: '5px',
                                    }} />
                                </div>
                            )}
                            <ErrorMessage name="image" component={Error} />

                            <Field as={Input} name="text" type="text" placeholder="Text" />
                            <ErrorMessage name="text" component={Error} />

                            <Field as={Input} name="hashtags" type="text" placeholder="Hashtags" />
                            <ErrorMessage name="hashtags" component={Error} />

                            <Button type="submit" disabled={isSubmitting}>
                                Create
                            </Button>
                        </Form>
                    )}
                </Formik>
            </FormContainer>
        </Container>
    );
};

export default DiscussionForm;
