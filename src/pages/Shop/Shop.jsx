import React, { useState, useEffect, useRef } from 'react';
import useGetState from '../../components/hooks/useGetState';
import Header from '../../components/Headers/Header';
import './Shop.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

import { CartContext } from '../../contexts/CartContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';



const Shop = () => {



  const { cartItems, total, updateCartQuantity, removeFromCart, addToCart } = useContext(CartContext);

  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    // 从 sessionStorage 获取 shopState
    const shopState = sessionStorage.getItem('shopState');
    if (shopState) {
        try {
            // 解析 shopState JSON 字符串
            const parsedShopState = JSON.parse(shopState);
            // 返回 selectedCategory，如果没有则默认 'All'
            return parsedShopState.currentPage || 1;
        } catch (error) {
            console.error('Error parsing shopState from sessionStorage:', error);
        }
    }
    return 1; // 默认值
});
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // 从 sessionStorage 获取 shopState
    const shopState = sessionStorage.getItem('shopState');
    if (shopState) {
        try {
            // 解析 shopState JSON 字符串
            const parsedShopState = JSON.parse(shopState);
            // 返回 selectedCategory，如果没有则默认 'All'
            return parsedShopState.selectedCategory || 'All';
        } catch (error) {
            console.error('Error parsing shopState from sessionStorage:', error);
        }
    }
    return 'All'; // 默认值
});

