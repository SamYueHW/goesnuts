import React, { useState } from 'react';
import { Layout, List, Menu, Avatar, Drawer, Divider,Button } from 'antd';
import { UserOutlined, HomeOutlined, MenuOutlined, ShopOutlined,BorderOuterOutlined, MailOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';
import ChangePasswordModal from '../modal/ChangePasswordModal.jsx';
import { useNavigate, useLocation  } from 'react-router-dom';
import './appHeader.scss';
const { Header } = Layout;

const AppHeader = ({email, cusId}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const showPasswordModal = () => {
    setPasswordModalVisible(true);
    setDrawerVisible(false); // 关闭 Drawer，当显示密码模态框时
  };
  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    const storeUrl = sessionStorage.getItem('storeUrl');  
    navigate('/adminLogin/'+storeUrl);
  };
  const goToAdminList = () => {
    navigate('/adminOrderList'); 
  };
 
  const goToStoreConfig = () => {
    
    navigate('/adminStoreConfig'); 
  };
  
  const goToItemSetup = () => {
    
    navigate('/adminStockItem'); 
  };
  const goToUserList = () => {
    
    navigate('/adminUserList'); 
  };
  
  const getDefaultSelectedKeys = () => {
    if (location.pathname.includes('/adminOrderList')) {
      return ['home'];
    } 
   
    else if (location.pathname.includes('/adminStoreConfig')) {
      return ['storeConfig'];
    }
    else if (location.pathname.includes('/adminStockItem')) {
      return ['stockItem'];
    }
    else if (location.pathname.includes('/adminUserList')) {
      return ['user'];
    }
   
    // 可以根据需要添加更多条件
    return []; // 如果没有匹配的路由，不选中任何项
  };

  const drawerContent = (
    <>
      <List>
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar icon={<MailOutlined />} />}
            title="Email"
            description={email}
          />
        </List.Item>
        <List.Item onClick={showPasswordModal} style={{ cursor: 'pointer' }}>
          <List.Item.Meta
            avatar={<Avatar icon={<LockOutlined />} />}
            title="Password"
            description="********" // 替换为密码的占位符
          />
          <RightOutlined />
        </List.Item>
      </List>
      <Divider />
      <Button block type="primary" onClick={handleLogout}>Logout</Button>
    </>
  );

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  return (
    <>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={getDefaultSelectedKeys()}>
          
          <Menu.Item key="home" icon={<HomeOutlined />} onClick={goToAdminList}>
            Order List
          </Menu.Item>
          <Menu.Item key="stockItem" icon={<BorderOuterOutlined />} onClick={goToItemSetup}>
            Stock Item
          </Menu.Item>
          <Menu.Item key="user" icon={<UserOutlined />} onClick={goToUserList}>
            User List
          </Menu.Item>
          <Menu.Item key="storeConfig" icon={<ShopOutlined />} onClick={goToStoreConfig}>
            Store Setup
          </Menu.Item>
          
     
         


          <Menu.Item key="user" className="profile-menu-item"  style={{ marginLeft: 'auto' }} onClick={showDrawer}>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        </Menu.Item>

        </Menu>
      </Header>
      <Drawer
        title="User Profile"
        placement="right"
        closable={true}
        onClose={onClose}
        open={drawerVisible}
      >
        {drawerContent}
        {/* 在这里添加 Drawer 的内容 */}
      </Drawer>
      <ChangePasswordModal cusId={cusId}
      open={passwordModalVisible}
      setVisible={setPasswordModalVisible}
    />
    </>
  );
};

export default AppHeader;
