// ChangePasswordModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Input, notification } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const ChangePasswordModal = ({ open, setVisible, cusId }) => {
  const [form] = Form.useForm();
  
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: 'Error',
        description: 'The new password and confirm password do not match'
      });
      return;
    }

    try {
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/updatePassword`, 
        {

          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        },config
      );

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Password changed successfully'
        });
        //clear values
        form.resetFields();
        setVisible(false);
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to change the password'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to change the password'
      });
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      title="Change Password"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <Form
        form={form}
        onFinish={handleChangePassword}
        layout="vertical"
      >
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[{ required: true, message: 'Please input your old password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { 
              required: true, 
              message: 'Please confirm your new password!' 
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
