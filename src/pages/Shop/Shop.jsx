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

  // **状态定义**
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const shopState = sessionStorage.getItem('shopState');
    if (shopState) {
      try {
        const parsedShopState = JSON.parse(shopState);
        return parsedShopState.currentPage || 1;
      } catch (error) {
        console.error('Error parsing shopState from sessionStorage:', error);
      }
    }
    return 1;
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const shopState = sessionStorage.getItem('shopState');
    if (shopState) {
      try {
        const parsedShopState = JSON.parse(shopState);
        return parsedShopState.selectedCategory || 'All';
      } catch (error) {
        console.error('Error parsing shopState from sessionStorage:', error);
      }
    }
    return 'All';
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    const shopState = sessionStorage.getItem('shopState');
    if (shopState) {
      try {
        const parsedShopState = JSON.parse(shopState);
        return parsedShopState.searchTerm || '';
      } catch (error) {
        console.error('Error parsing shopState from sessionStorage:', error);
      }
    }
    return '';
  });
  const [fullCategoryPopup, setFullCategoryPopup] = useState(false);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
  const productsPerPage = 21;
  const headerRef = useRef(null);
  const { storeUrl, category } = useParams();
  const [totalPages, setTotalPages] = useState(null);
  const [showMoreCategories, setShowMoreCategories] = useState(window.innerWidth <= 767 ? true : false);
  const [displayedCategories, setDisplayedCategories] = useGetState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [containerClass, setContainerClass] = useState('container');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(null);

  sessionStorage.setItem('storeUrl', storeUrl);

  // **设置容器类名以适配响应式设计**
  useEffect(() => {
    const handleResize = () => {
      setContainerClass(window.innerWidth <= 768 ? 'container1' : 'container');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveScrollPosition = () => {
    const scrollContainer = window.innerWidth <= 768 ? document.querySelector('.container1') : window;
    const scrollPosition = window.innerWidth <= 768 
      ? scrollContainer?.scrollTop 
      : window.scrollY;
    
    const state = { 
      currentPage, 
      searchTerm, 
      selectedCategory, 
      scrollPosition 
    };
    sessionStorage.setItem('shopState', JSON.stringify(state));
    console.log('保存滚动位置:', scrollPosition);
  };

// 保留恢复滚动位置的useEffect
useEffect(() => {
  if (!isLoading && savedScrollPosition !== null && products.length > 0) {
    setTimeout(() => {
      if (window.innerWidth <= 768) {
        const container1 = document.querySelector('.container1');
        if (container1) {
          container1.scrollTop = savedScrollPosition;
          console.log('手机端恢复滚动位置:', savedScrollPosition);
        }
      } else {
        window.scrollTo(0, savedScrollPosition);
        console.log('电脑端恢复滚动位置:', savedScrollPosition);
      }
      setSavedScrollPosition(null);
    }, 100);
  }
  else{
    console.log(isLoading, savedScrollPosition, products)
  }
}, [isLoading, savedScrollPosition, products]);

  // **恢复状态和滚动位置**
  useEffect(() => {
    const savedState = sessionStorage.getItem('shopState');
    if (savedState) {
      const { currentPage, searchTerm, selectedCategory, scrollPosition } = JSON.parse(savedState);
      setCurrentPage(currentPage || 1);
      setSearchTerm(searchTerm || '');
      setSelectedCategory(selectedCategory || 'All');
      setSearchInput(searchTerm || '');
      setSavedScrollPosition(scrollPosition || 0);
     
    }
  }, []);

  // **在产品加载完成后恢复滚动位置**
  useEffect(() => {
    if (!isLoading && savedScrollPosition !== null && products.length > 0) {
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          const container1 = document.querySelector('.container1');
          if (container1) {
            container1.scrollTop = savedScrollPosition;
            console.log('手机端恢复滚动位置:', savedScrollPosition);
          } else {
            console.error('未找到 .container1');
          }
        } else {
          window.scrollTo(0, savedScrollPosition);
          console.log('电脑端恢复滚动位置:', savedScrollPosition);
        }
        setSavedScrollPosition(null);
      }, 100); // 延迟 100ms 确保 DOM 渲染完成
    }
  }, [isLoading, savedScrollPosition, products]);

  // **页面、分类或搜索变化时滚动到顶部**
  const scrollToTop = () => {
    if (window.innerWidth <= 768) {
      const container1 = document.querySelector('.container1');
      if (container1) container1.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [currentPage, selectedCategory, searchTerm]);

  // **处理分页**
  const handlePageChange = (newPage) => {
    const shopState = { currentPage: newPage, searchTerm, selectedCategory, scrollPosition: 0 };
    sessionStorage.setItem('shopState', JSON.stringify(shopState));
    setCurrentPage(newPage);
  };

  // **渲染分页控件**
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 6;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (currentPage > 1) {
      pages.push(
        <li key="prev">
          <a className="prev" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}>
            <i className="la la-angle-left"></i>
          </a>
        </li>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} className={i === currentPage ? 'active' : ''}>
            {i < 10 ? `0${i}` : i}
          </a>
        </li>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <li key="next">
          <a className="next" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}>
            <i className="la la-angle-right"></i>
          </a>
        </li>
      );
    }

    return pages;
  };

  // **处理 Token 变化**
  useEffect(() => {
    const handleTokenChange = () => {
      setJwtToken(localStorage.getItem('jwtToken'));
    };
    window.addEventListener('storage', handleTokenChange);
    return () => window.removeEventListener('storage', handleTokenChange);
  }, []);

  // **获取分类和产品数据**
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchCategories/${storeUrl}`);
        if (response && response.data) {
        setCategories(['All', ...response.data.map((category) => category.Category)]);
        } else {
          console.error('获取分类数据格式不正确:', response);
          setCategories(['All']);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
        setCategories(['All']);
      }
    };

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchStockItems/${storeUrl}`, {
          params: { category: selectedCategory !== 'All' ? selectedCategory : 'All', search: searchTerm, page: currentPage, limit: productsPerPage },
          headers: { 'Authorization': `Bearer ${token || ''}` }
        });

        const data = itemStructureConverter(response.data.items, response.data.storeId, response.data.isMember);
        setStoreId(response.data.storeId);
        sessionStorage.setItem('storeId', response.data.storeId);
        setProducts(data);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('获取产品失败:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    function itemStructureConverter(rawData, storeId, isMember) {
      // Filter out disabled items (Enable === 0)
      return rawData
        .filter((item) => item.Enable !== 0)
        .map((item) => {
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
            outOfStock: item.OutOfStock === 1,
            PackSalesPrice: isMember ? item.MemberPackPrice : item.PackSalesPrice,
          };
        });
    }

    fetchCategories();
    fetchProducts();
  }, [selectedCategory, currentPage, storeUrl, storeId, jwtToken, searchTerm]);

  // **过滤和搜索功能**
  const filterProducts = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const searchProducts = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // **UI 交互处理**
  const toggleFullCategoryPopup = () => setFullCategoryPopup(!fullCategoryPopup);
  const handleCategoryClick = (category) => {
    filterProducts(category);
    setFullCategoryPopup(false);
  };
  const toggleShowMoreCategories = () => setShowMoreCategories(!showMoreCategories);
  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    const page_t1 = document.querySelector('.page_t1');
    if (!showSearchInput) {
      page_t1.style.boxShadow = '0px 2px 5px -2px #0c140e2e';
    } else {
      page_t1.style.boxShadow = '0px 4px 5px -2px #0c140e2e';
    }
  };
  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    searchProducts(term);
    setShowSearchInput(false);
  };

  // 添加处理搜索框变化的函数
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // 当搜索栏为空时，自动清空searchTerm并更新session，并执行搜索
    if (!value.trim()) {
      setSearchTerm('');
      searchProducts('');
      const shopState = { 
        currentPage, 
        searchTerm: '', 
        selectedCategory, 
        scrollPosition: 0 
      };
      sessionStorage.setItem('shopState', JSON.stringify(shopState));
    }
  };

  useEffect(() => {
    if (window.innerWidth <= 767 && selectedCategory) {
      const selectedCategoryId = document.getElementById(`page_t1-category-${selectedCategory}`);
      if (selectedCategoryId) {
        setTimeout(() => {
          selectedCategoryId.classList.add('active');
          selectedCategoryId.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    setDisplayedCategories(showMoreCategories ? categories : categories.slice(0, 11));
    const icon_popup = document.querySelector('.icon_popup');
    if (icon_popup) icon_popup.style.height = 'auto';
  }, [categories, showMoreCategories]);

  // 确保搜索功能在生产环境中正常工作
  useEffect(() => {
    // 当页面初始加载时，如果searchTerm为空，尝试执行一次空搜索
    if (searchTerm === '' && products.length === 0 && !isLoading) {
      console.log('执行初始空搜索...');
      searchProducts('');
    }
  }, [isLoading]);

  // **骨架屏组件**
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

  // **渲染 JSX**
  return (
    <div>
      <Header refreshPage={() => window.location.reload()} />
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
                <li key={cat} id={`page_t1-category-${cat}`} className={cat === selectedCategory ? 'active' : ''} onClick={() => handleCategoryClick(cat)}>
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
                  <div key={cat} id={`icon_popup-category-${cat}`} className={`cell_item ${cat === selectedCategory ? 'active' : ''}`} onClick={() => handleCategoryClick(cat)}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
            <div className="search-icon">
              <img src="/images/search.svg" onClick={toggleSearchInput} alt="Search" />
            </div>
          </div>
        </div>
        {showSearchInput && (
          <div className="mobile-search">
            <form onSubmit={handleMobileSearchSubmit}>
              <input type="text" placeholder="Keyword or Product Code" value={searchInput} onChange={handleSearchInputChange} />
              <button type="submit"><i className="la la-search"></i></button>
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
                    <select onChange={(e) => {
                      const sorted = [...products];
                      if (e.target.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
                      else if (e.target.value === 'price') sorted.sort((a, b) => a.price - b.price);
                      setProducts(sorted);
                    }}>
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
                        Array.from({ length: productsPerPage }).map((_, index) => <ProductSkeleton key={index} />)
                      ) : products.length > 0 ? (
                        products.map(product => (
                          <div key={product.id} className="col-lg-4 col-md-4 col-sm-6 col-6" data-category={product.category}>
                            <div className="product-wrap mb-35">
                              <div className="product-img mb-15 skeleton" style={{ position: 'relative' }}>
                                <Link to={`${process.env.REACT_APP_FONT_ONLINEORDER_URL}/shop/${storeUrl}/product-details/${encodeURIComponent(product.id)}/${encodeURIComponent(product.name)}`} state={{ fromShop: true }}
                                onClick={() => {
                                  // 在点击时保存状态
                                  saveScrollPosition();
                                }}>
                                  <img
                                    src={product.imgSrc}
                                    alt="product"
                                    className="skeleton-image"
                                    draggable="false"
                                    onContextMenu={(e) => e.preventDefault()}
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
                                {product.outOfStock && (
                                  <div className="out-of-stock-overlay">
                                    <span className="out-of-stock-text">OUT OF STOCK</span>
                                  </div>
                                )}
                                {product.oldPrice && <span className="price-dec">-30%</span>}
                              </div>
                              <div className="product-content">
                                <h4>
                                  <a href={`${storeUrl}/product-details/${encodeURIComponent(product.id)}/${encodeURIComponent(product.name)}`}>
                                    {product.name}
                                  </a>
                                </h4>
                                <div className="price-addtocart">
                                  <div className="product-price">
                                    <span>{product.PackSalesPrice ? `from $${Math.min(product.price, product.PackSalesPrice).toFixed(2)}` : `$${product.price.toFixed(2)}`}</span>
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
                        <ul>{renderPagination()}</ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="sidebar-wrapper">
                <div className="sidebar-widget">
                  <h4 className="sidebar-title">Search</h4>
                  <div className="sidebar-search mb-40 mt-20">
                    <form className="sidebar-search-form" onSubmit={(e) => { e.preventDefault(); searchProducts(searchInput.trim()); }}>
                      <input type="text" placeholder="Keyword or Product Code" value={searchInput} onChange={handleSearchInputChange} />
                      <button type="submit"><i className="la la-search"></i></button>
                    </form>
                  </div>
                </div>
                <div className="sidebar-widget shop-sidebar-border pt-40">
                  <h4 className="sidebar-title">Shop By Categories</h4>
                  <div className="shop-catigory mt-20">
                    <ul id="faq">
                      {displayedCategories.map(cat => (
                        <li key={cat}>
                          <a href="#" onClick={(e) => { e.preventDefault(); filterProducts(cat); }} className={`category-link ${selectedCategory === cat ? 'selected' : ''}`}>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;