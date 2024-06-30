import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { changePassword } from '../api';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            oldPassword: Yup.string().required('Required'),
            newPassword: Yup.string()
                .min(7, 'Must be at least 7 characters')
                .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
                .matches(/[a-z]/, 'Must contain at least one lowercase letter')
                .matches(/[0-9]/, 'Must contain at least one digit')
                .matches(/[@$!%*?&]/, 'Must contain at least one special character')
                .required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: (values, { setSubmitting, setStatus, resetForm }) => {
            changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            })
                .then(() => {
                    alert('Password changed successfully');
                    setStatus('Password changed successfully');
                    resetForm();
                })
                .catch((error) => {
                    setStatus(error.response.data.message || 'Error changing password');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        },
    });

    return (
        <div>
            <h2>Change Password</h2>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <input
                        type="password"
                        placeholder="Old Password"
                        {...formik.getFieldProps('oldPassword')}
                    />
                    {formik.touched.oldPassword && formik.errors.oldPassword ? (
                        <div>{formik.errors.oldPassword}</div>
                    ) : null}
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="New Password"
                        {...formik.getFieldProps('newPassword')}
                    />
                    {formik.touched.newPassword && formik.errors.newPassword ? (
                        <div>{formik.errors.newPassword}</div>
                    ) : null}
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        {...formik.getFieldProps('confirmPassword')}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                        <div>{formik.errors.confirmPassword}</div>
                    ) : null}
                </div>
                <button type="submit" disabled={formik.isSubmitting}>
                    Change Password
                </button>
                <button type="button" onClick={() => navigate(-1)}>
                    Cancel
                </button>
                {formik.status && <p>{formik.status}</p>}
            </form>
        </div>
    );
};

export default ChangePassword;
