// StockImage.jsx
import React, { useState, useEffect } from 'react';
import { Image, Button, notification, Spin } from 'antd';
import axios from 'axios';

const StockImage = ({ description1, storeId, stockId, onApplyImage, shouldUseStockImage }) => {
  const [fetchedImageUrl, setFetchedImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [fetchImageError, setFetchImageError] = useState(false);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  // Function to fetch image from Google Custom Search API
  const fetchImageFromGoogle = async (query) => {
    setLoadingImage(true);
    setFetchImageError(false);
    
    try {
      await delay(2000); // Simulate network delay
      if (shouldUseStockImage) { // Only fetch if auto-fetch is enabled
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            q: query,
            searchType: 'image',
            cx: process.env.REACT_APP_GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
            key: process.env.REACT_APP_GOOGLE_API_KEY,
            num: 1,
          
          },
        });
        if (response.data.items && response.data.items.length > 0) {
          return response.data.items[0].link;
        } else {
          return null;
        }
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    } finally {
      setLoadingImage(false);
    }
  };

  // Handler to apply the fetched image as Base64
  const handleApplyImage = async () => {
    if (fetchedImageUrl) {
      try {
        const base64Image = await convertImageUrlToBase64(fetchedImageUrl);
        onApplyImage(base64Image); // Pass Base64 string to parent
      } catch (error) {
        console.error('Error converting image to Base64:', error);
      }
    }
  };

  const convertImageUrlToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      axios
        .get(url, { responseType: 'blob' })
        .then((response) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result.split(',')[1]); // Extract Base64 string without the data prefix
          };
          reader.onerror = () => {
            reject(new Error('Failed to convert image to Base64.'));
          };
          reader.readAsDataURL(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  useEffect(() => {
    const fetchAndSetImage = async () => {
      
      const fetchedUrl = await fetchImageFromGoogle(description1);
      if (fetchedUrl) {
        setFetchedImageUrl(fetchedUrl);
      } else {
        setFetchImageError(true);
      }
    };

    if (shouldUseStockImage) {
      fetchAndSetImage();
    }
  }, [shouldUseStockImage, description1]);

  return (
    <div>
      {loadingImage && <Spin size="small" style={{ marginRight: 10 }} />}
      
      {fetchedImageUrl ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image width={50} src={fetchedImageUrl} alt="Fetched from Google" />
          <Button type="link" onClick={handleApplyImage} style={{ marginLeft: 8 }}>
            Apply
          </Button>
        </div>
      ) : (
        fetchImageError && <p style={{ color: 'red' }}>Failed to fetch image from Google.</p>
      )}
    </div>
  );
};

export default StockImage;
