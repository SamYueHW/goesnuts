import React, { useEffect, useState, useRef, forwardRef } from 'react';
import axios from 'axios';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogIn } from 'lucide-react';

const Header = forwardRef(({ cartItems, total, removeFromCart, updateCartQuantity, storeId }, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const cartContentRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const navigate = useNavigate();
  useEffect(() => {
    if (cartItems.length === 0) {
      setCartOpen(false);
    }

    const handleClickOutside = (event) => {
      if (
        cartRef.current && !cartRef.current.contains(event.target) &&
        cartContentRef.current && !cartContentRef.current.contains(event.target)
      ) {
        setCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartItems]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleCart = () => {
    if (cartItems.length > 0) {
      setCartOpen(!cartOpen);
    }
  };
  const handleLogin = () => {
    if (isLoggedIn) {
      // Handle logout
      // You might want to call an API to log out the user
      setIsLoggedIn(false);
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + (isNaN(item.quantity) ? 0 : item.quantity), 0);
  };
  
  const handleCheckout = async () => {
    const storeUrl = JSON.parse(sessionStorage.getItem('storeUrl'));
    // 使用 navigate 来跳转到 checkout 页面
    navigate(`/checkout/${storeUrl}`);
  };

  return (
    <header className="header-section" ref={ref}>
      <div className="top-header">
        <div className="container">
          <div className="clear-fix">
            <ul className="float-left top-header-left">
              <li><a href="#"><i className="fa fa-map-marker" aria-hidden="true"></i>  7 Prestige Drive, Clayton South, VIC 3169</a></li>
              <li><a href="#"><i className="fa fa-envelope-o" aria-hidden="true"></i> changhongherbs@gmail.com</a></li>
            </ul>
            <ul className="float-right top-header-right">
              <li><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></li>
              <li><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></li>
              <li><a href="#"><i className="fa fa-pinterest-p" aria-hidden="true"></i></a></li>
              <li><a href="#"><i className="fa fa-google" aria-hidden="true"></i></a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="theme-main-menu" id="theme-main-menu">
        <div className="container">
          <div className="main-menu clear-fix">
            <div className="search-button-content float-right">
              <button ref={cartRef} className="cart tran3s" onClick={toggleCart}>
                <i className="fa fa-shopping-bag" aria-hidden="true"></i> <span>{getTotalItems()}</span>
              </button>

              <div ref={cartContentRef} className={`shopping-cart-content ${cartOpen ? 'show' : ''}`} id="shopping-cart-content">
                <div className="shopping-cart-top">
                  <h4>Your Cart</h4>
                  <a className="cart-close" href="#" onClick={toggleCart}><i className="la la-close"></i></a>
                </div>
                <ul id="cart-items">
                  {cartItems.map((item, index) => (
                    <li key={index} className="single-shopping-cart">
                      <div className="shopping-cart-img">
                        <a href="#"><img alt="" src={item.imgSrc} /></a>
                      </div>
                      <div className="shopping-cart-title">
                        <h4><a href="#">{item.name}</a></h4>
                        <div className="quantity-price">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => updateCartQuantity(index, parseInt(e.target.value, 10))} 
                            className="quantity-input" style={{width: '50px', height: '30px'}}
                          /> x ${item.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="shopping-cart-delete">
                        <a href="#" onClick={() => removeFromCart(index)}><i className="la la-trash"></i></a>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="shopping-cart-bottom">
                  <div className="shopping-cart-total">
                    <h4>Subtotal <span className="shop-total">${total.toFixed(2)}</span></h4>
                  </div>
                  <div className="shopping-cart-btn btn-hover default-btn text-center">
                    <a className="red-color"onClick={handleCheckout}>Continue to Checkout</a>
                  </div>
                </div>
              </div>
            </div>
        
            <div className="them-logo"><a href="#"><img 
              src={`${process.env.REACT_APP_SERVER_URL}/images/them-logo/them-main-logo-1.jpg`} 
              alt="logo" 
            /></a></div>
            <div className="navbar">
              <div className="navbar-header">
                <button onClick={toggleMenu} className="navbar-toggle">
                  <span className="material-symbols-outlined" style={{color:"#59ab02a6"}}>menu</span>
                </button>
              </div>
              <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`}>
                <ul className="navbar-nav">
                  <li><a href='http://159.196.75.52:3000/home.html'>Home</a></li>
                  <li><a href="./shop">Shop</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
