import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Layout,
  notification,
  Button,
  Modal,
  Checkbox,
  Table,
  Input,
  Form,
  Image,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Select, 
  message
} from 'antd';
import { ReloadOutlined, PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/appHeader/AppHeader.jsx';
import { Divide, Store } from 'lucide-react';


const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const AdminList = () => {
  const [data, setData] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [token, setToken] = useState('');
  const [cusId, setCusId] = useState('');
  const [cusEmail, setCusEmail] = useState('');
  const navigate = useNavigate();
  const [storeUrl, setStoreUrl] = useState(sessionStorage.getItem('storeUrl'));
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false); // New state for Edit Modal
  const [editingUser, setEditingUser] = useState(null); // State to hold the user being edited
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm(); // Separate form for editing
  const [searchText, setSearchText] = useState('');

  // Fetch User List
  const fetchUserList = async () => {
    try {
      const token = sessionStorage.getItem('jwtToken'); // Get JWT Token from sessionStorage
      if (!token) {
        navigate('/adminLogin/' + storeUrl);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/fetch-user-list`,
        config
      );
      if (response.status === 200) {
        setCusEmail(response.data.storeInformation.adminEmail);
        setCusId(response.data.storeInformation.adminId);
        setStoreId(response.data.storeInformation.storeId);
        console.log(response.data.results);
        // Initialize isMemberUpdated flag to false for all users
        const usersWithFlag = response.data.results.map(user => ({
          ...user,
          isMemberUpdated: false,
        }));
        setData(usersWithFlag); // Update user data
      } else {
        navigate('/adminLogin/' + storeUrl);
      }
    } catch (error) {
      console.error(error);
      navigate('/adminLogin/' + storeUrl);
    }
  };

  useEffect(() => {
    fetchUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchUserList();
  };

  // Handle Member Checkbox Change
  const handleMemberChange = (customerId, checked) => {
    const newData = data.map(user => {
      if (user.CustomerId === customerId) {
        return { ...user, IsMember: checked ? 1 : 0, isMemberUpdated: true };
      }
      return user;
    });
    setData(newData);
  };

  // Handle Reset Password for single user
  const handleResetPassword = (record) => {
    Modal.confirm({
      title: 'Confirm Reset Password',
      content: `Are you sure you want to reset the password for ${record.CustomerEmail}?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => resetPassword(record.CustomerId),
    });
  };

  // Reset Password API call
  const resetPassword = async (customerId) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/admin-reset-user-password`,
        { CustomerId: customerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Password reset successfully',
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to reset password',
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to reset password',
      });
    }
  };

  const deleteUser = async (customerId) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/admin-delete-user/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'User deleted successfully',
        });
        setEditModalVisible(false);
        fetchUserList(); // Refresh the user list
      } else {
        notification.error({  
          message: 'Error',
          description: 'Failed to delete user',
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete user',
      });
    }
  };


  // Handle Create User
  const handleCreateUser = () => {
    setCreateUserModalVisible(true);
  };

  // Submit Create User Form
  const onCreateUser = async (values) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const payload = {
        CustomerSurname: values.firstName,
        CustomerMiddleName: values.middleName,
        CustomerLastName: values.lastName,
        CustomerEmail : values.email,
        CustomerPhone: values.phone,
        IsMember: values.isMember ? 1 : 0,
        StoreId: storeId,
        Password: '0000', // Default password
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/admin-create-user`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'User created successfully',
        });
        setCreateUserModalVisible(false);
        createForm.resetFields();
        fetchUserList(); // Refresh the user list
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to create user',
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to create user',
      });
    }
  };

  // Handle Edit User
  const handleEditUser = async (record) => {
    if (record.IsNew===0) {
    const token = sessionStorage.getItem('jwtToken');

    const response = await axios.put(
            `${process.env.REACT_APP_SERVER_URL}/admin-update-user-new-status`,
            record,
            { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 200) {
      notification.success({
        message: 'Success',
        description: 'The user has been marked as not new',
      });
      
     fetchUserList(); // Refresh the user list
    } 
  }


    setEditingUser(record);
    setEditModalVisible(true);
   
    editForm.setFieldsValue({
      firstName: record.CustomerSurname,
      middleName: record.CustomerMiddleName,
      lastName: record.CustomerLastName,
      email: record.CustomerEmail,
      phone: record.CustomerPhone,
      isMember: record.IsMember === 1,
      associationName: record.AssociationName,
      associationId: record.AssociationId,
      Address: record.Address,
      Suburb: record.Suburb,
      State: record.State,
      PostCode: record.PostCode,
      DeliveryAddress: record.DeliveryAddress,  
      DeliverySuburb: record.DeliverySuburb,
      DeliveryState: record.DeliveryState,
      DeliveryPostCode: record.DeliveryPostCode,

      ABN: record.ABN,
      companyName: record.CompanyName,

    });
  };

  // Submit Edit User Form
  const onEditUser = async (values) => {
    Modal.confirm({
      title: 'Confirm Update',
      content: 'Are you sure you want to update this user\'s information?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token = sessionStorage.getItem('jwtToken');
          const payload = {
            CustomerSurname: values.firstName,
            CustomerMiddleName: values.middleName,
            CustomerLastName: values.lastName,
            CustomerEmail: values.email,
            CustomerPhone: values.phone,
            IsMember: values.isMember ? 1 : 0,
            AssociationName: values.associationName,
            AssociationId: values.associationId,
            Address: values.Address,
            Suburb: values.Suburb,
            State: values.State,
            PostCode: values.PostCode,
            DeliveryAddress: values.DeliveryAddress,
            DeliverySuburb: values.DeliverySuburb,
            DeliveryState: values.DeliveryState,
            DeliveryPostCode: values.DeliveryPostCode,
            ABN: values.ABN,
            CompanyName: values.companyName,
            };

          const response = await axios.put(
            `${process.env.REACT_APP_SERVER_URL}/admin-update-user/${editingUser.CustomerId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.status === 200) {
            notification.success({
              message: 'Success',
              description: 'User updated successfully',
            });
            setEditModalVisible(false);
            editForm.resetFields();
            fetchUserList(); // Refresh the user list
          } else {
            notification.error({
              message: 'Error',
              description: 'Failed to update user',
            });
          }
        } catch (error) {
          console.error(error);
          notification.error({
            message: 'Error',
            description: 'Failed to update user',
          });
        }
      },
    });
  };  

  // Handle Reset Password from Edit Modal
  const handleEditResetPassword = () => {
    Modal.confirm({
      title: 'Confirm Reset Password',
      content: `Are you sure you want to reset the password for ${editingUser.CustomerEmail}?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => resetPassword(editingUser.CustomerId),
    });
  };

  // Handle Delete User
  const handleDeleteUser = () => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${editingUser.CustomerEmail}?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => deleteUser(editingUser.CustomerId),
    });
  };

  // Define table columns
  const columns = [
    // {
    //   title: 'Customer ID',
    //   dataIndex: 'CustomerId',
    //   key: 'CustomerId',
    //   sorter: (a, b) => a.CustomerId - b.CustomerId,
    // },
    {
      title: 'Full Name',
      key: 'FullName',
      render: (text, record) => {
        const middleName = record.CustomerMiddleName ? ` ${record.CustomerMiddleName}` : '';
        return `${record.CustomerSurname}${middleName} ${record.CustomerLastName}`;
      },
      sorter: (a, b) => {
        const nameA = `${a.CustomerSurname}${a.CustomerMiddleName ? ` ${a.CustomerMiddleName}` : ''} ${a.CustomerLastName}`;
        const nameB = `${b.CustomerSurname}${b.CustomerMiddleName ? ` ${b.CustomerMiddleName}` : ''} ${b.CustomerLastName}`;
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Email',
      dataIndex: 'CustomerEmail',
      key: 'CustomerEmail',
      sorter: (a, b) => a.CustomerEmail.localeCompare(b.CustomerEmail),
    },
    {
      title: 'Phone',
      dataIndex: 'CustomerPhone',
      key: 'CustomerPhone',
      sorter: (a, b) => a.CustomerPhone.localeCompare(b.CustomerPhone),
    },
    {
        title: 'Member',
        dataIndex: 'IsMember',
        key: 'IsMember',
        render: (isMember) => (
          <Tag color={isMember === 1 ? 'green' : 'red'}>
            {isMember === 1 ? 'Member' : 'Non-Member'}
          </Tag>
        ),
        sorter: (a, b) => a.IsMember - b.IsMember,
      },
      {
        title: 'New Registeration',
        dataIndex: 'IsNew',
        key: 'IsNew',
        render: (isNew) => (
          <Tag color={isNew === 1 ? 'grey' : 'red'}>
            {isNew === 1 ? '' : 'New'}
          </Tag>
        ),
        sorter: (a, b) => b.IsNew - a.IsNew, // Sorting to prioritize "New" first
        defaultSortOrder: 'descend', // Ensure "New" items are displayed first by default
      },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
         
        </Space>
      ),
    },
  ];

  // Handle Search
  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  // Filtered Data based on Search
  const filteredData = data.filter(user => {
    const fullName = `${user.CustomerSurname}${user.CustomerMiddleName ? ` ${user.CustomerMiddleName}` : ''} ${user.CustomerLastName}`.toLowerCase();
    return (
      fullName.includes(searchText) ||
      user.CustomerEmail.toLowerCase().includes(searchText) ||
      user.CustomerPhone.toLowerCase().includes(searchText)
    );
  });

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <AppHeader email={cusEmail} cusId={cusId} />

      <div className='table_list'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 60px' }}>
          <h2>User List</h2>

          <Space>
            <Search
              placeholder="Search by name, email, or phone"
              onSearch={handleSearch}
              enterButton
              allowClear
              style={{ width: 300 }}
              className="custom-search"
            />
            <Button
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
            >
              Create User
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="CustomerId"
          pagination={{ pageSize: 20 }}
          style={{ padding: '0 60px' }}
          bordered
        />

      </div>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createUserModalVisible}
        onCancel={() => setCreateUserModalVisible(false)}
        onOk={() => {
          createForm
            .validateFields()
            .then(values => {
              onCreateUser(values);
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
        okText="Create"
      >
        <Form
          form={createForm}
          layout="vertical"
          name="create_user_form"
          initialValues={{ password: '0000' }} // Set default password
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input the first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="middleName"
            label="Middle Name"
          >
            <Input placeholder="Middle Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input the last name!' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input the email address!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Email Address" />
          </Form.Item>

          
          <Form.Item
            name="phone"
            label="Mobile Number"
          
            >
            <Input />

          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input the password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="isMember"
            valuePropName="checked"
          >
            <Checkbox>Is Member</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null} // Buttons are inside the form
        
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_user_form"
          onFinish={onEditUser}
          style={{
            maxHeight: '550px', // 限制 Modal 内容高度
            overflowY: 'auto', // 设置内容区域可滚动
            overflowX: 'hidden',
          }}
        >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item 
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please input the first name!' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={8}>
            <Form.Item
              name="middleName"
              label="Middle Name"
            >
              <Input placeholder="Middle Name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input the last name!' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input the email address!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Email Address" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
           
          <Form.Item
            name="phone"
            label="Mobile Number"
            required
            >
            <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="ABN"
              label="ABN"
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="companyName"
              label="Company Name"
            >
              <Input/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="associationName"
              label="Association Name"
              
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="associationId"
              label="Association ID"
            
            >
              <Input/>
            </Form.Item>
          </Col>
        </Row>
         {/* 添加证书图片预览 */}
         {editingUser && editingUser.AssociationId && (
          <Row gutter={16}>
            <Col xs={24} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>Certificate Image:</span>
                <Image 
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                  src={`${process.env.REACT_APP_SERVER_URL}/certificate-image/${storeId}/${editingUser.CustomerId}`}
                  alt="IMAGE"
                  fallback="data:image/png;base64,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"
                />
              </div>
            </Col>
          </Row>
        )}
        
        <Divider style={{ margin: '12px 0' }} />
        <Form.Item
            name = "Address"
            label="Billing Address"
          >
          <Input  placeholder="Address"/>
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="Suburb"
            >
              <Input  placeholder="Suburb"/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="State"
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
          <Col xs={24} sm={8}>
            <Form.Item
              name="PostCode"
            >
              <Input placeholder='PostCode'/>
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Form.Item
          name="DeliveryAddress"
          label="Delivery Address"
        >
          <Input placeholder='Address'/>
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="DeliverySuburb"
              
            >
              <Input placeholder='Suburb'/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="DeliveryState"
             
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
          <Col xs={24} sm={8}>
            <Form.Item
              name="DeliveryPostCode"
             
            >
              <Input placeholder='PostCode'/>
            </Form.Item>
          </Col>
        </Row>
            


          <Form.Item
            name="isMember"
            valuePropName="checked"
          >
            <Checkbox>Is Member</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button
                type="default"
                onClick={handleEditResetPassword}
              >
                Reset Password
              </Button>
              <Button
                type="default"
                onClick={handleDeleteUser}
              >
                Delete
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminList;
