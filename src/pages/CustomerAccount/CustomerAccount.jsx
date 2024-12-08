import React, { useState, useEffect, useRef } from 'react';
import useGetState from '../../components/hooks/useGetState';
import Header from '../../components/Headers/Header';
import { ChevronRight, LogOut, Ship } from 'lucide-react';
import axios from 'axios';
import './customerAccount.css';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const CustomerAccount = () => {
    const [storeId, setStoreId] = useState(sessionStorage.getItem('storeId') || null);
    const [cartItems, setCartItems] = useState(
        sessionStorage.getItem('cartItems') ? JSON.parse(sessionStorage.getItem('cartItems')) : []
    );
    const [total, setTotal, getTotal] = useGetState(0);
    const headerRef = useRef(null);
    
    // New loading state
    const [loading, setLoading] = useState(true);
    
    // New customer and orders state
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState({
        CustomerSurname: '',
        CustomerMiddleName: '',
        CustomerLastName: '',
        CustomerEmail: '',
        CustomerPhone: '',
        Address: '',
        Suburb: '',
        State: '',
        PostCode: '',
        Country: '',
        ShippingAddress: '', 
        ShippingSuburb: '',
        ShippingState: '',
        ShippingPostCode: '',
        ShippingCountry: '',
    });


    const navigate = useNavigate();

    // Remove from cart (unchanged)
    const removeFromCart = (index) => {
        const newCartItems = [...cartItems];
        newCartItems.splice(index, 1);
        setCartItems(newCartItems);
    };

    const updateCartQuantity = (index, quantity) => {
        if (quantity === 0) {
            removeFromCart(index);
        } else {
            const newCartItems = [...cartItems];
            newCartItems[index].quantity = quantity;
            setCartItems(newCartItems);
        }
    };

    useEffect(() => {
        const newTotal = cartItems.reduce(
            (acc, item) => acc + item.price * (isNaN(item.quantity) ? 0 : item.quantity),
            0
        );
        setTotal(newTotal);
        sessionStorage.setItem('total', newTotal);
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems, setTotal]);

    useEffect(() => {
        const fetchCustomerData = async () => {
            const token = localStorage.getItem('jwtToken'); // Assuming JWT is stored in sessionStorage

            if (!token) {
                // Handle the absence of token, possibly redirect to login
                setLoading(false);

                // Redirect to ${process.env.REACT_APP_FONT_ONLINEORDER_URL}
                window.location.href = `${process.env.REACT_APP_FONT_ONLINEORDER_URL}`;
                return;
            }
           

            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/customerAccount`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
         
                

                setCustomer(response.data.customer);
            
                setEditedCustomer({
                    CustomerSurname: response.data.customer.CustomerSurname || '',
                    CustomerMiddleName: response.data.customer.CustomerMiddleName || '',
                    CustomerLastName: response.data.customer.CustomerLastName || '',
                    CustomerEmail: response.data.customer.CustomerEmail || '',
                    CustomerPhone: response.data.customer.CustomerPhone || '',
                    Address: response.data.customer.Address || '',
                    Suburb: response.data.customer.Suburb || '',
                    State: response.data.customer.State || '',
                    PostCode: response.data.customer.PostCode || '',
                    Country: response.data.customer.Country || '',

                    ShippingAddress: response.data.customer.DeliveryAddress || '', 
                    ShippingSuburb: response.data.customer.DeliverySuburb || '',
                    ShippingState: response.data.customer.DeliveryState || '',
                    ShippingPostCode: response.data.customer.DeliveryPostCode || '',
                    ShippingCountry: response.data.customer.DeliveryCountry || '',

                });
                
                setOrders(response.data.orders);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching customer data:', error);
                // Optionally handle errors, e.g., redirect to login on 401
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, []);
    const handleDetailsClick = (orderId) => {
        
       navigate( `/order-details/${orderId}`); 
    };
    
    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        // Reset editedCustomer to current customer data
        setEditedCustomer({
            CustomerSurname: customer.CustomerSurname || '',
            CustomerMiddleName: customer.CustomerMiddleName || '',
            CustomerLastName: customer.CustomerLastName || '',
            CustomerEmail: customer.CustomerEmail || '',
            CustomerPhone: customer.CustomerPhone || '',
            Address: customer.Address || '',
            Suburb: customer.Suburb || '',
            State: customer.State || '',
            PostCode: customer.PostCode || '',
            Country: customer.Country || '',
            ShippingAddress: customer.ShippingAddress || '',
            ShippingSuburb: customer.ShippingSuburb || '',
            ShippingState: customer.ShippingState || '',
            ShippingPostCode: customer.ShippingPostCode || '',
            ShippingCountry: customer.ShippingCountry || '',

        });
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveClick = async () => {
      

        try {
            console.log('editedCustomer!');
            // const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/updateCustomerAccount`, editedCustomer, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     },
            // });
           
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/updateCustomerAccount`,
              editedCustomer,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status !== 200) {
                // Optionally handle error response
                message.error('Failed to update customer data');
                return;
            }
            else if (response.status === 200) {
                message.success('Successfully updated customer data');
                const customer = response.data.customer;

                let userData = localStorage.getItem('user');
                if (userData) {
                    userData = JSON.parse(userData);
                    userData.billingAddress.address = customer.Address;
                    userData.billingAddress.city = customer.Suburb;
                    userData.billingAddress.state = customer.State;
                    userData.billingAddress.zip = customer.PostCode;
                    userData.billingAddress.country = 'Australia';
                    userData.deliveryAddress =  {
                    address: customer.DeliveryAddress,
                    city: customer.DeliverySuburb,
                    state: customer.DeliveryState,
                    zip: customer.DeliveryPostCode,
                    country: 'Australia',
                    }; 
                    userData.CustomerSurname = customer.CustomerSurname;
                    userData.CustomerMiddleName = customer.CustomerMiddleName || null;
                    userData.CustomerLastName = customer.CustomerLastName;
                    userData.CustomerEmail = customer.CustomerEmail;
                    userData.phone = customer.CustomerPhone;
                    // userData.ABN = customer.ABN || null;
                    
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                
             
                setCustomer(response.data.customer);
                setIsEditing(false);
            }
            // Update local customer state with response data
           
            // Optionally show a success message
        } catch (error) {
            console.error('Error updating customer data:', error);
            // Optionally handle errors, e.g., show error message to user
        }
    };
    

    if (loading) {
        return (
            <div className="spinner-wrapper">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
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
            <div className="account-container">
                <div className="account-header">
                    <h1>Account</h1>
               
                </div>

                <div className="account-content">
                    <div className="order-history">
                        <h2>Order history</h2>
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>ORDER</th>
                                    <th>DATE</th>
                                    <th>PAID</th>
                                    <th>FULFILLMENT STATUS</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order.OrderId}>
                                           <td>
                                                <button 
                                                    onClick={() => handleDetailsClick(order.OrderId)} 
                                                    className="order-id-link">
                                                    #{order.OrderId}
                                                </button>
                                            </td>
                                            <td>{new Date(order.CreatedAt).toLocaleDateString()}</td>
                                            <td>{order.Paid}</td>
                                            <td>{order.OrderStatus}</td>
                                            <td>${order.Amount.toFixed(2)}</td>
                                            
                                        </tr>

                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="no-orders">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="account-details">
                        <div className="profile-header">
                            
                            <h2>Profile Details</h2>
                            {!isEditing && (
                        
                            <button className="order-summary-edit-button" style={{ padding: '10px 0' }} onClick={handleEditClick}>
                            EDIT
                            </button>
                            )}
                        </div>
                        {customer ? (
                            isEditing ? (
                                <form className="edit-form">
                                    <div className="form-group">
                                        <label htmlFor="CustomerSurname">Surname</label>
                                        <input
                                            type="text"
                                            id="CustomerSurname"
                                            name="CustomerSurname"
                                            value={editedCustomer.CustomerSurname}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="CustomerMiddleName">Middle Name</label>
                                        <input
                                            type="text"
                                            id="CustomerMiddleName"
                                            name="CustomerMiddleName"
                                            value={editedCustomer.CustomerMiddleName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="CustomerLastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="CustomerLastName"
                                            name="CustomerLastName"
                                            value={editedCustomer.CustomerLastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="CustomerEmail">Email</label>
                                        <input
                                            type="email"
                                            id="CustomerEmail"
                                            name="CustomerEmail"
                                            value={editedCustomer.CustomerEmail}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="CustomerPhone">Phone</label>
                                        <input
                                            type="tel"
                                            id="CustomerPhone"
                                            name="CustomerPhone"
                                            value={editedCustomer.CustomerPhone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Address">Address</label>
                                        <input
                                            type="text"
                                            id="Address"
                                            name="Address"
                                            value={editedCustomer.Address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Suburb">Suburb</label>
                                        <input
                                            type="text"
                                            id="Suburb"
                                            name="Suburb"
                                            value={editedCustomer.Suburb}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="State">State</label>
                                        <input
                                            type="text"
                                            id="State"
                                            name="State"
                                            value={editedCustomer.State}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="PostCode">Post Code</label>
                                        <input
                                            type="text"
                                            id="PostCode"
                                            name="PostCode"
                                            value={editedCustomer.PostCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Country">Country</label>
                                        <input
                                            type="text"
                                            id="Country"
                                            name="Country"
                                            value={editedCustomer.Country}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ShippingAddress">Shipping Address</label>
                                        <input
                                            type="text"
                                            id="ShippingAddress"
                                            name="ShippingAddress"
                                            value={editedCustomer.ShippingAddress}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ShippingSuburb">Shipping Suburb</label>
                                        <input
                                            type="text"
                                            id="ShippingSuburb"
                                            name="ShippingSuburb"
                                            value={editedCustomer.ShippingSuburb}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ShippingState">Shipping State</label>
                                        <input
                                            type="text"
                                            id="ShippingState"
                                            name="ShippingState"
                                            value={editedCustomer.ShippingState}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ShippingPostCode">Shipping Post Code</label>
                                        <input
                                            type="text"
                                            id="ShippingPostCode"
                                            name="ShippingPostCode"
                                            value={editedCustomer.ShippingPostCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ShippingCountry">Shipping Country</label>
                                        <input
                                            type="text"
                                            id="ShippingCountry"
                                            name="ShippingCountry"
                                            value={editedCustomer.ShippingCountry}
                                            onChange={handleInputChange}
                                        />
                                    </div>


                                    <div className="form-actions">
                                        <button type="button" onClick={handleSaveClick} className="save-button">
                                            Save
                                        </button>
                                        <button type="button" onClick={handleCancelClick} className="cancel-button">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <p>
                                        {customer.CustomerSurname && customer.CustomerLastName && (
                                            <>
                                                <i className="material-icons">person</i>
                                                {`${customer.CustomerSurname} ${
                                                    customer.CustomerMiddleName
                                                        ? customer.CustomerMiddleName + ' '
                                                        : ''
                                                }${customer.CustomerLastName}`}
                                            </>
                                        )}
                                    </p>

                                    <p>
                                        {customer.CustomerEmail && (
                                            <>
                                                <i className="material-icons">email</i> {customer.CustomerEmail}
                                            </>
                                        )}
                                    </p>

                                    <p>
                                        {customer.CustomerPhone && (
                                            <>
                                                <i className="material-icons">phone</i> {customer.CustomerPhone}
                                            </>
                                        )}
                                    </p>

                                    <p>
                                        {customer.Address && (
                                            <>
                                                <i className="material-icons">home</i>{' '}
                                                {`${customer.Address} ${
                                                    customer.Suburb ? customer.Suburb + ', ' : ''
                                                }${customer.State ? customer.State : ''} ${
                                                    customer.PostCode ? customer.PostCode : ''
                                                } ${customer.Country ? customer.Country : ''}`}
                                            </>
                                        )}
                                    </p>

                                    <p>
                                        {customer.DeliveryAddress && (
                                            <>
                                                <i className="material-icons">local_shipping</i> {' '}
                                                {`${customer.DeliveryAddress} ${
                                                    customer.DeliverySuburb ? customer.DeliverySuburb + ', ' : ''
                                                }${customer.DeliveryState ? customer.DeliveryState : ''} ${
                                                    customer.DeliveryPostCode ? customer.DeliveryPostCode : ''
                                                } ${customer.DeliveryCountry ? customer.DeliveryCountry : ''}`}
                                            </>
                                        )}
                                    </p>
                                    <p>
                                        {customer.ShippingSuburb && (
                                            <>
                                                <i className="material-icons">local_shipping</i> {customer.ShippingSuburb}
                                            </>
                                        )}
                                    </p>
                                </>
                            )
                        ) : (
                            <p>No customer details available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAccount;
