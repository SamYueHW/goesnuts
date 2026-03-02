// AdminStoreConfig.jsx
import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  InputNumber,
  Divider,
  TimePicker,
  Checkbox,
  Form,
  Input,
  Upload,
  Button,
  notification,
  Layout,
  Select,
  Spin,
  Modal,
} from 'antd';
import {
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../components/listComponent/ListComponent.jsx';
import AppHeader from '../../components/appHeader/AppHeader.jsx';
import './adminStoreConfig.scss';

const { Option } = Select;

const AdminStoreConfig = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [storeInfoData, setStoreInfoData] = useState({});
  const [storeConfigData, setStoreConfigData] = useState({});
  const [storeId, setStoreId] = useState('');
  const [cusId, setCusId] = useState('');
  const [cusEmail, setCusEmail] = useState('');
  const [storeIconUrl, setStoreIconUrl] = useState('');
  const [iconLoading, setIconLoading] = useState(false);
  const [iconLoadError, setIconLoadError] = useState(false);

  const [promotions, setPromotions] = useState([
    { id: 1, subtitle: '', text: '', imgUrl: '', file: null },
    { id: 2, subtitle: '', text: '', imgUrl: '', file: null },
    { id: 3, subtitle: '', text: '', imgUrl: '', file: null },
    { id: 4, subtitle: '', text: '', imgUrl: '', file: null },
  ]);

  const [itemTags, setItemTags] = useState([]);
  const [parcelSetting, setParcelSetting] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [timeValues, setTimeValues] = useState({
    MondayStart: null,
    MondayEnd: null,
    TuesdayStart: null,
    TuesdayEnd: null,
    WednesdayStart: null,
    WednesdayEnd: null,
    ThursdayStart: null,
    ThursdayEnd: null,
    FridayStart: null,
    FridayEnd: null,
    SaturdayStart: null,
    SaturdayEnd: null,
    SundayStart: null,
    SundayEnd: null,

    MondayBreakStart: null,
    MondayBreakEnd: null,
    TuesdayBreakStart: null,
    TuesdayBreakEnd: null,
    WednesdayBreakStart: null,
    WednesdayBreakEnd: null,
    ThursdayBreakStart: null,
    ThursdayBreakEnd: null,
    FridayBreakStart: null,
    FridayBreakEnd: null,
    SaturdayBreakStart: null,
    SaturdayBreakEnd: null,
    SundayBreakStart: null,
    SundayBreakEnd: null,
  });

  const [breakEnabled, setBreakEnabled] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  // Shipping Settings State
  const [shippingEnabled, setShippingEnabled] = useState(false);

  const fetchStoreConfig = async () => {
    const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
    const config = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/fetchStoreConfigAdmin`,
        config
      );
      if (response.status === 200) {
        setCusEmail(response.data.storeInformation.adminEmail);
        setCusId(response.data.storeInformation.adminId);
        setStoreId(response.data.storeInformation.storeId);

        setStoreInfoData(response.data.storeInformation);
        setStoreConfigData(response.data.storeConfig);
       
        setPromotions([
          {
            id: 1,
            subtitle: response.data.storeConfig.promotionTitle1,
            text: response.data.storeConfig.promotionText1,
            imgUrl: response.data.storeConfig.promotionImage1
              ? response.data.storeConfig.promotionImage1
              : null,
          },
          {
            id: 2,
            subtitle: response.data.storeConfig.promotionTitle2,
            text: response.data.storeConfig.promotionText2,
            imgUrl: response.data.storeConfig.promotionImage2
              ? response.data.storeConfig.promotionImage2
              : null,
          },
          {
            id: 3,
            subtitle: response.data.storeConfig.promotionTitle3,
            text: response.data.storeConfig.promotionText3,
            imgUrl: response.data.storeConfig.promotionImage3
              ? response.data.storeConfig.promotionImage3
              : null,
          },
          {
            id: 4,
            subtitle: response.data.storeConfig.promotionTitle4,
            text: response.data.storeConfig.promotionText4,
            imgUrl: response.data.storeConfig.promotionImage4
              ? response.data.storeConfig.promotionImage4
              : null,
          },
        ]);

        setStoreIconUrl(
          `${process.env.REACT_APP_SERVER_URL}/getStoreLogo/${response.data.storeInformation.storeUrl}`
        );

        setShippingEnabled(
          response.data.storeConfig.EnableAuPost === 1 ? true : false
        );

        const storeConfig = response.data.storeConfig;
        const newTimeValues = {
          MondayStart: storeConfig.MondayStart
            ? dayjs(storeConfig.MondayStart, 'HH:mm')
            : null,
          MondayEnd: storeConfig.MondayEnd
            ? dayjs(storeConfig.MondayEnd, 'HH:mm')
            : null,
          TuesdayStart: storeConfig.TuesdayStart
            ? dayjs(storeConfig.TuesdayStart, 'HH:mm')
            : null,
          TuesdayEnd: storeConfig.TuesdayEnd
            ? dayjs(storeConfig.TuesdayEnd, 'HH:mm')
            : null,
          WednesdayStart: storeConfig.WednesdayStart
            ? dayjs(storeConfig.WednesdayStart, 'HH:mm')
            : null,
          WednesdayEnd: storeConfig.WednesdayEnd
            ? dayjs(storeConfig.WednesdayEnd, 'HH:mm')
            : null,
          ThursdayStart: storeConfig.ThursdayStart
            ? dayjs(storeConfig.ThursdayStart, 'HH:mm')
            : null,
          ThursdayEnd: storeConfig.ThursdayEnd
            ? dayjs(storeConfig.ThursdayEnd, 'HH:mm')
            : null,
          FridayStart: storeConfig.FridayStart
            ? dayjs(storeConfig.FridayStart, 'HH:mm')
            : null,
          FridayEnd: storeConfig.FridayEnd
            ? dayjs(storeConfig.FridayEnd, 'HH:mm')
            : null,
          SaturdayStart: storeConfig.SaturdayStart
            ? dayjs(storeConfig.SaturdayStart, 'HH:mm')
            : null,
          SaturdayEnd: storeConfig.SaturdayEnd
            ? dayjs(storeConfig.SaturdayEnd, 'HH:mm')
            : null,
          SundayStart: storeConfig.SundayStart
            ? dayjs(storeConfig.SundayStart, 'HH:mm')
            : null,
          SundayEnd: storeConfig.SundayEnd
            ? dayjs(storeConfig.SundayEnd, 'HH:mm')
            : null,

          MondayBreakStart: storeConfig.MondayBreakStart
            ? dayjs(storeConfig.MondayBreakStart, 'HH:mm')
            : null,
          MondayBreakEnd: storeConfig.MondayBreakEnd
            ? dayjs(storeConfig.MondayBreakEnd, 'HH:mm')
            : null,
          TuesdayBreakStart: storeConfig.TuesdayBreakStart
            ? dayjs(storeConfig.TuesdayBreakStart, 'HH:mm')
            : null,
          TuesdayBreakEnd: storeConfig.TuesdayBreakEnd
            ? dayjs(storeConfig.TuesdayBreakEnd, 'HH:mm')
            : null,
          WednesdayBreakStart: storeConfig.WednesdayBreakStart
            ? dayjs(storeConfig.WednesdayBreakStart, 'HH:mm')
            : null,
          WednesdayBreakEnd: storeConfig.WednesdayBreakEnd
            ? dayjs(storeConfig.WednesdayBreakEnd, 'HH:mm')
            : null,
          ThursdayBreakStart: storeConfig.ThursdayBreakStart
            ? dayjs(storeConfig.ThursdayBreakStart, 'HH:mm')
            : null,
          ThursdayBreakEnd: storeConfig.ThursdayBreakEnd
            ? dayjs(storeConfig.ThursdayBreakEnd, 'HH:mm')
            : null,
          FridayBreakStart: storeConfig.FridayBreakStart
            ? dayjs(storeConfig.FridayBreakStart, 'HH:mm')
            : null,
          FridayBreakEnd: storeConfig.FridayBreakEnd
            ? dayjs(storeConfig.FridayBreakEnd, 'HH:mm')
            : null,
          SaturdayBreakStart: storeConfig.SaturdayBreakStart
            ? dayjs(storeConfig.SaturdayBreakStart, 'HH:mm')
            : null,
          SaturdayBreakEnd: storeConfig.SaturdayBreakEnd
            ? dayjs(storeConfig.SaturdayBreakEnd, 'HH:mm')
            : null,
          SundayBreakStart: storeConfig.SundayBreakStart
            ? dayjs(storeConfig.SundayBreakStart, 'HH:mm')
            : null,
          SundayBreakEnd: storeConfig.SundayBreakEnd
            ? dayjs(storeConfig.SundayBreakEnd, 'HH:mm')
            : null,
        };

        const newBreakEnabled = {
          Monday:
            !!storeConfig.MondayBreakStart && !!storeConfig.MondayBreakEnd,
          Tuesday:
            !!storeConfig.TuesdayBreakStart && !!storeConfig.TuesdayBreakEnd,
          Wednesday:
            !!storeConfig.WednesdayBreakStart &&
            !!storeConfig.WednesdayBreakEnd,
          Thursday:
            !!storeConfig.ThursdayBreakStart &&
            !!storeConfig.ThursdayBreakEnd,
          Friday:
            !!storeConfig.FridayBreakStart && !!storeConfig.FridayBreakEnd,
          Saturday:
            !!storeConfig.SaturdayBreakStart && !!storeConfig.SaturdayBreakEnd,
          Sunday:
            !!storeConfig.SundayBreakStart && !!storeConfig.SundayBreakEnd,
        };

        setBreakEnabled(newBreakEnabled);
        setTimeValues(newTimeValues);
      
      

        const itemTags = response.data.itemTags.map(tag => ({
          size: tag.TagId,
          unit: tag.Capacity 
        }));
        console.log(itemTags);
       
        setItemTags(itemTags); 
    
    
        const parcelSetting = response.data.parcelSettings.map(parcel => ({
          parcelId: parcel.ParcelId,
          capacity: parcel.Capacity,
          length: parcel.Length,
          width: parcel.Width,
          height: parcel.Height,
          extraCharge: parcel.ExtraCharge || 0,
        }));
       
        setParcelSetting(parcelSetting);
        
        // Parse ShippingDiscountTiers if it's a string
        let parsedShippingTiers = storeConfig.ShippingDiscountTiers || [];
        if (typeof parsedShippingTiers === 'string') {
          try {
            parsedShippingTiers = JSON.parse(parsedShippingTiers);
          } catch (e) {
            parsedShippingTiers = [];
          }
        }

        form.setFieldsValue(newTimeValues);


 
        // Set other form fields
        form.setFieldsValue({
          StoreName: storeConfig.StoreName,
          RecipientEmail: storeConfig.RecipientEmail,
          ContactNumber: response.data.storeInformation.StorePhone,
          Address: response.data.storeInformation.StoreAddress,
          SurchargeDescrip: storeConfig.SurchargeDescription,
          SurchargeRate: storeConfig.Surcharge,
          shippingEnabled:
            storeConfig.EnableAuPost === 1 ? true : false,
          productLength: storeConfig.DefaultProductLength
            ? storeConfig.DefaultProductLength
            : 0,
          productWidth: storeConfig.DefaultProductWidth
            ? storeConfig.DefaultProductWidth
            : 0,
          productHeight: storeConfig.DefaultProductHeight
            ? storeConfig.DefaultProductHeight
            : 0,
          // productWeight: storeConfig.DefaultProductWeight
          //   ? storeConfig.DefaultProductWeight
          //   : 0,
          freeShippingLimit: storeConfig.FreeShippingLimit
            ? storeConfig.FreeShippingLimit
            : 0,
          shippingRate: storeConfig.ShippingRate
            ? storeConfig.ShippingRate
            : 0,
          shippingDiscountTiers: parsedShippingTiers,
          PromotionSubtitle1: storeConfig.PromotionSubtitle1 || '',
          PromotionText1: storeConfig.PromotionText1 || '',
          PromotionSubtitle2: storeConfig.PromotionSubtitle2 || '',
          PromotionText2: storeConfig.PromotionText2 || '',
          PromotionSubtitle3: storeConfig.PromotionSubtitle3 || '',
          PromotionText3: storeConfig.PromotionText3 || '',
          PromotionSubtitle4: storeConfig.PromotionSubtitle4 || '',
          PromotionText4: storeConfig.PromotionText4 || '',
          StoreLocationZip: storeConfig.StoreLocationZip || '',
          DefaultProductWeight: storeConfig.DefaultProductWeight || 0,
          DefaultProductUnit: storeConfig.DefaultProductUnit || 0,
        });

        setIsLoading(false);
      } else {
       // navigate('/adminLogin');
      }
    } catch (error) {
      console.error('Fetch Store Config Error:', error);
     // navigate('/adminLogin');
    }
  };

  const handlePromotionImageChange = async (info, index) => {
    const file = info.file.originFileObj || info.file;

    if (!file) {
      return;
    }

    // 将文件转换为 Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result.split(',')[1]; // 去掉 Base64 前缀

      const payload = {
        storeId, // Store ID
        promotionIndex: index + 1, // Promotion indices start at 1
        promotionImage: base64Data, // 文件的 Base64 数据
      };

      try {
        const token = sessionStorage.getItem('jwtToken'); // 获取 JWT Token
        const config = {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        // 发送 JSON 请求
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/uploadPromotionImage`,
          payload,
          config
        );

        if (response.status === 200 && response.data.success) {
          notification.success({ message: 'Image uploaded successfully' });

          // 更新状态
          const updatedPromotions = [...promotions];
          updatedPromotions[index].imgUrl = response.data.imageUrl; // URL 从后端返回
          setPromotions(updatedPromotions);
          //refreshPage();
        } else {
          notification.error({ message: 'Failed to upload image' });
        }
      } catch (error) {
        console.error('Image upload error:', error);
        notification.error({
          message: 'Error uploading image. Please try again.',
        });
      }
    };

    reader.readAsDataURL(file); // 读取文件为 Base64
  };

  const handlePromotionDelete = async (index) => {
    try {
      const token = sessionStorage.getItem('jwtToken'); // Get JWT Token
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/deletePromotionImage`,
        {
          storeId: storeId,
          promotionIndex: index + 1, // Promotion indices start at 1
        },
        config
      );

      if (response.status === 200 && response.data.success) {
        notification.success({ message: 'Image deleted successfully' });

        // Update the promotions state by clearing the imgUrl and file
        const updatedPromotions = [...promotions];
        updatedPromotions[index].imgUrl = '';
        updatedPromotions[index].file = null;
        setPromotions(updatedPromotions);
      } else {
        notification.error({ message: 'Failed to delete image' });
      }
    } catch (error) {
      console.error('Image delete error:', error);
      notification.error({
        message: 'Error deleting image. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchStoreConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleIconChange = ({ file }) => {
    if (!file) {
      setIconLoading(false);
      return;
    }

    setIconLoading(true); // 开始处理文件时设置 loading

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = (e) => {
      setStoreIconUrl(e.target.result); // 设置预览的 URL
      setIconLoading(false); // 文件处理完成，取消 loading 状态
      setIconLoadError(false); // 重置错误状态
    };
    reader.onerror = () => {
      // 处理文件读取错误
      setIconLoading(false); // 发生错误时也要取消 loading 状态
      setIconLoadError(true); // 设置错误状态
      notification.error({ message: 'File read error' });
    };
    reader.readAsDataURL(file); // 直接读取 file 对象
  };

  const uploadButton = (
    <div>
      {iconLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );



  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (values.itemTags){
        //size can not be duplicated
        let sizeSet = new Set();
        for (let i = 0; i < values.itemTags.length; i++) {
          if (sizeSet.has(values.itemTags[i].size)) {
            notification.error({
              message: 'Item Tags Error',
              description: 'Item Tag size cannot be duplicated.',
            });
            return;
          } else {
            sizeSet.add(values.itemTags[i].size);
          }
        }
      }

      // Process shipping settings
      if (!values.shippingEnabled) {
        values.itemTags = [];
        values.parcels = [];
      }

      // Process time values
      const storeConfig = {
        ...values,
        shippingEnabled: values.shippingEnabled,
        MondayStart: values.MondayStart
          ? values.MondayStart.format('HH:mm')
          : null,
        MondayEnd: values.MondayEnd ? values.MondayEnd.format('HH:mm') : null,
        TuesdayStart: values.TuesdayStart
          ? values.TuesdayStart.format('HH:mm')
          : null,
        TuesdayEnd: values.TuesdayEnd
          ? values.TuesdayEnd.format('HH:mm')
          : null,
        WednesdayStart: values.WednesdayStart
          ? values.WednesdayStart.format('HH:mm')
          : null,
        WednesdayEnd: values.WednesdayEnd
          ? values.WednesdayEnd.format('HH:mm')
          : null,
        ThursdayStart: values.ThursdayStart
          ? values.ThursdayStart.format('HH:mm')
          : null,
        ThursdayEnd: values.ThursdayEnd
          ? values.ThursdayEnd.format('HH:mm')
          : null,
        FridayStart: values.FridayStart
          ? values.FridayStart.format('HH:mm')
          : null,
        FridayEnd: values.FridayEnd
          ? values.FridayEnd.format('HH:mm')
          : null,
        SaturdayStart: values.SaturdayStart
          ? values.SaturdayStart.format('HH:mm')
          : null,
        SaturdayEnd: values.SaturdayEnd
          ? values.SaturdayEnd.format('HH:mm')
          : null,
        SundayStart: values.SundayStart
          ? values.SundayStart.format('HH:mm')
          : null,
        SundayEnd: values.SundayEnd
          ? values.SundayEnd.format('HH:mm')
          : null,

        MondayBreakStart: values.MondayBreakStart
          ? values.MondayBreakStart.format('HH:mm')
          : null,
        MondayBreakEnd: values.MondayBreakEnd
          ? values.MondayBreakEnd.format('HH:mm')
          : null,
        TuesdayBreakStart: values.TuesdayBreakStart
          ? values.TuesdayBreakStart.format('HH:mm')
          : null,
        TuesdayBreakEnd: values.TuesdayBreakEnd
          ? values.TuesdayBreakEnd.format('HH:mm')
          : null,
        WednesdayBreakStart: values.WednesdayBreakStart
          ? values.WednesdayBreakStart.format('HH:mm')
          : null,
        WednesdayBreakEnd: values.WednesdayBreakEnd
          ? values.WednesdayBreakEnd.format('HH:mm')
          : null,
        ThursdayBreakStart: values.ThursdayBreakStart
          ? values.ThursdayBreakStart.format('HH:mm')
          : null,
        ThursdayBreakEnd: values.ThursdayBreakEnd
          ? values.ThursdayBreakEnd.format('HH:mm')
          : null,
        FridayBreakStart: values.FridayBreakStart
          ? values.FridayBreakStart.format('HH:mm')
          : null,
        FridayBreakEnd: values.FridayBreakEnd
          ? values.FridayBreakEnd.format('HH:mm')
          : null,
        SaturdayBreakStart: values.SaturdayBreakStart
          ? values.SaturdayBreakStart.format('HH:mm')
          : null,
        SaturdayBreakEnd: values.SaturdayBreakEnd
          ? values.SaturdayBreakEnd.format('HH:mm')
          : null,
        SundayBreakStart: values.SundayBreakStart
          ? values.SundayBreakStart.format('HH:mm')
          : null,
        SundayBreakEnd: values.SundayBreakEnd
          ? values.SundayBreakEnd.format('HH:mm')
          : null,

        // Item Tags and Parcels will be handled separately
      };

      const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      for (let day of days) {
        if (breakEnabled[day]) {
          const start = dayjs(values[`${day}Start`], 'HH:mm');
          const end = dayjs(values[`${day}End`], 'HH:mm');
          const breakStart = dayjs(values[`${day}BreakStart`], 'HH:mm');
          const breakEnd = dayjs(values[`${day}BreakEnd`], 'HH:mm');

          if (breakStart && breakEnd) {
            if (
              breakStart.isAfter(breakEnd) ||
              breakStart.isSameOrBefore(start) ||
              breakEnd.isSameOrAfter(end)
            ) {
              notification.error({
                message: `${day}: Break times are incorrect`,
                description: 'Please check your timetable.',
              });
              return;
            }
          }
        }
      }

      // Process Item Tags and Parcels
      const itemTags = values.itemTags || [];
      const parcels = values.parcels || [];

      storeConfig.itemTags = itemTags;
      storeConfig.parcels = parcels;
      console.log("edit tags",storeConfig.itemTags);
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

    
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/updateStoreConfig`,
        { storeConfig, iconUrl: storeIconUrl },
        config
      );
      if (response.status === 200) {
        notification.success({ message: 'Updated Successfully' });
        fetchStoreConfig();
      } else {
        notification.error({ message: 'Update Failed' });
      }
    } catch (error) {
      console.error('Save Error:', error);
      notification.error({ message: 'Update Failed' });
    }
  };

  const handleTimeChange = (day, period, time) => {
    setTimeValues((prev) => ({
      ...prev,
      [`${day}${period}`]: time,
    }));
    form.setFieldsValue({
      [`${day}${period}`]: time ? dayjs(time, 'HH:mm') : null,
    });
  };

  return (
    !isLoading ? (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <AppHeader email={cusEmail} cusId={cusId} />

      <div className="table_list" style={{ padding: '0 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          {/* <h2>Store Set Up</h2> */}
        </div>

        <div className="admin_store_config">
          <Divider orientation="left" orientationMargin="0">
            General Store Information
          </Divider>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changedValues, allValues) => {
              const updatedPromotions = promotions.map((promo) => ({
                ...promo,
                subtitle: allValues[`PromotionSubtitle${promo.id}`],
                text: allValues[`PromotionText${promo.id}`],
              }));
              setPromotions(updatedPromotions);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="StoreName" label="Store Name">
                  <Input style={{ maxWidth: '300px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Store Icon (png file)">
                  <Row gutter={16} align="middle">
                    <Col>
                      {storeIconUrl && (
                        <img
                          src={storeIconUrl}
                          alt="icon"
                          style={{
                            width: '100px',
                            marginRight: '16px',
                          }} // 添加 marginRight 为图片和 Upload 按钮之间增加间距
                          onError={() => setIconLoadError(true)} // 添加错误处理
                        />
                      )}
                    </Col>
                    <Col>
                      <Upload
                        name="icon"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={() => false} // 禁止自动上传
                        accept=".png"
                        onChange={handleIconChange}
                      >
                        {storeIconUrl && !iconLoadError ? (
                          <img
                            src={storeIconUrl}
                            alt="icon"
                            style={{ width: '100%' }}
                            onError={() => setIconLoadError(true)} // 添加这行代码
                          />
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ContactNumber" label="Contact Number">
                  <Input style={{ maxWidth: '300px' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="RecipientEmail" label="Email">
                  <Input style={{ maxWidth: '300px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="Address" label="Address">
                  <Input style={{ maxWidth: '300px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="SurchargeDescrip"
                  label="Surcharge Description"
                >
                  <Input style={{ maxWidth: '300px' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="SurchargeRate" label="Surcharge Rate (%)">
                  <InputNumber style={{ maxWidth: '100px' }} />
                </Form.Item>
              </Col>
            </Row>
            <Divider orientation="left" orientationMargin="0">
              Store Business Hours
            </Divider>
            <div className="store-open-time">
              <div className="store-open-time-content">
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ].map((day) => (
                  <Form.Item label={day} key={day}>
                    <Row gutter={[8, 8]} align="middle">
                      <Col span={24}>
                        <Checkbox
                          checked={breakEnabled[day]}
                          onChange={(e) =>
                            setBreakEnabled((prev) => ({
                              ...prev,
                              [day]: e.target.checked,
                            }))
                          }
                        >
                          Set Break Time
                        </Checkbox>
                      </Col>
                      <Col span={5}>
                        <Form.Item name={`${day}Start`} noStyle>
                          <TimePicker
                            value={timeValues[`${day}Start`]}
                            format="HH:mm"
                            placeholder="Start time"
                            onChange={(time) =>
                              handleTimeChange(day, 'Start', time)
                            }
                          />
                        </Form.Item>
                      </Col>
                      {breakEnabled[day] && (
                        <>
                          <Col span={5}>
                            <Form.Item name={`${day}BreakStart`} noStyle>
                              <TimePicker
                                value={timeValues[`${day}BreakStart`]}
                                format="HH:mm"
                                placeholder="Break start"
                                onChange={(time) =>
                                  handleTimeChange(day, 'BreakStart', time)
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={5}>
                            <Form.Item name={`${day}BreakEnd`} noStyle>
                              <TimePicker
                                value={timeValues[`${day}BreakEnd`]}
                                format="HH:mm"
                                placeholder="Break end"
                                onChange={(time) =>
                                  handleTimeChange(day, 'BreakEnd', time)
                                }
                              />
                            </Form.Item>
                          </Col>
                        </>
                      )}
                      <Col span={5}>
                        <Form.Item name={`${day}End`} noStyle>
                          <TimePicker
                            value={timeValues[`${day}End`]}
                            format="HH:mm"
                            placeholder="End time"
                            onChange={(time) =>
                              handleTimeChange(day, 'End', time)
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                ))}
              </div>
            </div>

            <Divider orientation="left" orientationMargin="0">
              Promotion & News Setting
            </Divider>

            <Row gutter={16}>
              {promotions.map((promo, index) => (
                <Col span={12} key={promo.id}>
                  <Form.Item label={`Promotion ${promo.id}`}>
                    <Row gutter={8} align="middle">
                      <Col span={6}>
                        <Form.Item
                          name={`PromotionSubtitle${promo.id}`}
                          label="Subtitle"
                        >
                          <Input placeholder="Enter promotion subtitle" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name={`PromotionText${promo.id}`}
                          label="Text"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Enter promotion text"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item label="Promotion Image (150px x 150px)">
                          <Upload
                            name={`PromotionImage${promo.id}`}
                            listType="picture-card"
                            className="promotion-upload"
                            showUploadList={false}
                            beforeUpload={() => false} // Prevent automatic upload
                            accept=".jpg,.jpeg,.png"
                            onChange={(info) =>
                              handlePromotionImageChange(info, index)
                            }
                          >
                            {promo.imgUrl ? (
                              <img
                                src={promo.imgUrl}
                                alt={`Promotion ${promo.id}`}
                                style={{ width: '100%' }}
                              />
                            ) : (
                              uploadButton
                            )}
                          </Upload>
                          {promo.imgUrl && (
                            <Button
                              type="link"
                              icon={<DeleteOutlined />}
                              onClick={() => handlePromotionDelete(index)}
                            >
                              Delete Image
                            </Button>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              ))}
            </Row>

            <Divider orientation="left" orientationMargin="0">
              Shipping Setting
            </Divider>
            {/* Shipping Configuration */}
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="shippingRate" label="Shipping Rate ($)">
                  <InputNumber style={{ maxWidth: '100%' }} min={0} step={0.01} precision={2} />
                </Form.Item>
              </Col>
            </Row>

            {/* Commented out fields - not needed */}
            {/* <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="freeShippingLimit"
                  label="Minimum Free Shipping ($)"
                >
                  <InputNumber style={{ maxWidth: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="StoreLocationZip" label="Store Location Zip">
                  <Input style={{ maxWidth: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="DefaultProductUnit" label="Default Product Unit">
                  <InputNumber style={{ maxWidth: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="DefaultProductWeight" label="Default Product Weight (g)">
                  <InputNumber style={{ maxWidth: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row> */}

            {/* Shipping Discount Tiers */}
            <Divider orientation="left" orientationMargin="0" style={{ marginTop: 20 }}>
              Shipping Discount Tiers
            </Divider>
            <Form.List name="shippingDiscountTiers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'threshold']}
                          label="Order Amount ($)"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g., 50" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'discount']}
                          label="Discount ($)"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g., 5" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label=" " colon={false}>
                          <MinusCircleOutlined 
                            onClick={() => remove(name)} 
                            style={{ fontSize: 20, color: '#ff4d4f', cursor: 'pointer' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                  {fields.length < 5 && (
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      icon={<PlusOutlined />}
                      style={{ width: '50%', marginBottom: 16 }}
                    >
                      Add Shipping Discount Tier
                    </Button>
                  )}
                  {fields.length === 0 && (
                    <p style={{ color: '#999', marginBottom: 16 }}>
                      No discount tiers configured. Click "Add Shipping Discount Tier" to create one.
                    </p>
                  )}
                </>
              )}
            </Form.List>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="shippingEnabled" valuePropName="checked">
                  <Checkbox
                    onChange={(e) => setShippingEnabled(e.target.checked)}
                  >
                    Enable AU Post
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            {shippingEnabled && (
              <>
                {/* Item Tag Size Settings */}
                <Divider orientation="left" orientationMargin="0">
                  Item Tag Size Settings
                </Divider>
                <Form.List
                  
                  name="itemTags"
                  initialValue={itemTags} // Pass mapped itemTags here
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Row gutter={16} key={field.key} align="middle">
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'size']}
                              fieldKey={[field.fieldKey, 'size']}
                              label={`Tag Size`}
                              rules={[{ required: true, message: 'Please select the tag size!' }]}
                            >
                              <Select placeholder="Select size">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,16,17,18,19,20].map((size) => (
                                  <Option key={size} value={size}>
                                    {size}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'unit']}
                              fieldKey={[field.fieldKey, 'unit']}
                              label={`Tag Unit`}
                              rules={[{ required: true, message: 'Please input the unit!' }]}
                            >
                              <InputNumber placeholder="Enter unit" />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            {fields.length > 0 && (

                              
                              <Button
                              type="danger"
                              onClick={() => {
                                Modal.confirm({
                                  title: 'Are you sure?',
                                  content: 'Deleting this tag may affect existing items associated with it. This action cannot be undone.',
                                  okText: 'Yes, delete',
                                  cancelText: 'Cancel',
                                  okButtonProps: { danger: true },
                                  onOk: () => {
                                    remove(field.name); // 执行删除操作
                                  },
                                });
                              }}
                              icon={<MinusCircleOutlined />}
                              />

                            )}
                          </Col>
                        </Row>
                      ))}
                      {fields.length < 20 && (
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Tag
                              </Button>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </>
                  )}
                </Form.List>


                {/* Parcel Settings */}
                <Divider orientation="left" orientationMargin="0">
                  Parcel Settings
                </Divider>
                <Form.List
                  name="parcels"
                  initialValue={parcelSetting || []} // 填充 parcels 数据
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div
                          key={field.key}
                          style={{
                            marginBottom: '20px',
                            padding: '10px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                          }}
                        >
                          <Row gutter={16} align="middle">
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'parcelNumber']}
                                fieldKey={[field.fieldKey, 'parcelNumber']}
                                label={`Parcel ${index + 1}`}
                                initialValue={`Parcel ${index + 1}`}
                              >
                                <Input disabled />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'length']}
                                fieldKey={[field.fieldKey, 'length']}
                                label="Length (cm)"
                                rules={[{ required: true, message: 'Please input length!' }]}
                              >
                                <InputNumber style={{ width: '100%' }} min={0} />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'width']}
                                fieldKey={[field.fieldKey, 'width']}
                                label="Width (cm)"
                                rules={[{ required: true, message: 'Please input width!' }]}
                              >
                                <InputNumber style={{ width: '100%' }} min={0} />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'height']}
                                fieldKey={[field.fieldKey, 'height']}
                                label="Height (cm)"
                                rules={[{ required: true, message: 'Please input height!' }]}
                              >
                                <InputNumber style={{ width: '100%' }} min={0} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16} align="middle">
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'capacity']}
                                fieldKey={[field.fieldKey, 'capacity']}
                                label="Capacity (Units)"
                                rules={[{ required: true, message: 'Please input capacity!' }]}
                              >
                                <InputNumber style={{ width: '100%' }} min={1} />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'extraCharge']}
                                fieldKey={[field.fieldKey, 'extraCharge']}
                                label="Extra Charge ($)"
                                initialValue={0}
                                rules={[{ required: true, message: 'Please input extra charge!' }]}
                              >
                                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16} align="middle">
                            <Col span={24} style={{ textAlign: 'right', marginTop: '10px' }}>
                              {fields.length > 0 && (
                                <Button
                                  type="danger"
                                  onClick={() => {
                                    Modal.confirm({
                                      title: 'Are you sure?',
                                      content:
                                        'This action cannot be undone.',
                                      okText: 'Yes, delete',
                                      cancelText: 'Cancel',
                                      okButtonProps: { danger: true }, // 确认按钮显示为危险样式
                                      onOk: () => {
                                        remove(field.name); // 执行删除逻辑
                                      },
                                    });
                                  }}
                                  icon={<MinusCircleOutlined />}
                                >
                                  Remove Parcel
                                </Button>
                              )}
                            </Col>
                          </Row>
                        </div>
                      ))}
                      {fields.length < 10 && (
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Parcel
                              </Button>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </>
                  )}
                </Form.List>

              </>
            )}

            <Form.Item>
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  );
};

export default AdminStoreConfig;
