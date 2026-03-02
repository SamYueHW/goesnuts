// StockItemListComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Checkbox,
  Typography,
  Popconfirm,
  notification,
  Divider,
  Image,
  Space,
  Switch,
  Row,
  Col,
} from 'antd';
import axios from 'axios';

import './stockItemListComponent.scss';
import StockImage from '../StockImage/StockImage';
import UploadButton from '../uploadButton/uploadButton';

const { Option } = Select;
const { Link } = Typography;

// 固定每页显示数量为20
const PAGE_SIZE = 20;

const StockItemListComponent = () => {
  // ===================== Category States =====================
  const [categoryForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [editingCategoryKey, setEditingCategoryKey] = useState('');
  const [originalCategory, setOriginalCategory] = useState(null);
  const [categorySearchKeyword, setCategorySearchKeyword] = useState('');
  const [isCategorySearchAll, setIsCategorySearchAll] = useState(false);
  
  // Pagination state for categories
  const [categoryPagination, setCategoryPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  });

  // ===================== Stock Item States =====================
  const [stockForm] = Form.useForm();
  const [stockItems, setStockItems] = useState([]);
  const [categoriesForFilter, setCategoriesForFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockSearchKeyword, setStockSearchKeyword] = useState('');
  const [isStockSearchAll, setIsStockSearchAll] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const [stockTotal, setStockTotal] = useState(0); // 总项目数
  const [editingStockItem, setEditingStockItem] = useState(null);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [stockImageUrl, setStockImageUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [fetchImageError, setFetchImageError] = useState(false);

  const [isAutoFetchEnabled, setIsAutoFetchEnabled] = useState(false);

  const [storeId, setStoreId] = useState(null);

  const [loading, setLoading] = useState(false);


   // New states for Tag filtering and Group Setting
   const [tagFilter, setTagFilter] = useState('All');
   const [tagsWithUnits, setTagsWithUnits] = useState([]);
   const [isGroupSettingModalVisible, setIsGroupSettingModalVisible] = useState(false);
   const [groupSettingForm] = Form.useForm();



  // ===================== Fetch Categories =====================
  const fetchCategories = async (keyword = '') => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchCategories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword },
      });
      if (response.data.success) {
        setCategories(response.data.categoryResult);
        // Update categoriesForFilter for stock item filtering
        setCategoriesForFilter(response.data.categoryResult.map(cat => cat.Category));
        // Reset category pagination to first page
        setCategoryPagination({ current: 1, pageSize: PAGE_SIZE });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch categories.',
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch categories.',
      });
    }
  };

   // New function to fetch tags with their unit counts
   const fetchTagsWithUnits = async () => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchTagsWithUnits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('response:', response);
      if (response.data.success) {
       
        setTagsWithUnits(response.data.tags);
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch tags.',
        });
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch tags.',
      });
    }
  };

  // ===================== Fetch Stock Items =====================
  const fetchStockItems = async (
    category = 'All',
    tag = 'All',
    keyword = '',
    searchAll = false,
    page = 1,
    limit = PAGE_SIZE // 使用固定的 pageSize
  ) => {
    try {
      const token = sessionStorage.getItem('jwtToken');

      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchStockItemList`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: searchAll || category === 'All' ? '' : category,
          tag: searchAll || tag === 'All' ? '' : tag,
          keyword: searchAll ? '' : keyword,
          page,
          limit,
        },
      });

   

      if (response.data.success) {
       
        setStockItems(response.data.stockItemsResult);

        setStockTotal(response.data.total); // 假设 total 是总项目数
        setStoreId(response.data.storeId);
      

      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch stock items.',
        });
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch stock items.',
      });
    }
  };

 // New function to handle group setting
 const handleGroupSetting = async () => {
  try {

    const values = await groupSettingForm.validateFields();
    const token = sessionStorage.getItem('jwtToken');
   
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/groupStockItems`,
      {
        category: values.category,
        tagId: values.tagId,
        packTagId: values.packTagId,
        weight: values.weight,
        packWeight: values.packWeight
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      notification.success({
        message: 'Success',
        description: 'Stock items grouped successfully.',
      });
      
      groupSettingForm.resetFields();
      setIsGroupSettingModalVisible(false);
      
      // Refresh stock items
      fetchStockItems(
        categoryFilter,
        tagFilter,
        stockSearchKeyword,
        false,
        pagination.current,
        PAGE_SIZE
      );
    } else {
      notification.error({
        message: 'Error',
        description: 'Failed to group stock items.',
      });
    }
  } catch (error) {
    console.error('Error grouping stock items:', error);
    notification.error({
      message: 'Error',
      description: 'Failed to group stock items.',
    });
  }
};


  // ===================== Category Editing =====================
  const isCategoryEditing = (record) => record.CateOnlineId === editingCategoryKey;

  const editCategory = (record) => {
    categoryForm.setFieldsValue({ ...record });
    setEditingCategoryKey(record.CateOnlineId);
    setOriginalCategory({ ...record });
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryKey('');
    categoryForm.resetFields();
  };

  const saveCategory = async (CateOnlineId) => {
    try {
      const values = await categoryForm.validateFields();
      const updatedCategory = { ...values, CateOnlineId };

      // Handle CateId ordering
      let newCateId = updatedCategory.CateId;
      const conflictingCategories = categories.filter(
        (cat) => cat.CateId === newCateId && cat.CateOnlineId !== CateOnlineId
      );

      if (conflictingCategories.length > 0) {
        // Shift existing CateIds
        for (let i = 0; i < conflictingCategories.length; i++) {
          const cat = conflictingCategories[i];
          await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/shiftCateId`,
            { CateOnlineId: cat.CateOnlineId, newCateId: newCateId + 1 },
            { headers: { Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}` } }
          );
          newCateId += 1;
        }
        updatedCategory.CateId = newCateId;
      }

      // Update the category
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/updateCategory`,
        updatedCategory,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Category updated successfully.',
        });
        // Refresh categories based on current search
        fetchCategories(isCategorySearchAll ? '' : categorySearchKeyword);
        setEditingCategoryKey('');
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to update category.',
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save category.',
      });
    }
  };

  const categoryColumns = [
    {
      title: 'CateOnlineId',
      dataIndex: 'CateOnlineId',
      key: 'CateOnlineId',
    },
    {
      title: 'Category',
      dataIndex: 'Category',
      key: 'Category',
      editable: true,
    },
    {
      title: 'Disable',
      dataIndex: 'Disable',
      key: 'Disable',
      editable: true,
      render: (text, record) => (record.Disable ? 'Yes' : 'No'),
    },
    {
      title: 'CateId',
      dataIndex: 'CateId',
      key: 'CateId',
      editable: true,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isCategoryEditing(record);
        return editable ? (
          <span>
            <Popconfirm title="Sure to save?" onConfirm={() => saveCategory(record.CateOnlineId)}>
              <Link style={{ marginRight: 8 }}>Save</Link>
            </Popconfirm>
            <Popconfirm title="Sure to cancel?" onConfirm={cancelCategoryEdit}>
              <Link>Cancel</Link>
            </Popconfirm>
          </span>
        ) : (
          <Link disabled={editingCategoryKey !== ''} onClick={() => editCategory(record)}>
            Edit
          </Link>
        );
      },
    },
  ];

  const mergedCategoryColumns = categoryColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'Disable' ? 'checkbox' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isCategoryEditing(record),
      }),
    };
  });

  const EditableCategoryCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    let inputNode = <Input />;
    if (inputType === 'checkbox') {
      inputNode = <Checkbox checked={record.Disable} />;
    }

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            valuePropName={inputType === 'checkbox' ? 'checked' : 'value'}
            style={{ margin: 0 }}
            rules={[
              {
                required: dataIndex !== 'Disable',
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // ===================== Category Search Handler =====================
  const handleCategorySearch = () => {
    fetchCategories(categorySearchKeyword);
    // Reset category pagination to first page
    setCategoryPagination({ current: 1, pageSize: PAGE_SIZE });
  };

  const handleCategorySearchAllChange = (e) => {
    setIsCategorySearchAll(e.target.checked);
    if (e.target.checked) {
      setCategorySearchKeyword('');
    }
  };

  // ===================== Stock Item Filtering and Searching =====================
  const handleStockSearch = () => {
    setPagination({ ...pagination, current: 1 });
  
    fetchStockItems(
      categoryFilter,
      tagFilter,
      stockSearchKeyword,
      isStockSearchAll,
      1,
      PAGE_SIZE
    );
  };

  const handleStockSearchAllChange = (e) => {
    setIsStockSearchAll(e.target.checked);
    if (e.target.checked) {
      setCategoryFilter('All');
      setStockSearchKeyword('');
    }
  };

  // ===================== Stock Item Pagination Handler =====================
  const handleStockPageChange = (page) => {
    setPagination({ ...pagination, current: page });
    fetchStockItems(
      categoryFilter,
      tagFilter,
      stockSearchKeyword,
      isStockSearchAll,
      page,
      PAGE_SIZE
    );

  };

  // ===================== Stock Item Editing =====================
  const openStockModal = async (record) => {
    console.log('Editing stock item:', record);
    setEditingStockItem(record);
    setIsStockModalVisible(true);
    // Fetch image if exists
    if (record.ImageUrl) {
      setStockImageUrl(record.ImageUrl);
    } else {
      setStockImageUrl('');
      setFetchImageError(false);
    }
  };
// Add this function inside your StockItemListComponent
const handleDeleteStockItem = async () => {
  if (!editingStockItem) {
    notification.error({
      message: 'Error',
      description: 'No stock item selected for deletion.',
    });
    return;
  }

  Modal.confirm({
    title: 'Are you sure you want to delete this stock item?',
    content: `Stock Item: ${editingStockItem.Description1}`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => deleteStockItem(editingStockItem),
  });
};

const deleteStockItem = async (record) => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    console.log('Deleting stock item:', record);
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/deleteStockItem`,
      { StockOnlineId: record.StockOnlineId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      notification.success({
        message: 'Success',
        description: 'Stock item deleted successfully.',
      });
      // Refresh stock items
      fetchStockItems(
        categoryFilter,
        tagFilter,
        stockSearchKeyword,
        isStockSearchAll,
        pagination.current,
        PAGE_SIZE
      );
      // Close the modal
      setIsStockModalVisible(false);
      // Reset the form
      stockForm.resetFields();
      setEditingStockItem(null);
    } else {
      notification.error({
        message: 'Error',
        description: 'Failed to delete stock item.',
      });
    }
  } catch (error) {
    console.error('Error deleting stock item:', error);
    notification.error({
      message: 'Error',
      description: 'Failed to delete stock item.',
    });
  }
};


  const saveStockItem = async () => {
    try {
      const values = await stockForm.validateFields();
      const updatedStockItem = { ...editingStockItem, ...values };
     
      // Update the stock item
      const token = sessionStorage.getItem('jwtToken');
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/updateStockItem`,
        updatedStockItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Stock item updated successfully.',
        });
        // Refresh stock items based on current search and pagination
        fetchStockItems(
          categoryFilter,
          tagFilter,
          stockSearchKeyword,
          isStockSearchAll,
          pagination.current,
          PAGE_SIZE
        );
        //clear the form
        stockForm.resetFields();
        setIsStockModalVisible(false);
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to update stock item.',
        });
      }
    } catch (error) {
      console.error('Error saving stock item:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save stock item.',
      });
    }
  };

  const applyFetchedImage = async (record, newImageBase64) => {
    if (newImageBase64) {
      console.log('Applying image:', newImageBase64);
      try {
        const token = sessionStorage.getItem('jwtToken');
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/updateStockItemImage`,
          {
            stockId: record.StockId,
            imageBase64: newImageBase64, // Ensure your backend expects base64
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          notification.success({
            message: 'Success',
            description: 'Image applied successfully.',
          });
          // Refresh stock items to reflect the updated image
          fetchStockItems(
            categoryFilter,
            stockSearchKeyword,
            isStockSearchAll,
            pagination.current,
            PAGE_SIZE
          );
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to apply image.',
          });
        }
      } catch (error) {
        console.error('Error applying image:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to apply image.',
        });
      }
    }
  };
  const handleUploadSuccess = () => {
    
    //console.log(categoryFilter, tagFilter, stockSearchKeyword, isStockSearchAll, pagination.current, PAGE_SIZE);
    // fetchStockItems(
    //   categoryFilter,
    //   tagFilter,
    //   stockSearchKeyword,
    //   isStockSearchAll,
    //   pagination.current,
    //   PAGE_SIZE
    // );
  };

  const handleOutOfStockChange = async (stockOnlineId, checked) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/updateStockItem`,
        {
          stockOnlineId,
          OutOfStock: checked ? 1 : 0,
        },
        config
      );

      notification.success({
        message: 'Success',
        description: 'Stock status updated successfully.',
      });

      // Refresh the stock items list
      fetchStockItems(
        categoryFilter,
        tagFilter,
        stockSearchKeyword,
        isStockSearchAll,
        pagination.current,
        PAGE_SIZE
      );
    } catch (error) {
      console.error('Error updating stock status:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update stock status.',
      });
    }
  };

  const handleCancel = () => {
    setIsStockModalVisible(false);
    stockForm.resetFields(); // Clear the form fields
    setEditingStockItem(null);
  };

  useEffect(() => {
    if (editingStockItem) {
      stockForm.setFieldsValue({
        Description1: editingStockItem.Description1,
        Description2: editingStockItem.Description2,
        SalesPrice: editingStockItem.SalesPrice,
        MemberPrice: editingStockItem.MemberPrice,
        SalesPriceSubDescription: editingStockItem.SalesPriceSubDescription,
        MemberPriceSubDescription: editingStockItem.MemberPriceSubDescription,
        TagId: editingStockItem.TagId,
        PackSalesPrice: editingStockItem.PackSalesPrice,
        PackMemberPrice: editingStockItem.MemberPackPrice,
        PackSalesPriceSubDescription: editingStockItem.PackSalesPriceSubDescription,
        MemberPackPriceSubDescription: editingStockItem.MemberPackPriceSubDescription,
        PackTagId: editingStockItem.PackTagId,
        Weight: editingStockItem.Weight,
        PackWeight: editingStockItem.PackWeight,
        GSTRate: editingStockItem.GSTRate,
        BarCode: editingStockItem.BarCode,
        Notes: editingStockItem.Notes,
        Enable: editingStockItem.Enable,
        Category: editingStockItem.Category,
      });
    } else {
      stockForm.resetFields();
    }
  }, [editingStockItem, stockForm]);
  
  
  const stockColumns = [
  
    {
      title: 'Enriched StockId',
      dataIndex: 'StockId',
      key: 'StockId',
      render: (text) => `${text}`,
    },
    {
      title: 'Description 1',
      dataIndex: 'Description1',
      key: 'Description1',
    },
    {
      title: 'Description 2',
      dataIndex: 'Description2',
      key: 'Description2',
    },
    {
      title: 'Sales Price',
      dataIndex: 'SalesPrice',
      key: 'SalesPrice',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Member Price',
      dataIndex: 'MemberPrice',
      key: 'MembersPrice',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'GSTRate',
      dataIndex: 'GSTRate',
      key: 'GSTRate',
      render: (rate) => `${rate}%`,
    },
    {
      title: 'Tag Id',
      dataIndex: 'TagId',
      key: 'TagId',
      sorter: (a, b) => {
        const tagA = tagsWithUnits.find(tag => tag.Id === a.TagId);
        const tagB = tagsWithUnits.find(tag => tag.Id === b.TagId);
  
        // 假设 TagId 是数字
        return (tagA?.TagId || 0) - (tagB?.TagId || 0);
  
        // 如果 TagId 是字符串，使用以下代码：
        // return (tagA?.TagId || '').localeCompare(tagB?.TagId || '');
      },
      render: (tagId, record) => {
        const tag = tagsWithUnits.find((tag) => tag.Id === tagId);
        const packTag = tagsWithUnits.find((tag) => tag.Id === record.PackTagId); // Assuming 'packtagId' is part of the record
    
        if (tag && packTag) {
          return `Tag ${tag.TagId} (${tag.unit} units) / Tag ${packTag.TagId} (${packTag.unit} units)`;
        } else if (tag) {
          return `Tag ${tag.TagId} (${tag.unit} units)`;
        } else {
          return 'None';
        }
      },
    },
    {
      title: 'Out of Stock',
      dataIndex: 'OutOfStock',
      key: 'OutOfStock',
      width: 120,
      render: (value, record) => (
        <Switch 
          checked={value === 1}
          onChange={(checked) => handleOutOfStockChange(record.StockOnlineId, checked)}
        />
      )
    },
    {
      title: 'Upload Image',
      dataIndex: 'upload',
      key: 'upload',
      render: (_, record) => (
        <UploadButton
          storeId={storeId}
          stockId={record.StockId}
          onUploadSuccess={handleUploadSuccess}
        />
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => (
        <Link onClick={() => openStockModal(record)}>Edit</Link>
      ),
    },
  ];

  const stockModalContent = (
    <Form
      form={stockForm}
      layout="vertical"
      initialValues={{
        Description1: editingStockItem?.Description1,
        Description2: editingStockItem?.Description2,
        // Description3: editingStockItem?.Description3,
        // Description4: editingStockItem?.Description4,
        SalesPrice: editingStockItem?.SalesPrice,
        MemberPrice: editingStockItem?.MemberPrice,
        SalesPriceSubDescription: editingStockItem?.SalesPriceSubDescription,
        MemberPriceSubDescription: editingStockItem?.MemberPriceSubDescription,
        TagId: editingStockItem?.TagId,

        PackSalesPrice: editingStockItem?.PackSalesPrice,
        PackMemberPrice: editingStockItem?.MemberPackPrice,
        PackSalesPriceSubDescription: editingStockItem?.PackSalesPriceSubDescription,
        MemberPackPriceSubDescription: editingStockItem?.MemberPackPriceSubDescription,
        PackTagId: editingStockItem?.PackTagId,
        Weight: editingStockItem?.Weight,
        PackWeight: editingStockItem?.PackWeight,

        GSTRate: editingStockItem?.GSTRate,
        BarCode: editingStockItem?.BarCode,
        Notes: editingStockItem?.Notes,
        Enable: editingStockItem?.Enable,
        Category: editingStockItem?.Category,
        
      
      }}
      
    >
      <Form.Item label="StockId">
        <Input value={`ENR-${editingStockItem?.StockId}`} disabled />
      </Form.Item>
      <Form.Item
        name="Description1"
        label="Description 1"
        rules={[{ required: true, message: 'Please input Description 1!' }]}
      >
        <Input  />
      </Form.Item>
      <Form.Item name="Description2" label="Description 2">
        <Input />
      </Form.Item>
      {/* <Form.Item name="Description3" label="Description 3">
        <Input />
      </Form.Item>
      <Form.Item name="Description4" label="Description 4">
        <Input />
      </Form.Item> */}
      <Row style={{gap:'2px'}}>
        <Col span={6}>
          <Form.Item name="SalesPriceSubDescription" label="Sub Description 1">
            <Input  />
          </Form.Item>
        </Col>
          <Col span={6}>
        <Form.Item
          name="SalesPrice"
          label="Sales Price"
          rules={[{ required: true, message: 'Please input Sales Price!' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        </Col>
        <Col span={5}>
        <Form.Item name="MemberPriceSubDescription" label="Sub Description 2">
            <Input />
          </Form.Item>
        </Col>
        <Col span={5}>
        <Form.Item name="MemberPrice" label="Member Price" >

          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        </Col>
        </Row>

        <Row style={{gap:'2px'}}>
        <Col span={6}>
          <Form.Item 
          name="TagId" 
          label="Tag ID"
        
        >
          <Select>
            {tagsWithUnits.map((tag) => (
              <Option key={tag.Id} value={tag.Id}>
                {`Tag ${tag.TagId} (${tag.unit} units)`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="Weight" label="Weight (g)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
       
     

      </Row>
      <Divider />

      <Row style={{gap:'2px'}}>
        <Col span={6}>
          <Form.Item name="PackSalesPriceSubDescription" label="Sub Description 3">
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="PackSalesPrice" label="Pack Sales Price">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="MemberPackPriceSubDescription" label="Sub Description 4">
            <Input />
          </Form.Item>
        </Col>
        <Col span={5}>
        <Form.Item name="PackMemberPrice" label="Pack Member Price" >

          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        </Col>
        </Row>
        <Row style={{gap:'2px'}}>
        <Col span={6}>
          <Form.Item 
          name="PackTagId" 
          label="Pack Tag ID"
        
        >
          <Select>
            {tagsWithUnits.map((tag) => (
              <Option key={tag.Id} value={tag.Id}>
                {`Tag ${tag.TagId} (${tag.unit} units)`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="PackWeight" label=" Pack Weight (g)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
     
      </Row>
    
      <Form.Item name="GSTRate" label="GST Rate">
        <InputNumber style={{ width: '100%' }} min={0} max={100} />
      </Form.Item>
      <Form.Item name="BarCode" label="BarCode">
        <Input />
      </Form.Item>
     
      <Form.Item name="Notes" label="Notes">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="Enable" valuePropName="checked">
        <Checkbox>Enable</Checkbox>
      </Form.Item>
      <Form.Item
        name="Category"
        label="Category"
        rules={[{ required: true, message: 'Please select a category!' }]}
      >
        <Select>
          {categoriesForFilter.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Divider />

    </Form>
  );

  // ===================== useEffect Hooks =====================
  useEffect(() => {
    // 一次性获取所有分类
    fetchCategories();
    fetchTagsWithUnits();

    // 一开始加载第一页的库存项
    fetchStockItems(
      categoryFilter,
      tagFilter,
      stockSearchKeyword,
      isStockSearchAll,
      pagination.current,
      PAGE_SIZE
    );
  }, []);

  // ===================== Pagination for Category Table =====================
  const handleCategoryTableChange = (pagination) => {
    setCategoryPagination(pagination);
  };

  // Helper function to get paginated categories
  const getPaginatedCategories = () => {
    const { current, pageSize } = categoryPagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    return categories.slice(start, end);
  };

  return (
    <div className="category-stock-management">
      {/* ===================== Category Management ===================== */}
      <h2>Category Management</h2>
      <div className="category-search-controls" style={{ marginBottom: 16 }}>
        <Input
          className="height-none"
          placeholder="Search Categories by Keyword"
          value={categorySearchKeyword}
          onChange={(e) => setCategorySearchKeyword(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
          disabled={isCategorySearchAll} // Disable input when Search All is checked
        />
        {/* <Checkbox checked={isCategorySearchAll} onChange={handleCategorySearchAllChange}>
          Search All
        </Checkbox> */}
        <Button type="primary" onClick={handleCategorySearch} style={{ marginLeft: 16 }}>
          Search
        </Button>
      </div>
      <Form form={categoryForm} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCategoryCell,
            },
          }}
          bordered
          dataSource={getPaginatedCategories()}
          columns={mergedCategoryColumns}
          rowClassName="editable-row"
          rowKey="CateOnlineId"
          pagination={{
            current: categoryPagination.current,
            pageSize: categoryPagination.pageSize,
            total: categories.length,
            onChange: (page, pageSize) => setCategoryPagination({ current: page, pageSize }),
            showSizeChanger: false,
          }}
          onChange={handleCategoryTableChange}
        />
      </Form>

      <Divider />

      {/* ===================== Stock Item Management ===================== */}
      <h2>Stock Item Management</h2>
      <div className="stock-item-search-controls" style={{ marginBottom: 16 }}>
        {/* <div
          className="global-auto-fetch-switch"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}
        >
          <Switch
            checked={isAutoFetchEnabled}
            onChange={(checked) => setIsAutoFetchEnabled(checked)}
            style={{ marginRight: 8 }}
          />
          <span>Enable Automatic Image Fetching for Items Without Images</span>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Select
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            style={{ width: 200, marginRight: 16 }}
          >
            <Option value="All">All</Option>
            {categoriesForFilter.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
          
          {/* Tag Filter */}
          <Select
            value={tagFilter}
            onChange={(value) => setTagFilter(value)}
            style={{ width: 200, marginRight: 16 }}
          >
            <Option value="All">All Tags</Option>
            {tagsWithUnits.map((tag) => (
              <Option key={tag.Id} value={tag.Id}>
                {`Tag ${tag.TagId} (${tag.unit} units)`}
              </Option>
            ))}
          </Select>

          <Input
            className="height-none"
            placeholder="Search by keyword, Enriched StockId, or BarCode"
            allowClear
            value={stockSearchKeyword}
            onChange={(e) => setStockSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleStockSearch();
              }
            }}
            style={{ width: 350, marginRight: 16 }}
          />
       
           {/* Search and Group Setting Buttons */}
           <Space>
            <Button type="primary" onClick={handleStockSearch}>
              Search
            </Button>
            <Button onClick={() => setIsGroupSettingModalVisible(true)}>
              Group Setting
            </Button>
          </Space>
        </div>
      </div>
      <Table
        dataSource={stockItems}
        columns={stockColumns}
        rowKey="StockOnlineId"
        pagination={{
          current: pagination.current,
          pageSize: PAGE_SIZE, // 固定为20
          total: stockTotal, // 总项目数
          onChange: handleStockPageChange,
          showSizeChanger: false, // 禁用 pageSize 选择器
          showQuickJumper: true, // 启用快速跳转
        }}
        loading={loading} // 可选：显示加载指示器
      />
      <Modal
        title="Edit Stock Item"
        open={isStockModalVisible}
        onOk={saveStockItem}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="delete"  onClick={handleDeleteStockItem} style={{ float: 'left' , backgroundColor: '#fa5757', color: 'white'}}>
            Delete
          </Button>,
          <Button key="save" type="primary" onClick={saveStockItem}>
            Save
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
        
      >
        {stockModalContent}
      </Modal>

        {/* Group Setting Modal */}
        <Modal
          title="Group Stock Items"
          open={isGroupSettingModalVisible}
          onOk={handleGroupSetting}
          onCancel={() => {
            setIsGroupSettingModalVisible(false); // 关闭模态框
            groupSettingForm.resetFields(); // 重置表单字段
          }}
          width={500}
        >
          <Form form={groupSettingForm} layout="vertical">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category!' }]}
            >
              <Select placeholder="Select Category">
                {categoriesForFilter.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* First Row for Tag and Pack Tag */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tagId"
                  label="Tag ID"
                 
                >
                  <Select placeholder="Select Tag">
                    <Option value="none">None</Option>
                    {tagsWithUnits.map((tag) => (
                      <Option key={tag.Id} value={tag.Id}>
                        {`Tag ${tag.TagId} (${tag.unit} units)`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="packTagId"
                  label="Pack Tag ID"
                >
                  <Select placeholder="Select Pack Tag">
                    <Option value="none">None</Option>
                    {tagsWithUnits.map((tag) => (
                      <Option key={tag.Id} value={tag.Id}>
                        {`Tag ${tag.TagId} (${tag.unit} units)`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Second Row for Weight and Pack Weight */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="weight"
                  label="Weight (g)"
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="packWeight"
                  label="Pack Weight (g)"
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

    </div>
  );
};

export default StockItemListComponent;
