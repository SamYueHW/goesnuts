import React, { useState, useEffect, useContext} from 'react';
import './orderSuccess.css';
import Header from '../../components/Headers/Header';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { min } from 'moment';
import { CartContext } from '../../contexts/CartContext';


import {UserOutlined ,ShoppingOutlined ,TruckOutlined, DollarOutlined } from '@ant-design/icons';

const OrderSuccess  = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [storeId, setStoreId] = useState(null);
    
    const {clearCart} = useContext(CartContext);

 

    const removeFromCart = (index) => {
        const newCartItems = [...cartItems];
        const removedItem = newCartItems.splice(index, 1)[0];
    
        setCartItems(newCartItems);
        const newTotal = total - removedItem.price * removedItem.quantity;
        setTotal(newTotal);
    
        sessionStorage.setItem('cartItems', JSON.stringify(newCartItems));
        sessionStorage.setItem('total', newTotal);
      };

    const { storeUrl, encryptedOrderId } = useParams();
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
       try {
        //clear cart session
        clearCart();
        const fetchOrder = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchOrder/${encryptedOrderId}`);
          
            if (!response.data.error) {
              setLoading(false);
                console.log(response.data);
                setOrderData(response.data);
               
            }
            else{
                
               
              setLoading(false);
              setOrderData(null);
              console.log(response.data.error);
              navigate(`/shop/${storeUrl}`);
            }
        } catch (error) {

            console.error('Error fetching order:', error);
            setLoading(false);
            setOrderData(null);
            navigate(`/shop/${storeUrl}`);
          }
        };
        // Fetch order immediately (no delay)
        fetchOrder();
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
        setOrderData(null);
        navigate(`/shop/${storeUrl}`);
      }
    }, [encryptedOrderId]);


    const shoppingPage = () => {
        navigate(`/shop/${storeUrl}`);
    }
    if (loading) {
        return (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        );
      }
    

  return (
    <div className="shop-page-wrapper">
      <Header
        cartItems={cartItems}
        total={total}
        removeFromCart={removeFromCart}
        storeId={storeId}
      />
  <div className="kong" style={{ height: 100 }}></div>
     

    <div className="order-confirmation__container">
      <div className="order-confirmation__header">
        <div className="order-confirmation__checkmark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="order-confirmation__title">Thank you for your order!</h1>
        <p className="order-confirmation__subtitle">
          The order confirmation email with details of your order has been sent to your email address.
        </p>
        <div className="email-tip">
          <p className="email-tip__text">
            <svg className="email-tip__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            If you don't receive the email, please check your spam/junk folder.
          </p>
        </div>
      </div>
      
      <div className="order-confirmation__order-number">
        <span>YOUR ORDER # {orderData?.onlineOrderId}</span>
      </div>
      
      <div className="order-confirmation__date">
      <span>
        Order Date: {new Date(orderData?.orderDate).toLocaleString()}
      </span>

      </div>
      
      <div className="order-confirmation__details">
              
      <div className="order-confirmation__section order-confirmation__summary">
          <h2 className="order-confirmation__section-title">
            <ShoppingOutlined className='order-confirmation-img'></ShoppingOutlined>  ORDER SUMMARY
          </h2>
          {orderData?.itemDetails && orderData.itemDetails.length > 0 ? (
                orderData.itemDetails.map((item, index) => (
                <div className="order-confirmation__product" key={index}>
                    <img src={ item.imgUrl } alt={item.productName} className="order-confirmation__product-image"   onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/default-product-image.png';
                                  }}/>
                    <div className="order-confirmation__product-details">
                    <p className='product-title'>{item.description1}</p>
                    {item.subDescription && (
                      <p>{"Size: " + item.subDescription}</p>
                    )}
                    <p>Qty: {item.quantity}</p>
                    <span className="order-confirmation__product-price">
                    ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    </div>
                    
                </div>
                ))
            ) : (
                <p>No items in the order.</p>
            )}

             <div className="order-confirmation__totals">
            <div className="order-confirmation__total-row">
              <span>Subtotal</span>
              <span>${orderData?.itemDetails.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
            {/* <div className="order-confirmation__total-row">
              <span>Shipping & Handling</span>
              <span>${orderData?.freight.toLocaleString()}</span>
            </div> */}
            <div className="order-confirmation__total-row">
              <span>Surcharge</span>
              <span>${orderData?.surcharge.toLocaleString()}</span>
            </div>
            <div className="order-confirmation__total-row order-confirmation__grand-total">
              <span>Grand Total</span>
              <span>${(orderData?.paid).toLocaleString()}</span>
            </div>
          </div> 
       
        </div>
        <div className="order-confirmation__section order-confirmation__shipping">
          <h2 className="order-confirmation__section-title">
            <UserOutlined className='order-confirmation-img'></UserOutlined> SHIPPING ADDRESS
          </h2>
          <p>{orderData?.customer.customerName}</p>
          {orderData?.deliveryMethod !== 'pickup' ?
            <>
              <p>{orderData.customer.deliveryAddress? orderData.customer.deliveryAddress : orderData.customer.address}</p>
              <p>{orderData.customer.deliverySuburb? orderData.customer.deliverySuburb:orderData.customer.suburb }, {orderData.customer.deliveryState? orderData.customer.deliveryState:orderData.customer.state} {orderData.customer.deliveryPostCode? orderData.customer.deliveryPostCode: orderData.customer.postCode}</p>
              <p>{orderData.customer.deliveryCountry? orderData.customer.deliveryCountry:orderData.customer.country}</p>
            </>
            : "Pickup From Store"
          }


          <p>Phone: {orderData?.customer.mobile}</p>
        </div>
        {orderData?.deliveryMethod !== 'pickup' && (
          <>
        <div className="order-confirmation__section order-confirmation__shipping-method">
          <h2 className="order-confirmation__section-title">
            <TruckOutlined className='order-confirmation-img'></TruckOutlined> SHIPPING METHOD
          </h2>
          <p>Standard Shipping</p>
          <p>Delivery in 3-5 business days</p>
          
          <p>Shipping cost: ${orderData?.freight.toLocaleString()}</p>
        </div>
        </>
        )}
        {/* <div className="order-confirmation__section order-confirmation__payment">
          <h2 className="order-confirmation__section-title">
            <DollarOutlined className='order-confirmation-img'></DollarOutlined> PAYMENT DETAILS
          </h2>
            <p>Payment method: {orderData?.paymentMethod}</p>
            <p>Payment ID: </p>
            <p style={{ maxWidth: "250px", wordWrap: "break-word", overflowWrap: "break-word" }}>
              {orderData?.paymentId}
            </p>

        </div> */}
  
      </div>
      
      <div className="order-confirmation__actions">
        <button className="order-confirmation__button order-confirmation__button--primary" onClick={shoppingPage}>Continue Shopping</button>
        {/* <button className="order-confirmation__button order-confirmation__button--secondary">Print Order</button>
        <button className="order-confirmation__button order-confirmation__button--secondary">Re-Order</button> */}
      </div>
    </div>

    </div>
  );
};
export default OrderSuccess;