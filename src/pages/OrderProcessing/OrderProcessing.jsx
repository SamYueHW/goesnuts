import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './orderProcessing.css';

const OrderProcessing = () => {
  const { storeUrl, encryptedOrderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, timeout, error
  const [elapsedTime, setElapsedTime] = useState(0);
  const [storeEmail, setStoreEmail] = useState('');

  const MAX_WAIT_TIME = 15000; // 15 seconds
  const POLL_INTERVAL = 2000; // 2 seconds

  useEffect(() => {
    let pollTimer;
    let elapsedTimer;
    let startTime = Date.now();

    const checkOrderStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/checkOrderStatus/${encryptedOrderId}`
        );

        if (response.data.success) {
          const { orderStatus, paid } = response.data;

          if (orderStatus === 'paid' && paid > 0) {
            setStatus('success');
            clearInterval(pollTimer);
            clearInterval(elapsedTimer);
            
            // Redirect to success page after a short delay
            setTimeout(() => {
              navigate(`/order-success/${storeUrl}/${encryptedOrderId}`);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    };

    // Start polling
    pollTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= MAX_WAIT_TIME) {
        setStatus('timeout');
        clearInterval(pollTimer);
        clearInterval(elapsedTimer);
      } else {
        checkOrderStatus();
      }
    }, POLL_INTERVAL);

    // Update elapsed time display
    elapsedTimer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    // Initial check
    checkOrderStatus();

    // Fetch store email for contact info
    const fetchStoreInfo = async () => {
      try {
        const storeId = sessionStorage.getItem('storeId');
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/fetchStoreConfig/${storeId}`
        );
        if (response.data.success) {
          setStoreEmail(response.data.storeConfig.RecipientEmail || '');
        }
      } catch (error) {
        console.error('Error fetching store info:', error);
      }
    };
    fetchStoreInfo();

    return () => {
      clearInterval(pollTimer);
      clearInterval(elapsedTimer);
    };
  }, [encryptedOrderId, navigate, storeUrl]);

  return (
    <div className="order-processing-container">
      {status === 'processing' && (
        <div className="processing-content">
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
          <h1 className="processing-title">Processing Your Payment</h1>
          <p className="processing-subtitle">
            Please wait while we confirm your payment...
          </p>
          <p className="processing-time">
            Elapsed time: {Math.floor(elapsedTime / 1000)}s
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="success-content">
          <div className="success-checkmark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="success-title">Payment Confirmed!</h1>
          <p className="success-subtitle">Redirecting to order details...</p>
        </div>
      )}

      {status === 'timeout' && (
        <div className="timeout-content">
          <div className="timeout-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="timeout-title">Payment Verification Timeout</h1>
          <p className="timeout-subtitle">
            We're still processing your payment. This may take a few more moments.
          </p>
          <div className="timeout-info">
            <p>
              If you've been charged, your order has been received and will be processed.
            </p>
            <p>
              Please contact the store if you have any concerns:
            </p>
            {storeEmail && (
              <p className="store-contact">
                <strong>Email:</strong> <a href={`mailto:${storeEmail}`}>{storeEmail}</a>
              </p>
            )}
          </div>
          <button 
            className="btn-back-to-shop"
            onClick={() => navigate(`/shop/${storeUrl}`)}
          >
            Back to Shop
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderProcessing;
