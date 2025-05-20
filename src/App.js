import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Headers/Header';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Checkout from './pages/Checkout/Checkout';
import OnlineOrderLogin from './pages/onlineOrderLogin/OnlineOrderLogin';
import AdminStoreConfig from './pages/adminStoreConfig/AdminStoreConfig';
import AdminList from './pages/adminList/AdminList.jsx';
import OrderResult from './pages/orderConfirm/OrderConfirm.jsx';
import OrderSucess from './pages/OrderSucess/OrderSucess.jsx';
import AdminStockItem from './pages/AdminStockItem/AdminStockItem.jsx';
import CustomerAccount from './pages/CustomerAccount/CustomerAccount.jsx';
import AdminUserList from './pages/adminUserList/AdminUserList.jsx';

import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy.jsx';
import ContactUs from './pages/ContactUs/ContactUs.jsx';

import { ConfigProvider,message } from 'antd'; // 引入 ConfigProvider
import CustomerOrderDetail from './pages/CustomerOrderDetail/CustomerOrderDetail.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext.jsx';



const App = () => {
  return (
    <CartProvider>
    <AuthProvider>
      
    <Router>
      {/* <div className="main-page-wrapper"> */}
        <Routes>
          <Route path="/home" element={<Navigate to="/home.html" />} />
          <Route path="/adminLogin/:storeUrl" element={<OnlineOrderLogin />} />
          <Route path="/shop/:storeUrl/:category?" element={<Shop />} />

          <Route path="/adminOrderList" element={<AdminList />} />
          <Route path="/adminStoreConfig" element={<AdminStoreConfig />} />
          <Route path="/shop/:storeUrl/product-details/:productId/:productDetials" element={<ProductDetail />} />
          <Route path="/checkout/:storeUrl/:encryptedOrderId?" element={<Checkout />} />
          <Route path="/order-success/:storeUrl/:encryptedOrderId?" element={<OrderSucess />} />
          <Route path="/order-success" element={<OrderResult />} />
          <Route path="/adminStockItem" element={<AdminStockItem />} />
          <Route path="/customerAccount/:storeUrl" element={<CustomerAccount />} />
          <Route path='/order-details/:orderId' element={<CustomerOrderDetail />} />
          <Route path='/adminUserList' element={<AdminUserList />} />
          <Route path="/privacy-policy/:storeUrl" element={<PrivacyPolicy />} />
          <Route path="/contact-us/:storeUrl" element={<ContactUs />} />
        </Routes>
      {/* </div> */}
    </Router>
    </AuthProvider>
    </CartProvider>
  
  );
};
message.config({
  placement: 'topRight', // 设置位置
  top: 120, // 设置与顶部的距离，单位为 px
});

const MainApp = () => {
  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#59ab02', // 主颜色使用 #59ab02
        // borderRadius: 6, // 圆角设置
        // colorBgContainer: 'rgba(7, 59, 108, 0.6)', // 背景颜色
      },
      // components: {
      //   Select: {
      //     colorText: '#fff', // 文本颜色
      //     controlItemBgActive: 'rgba(89, 171, 2, 0.6)', // 激活时的背景颜色适配 #59ab02
      //     controlItemBgHover: 'rgba(89, 171, 2, 0.8)', // 悬浮时的背景颜色更深
      //     colorBorder: '#59ab02', // 边框颜色
      //     colorBgElevated: 'rgba(7, 59, 108, 0.4)', // 浮动层容器背景色
      //     controlOutlineWidth: 0, // 控制轮廓线宽度
      //     colorTextQuaternary: '#fff', // 按钮文本颜色
      //     colorTextPlaceholder: '#fff', // 占位文本颜色
      //     controlHeight: 28, // 控件高度
      //   },
      //   Input: {
      //     colorBgContainer: '#ffffff', // Input 背景色保持为白色
      //     colorBorder: '#59ab02', // Input 边框颜色
      //     colorText: '#000', // Input 文本颜色
      //     colorTextPlaceholder: '#999', // Input 占位符文本颜色
      //   }
      // }
    }}
  >
      <App />
    </ConfigProvider>
  );
};

export default MainApp;
