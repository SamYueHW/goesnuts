import React, { useState, useEffect, useRef,useContext } from 'react';
import { ShoppingCart, Menu, X, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, Row, Col, Dropdown, Menu as AntMenu, message ,Select, Checkbox, Upload} from 'antd';
import axios from 'axios'; // 导入 axios
import './Header.css';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { wait } from '@testing-library/user-event/dist/utils';


const { Option } = Select;

export default function Header({   refreshPage}) {  
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);

  const { cartItems, total, updateCartQuantity, removeFromCart,resetCart } = useContext(CartContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);


  const storeUrl = sessionStorage.getItem('storeUrl');
  const cartRef = useRef(null);
  const cartContentRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartRef.current && !cartRef.current.contains(event.target) &&
        cartContentRef.current && !cartContentRef.current.contains(event.target)
      ) {
        setIsCartOpen(false);
      }
      
   
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const showLoginModal = () => {
    setIsRegisterModalVisible(false); 
    setIsForgotPasswordModalVisible(false); 
    setIsLoginModalVisible(true); 
  };

  const hideLoginModal = () => setIsLoginModalVisible(false);

  const showRegisterModal = () => {
    setIsLoginModalVisible(false); 
    setIsRegisterModalVisible(true); 
  };

  const hideRegisterModal = () => setIsRegisterModalVisible(false);

  const showForgotPasswordModal = () => {
    setIsLoginModalVisible(false); 
    setIsForgotPasswordModalVisible(true); 
  };

  const hideForgotPasswordModal = () => setIsForgotPasswordModalVisible(false);

  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + (isNaN(item.quantity) ? 0 : item.quantity), 0);
  };

  const handleCheckout = () => {
    if (total > 0) {

      navigate(`/checkout/${storeUrl}`);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
   
    logout();
    message.success('Logged out successfully');

    // 检查refreshPage是否为函数
    if (typeof refreshPage === 'function') {
      setTimeout(() => {
        refreshPage();
      }, 1000);
    } else {
      // 如果refreshPage不是函数，则使用window.location.reload()刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };


  
  


  const fontHomePageUrl = process.env.REACT_APP_FONT_ONLINEORDER_URL;

  // const removeFromCart = (index) => {
  //   const newCartItems = [...cartItems];
  //   newCartItems.splice(index, 1);
  //   cartItems.splice(index, 1);
  //   sessionStorage.setItem('cartItems', JSON.stringify(newCartItems));
  //   sessionStorage.setItem('total', newCartItems.reduce((acc, item) => acc + item.price * (isNaN(item.quantity) ? 0 : item.quantity), 0));
  // };

  const userMenu = (
    <AntMenu>
      <AntMenu.Item key="viewOrder" onClick={() => navigate(`/customerAccount/${storeUrl}`)}>

        View Orders
      </AntMenu.Item>
      {/* <AntMenu.Item key="editProfile" onClick={() => navigate(`/profile/${storeUrl}`)}>
        Edit Profile
      </AntMenu.Item> */}
      <AntMenu.Item key="logout" onClick={handleLogout}>
        Logout
      </AntMenu.Item>
    </AntMenu>
  );

  return (
    <header className="header">
      {/* <div className="header__promo">
        Sign up and get 20% off to your first order. <a href="#" className="header__promo-link">Sign Up Now</a>
      </div> */}
      <div className="header__container">
        <div className="header__content">
          <div className="header__logo-container">
            <button onClick={toggleMenu} className="header__menu-toggle">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* <a href="/" className="header__logo">Chang Hong</a> */}
            <a href={fontHomePageUrl}>
              <img src="/images/them-logo/logo.png" alt="logo" className="header__logo" />
            </a>

          </div>
          <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
            <ul className="header__nav-list">
              <li className="header__nav-item"><a href="/" className="header__nav-link">HOME</a></li>
              <li className="header__nav-item">
                <a href={`/shop/${storeUrl}`} className="header__nav-link">SHOP</a>
              </li>
              <li className="header__nav-item">
                <a href={`/#we-are-changhong`} className="header__nav-link">ABOUT US</a>
              </li>
              <li className="header__nav-item">
                <a href={`/contact-us/${storeUrl}`} className="header__nav-link">CONTACT US</a>
              </li>
              {/* Add more navigation items as needed */}
            </ul>
          </nav>
          <div className="header__actions">
            {!isAuthenticated ? (
              <button onClick={showLoginModal} className="header__login-button">
                <User size={24} />
                <span style={{ marginLeft: '5px' }}>Login</span>
              </button>
            ) : (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <button className="header__user-button">
                  <User size={24} />
                  <span style={{ marginLeft: '5px' }}>
                    {(user?.CustomerSurname?.[0]?.toUpperCase() || '') +
                    (user?.CustomerLastName?.[0]?.toUpperCase() || '') || 'User'}
                  </span>


                </button>
              </Dropdown>
            )}
            <button onClick={toggleCart} ref={cartRef} className="header__cart-button">
              <ShoppingCart className="header__cart-icon" />
              <span className="header__cart-count">
                {getTotalItems() <= 99 ? getTotalItems() : '···'}
              </span>
            </button>
          </div>
        </div>
      </div>
      {isCartOpen && (
        <div ref={cartContentRef} className="header__cart-content">
          <div className="header__cart-header">
          <h4 className="header__cart-title" style={{ fontSize: '20px' }}>Your Cart</h4>

            <button onClick={toggleCart} className="header__cart-close">
              <X size={20} />
            </button>
          </div>
          <ul className="header__cart-items">
            {cartItems.map((item, index) => (
              <li key={index} className="header__cart-item">
                <div className="header__cart-item-info">
                  <img
                    src={item.imgSrc}
                    alt={item.name}
                    className="header__cart-item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-product-image.png';
                    }}
                  />
                  <div className="header__cart-item-details">
                    <h5 className="header__cart-item-name" style={{ fontSize: "15px" }}>{item.name}</h5>
                    {item.subDescription&&(
                      <span className="header__cart-item-type" style={{ fontSize: "14px",margin:"2px" }} >{"Size: "+ item.subDescription}</span>
                    )}
                    <div className="header__cart-item-price"style={{ margin:"1px" }} >
                      <input
                        type="number"
                        min="1"
                        value={item.quantity||0}
                        onChange={(e) => updateCartQuantity(item.id, item.type, parseInt(e.target.value, 10))}
                        className="header__cart-item-quantity"
                      />
                      <span>x ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id, item.type)} className="header__cart-item-remove">
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
          <div className="header__cart-footer">
            <div className="header__cart-subtotal">
              <span>Subtotal</span>
              <span>${(total || 0).toFixed(2)}</span>

            </div>
            <button
              onClick={handleCheckout}
              className="header__cart-checkout"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <Modal
        title="Login"
        open={isLoginModalVisible}
        onCancel={hideLoginModal}
        footer={null}
      >
        <LoginForm
          onRegister={showRegisterModal}
          onForgotPassword={showForgotPasswordModal}
          onSuccess={(userData, token) => {
            login(userData, token);
            
            hideLoginModal();
            message.success('Logged in successfully');
            
            // 检查refreshPage是否为函数
            setTimeout(() => {
              if (typeof refreshPage === 'function') {
                refreshPage();
              } else {
                window.location.reload();
              }
            }, 1000);
          }}
        />
      </Modal>

      {/* Register Modal */}
      <Modal
        title="Register"
        open={isRegisterModalVisible}
        onCancel={hideRegisterModal}
        footer={null}
      >
        <RegisterForm
          onLogin={showLoginModal}
          onSuccess={(userData, token) => {
            login(userData, token);
            hideRegisterModal();
            message.success('Registered and logged in successfully');
            // 检查refreshPage是否为函数
            if (typeof refreshPage === 'function') {
              refreshPage();
            } else {
              window.location.reload();
            }
          }}
        />
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        title="Forgot Password"
        open={isForgotPasswordModalVisible}
        onCancel={hideForgotPasswordModal}
        footer={null}
      >
        <ForgotPasswordForm
          onBack={() => setIsForgotPasswordModalVisible(false)}
          onSuccess={() => {
            hideForgotPasswordModal();
            message.success('Password has been reset successfully!');
          }}
        />
      </Modal>
    </header>
  );
}

// LoginForm Component
function LoginForm({ onRegister, onForgotPassword, onSuccess }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false); // Optional: To handle loading state
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const handleLogin = async (values) => {
 
    setIsSubmitting(true); // Start loading
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/customerLogin`, values, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;
      onSuccess(data.user, data.token);
      // login(data.user, data.token);
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Login failed');
      }
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleLogin} // Link onFinish to handleLogin
      layout="vertical"
      style={{ maxWidth: '400px', margin: '0 auto' }} // Center the form
    >
      {/* Email Input */}
      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input placeholder="Your Email" />
      </Form.Item>

      {/* Password Input */}
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password placeholder="Your Password" />
      </Form.Item>

      {/* Forgot Password Link */}
      {/* <Form.Item>
        <div>
          <Button type="link" onClick={onForgotPassword}>
            Forgot password?
          </Button>
        </div>
      </Form.Item> */}

      {/* Login Button */}
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
          <Button
            type="primary"
            htmlType="submit" // Ensure this button submits the form
            style={{
              border: 'none',
              borderRadius: '5px',
              maxWidth: '180px',
              width: '100%', // Make the button full width of its container
              height: '45px',
              fontSize: '16px',
            }}
            loading={isSubmitting} // Optional: Show loading spinner
          >
            Login
          </Button>
        </div>
      </Form.Item>

      {/* Register Section */}
      {/* <Form.Item>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span>Not a member? Create an account</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="primary"
            onClick={onRegister}
            style={{
              backgroundColor: '#007bff', // Blue background
              border: 'none',
              borderRadius: '5px',
              maxWidth: '180px',
              width: '100%', // Make the button full width of its container
              height: '45px',
              fontSize: '16px',
            }}
          >
            Register
          </Button>
        </div>
      </Form.Item> */}
    </Form>
  );
}


// RegisterForm Component
function RegisterForm({ onLogin, onSuccess }) {
  const [form] = Form.useForm();
  
  
  const [applyForMembership, setApplyForMembership] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);

  const storeUrl = sessionStorage.getItem('storeUrl');

  const handleRegister = async (values) => {
    try {
      const storeId = JSON.parse(sessionStorage.getItem('storeId'));
      
      // 检查密码是否匹配
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }
      
      console.log('Password:', values.password);
      console.log('Confirm Password:', values.confirmPassword);
      console.log('Passwords match?', values.password === values.confirmPassword);
      
      // 检查是否需要上传证书
      if (values.applyForMembership && !certificateFile) {
        message.error('Please upload your certificate for membership application!');
        return;
      }
      
      // 创建FormData对象，用于文件上传
      const formData = new FormData();
      
      // 直接添加密码和确认密码字段，确保它们是完全相同的值
      formData.append('password', values.password);
      formData.append('confirmPassword', values.password); // 使用相同的值
      
      // 添加其他表单字段到FormData
      Object.keys(values).forEach(key => {
        // 跳过已处理的密码字段
        if (key !== 'password' && key !== 'confirmPassword' && key !== 'certificateFile') {
          // 特殊处理布尔值
          if (typeof values[key] === 'boolean') {
            formData.append(key, values[key] ? 'true' : 'false');
          } else {
            formData.append(key, values[key] === undefined ? '' : values[key]);
          }
        }
      });
      
      // 添加storeId
      formData.append('storeId', storeId);
      
      // 如果有证书文件，添加到FormData
      if (certificateFile) {
        formData.append('certificateFile', certificateFile);
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/customerRegister`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const data = response.data;
      if (response.data.isApplyForMembership) {
        // 延时显示一个message,注册成功,请等待管理员审核
        message.success('Registration successful, please wait for our team to review');
        
        setTimeout(() => {
          onSuccess(data.user, data.token);
          localStorage.setItem('jwtToken', data.token);
        }, 3000);
      }
      else {
        message.success('Registration successful');
        onSuccess(data.user, data.token);
        localStorage.setItem('jwtToken', data.token);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Registration failed');
      }
    }
  };

  // 处理文件上传
  const handleFileChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      setCertificateFile(info.file.originFileObj);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    } else if (info.file.status === 'removed') {
      setCertificateFile(null);
    }
  };

  // 文件上传前的验证
  const beforeUpload = (file) => {
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    
    // 检查文件大小，限制为5MB
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    setCertificateFile(file);
    return false; // 返回false阻止自动上传
  };

  return (
    <Form
      form={form}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="middleName"
            label="Middle Name"
           
          >
            <Input placeholder="Middle Name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input placeholder="Your Email" />
      </Form.Item>
      </Col>
      <Col xs={24} md={12}>
      <Form.Item
        name="phone"
        label="Contact Number"
        rules={[{ required: true, message: 'Please input your contact number!' }]}
      >
        <Input placeholder="Contact Number" />
      </Form.Item>
      </Col>
      </Row>
      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: 'Please input your address!' }]}
      >
        <Input placeholder="Address" />
      </Form.Item>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
      <Form.Item
        name="Suburb"
        label="Suburb"
        rules={[{ required: true, message: 'Please input your suburb!' }]}
      >
        <Input placeholder="Suburb" />
      </Form.Item>
      </Col>
      <Col xs={24} md={8}>
      <Form.Item  
        name="Postcode"
        label="Postcode"
        rules={[{ required: true, message: 'Please input your postcode!' }]}
      >
        <Input placeholder="Postcode" />
      </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name="State"
          label="State"
          rules={[{ required: true, message: 'Please input your state!' }]}
        >
          <Select placeholder="State" aria-label="State" >
            <Option value="VIC">VIC</Option>
            <Option value="NSW">NSW</Option>
            <Option value="QLD">QLD</Option>
            <Option value="SA">SA</Option>
            <Option value="WA">WA</Option>
            <Option value="TAS">TAS</Option>
            <Option value="NT">NT</Option>
            <Option value="ACT">ACT</Option>
          </Select>
        </Form.Item>
      </Col>
      </Row>
      
      

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>


      

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
        hasFeedback
      >
        <Input.Password placeholder="Password" style = {{ alignItems: 'center'}}/>
      </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                // 使用严格相等比较
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" style={{ alignItems: 'center'}}/>
        </Form.Item>
      </Col>
      </Row>
      <Form.Item
        name="applyForMembership"
        valuePropName="checked"
      >
        <Checkbox
          style={{ fontWeight: 'normal' }}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setApplyForMembership(isChecked); // 更新状态
            if (!isChecked) {
              // 清空字段值
              form.setFieldsValue({
                associationName: undefined,
                associationID: undefined,
              });
              setCertificateFile(null);
            }
          }}
        >
          Apply for Membership
        </Checkbox>
      </Form.Item>

      {applyForMembership && ( // 如果勾选了会员选项，显示额外的字段
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="associationName"
                label="Association Name"
                rules={[{ required: true, message: 'Please input the Association Name!' }]}
              >
                <Input placeholder="Association Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="associationID"
                label="Association ID"
                rules={[{ required: true, message: 'Please input the Association ID!' }]}
              >
                <Input placeholder="Association ID" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="certificateFile"
            label="Upload Certificate"
            rules={[{ required: true, message: 'Please upload your certificate!' }]}
          >
            <Upload
              name="certificateFile"
              listType="picture"
              className="upload-list-inline"
              maxCount={1}
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              customRequest={({ file, onSuccess }) => {
                // 模拟上传成功
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
              accept="image/*"
            >
              <Button>Select File</Button>
              <span style={{ marginLeft: 8 }}>Upload your certificate (image format, max: 5MB)</span>
            </Upload>
          </Form.Item>
        </>
      )}


      {/* Add a checkbox for Privacy Policy */}
      <Form.Item
        name="policy"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error('You must agree to the Privacy Policy')),
          },
        ]}
      >
        <Checkbox style={{fontWeight:"normal"}}>
          I agree to the{' '}
          <a
             href={`/privacy-policy/${storeUrl}`} // 指向隐私政策页面的路径
            target="_blank" // 新开一个页面
            rel="noopener noreferrer" // 确保安全性，防止安全漏洞
            style={{ color: '#007bff' }}
          >
            Privacy Policy
          </a>
        </Checkbox>
      </Form.Item>
      {/* Add additional fields as needed */}
      {/* <Form.Item style={{ display: 'flex', justifyContent: 'center' }}> */}
      <Form.Item style={{ display: 'flex' }}>
        <Button type="primary" htmlType="submit"   
        style={{
            border: 'none',
            borderRadius: '5px',
            width: '180px',
            width: '100%', // 使按钮在父容器内充满宽度
            height: '45px',
            fontSize: '16px',
          }} >
          Register
        </Button>
      </Form.Item>
      <Form.Item>
        <Button type="link" onClick={onLogin}>
          Already have an account? Login
        </Button>
      </Form.Item>
    </Form>
  );
}

