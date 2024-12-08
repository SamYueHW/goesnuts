// AdminMenuList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, notification, Button, Spin } from 'antd';
import AppHeader from '../../components/appHeader/AppHeader';
import { ReloadOutlined } from '@ant-design/icons';
import StockItemListComponent from '../../components/listComponent/StockItemListComponent';
import { useNavigate } from 'react-router-dom';

const AdminMenuList = () => {
    const [stockItemData, setStockItemData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [storeId, setStoreId] = useState(null); // 初始化为 null
    const [cusId, setCusId] = useState('');
    const [cusEmail, setCusEmail] = useState('');
    const [loading, setLoading] = useState(true); // 添加加载状态
    const navigate = useNavigate();

    const fetchStockItemList = async () => { // 修正函数名
        try {
            let token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
            
            if (!token) {
                token = localStorage.getItem('jwtToken'); // 从 localStorage 获取 JWT Token
            }
            if (!token) {
                // 如果没有 token，跳转到登录页面
                navigate('/adminLogin');
                return;
            }

            const config = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchStoreInfo`, config);

            if (response.status === 200) {
                setCusEmail(response.data.storeInformation.adminEmail);
                setCusId(response.data.storeInformation.adminId);
                setStoreId(response.data.storeInformation.storeId);
                console.log(response.data.storeInformation.storeId);
            } else {
                navigate('/adminLogin');
            }
        } catch (error) {
            console.error('Error fetching store info:', error);
            navigate('/adminLogin');
        } finally {
            setLoading(false); // 无论成功与否，都结束加载状态
        }
    }

    useEffect(() => {
        fetchStockItemList();
    }, []);

    // 可选：添加刷新功能
    const handleRefresh = () => {
        setLoading(true);
        fetchStockItemList();
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <AppHeader email={cusEmail} cusId={cusId} />
            <div className="table_list">
                {/* <div className="admin_menu_list_header" style={{ marginTop: "30px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </div> */}
                <div className='admin_store_config' style={{ marginTop: '20px' }}>
                    {loading ? (
                        <Spin tip="Loading..." />
                    ) : (
                        storeId ? (
                            <StockItemListComponent title="Menu List" storeId={storeId} />
                        ) : (
                            <p style={{ color: 'red' }}>Failed to load store information.</p>
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminMenuList;
