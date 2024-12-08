import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Space } from 'antd';

const { Title } = Typography;

const OnlineOrderLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginFailed, setLoginFailed] = useState(false);
    const [logoUrl, setLogoUrl] = useState('/images/ipos_logo.png');
    const storeUrl = useParams().storeUrl;
    const navigate = useNavigate();
    
    const handleSubmit = async () => {
        setLoginFailed(false); // 重置登录失败状态
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/onlineOrderAdminLogin`, { email, password }, { withCredentials: true });
            if (response.status === 200 && response.data.jwt) {
                sessionStorage.setItem('jwtToken', response.data.jwt);
                sessionStorage.setItem('storeUrl', storeUrl);
                navigate('/adminOrderList');
            } else {
                setLoginFailed(true); // 登录失败，显示警告
            }
        } catch (error) {
            setLoginFailed(true); // 登录失败，显示警告
        }
    };

    
    useEffect(() => {
        sessionStorage.clear();

        // 根据 storeUrl 从服务器获取 logo
        const fetchLogo = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getStoreLogo/${storeUrl}`, {
                    responseType: 'blob', // 返回图片数据
                });
                const imageUrl = URL.createObjectURL(response.data);
                setLogoUrl(imageUrl);
            } catch (error) {
                console.error('Error fetching logo:', error);
                
            }
        };

        fetchLogo();
    }, [storeUrl]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                width: '400px',
            }}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    {/* <img src="/images/ipos_logo.png" alt="logo" style={{ width: '100px' }} /> */}
                    <img src={logoUrl} alt="logo" style={{ width: '73px', background:"white"}} />
                    {/* <Title level={4}>Retail Online Order</Title> */}
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        style={{ width: '100%',marginTop: '30px' }}
                    >
                        <Form.Item
                            label="Email address"
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </Form.Item>

                        {loginFailed && <Alert message="Login failed, please try again." type="error" style={{ marginBottom: "10px" }} showIcon />}


                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
            </div>
        </div>
    );
};

export default OnlineOrderLogin;
