import React, { useEffect, useState } from "react";
import { Breadcrumb, message } from "antd"; // Importing 'message' from 'antd'
import { HomeOutlined } from "@ant-design/icons";
import Header from "../../components/Headers/Header";
import "./contactUs.css";
import axios from "axios";
import { useParams } from 'react-router-dom';

const ContactUs = () => {
  const { storeUrl } = useParams();
  sessionStorage.setItem('storeUrl', storeUrl);
  const [storeTimeTable, setStoreTimeTable] = useState([]);
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhoneNumber, setStorePhoneNumber] = useState("");
  const [storeEmail, setStoreEmail] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (time) => {
    if (!time) return "Closed";
    const [hour, minute] = time.split(":");
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${hour12}:${minute} ${ampm}`;
  };
  
  const generateBusinessHours = (storeData) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  
    const formattedHours = days.map((day) => {
      const start = storeData[`${day}Start`];
      const end = storeData[`${day}End`];
      const breakStart = storeData[`${day}BreakStart`];
      const breakEnd = storeData[`${day}BreakEnd`];
  
      if (breakStart && breakEnd) {
        return {
          day,
          hours: `${formatTime(start)} - ${formatTime(breakStart)} & ${formatTime(breakEnd)} - ${formatTime(end)}`,
        };
      }
  
      if (start && end) {
        return {
          day,
          hours: `${formatTime(start)} - ${formatTime(end)}`,
        };
      }
  
      return {
        day,
        hours: "Closed",
      };
    });
  
    // Combine consecutive days with the same hours
    const groupedHours = [];
    let currentGroup = { startDay: "", endDay: "", hours: "" };
  
    formattedHours.forEach((item, index) => {
      if (!currentGroup.startDay) {
        // Initialize group
        currentGroup = { startDay: item.day, endDay: item.day, hours: item.hours };
      } else if (currentGroup.hours === item.hours) {
        // Extend group if hours are the same
        currentGroup.endDay = item.day;
      } else {
        // Finalize current group and start a new one
        groupedHours.push({ ...currentGroup });
        currentGroup = { startDay: item.day, endDay: item.day, hours: item.hours };
      }
  
      // Push the last group at the end
      if (index === formattedHours.length - 1) {
        groupedHours.push({ ...currentGroup });
      }
    });
  
    // Format the grouped hours for display
    return groupedHours.map((group) => {
      if (group.startDay === group.endDay) {
        return `${group.startDay}: ${group.hours}`;
      } else {
        return `${group.startDay} - ${group.endDay}: ${group.hours}`;
      }
    });
  };
  

  useEffect(() => {
    const fetchStoreConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/store-config`, { params: { storeUrl: storeUrl } }
        );
        if (response.status === 200) {
          const businessHours = generateBusinessHours(response.data);
          setStoreTimeTable(businessHours);
          setStoreAddress(response.data.StoreAddress);
          setStorePhoneNumber(response.data.StorePhone);
          setStoreEmail(response.data.RecipientEmail);
        } 
      } catch (error) {
        console.error(error);
        message.error("Failed to load store configuration.");
      }
    };
    fetchStoreConfig();
  }, [storeUrl]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const { name, email, phone, message: userMessage } = formData;
    if (!name || !email || !phone || !userMessage) {
      message.error("All fields are required.");
      return;
    }

    if (name.length > 100 || email.length > 100 || phone.length > 20 || userMessage.length > 1000) {
      message.error("Input exceeds maximum length.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error("Invalid email format.");
      return;
    }

    const phoneRegex = /^[0-9\-+() ]+$/;
    if (!phoneRegex.test(phone)) {
      message.error("Invalid phone number format.");
      return;
    }

    const finalformData = { ...formData, storeUrl: storeUrl };
    setIsSubmitting(true); // Start submission

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/contactUs`, finalformData);
      if (response.data.success) {
        message.success(response.data.message);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        message.error(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false); // End submission
    }
  };

  return (
    <div className="contact-us-page">
      {/* Header */}
      <Header />

      <div className="header-spacer" style={{ height: "95px" }}></div>

      {/* Contact Us Container */}
      <div className="contact-us-container">
        <div className="container">
          <div className="breadcrumb-wrapper">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a href="/">
                  <HomeOutlined />
                  <span style={{ marginLeft: "6px" }}>Home</span>
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Contact Us</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* Main Content */}
          <div className="main-content-wrapper" style={{ padding: "20px 15px" }}>
            <div className="page-content-inner">
              <div className="contact-us-content">
                <h1>Contact Us</h1>

                <div className="contact-info-grid">
                  {/* Phone Number */}
                  <div className="contact-item">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <h3 className="contact-title">Phone Number</h3>
                    <div className="contact-content">{storePhoneNumber}</div>
                  </div>

                  {/* Email */}
                  <div className="contact-item">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <h3 className="contact-title">Email</h3>
                    <div className="contact-content">{storeEmail}</div>
                  </div>

                  {/* Location */}
                  <div className="contact-item">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21s-8-4.5-8-11a8 8 0 1 1 16 0c0 6.5-8 11-8 11z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <h3 className="contact-title">Location</h3>
                    <div className="contact-content">{storeAddress}</div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="contact-item">
                  <span className="visit-title">Visit Our Store</span>
                  <span className="visit-business-title"> Business Hours</span>
                  
                  <div className="contact-content business-hours">
                    {storeTimeTable.map((time, index) => (
                      <p key={index}>{time}</p>
                    ))}
                  </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-wrapper">
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <h2>Send us a message</h2>

                    {/* Name Field */}
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        placeholder="Your Name"
                        maxLength="30"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Email and Phone Fields on the Same Line */}
                    <div className="form-group row">
                      <div className="form-group-half">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="Your Email"
                          maxLength="50"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group-half">
                        <label htmlFor="phone">Contact Number</label>
                        <input
                          type="text"
                          id="phone"
                          placeholder="Your Phone Number"
                          maxLength="20"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        rows="5"
                        placeholder="Your Message"
                        maxLength="500"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