// ForgotPasswordForm Component
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
      
      console.log('Sending verification code to:', email);
      console.log('API URL:', `${process.env.REACT_APP_SERVER_URL}/forgot-password`);

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/forgot-password`, { email }, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('API response:', response.data);

      // 如果后端返回非 2xx 状态码，axios 会抛出错误
      setCooldown(30); // 设置冷却时间为30秒
      setIsCodeSent(true); // 设置验证码已发送
      setShowEmailTip(true); // 显示邮件提示
      message.success('Verification code sent to your email.');

    } catch (error) {
      console.error('Error sending verification code:', error);
      
      if (error.response) {
        // 服务器返回了响应，但状态码不是2xx
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response error headers:', error.response.headers);
        
        if (error.response.data && error.response.data.message) {
          message.error(error.response.data.message);
        } else {
          message.error(`Failed to send verification code: ${error.response.status}`);
        }
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        console.error('No response received:', error.request);
        message.error('No response from server. Please check your network connection.');
      } else {
        // 在设置请求时发生了错误
        console.error('Request error:', error.message);
        message.error(`Error: ${error.message}`);
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // 验证验证码并重置密码
  const handleVerifyCode = async (values) => {
    try {
      setIsVerifying(true);

      const { email, verificationCode, newPassword, confirmPassword } = values;

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/reset-password`, {
        email,
        verificationCode,
        newPassword,
        confirmPassword,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('API response:', response.data);

      // 如果后端返回非 2xx 状态码，axios 会抛出错误
      message.success('Password has been reset successfully!');
      onSuccess(); // 调用成功后的回调

    } catch (error) {
      console.error('Error resetting password:', error);
      
      if (error.response) {
        // 服务器返回了响应，但状态码不是2xx
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response error headers:', error.response.headers);
        
        if (error.response.data && error.response.data.message) {
          message.error(error.response.data.message);
        } else {
          message.error(`Failed to reset password: ${error.response.status}`);
        }
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        console.error('No response received:', error.request);
        message.error('No response from server. Please check your network connection.');
      } else {
        // 在设置请求时发生了错误
        console.error('Request error:', error.message);
        message.error(`Error: ${error.message}`);
      }
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
          <div style={{ color: '#1890ff', marginBottom: '10px', fontSize: '14px' }}>
            If you don't receive the email, please check your spam/junk folder.
          </div>
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
