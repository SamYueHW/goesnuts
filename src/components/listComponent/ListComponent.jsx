import React, { useState, useEffect } from 'react';
import { Space, Table, Button, Modal, Descriptions, Select, Spin } from 'antd';
import { DEFAULT_BREAKPOINTS } from 'react-bootstrap/esm/ThemeProvider';

const { Option } = Select;

const CustomTable = ({ title, data, onResend }) => {
  const [filterOption, setFilterOption] = useState('failed');
  const [tableData, setTableData] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filtering logic based on EnrichInvoiceId
  useEffect(() => {
   
    if (Array.isArray(data)) {
   
    switch (filterOption) {
      case 'failed':
        setTableData(data.filter(item => !item.enrichInvoiceId));
        break;
      case 'success':
        setTableData(data.filter(item => item.enrichInvoiceId));
        break;
      case 'all':
        setTableData(data);
        break;
      default:
        setTableData(data);
    }
  }
  }, [data, filterOption]);

  const handleFilterChange = (value) => {
    setFilterOption(value);
  };

  const handleResend = (orderId) => {
    setLoadingStates(prev => ({ ...prev, [orderId]: true }));
    onResend(orderId);
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [orderId]: false }));
    }, 4500); // Simulate resend delay
  };

  const handleRowDoubleClick = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Columns for the main table
  const columns = [
    {
      title: 'Order Id',
      dataIndex: 'onlineOrderId',
      key: 'onlineOrderId',
    },
    {
      title: 'Order Time',
      dataIndex: 'orderTime',
      key: 'orderTime',
      sorter: (a, b) => new Date(a.orderTime) - new Date(b.orderTime),
    },
    {
      title: 'Enrich Invoice Id',
      dataIndex: 'enrichInvoiceId',
      key: 'enrichInvoiceId',
    },
    {
      title: 'Customer Name',
      dataIndex: ['customer', 'customerName'],
      key: 'customerName',
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      key: 'paid',
      sorter: (a, b) => a.paid - b.paid,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.enrichInvoiceId && (
            <Button
              onClick={() => handleResend(record.onlineOrderId)}
              disabled={loadingStates[record.onlineOrderId]}
            >
              {loadingStates[record.onlineOrderId] ? <Spin size="small" /> : 'Resend'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 80px' }}>
      <h2>{title}</h2>
      {/* Filter Dropdown */}
      <div style={{ marginBottom: 16 }}>
        <Select defaultValue="failed" style={{ width: 120}} onChange={handleFilterChange}>
          <Option value="failed">Failed</Option>
          <Option value="success">Success</Option>
          <Option value="all">All</Option>
        </Select>
      </div>
      
      {/* Main Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        onRow={(record) => ({
          onDoubleClick: () => handleRowDoubleClick(record),
        })}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 50,
        }}
        rowKey="onlineOrderId"
      />

      {/* Modal for detailed order information */}
      <Modal
 
  open={isModalVisible}
  onOk={handleOk}
  onCancel={handleCancel}
  width={800}  // 设置宽度为800px或其他你需要的宽度
>
  {selectedRecord && (
    <>
      {/* Order Summary Section */}
      <Descriptions title="Order Summary" bordered column={2}>
        <Descriptions.Item label="Order Id">{selectedRecord.onlineOrderId}</Descriptions.Item>
        <Descriptions.Item label="Enrich Invoice Id">{selectedRecord.enrichInvoiceId || 'N/A'}</Descriptions.Item>
    <Descriptions.Item label="Paid">${selectedRecord.paid}</Descriptions.Item>
     
   
        <Descriptions.Item label="Order Time">{selectedRecord.orderTime}</Descriptions.Item>
        <Descriptions.Item label="Freight">${selectedRecord.freight}</Descriptions.Item>
        <Descriptions.Item label="Surcharge">${selectedRecord.surcharge}</Descriptions.Item>
        <Descriptions.Item label="Payment Method">{selectedRecord.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label="Payment Id">{selectedRecord.paymentId}</Descriptions.Item>
        {/* //orderNotes */}
        <Descriptions.Item label="Order Notes">{selectedRecord.orderNotes}
        </Descriptions.Item>
      </Descriptions>

      {/* Order Items Section */}
      <Descriptions title="Order Items" bordered column={1} style={{ marginTop: '16px' }}>
        {selectedRecord.itemDetails.map((item, index) => (
          <Descriptions.Item label={`${item.description1}`} key={item.stockId}>
            {` Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}, Stock ID: ${item.stockId}`}
          </Descriptions.Item>
        ))}
      </Descriptions>

      {/* Customer Info Section */}
      <Descriptions title="Customer Info" bordered column={2} style={{ marginTop: '16px' }}>

        <Descriptions.Item label="Customer Name">{selectedRecord.customer.customerName}</Descriptions.Item>
      
      {/* BLANK */}
      <Descriptions.Item >{}</Descriptions.Item>
        <Descriptions.Item label="Customer Mobile">{selectedRecord.customer.mobile}</Descriptions.Item>
        <Descriptions.Item label="Customer Email">{selectedRecord.customer.email}</Descriptions.Item>
      
        <Descriptions.Item label="Customer Billing Address">{selectedRecord.customer.address+", "+selectedRecord.customer.suburb+", "+selectedRecord.customer.state+", "+selectedRecord.customer.postCode+" "+selectedRecord.customer.country}</Descriptions.Item>
        {selectedRecord.deliveryMethod !== "pickup" ? (
        <Descriptions.Item label="Customer Delivery Address">{selectedRecord.deliveryAddress+", "+selectedRecord.deliverySuburb+", "+selectedRecord.deliveryState+", "+selectedRecord.deliveryPostCode+" "+selectedRecord.deliveryCountry}</Descriptions.Item>
        ):(
          <Descriptions.Item label="Customer Delivery Address">{"Pickup From Store"}</Descriptions.Item>
        )}
        <Descriptions.Item label="Customer Company">{selectedRecord.customer.company}</Descriptions.Item>
        <Descriptions.Item label="Customer ABN">{selectedRecord.customer.abn}</Descriptions.Item>
      </Descriptions>
    </>
  )}
</Modal>

    </div>
  );
};

export default CustomTable;
