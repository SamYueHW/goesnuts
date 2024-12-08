import React from 'react';
import './Cart.scss';

const Cart = ({ cartItems, total, removeFromCart }) => {
  return (
    <div className="shopping-cart-content" id="shopping-cart-content" style={{ display: cartItems.length > 0 ? 'block' : 'none' }}>
      <div className="shopping-cart-top">
        <h4>Your Cart</h4>
        <a className="cart-close" href="#" id="cart-close"><i className="la la-close"></i></a>
      </div>
      <ul id="cart-items">
        {cartItems.map((item, index) => (
          <li key={index} className="single-shopping-cart">
            <div className="shopping-cart-img">
              <a href="#"><img alt="" src={item.imgSrc} /></a>
              <div className="item-close">
                <a href="#" onClick={() => removeFromCart(item)}><i className="sli sli-close"></i></a>
              </div>
            </div>
            <div className="shopping-cart-title">
              <h4><a href="#">{item.name}</a></h4>
              <span>${item.price.toFixed(2)}</span>
            </div>
            <div className="shopping-cart-delete">
              <a href="#" onClick={() => removeFromCart(item)}><i className="la la-trash"></i></a>
            </div>
          </li>
        ))}
      </ul>
      <div className="shopping-cart-bottom">
        <div className="shopping-cart-total">
          <h4>Subtotal <span className="shop-total">${total.toFixed(2)}</span></h4>
        </div>
        <div className="shopping-cart-btn btn-hover default-btn text-center">
          <a className="red-color" href="#">Continue to Checkout</a>
        </div>
      </div>
    </div>
  );
};

export default Cart;
