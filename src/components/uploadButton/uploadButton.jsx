import React, { useState, useEffect } from 'react';
import { Upload, Button, Image, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadButton = ({ storeId, stockId, onUploadSuccess }) => {
  const [imageExists, setImageExists] = useState(true);
  const [version, setVersion] = useState(0); // For cache busting
  const [loading, setLoading] = useState(false);

  // Construct the image URL with a version query parameter to prevent caching
  const imageUrl = `${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${stockId}.jpg?v=${version}`;

  const uploadProps = {
    name: 'file',
    accept: '.jpg, .jpeg',
    // Remove the 'action' property since we'll handle the upload manually
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}`,
    },
    beforeUpload: (file) => {
      const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg';
      if (!isJpg) {
        message.error('You can only upload JPG files!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5; // 5MB limit
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
      }
      return isJpg && isLt5M;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]; // Remove the data prefix
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/uploadStockImage`,
            {
              storeId,
              stockId,
              image: base64,
            },
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.success) {
            message.success(`${file.name} uploaded successfully.`);
            setVersion((prev) => prev + 1); // Update version to refresh image if needed
            setLoading(false);
            if (onUploadSuccess) {
              onUploadSuccess();
            }
            onSuccess(response.data);
          } else {
            message.error(`${file.name} upload failed.`);
            setLoading(false);
            onError(new Error(response.data.message));
          }
        } catch (error) {
          console.error(error);
          message.error(`${file.name} upload failed.`);
          setLoading(false);
          onError(error);
        }
      };
      reader.onerror = (error) => {
        console.error('File reading has failed:', error);
        message.error('Failed to read file!');
        setLoading(false);
        onError(error);
      };
    },
    showUploadList: false, // Hide the default upload list
  };

  return (
    <div  style={{ display: 'flex', alignItems: 'center', gap: '8px'  }}>
      {/* 使用 Ant Design 的 Image 组件进行图片预览和放大 */}
      {imageExists && (
        <Image
          width={50}
          src={imageUrl}
          alt="Stock Item"
          
          onError={() => setImageExists(false)} // 如果图片加载失败
          preview={true}    // 只在点击时启用预览
        />
      )}

      {loading && <Spin size="small" style={{ marginLeft: 10 }} />}
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    </div>
  );
};

export default UploadButton;
