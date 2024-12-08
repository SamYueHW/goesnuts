// AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { CartContext } from './CartContext';

const AuthContext = createContext();


// Create the AuthProvider component
const AuthProvider = ({ children }) => {

  const { cartItems, total, updateCartQuantity, removeFromCart, addToCart, resetCart } = useContext(CartContext);
  // State variables for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
   
    return savedUser ? JSON.parse(savedUser) : null;
  });

    // useState(() => {
    //   const savedCartItems = sessionStorage.getItem('cartItems');
    //   return savedCartItems ? JSON.parse(savedCartItems) : [];
    // });
  // Check for token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
     
      if (userData){
        if (userData.billingAddress.address !== user.deliveryAddress.address) {
          console.log('billing address is different from delivery address');
          sessionStorage.setItem('showDifferentAddress', true);
        }
        else {
          console.log('billing address is the same as delivery address');
          sessionStorage.setItem('showDifferentAddress', false);
        }
      }
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  // Define the login function
  const login = async (userData, token) => {
    try {
      // Update authentication state
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('userData:', userData);
     
     
    } catch (error) {
      console.error('Error in login function:', error);
    }
  };
  
//   const login = async (userData, token) => {
//     setIsAuthenticated(true);
//     setUser(userData);
//     localStorage.setItem('jwtToken', token);
//     localStorage.setItem('user', JSON.stringify(userData));
//     //把cartitems 把itemId 和type id 变成数组传给后端，后端返回每个item 的价格，然后更新cartitems里的价格
//     const cartItemIds = cartItems.map((item) => {
    
//       return { stockId: item.id, type: item.type };
//     });
//     const config = {  
//       headers: {
//         authorization: `Bearer ${token}`,
//       },
//     };
//  const response = await axios.post(
//       `${process.env.REACT_APP_SERVER_URL}/fetchItemMemberPrice`,
//       cartItemIds,
//       config
//     );

//     if (response.status === 200 && response.data.success) {
//       const updatedCartItems = cartItems.map((item, index) => ({
//         ...item,
//         price: response.data.cartItems[index].memberPrice, // Map the new member prices
//       }));

//       // Update cartItems in the state
//       resetCart(updatedCartItems);
  
//     }

   
//   };

  // Define the logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('billingInfo');

    sessionStorage.removeItem('showDifferentAddress');
   
  };

  // Provide the authentication state and functions to children components
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
