import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Alert, Space, Row, Col } from 'antd';

function ForgotPasswordForm({ onBack, onSuccess }) {
  const [form] = Form.useForm();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0); // 冷却倒计时
  const [isCodeSent, setIsCodeSent] = useState(false); // 检查是否已发送验证码
  const [isVerifying, setIsVerifying] = useState(false); // 检查是否正在验证验证码
  const [showEmailTip, setShowEmailTip] = useState(false); // 显示邮件提示

  // 使用 useEffect 进行倒计时处理
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        return message.error('Please enter your email!');
      }

      setIsSendingCode(true);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send verification code');
      }

      setCooldown(30); // 设置冷却时间为30秒
      setIsCodeSent(true); // 设置验证码已发送
      setShowEmailTip(true); // 显示邮件提示
      message.success('Verification code sent to your email.');

    } catch (error) {
      message.error(error.message || 'Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 验证验证码并重置密码
  const handleVerifyCode = async (values) => {
    try {
      setIsVerifying(true);

      const { email, verificationCode, newPassword, confirmPassword } = values;
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode, newPassword, confirmPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      message.success('Password has been reset successfully!');
      onSuccess(); // 调用成功后的回调

    } catch (error) {
      message.error(error.message || 'Failed to reset password');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Form
      form={form}
      name="forgotPassword"
      onFinish={handleVerifyCode} // 验证并重置密码
      layout="vertical"
    >
      {/* 输入邮箱 */}
      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Row gutter={8}>
          <Col flex="auto">
            <Input placeholder="Your Email" />
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleSendCode}
              disabled={cooldown > 0 || isSendingCode}
              loading={isSendingCode}
            >
              {cooldown > 0 ? `${cooldown}s` : 'Send Code'}
            </Button>
          </Col>
        </Row>
      </Form.Item>

      {showEmailTip && (
        <Form.Item>
          <Alert
            message="If you don't receive the email, please check your spam/junk folder."
            type="info"
            showIcon
            closable={false}
          />
        </Form.Item>
      )}

      {isCodeSent && (
        <>
          {/* 输入验证码 */}
          <Form.Item
            name="verificationCode"
            label="Verification Code"
            rules={[{ required: true, message: 'Please input the verification code!' }]}
          >
            <Input placeholder="Enter Verification Code" />
          </Form.Item>

          {/* 输入新密码 */}
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="New Password" />
          </Form.Item>

          {/* 确认新密码 */}
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
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
            <Input.Password placeholder="Confirm New Password" />
          </Form.Item>

          {/* 验证验证码并重置密码 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isVerifying}>
              Reset Password
            </Button>
          </Form.Item>
        </>
      )}

      <Form.Item>
        <Button type="link" onClick={onBack}>
          Back to Login
        </Button>
      </Form.Item>
    </Form>
  );
}

export default ForgotPasswordForm;