const [searchTerm, setSearchTerm] = useState(() => {
  // 从 sessionStorage 获取 shopState
  const shopState = sessionStorage.getItem('shopState');
  if (shopState) {
      try {
          // 解析 shopState JSON 字符串
          const parsedShopState = JSON.parse(shopState);
          // 返回 searchTerm，如果没有则默认 ''
          return parsedShopState.searchTerm || '';
      } catch (error) {
          console.error('Error parsing shopState from sessionStorage:', error);
      }
  }
  return ''; // 默认值
});
  const [fullCategoryPopup, setFullCategoryPopup] = useState(false);
 
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));

  
  const productsPerPage = 21;
  const headerRef = useRef(null);
  const { storeUrl, category } = useParams();
  sessionStorage.setItem('storeUrl', storeUrl);
  const [totalPages, setTotalPages] = useState(null);
  const [showMoreCategories, setShowMoreCategories] = useState(window.innerWidth<=767 ? true : false);
  const [displayedCategories, setDisplayedCategories] = useGetState([]);

  const [totalItems, setTotalItems] = useState(0);

  const [containerClass, setContainerClass] = useState('container');

  // New state for managing the search input value
  const [searchInput, setSearchInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // New state for managing mobile search input visibility
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) { // Adjust this width as needed for mobile screens
        setContainerClass('container1');
      } else {
        setContainerClass('container');
      }
    };

    // Run once to set the initial class
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (category) {
     
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const savedState = sessionStorage.getItem('shopState');
    if (savedState) {
      const { currentPage, searchTerm, selectedCategory, scrollPosition } = JSON.parse(savedState);
      
      setCurrentPage(currentPage || 1);
      setSearchTerm(searchTerm || '');
      setSelectedCategory(selectedCategory || 'All');
      setSearchInput(searchTerm || '');
  
      // 恢复滚动位置
      if (scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition); 
        }, 100); 
      }
    }
  }, []);
  

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY; // 获取垂直滚动位置
      const state = {
        currentPage,
        searchTerm,
        selectedCategory,
        scrollPosition, // 保存滚动位置
      };
      sessionStorage.setItem('shopState', JSON.stringify(state));
    };
  
    window.addEventListener('scroll', handleScroll); // 添加滚动监听
  
    return () => {
      window.removeEventListener('scroll', handleScroll); // 清理监听器
    };
  }, [currentPage, searchTerm, selectedCategory]);
  
    

  // Render pagination controls (unchanged)
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 6;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (currentPage > 1) {
      pages.push(
        <li key="prev">
          <a
            className="prev"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          >
            <i className="la la-angle-left"></i>
          </a>
        </li>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            className={i === currentPage ? 'active' : ''}
          >
            {i < 10 ? `0${i}` : i}
          </a>
        </li>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <li key="next">
          <a
            className="next"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          >
            <i className="la la-angle-right"></i>
          </a>
        </li>
      );
    }

    return pages;
  };


  // Listen to changes in localStorage for jwtToken
  useEffect(() => {
    const handleTokenChange = () => {
      setJwtToken(localStorage.getItem('jwtToken')); // Update jwtToken state
    };
  
    window.addEventListener('storage', handleTokenChange);
  
    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);
  
  // Fetch categories and products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchCategories/${storeUrl}`);
        setCategories(['All', ...response.data.map((category) => category.Category)]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchProducts = async () => {
      setIsLoading(true); // Start loading
      try {
        // window.scrollTo({ top: 0, behavior: 'smooth' });

        const token = localStorage.getItem('jwtToken');

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/fetchStockItems/${storeUrl}`,
          {
            params: {
              category: selectedCategory !== 'All' ? selectedCategory : 'All', // Adjust based on backend expectations
              search: searchTerm,
              page: currentPage,
              limit: productsPerPage,
            },
            headers: {
              'Authorization': `Bearer ${token || ''}`
            }
          }
        );
       
        const data = itemStructureConverter(response.data.items, response.data.storeId, response.data.isMember);
        setStoreId(response.data.storeId);
        sessionStorage.setItem('storeId', response.data.storeId);
        
      
        setProducts(data);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        //delay 0.5s
        setTimeout(() => {
          setIsLoading(false); // End loading
        }, 300);
    
      }
    };

    function itemStructureConverter(rawData, storeId, isMember) {
      return rawData.map((item) => {
        const imgSrc = `${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${item.StockId}.jpg`;
      
        return {
          id: item.StockId,
          StockOnlineId: item.StockOnlineId,
          name: item.Description1,
          name2: item.Description2,
          name3: item.Description3,
          name4: item.Description4,
          category: item.Category,
          price: isMember ? item.MemberPrice : item.SalesPrice,
          GSTRate: item.GSTRate,
          imgSrc: imgSrc,
          notes: item.Notes,
          oldPrice: null,
          outOfStock: item.Enable === 0,
        
          PackSalesPrice: isMember? item.MemberPackPrice : item.PackSalesPrice,
       

        };
      });
    }

    fetchCategories();
    fetchProducts();
    

  }, [selectedCategory, currentPage, storeUrl, storeId, jwtToken, searchTerm]);

  // Filter products by category (unchanged)
  const filterProducts = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // setSearchTerm(''); 
    // setSearchInput('');
  };

  // Sort products (unchanged)
  const sortProducts = (criteria) => {
    const sortedProducts = [...products];
    if (criteria === 'name') {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === 'price') {
      sortedProducts.sort((a, b) => a.price - b.price);
    }
    setProducts(sortedProducts);
  };

  // Search products (modified)
  const searchProducts = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Toggle full category popup (unchanged)
  const toggleFullCategoryPopup = () => {
    setFullCategoryPopup(!fullCategoryPopup);
    
  };

  // Handle category click (unchanged)
  const handleCategoryClick = (category) => {
    filterProducts(category);
    setFullCategoryPopup(false);
  };

  // Toggle show more categories (modified)
  const toggleShowMoreCategories = () => {
    setShowMoreCategories(!showMoreCategories);
  };

  // Toggle the visibility of the search input
  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    //change box shadow of page_t1
    const page_t1 = document.getElementsByClassName('page_t1')[0];
    if (!showSearchInput) {
      page_t1.style.boxShadow = '0px 2px 5px -2px #0c140e2e';
    } else {
      page_t1.style.boxShadow = '0px 4px 5px -2px #0c140e2e';
    }
  };

  //if mobile phone 767px, set page_t1-category-All id to class active
  useEffect(() => {
    if (window.innerWidth <= 767) {
      
   
       if (selectedCategory){
        const selectedCategoryName = 'page_t1-category-' + selectedCategory;
       const selectedCategoryId = document.getElementById(selectedCategoryName);

       if (selectedCategoryId) {
          setTimeout(() => {
              selectedCategoryId.classList.add('active');
              //scroll to selected category
              selectedCategoryId.scrollIntoView({ behavior: 'smooth',  block: 'nearest' });
          }, 200); // 延迟 100 毫秒执行
       }
    }
    }
 }, [selectedCategory,category]);
 
  // Handle search submission from the mobile search input
  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    searchProducts(term);
    setShowSearchInput(false); // Optionally hide the search input after searching
  };

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  // Determine which categories to display based on `showMoreCategories` state
  useEffect(() => {
  
    setDisplayedCategories(showMoreCategories ? categories : categories.slice(0, 11));
    //reset height .icon_popup.show
    const icon_popup = document.getElementsByClassName('icon_popup')[0];
    if (icon_popup) {
      icon_popup.style.height = 'auto';
    }
   
  }, [categories, showMoreCategories]);



  // Skeleton component
  const ProductSkeleton = () => (
    <div className="col-lg-4 col-md-4 col-sm-6 col-6">
      <div className="product-wrap mb-35">
        <div className="product-img mb-15 skeleton" style={{ height: '200px', backgroundColor: '#e0e0e0' }}></div>
        <div className="product-content">
          <h4 style={{ height: '20px', backgroundColor: '#e0e0e0', marginBottom: '10px' }}></h4>
          <div className="price-addtocart">
            <div className="product-price" style={{ height: '20px', backgroundColor: '#e0e0e0', width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Header
        
       
        refreshPage={() => window.location.reload()}
      />

      <section className="">
        <div className="inner-banner-bottom">
          <div className="container">
            <ul>
              <li><a href="/">Home</a></li>
              <li><span>/</span></li>
              <li><a href="/shop">Shop</a></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="shop-area pt-90 pb-90">
        <div className='page_t1'>
          <div className="box">
            <ul>
              {displayedCategories.map(cat => (
                <li
                  key={cat}
                  id={`page_t1-category-${cat}`}
                  className={cat === selectedCategory ? 'active' : ''}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <div className="icon">
            <img src="/images/icon8.svg" id="btn2" onClick={toggleFullCategoryPopup} alt="Toggle Categories" />
            <div className={`icon_popup ${fullCategoryPopup ? 'show' : ''}`}>
              <div className="head">
                <span>Full Category</span>
                <img src="/images/icon3.svg" id="btn3" onClick={toggleFullCategoryPopup} alt="Close Categories" />
              </div>
              <div className="body">
                {displayedCategories.map(cat => (
                  <div
                    key={cat}
                    id={`icon_popup-category-${cat}`}
                    className={`cell_item ${cat === selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
            <div className="search-icon">
            <img src="/images/search.svg" onClick={toggleSearchInput} alt="Search" />
          </div>
          </div>
          {/* New Search Icon */}
          
        </div>
        {/* Conditional Rendering of Mobile Search Input */}
        {showSearchInput && (
          <div className="mobile-search">
            <form onSubmit={handleMobileSearchSubmit}>
              <input
                type="text"
                placeholder="Keyword or Product Code"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit">
                <i className="la la-search"></i>
              </button>
            </form>
          </div>
        )}
        <div className={containerClass}>
          <div className="row flex-row-reverse">
            <div className="col-lg-9">
              <div className="shop-topbar-wrapper">
                <div className="shop-topbar-left">
                  <p>
                    Showing {(currentPage - 1) * productsPerPage + 1} - {currentPage * productsPerPage > totalItems ? totalItems : currentPage * productsPerPage} of {totalItems} results
                  </p>
                </div>
                <div className="product-sorting-wrapper">
                  <div className="product-show shorting-style">
                    <label>Sort by:</label>
                    <select onChange={(e) => sortProducts(e.target.value)}>
                      <option value="default">Default</option>
                      <option value="name">Name (A - Z)</option>
                      <option value="price">Price (low - high)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="shop-bottom-area">
                <div className="tab-content jump">
                  <div id="shop-1" className="tab-pane active">
                    <div className="row">
                      {isLoading ? (
                        Array.from({ length: productsPerPage }).map((_, index) => (
                          <ProductSkeleton key={index} />
                        ))
                      ) : products.length > 0 ? (
                        products.map(product => (
                          <div key={product.id} className="col-lg-4 col-md-4 col-sm-6 col-6" data-category={product.category}>
                            <div className="product-wrap mb-35">
                              <div className="product-img mb-15 skeleton" style={{ position: 'relative' }}>
                                {/* <a href={`/product-details/${encodeURIComponent(product.id)}/${encodeURIComponent(product.name)}`}> */}
                                <Link
  to={`/product-details/${encodeURIComponent(product.id)}/${encodeURIComponent(product.name)}`}
  state={{ fromShop: true }}
>


                                  <img
                                    src={product.imgSrc}
                                    alt="product"
                                    className="skeleton-image"
                                    draggable="false" // 禁用拖拽
                                    onContextMenu={(e) => e.preventDefault()} // 禁用右键菜单
                                    onLoad={(e) => {
                                      e.target.classList.remove('skeleton-image');
                                      e.target.parentElement.classList.remove('skeleton');
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/images/default-product-image.png';
                                    }}
                                  />
                                 
                                  </Link>
                                {product.oldPrice && <span className="price-dec">-30%</span>}
                                {/* <div className="product-action">
                                  <a
                                    data-toggle="modal"
                                    data-target="#exampleModal"
                                    title="Add To Cart"
                                    onClick={() => addToCart(product.id)}
                                  >
                                    <i className="la la-plus"></i>
                                  </a>
                                </div> */}
                              </div>
                              <div className="product-content">
                                <h4>
                                  <a href={`/product-details/${encodeURIComponent(product.id)}/${encodeURIComponent(product.name)}`}>
                                    {product.name}
                                  </a>
                                </h4>
                                <div className="price-addtocart">
                                  <div className="product-price">
                                  <span>
                                  { 
                                    product.PackSalesPrice 
                                      ? `from $${Math.min(product.price, product.PackSalesPrice).toFixed(2)}` 
                                      : `$${product.price.toFixed(2)}` 
                                  }

                                  </span>

                                    {product.oldPrice && <span className="old">${product.oldPrice.toFixed(2)}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center mt-5">
                          <div className="custom-alert">
                            <p>No products found for the selected category.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {products.length > 0 && !isLoading && (
                      <div className="pagination-style text-center">
                        <ul>
                          {renderPagination()}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="sidebar-wrapper">
                <div className="sidebar-widget">
                  <h4 className="sidebar-title">Search</h4>
                  <div className="sidebar-search mb-40 mt-20">
                    <form
                      className="sidebar-search-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const term = searchInput.trim();
                        searchProducts(term);
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Keyword or Product Code"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <button type="submit">
                        <i className="la la-search"></i>
                      </button>
                    </form>
                  </div>
                </div>
                <div className="sidebar-widget shop-sidebar-border pt-40">
                  <h4 className="sidebar-title">Shop By Categories</h4>
                  <div className="shop-catigory mt-20">
                    <ul id="faq">
                      {displayedCategories.map(cat => (
                        <li key={cat}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              filterProducts(cat);
                            }}
                            className={`category-link ${selectedCategory === cat ? 'selected' : ''}`}
                          >
                            {cat}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {categories.length > 11 && (
                    <div className="text-center mt-10">
                      <button className="btn btn-link" onClick={toggleShowMoreCategories}>
                        {showMoreCategories ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* End of Sidebar */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
