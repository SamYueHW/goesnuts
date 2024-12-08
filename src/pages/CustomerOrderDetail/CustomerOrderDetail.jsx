import React, { useRef, useEffect, useState } from "react";
import useGetState from '../../components/hooks/useGetState';
import Header from '../../components/Headers/Header';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './customerOrderDetail.css';
import Footer from '../../components/Footer/Footer';

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const navigete = useNavigate();
  const storeUrl = sessionStorage.getItem('storeUrl') ? sessionStorage.getItem('storeUrl'): null;
  const headerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(
    sessionStorage.getItem('cartItems') ? JSON.parse(sessionStorage.getItem('cartItems')) : []
  );
  const [total, setTotal, getTotal] = useGetState(0);
  const [storeId, setStoreId] = useState(sessionStorage.getItem('storeId') || null);

  // New state variables for fetched data
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [error, setError] = useState(null);

  // Update cart quantity (unchanged)
  const updateCartQuantity = (index, quantity) => {
    if (quantity === 0) {
      removeFromCart(index);
    } else {
      const newCartItems = [...cartItems];
      newCartItems[index].quantity = quantity;
      setCartItems(newCartItems);
    }
  };

  // Remove from cart (unchanged)
  const removeFromCart = (index) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  // Update total and persist cart items (unchanged)
  useEffect(() => {
    const newTotal = cartItems.reduce(
      (acc, item) => acc + item.price * (isNaN(item.quantity) ? 0 : item.quantity),
      0
    );
    setTotal(newTotal);
    sessionStorage.setItem('total', newTotal);
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems, setTotal]);

  // Fetch order details from the back-end
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Ensure JWT is stored in localStorage
        if (!token) {
          setError('User is not authenticated.');
          setLoading(false);
          window.location.href = `${process.env.REACT_APP_FONT_ONLINEORDER_URL}`;
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/orderDetail/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const { orderItems, customer, billingAddress, deliveryAddress, order } = response.data.data;
          console.log(response.data.data);
          setOrder(order);
          setOrderItems(orderItems);
          setCustomer(customer);
          setBillingAddress(billingAddress);
          setDeliveryAddress(deliveryAddress);
          setDeliveryMethod(order.deliveryMethod);

        } else {
          setError(response.data.message || 'Failed to fetch order details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
        <div className="spinner-wrapper">
            <div className="spinner"></div>
        </div>
    );
}

  if (error) {
    return (
      <div className="spinner-wrapper">
          <div className="spinner"></div>
      </div>
  );
  }

  return (
    <div>
    <div>
      <Header
        ref={headerRef}
        cartItems={cartItems}
        total={getTotal()}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        storeId={storeId}
      />
      <div className="kong" style={{ height: 79 }}></div>
      <div className="customer-order-detail">

        <div className="account-header">
          <h1>Account</h1>
        </div>

        <a href={`/customerAccount/${storeUrl}`} className="return-link"> Return to account details</a>


        <main>
          <div className="order-info">
            <h2>Order #{orderId}</h2>
            <p>Placed on {new Date(order?.CreatedAt).toLocaleString()}</p>
          </div>

          <div className="order-content">
            <div className="order-table">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>PRICE</th>
                    <th>QUANTITY</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
              
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td><a href="#">{item.Description1} - {item.Description2} {item.subDescription}</a></td>
                    <td>{item.StockId}</td>
                    <td>${item.Price.toFixed(2)}</td>
                    <td>{item.Quantity}</td>
                    <td>${(item.Price * item.Quantity).toFixed(2)}</td>
                  </tr>
                ))}

                  <tr className="no-border">
                    <td>Subtotal</td>
                    <td colSpan="3"></td>
                    <td>${orderItems.reduce((acc, item) => acc + item.Price * item.Quantity, 0).toFixed(2)}</td>
                  </tr>
                  
                  {order?.Surcharge !== 0 && <tr className="no-border">
                    <td>Surcharge</td>
                    <td colSpan="3"></td>
                    <td>${(order.Surcharge || 0).toFixed(2)}</td>
                  </tr>
                  }
                  {order?.DeliveryMethod ==='delivery' && 
                  (<tr className="no-border">
                    <td>Shipping </td>
                    <td colSpan="3"></td>
                    <td>${(order.Freight || 0).toFixed(2)}</td>
                  </tr>)}
                  <tr className="total-row">
                    <td>Total</td>
                    <td colSpan="3"></td>
                    <td>
                     
                        ${(order?.Amount ?? 0).toFixed(2)} AUD
                      
                    </td>

                  </tr>
                  <tr className="total-row">
                    <td><strong>Paid</strong></td>
                    <td colSpan="3"></td>
                    <td>
                      <strong>
                        ${(order?.Paid ?? 0).toFixed(2)} AUD
                      </strong>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
            <div className="order-addresses">
  <div className="address billing">
    <h3><strong>Billing Address</strong></h3>

    <address>
      {/* <p>{order?.BillSurname && order?. BillLastName && (
        <>
          <i className="material-icons">person</i> {order?.BillSurname} {order?.BillMiddleName? order?.BillMiddleName:"" }{order?.BillLastName}
        </>
      )}</p> */}
      <p>
      {order?.BillSurname && order?.BillLastName && (
        <>
          <i className="material-icons">person</i> 
          {order.BillSurname} {order.BillMiddleName || ""} {order.BillLastName}
        </>
      )}
    </p>


      <p>{order?.BillEmail && (
        <>
          <i className="material-icons">email</i> {order?.BillEmail}
        </>
      )}</p>

      <p>{order?.BillPhone && (
        <>
          <i className="material-icons">phone</i> {order?.BillPhone}
        </>
      )}</p>

      <p>{order?.BillAddress && (
        <>
       {order?.BillAddress} {order?.BillSuburb}, {order?.BillState} {order?.BillPostCode} {order?.BillCountry}
        </>
      )}</p>

    
    </address>
  </div>

  <div className="address shipping">
    <h3><strong>Shipping Address</strong></h3>

    <address>
     
    <p>
      {order?.DeliveryMethod  !== 'pickup' ? order?.DeliveryAddress && order?.DeliverySuburb && order?.DeliveryState && order?.DeliveryPostCode && order?.DeliveryCountry
        ? `${order?.DeliveryAddress}, ${order?.DeliverySuburb}, ${order?.DeliveryState} ${order?.DeliveryPostCode}, ${order?.DeliveryCountry}`
        : 'No shipping address provided.'
        : 'Pickup from store.'
      }
    </p>

   
    </address>
  </div>
</div>

          </div>
        </main>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default CustomerOrderDetail;
