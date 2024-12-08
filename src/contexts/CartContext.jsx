// contexts/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

// 创建 CartContext
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = sessionStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  const [total, setTotal] = useState(() => {
 
    return cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  });

  // 持久化 cartItems 和 total 到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    const newTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
    sessionStorage.setItem('total', newTotal);
  }, [cartItems]);

  // 添加到购物车
  const addToCart = (newItem, addQuantity) => {
    
   
    setCartItems((prevCartItems) => {
      const existingIndex = prevCartItems.findIndex(
        (item) => item.id === newItem.id && item.type === newItem.type
      );

      if (existingIndex === -1) {
        newItem.quantity = addQuantity;
        // 如果不存在则添加新商品
        return [...prevCartItems, newItem];
      } else {
        // 存在则更新数量
        const updatedItems = [...prevCartItems];
        updatedItems[existingIndex].quantity += addQuantity;
        sessionStorage.setItem('cartItems', JSON.stringify(updatedItems));
        sessionStorage.setItem('total', updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
        return updatedItems;
      }
    });
  };

  // 更新购物车中商品的数量
  const updateCartQuantity = (id, type, quantity) => {
 
    if (quantity === 0 ) {
    // if (quantity === 0 ) {
      removeFromCart(id, type);
      return;
    }
    if (Number.isNaN(quantity)){
      setCartItems((prevCartItems) => {
        return prevCartItems.map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: 1 }
            : item
        );
      });
      return;
    }
    setCartItems((prevCartItems) => {
      return prevCartItems.map((item) =>
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      );
    });
  };

  // 从购物车中移除商品
  const removeFromCart = (id, type) => {
    
    setCartItems((prevCartItems) => prevCartItems.filter((item) => !(item.id === id && item.type === type)));
  };

  // 清空购物车
  const clearCart = () => {
    setCartItems([]);

  };

  const resetCart = (newCartItems) => {
    
    setCartItems(newCartItems);
    sessionStorage.setItem('cartItems', JSON.stringify(newCartItems));
    const newTotal = newCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
    sessionStorage.setItem('total', newTotal);


  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        resetCart,
    
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
