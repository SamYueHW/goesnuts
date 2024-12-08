import React, { useState, useEffect } from 'react';
// import Header from '../../components/Headers/Header';
import { useRef } from 'react';
import useGetState from '../../components/hooks/useGetState';
import './OrderConfirm.css';

const OrderConfirm = () => {
    const [loading, setLoading] = useState(true);
    const headerRef = useRef(null);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal, getTotal] = useGetState(0);
    const [storeId, setStoreId] = useState(null);
    const [storeUrl, setStoreUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    //generate order items by default
    const [orderItems, setOrderItems] = useState([
        { name: 'Item 1', quantity: 2, price: 10 },
        { name: 'Item 2', quantity: 1, price: 20 },
        { name: 'Item 3', quantity: 3, price: 15 }
    ]);
    const [customerDetails, setCustomerDetails] = useState({
        name: 'John Doe',
        email: 'kaikai@',
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000);
       
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="order-confirm">
                {/* <Header /> */}
                <div className="loading">Loading...</div>
            </div>
        );
    }
    const updateCartQuantity = (index, quantity) => {
      if (quantity === 0) {
         removeFromCart(index);
       } else {
         const newCartItems = [...cartItems];
         newCartItems[index].quantity = quantity;
         setCartItems(newCartItems);
       }
     };
     
     const removeFromCart = (index) => {
       const newCartItems = [...cartItems];
       newCartItems.splice(index, 1);
       setCartItems(newCartItems);
     };
   

    return (
        <div className="order-confirm">
          {/* <Header 
        ref={headerRef} 
        cartItems={cartItems} 
        total={getTotal()} 
        removeFromCart={removeFromCart} 
        updateCartQuantity={updateCartQuantity} 
        storeId={storeId}
      />
   */}
            <div className="order-success">
                <h1>Order Success!</h1>
                <p>Order ID: 123</p>
                <div className="order-details">
                    <h2>Order Items</h2>
                    <ul>
                        {orderItems.map((item, index) => (
                            <li key={index}>{item.name} - {item.quantity} x ${item.price}</li>
                        ))}
                    </ul>
                    <h2>Total Amount: $123</h2>
                </div>
                <div className="customer-details">
                    <h2>Customer Details</h2>
                    <p>Name: {customerDetails.name}</p>
                    <p>Email: {customerDetails.email}</p>
                </div>
                <div className="delivery-address">
                    <h2>Delivery Address</h2>
                    <p>{123}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirm;
