import React, { useState, useEffect, useContext } from 'react';
import {
  Steps,
  Collapse,
  Button,
  InputNumber,
  Empty,
  Input,
  Form,
  Checkbox,
  Row,
  Col,
  Divider,
  Select,
  Typography,
  message,
  Radio,
} from 'antd';

import {
  ShoppingCartOutlined,
  SolutionOutlined,
  SmileOutlined,
  DeleteFilled,
} from '@ant-design/icons';

import Header from '../../components/Headers/Header';
import './checkout.css';
import axios from 'axios';
import Footer from '../../components/Footer/Footer';
import { useParams, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';


const { Step } = Steps;
const { Panel } = Collapse;
const { Option } = Select;
const { Title, Text } = Typography;

const Checkout = () => {
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const { cartItems, total, updateCartQuantity, removeFromCart, addToCart } = useContext(CartContext);

  const [current, setCurrent] = useState(0);

  const [storeId, setStoreId] = useState(null);
  const [showDifferentAddress, setShowDifferentAddress] = useState(
    sessionStorage.getItem('showDifferentAddress') === 'true' || false
  );
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [billingInfo, setBillingInfo] = useState(
    JSON.parse(sessionStorage.getItem('billingInfo')) || {}
  );

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [surcharge, setSurcharge] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [storeZIP, setStoreZIP] = useState('');
  const [defaultWeight, setDefaultWeight] = useState(0);
  const [defaultTagUnit, setDefaultTagUnit] = useState(0);
  const [spendForFreeShipping, setSpendForFreeShipping] = useState(0);

  const [finalSurcharge, setFinalSurcharge] = useState(0);

  const [finalTotal, setFinalTotal] = useState(0);

  // Calculate surcharge
  useEffect(() => {
    const surchargeAmount = surcharge ? (surcharge / 100) * (total+ shippingCost): 0;
    setFinalSurcharge(surchargeAmount);
  }, [surcharge, total]);

  // Calculate final total
  useEffect(() => {
    const newFinalTotal = total + finalSurcharge + shippingCost;
    setFinalTotal(newFinalTotal);
  }, [total, finalSurcharge, shippingCost]);

  //listen to the change of sessionStorage.getItem('showDifferentAddress') 
  useEffect(() => {
    setShowDifferentAddress(sessionStorage.getItem('showDifferentAddress') === 'true' || false);
  }, [sessionStorage.getItem('showDifferentAddress')]);



  const [shippingService, setShippingService] = useState('regular'); // Default to Regular
  const [expressDetails, setExpressDetails] = useState({
    service: '',
    delivery_time: '',
    total_cost: 0,
    costs: {},
  });
  const [regularDetails, setRegularDetails] = useState({
    service: '',
    delivery_time: '',
    total_cost: 0,
    costs: {},
  });

  const [payFirst, setPayFirst] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [collapseActiveKey, setCollapseActiveKey] = useState([]);

  const storeUrl = useParams().storeUrl;
  const encryptedOrderId = useParams().encryptedOrderId;

  // State for Delivery Method
  
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
 
  // Responsive Design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //when current is 2, scroll to top  
  useEffect(() => {
    if (current === 2) {
      window.scrollTo(0, 0);
    }
  }, [current]);

  // Delete order if encryptedOrderId exists
  useEffect(() => {
    if (encryptedOrderId) {
      const deleteOrder = async () => {
        try {
          const response = await axios.delete(
            `${process.env.REACT_APP_SERVER_URL}/deleteOrder/${encryptedOrderId}`
          );
          if (response.status === 200) {
            console.log('Order deleted successfully');
          }
        } catch (error) {
          console.error(
            'Error deleting order:',
            error.response ? error.response.data : error.message
          );
        }
      };
      deleteOrder();
    }
  }, [encryptedOrderId]);

  // Fetch Customer Data if authenticated
  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
   
      form.setFieldsValue({
        firstName: user?.CustomerSurname,
        middleName: user?.CustomerMiddleName,
        lastName: user?.CustomerLastName,
        email: user?.CustomerEmail,
        phone: user?.phone,
        ABN: user?.ABN,
        address: user?.billingAddress.address,
        city: user?.billingAddress.city,
        state: user?.billingAddress.state,
        zip: user?.billingAddress.zip,
        shipAddress: user?.deliveryAddress.address,
        shipCity: user?.deliveryAddress.city,
        shipState: user?.deliveryAddress.state,
        shipZip: user?.deliveryAddress.zip,
        differentAddress:
        (user?.deliveryAddress.address !==  user?.billingAddress.address) && (user?.deliveryAddress.address !== null && user?.deliveryAddress.address !== ""),
        
      });
      setShowDifferentAddress( user?.deliveryAddress.address !==  user?.billingAddress.address && user?.deliveryAddress.address !== null && user?.deliveryAddress.address !== "");
    }
  }, [isAuthenticated, user, form]);

  // Handle Login
  const handleLogin = async (values) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/loginCustomer`, {
        email: values.email,
        password: values.password,
        storeId: storeId,
      });

      if (response.status === 200) {
        const data = response.data;
        message.success('Logged in successfully');

        form.setFieldsValue({
          firstName: data.user.customerSurname,
          middleName: data.user.customerMiddleName,
          lastName: data.user.customerLastName,
          email: data.user.CustomerEmail,
          phone: data.user.phone,
          ABN: data.user.ABN,
          address: data.user.billingAddress.address,
          city: data.user.billingAddress.city,
          state: data.user.billingAddress.state,
          zip: data.user.billingAddress.zip,
          country: data.user.billingAddress.country,
          shipAddress: data.user.deliveryAddress.address,
          shipCity: data.user.deliveryAddress.city,
          shipState: data.user.deliveryAddress.state,
          shipZip: data.user.deliveryAddress.zip,
          shipCountry: data.user.deliveryAddress.country,
          differentAddress:
            data.user.deliveryAddress.address !== data.user.billingAddress.address && data.user.deliveryAddress !== null && data.user.deliveryAddress !== "",
        });

        // Update billingInfo
        setBillingInfo({
          storeId,
          firstName: data.user.customerSurname,
          middleName: data.user.customerMiddleName || null,
          lastName: data.user.customerLastName,
          email: data.user.email,
          phone: data.user.phone,
          companyName: data.user.companyName || null,
          ABN: data.user.ABN || null,
          orderNotes: '',
          billingAddress: {
            address: data.user.billingAddress.address,
            city: data.user.billingAddress.city,
            state: data.user.billingAddress.state,
            zip: data.user.billingAddress.zip,
            country: data.user.billingAddress.country,
          },
          deliveryAddress: data.user.deliveryAddress
            ? {
                address: data.user.deliveryAddress.address,
                city: data.user.deliveryAddress.city,
                state: data.user.deliveryAddress.state,
                zip: data.user.deliveryAddress.zip,
                country: data.user.deliveryAddress.country,
              }
            : null,
          deliveryMethod: data.user.deliveryMethod || 'delivery', // Assuming deliveryMethod is part of data.user
        });
        
        // Set delivery method
        setDeliveryMethod(data.user.deliveryMethod || 'delivery');

        // Save user info to sessionStorage
        login(data.user, data.token);
        setCollapseActiveKey([]);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginFailed = (errorInfo) => {
    console.log('Login Failed:', errorInfo);
  };

  const handleCollapseChange = (key) => {
    setCollapseActiveKey(key);
  };

  // Logout Function
  const handleLogout = () => {
    // Clear session storage or any other logout logic
    setIsLoggedIn(false);
    setUserInfo(null);
    setBillingInfo({});
    logout();
    message.success('Logged out successfully');
  };

  // Fetch Store Configuration
  useEffect(() => {
    const fetchStoreConfig = async () => {
      try {
        // const savedCartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
        // const savedTotal = parseFloat(sessionStorage.getItem('total')) || 0;
        const savedStoreId = sessionStorage.getItem('storeId') || null;


     
        setStoreId(savedStoreId);

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/fetchStoreConfig/${savedStoreId}`
        );

        if (response.status === 200) {
          setPayFirst(response.data.storeConfig.PayFirst);
          setSurcharge(response.data.storeConfig.Surcharge || 0);

          setSpendForFreeShipping(response.data.storeConfig.FreeShippingLimit|| 0);
          setShippingCost(response.data.storeConfig.ShippingRate || 0);
          setDefaultTagUnit(response.data.storeConfig.DefaultProductUnit || 0);
          setDefaultWeight(response.data.storeConfig.DefaultProductWeight || 0);
     
          setStoreZIP(response.data.storeConfig.StoreLocationZip);
        }
        setLoading(false);
      } catch (error) {
        console.error(
          'Error fetching store config:',
          error.response ? error.response.data : error.message
        );
        setLoading(false);
      }
    };
    fetchStoreConfig();
  }, []);

  const handleShippingService = (value) => {
    
    setShippingService(value);
    
    if (value === 'express') {
      setShippingCost(parseFloat(expressDetails.total_cost));
      setDeliveryInfo(expressDetails.delivery_time);
    }
    if (value === 'regular') {
      setShippingCost(parseFloat(regularDetails.total_cost));
      setDeliveryInfo(regularDetails.delivery_time);
    }
  };

  // Fetch Shipping Cost
  useEffect(() => {
    const fetchShippingCost = async () => {
      try {

        if (deliveryMethod === 'delivery') {
          
         
          // console.log('fetching shipping cost...',total);
          // console.log("current total",shippingCost);
          if (total >= spendForFreeShipping) {
            setShippingCost(0);
          } else {
           
            const defaultTagId = 0; // 用于存储默认 tag 的 id
            const tagSummary = {}; // 用于存储每个 tag 的总数量和分量
           
           
            // 遍历 cartItems，统计每个 tag 的总数量和总价
            cartItems.forEach((item) => {
              const tagId = item.type === 0 ? item.tagId : item.packTagId || defaultTagId;
              const weight =
              item.type === 0
                ? (item.weight != null ? item.weight : defaultWeight)
                : (item.packWeight != null ? item.packWeight : defaultWeight);

              if (!tagSummary[tagId]) {
                tagSummary[tagId] = { quantity: 0, weight: 0 };
              }
              tagSummary[tagId].quantity += item.quantity;
              tagSummary[tagId].weight += item.quantity * weight;
           
            });
            const deliveryZip = (billingInfo.billingAddress.zip !== billingInfo.deliveryAddress.zip && billingInfo.deliveryAddress!=='' )? billingInfo.deliveryAddress.zip : billingInfo.billingAddress.zip;
           
            if (Object.keys(tagSummary).length > 0 &&  deliveryZip) {
            
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/calculateShippingCost`, {
            
              tagSummary,
              storeUrl,
              deliveryZip,
              
            });
            console.log("response",response);
            if (response.status === 200) {
             
              // response.data ={
              //   AUS_PARCEL_EXPRESS: {
              //     service: 'Express Post',
              //     delivery_time: 'Guaranteed Next Business Day within the Express Post network (If posted on any business day Monday to Friday in accordance with the conditions set out on the item).',  
              //     total_cost: '14.45',
              //     costs: { cost: [Object] }
              //   },
              //   AUS_PARCEL_REGULAR: {
              //     service: 'Parcel Post',
              //     delivery_time: 'Delivered in 2-3 business days',
              //     total_cost: '10.95',
              //     costs: { cost: [Object] }
              //   }
              // }
              setExpressDetails(response.data.AUS_PARCEL_EXPRESS);
              setRegularDetails(response.data.AUS_PARCEL_REGULAR);
              console.log("response",response.data);
              setDeliveryInfo(response.data.AUS_PARCEL_REGULAR.delivery_time);
              setShippingCost(parseFloat(response.data.AUS_PARCEL_REGULAR.total_cost));
              
            }
          } else {
            message.error('There is something wrong with the delivery address, please contact store owner.');
          }
          
           
          }
        } else {
          // If pickup is selected, no shipping cost
          setShippingCost(0);
        }
      } catch (error) {
        console.error(
          'Error fetching shipping cost:',
          error.response ? error.response.data : error.message
        );
      }
    };

    if (!loading && storeZIP && current === 2 ) {
     
      fetchShippingCost();
    }
  }, [
 
    spendForFreeShipping,
    storeZIP,
    billingInfo?.deliveryAddress?.zip, // 确保 billingInfo 和 zip 安全
  billingInfo?.billingAddress?.zip,
    // billingInfo.deliveryAddress.zip||billingInfo.billingAddress.zip,
    deliveryMethod,
    cartItems,
    defaultTagUnit,
    defaultWeight,
   
    loading,
    current

  ]);

  // Place Order Function
  const placeOrder = async () => {
    const orderData = {
      storeId: billingInfo.storeId,
      cartItems: cartItems.map((item) => ({
        stockId: item.id,
        quantity: item.quantity,
        price: item.price,
        gstRate: item.GSTRate,
        stockOnlineId: item.stockOnlineId,
        deductQty: item.deductQty,
        priceId: item.priceId,
        subDescription: item.subDescription,
      })),
      notes: billingInfo.orderNotes,
      finalTotal: finalTotal,
      surcharge: finalSurcharge,
      shippingCost:
        total > spendForFreeShipping && billingInfo.deliveryMethod === 'delivery'
          ? 0
          : shippingCost,
      
      customerDetails: billingInfo,
      deliveryMethod: billingInfo.deliveryMethod,
      storeUrl,
      deliveryService: 
      billingInfo.deliveryMethod === 'delivery' 
        ? (shippingService === 'regular' ? 'Regular Post' 
            : shippingService === 'express' ? 'Express Post' 
            : '') 
        : ''
    
    };

    //update local storage for user



    try {
      if (payFirst === 1) {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/placeOrder`, orderData);
        if (response.status === 200) {
          window.location.href = response.data.url;
        } else if (response.status === 411) {
          message.error('Store is not configured for online payment. Please contact store owner.');
        }
      } else {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/placeNoPayOrder`, orderData);
        if (response.status === 200) {
          window.location.href = response.data.url;
        }
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
      message.error('Error placing order. ' + (error.response ? error.response.data : error.message));
    }
  };


  // Save Customer Information
  const saveCustomer = async (values) => {
    const customerData = {
      storeId,
      firstName: values.firstName,
      middleName: values.middleName || null,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      companyName: values.companyName || null,
      ABN: values.ABN || null,
      orderNotes: values.orderNotes || '',
      deliveryMethod: values.deliveryMethod, // Add deliveryMethod

      billingAddress: {
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: 'Australia',
      },
      deliveryAddress:
        showDifferentAddress && deliveryMethod === 'delivery'
          ? {
              address: values.shipAddress,
              city: values.shipCity,
              state: values.shipState,
              zip: values.shipZip,
              country: 'Australia',
            }
          : {
              address: values.address,
              city: values.city,
              state: values.state,
              zip: values.zip,
              country: 'Australia',
            },
    };

    if (values.createAccount) {
      customerData.password = values.accountPassword;
    }

    setBillingInfo(customerData);
    //reset user local storage
    if (isAuthenticated) {
      let userData = localStorage.getItem('user');
      if (userData) {
        userData = JSON.parse(userData);
        userData.billingAddress.address =  values.address;
        userData.billingAddress.city = values.city;
        userData.billingAddress.state = values.state;
        userData.billingAddress.zip = values.zip;
        userData.billingAddress.country = 'Australia';
        userData.deliveryAddress = showDifferentAddress && deliveryMethod === 'delivery' ? {
          address: values.shipAddress,
          city: values.shipCity,
          state: values.shipState,
          zip: values.shipZip,
          country: 'Australia',
        } : {
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: 'Australia',
        }
        userData.CustomerSurname = values.firstName;
        userData.CustomerMiddleName = values.middleName || null;
        userData.CustomerLastName = values.lastName;
        userData.CustomerEmail = values.email;
        userData.phone = values.phone;
        userData.ABN = values.ABN || null;
        
        localStorage.setItem('user', JSON.stringify(userData));
      }
    
    }
  //   {
  //     "customerId": 112,
  //     "CustomerSurname": "yue",
  //     "CustomerMiddleName": null,
  //     "CustomerLastName": "Zhang",
  //     "phone": "0401513785",
  //     "CustomerEmail": "kaikai99117@gmail.com",
  //     "ABN": "123",
  //     "billingAddress": {
  //         "address": "1/10 Lantana Street",
  //         "city": "Clayton",
  //         "state": "VIC",
  //         "zip": "3168",
  //         "country": "Australia"
  //     },
  //     "deliveryAddress": {
  //         "address": "1/10 Lantana Street",
  //         "city": "Clayton",
  //         "state": "VIC",
  //         "zip": "6162",
  //         "country": "Australia"
  //     }
  // }

    try {
      if (values.createAccount) {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/registerCustomer`, customerData);
        if (response.status === 200) {
          message.success('Customer registered successfully');
          setCurrent(current + 1);
        } else if (response.status === 201) {
          message.error('Email already exists.');
        } else {
          console.log('Error registering customer');
          message.error('Error registering customer');
        }
      } else {
        setCurrent(current + 1);
      }
    } catch (error) {
      console.error(
        'Error registering customer:',
        error.response ? error.response.data : error.message
      );
      message.error('Error registering customer');
    }

    sessionStorage.setItem('billingInfo', JSON.stringify(customerData));
  };

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const prevTwo = () => {
    setCurrent(current - 2);
  };

  const continueShopping = () => {
    navigate(`/shop/${storeUrl}`);
  };

  const onChangeDifferentAddress = (e) => {
    setShowDifferentAddress(e.target.checked);
    sessionStorage.setItem('showDifferentAddress', e.target.checked);
  };

  const handleStepChange = (newStep) => {
    if (newStep <= current) {
      setCurrent(newStep);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate(`/shop/${storeUrl}`);
    }


  }, [cartItems]);

  // Complete Order Component with Corrected Handling
  const CompleteOrder = ({
    cartItems,
    total = 0,
    billingInfo = {},
    surcharge = 0,
    spendForFreeShipping = 0,
    shippingCost = 0,
    placeOrder,
    loading = false,
  }) => {
   
    // Ensure that all required data is fetched before rendering
    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <main className="order-summary-main">
        <div className="order-summary-left-column">
          <h1 className="order-summary-title">Order Summary</h1>
          <button className="order-summary-continue-shopping-button" onClick={continueShopping}>
            CONTINUE SHOPPING
          </button>
          <div className="order-summary-info-container">
            <div className="order-summary-info-column">
              <h2 className="order-summary-subtitle">BILLING INFORMATION</h2>
              <p className="order-summary-text">
                {`${billingInfo.firstName || ''} ${
                  billingInfo.middleName ? billingInfo.middleName + ' ' : ''
                }${billingInfo.lastName || ''}`}
              </p>
              <p className="order-summary-text">{billingInfo.phone || ''}</p>

              {billingInfo.billingAddress && (
                <p className="order-summary-text">
                  {`${billingInfo.billingAddress.address || ''}, ${
                    billingInfo.billingAddress.city || ''
                  } ${billingInfo.billingAddress.state || ''} ${
                    billingInfo.billingAddress.zip || ''
                  }, ${billingInfo.billingAddress.country || ''}`}
                </p>
              )}
              {billingInfo.deliveryMethod === 'pickup' && (
                <p className="order-summary-text">
                  {`Pick up from store`} {/* Adjust as per your store's address */}
                </p>
              )}
              {billingInfo.companyName && (
                <p className="order-summary-text">
                  {billingInfo.companyName}
                  {billingInfo.ABN ? `, ABN: ${billingInfo.ABN}` : ''}
                </p>
              )}

              {billingInfo.orderNotes && (
                <p className="order-summary-text">Notes: {billingInfo.orderNotes}</p>
              )}
              <button className="order-summary-edit-button" style={{ padding: '10px 0' }} onClick={prev}>
                EDIT
              </button>
            </div>
            {billingInfo.deliveryMethod === 'delivery' && (
              <div className="order-summary-info-column">
                <h2 className="order-summary-subtitle">SHIPPING INFORMATION</h2>
                <p className="order-summary-text">
                  {showDifferentAddress && billingInfo.deliveryAddress
                    ? `${billingInfo.deliveryAddress.address || ''}, ${
                        billingInfo.deliveryAddress.city || ''
                      } ${billingInfo.deliveryAddress.state || ''} ${
                        billingInfo.deliveryAddress.zip || ''
                      }, ${billingInfo.deliveryAddress.country || ''}`
                    : `${billingInfo.billingAddress.address || ''}, ${
                        billingInfo.billingAddress.city || ''
                      } ${billingInfo.billingAddress.state || ''} ${
                        billingInfo.billingAddress.zip || ''
                      }, ${billingInfo.billingAddress.country || ''}`}
                </p>
              </div>
            )}
          </div>

          {billingInfo.deliveryMethod === 'delivery' && (
            <section className="order-summary-shipping-service">
              <h2 className="order-summary-subtitle">SHIPPING SERVICE</h2>
              <Radio.Group
                onChange={(e) => handleShippingService(e.target.value)}
                value={shippingService}
                style={{ marginBottom: '16px' }}
              >
                <Radio.Button value="regular">Regular (Parcel Post)</Radio.Button>
                <Radio.Button value="express">Express (Express Post)</Radio.Button>
              </Radio.Group>
              <p className="order-summary-text">
                Australia Post Standard Service: AUD {shippingCost}
              </p>

              {shippingService === 'express' ? (
              <p className="order-summary-text">
                Shipped within 1 business day.  Guaranteed Next Business Day within the Express Post network
              </p>
            ) : (
              <p className="order-summary-text">
                Shipped within 1 business day. {deliveryInfo}
              </p>
            )}
            {shippingCost> 40 && (
              <p className="order-summary-text">
                
                If you have any questions about shipping, you can call the store for advice: (03) 9551 7292
                </p>
                )}
            </section>
          )}
        </div>
        <div className="order-summary-right-column">
          <div className="order-summary-cart-header">
            <span>YOUR CART</span>
            <span className="order-summary-cart-edit" onClick={prevTwo}>
              EDIT
            </span>
          </div>

          {/* Cart Items List */}
          {cartItems.map((item) => (
            <div className="order-summary-product" key={item.id}>
              <div className="order-summary-product-image">
                <img
                  src={item.imgSrc}
                  alt={item.name}
                  draggable="false" // Disable drag
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-product-image.png';
                  }}
                />
              </div>
              <div>
                <h3 className="order-summary-product-title">{item.name}</h3>
                {item.subDescription && (
                  <p className="order-summary-text" style={{ margin: 0 }}>
                    {'Size:' + item.subDescription}
                  </p>
                )}
                <p className="order-summary-text" style={{ margin: 0 }}>
                  {`Quantity: ${item.quantity}`}
                </p>

                <p className="order-summary-price">AUD {item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="order-summary-summary">
            <div className="order-summary-summary-row">
              <span>SUBTOTAL INCL GST</span>
              <span>AUD {total.toFixed(2)}</span>
            </div>
           
            {billingInfo.deliveryMethod === 'delivery' && (
              <div className="order-summary-summary-row">
                <span>SHIPPING</span>
                <span>AUD {shippingCost.toFixed(2)}</span>
              </div>
            )}
             {surcharge !== 0 && (<div className="order-summary-summary-row">
              <span>SURCHARGE ({surcharge || 0}%)</span>
              <span>AUD {finalSurcharge.toFixed(2)}</span>
            </div>)}
            <div className="order-summary-summary-row order-summary-total">
              <span>TOTAL PRICE</span>
              <span>AUD {finalTotal.toFixed(2)}</span>
            </div>
          </div>
          {/* {billingInfo.deliveryMethod === 'delivery' && (
            <p className="order-summary-free-shipping">
              Free shipping on orders over AUD {spendForFreeShipping.toFixed(2)}
            </p>
          )} */}
          <button className="order-summary-contact-us-button" onClick={placeOrder}>
            PLACE ORDER
          </button>
        </div>
      </main>
    );
  };

  return (
    <div>
      <div className="shop-page-wrapper">
        <Header
          cartItems={cartItems}
          total={total}
          removeFromCart={removeFromCart}
          storeId={storeId}
          refreshPage={() => {
            console.log('');
          }}
        />

        <section className="">
          <div className="inner-banner-bottom">
            <div className="container">
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <span>/</span>
                </li>
                <li>
                  <a href={`/shop/${storeUrl}`}>Shop</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="cart-checkout-area pt-30">
          <div className="container">
            <Steps
              current={current}
              onChange={handleStepChange}
              direction={windowWidth < 768 ? 'vertical' : 'horizontal'}
              style={{ marginTop: '40px' }}
            >
              <Step
                title={<span style={{ fontSize: '18px' }}>Shopping cart</span>}
                icon={<ShoppingCartOutlined style={{ fontSize: '24px' }} />}
              />
              <Step
                title={<span style={{ fontSize: '18px' }}>Checkout</span>}
                icon={<SolutionOutlined style={{ fontSize: '24px' }} />}
              />
              <Step
                title={<span style={{ fontSize: '18px' }}>Complete order</span>}
                icon={<SmileOutlined style={{ fontSize: '24px' }} />}
              />
            </Steps>

            <div className="steps-content" style={{ marginTop: '30px' }}>
              {current === 0 && (
                <div>
                  <div className="shopping-cart">
                    {cartItems.length > 0 ? (
                      <>
                        <div className="cart-items">
                          {cartItems.map((item, index) => (
                            <div key={index} className="cart-item">
                              <div className="item-delete" onClick={() => removeFromCart(item.id, item.type)}>
                                <DeleteFilled style={{ color: '#e74c3c' }} />
                              </div>
                              <img
                                src={item.imgSrc}
                                draggable="false" // Disable drag
                                onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
                                alt={item.name}
                                className="item-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/default-product-image.png';
                                }}
                              />
                              <div className="item-details">
                                <h3 className="item-name">{item.name}</h3>
                                {item.subDescription && (
                                  <div className="item-subdecription">
                                    <p className="item-info">Size: {item.subDescription}</p>
                                  </div>
                                )}
                                <p className="item-price">${item.price}</p>
                              </div>
                              <div className="item-quantity">
                                <button
                                  className="quantity-btn"
                                  onClick={() =>  updateCartQuantity(item.id, item.type, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  value={item.quantity}
                                  className="quantity-input"
                                  readOnly
                                />
                                <button
                                  className="quantity-btn"
                                  onClick={() => updateCartQuantity(item.id, item.type,  item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary">
                          <h2 className="summary-title">Order Summary</h2>
                          <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          {surcharge !==0 && <div className="summary-row">
                            <span>Surcharge</span>
                            <span>${(surcharge ? (surcharge / 100) * total : 0).toFixed(2)}</span>
                          </div>
                          }
                          <div className="summary-row total">
                            <span>Total</span>
                            <span>
                              $
                              {(
                                total +
                                (surcharge ? (surcharge / 100) * total : 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="promo-code">
                            <input type="text" placeholder="Add promo code" className="promo-input" />
                            <button className="promo-button">Apply</button>
                          </div>
                          <button className="checkout-button" onClick={next}>
                            Go to Checkout →
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="empty-cart">
                        <p>No items in the cart</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {current === 1 && (
                <>
                  <a
                    onClick={prev}
                    style={{ cursor: 'pointer', color: '#3f96f3', marginBottom: '29px' }}
                  >
                    &lt; Previous
                  </a>

                  <Collapse
                    activeKey={collapseActiveKey}
                    onChange={handleCollapseChange}
                    className="checkout-collapse"
                    style={{ maxWidth: '78%', margin: '0 auto', alignItems: 'center' }}
                  >
                    {!isAuthenticated ? (
                      <Panel
                        header={
                          <span style={{ fontSize: '15px' }}>
                            Returning customer?{' '}
                            <span style={{ color: '#3f96f3' }}>Click here to login</span>
                          </span>
                        }
                        key="1"
                      >
                        <Form
                          layout="vertical"
                          onFinish={handleLogin}
                          onFinishFailed={handleLoginFailed}
                        >
                          <Row gutter={16}>
                            <Col xs={24} sm={24} md={12}>
                              <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: 'email' }]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                              <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true }]}
                              >
                                <Input.Password />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loginLoading}
                              style={{ marginRight: '10px' }}
                            >
                              LOGIN
                            </Button>
                          </Form.Item>
                        </Form>
                      </Panel>
                    ) : (
                      <Panel
                        header={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '15px', color: '#59ab02f2' }}>
                              <span style={{ color: 'rgb(70 77 85 / 55%)' }}> Logged in as</span>{' '}
                              {user?.CustomerEmail}
                            </span>
                            <Button type="link" onClick={handleLogout} style={{ padding: 0 }}>
                              Log out
                            </Button>
                          </div>
                        }
                        key="1"
                      />
                    )}
                  </Collapse>

                  <Form
                    layout="vertical"
                    initialValues={{
                    
                    //     firstName: user.CustomerSurname,
                    //     middleName: user.CustomerMiddleName,
                    //     lastName: user.CustomerLastName,
                    //     email: user.CustomerEmail,
                    //     phone: user.CustomerPhone,
                    //     ABN: user.ABN,
                    //     address: user.billingAddress.address,
                    //     city: user.Suburb,
                    //     state: user.State,
                    //     zip: user.PostCode,
                    //     shipAddress: user.DeliveryAddress,
                    //     shipCity: user.DeliverySuburb,
                    //     shipState: user.DeliveryState,
                    //     shipZip: user.DeliveryPostCode,
                    //     differentAddress:
                    //       user.DeliveryAddressv !== user.Address && user.DeliveryAddress !== null,
                    
                      // firstName: user?.CustomerSurname,
                      // middleName: user?.CustomerMiddleName,
                      // lastName: billingInfo.lastName,
                      // email: billingInfo.email,
                      // phone: billingInfo.phone,
                      // ABN: billingInfo.ABN,
                      // address: user?.Address,
                      // city: billingInfo.billingAddress?.city,
                      // state: billingInfo.billingAddress?.state,
                      // zip: billingInfo.billingAddress?.zip,
                      // country: billingInfo.billingAddress?.country,
                      // shipAddress: billingInfo.deliveryAddress?.address,
                      // shipCity: billingInfo.deliveryAddress?.city,
                      // shipState: billingInfo.deliveryAddress?.state,
                      // shipZip: billingInfo.deliveryAddress?.zip,
                      // shipCountry: billingInfo.deliveryAddress?.country,
                      // differentAddress: showDifferentAddress,
                      deliveryMethod: deliveryMethod, // Set current delivery method
                    }}
                    form={form}
                  >
                    <div className="billing-details-container">
                      {/* Delivery Method Section */}
                      <div className="form-section">
                        <h3 style={{ marginBottom: 0 }}>Delivery Method</h3>
                        <Divider style={{ margin: '12px 0' }} />
                        <Form.Item
                          name="deliveryMethod"
                          rules={[{ required: true, message: 'Please select a delivery method' }]}
                        >
                          <Radio.Group
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            value={deliveryMethod}
                          >
                            <Radio value="delivery">Delivery</Radio>
                            <Radio value="pickup">Pick up from store</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>

                      {/* Customer Information */}
                      <h3 style={{ marginBottom: 0 }}>Customer Information</h3>
                      <Divider style={{ margin: '12px 0' }} />
                      <div className="form-section">
                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="firstName"
                              rules={[{ required: true, message: 'Please enter your first name' }]}
                            >
                              <Input placeholder="First Name" aria-label="First Name" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item name="middleName" rules={[{ required: false }]}>
                              <Input placeholder="Middle Name" aria-label="Middle Name" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="lastName"
                              rules={[{ required: true, message: 'Please enter your last name' }]}
                            >
                              <Input placeholder="Last Name" aria-label="Last Name" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      {/* Contact Information */}
                      <div className="form-section">
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="email"
                              rules={[
                                { required: true, type: 'email', message: 'Please enter a valid email' },
                              ]}
                            >
                              <Input placeholder="Email Address" aria-label="Email Address" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="phone"
                              rules={[{ required: true, message: 'Please enter your phone number' }]}
                            >
                              <Input placeholder="Phone Number" aria-label="Phone Number" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      {/* Company Information */}
                      <div className="form-section">
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="companyName" rules={[{ required: false }]}>
                              <Input placeholder="Company Name" aria-label="Company Name" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="ABN" rules={[{ required: false }]}>
                              <Input placeholder="ABN" aria-label="ABN" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      {/* Billing Address Information */}
                      <h3 style={{ marginBottom: 0 }}>Billing Address Information</h3>
                      <Divider style={{ margin: '12px 0' }} />
                      <div className="form-section">
                        <Row gutter={16}>
                          <Col xs={24} sm={15}>
                            <Form.Item
                              name="address"
                              rules={[{ required: true, message: 'Please enter your street address' }]}
                            >
                              <Input placeholder="Street Address" aria-label="Street Address" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="city"
                              rules={[{ required: true, message: 'Please enter your Suburb' }]}
                            >
                              <Input placeholder="Suburb" aria-label="Suburb" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="state"
                              rules={[{ required: true, message: 'Please select your state' }]}
                            >
                              <Select placeholder="State" aria-label="State" style={{ height: '40px' }}>
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
                              name="zip"
                              rules={[{ required: true, message: 'Please enter your zip code' }]}
                            >
                              <Input placeholder="Post Code" aria-label="Post Code" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      {/* Shipping Address Information */}
                      {deliveryMethod === 'delivery' && (
                        <>
                          <div className="form-section">
                            <Form.Item
                              name="differentAddress"
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                            >
                              <Checkbox onChange={onChangeDifferentAddress}>
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                  Ship to a different address?
                                </span>
                              </Checkbox>
                            </Form.Item>

                            {showDifferentAddress && (
                              <div className="shipping-address">
                                <Row gutter={16}>
                                  <Col xs={24} sm={15}>
                                    <Form.Item
                                      name="shipAddress"
                                      rules={[
                                        { required: true, message: 'Please enter your shipping address' },
                                      ]}
                                    >
                                      <Input
                                        placeholder="Street Address"
                                        aria-label="Shipping Street Address"
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col xs={24} sm={8}>
                                    <Form.Item
                                      name="shipCity"
                                      rules={[
                                        { required: true, message: 'Please enter your shipping town/city' },
                                      ]}
                                    >
                                      <Input
                                        placeholder="Town/City"
                                        aria-label="Shipping Town/City"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={8}>
                                    <Form.Item
                                      name="shipState"
                                      rules={[
                                        { required: true, message: 'Please select your shipping state' },
                                      ]}
                                    >
                                      <Select
                                        placeholder="State"
                                        aria-label="Shipping State"
                                        style={{ height: '40px' }}
                                      >
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
                                      name="shipZip"
                                      rules={[
                                        { required: true, message: 'Please enter your shipping zip code' },
                                      ]}
                                    >
                                      <Input
                                        placeholder="Post Code"
                                        aria-label="Shipping Post Code"
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Account Creation Section */}
                      {!isAuthenticated && (
                        <>
                          <div className="form-section">
                            <Form.Item
                              name="createAccount"
                              valuePropName="checked"
                              style={{ marginBottom: 10 }}
                            >
                              <Checkbox onChange={(e) => setShowAccountPassword(e.target.checked)}>
                                Create an Account?
                              </Checkbox>
                            </Form.Item>

                            {showAccountPassword && (
                              <>
                                <Row gutter={16}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item
                                      name="accountPassword"
                                      rules={[
                                        { required: true, message: 'Please input your password!' },
                                      ]}
                                    >
                                      <Input.Password
                                        placeholder="Password"
                                        aria-label="Password"
                                        style={{ height: '40px', alignItems: 'center' }}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item
                                      name="confirmPassword"
                                      dependencies={['accountPassword']}
                                      hasFeedback
                                      rules={[
                                        { required: true, message: 'Please confirm your password!' },
                                        ({ getFieldValue }) => ({
                                          validator(_, value) {
                                            if (!value || getFieldValue('accountPassword') === value) {
                                              return Promise.resolve();
                                            }
                                            return Promise.reject(
                                              new Error(
                                                'The two passwords that you entered do not match!'
                                              )
                                            );
                                          },
                                        }),
                                      ]}
                                    >
                                      <Input.Password
                                        placeholder="Confirm Password"
                                        aria-label="Confirm Password"
                                        style={{ height: '40px', alignItems: 'center' }}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* Order Notes Section */}
                      <div className="form-section">
                        <Form.Item
                          name="orderNotes"
                          rules={[
                            {
                              max: 1024,
                              message: 'Order Notes cannot exceed 1024 characters',
                            },
                          ]}
                        >
                          <Input.TextArea
                            placeholder="Order Notes (optional)"
                            aria-label="Order Notes"
                          />
                        </Form.Item>
                      </div>

                      {/* Save Button */}
                      <Button
                        type="primary"
                        onClick={() => {
                          form
                            .validateFields()
                            .then((values) => {
                              saveCustomer(values);
                            })
                            .catch((info) => {
                              console.log('Validate Failed:', info);
                            });
                        }}
                        style={{ marginTop: '20px' }}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                </>
              )}

              {current === 2 && (
                <CompleteOrder
                  cartItems={cartItems}
                  total={total}
                  billingInfo={billingInfo}
                  surcharge={surcharge}
                  spendForFreeShipping={spendForFreeShipping}
                  shippingCost={shippingCost}
                  placeOrder={placeOrder}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
