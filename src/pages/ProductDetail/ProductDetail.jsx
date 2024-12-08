import React, { useState, useContext, useEffect, useRef } from 'react';
import useGetState from '../../components/hooks/useGetState';
import Header from '../../components/Headers/Header';
import './main.css';
import './vendor.css';
import axios from 'axios';
import { Breadcrumb, Card, Row, Col, Spin } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import './ProductDetail.css';
import { CartContext } from '../../contexts/CartContext';

const { Meta } = Card;

const ProductDetail = () => {
    const { productId } = useParams();
    const { cartItems, total, updateCartQuantity, removeFromCart, addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [storeId, setStoreId] = useState(null);
   
    const [cartIndex, setCartIndex] = useState(null);

    const [storeUrl, setStoreUrl] = useState(sessionStorage.getItem('storeUrl'));
    const [quantity, setQuantity] = useState(1);

    const headerRef = useRef(null);

    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));

    const [mokeQuantity, setMokeQuantity] = useState(1);

    const [multiple, setMultiple] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [relatedProducts, setRelatedProducts] = useState([]); // 新的状态用于相关产品

    const [loading, setLoading] = useState(true);


    // 监听 localStorage 中 jwtToken 的变化
    useEffect(() => {
        const handleTokenChange = () => {
            setJwtToken(localStorage.getItem('jwtToken')); // 更新 jwtToken 状态
        };

        window.addEventListener('storage', handleTokenChange);

        return () => {
            window.removeEventListener('storage', handleTokenChange);
        };
    }, []);

    const handleSizeSelection = (type) => {
        setSelectedProduct({
            id: productId,
            quantity: mokeQuantity,
            GSTRate: product.GSTRate,
            stockOnlineId: product.StockOnlineId,
            name: product.Description1,
            imgSrc: `${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${product.StockId}.jpg`, // 确保模板字符串正确使用

            type: type,
            price: type === 0 ? product.SalesPrice : product.PackSalesPrice,
            subDescription: type === 0 ? product.SalesPriceSubDescription : product.PackSalesPriceSubDescription,
            deductQty: type === 0 ? product.SalesPriceDeductStockQty : product.PackSalesPriceDeductStockQty,
            priceId: type === 0 ? product.SalesPriceId : product.PackSalesPriceId,
            tagId: product.TagId,
            packTagId: product.PackTagId,
            weight: product.Weight,
            packWeight: product.PackWeight,
        });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const storeId = sessionStorage.getItem('storeId');
                setStoreId(storeId);
                const token = localStorage.getItem('jwtToken');
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchProductDetail/${storeId}/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token || ''}`,
                    },
                });
                if (response.status === 200) {
                    const data = response.data.product;
                    const related = response.data.relatedProducts;

              

                    if (response.data.isMember) {
                        if (data.MemberPrice !== 0) {
                            data.SalesPrice = data.MemberPrice;
                            data.PackSalesPrice = data.MemberPackPrice;

                            data.SalesPriceSubDescription = data.MemberPriceSubDescription;
                            data.PackSalesPriceSubDescription = data.MemberPackPriceSubDescription;

                            data.SalesPriceDeductStockQty = data.MemberPriceDeductStockQty;
                            data.PackSalesPriceDeductStockQty = data.MemberPackPriceDeductStockQty;

                            data.SalesPriceId = data.MemberPriceId;
                            data.PackSalesPriceId = data.MemberPackPriceId;

                            related.forEach((rel) => {
                                rel.SalesPrice = rel.MemberPrice;
                                rel.PackSalesPrice = rel.MemberPackPrice;
                            });
                        }
                    }
                    if (data.PackSalesPrice !== 0) {
                        setMultiple(true);
                    }
                   
                    setProduct(data);
                    setRelatedProducts(related);
                    setSelectedProduct({
                        type: 0,
                        id: productId,
                        quantity: 1,
                        price: data.SalesPrice,
                        subDescription: data.SalesPriceSubDescription,
                        deductQty: data.SalesPriceDeductStockQty,
                        priceId: data.SalesPriceId,
                        GSTRate: data.GSTRate,
                        stockOnlineId: data.StockOnlineId,
                        name: data.Description1,
                        imgSrc: `${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${data.StockId}.jpg`, // 确保模板字符串正确使用
                        tagId: data.TagId,
                        packTagId: data.PackTagId,
                        weight: data.Weight,
                        packWeight: data.PackWeight,
                    });

                    setLoading(false);
                }
                else {
                    console.error('Error fetching product: ', response.data);
                }

            } catch (error) {
                console.error('Error fetching product: ', error);
            }
        }
        fetchProduct();

    }, [productId]);

    if (loading) {
        return (
            <div className="spinner-wrapper">
                <Spin size="large" />
            </div>
        );
    }


    return (
        <div className="product-detail-page">
            <Header
                ref={headerRef}
                cartItems={cartItems}
                total={total}
                removeFromCart={removeFromCart}
                updateCartQuantity={updateCartQuantity}
                storeId={storeId}
                refreshPage={() => window.location.reload()}
            />

            <div className="kong" style={{ height: "115px" }}></div>
            {/* Breadcrumb Navigation */}

            <div className="main-content-wrapper">
                <div className="page-content-inner">
                    <div className="container">
                        <div className="breadcrumb-wrapper" style={{ padding: '0', margin: "0" }}>
                            <Breadcrumb>
                                <Breadcrumb.Item>
                                    <Link to={`/shop/${storeUrl}`}>
                                        <HomeOutlined style={{ marginRight: '5px' }} />
                                        <span style={{ marginLeft: "6px" }}>Shop</span>
                                    </Link>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item>
                                    <Link to={`/shop/${storeUrl}/${product.Category}`}>
                                        {product.Category}
                                    </Link>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item>
                                    {product.Description1}
                                </Breadcrumb.Item>
                            </Breadcrumb>
                        </div>

                        {/* 主内容和相关产品的布局 */}
                        <div className="product-main-section">
                            {/* 主产品内容 */}
                            <div className="product-main-content">
                                <div className="row no-gutters mb--80 mb-md--57 pt--80 pt-md--60">
                                    <div className="col-lg-7 product-main-image">
                                        <div className="product-image">
                                            <div className="product-gallery vertical-slide-nav">
                                                <div className="product-gallery__large-image mb-sm--30">
                                                    <div className="product-gallery__wrapper">
                                                        <div className="element-carousel main-slider image-popup"
                                                            data-slick-options='{
                                                                "slidesToShow": 1,
                                                                "slidesToScroll": 1,
                                                                "infinite": true,
                                                                "arrows": false, 
                                                                "asNavFor": ".nav-slider"
                                                            }'>
                                                            <figure className="product-gallery__image zoom">
                                                                <img
                                                                    draggable="false" // 禁用拖拽
                                                                    onContextMenu={(e) => e.preventDefault()} // 禁用右键菜单
                                                                    src={`${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${product.StockId}.jpg`}
                                                                    alt="Product"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = '/images/default-product-image.png';
                                                                    }}
                                                                />
                                                            </figure>
                                                            {/* 其他产品图片可以在这里添加 */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 offset-xl-1 col-lg-5 product-main-details mt-md--10">
                                        <div className="product-summary pl-lg--30 pl-md--0">
                                            <div className="product-rating d-flex mb--20">
                                                <div className="star-rating star-four">
                                                    <span>Rated <strong className="rating">5.00</strong> out of 5</span>
                                                </div>
                                            </div>
                                            <h3 className="product-title mb--20">{product.Description1}</h3>
                                            <p className="product-short-description mb--20">{product.Description2}</p>
                                            <div className="product-price-wrapper mb--25">
                                                <span className="money">${selectedProduct.price}</span>
                                            </div>
                                            {/* 尺寸选择 */}
                                            {multiple && (
                                                <form action="#" className="variation-form mb--20">
                                                    <div className="product-size-variations d-flex align-items-center mb--15">
                                                        {(product.SalesPriceSubDescription || product.PackSalesPriceSubDescription) && (
                                                            <>
                                                                <p className="variation-label">Size:</p>
                                                                <div className="product-size-variation variation-wrapper">
                                                                    {product.SalesPriceSubDescription && (
                                                                        <div className="variation">
                                                                            <a
                                                                                className={`product-size-variation-btn ${selectedProduct?.type === 0 ? 'selected' : ''}`}
                                                                                style={{ marginRight: "5px" }}
                                                                                onClick={() => handleSizeSelection(0)}
                                                                                data-toggle="tooltip" data-placement="top" title={product.SalesPriceSubDescription}>
                                                                                <span className="product-size-variation-label">{product.SalesPriceSubDescription}</span>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {product.PackSalesPriceSubDescription && (
                                                                        <div className="variation">
                                                                            <a
                                                                                className={`product-size-variation-btn ${selectedProduct?.type === 1 ? 'selected' : ''}`}
                                                                                onClick={() => handleSizeSelection(1)}
                                                                                data-toggle="tooltip" data-placement="top" title={product.PackSalesPriceSubDescription}>
                                                                                <span className="product-size-variation-label">{product.PackSalesPriceSubDescription}</span>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </form>
                                            )}

                                            {/* 添加到购物车部分 */}
                                            <div className="product-action d-flex flex-sm-row align-items-sm-center flex-column align-items-start mb--30">
                                                <div className="quantity-wrapper d-flex align-items-center mr--30 mr-xs--0 mb-xs--30">
                                                    <label className="quantity-label" htmlFor="qty">Quantity:</label>
                                                    <div className="item-quantity" style={{ marginTop: '0' }}>
                                                        <button
                                                            className="quantity-btn"
                                                            onClick={() => {
                                                                if (mokeQuantity > 1) {
                                                                    setMokeQuantity(mokeQuantity - 1);
                                                                }
                                                            }}
                                                        >
                                                            -
                                                        </button>

                                                        <input
                                                            type="number"
                                                            value={mokeQuantity}
                                                            className="quantity-input"
                                                            onChange={(e) => {
                                                                // 获取用户输入的值
                                                                const value = e.target.value;

                                                                // 将值转换为整数并确保它是正整数
                                                                const intValue = parseInt(value, 10);

                                                                // 只允许更新为正整数的值
                                                                if (intValue > 0) {
                                                                    setMokeQuantity(intValue);
                                                                } else if (value === '') {
                                                                    // 如果输入为空，允许清空
                                                                    setMokeQuantity('');
                                                                }
                                                            }}
                                                            min="1"
                                                        />

                                                        <button className="quantity-btn" onClick={() => setMokeQuantity(mokeQuantity + 1)}>+</button>
                                                    </div>
                                                </div>
                                                <button type="button" className="btn btn-shape-square btn-size-sm" onClick={() => addToCart(selectedProduct, mokeQuantity)}>
                                                    Add To Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 产品描述标签页 */}
                                <div className="row justify-content-center mb--77 mb-md--57">
                                    <div className="col-12">
                                        <div className="tab-style-2">
                                            <div className="nav nav-tabs mb--35 mb-sm--25" id="product-tab" role="tablist" style={{ fontSize: "16px" }}>
                                                <a className="nav-link active" id="nav-description-tab" data-toggle="tab" href="#nav-description" role="tab" aria-selected="true">
                                                    <span>Description</span>
                                                </a>
                                                {/* 其他标签可以在这里添加 */}
                                            </div>
                                            <div className="tab-content" id="product-tabContent">
                                                <div className="tab-pane fade show active" id="nav-description" role="tabpanel" aria-labelledby="nav-description-tab">
                                                    <div className="product-description">
                                                        <p>{product.Description1}</p>
                                                        <p>{product.Description2}</p>

                                                        {product.Notes && product.Notes.trim() !== '' && (
                                                            <>
                                                                <h5 className="product-description__heading">Notes:</h5>
                                                                <ul>
                                                                    <li><i className="la la-arrow-right"></i><span>{product.Notes}</span></li>
                                                                </ul>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* 其他标签内容可以在这里添加 */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                           {/* 桌面端的相关产品侧边栏 */}
{relatedProducts && relatedProducts.length > 0 && (
    <div className="related-products-wrapper">
        <h2 className="related-products-title-outside">Related Products</h2>
        <div className="related-products-sidebar">
            <div className="related-products-content">
                {relatedProducts.slice(0, 5).map((relProduct) => (
                    <Link
                    to={`/product-details/${encodeURIComponent(relProduct.StockId)}/${encodeURIComponent(relProduct.Description1)}`}
                    className="related-product-link"
                    onClick={() => setLoading(true)} 
                >
                    <Card
                        hoverable
                        cover={
                            <Link onClick={() => setLoading(true)}  to={`/product-details/${encodeURIComponent(relProduct.StockId)}/${encodeURIComponent(relProduct.Description1)}`}>
                                <img
                                    alt={relProduct.Description1}
                                    src={`${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${relProduct.StockId}.jpg`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/default-product-image.png';
                                    }}
                                    draggable="false" // 禁用拖拽
                                    onContextMenu={(e) => e.preventDefault()} // 禁用右键菜单
                                />
                            </Link>
                        }
                        className="related-product-card"
                        key={relProduct.id}
                    >
                        <Meta
                            title={
                                <span style={{
                                    fontSize: '14px',
                                    maxWidth: '210px',
                                    whiteSpace: 'normal',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {relProduct.Description1}
                                </span>
                            }
                            description={
                                <div>
                                    <p className="price">{ 
                                    relProduct.PackSalesPrice 
                                      ? `from $${Math.min(relProduct.SalesPrice, relProduct.PackSalesPrice).toFixed(2)}` 
                                      : `$${relProduct.SalesPrice.toFixed(2)}` 
                                  }</p>
                                    {/* <Link onClick={() => setLoading(true)}  to={`/product-details/${encodeURIComponent(relProduct.StockId)}/${encodeURIComponent(relProduct.Description1)}`} className="view-details-btn">
                                        View Details
                                    </Link> */}
                                </div>
                            }
                        />
                    </Card>
                </Link>
                ))}
            </div>
        </div>
    </div>
)}


                            {/* 移动端的相关产品部分 */}
                            {relatedProducts && relatedProducts.length > 0 && (
                                
                                <div className="related-products-mobile">
                                    <h2 className="related-products-title">Related Products</h2>
                                    <Row gutter={[16, 16]}>
                                        {relatedProducts.map((relProduct) => (
                                            <Col xs={12} key={relProduct.id}>
                                                  <Link
                                                    to={`/product-details/${encodeURIComponent(relProduct.StockId)}/${encodeURIComponent(relProduct.Description1)}`}
                                                    className="related-product-link"
                                                    onClick={() => setLoading(true)} 
                                                >
                                                <Card
                                                    hoverable
                                                    cover={
                                                        <Link to={`/product/${relProduct.id}`}>
                                                            <img
                                                                alt={relProduct.Description1}
                                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${storeId}/stockItems/${relProduct.StockId}.jpg`}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = '/images/default-product-image.png';
                                                                }}
                                                                draggable="false" // 禁用拖拽
                                                                onContextMenu={(e) => e.preventDefault()} // 禁用右键菜单
                                                            />
                                                        </Link>
                                                    }
                                                    className="related-product-card"
                                                >
                                               <Meta
                                                    title={
                                                          <span style={{
                                    fontSize: '14px',
                                    maxWidth: '210px',
                                    whiteSpace: 'normal',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                }}>
                                                            {relProduct.Description1}
                                                        </span>
                                                    }
                                                    description={
                                                        <div>
                                                            <p className="price">{ 
                                    relProduct.PackSalesPrice 
                                      ? `from $${Math.min(relProduct.SalesPrice, relProduct.PackSalesPrice).toFixed(2)}` 
                                      : `$${relProduct.SalesPrice.toFixed(2)}` 
                                  }</p>
                                                            {/* <Link onClick={() => setLoading(true)}  to={`/product-details/${encodeURIComponent(relProduct.StockId)}/${encodeURIComponent(relProduct.Description1)}`} className="view-details-btn">
                                                                View Details
                                                            </Link> */}
                                                        </div>
                                                    }
                                                />

                                                </Card>
                                                </Link>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail;
