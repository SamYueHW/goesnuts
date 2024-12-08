import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout,notification,Button } from 'antd'; 
import CustomTable from '../../components/listComponent/ListComponent.jsx';
import AppHeader from '../../components/appHeader/AppHeader.jsx';
import './adminList.scss';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AdminList = () => {
    const [data, setData] = useState([]);
    const [storeId, setStoreId] = useState('');
    const [token, setToken] = useState();
    const [cusId, setCusId] = useState('');
    const [cusEmail, setCusEmail] = useState('');
    const navigate = useNavigate();
    const fethcOrderList = async () => {
      try{
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/fetch-order-list`, {},config);
      if (response.status === 200) {
        setCusEmail(response.data.storeInformation.adminEmail);
        setCusId(response.data.storeInformation.adminId);
        setStoreId(response.data.storeInformation.storeId);
        console.log(response.data.results);
        setData(response.data.results);}
      else {
        navigate('/adminLogin');
      }}
      catch(error){
        navigate('/adminLogin');
      }
    }
    
  useEffect(() => {
   
    fethcOrderList();

  }, []);
  const handleRefresh = () => {
    fethcOrderList();
  };
  const handleResend = async(orderId) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
   
      
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/resend-order`, 
            {"orderId": orderId},
            { headers: { Authorization: `Bearer ${token}` } }
          
        );
        if (response.status === 200) {
         
            notification.success({
                message: 'Success',
                description: 'Order has been resent'
            });

            // 重新获取订单列表, 2s后
            setTimeout(() => {
                fethcOrderList();
            }, 3000);
        } else {
            notification.error({
                message: 'Error',
                description: 'Failed to resend the order'
            });
        }
    } catch (error) {
        console.log(error);
        notification.error({
            message: 'Error',
            description: 'Failed to resend the order'
        });
    }
  };
  const handleRevoke = async(orderId) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/revoke-order`, {
            orderId: orderId,
            token: token
        });
        if (response.status === 200) {
            notification.success({
                message: 'Success',
                description: 'Order has been revoked'
            });

            // 重新获取订单列表, 2s后
            setTimeout(() => {
                fethcOrderList();
            }, 3000);
        } else {
            notification.error({
                message: 'Error',
                description: 'Failed to revoke the order'
            });
        }
    } catch (error) {
        console.log(error);
        notification.error({
            message: 'Error',
            description: 'Failed to revoke the order'
        });
    }
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <AppHeader email={cusEmail} cusId={cusId} />
    
    <div className='table_list'>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',  padding: '0 60px' }}>
      <h2>Order List</h2>
      
      <Button
        icon={<ReloadOutlined />}
        onClick={handleRefresh}
        style={{ marginLeft: 'auto',marginRight: '30px' }}
      >
        Refresh
      </Button>
    </div>


      <CustomTable 
        
        data={data} 
        onResend={handleResend} 
        onRevoke={handleRevoke}
      />
    </div>
    </Layout>
  );
};

export default AdminList;
