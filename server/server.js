const http = require('http');

const express = require('express');
const winston = require('winston');
const socketIO = require('socket.io');
// const mysql = require('mysql');
const mysql = require('mysql2/promise');
const util = require('util');

const jwt = require('jsonwebtoken');

const jwtVerify = util.promisify(jwt.verify);


const bcrypt = require("bcrypt") // Importing bcrypt package
const crypto = require('crypto');

const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;

const session = require("express-session");
const { v4: uuidv4 } = require('uuid');

const { connect } = require('http2');
const redisAdapter = require('socket.io-redis');


const { Console, group, count } = require('console');
const moment = require('moment');
const momentlocal = require('moment-timezone');

const multer = require('multer');


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
// require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });


const fs = require('fs');

const Core = require('@alicloud/pop-core');

// Redis setup
const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient();

redisClient.on('error', function (err) {
    console.log('Redis error: ' + err);
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const incrAsync = promisify(redisClient.incr).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const ttlAsync = promisify(redisClient.ttl).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);


// Remove the default Console log transport
winston.remove(winston.transports.Console);
// Add a Console log transport with color and timestamp options
winston.add(new winston.transports.Console({ colorize: true, timestamp: true }));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
// 解析数据
// 只处理 Content-Type 为 text/plain 的请求
// app.use(express.text({ type: 'text/plain' }));

// // 只处理 Content-Type 为 application/json 的请求
// app.use(express.json({ type: 'application/json' }));

app.use(express.json({limit: '3mb'}));
app.use(express.urlencoded({ limit: '3mb', extended: true }));

app.use('/img', express.static(path.join(__dirname, 'public', 'img'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.png')|| filePath.endsWith('.svg')) {
      // 为图片设置缓存控制头部，缓存1小时
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));


app.use(express.static(path.join(__dirname, '..', 'public')));


app.use('/stripe-webhook', express.raw({ type: 'application/json' }));

const cors = require('cors');
const { create } = require('domain');
const { Store } = require('lucide-react');



app.use(cors({
 origin: ['https://branchorder.enrichpos.com.au','https://chineseherbswholesaler.com.au','https://enrichpos.com.au','https://backend.chineseherbswholesaler.com.au','http://localhost:3000',],
 
  credentials: true, 
}));


app.use(express.urlencoded({extended: false}))

app.use(
  session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // 设置用于加密会话数据的秘密密钥
    resave: false, // 是否在每个请求上保存会话数据
    saveUninitialized: false, // 是否自动保存未初始化的会话数据
    cookie: { httpOnly: true, secure: false, maxAge:  60 * 60 * 1000 } // 设置session有效期为1小时
  })
);


// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 3, // 连接池大小，根据需要调整
  queueLimit: 0,
});

const pool2 = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_REPORTDATABASE,
  waitForConnections: true,
  connectionLimit: 3, // 连接池大小，根据需要调整
  queueLimit: 0,
});

async function executeDb(query, values = null, options = { fetchAll: false, fetchOne: false, commit: false }) {
    const connection = await pool.getConnection(); // 从连接池中获取连接
    const queryTrimmedUpper = query.trim().toUpperCase();
  
    // 检查是否是 INSERT、UPDATE 或 DELETE 操作，并根据需要开始事务
    if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
      await connection.beginTransaction(); // 开始事务
    }
  
    try {
      const [results] = await connection.query(query, values);
  
      // 如果是 INSERT、UPDATE 或 DELETE 操作，则提交事务
      if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
        await connection.commit();
      }
  
      if (options.fetchAll) {
        return results;
      } else if (options.fetchOne) {
        return results[0];
      } else {
        return results;
      }
    } catch (error) {
      // 如果是 INSERT、UPDATE 或 DELETE 操作并出错，则回滚事务
      if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release(); // 释放连接回连接池
    }
  }

  
async function executeReportDb(query, values = null, options = { fetchAll: false, fetchOne: false, commit: false }) {
  const connection = await pool2.getConnection(); // 从连接池中获取连接
  const queryTrimmedUpper = query.trim().toUpperCase();

  // 检查是否是 INSERT、UPDATE 或 DELETE 操作，并根据需要开始事务
  if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
    await connection.beginTransaction(); // 开始事务
  }

  try {
    const [results] = await connection.query(query, values);

    // 如果是 INSERT、UPDATE 或 DELETE 操作，则提交事务
    if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
      await connection.commit();
    }

    if (options.fetchAll) {
      return results;
    } else if (options.fetchOne) {
      return results[0];
    } else {
      return results;
    }
  } catch (error) {
    // 如果是 INSERT、UPDATE 或 DELETE 操作并出错，则回滚事务
    if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release(); // 释放连接回连接池
  }
}

// Calculate shipping cost with discount tiers
function calculateShippingWithDiscount(baseShipping, orderTotal, discountTiers) {
  if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
    return baseShipping;
  }
  
  // Sort tiers from highest to lowest threshold
  const sortedTiers = discountTiers.sort((a, b) => b.threshold - a.threshold);
  
  // Find the highest tier that the order qualifies for
  for (const tier of sortedTiers) {
    if (orderTotal >= tier.threshold) {
      const discountedShipping = baseShipping - tier.discount;
      return Math.max(0, discountedShipping); // Ensure shipping never goes below 0
    }
  }
  
  return baseShipping;
}


  
// 配置 Passport 策略
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // 查询用户凭据
      
        const query = 'SELECT * FROM admin_users WHERE Email = ?';
        const results = await executeDb(query, [email], { fetchAll: true });
      
        if (results.length === 0) {
          // 用户不存在
          return done(null, false);
        }
        const user = results[0];
        // 验证密码
        bcrypt.compare(password, user.Password, (error, isMatch) => {
          if (error) {
            return done(error);
          }
  
          if (isMatch) {
           
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      } catch (error) {
        console.error('Error connecting to the database:', error);
        return done(error);
      }
    })
  );
  
  
  // 初始化 Passport
  app.use(passport.initialize()) 
  app.use(passport.session())
  
  // 序列化和反序列化用户
  passport.serializeUser((user, done) => {
    done(null, user.cus_id);
  });
  
  passport.deserializeUser(async (cus_id, done) => {
    try {
      const query = 'SELECT * FROM customers WHERE cus_id = ?';
      const results = await executeDb(query, [cus_id], { fetchAll: true });
  
      if (results.length > 0) {
        const user = results[0];
  
        // 获取 StoreId
        const storeQuery = 'SELECT StoreId FROM customer_store WHERE cus_id = ?';
        const storeResults = await executeDb(storeQuery, [user.cus_id], { fetchAll: true });
  
        // 将 StoreId 添加到用户对象
        user.store_ids = storeResults.length > 0 ? storeResults.map(result => result.StoreId) : null;
  
        done(null, user);
      } else {
        done(null, false); // 用户不存在
      }
    } catch (error) {
      console.error('Error connecting to the database:', error);
      return done(error);
    }
  });
  
  const authenticateJWT = (req, res, next) => {

 
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
        const token = authHeader.split(' ')[1];
  
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
  
            req.user = decoded; // Attach decoded token to request
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
  };

async function verifySignature(appId, nonce, path, shopId, receivedSign) {
  // 将必要的参数放入一个数组
  const sList = [appId, nonce, path, shopId];
  // 对数组进行排序
  sList.sort();
  // 将数组元素连接成一个字符串
  const s = sList.join('&');
  // 使用md5算法生成哈希值
  const hash = crypto.createHash('md5').update(s).digest('hex');
  // 将哈希值转换为大写
  const hashUpperCase = hash.toUpperCase();

  // 比较计算出的签名和接收到的签名
  return hashUpperCase === receivedSign;
}


async function update_socket_sql(store_id, socket_id) {
  try {
      
      const updateQuery = 'UPDATE stores SET StoreSid = ?, SocketConnection = 1 WHERE StoreId = ?';
      await executeReportDb(updateQuery, [socket_id, store_id]);
      console.log(`Updated record with sid ${socket_id} for store ID ${store_id}`);
    
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function find_client_socket(store_id) {
console.log('Finding client socket for store ID', store_id);
try {
  const selectQuery = 'SELECT StoreSid FROM stores WHERE StoreId = ?';
  const results = await executeReportDb(selectQuery, [store_id], { fetchAll: true });

  if (results.length > 0) {
    return results[0].StoreSid;
  } else {
    return null;
  }
} catch (error) {
  console.error('Error executing SELECT query:', error);
  throw error;
}
}

async function authenticateStore(store_id, storeAppId) {
  
  const query = 'SELECT * FROM stores WHERE StoreId = ? LIMIT 1';
  try {
    const store = await executeReportDb(query, [store_id], { fetchOne: true });
   
    if (store && store.StoreOnlineOrderAppId === storeAppId) {
      return true; // store_id 与 storeAppId 匹配，验证成功
    }
    return false; // 不匹配，验证失败
  } catch (error) {
    console.error('验证餐厅客户端时出错：', error);
    return false; // 出现错误时返回验证失败
  }
}



  io.on('connection', (socket) => {
    
    let parsedData;
    let store_id;
    socket.on('login', async (data) => {
      // console.log('login', data);
      if (typeof data === 'string') {
        parsedData= JSON.parse(data);
      
    } else {
      
        parsedData = data;
      
    }
      
      try {
        store_id = parsedData.store_id;
        const appid = parsedData.app_id; 
        // const nonce = parsedData.nonce;
        // const shopId = parsedData.shopid;
        // const receivedSign = parsedData.sign;

        // 验证 store_id 和密码
        const isAuthenticated = await authenticateStore(store_id, appid);
        if (isAuthenticated) {
       
            const checkAvailableQuery = 'SELECT RetailOrderLicenseExpire FROM stores WHERE StoreId = ?';
            const checkAvailableResult = await executeReportDb(checkAvailableQuery, [store_id], { fetchAll: true });
            //已经过期十天以上
            
            if (checkAvailableResult && moment(checkAvailableResult[0].RetailOrderLicenseExpire).isBefore(moment().subtract(10, 'days'))) {
              
              socket.emit('login', { success: -1, message: 'License expired' });
            
              socket.disconnect(true); 
              await update_socket_sql(store_id, null);
              return;
            }
            
            await update_socket_sql(store_id, socket.id);

            socket.emit('login', { success: 1, message: 'Login success'});

            //登录成功后，从数据库里查看是否有发送失败的order，进行循环发送
            const orders = await executeDb('SELECT * FROM orders WHERE StoreId = ? AND Success = 0 AND Paid != 0', [store_id], { fetchAll: true });
            for (const order of orders) {
              const orderId = order.OrderId;
              const orderItemsQuery = 'SELECT * FROM orderitems WHERE OrderId = ?';
                const orderItems = await executeDb(orderItemsQuery, [orderId], { fetchAll: true });
                const cartItems = [];
                for (const item of orderItems) {
                  cartItems.push({
                    stockId: item.StockId,
                    quantity: item.Quantity,
                    price: item.Price,
                    gstRate: item.GSTRate,
                    stockOnlineId: item.OrderItemId,
                    deductQty: item.DeductQty,
                    priceId: item.PriceId
                  });
                }
              
                const orderQuery = 'SELECT * FROM orders WHERE OrderId = ?';
                const orderResults = await executeDb(orderQuery, [orderId], { fetchOne: true });
                const { CustomerId, Paid, StripePaymentId, Surcharge, Notes, Freight, DeliveryMethod } = orderResults;
                const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
                const customerResults = await executeDb(customerQuery, [CustomerId], { fetchOne: true });
                const { CustomerEmail, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, CustomCustomerId } = customerResults;

                // 如果 CustomCustomerId 不为 null，使用它；否则使用 CustomerId
                const displayCustomerId = CustomCustomerId ? CustomCustomerId : "ZA"+CustomerId;

                const orderDetail = {
                  onlineOrderId: orderId,
                  onlineCustomerId: displayCustomerId,
                  paid: 0,
                  paymentMethod: null,
                  paymentId: StripePaymentId? StripePaymentId : "",
                  surcharge: Surcharge,
                  freight: Freight,
                  orderNotes: Notes,
                  itemDetails: cartItems,
                  deliveryMethod: DeliveryMethod,
                  customer: {
                    onlineCustomerId: displayCustomerId,
                    customerName: `${CustomerSurname} ${CustomerMiddleName ? CustomerMiddleName + ' ' : ''}${CustomerLastName}`,
                    mobile: CustomerPhone,
                    email:CustomerEmail,
                    ABN: ABN? ABN : "",
                    companyName: customerResults.CompanyName ? customerResults.CompanyName : "",
                    address: Address,
                    suburb: Suburb,
                    state: State,
                    postCode: PostCode,
                    country: Country,
                    deliveryAddress: DeliveryAddress,
                    deliverySuburb: DeliverySuburb,
                    deliveryState: DeliveryState,
                    deliveryPostCode: DeliveryPostCode,
                    deliveryCountry: DeliveryCountry
                  }
                };
              
                const clientSocketId = await find_client_socket(store_id);
        
                if (clientSocketId) {
              
                  io.to(clientSocketId).emit('saveOrder', { orderDetail });
                  console.log('Order sent to store client');
                } else {
                  throw new Error('Store client not connected');
                }
            }
           
          }
          else {
            socket.emit('login', { success: 0, message: 'Authorization error'});
            // console.log('Authorization error');
            socket.disconnect(true); 
            await update_socket_sql(store_id, null);
            return;
          }
        // } else {
        //   socket.emit('login', { success: false});

        //   socket.disconnect(true); 
        //   await update_socket_sql(store_id, null);
        // }
      } catch (error) {
        socket.emit('login', { success: 0, message: 'Login failed'});
        // console.error('Login failed:', error);
       
        
        socket.disconnect(true); 
        await update_socket_sql(store_id, null);
      }
    });
    //diconnect


    socket.on('disconnect', async () => {
      
      await executeReportDb('UPDATE stores SET SocketConnection = 0, StoreSid = NULL WHERE StoreSid = ?', [socket.id]);
      // console.log('客户端断开连接：', socket.id);
    });

    socket.on('confirmOrder',  async (confirmOrder) => {
      
      const { onlineOrderId, success, enrichOrderId, shopId } = confirmOrder;
    
        if (success === 1) {
       
         
          const updateOrderQuery = 'UPDATE orders SET Success = 1,EnrichInvoiceId = ?, OrderStatus = ? WHERE StoreId = ? AND OrderId = ?';
          const updateOrderResults = await executeDb(updateOrderQuery, [enrichOrderId, "Success",shopId, onlineOrderId]);
          const fetchOrderQuery = 'SELECT * FROM orders WHERE StoreId = ? AND OrderId = ?';
          const fetchOrderResults =await executeDb(fetchOrderQuery, [shopId, onlineOrderId]);
          delete orderPromises[onlineOrderId];
          
          const CustomerId = fetchOrderResults[0].CustomerId;
          const fetchCustomerQuery = 'SELECT * FROM customers WHERE StoreId = ? AND CustomerId = ?';
          const fetchCustomerResults =await executeDb(fetchCustomerQuery, [shopId, CustomerId]);
          


          const orderItemsQuery = 'SELECT * FROM orderitems JOIN stockitem ON orderitems.StockId = stockitem.StockId WHERE orderitems.OrderId = ?';

          const orderItems = await executeDb(orderItemsQuery, [onlineOrderId], { fetchAll: true });
          const cartItems = [];
          for (const item of orderItems) {
            cartItems.push({
              description1: item.Description1,
              description2: item.Description2,
    
              stockId: item.StockId,
              quantity: item.Quantity,
              price: item.Price,
              gstRate: item.GSTRate,
              stockOnlineId: item.OrderItemId,
              imgUrl: "/images/"+item.StoreId+"/stockItems/"+item.StockId+".jpg"
            });
          }
          const {  Paid, StripePaymentId, Surcharge, Notes, Freight } = fetchOrderResults[0];
          const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
          const customerResults = await executeDb(customerQuery, [CustomerId], { fetchOne: true });
          const { CustomerEmail, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, CustomCustomerId } = customerResults;
          
          // 如果 CustomCustomerId 不为 null，使用它；否则使用 CustomerId
          const displayCustomerId = CustomCustomerId ? CustomCustomerId : "ZA"+CustomerId;
          
          const orderTime = moment(fetchOrderResults[0].CreatedAt).format('YYYY-MM-DD HH:mm:ss');
          const storeUrlQuery = 'SELECT StoreUrl FROM stores WHERE StoreId = ?';
          const storeUrlResults = await executeReportDb(storeUrlQuery, [shopId], { fetchOne: true });
          
          const orderData = {
            storeUrl: storeUrlResults.StoreUrl,
            storeId: shopId,
            onlineOrderId: onlineOrderId,
            onlineCustomerId: displayCustomerId,
            //localTime melbourne
            orderTime: orderTime,
            paid: 0,
            paymentMethod: null,
            paymentId: StripePaymentId,
            surcharge: Surcharge,
            freight: Freight,
            orderNotes: Notes,
            itemDetails: cartItems,
            customer: {
              onlineCustomerId: displayCustomerId,
              customerName: `${CustomerSurname} ${CustomerMiddleName ? CustomerMiddleName + ' ' : ''}${CustomerLastName}`,
              mobile: CustomerPhone,
              email:CustomerEmail,
              ABN,
              address: Address,
              suburb: Suburb,
              state: State,
              postCode: PostCode,
              country: Country,
              deliveryAddress: DeliveryAddress,
              deliverySuburb: DeliverySuburb,
              deliveryState: DeliveryState,
              deliveryPostCode: DeliveryPostCode,
              deliveryCountry: DeliveryCountry
            }
          };
          const subject = `Order Confirmation - Order ID: ${onlineOrderId}`;
          try{
            const result = await sendOrderEmail(CustomerEmail, subject, orderData);
            if (!result.success) {
               
                console.error('Email sending failed:', result.message);
            }
          }
        
            catch (error) {
              console.error('Error sending email:', error);
          }
        
        } 
      
    });

    socket.on('updateOrderC2S', async (data) => {
      try {
          // 调用更新订单的函数
          const result = await updateOrder(data);
          
      } catch (error) {
          console.error('订单更新失败', error);
         
      }
  });


  });

  async function updateOrder(data) {
    const { updateOrder } = data;
    if (!updateOrder) {
        throw new Error('更新订单数据不完整');
    }

    const {
        enrichOrderId,
        tableNo,
        storeId,
        paid,
        
        serviceMode,
        orderTime,
       
        
        orderNotes,
        itemDetail
    } = updateOrder;
    
    // const updateOrderQuery = 'UPDATE store_order SET OrderEnrichNo = ?, TableNo = ?, Paid = ?, ServiceMode = ?, OrderTime = ?, Notes = ?, OrderDetails = ? , Success = 1 WHERE StoreId = ? AND OrderEnrichNo = ?';
    // await executeOnlineOrderDb(updateOrderQuery, [enrichOrderId, tableNo, paid, serviceMode, orderTime, orderNotes, JSON.stringify(itemDetail), storeId, enrichOrderId]);
   

    const deleteOrderQuery = 'DELETE FROM store_order WHERE StoreId = ? AND (tableNo = ? OR SERVICEMODE = ?) AND Paid = 0 ';
    await executeOnlineOrderDb(deleteOrderQuery, [storeId, tableNo, serviceMode]);
    const updatedOrderDetails = await transformItems(itemDetail, storeId);
    if (paid != 0){
      const insertOrderQuery = 'INSERT INTO store_order (StoreId, OrderEnrichNo, TableNo, Paid, ServiceMode, OrderTime, Notes, OrderDetails, Success) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      await executeOnlineOrderDb(insertOrderQuery, [storeId, enrichOrderId, tableNo, paid, serviceMode, orderTime, orderNotes, JSON.stringify(updatedOrderDetails),1]);

    }
   
    return { success: true, message: '订单更新成功' };
}
app.post('/updatePassword', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];
    
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  
    const token = origin_token.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
     
      if (decoded.storeAdmin) {
        const { oldPassword, newPassword } = req.body;
        const userResult = await executeDb('SELECT Password FROM admin_users WHERE Id = ?', [decoded.cusId], { fetchOne: true });
        //bcrypt old password then compare
        if (userResult) {
          
          bcrypt.compare(oldPassword, userResult.Password, async (err, isMatch) => {
            if (err) {
              return res.status(401).json({ success: false, message: 'Invalid password' });
            }
            if (!isMatch) {
              return res.status(401).json({ success: false, message: 'Invalid password' });
            }
            else {
              const hashedNewPassword = await bcrypt.hash(newPassword, 10);
              const updateQuery = 'UPDATE admin_users SET Password = ? WHERE Id = ?';
              await executeDb(updateQuery, [hashedNewPassword, decoded.cusId]);
              res.status(200).json({ success: true, message: 'Password updated'});
            }
          });
        }
        else {
          res.status(400).json({ success: false, message: 'Customer not found' });
        }
      }
      else {
        res.status(400).json({ success: false, message: 'Authorization error' });
      }
    });
  } catch (error) {
    console.error('Errors occur during password updating.', error);
    res.status(400).json({ success: false, message: 'Errors occur during password updating.' });
  }
});

app.post ('/updateStockItem', async (req, res) => {  
  // const { stockId, stockName, stockDescription, stockPrice, stockCategory, stockTaxRate, stockOnlineId, storeId } = req.body;
  // StockOnlineId: 5063,
  // StockId: '1001GN-13-3.3L',
  // Description1: '嘉顺高耐燜烧煲Large Porcelain Pot #13 3.3L',
  // Description2: 'bao',
  // Description3: '',
  // Description4: '',
  // SalesPrice: 30,
  // MemberPrice: null,
  // GSTRate: 10,
  // BarCode: null,
  // Notes: '',
  // Enable: 0,
  // StoreId: 246,
  // Category: 'ANIMAL PRODUCT 动物药'
  try{

  // Support both camelCase and PascalCase for stockOnlineId
  const { SalesPriceSubDescription, PackSalesPriceSubDescription, PackSalesPrice,  MemberPackPrice, PackTagId, StockOnlineId, stockOnlineId, StockId, Description1, Description2,  SalesPrice, MemberPrice, GSTRate, BarCode, Notes, Enable, StoreId, Category, TagId, Weight, PackWeight, OutOfStock } = req.body;
  
  // Use either StockOnlineId or stockOnlineId
  const finalStockOnlineId = StockOnlineId || stockOnlineId;
  
  if (!finalStockOnlineId) {
    return res.json({ success: false, message: 'StockOnlineId is required' });
  }
  
  // Build dynamic query based on provided fields
  let updateFields = [];
  let updateValues = [];
  
  if (SalesPriceSubDescription !== undefined) { updateFields.push('SalesPriceSubDescription = ?'); updateValues.push(SalesPriceSubDescription); }
  if (PackSalesPriceSubDescription !== undefined) { updateFields.push('PackSalesPriceSubDescription = ?'); updateValues.push(PackSalesPriceSubDescription); }
  if (PackSalesPrice !== undefined) { updateFields.push('PackSalesPrice = ?'); updateValues.push(PackSalesPrice); }
  if (MemberPackPrice !== undefined) { updateFields.push('MemberPackPrice = ?'); updateValues.push(MemberPackPrice); }
  if (PackTagId !== undefined) { updateFields.push('PackTagId = ?'); updateValues.push(PackTagId); }
  if (StockId !== undefined) { updateFields.push('StockId = ?'); updateValues.push(StockId); }
  if (Description1 !== undefined) { updateFields.push('Description1 = ?'); updateValues.push(Description1); }
  if (Description2 !== undefined) { updateFields.push('Description2 = ?'); updateValues.push(Description2); }
  if (SalesPrice !== undefined) { updateFields.push('SalesPrice = ?'); updateValues.push(SalesPrice); }
  if (MemberPrice !== undefined) { updateFields.push('MemberPrice = ?'); updateValues.push(MemberPrice); }
  if (GSTRate !== undefined) { updateFields.push('GSTRate = ?'); updateValues.push(GSTRate); }
  if (BarCode !== undefined) { updateFields.push('BarCode = ?'); updateValues.push(BarCode); }
  if (Notes !== undefined) { updateFields.push('Notes = ?'); updateValues.push(Notes); }
  if (Enable !== undefined) { updateFields.push('Enable = ?'); updateValues.push(Enable); }
  if (Category !== undefined) { updateFields.push('Category = ?'); updateValues.push(Category); }
  if (TagId !== undefined) { updateFields.push('TagId = ?'); updateValues.push(TagId); }
  if (Weight !== undefined) { updateFields.push('Weight = ?'); updateValues.push(Weight); }
  if (PackWeight !== undefined) { updateFields.push('PackWeight = ?'); updateValues.push(PackWeight); }
  if (OutOfStock !== undefined) { updateFields.push('OutOfStock = ?'); updateValues.push(OutOfStock); }
  
  if (updateFields.length === 0) {
    return res.json({ success: false, message: 'No fields to update' });
  }
  
  // Update without StoreId requirement for simple updates
  const updateStockItemQuery = `UPDATE stockitem SET ${updateFields.join(', ')} WHERE StockOnlineId = ?`;
  updateValues.push(finalStockOnlineId);

  await executeDb(updateStockItemQuery, updateValues);
  res.json({ success: true, message: 'Stock item updated' });  
} catch (error) {
    console.error('Error updating stock item:', error);
    res.json({ success: false, message: 'Stock item update failed' });
  }
 
});

app.post('/deleteStockItem', async (req, res) => {
  try {
    const originToken = req.headers.authorization;
    let token = false;
    if (originToken && originToken.startsWith('Bearer ')) {
      token = originToken.split(' ')[1];
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
     
      if (decoded.storeAdmin) {
        const { StockOnlineId } = req.body;
   
        const deleteStockItemQuery = 'DELETE FROM stockitem WHERE StockOnlineId = ? AND StoreId = ?';
        await executeDb(deleteStockItemQuery, [StockOnlineId, decoded.storeId]);
        res.json({ success: true, message: 'Stock item deleted' });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      res.json({ success: false, message: 'Token verification failed' });
    }
    
  
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.json({ success: false, message: 'Stock item delete failed' });
  }
});



// Login Endpoint with Rate Limiting
app.post('/customerLogin', async (req, res) => {
  const { email, password } = req.body;

  const maxAttempts = 10;
  const windowMs = 60 * 60; // 1 hour in seconds

  const key = `login_attempts:${email}`;

  try {
    const attempts = await getAsync(key);

    if (attempts && attempts >= maxAttempts) {
      return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }

    // Proceed with login logic
    const query = 'SELECT * FROM customers WHERE CustomerEmail = ?';
    const results = await executeDb(query, [email], { fetchAll: true });
    console.log(results);

    if (results.length === 0) {
      // User not found
      // Increment the login attempts
      const newAttempts = await incrAsync(key);
      if (newAttempts === 1) {
        // Set expiry if this is the first attempt
        await expireAsync(key, windowMs);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const customerResults = results[0];
  
    

    // Verify password
    const isMatch = await bcrypt.compare(password, customerResults.Password);

    if (!isMatch) {
      // Password incorrect
      // Increment the login attempts
      const newAttempts = await incrAsync(key);
      if (newAttempts === 1) {
        // Set expiry if this is the first attempt
        await expireAsync(key, windowMs);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Login successful
    // Reset the login attempts
    await delAsync(key);

    // Generate JWT token, expires in 10 years
    const token = jwt.sign({ userId: customerResults.CustomerId, IsMember:customerResults.IsMember, storeId: customerResults.StoreId},  process.env.JWT_SECRET_KEY, { expiresIn: '10y' });

    // Remove password from user data before sending
    delete customerResults.Password;


    const user = {
      customerId: customerResults.CustomerId,
      CustomerSurname: customerResults.CustomerSurname,
      CustomerMiddleName: customerResults.CustomerMiddleName,
      CustomerLastName: customerResults.CustomerLastName,

      phone: customerResults.CustomerPhone,
      CustomerEmail: customerResults.CustomerEmail,
      ABN: customerResults.ABN,
      billingAddress: {
        address: customerResults.Address,
        city: customerResults.Suburb,
        state: customerResults.State,
        zip: customerResults.PostCode,
        country: customerResults.Country
      },
      deliveryAddress: {
        address: customerResults.DeliveryAddress,
        city: customerResults.DeliverySuburb,
        state: customerResults.DeliveryState,
        zip: customerResults.DeliveryPostCode,
        country: customerResults.DeliveryCountry
      }
    };

    res.json({ user, token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/registerMember', async (req, res) => {
  let tempFilePath = null;
  
  try {
    // 使用 multer 处理文件上传到临时目录
    const upload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          const dir = './uploads/temp';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: function (req, file, cb) {
          // 临时文件名
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        }
      }),
      fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('Invalid file type. Only images and PDF are allowed.'));
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    }).single('certificate');

    // 处理文件上传
    await new Promise((resolve, reject) => {
      upload(req, res, function(err) {
        if (err) {
          reject(err);
        } else {
          if (req.file) {
            tempFilePath = req.file.path;
          }
          resolve();
        }
      });
    });

    const { firstName, middleName, lastName, email, password, associationName, associationId, storeId, contactNumber, address, suburb, state, postcode } = req.body;
    
    // 验证必填字段
    if (!firstName || !lastName || !email || !password || !associationName || !associationId || !storeId || !contactNumber || !address || !suburb || !state || !postcode) {
      throw new Error('All fields are required.');
    }

    // 验证字段长度
    if (firstName.length > 100 || (middleName && middleName.length > 100) || lastName.length > 100 || email.length > 100 || contactNumber.length > 20 || address.length > 100 || suburb.length > 100 || state.length > 100 || postcode.length > 20 || associationName.length > 100 || associationId.length > 100) {
      throw new Error('Input exceeds maximum length.');
    }

    // 检查邮箱是否已存在
    const checkMemberQuery = 'SELECT * FROM customers WHERE CustomerEmail = ? and StoreId = ?';
    const checkMember = await executeDb(checkMemberQuery, [email, storeId], { fetchOne: true });
    if (checkMember) {
      throw new Error('Member Existed');
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入会员记录
    const insertMemberQuery = 'INSERT INTO customers (CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, CustomerPhone, Address, Suburb, State, PostCode, Password, AssociationName, AssociationId, StoreId, IsMember) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await executeDb(insertMemberQuery, [
      firstName, 
      middleName, 
      lastName, 
      email, 
      contactNumber, 
      address, 
      suburb, 
      state, 
      postcode, 
      hashedPassword, 
      associationName, 
      associationId, 
      storeId, 
      0 // 默认非会员
    ]);

    let certificatePath = null;

    // 只有在插入成功且有上传文件的情况下才处理文件
    if (result.insertId && tempFilePath) {
      try {
        const finalDir = path.join(__dirname, 'uploads', 'certificates', storeId.toString());

        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }

        // 构建新的文件名和路径
        const fileExt = path.extname(tempFilePath);
        const newFileName = `${result.insertId}${fileExt}`;
        const newPath = path.join(finalDir, newFileName);

        // 移动并重命名文件
        fs.renameSync(tempFilePath, newPath);
        tempFilePath = null; // 清除临时文件路径，因为文件已经被移动

      } catch (fileError) {
        console.error('Error processing file:', fileError);
        // 文件处理失败，但不影响注册结果
      }
    }

    // 发送注册通知邮件
    const recipientEmailQuery = 'SELECT RecipientEmail FROM store_online_information WHERE StoreId = ?';
    const recipientEmailResults = await executeDb(recipientEmailQuery, [storeId], { fetchOne: true });
    const recipientEmail = recipientEmailResults.RecipientEmail;
    const subject = 'New Member Registration';
    const htmlContent = `
      <p>A new member has registered:</p>
      <ul>
        <li>Name: ${firstName} ${middleName ? middleName + ' ' : ''} ${lastName}</li>
        <li>Email: ${email}</li>
        <li>Contact Number: ${contactNumber}</li>
        <li>Address: ${address} ${suburb} ${state} ${postcode}</li>
        <li>Association Name: ${associationName}</li>
        <li>Association ID: ${associationId}</li>
      </ul>
      ${certificatePath ? `<p>Medical certificate has been uploaded. You can find it at: ${certificatePath}</p>` : ''}
    `;
    
    await AliYunSendEmail(recipientEmail, subject, htmlContent);

    res.json({ success: true, message: 'Member registered' });

  } catch (error) {
    console.error('Error registering member:', error);
    
    // 如果有临时文件，删除它
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }

    if (error.message === 'Member Existed') {
      res.json({ success: false, message: 'Member Existed' });
    } else {
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  }
});


function getSecondsToMidnight() {
  const now = new Date();
  const midnight = new Date();

  midnight.setHours(24, 0, 0, 0); // Set to next midnight

  return Math.floor((midnight - now) / 1000); // Seconds until midnight
}

app.post('/fetchItemNonMemberPrice', async (req, res) => {
  const storeId = req.body.storeId;
  const cartItemIds = req.body.cartItemIds; // Expecting an array of items
  try {
    const updatedCartItems = await Promise.all(
      cartItemIds.map(async (item) => {
        const { stockId, type } = item;

        if (type === 0) {
          const fetchNonMemberPriceQuery =
            'SELECT SalesPrice FROM stockitem WHERE StockId = ? AND StoreId = ?';
          const nonMemberPriceResults = await executeDb(
            fetchNonMemberPriceQuery,
            [stockId, storeId],
            { fetchOne: true }
          );
          return {
            ...item,
            nonMemberPrice: nonMemberPriceResults.SalesPrice,
          };
        } else if (type === 1) {
          const fetchPackNonMemberPriceQuery =
            'SELECT PackSalesPrice FROM stockitem WHERE StockId = ? AND StoreId = ?';
          const nonMemberPriceResults = await executeDb(
            fetchPackNonMemberPriceQuery,
            [stockId, storeId],
            { fetchOne: true }
          );
          return {
            ...item,
            nonMemberPrice: nonMemberPriceResults.PackSalesPrice,
          };
        }

        return item; // Return unchanged item if no type match
      })
    );
   
    res.json({ success: true, cartItems: updatedCartItems });
  } catch (error) {
    console.error('Error fetching non-member prices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/fetchItemMemberPrice', async (req, res) => {
  try {
    const originToken = req.headers.authorization;
   
    let token, isMember = false;

    if (originToken && originToken.startsWith('Bearer ')) {
      token = originToken.split(' ')[1];
    }
   
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded && decoded.IsMember) {
        
        const storeId = decoded.storeId;
        const cartItemIds = req.body.cartItemIds; // Expecting an array of items
     
        const updatedCartItems = await Promise.all(
          cartItemIds.map(async (item) => {
            const { stockId, type } = item;

            if (type === 0) {
              const fetchMemberPriceQuery =
                'SELECT MemberPrice FROM stockitem WHERE StockId = ? AND StoreId = ?';
              const memberPriceResults = await executeDb(
                fetchMemberPriceQuery,
                [stockId, storeId],
                { fetchOne: true }
              );
              return {
                ...item,
                memberPrice: memberPriceResults.MemberPrice,
              };
            } else if (type === 1) {
              const fetchPackMemberPriceQuery =
                'SELECT MemberPackPrice FROM stockitem WHERE StockId = ? AND StoreId = ?';
              const memberPriceResults = await executeDb(
                fetchPackMemberPriceQuery,
                [stockId, storeId],
                { fetchOne: true }
              );
              return {
                ...item,
                memberPrice: memberPriceResults.MemberPackPrice,
              };
            }
            return item; // Return unchanged item if no type match
          })
        );
        console.log('updatedCartItems', updatedCartItems);
        res.json({ success: true, cartItems: updatedCartItems });
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error fetching member prices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Contact Us Endpoint with Rate Limiting
app.post('/contactUs', async (req, res) => {
  try {
    const { name, email, phone, message, storeUrl } = req.body;
    const storeId = await getStoreIdByUrl(storeUrl);
    // Input validation: check presence and length
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (name.length > 100 || email.length > 100 || phone.length > 20 || message.length > 1000) {
      return res.status(400).json({ message: 'Input exceeds maximum length.' });
    }

    // Simple email and phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const phoneRegex = /^[0-9\-+() ]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    // Rate limiting: max 5 emails per user per day
    const today = moment().format('YYYY-MM-DD');
    const redisKey = `contactUsCount:${email}:${today}`;

    // Check Redis for the user's email count
    let count = await getAsync(redisKey);
    count = parseInt(count) || 0;

    if (count >= 5) {
      return res.status(429).json({ message: 'You have reached the maximum number of contact attempts for today. Please try again tomorrow.' });
    }

    // Fetch admin email
    const getAdminEmailQuery = 'SELECT RecipientEmail FROM store_online_information WHERE StoreId = ?';
    const adminEmailResults = await executeDb(getAdminEmailQuery, [storeId], { fetchOne: true });
    const adminEmail = adminEmailResults.RecipientEmail;

    if (!adminEmail) {
      console.error('Admin email is not configured.');
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // Construct email content
    const subject = 'New Contact Us Message';
    const htmlContent = `
      <h2>New Contact Us Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send email
    const emailResult = await AliYunSendEmail(adminEmail, subject, htmlContent);

    if (emailResult.success) {
      // Increment the count in Redis with expiration at midnight
      if (count === 0) {
        // First email, set expiration to midnight
        await setAsync(redisKey, 1, 'EX', getSecondsToMidnight());
      } else {
        // Increment existing count
        await incrAsync(redisKey);
      }

      res.json({ success: true, message: 'Your message has been sent successfully.' });
    } else {
      console.error('Error sending email:', emailResult.message);
      res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
    }

  } catch (error) {
    console.error('Error in /contactUs:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// 证书上传配置
const certificateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 创建临时目录
    const tempDir = path.join(__dirname, 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const certificateUpload = multer({
  storage: certificateStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    // 只接受图片文件
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允许上传图片文件！'));
    }
    cb(null, true);
  }
});

// 确保证书目录存在
if (!fs.existsSync(path.join(__dirname, 'uploads', 'temp'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads', 'temp'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'uploads', 'certificates'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads', 'certificates'), { recursive: true });
}
// Register Endpoint
app.post('/customerRegister', certificateUpload.single('certificateFile'), async (req, res) => {
  let tempFilePath = null;

  try {
    const { firstName, middleName, lastName, email, phone, address, Suburb, Postcode, State, password, confirmPassword, storeId, applyForMembership } = req.body;

    // 检查是否需要上传证书
    if (applyForMembership === 'true' && !req.file) {
      return res.status(400).json({ message: 'Certificate is required for membership application' });
    }

    // 如果有上传文件，保存临时路径
    if (req.file) {
      tempFilePath = req.file.path;
    }

    let associationId = null;
    let associationName = null;
    
    if (req.body.associationID && req.body.associationName)  {
    
      if (req.body.associationID.length > 50 || req.body.associationName.length > 50) {
        // 如果文件已上传，删除临时文件
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        return res.status(400).json({ message: 'Input exceeds maximum length' });
      }
      associationId = req.body.associationID;
      associationName = req.body.associationName;
    }

    if (password !== confirmPassword) {
      // 打印调试信息
      console.log('Server received password:', password);
      console.log('Server received confirmPassword:', confirmPassword);
      console.log('Types:', typeof password, typeof confirmPassword);
      console.log('Equality check:', password === confirmPassword);
      console.log('String equality check:', String(password) === String(confirmPassword));
      
      // 使用String()确保类型一致
      if (String(password) === String(confirmPassword)) {
        console.log('密码实际上是匹配的，继续处理');
      } else {
        // 如果文件已上传，删除临时文件
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        return res.status(400).json({ message: 'Passwords do not match' });
      }
    } else {
      console.log('密码匹配，继续处理');
    }

    // Input validation: check presence and length
    if (!firstName || !lastName || !email || !password || !confirmPassword || !storeId || !phone || !address || !Suburb || !Postcode || !State) {
      // 如果文件已上传，删除临时文件
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (firstName.length > 50 ||(middleName && middleName.length > 50) || lastName.length > 50 || email.length > 100 || password.length > 100 || (phone && phone.length > 20) || (address && address.length > 100) || (Suburb && Suburb.length > 50) || (Postcode && Postcode.length > 10) || (State && State.length > 50)) {
      // 如果文件已上传，删除临时文件
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ message: 'Input exceeds maximum length' });
    }

    // Check if email already exists
    const existingUserQuery = 'SELECT * FROM customers WHERE CustomerEmail = ?';
    const existingUser = await executeDb(existingUserQuery, [email], { fetchOne: true });

    if (existingUser) {
      // 如果文件已上传，删除临时文件
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const insertUserQuery = 'INSERT INTO customers (CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, Password, StoreId, AssociationName, AssociationId, CustomerPhone, Address, Suburb, PostCode, State, IsNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await executeDb(insertUserQuery, [
      firstName, 
      middleName, 
      lastName, 
      email, 
      hashedPassword, 
      storeId, 
      associationName, 
      associationId, 
      phone, 
      address, 
      Suburb, 
      Postcode, 
      State,
      1 // 新用户
    ]);

    const newUserId = result.insertId;

    // 处理证书文件
    if (tempFilePath && newUserId) {
      try {
        const finalDir = path.join(__dirname, 'uploads', 'certificates', storeId.toString());

        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }

        // 构建新的文件名和路径
        const fileExt = path.extname(tempFilePath);
        const newFileName = `${newUserId}${fileExt}`;
        const newPath = path.join(finalDir, newFileName);

        // 移动并重命名文件
        fs.renameSync(tempFilePath, newPath);
        tempFilePath = null; // 清除临时文件路径，因为文件已经被移动
      } catch (fileError) {
        console.error('Error processing certificate file:', fileError);
        // 文件处理失败，但不影响注册结果
      }
    }

    // Retrieve the new user
    const userQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
    const userData = await executeDb(userQuery, [newUserId], { fetchOne: true });

    // Generate JWT token
    const token = jwt.sign({ userId: userData.CustomerId }, process.env.JWT_SECRET_KEY, { expiresIn: '10y' });

    // Remove password from user data before sending
    delete userData.Password;

    if (applyForMembership === 'true') {
     
      // Send new member registration email to admin
      const subject = 'New Member Registration';
      const htmlContent = `
        <h2>A new member has registered:</h2>
        <p><strong>Name:</strong> ${firstName} ${middleName ? middleName + ' ' : ''}${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Association Name:</strong> ${associationName}</p>
        <p><strong>Association ID:</strong> ${associationId}</p>
        ${tempFilePath ? '<p><strong>Certificate:</strong> Uploaded</p>' : ''}
      `;
      const recipientEmailQuery = 'SELECT RecipientEmail FROM store_online_information WHERE StoreId = ?';
      const recipientEmailResults = await executeDb(recipientEmailQuery, [storeId], { fetchOne: true });
      const recipientEmail = recipientEmailResults.RecipientEmail;
      
      await AliYunSendEmail(recipientEmail, subject, htmlContent);
    }
    const user = {
      CustomerId: userData.CustomerId,
      CustomerSurname: userData.CustomerSurname,
      CustomerMiddleName: userData.CustomerMiddleName,
      CustomerLastName: userData.CustomerLastName,
      CustomerPhone: userData.CustomerPhone,
      CustomerEmail: userData.CustomerEmail,
      ABN: userData.ABN,
      billingAddress: {
        address: userData.Address,
        city: userData.Suburb,
        state: userData.State,
        zip: userData.PostCode,
        country: userData.Country
      },
      deliveryAddress: {
        address: userData.DeliveryAddress,
        city: userData.DeliverySuburb,
        state: userData.DeliveryState,
        zip: userData.DeliveryPostCode,
        country: userData.DeliveryCountry
      }
    }
    
    res.json({ user, token, isApplyForMembership: applyForMembership === 'true' });

  } catch (error) {
    console.error('Error during registration:', error);
    
    // 如果文件已上传，删除临时文件
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot Password Endpoint with Rate Limiting and Cooldown
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const maxAttempts = 10;
  const windowMs = 60 * 60; // 1 hour in seconds
  const cooldownSeconds = 30;

  const attemptsKey = `forgot_password_attempts:${email}`;
  const cooldownKey = `forgot_password_cooldown:${email}`;
  const codeKey = `forgot_password_code:${email}`;

  try {
    const attempts = await getAsync(attemptsKey);
    const cooldown = await getAsync(cooldownKey);

    if (attempts && attempts >= maxAttempts) {
      return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
    }

    if (cooldown) {
      return res.status(429).json({ message: 'Please wait before requesting another code.' });
    }

    // Check if email exists
    const query = 'SELECT * FROM customers WHERE CustomerEmail = ?';
    const results = await executeDb(query, [email], { fetchAll: true });

    if (results.length === 0) {
      // Email not found
      // For security, respond with a generic message
      return res.status(200).json({ message: 'If this email exists, a verification code has been sent.' });
    }

    const user = results[0];

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    // Store the code in Redis with expiry (e.g., 10 minutes)
    await setAsync(codeKey, verificationCode, 'EX', 600); // Expires in 600 seconds (10 minutes)

    // Increment the attempts
    const newAttempts = await incrAsync(attemptsKey);
    if (newAttempts === 1) {
      await expireAsync(attemptsKey, windowMs);
    }

    // Set cooldown
    await setAsync(cooldownKey, '1', 'EX', cooldownSeconds);

    // Send verification code via email
    const subject = 'Your Password Reset Verification Code';
    const htmlContent = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;

    await AliYunSendEmail(email, subject, htmlContent);

    return res.status(200).json({ message: 'If this email exists, a verification code has been sent.' });

  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password Endpoint
app.post('/reset-password', async (req, res) => {
  const { email, verificationCode, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const codeKey = `forgot_password_code:${email}`;

  try {
    const storedCode = await getAsync(codeKey);

    if (!storedCode || storedCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Verification code is correct, proceed to reset password

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    const updateQuery = 'UPDATE customers SET Password = ? WHERE CustomerEmail = ?';
    await executeDb(updateQuery, [hashedPassword, email]);

    // Delete the verification code from Redis
    await delAsync(codeKey);

    return res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




  app.post('/uploadCategory', async (req, res) => {
    try{

 
    const categories  = req.body.categories;
   
    const appId = req.headers.appid;
    const nonce = req.headers.nonce;
    const shopId = req.headers.shopid;
    const receivedSign = req.headers.sign;
  
    if (!appId || !shopId || !nonce || !receivedSign || !categories) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    const isAuthenticated = await authenticateStore(shopId, appId);
    if (isAuthenticated) {
      const isValid = await verifySignature(appId, nonce, '/uploadCategory', shopId, receivedSign);

      if (isValid) { 
        try {
          const deleteQuery = 'DELETE FROM category WHERE StoreId = ?';
          await executeDb(deleteQuery, [shopId], { commit: true });
          
          for (const Category of categories) {
            const { cateId, category} = Category;
            const selectQuery = 'SELECT * FROM category WHERE StoreId = ? AND Category = ?';
            const results = await executeDb(selectQuery, [shopId, category], { fetchAll: true });
            if (results.length > 0) {
              const updateQuery = 'UPDATE category SET CateId = ? WHERE StoreId = ? AND Category = ?';
              await executeDb(updateQuery, [cateId, shopId, category], { commit: true });
            } else {

              const query = 'INSERT INTO category (StoreId, Category, CateId) VALUES (?, ?, ?)';
              await executeDb(query, [shopId, category, cateId], { commit: true });
            }
          }
       
          return res.status(200).json({ message: 'Categories uploaded successfully' });
        } catch (error) {
          console.error('Error uploading categories:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }}
      } else {
        res.status(400).json({ success: false, message: 'Authorization error' });
      }
    }
    catch (error) {
      console.error('Error uploading categories:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });


   
  app.post('/uploadStockItem', async (req, res) => {
    try{
      
      const {
        stockId, category, description1, description2, description3, description4,
        salesPrice, memberPrice, gstRate, notes, enable, barCode, packSalesPrice,  packSalesPriceId, memberPriceId, packSalesPriceSubDescription, memberPriceSubDescription, packSalesPriceDeductStockQty, memberPriceDeductStockQty, memberPackPrice, memberPackPriceId, memberPackPriceSubDescription, memberPackPriceDeductStockQty, salesPriceId, salesPriceSubDescription, salesPriceDeductStockQty
      }  = req.body.stockItem;


  
      const finalMemberPrice = memberPrice;

      const finalMemberPackPrice = memberPackPrice;
      
   
   
      const appId = req.headers.appid;
      const nonce = req.headers.nonce;
      const shopId = req.headers.shopid;
      const receivedSign = req.headers.sign;
      
      if (!appId || !shopId || !nonce || !receivedSign || !req.body.stockItem) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const isAuthenticated = await authenticateStore(shopId, appId);
      if (isAuthenticated) {
      const isValid = await verifySignature(appId, nonce, '/uploadStockItem', shopId, receivedSign);

      if (isValid) { 
        try {
            const selectQuery = 'SELECT * FROM stockitem WHERE StoreId = ? AND StockId = ?';
            const results = await executeDb(selectQuery, [shopId, stockId], { fetchAll: true });
            if (results.length > 0) {
              const updateQuery = 'UPDATE stockitem SET Category = ?, Description1 = ?, Description2 = ?, Description3 = ?, Description4 = ?, SalesPrice = ?, SalesPriceSubDescription = ?, SalesPriceDeductStockQty = ?, SalesPriceId = ?,MemberPriceSubDescription= ?,MemberPriceDeductStockQty = ?, MemberPriceId = ?, MemberPrice = ?, PackSalesPrice = ?,  PackSalesPriceSubDescription = ?,  PackSalesPriceDeductStockQty = ?, PackSalesPriceId = ?, MemberPackPrice = ?, MemberPackPriceSubDescription = ?, MemberPackPriceDeductStockQty = ?, MemberPackPriceId = ?, GSTRate = ?, Barcode = ?, Notes = ?, Enable = ? WHERE StoreId = ? AND StockId = ?';
              await executeDb(updateQuery, [category, description1, description2, description3, description4, salesPrice, salesPriceSubDescription, salesPriceDeductStockQty, salesPriceId, memberPriceSubDescription, memberPriceDeductStockQty, memberPriceId, finalMemberPrice, packSalesPrice, packSalesPriceSubDescription, packSalesPriceDeductStockQty, packSalesPriceId, finalMemberPackPrice, memberPackPriceSubDescription, memberPackPriceDeductStockQty, memberPackPriceId, gstRate, barCode, notes, enable, shopId, stockId], { commit: true });
            } else {
   
              const query = `
              INSERT INTO stockitem (
                  StoreId, StockId, Category, Description1, Description2, Description3, Description4,
                  SalesPrice, MemberPrice, GSTRate, Barcode, Notes, SalesPriceId, SalesPriceSubDescription,
                  SalesPriceDeductStockQty, MemberPriceId, MemberPriceSubDescription, MemberPriceDeductStockQty,
                  PackSalesPrice, PackSalesPriceSubDescription, PackSalesPriceDeductStockQty, PackSalesPriceId,
                  MemberPackPrice, MemberPackPriceSubDescription, MemberPackPriceDeductStockQty, MemberPackPriceId, Enable
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `;
          
          
          await executeDb(query, [
              shopId, stockId, category, description1, description2, description3, description4,
              salesPrice, finalMemberPrice, gstRate, barCode, notes, salesPriceId, salesPriceSubDescription,
              salesPriceDeductStockQty, memberPriceId, memberPriceSubDescription, memberPriceDeductStockQty,
              packSalesPrice, packSalesPriceSubDescription, packSalesPriceDeductStockQty, packSalesPriceId,
              finalMemberPackPrice, memberPackPriceSubDescription, memberPackPriceDeductStockQty, memberPackPriceId, enable
          ], { commit: true });
        }
          
          return res.status(200).json({ message: 'Stock items uploaded successfully' });
        } catch (error) {
          console.error('Error uploading stock items:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      }else {
        res.status(400).json({ success: false, message: 'Authorization error' });
      }
      }} catch (error) {
        console.error('Error uploading stock items:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });
    
  
    
  app.post('/uploadStockItemImage', async (req, res) => {
    try {
      
      const stockItemImage = req.body.stockItemImage;

      const appId = req.headers.appid;
      const nonce = req.headers.nonce;
      const shopId = req.headers.shopid;
      const receivedSign = req.headers.sign;
      const isAuthenticated = await authenticateStore(shopId, appId);
      if (isAuthenticated) {
      
      const isValid = await verifySignature(appId, nonce, '/uploadStockItemImage', shopId, receivedSign);
      if (isValid) {
        try {

          const {stockId, image} = stockItemImage;
          if (image.length > (150*1000*(4/3))) {
            return res.status(400).json({ success: false, message: 'Image size is too large' });
          }
          // 构建菜单照片本地存储路径
          const stockItemsPath = path.join(__dirname, `../public/images/${shopId}/stockItems`);
          // 如果目录不存在，则创建目录
          if (!fs.existsSync(stockItemsPath)) {
            fs.mkdirSync(stockItemsPath, { recursive: true });
          }
          //console.log('itemCode: ', itemCode);
          // 构建菜单照片文件名
    
          const fileName = `${stockId}.jpg`;
          // 构建菜单照片本地存储路径
          const filePath = path.join(stockItemsPath, fileName);
          // 将图片数据写入文件
          // 解码 Base64 图片数据
          let buffer;
          try {
            buffer = Buffer.from(image, 'base64');
          } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid Base64 data' });
          }
          // 写入文件, if exist -> overwrite

          fs.writeFile(filePath, buffer, (error) => {
            if (error) {
              console.error('ERROR: ', error);
              res.status(400).json({ success: false, message: 'Error when writing the file' });
            } else {
           
              res.status(200).json({ success: true, message: 'Item image uploaded' });
            }
          });

            
          } catch (error) {
            console.error('ERROR: ', error);
            res.status(400).json({ success: false, message: 'Error when uploading the item image' });
          }
        }
        else {
          res.status(400).json({ success: false, message: 'md5 failed' });
        }
      
      }else {
          res.status(400).json({ success: false, message: 'Authorization error' });
        }
      } catch (error) {
        console.error('Errors occur during item image uploading.', error);
        res.status(400).json({ success: false, message: 'Errors occur during item image uploading.' });
      }
      
  });
  
  app.post('/stockDelete', async (req, res) => {
    try {
      
      const appId = req.headers.appid;
      const nonce = req.headers.nonce;
      const shopId = req.headers.shopid;
      const receivedSign = req.headers.sign;
      const isAuthenticated = await authenticateStore(shopId, appId);
      if (isAuthenticated) {
        const isValid = await verifySignature(appId, nonce, '/stockDelete', shopId, receivedSign);
        if (isValid) {
          try {
          
            const deleteUnusedItemsQuery = `
            DELETE si
            FROM stockitem si
            LEFT JOIN orderitems oi ON si.StockOnlineId = oi.StockOnlineId
            WHERE oi.StockOnlineId IS NULL 
            AND si.StoreId = ?`;
            await executeDb(deleteUnusedItemsQuery, [shopId], { commit: true });
           
   
            const stockItemsPath = path.join(__dirname, `../public/images/${shopId}/stockItems`);
            if (fs.existsSync(stockItemsPath)) {
              fs.rmdirSync(stockItemsPath, { recursive: true });
            }
             
            res.status(200).json({ success: true, message: 'Item deleted'});
          } catch (error) {
            console.error('ERROR: ', error);
            res.status(400).json({ success: false, message: 'Error when deleting the item' });
          }
        }
        else {
          res.status(400).json({ success: false, message: 'md5 failed' });
        }}
        else {
          res.status(400).json({ success: false, message: 'Authorization error' });
        }
   
    } catch (error) {
      console.error('Errors occur during item deleting.', error);
      res.status(400).json({ success: false, message: 'Errors occur during item deleting.' });
    }
  });

  

  app.post('/uploadOutofStock', async (req, res) => {
    try{
      const outofStockItems = req.body.outofStockItems;
      const appId = req.headers.appid;
      const nonce = req.headers.nonce;
      const shopId = req.headers.shopid;
      const receivedSign = req.headers.sign;
      const isAuthenticated = await authenticateStore(shopId, appId);
      if (isAuthenticated) {
      
      if (!appId || !shopId || !nonce || !receivedSign || !outofStockItems) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const isValid = await verifySignature(appId, nonce, '/uploadOutofStock', shopId, receivedSign);

      if (isValid) {
        try {
          for (const item of outofStockItems) {
            const { ItemCode} = item;
            const query = 'UPDATE stockitem SET OutOfStock = ? WHERE StoreId = ? AND StockId = ?';
            await executeDb(query, [1, shopId, ItemCode], { commit: true });
          }
          return res.status(200).json({ message: 'Out of stock items uploaded successfully' });
        } catch (error) {
          console.error('Error uploading out of stock items:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      }}
      else {
        res.status(400).json({ success: false, message: 'Authorization error' });
      }}
      catch (error) {
        console.error('Error uploading out of stock items:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  });
  app.get('/fetchCategories/:storeUrl', async (req, res) => {
    const storeUrl = req.params.storeUrl;
  
    try {
        const storeQuery = 'SELECT StoreId FROM stores WHERE StoreUrl = ? LIMIT 1';
        const storeResults = await executeReportDb(storeQuery, [storeUrl], { fetchOne: true });

        if (storeResults) {
          
            const categoriesQuery = 'SELECT Category FROM category WHERE StoreId = ? AND Disable = 0 ORDER BY CateId';
            const categories = await executeDb(categoriesQuery, [storeResults.StoreId], { fetchAll: true });
         
            res.status(200).json(categories);
        } else {
            res.status(404).json({ message: 'Store not found' });
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/fetchStockItems/:storeUrl', async (req, res) => {
    try {
      const originToken = req.headers.authorization;
      let token, IsMember = false;
      
      if (originToken && originToken.startsWith('Bearer ')) {
        token = originToken.split(' ')[1];
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded && decoded.IsMember) {
          IsMember = true;
        }
      } catch (err) {
        // Ignore errors, IsMember remains false
      }
      
      const storeUrl = req.params.storeUrl;
    
      const { category = 'All', search = '', page = 1, limit = 21 } = req.query;
   
      const pageNo = parseInt(page, 10) || 1;
      const itemsPerPage = parseInt(limit, 10) || 21;
      const offset = (pageNo - 1) * itemsPerPage;
      
      // Fetch StoreId based on storeUrl
      const storeQuery = 'SELECT StoreId FROM stores WHERE StoreUrl = ? LIMIT 1';
      const storeResults = await executeReportDb(storeQuery, [storeUrl], { fetchOne: true });
      
      if (!storeResults) {
        return res.status(404).json({ message: 'Store not found' });
      }
      
      const storeId = storeResults.StoreId;
      
      // // Build the base query and parameters
      // let stockItemsQuery = 'SELECT * FROM stockitem WHERE StoreId = ?';
      // let totalCountQuery = 'SELECT COUNT(*) as total FROM stockitem WHERE StoreId = ?';
      // const queryParams = [storeId];
      // const countQueryParams = [storeId];
      
      // // Apply category filter if not 'All'
      // if (category.toLowerCase() !== 'all') {
      //   stockItemsQuery += ' AND Category = ? AND Enable = 1';
      //   totalCountQuery += ' AND Category = ? AND Enable = 1';
      //   queryParams.push(category);
      //   countQueryParams.push(category);
      // }
      // else {
      //   stockItemsQuery += ' AND Enable = 1';
      //   totalCountQuery += ' AND Enable = 1';
      // }
      
      // // Apply search filter if search term is provided
      // if (search.trim() !== '') {
      //   // Assuming you want to search in 'Description1', 'Description2', 'Description3', 'Description4'
      //   stockItemsQuery += ' AND (Description1 LIKE ? OR Description2 LIKE ? OR Description3 LIKE ? OR Description4 LIKE ? OR StockId LIKE ?)';
      //   totalCountQuery += ' AND (Description1 LIKE ? OR Description2 LIKE ? OR Description3 LIKE ? OR Description4 LIKE ? OR StockId LIKE ?)';
      //   const searchPattern = `%${search.trim()}%`;
      //   for (let i = 0; i < 5; i++) {
      //     queryParams.push(searchPattern);
      //     countQueryParams.push(searchPattern);
      //   }
      // }
      
      // // Add order by cateId, limit, and offset
      // stockItemsQuery += ' ORDER BY StockId LIMIT ? OFFSET ?';
      // queryParams.push(itemsPerPage, offset);
    
      // Build the base query and parameters
      let stockItemsQuery = `
      SELECT si.*, c.cateId 
      FROM stockitem si 
      INNER JOIN category c ON si.Category = c.Category AND si.StoreId = c.StoreId 
      WHERE si.StoreId = ?`;
      let totalCountQuery = `
      SELECT COUNT(*) as total 
      FROM stockitem si 
      INNER JOIN category c ON si.Category = c.Category AND si.StoreId = c.StoreId 
      WHERE si.StoreId = ?`;
      const queryParams = [storeId];
      const countQueryParams = [storeId];

      // Apply category filter if not 'All'
      if (category.toLowerCase() !== 'all') {
      stockItemsQuery += ' AND si.Category = ? AND si.Enable = 1';
      totalCountQuery += ' AND si.Category = ? AND si.Enable = 1';
      queryParams.push(category);
      countQueryParams.push(category);
      } else {
      stockItemsQuery += ' AND si.Enable = 1';
      totalCountQuery += ' AND si.Enable = 1';
      }

      // Apply search filter if search term is provided
      if (search.trim() !== '') {
      // Assuming you want to search in 'Description1', 'Description2', 'Description3', 'Description4'
      stockItemsQuery += ` 
        AND (si.Description1 LIKE ? 
            OR si.Description2 LIKE ? 
            OR si.Description3 LIKE ? 
            OR si.Description4 LIKE ? 
            OR si.StockId LIKE ?)`;
      totalCountQuery += ` 
        AND (si.Description1 LIKE ? 
            OR si.Description2 LIKE ? 
            OR si.Description3 LIKE ? 
            OR si.Description4 LIKE ? 
            OR si.StockId LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      for (let i = 0; i < 5; i++) {
        queryParams.push(searchPattern);
        countQueryParams.push(searchPattern);
      }
      }

      // Add ordering by cateId and StockId, then apply limit and offset
      stockItemsQuery += ' ORDER BY c.cateId, si.StockId LIMIT ? OFFSET ?';
      queryParams.push(itemsPerPage, offset);

      // Execute queries
      const stockItems = await executeDb(stockItemsQuery, queryParams, { fetchAll: true });
      const totalCountResults = await executeDb(totalCountQuery, countQueryParams, { fetchOne: true });
      
      const totalItems = totalCountResults.total;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      res.status(200).json({
        storeId: storeId,
        isMember: IsMember,
        items: stockItems,
        totalPages: totalPages,
        totalItems: totalItems
      });
      
    } catch (error) {
      console.error('Error fetching stock items:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/fetchStoreId/:storeUrl', async (req, res) => {
    const storeUrl = req.params.storeUrl;
  
    try {
     
      const storeQuery = 'SELECT StoreId FROM stores WHERE StoreUrl = ? LIMIT 1';
      const storeResults = await executeReportDb(storeQuery, [storeUrl], { fetchOne: true });
  
      if (storeResults) {
        res.status(200).json(storeResults);
      } else {
        res.status(404).json({ message: 'Store not found' });
      }
    } catch (error) {
      console.error('Error fetching store ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.get('/fetchProductDetail/:storeId/:productId', async (req, res) => {
    const storeId = req.params.storeId;
    const stockId = req.params.productId;
  
    try {
      const originToken = req.headers.authorization;
      let token, IsMember = false;
      if (originToken && originToken.startsWith('Bearer ')) {
        token = originToken.split(' ')[1];
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded && decoded.IsMember) {
          IsMember = true;
        }
      } catch (err) {
        // 忽略错误，IsMember 保持 false
      }
  
      // 查询当前商品详情
      const productQuery = 'SELECT * FROM stockitem WHERE StoreId = ? AND StockId = ? LIMIT 1';
      const productResults = await executeDb(productQuery, [storeId, stockId], { fetchOne: true });
  
      if (!productResults) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // 查询符合条件的记录总数
      const countQuery = `
        SELECT COUNT(*) AS count 
        FROM stockitem 
        WHERE StoreId = ? AND Category = ? AND StockId != ?
      `;
      const { count } = await executeDb(countQuery, [storeId, productResults.Category, stockId], { fetchOne: true });
  
      let relatedProducts = [];
      if (count > 0) {
        // 随机选择一个起点
        const randomOffset = Math.max(0, Math.floor(Math.random() * count) - 4);
  
        // 查询同类别其他商品
        const relatedProductsQuery = `
          SELECT * FROM stockitem 
          WHERE StoreId = ? AND Category = ? AND StockId != ?
          LIMIT ?, 4
        `;
        relatedProducts = await executeDb(relatedProductsQuery, [
          storeId, 
          productResults.Category, 
          stockId, 
          randomOffset
        ]);
      }
  
      res.status(200).json({ 
        product: productResults, 
        isMember: IsMember, 
        relatedProducts: relatedProducts 
      });
  
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
async function calculateFreight(storeId, storeUrl) {
  try{
  const fetchFreightQuery = `SELECT Freight FROM store_online_information WHERE StoreId = ?`;
  const freightResults = await executeDb(fetchFreightQuery, [storeId, storeUrl], { fetchOne: true });
  if (freightResults) {
    return freightResults.Freight;
  } else {
    return 0;
  }
} catch (error) {
  console.error('Error fetching freight:', error);
  return 0;
}
}

async function calculateTotalPrice(cartItems, storeId, storeUrl, deliveryMethod) {
  let total = 0;
  for (const item of cartItems) {
    // total += item.price * item.quantity+item.gstRate*0.01*item.price*item.quantity;
    total += item.price * item.quantity;
  }
  const fetchSurchargeQuery = `
  SELECT Surcharge 
  FROM store_online_information 
  WHERE StoreId = ?
`;
  const surchargeResults = await executeDb(fetchSurchargeQuery, [storeId, storeUrl], { fetchOne: true });
  if (surchargeResults && surchargeResults.Surcharge!== 0) {
    total = total+ total*surchargeResults.Surcharge*0.01;
  }
  let freight = 0;
  if (deliveryMethod === 'delivery') {
   freight = await calculateFreight(storeId, storeUrl);
  }
  total += freight;

  total = Math.round(total * 100) / 100;
  return {total, freight};
}


async function decrypt(text) {
  const secretKey = process.env.STRIPE_KEY_ENCRYPT_SECRET;
  const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32); // 扩展到32字节

  const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function encrypt(text) {
  const secretKey = process.env.STRIPE_KEY_ENCRYPT_SECRET;
  const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32); // 扩展到32字节

  const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

async function calculateTotal(storeId, tagSummary) {
  // 获取默认的unit和weight
  const defaultUnitQuery = `
      SELECT DefaultProductUnit, DefaultProductWeight 
      FROM store_online_information 
      WHERE StoreId = ?`;
  const defaultUnitResults = await executeDb(defaultUnitQuery, [storeId], { fetchOne: true });

  if (!defaultUnitResults) {
      throw new Error('Default unit information not found for the store.');
  }

  const defaultUnit = defaultUnitResults.DefaultProductUnit;


  const defaultWeight = defaultUnitResults.DefaultProductWeight;

  let totalUnit = 0;
  let totalWeight = 0;

  for (const key in tagSummary) {
      const { quantity, weight } = tagSummary[key];
      

      if (key === 'null' || key === null) {
          // Key is null, use default unit and add weight directly
          totalUnit += defaultUnit * quantity;
          totalWeight += weight;
        
      } else {
          // Fetch unit from database for the specific key
          const unitQuery = 'SELECT Capacity FROM item_tags WHERE Id = ?';
          const unitResults = await executeDb(unitQuery, [key], { fetchOne: true });
        

          if (unitResults && unitResults.Capacity) {
             
              totalUnit += unitResults.Capacity * quantity;
              totalWeight += weight;
              

          } else {
              // Fallback to default unit if unit not found
              totalUnit += defaultUnit * quantity;
              totalWeight += weight;
             
          }
      }
  }
  
  return { totalUnit, totalWeight };
}

// async function calculateDomesticPostage({
//   Length,
//   Width,
//   Height,
//   storeZip,
//   deliveryZip,
//   parcelWeight,
//   serviceCode = null,
//   apiKey
// }) {
//   console.log('calculateDomesticPostage:', {
//     Length,
//     Width,
//     Height,
//     storeZip,
//     deliveryZip,
//     parcelWeight,
//     serviceCode,
//     apiKey
//   });
//   const apiBaseUrl = 'https://digitalapi.auspost.com.au/postage/parcel/domestic';

//   // Step 1: Retrieve Available Postage Services
//   async function getAvailableServices() {
//     const queryParams = new URLSearchParams({
//       from_postcode: storeZip,
//       to_postcode: deliveryZip,
//       length: Length,
//       width: Width,
//       height: Height,
//       weight: parcelWeight
//     });
   
//     const url = `${apiBaseUrl}/service.json?${queryParams.toString()}`;

//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'AUTH-KEY': apiKey,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Error fetching services: ${response.status} ${response.statusText} - ${errorText}`);
//       }

//       const data = await response.json();
//       return data.services.service; // Array of available services
//     } catch (error) {
//       console.error('Error in getAvailableServices:', error.message);
//       throw error;
//     }
//   }

//   // Step 2: Calculate Total Delivery Price
//   async function calculatePrice(selectedServiceCode) {
//     const queryParams = new URLSearchParams({
//       from_postcode: storeZip,
//       to_postcode: deliveryZip,
//       length: Length,
//       width: Width,
//       height: Height,
//       weight: parcelWeight,
//       service_code: selectedServiceCode
//     });

//     const url = `${apiBaseUrl}/calculate.json?${queryParams.toString()}`;

//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'AUTH-KEY': apiKey,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Error calculating price: ${response.status} ${response.statusText} - ${errorText}`);
//       }

//       const data = await response.json();
//       return data.postage_result;
//     } catch (error) {
//       console.error('Error in calculatePrice:', error.message);
//       throw error;
//     }
//   }

//   try {
//     // Retrieve available services
//     const availableServices = await getAvailableServices();

//     if (availableServices.length === 0) {
//       throw new Error('No available postage services for the given parameters.');
//     }


//     availableServices.forEach(service => {
//       console.log(`- ${service.name} (${service.code}): $${service.price}`);
//     });

//     // 选择价格最低的服务
//     let selectedService;
//     if (serviceCode) {
//       // 如果提供了serviceCode，尝试找到对应的服务
//       selectedService = availableServices.find(service => service.code === serviceCode);
//       if (!selectedService) {
//         throw new Error('选择的服务代码不可用。');
//       }
//     } else {
//       // 否则，选择价格最低的服务
//       selectedService = availableServices.reduce((prev, current) => {
//         const prevPrice = parseFloat(prev.price);
//         const currentPrice = parseFloat(current.price);
//         return currentPrice < prevPrice ? current : prev;
//       }, availableServices[0]);
//     }   
//     // console.log(`\n选择的服务：${selectedService.name} (${selectedService.code}) - $${selectedService.price}`);

//     // Calculate the total delivery price
//     const postageResult = await calculatePrice(selectedService.code);

//     // console.log(`\nPostage Result:`);
//     // console.log(`Service: ${postageResult.service}`);
//     // console.log(`Delivery Time: ${postageResult.delivery_time}`);
//     // console.log(`Total Cost: $${postageResult.total_cost}`);

//     return postageResult;
//   } catch (error) {
//     console.error('Error in calculateDomesticPostage:', error.message);
//     throw error;
//   }
// }
async function calculateDomesticPostage({
  Length,
  Width,
  Height,
  storeZip,
  deliveryZip,
  parcelWeight,
  apiKey
}) {
 
  const apiBaseUrl = 'https://digitalapi.auspost.com.au/postage/parcel/domestic';

  // Step 1: Calculate Total Delivery Price for a Specific Service Code
  async function calculatePrice(serviceCode) {
    const queryParams = new URLSearchParams({
      from_postcode: storeZip,
      to_postcode: deliveryZip,
      length: Length,
      width: Width,
      height: Height,
      weight: parcelWeight,
      service_code: serviceCode
    });

    const url = `${apiBaseUrl}/calculate.json?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'AUTH-KEY': apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error calculating price: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.postage_result;
    } catch (error) {
      console.error('Error in calculatePrice:', error.message);
      throw error;
    }
  }

  try {
    // Define the target service codes
    const targetServiceCodes = ['AUS_PARCEL_EXPRESS', 'AUS_PARCEL_REGULAR'];

    // Fetch postage results for each target service code
    const results = {};
    for (const serviceCode of targetServiceCodes) {
      try {
        const postageResult = await calculatePrice(serviceCode);
        results[serviceCode] = postageResult;
      } catch (error) {
        console.error(`Error fetching result for ${serviceCode}:`, error.message);
      }
    }

    // Return the results for the target service codes
    // console.log('Results for target service codes:', results);
    return results;
  } catch (error) {
    console.error('Error in calculateDomesticPostage:', error.message);
    throw error;
  }
}

app.post('/calculateShippingCost', async (req, res) => {
  try {  
    const { storeUrl, tagSummary, deliveryZip } = req.body;
   
    const storeId = await getStoreIdByUrl(storeUrl); 

    // Step 1: Calculate Total Units and Total Weight
    const { totalUnit, totalWeight } = await calculateTotal(storeId, tagSummary);

    // Step 2: Determine the Number of Parcels Needed
    let numberOfParcels = 1;
    let weightPerParcel = totalWeight;
    let unitPerParcel = totalUnit;
    const MAX_PARCEL_WEIGHT = 22000; // in grams


    if (totalWeight > MAX_PARCEL_WEIGHT) {
      numberOfParcels = Math.ceil(totalWeight / MAX_PARCEL_WEIGHT);
       // Calculate weight and units per parcel
      weightPerParcel = (totalWeight / numberOfParcels).toFixed(2); 
      unitPerParcel = Math.ceil(totalUnit / numberOfParcels);
    
    }
  
   
    const chooseParcelQuery = `
        SELECT * 
        FROM parcelsetting 
        WHERE StoreId = ? AND Capacity >= ? 
        ORDER BY Capacity ASC 
        LIMIT 1`;
    let chooseParcelResults = await executeDb(chooseParcelQuery, [storeId, unitPerParcel], { fetchOne: true });

    if (!chooseParcelResults) {
      //选最大的包裹
      const chooseMaxParcelQuery = `
        SELECT * 
        FROM parcelsetting 
        WHERE StoreId = ? 
        ORDER BY Capacity DESC 
        LIMIT 1`;
      const chooseMaxParcelResults = await executeDb(chooseMaxParcelQuery, [storeId], { fetchOne: true });
      if (!chooseMaxParcelResults) {
        throw new Error('No parcel setting found for the store.');
      }
      chooseParcelResults = chooseMaxParcelResults;

    }
    const storeZipQuery = 'SELECT StoreLocationZip FROM store_online_information WHERE StoreId = ?';
    const storeZipResults = await executeDb(storeZipQuery, [storeId], { fetchOne: true });

    const { Length, Width, Height, ExtraCharge } = chooseParcelResults;
    const storeZip = storeZipResults.StoreLocationZip;
    if (unitPerParcel<=24 && weightPerParcel<=5000){
      weightPerParcel = 480;
    }
    else if (unitPerParcel> 24 && unitPerParcel<=36 && weightPerParcel<=5000){
      weightPerParcel = 960;
    }
    const parcelWeight= (weightPerParcel / 1000).toFixed(2);


   
    let result = await calculateDomesticPostage({
      Length,
      Width,
      Height,
      storeZip,
      deliveryZip,
      parcelWeight,
      apiKey: process.env.AUSPOST_API_KEY
    });
    
// {
//   AUS_PARCEL_EXPRESS: {
//     service: 'Express Post',
//     delivery_time: 'Guaranteed Next Business Day within the Express Post network (If posted on any business day Monday to Friday in accordance with the conditions set out on the item).',  
//     total_cost: '32.55',
//     costs: { cost: [Object] }
//   },
//   AUS_PARCEL_REGULAR: {
//     service: 'Parcel Post',
//     delivery_time: 'Delivered in 2-3 business days',
//     total_cost: '23.65',
//     costs: { cost: [Object] }
//   }
// }这个是result 要乘以数量
  result.AUS_PARCEL_EXPRESS.total_cost = result.AUS_PARCEL_EXPRESS.total_cost * numberOfParcels + ExtraCharge  * numberOfParcels;
  result.AUS_PARCEL_REGULAR.total_cost = result.AUS_PARCEL_REGULAR.total_cost * numberOfParcels + ExtraCharge  * numberOfParcels;


  res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
);

// 添加全局变量来存储未确认的订单
const orderPromises = {};

app.post('/placeOrder', async (req, res) => {
  try {
    const { storeId, cartItems, notes, surcharge, customerDetails, storeUrl, deliveryMethod, shippingCost, finalTotal, deliveryService } = req.body;
    
  
    if (!storeUrl || !storeId || !cartItems  || notes.length > 101) {
      
      return res.status(410).send('Invalid parameters');
    }

    const connection = await find_client_socket(storeId, storeUrl);
   
    if (connection === null) {
      return res.status(411).send('Store is not available. Please contact store owner.');
    }

    // calculate total price function
    // const {total, freight} = await calculateTotalPrice(cartItems, storeId, storeUrl, deliveryMethod);
    const total = finalTotal;
    const freight = shippingCost;
    const amountInCents = Math.round(total * 100);

    const timeZoneResult = await executeReportDb('SELECT Location FROM stores WHERE StoreId = ? LIMIT 1', [storeId], { fetchOne: true });
    let orderTime;

    if (timeZoneResult.Location === 'Melbourne'){
      orderTime = moment().tz('Australia/Melbourne').format('YYYY-MM-DD HH:mm:ss');
    }
    else if (timeZoneResult.Location === 'Sydney'){
      orderTime = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
    }
    else if (timeZoneResult.Location === 'Brisbane'){ 
      orderTime = moment().tz('Australia/Brisbane').format('YYYY-MM-DD HH:mm:ss');
    }    
    orderTime= String(orderTime);

    //处理client订单部分
    let onlineCustomerId;
    let { email, password, firstName, middleName, lastName, phone, ABN, companyName, billingAddress, deliveryAddress } = customerDetails;
    deliveryAddress = deliveryAddress || billingAddress;
   
    const emailExistsQuery = `
      SELECT CustomerId FROM customers 
      WHERE CustomerEmail = ? AND StoreId = ?
    `;
    const emailExistsResults = await executeDb(emailExistsQuery, [email, storeId, firstName,  lastName]);
   
    if (emailExistsResults.length > 0) {
      onlineCustomerId = emailExistsResults[0].CustomerId;
      const updateCustomerQuery = `
        UPDATE customers 
        SET CustomerPhone = ?,ABN = ?, Address = ?, Suburb = ?, State = ?, Country = ?, PostCode = ?, 
            DeliveryAddress = ?, DeliverySuburb = ?, DeliveryState = ?, DeliveryCountry = ?, DeliveryPostCode = ? ,CompanyName = ?
        WHERE CustomerId = ?
      `;
      await executeDb(updateCustomerQuery, [
        phone, ABN, billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.country, billingAddress.zip,
        deliveryAddress.address, deliveryAddress.city, deliveryAddress.state, deliveryAddress.country, deliveryAddress.zip, companyName,
        onlineCustomerId
      ]);
    } else {
      const query = `
        INSERT INTO customers (
          CustomerEmail, Password, StoreId, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, CreatedAt, ABN, Address, Suburb, State, PostCode, Country, 
          DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, CompanyName
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const result = await executeDb(query, [
        email, hashedPassword, storeId, firstName, middleName, lastName, phone, ABN, billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.zip, billingAddress.country,
        deliveryAddress.address, deliveryAddress.city, deliveryAddress.state, deliveryAddress.zip, deliveryAddress.country, companyName
      ]);

      onlineCustomerId = result.insertId;
    }

    // 处理订单部分
    try {
      const timeZoneResult = await executeReportDb('SELECT Location FROM stores WHERE StoreId = ? LIMIT 1', [storeId]);
      const location = timeZoneResult.Location;

      let orderTime;
      if (location) {
        const timeZones = {
          'Melbourne': 'Australia/Melbourne',
          'Sydney': 'Australia/Sydney',
          'Brisbane': 'Australia/Brisbane'
        };
        orderTime = moment().tz(timeZones[location] || 'UTC').format('YYYY-MM-DD HH:mm:ss');
      } else {
        orderTime = moment().format('YYYY-MM-DD HH:mm:ss');
      }

      const orderInsertQuery = `
      INSERT INTO orders (
          StoreId, CustomerId, OrderStatus, Amount, Surcharge, CreatedAt, Notes, Freight, 
          DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, DeliveryMethod, 
          BillAddress, BillSuburb, BillState, BillPostCode, BillCountry, 
          BillEmail, BillSurname, BillMiddleName, BillLastName, BillPhone, ABN, CompanyName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const orderResults = await executeDb(orderInsertQuery, [
      storeId, onlineCustomerId, "pending", total, surcharge, orderTime, notes + deliveryService, freight, 
      deliveryAddress.address, deliveryAddress.city, deliveryAddress.state, deliveryAddress.zip, "Australia", deliveryMethod, 
      billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.zip, "Australia", 
      email, firstName, middleName, lastName, phone, ABN, companyName
  ]);
  
      const orderId = orderResults.insertId;

      for (const item of cartItems) {
  
        const { stockId, quantity, price, gstRate, stockOnlineId, deductQty, priceId, subDescription } = item;
        
        const orderItemInsertQuery = `
          INSERT INTO orderitems (StoreId, StockId, StockOnlineId, Quantity, Price, GSTRate, OrderId, PriceId, DeductQty, SubDescription) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executeDb(orderItemInsertQuery, [storeId, stockId, stockOnlineId, quantity, price, gstRate, orderId, priceId, deductQty, subDescription]);
      }
      orderPromises[orderId] = {};  // 初始化为一个空对象

      orderPromises[orderId].promise = new Promise((resolve, reject) => {
          orderPromises[orderId].resolve = resolve;
          orderPromises[orderId].reject = reject;
      });

      const encryptedOrderId = await encrypt(orderId.toString());

      const privateKeyQuery = 'SELECT StripePrivateKey FROM stores WHERE StoreId = ? LIMIT 1';
      const result = await executeReportDb(privateKeyQuery, [storeId], { fetchOne: true });
      
      const stripePrivateKey = await decrypt(result.StripePrivateKey);
      const stripe = require('stripe')(stripePrivateKey);

    
      
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'aud',
              product_data: {
                name: 'Total Amount',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.REACT_APP_FONT_ONLINEORDER_URL}/order-processing/${storeUrl}/${encryptedOrderId}`,
          cancel_url: `${process.env.REACT_APP_FONT_ONLINEORDER_URL}/checkout/${storeUrl}/${encryptedOrderId}`,
          metadata: {
            storeId: storeId,
            orderId: orderId,
           
          },
        });
        
        try {
         
          // 如果成功，发送响应
          res.json({ url: session.url });
        } catch (error) {
            console.error('Error waiting for order confirmation:', error);
            res.status(500).send('An error occurred');
        }

      } catch (error) {
        console.error('Error creating Stripe Checkout session:', error);
        res.status(500).send('An error occurred');
      }

    } catch (error) {
      console.error('Order error:', error);
      res.status(500).json({ success: false, message: 'Failed to process order' });
    }
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post('/placeNoPayOrder', async (req, res) => {
  try {
    
    const { storeId, cartItems, notes, surcharge, customerDetails, storeUrl } = req.body;


    if (!storeUrl || !storeId || !cartItems  || notes.length > 101) {
      
      return res.status(410).send('Invalid parameters');
    }

    // calculate total price function
    const {total, freight} = await calculateTotalPrice(cartItems, storeId, storeUrl);

    const amountInCents = Math.round(total * 100);

    const timeZoneResult = await executeReportDb('SELECT Location FROM stores WHERE StoreId = ? LIMIT 1', [storeId], { fetchOne: true });
    let orderTime;

    if (timeZoneResult.Location === 'Melbourne'){
      orderTime = moment().tz('Australia/Melbourne').format('YYYY-MM-DD HH:mm:ss');
    }
    else if (timeZoneResult.Location === 'Sydney'){
      orderTime = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
    }
    else if (timeZoneResult.Location === 'Brisbane'){ 
      orderTime = moment().tz('Australia/Brisbane').format('YYYY-MM-DD HH:mm:ss');
    }    
    orderTime= String(orderTime);

    //处理client订单部分
    let onlineCustomerId;
    let { email, password, firstName, middleName, lastName, phone, ABN, billingAddress, deliveryAddress } = customerDetails;
    deliveryAddress = deliveryAddress || billingAddress;

    const emailExistsQuery = `
      SELECT CustomerId FROM customers 
      WHERE CustomerEmail = ? AND StoreId = ? AND CustomerSurname = ? AND CustomerLastName = ?
    `;
    const emailExistsResults = await executeDb(emailExistsQuery, [email, storeId, firstName,  lastName]);
   
    if (emailExistsResults.length > 0) {
      onlineCustomerId = emailExistsResults[0].CustomerId;
      const updateCustomerQuery = `
        UPDATE customers 
        SET CustomerPhone = ?,ABN = ?,Address = ?, Suburb = ?, State = ?, Country = ?, PostCode = ?, 
            DeliveryAddress = ?, DeliverySuburb = ?, DeliveryState = ?, DeliveryCountry = ?, DeliveryPostCode = ? 
        WHERE CustomerId = ?
      `;
      await executeDb(updateCustomerQuery, [
        phone, ABN, billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.country, billingAddress.zip,
        deliveryAddress.address, deliveryAddress.city, deliveryAddress.state, deliveryAddress.country, deliveryAddress.zip,
        onlineCustomerId
      ]);
    } else {
      const query = `
        INSERT INTO customers (
          CustomerEmail, Password, StoreId, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, CreatedAt, ABN, Address, Suburb, State, PostCode, Country, 
          DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const result = await executeDb(query, [
        email, hashedPassword, storeId, firstName, middleName, lastName, phone, ABN, billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.zip, billingAddress.country,
        deliveryAddress.address, deliveryAddress.city, deliveryAddress.state, deliveryAddress.zip, deliveryAddress.country
      ]);

      onlineCustomerId = result.insertId;
    }

    // 处理订单部分
    try {
      const timeZoneResult = await executeReportDb('SELECT Location FROM stores WHERE StoreId = ? LIMIT 1', [storeId]);
      const location = timeZoneResult.Location;

      let orderTime;
      if (location) {
        const timeZones = {
          'Melbourne': 'Australia/Melbourne',
          'Sydney': 'Australia/Sydney',
          'Brisbane': 'Australia/Brisbane'
        };
        orderTime = moment().tz(timeZones[location] || 'UTC').format('YYYY-MM-DD HH:mm:ss');
      } else {
        orderTime = moment().format('YYYY-MM-DD HH:mm:ss');
      }

      const orderInsertQuery = `
        INSERT INTO orders (StoreId, CustomerId, OrderStatus, Amount, Surcharge, CreatedAt, Notes, Freight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const orderResults = await executeDb(orderInsertQuery, [storeId, onlineCustomerId, "pending", total, surcharge, orderTime, notes, freight]);
      const orderId = orderResults.insertId;

      for (const item of cartItems) {
        const { stockId, quantity, price, gstRate, stockOnlineId, deductQty, priceId, subDescription } = item;
        const orderItemInsertQuery = `
          INSERT INTO orderitems (StoreId, StockId, StockOnlineId, Quantity, Price, GSTRate, OrderId, PriceId, DeductQty, SubDescription) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executeDb(orderItemInsertQuery, [storeId, stockId, stockOnlineId, quantity, price, gstRate, orderId, priceId, deductQty, subDescription]);
      }

      // 发送订单到 POS 系统（不等待确认）
      try {
        await handlePaymentSuccess(storeId, orderId, null, 0);
      } catch (error) {
        console.error('Error sending order to POS:', error);
        // 即使发送失败，订单也已经创建，继续返回成功
      }

      // 直接返回成功，不等待 POS 确认
      const encryptedOrderId = await encrypt(orderId.toString());
      res.json({ url: `${process.env.REACT_APP_FONT_ONLINEORDER_URL}/order-success/${storeUrl}/${encryptedOrderId}` });

    } catch (error) {
      console.error('Order error:', error);
      res.status(500).json({ success: false, message: 'Failed to process order' });
    }
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/deleteOrder/:encryptedOrderId', async (req, res) => {
  try {
    const { encryptedOrderId } = req.params;
    const orderId = await decrypt(encryptedOrderId);
    
    const orderIdInt = parseInt(orderId, 10);

    if (orderPromises[orderIdInt]) {
  
      delete orderPromises[orderIdInt];
      await deleteOrder(orderIdInt);
      const deleteOrderItemsQuery = 'DELETE FROM orderitems WHERE OrderId = ?';
      await executeDb(deleteOrderItemsQuery, [orderIdInt]);
      const deleteOrderQuery = 'DELETE FROM orders WHERE OrderId = ?';
      await executeDb(deleteOrderQuery, [orderIdInt]);
    }
    res.status(200).send('Order deleted');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal server error');
  }
});

async function handlePaymentSuccess(storeId, orderId, stripePaymentId, amount) {
    

  try {
    // 查询数据库以获取 Socket ID
    if (amount !== 0 || stripePaymentId) {

      const orderUpdateQuery = 'UPDATE orders SET Paid = ?, StripePaymentId = ? WHERE OrderId = ?';
      await executeDb(orderUpdateQuery, [amount, stripePaymentId, orderId], { fetchOne: true });
    }
    const orderItemsQuery = 'SELECT * FROM orderitems WHERE OrderId = ?';
    const orderItems = await executeDb(orderItemsQuery, [orderId], { fetchAll: true });
    const cartItems = [];
    for (const item of orderItems) {
      cartItems.push({
        stockId: item.StockId,
        quantity: item.Quantity,
        price: item.Price,
        gstRate: item.GSTRate,
        stockOnlineId: item.OrderItemId,
        deductQty: item.DeductQty,
        priceId: item.PriceId
      });
    }
   
    const orderQuery = 'SELECT * FROM orders WHERE OrderId = ?';
    const orderResults = await executeDb(orderQuery, [orderId], { fetchOne: true });
    const { CustomerId, Paid, StripePaymentId, Surcharge, Notes, Freight, DeliveryMethod } = orderResults;
    const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
    const customerResults = await executeDb(customerQuery, [CustomerId], { fetchOne: true });
    const { CustomerEmail, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, CustomCustomerId } = customerResults;

    // 如果 CustomCustomerId 不为 null，使用它；否则使用 CustomerId
    const displayCustomerId = CustomCustomerId ? CustomCustomerId : "ZA"+CustomerId;

    const orderDetail = {
      onlineOrderId: orderId,
      onlineCustomerId: displayCustomerId,
      paid: 0,
      paymentMethod: null,
      paymentId: StripePaymentId? StripePaymentId : "",
      surcharge: Surcharge,
      freight: Freight,
      orderNotes: Notes,
      itemDetails: cartItems,
      deliveryMethod: DeliveryMethod,
      customer: {
        onlineCustomerId: displayCustomerId,
        customerName: `${CustomerSurname} ${CustomerMiddleName ? CustomerMiddleName + ' ' : ''}${CustomerLastName}`,
        mobile: CustomerPhone,
        email:CustomerEmail,
        ABN: ABN? ABN : "",
        companyName: customerResults.CompanyName ? customerResults.CompanyName : "",
        address: Address,
        suburb: Suburb,
        state: State,
        postCode: PostCode,
        country: Country,
        deliveryAddress: DeliveryAddress,
        deliverySuburb: DeliverySuburb,
        deliveryState: DeliveryState,
        deliveryPostCode: DeliveryPostCode,
        deliveryCountry: DeliveryCountry
      }
    };
    console.log('orderDetail:', orderDetail);
    const clientSocketId = await find_client_socket(storeId);
    console.log('clientSocketId:', clientSocketId);
    if (clientSocketId) {
  
      io.to(clientSocketId).emit('saveOrder', { orderDetail });
      console.log('Order sent to store client');
    } else {
      throw new Error('Store client not connected');
    }


    
  } catch (error) {
    console.error(`Error in handlePaymentSuccess for store ${storeId}:`, error);
  }
}

async function deleteOrder(storeId, orderId) {
  console.log('Deleting order:', orderId);
  const deleteOrderQuery = 'DELETE FROM orders WHERE StoreId = ? AND OrderId = ?';
  await executeDb(deleteOrderQuery, [storeId, orderId]);
  
  const deleteOrderItemsQuery = 'DELETE FROM orderitems WHERE StoreId = ? AND OrderId = ?';
  await executeDb(deleteOrderItemsQuery, [storeId, orderId]);
}

async function deleteOrder(orderId) {
  console.log('Deleting order:', orderId);
  const deleteOrderItemsQuery = 'DELETE FROM orderitems WHERE OrderId = ?';
  await executeDb(deleteOrderItemsQuery, [ orderId]);

  const deleteOrderQuery = 'DELETE FROM orders WHERE OrderId = ?';
  await executeDb(deleteOrderQuery, [orderId]);
}

app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (request, response) => {


  // let event;

  // try {
  //   const sig = request.headers['stripe-signature'];

  //   // 假设你已经从数据库获取了 Webhook Secret
  //   const webhookSecretQuery = 'Select StripePrivateKey, StripeWebhookKey FROM stores WHERE StoreId = ? LIMIT 1';

  //   const storeId = request.body.data.object.metadata.storeId; // 不需要 JSON.parse
  //   const StripePaymentId = request.body.data.object.payment_intent;
 

  //   // const result = await executeReportDb(webhookSecretQuery, [storeId], { fetchOne: true });
  
  //   // const webhookSecret = await decrypt(result.StripeWebhookKey);
  //   // const stripePrivateKey = await decrypt(result.StripePrivateKey);
  
  //   // const stripe = require('stripe')(stripePrivateKey);

  //   // event = await stripe.webhooks.constructEvent(request.body, sig, webhookSecret);

  // } catch (err) {
  //   console.error(`Webhook Error: ${err.message}`);
  //   return response.status(400).send(`Webhook Error: ${err.message}`);
  // }
  
  // console.log('event:', event.type);
 
  switch (request.body.type) {
    case 'checkout.session.completed':
      const stripePaymentId = request.body.data.object.payment_intent;

      const orderId = request.body.data.object.metadata.orderId;
      const storeId = request.body.data.object.metadata.storeId;
      const amount = request.body.data.object.amount_total / 100;

      console.log(`Payment successful for order ${orderId}, store ${storeId}, amount ${amount}`);

      // Update order status to paid
      try {
        await executeDb(
          'UPDATE orders SET OrderStatus = ?, Paid = ?, StripePaymentId = ? WHERE OrderId = ?',
          ['paid', amount, stripePaymentId, orderId]
        );
        console.log(`Order ${orderId} marked as paid`);
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
      }

      // 处理支付成功的逻辑
      await handlePaymentSuccess(storeId, orderId, stripePaymentId, amount);
      break;

    default:
      const failedPaymentIntent = request.body.data.object;
      const failedStoreId = failedPaymentIntent.metadata.storeId;
      const failedOrderId = failedPaymentIntent.metadata.orderId;

      try {
        await deleteOrder(failedStoreId, failedOrderId);
        console.log(`Order ${failedOrderId} for store ${failedStoreId} has been deleted due to payment failure or other event.`);
      } catch (error) {
        console.error(`Failed to delete order ${failedOrderId} for store ${failedStoreId}:`, error);
      }
      break;
  }
  
  response.status(200).send({received: true});
});

app.get('/checkOrderStatus/:encryptedOrderId', async (req, res) => {
  try {
    const { encryptedOrderId } = req.params;
    const orderId = await decrypt(encryptedOrderId);
    const orderIdInt = parseInt(orderId, 10);
    
    const orderQuery = 'SELECT OrderStatus, Paid, StripePaymentId FROM orders WHERE OrderId = ?';
    const orderResults = await executeDb(orderQuery, [orderIdInt], { fetchOne: true });
    
    if (orderResults) {
      res.status(200).json({
        success: true,
        orderStatus: orderResults.OrderStatus,
        paid: orderResults.Paid,
        stripePaymentId: orderResults.StripePaymentId
      });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error checking order status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/fetchOrder/:encryptedOrderId', async (req, res) => {
  try {
    const { encryptedOrderId } = req.params;
    const orderId = await decrypt(encryptedOrderId);
    const orderIdInt = parseInt(orderId, 10);
    
    const orderQuery = 'SELECT * FROM orders WHERE OrderId = ?';
    const orderResults = await executeDb(orderQuery, [orderIdInt], { fetchOne: true });
    if (orderResults) {
      const orderItemsQuery = 'SELECT * FROM orderitems JOIN stockitem ON orderitems.StockId = stockitem.StockId WHERE orderitems.OrderId = ?';

      const orderItems = await executeDb(orderItemsQuery, [orderIdInt], { fetchAll: true });
      const cartItems = [];
      for (const item of orderItems) {
        cartItems.push({
          description1: item.Description1,
          description2: item.Description2,
          subDescription: item.SubDescription,

          stockId: item.StockId,
          quantity: item.Quantity,
          price: item.Price,
          gstRate: item.GSTRate,
          stockOnlineId: item.OrderItemId,
          imgUrl: `${process.env.REACT_APP_SERVER_URL}/images/${item.StoreId}/stockItems/${item.StockId}.jpg`
        });
      }

      const { CustomerId, Paid, StripePaymentId, Surcharge, Notes, Freight,DeliveryMethod } = orderResults;
      const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
      const customerResults = await executeDb(customerQuery, [CustomerId], { fetchOne: true });
      const { CustomerEmail, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry } = customerResults;
      res.status(200).json({
        onlineOrderId: orderId,
        orderDate: orderResults.CreatedAt,
        onlineCustomerId: CustomerId,
        paid: Paid,
        paymentMethod: "Stripe",
        paymentId: StripePaymentId,
        surcharge: Surcharge,
        freight: Freight,
        orderNotes: Notes,
        itemDetails: cartItems,
        deliveryMethod: DeliveryMethod,

        customer: {
          onlineCustomerId: CustomerId,
          customerName: `${CustomerSurname} ${CustomerMiddleName ? CustomerMiddleName + ' ' : ''}${CustomerLastName}`,
          mobile: CustomerPhone,
          email:CustomerEmail,
          ABN,
          address: Address,
          suburb: Suburb,
          state: State,
          postCode: PostCode,
          country: Country,
          deliveryAddress: DeliveryAddress,
          deliverySuburb: DeliverySuburb,
          deliveryState: DeliveryState,
          deliveryPostCode: DeliveryPostCode,
          deliveryCountry: DeliveryCountry
        }
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const getStoreIdByUrl = async (storeUrl) => {
  const storeQuery = 'SELECT StoreId FROM stores WHERE StoreUrl = ? LIMIT 1';
  const storeResults = await executeReportDb(storeQuery, [storeUrl], { fetchOne: true });
  if (storeResults) {
    return storeResults.StoreId;
  } else {
    return null;
  }
}


app.get('/store-config', async (req, res) => {
  try {
    const storeUrl = req.query.storeUrl;
   
    const storeId = await getStoreIdByUrl(storeUrl); 
    const storeQuery = 'SELECT * FROM store_online_information WHERE StoreId = ?';
    let storeResults = await executeDb(storeQuery, [storeId], { fetchOne: true });
    const storeInfoQuery = 'SELECT * FROM stores WHERE StoreId = ?';
    const storeInfoResults = await executeReportDb(storeInfoQuery, [storeId], { fetchOne: true });
    storeResults = { ...storeResults, StorePhone: storeInfoResults.StorePhone, // 单独取出需要的字段
      StoreAddress: storeInfoResults.StoreAddress };
    if (storeResults) {
      res.status(200).json(storeResults);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    console.error('Error fetching store config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


  // app.post('/confirmOrder', async (req, res) => {
  //   try{

  //     const confirmOrder = req.body.confirmOrder;
  
  //     const appId = req.headers.appid;
  //     const nonce = req.headers.nonce;
  //     const shopId = req.headers.shopid;
  //     const receivedSign = req.headers.sign;
  //     const isAuthenticated = await authenticateStore(shopId, appId);
  //     if (isAuthenticated) {
  //       const isValid = await verifySignature(appId, nonce, '/confirmOrder', shopId, receivedSign);
  //       if (isValid) {
  //         try {
            
  //           // const {onlineOrderId, enrichOrderId, success} = confirmOrder;
  //           const {enrichOrderId, success, onlineOrderId} = confirmOrder;
  //           let confirmOrderQuery;
  //           if (enrichOrderId === "") {
  //             confirmOrderQuery = 'UPDATE store_order SET Success = ?, OrderEnrichNo = NULL WHERE OrderId = ?';
  //           }
  //           else {
  //             confirmOrderQuery = 'UPDATE store_order SET Success = ?, OrderEnrichNo = ? WHERE OrderId = ?';
  //           }
  //           await executeOnlineOrderDb(confirmOrderQuery, [success, enrichOrderId, onlineOrderId]);
            
  
  //           try {
  //             if (orderPromises[onlineOrderId]) {
  //                 // console.log('Resolving promise for orderId:', onlineOrderId);
  //                 // orderPromises[onlineOrderId].resolve({ enrichOrderId: onlineOrderId });
  //                 orderPromises[onlineOrderId].resolve();
  //                 delete orderPromises[onlineOrderId];
  //                 res.status(200).json({ success: true, message: 'Order confirmed' });
  //             } else {
  //                 console.log('No promise found for orderId:', onlineOrderId);
  //                 res.status(404).json({ success: false, message: 'Order ID not found' });
  //             }
  //         } catch (error) {
  //             console.error('Error in confirmOrder:', error);
  //             res.status(500).json({ success: false, message: 'Error when confirming the order' });
  //         }
            
  //         } catch (error) {
  //           console.error('ERROR: ', error);
            
  //           res.status(400).json({ success: false, message: 'Error when confirming the order' });
  //         }
  //       }
  //       else {
  //         res.status(400).json({ success: false, message: 'md5 failed' });
  //       }
  //     }
  //     else {
  //       res.status(400).json({ success: false, message: 'Authorization error' });
  //     }
  //   } catch (error) {
  //     console.error('Errors occur during order confirming.', error);
  //     res.status(400).json({ success: false, message: 'Errors occur during order confirming.' });
  //   }
  //   });


async function AliYunSendEmail( recipientEmail, subject, htmlContent) {
  try {
      // 创建阿里云DirectMail服务的API客户端
    

      const client = new Core({
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,         
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,  
        endpoint: 'https://dm.ap-southeast-2.aliyuncs.com',    // 使用ap-southeast-2的Endpoint
        apiVersion: '2015-11-23'
      });

    


      // 定义邮件发送的参数
      const params = {
          "RegionId": "ap-southeast-2", // 请根据你的实际使用区域选择，例如 cn-hangzhou
          "AccountName": process.env.ALIYUN_EMAIL_ACCOUNT_NAME, // 发信地址
          "AddressType": 1, // 发信地址类型，1表示发信地址是经过认证的
          "ReplyToAddress": false, // 是否使用回信地址
          "ToAddress": recipientEmail, // 收件人邮箱
          "Subject": subject, // 邮件主题
          "HtmlBody": htmlContent // 邮件HTML内容
      };

      // 发送邮件
      
      let result = await client.request('SingleSendMail', params, { method: 'POST' });
     
      return { success: true, response: result };
      
  } catch (error) {
      console.error('Error sending email: ', error);
      return { success: false, error: error.message };
  }
}



app.post('/registerCustomer', async (req, res) => {
  try { 
    console.log('Registering customer:', req.body);
    const { email, password, storeId, deliveryAddress } = req.body;
    let isSignUp = 0;

    if (password) {
      isSignUp = 1;
    }

    // 检查用户是否存在
    const emailExistsQuery = `
      SELECT CustomerId FROM customers 
      WHERE CustomerEmail = ? 
      AND StoreId = ? 
     
      
    `;
    const emailExistsResults = await executeDb(emailExistsQuery, [email, storeId], { fetchAll: true });

    let customerId;
   
    if (deliveryAddress === null) {
      req.body.deliveryAddress = req.body.billingAddress
    }
    try {
     
      if (emailExistsResults.length > 0) {
       res.status(201).json({ success: false, message: 'Email already exists' });

      } else {
        // 如果用户不存在，插入新记录
        const insertQuery = `
          INSERT INTO customers (
            CustomerEmail, Password, StoreId, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, CreatedAt, ABN, Address, Suburb, State, PostCode, Country, 
            DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let hashedPassword = null;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }
        if (req.body.deliveryAddress === null) {
          req.body.deliveryAddress = req.body.billingAddress
        }


        const result = await executeDb(insertQuery, [
          email, hashedPassword, storeId, req.body.firstName, req.body.middleName, req.body.lastName, req.body.phone, req.body.ABN, req.body.billingAddress.address, req.body.billingAddress.city, req.body.billingAddress.state, req.body.billingAddress.zip, req.body.billingAddress.country,
          req.body.deliveryAddress.address, req.body.deliveryAddress.city, req.body.deliveryAddress.state, req.body.deliveryAddress.zip, req.body.deliveryAddress.country
        ], { commit: true });

        res.status(200).json({ success: true, message: 'Customer registered successfully' });
       
      }

    } catch (error) {
      console.error('Error registering customer:', error);
      
      res.status(500).json({ success: false, message: 'Internal server error' });
    } 
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/admin-create-user', async (req, res) => {
  try {
    const origin_token = req.headers.authorization;

    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (decoded.storeAdmin) {
        try {
          const { CustomerSurname, CustomerMiddleName, CustomerLastName , StoreId, Password, CustomerEmail, IsMember, CustomerPhone, CustomCustomerId } = req.body;
      
          // 如果提供了自定义 CustomCustomerId，检查该 ID 在该 store 中是否已存在
          if (CustomCustomerId) {
            const checkQuery = 'SELECT CustomerId FROM customers WHERE CustomCustomerId = ? AND StoreId = ?';
            const existingCustomer = await executeDb(checkQuery, [CustomCustomerId, decoded.storeId]);
            
            if (existingCustomer.length > 0) {
              return res.status(409).json({ success: false, message: 'Custom Customer ID already exists in this store' });
            }
          }

          const hashedPassword = await bcrypt.hash(Password, 10);
          
          // CustomerId 由数据库自动生成，CustomCustomerId 是可选的自定义字段
          let query, params;
          if (CustomCustomerId) {
            query = `
              INSERT INTO customers (CustomerSurname, CustomerMiddleName, CustomerLastName, StoreId, Password, CustomerEmail, IsMember, CustomerPhone, CustomCustomerId) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            params = [CustomerSurname, CustomerMiddleName, CustomerLastName, decoded.storeId, hashedPassword, CustomerEmail, IsMember, CustomerPhone, CustomCustomerId];
          } else {
            query = `
              INSERT INTO customers (CustomerSurname, CustomerMiddleName, CustomerLastName, StoreId, Password, CustomerEmail, IsMember, CustomerPhone) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            params = [CustomerSurname, CustomerMiddleName, CustomerLastName, decoded.storeId, hashedPassword, CustomerEmail, IsMember, CustomerPhone];
          }
          
          await executeDb(query, params);
          res.status(200).json({ success: true, message: 'User created successfully' });
        } catch (error) {
          console.error('Error creating user:', error);
          
          // 处理重复邮箱错误
          if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('CustomerEmail')) {
              return res.status(409).json({ success: false, message: 'Email address already exists' });
            } else if (error.sqlMessage.includes('CustomCustomerId')) {
              return res.status(409).json({ success: false, message: 'Custom Customer ID already exists in this store' });
            }
          }
          
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/admin-update-user-new-status', authenticateJWT, async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { CustomerId } = req.body;
   
    const query = 'UPDATE customers SET IsNew = 1 WHERE CustomerId = ? and StoreId = ?';
    await executeDb(query, [CustomerId, storeId]);
    res.status(200).json({ success: true, message: 'User status updated successfully' });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.put('/admin-update-user/:customerId', async (req, res) => {
  try {
    const origin_token = req.headers.authorization;

    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (decoded.storeAdmin) {
        const { CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, IsMember, CustomerPhone,
          AssociationName,AssociationId, ABN, Address, CompanyName, Suburb, State, PostCode, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode,
         } = req.body;
        
        const query = `
          UPDATE customers 
          SET CustomerSurname = ?, CustomerMiddleName = ?, CustomerLastName = ?, CustomerEmail = ?, IsMember = ?, CustomerPhone = ?
          , ABN = ?, Address = ?, Suburb = ?, State = ?, PostCode = ?, DeliveryAddress = ?, DeliverySuburb = ?, DeliveryState = ?, DeliveryPostCode = ?,
          CompanyName = ?, AssociationName = ?, AssociationId = ?
          WHERE CustomerId = ? and StoreId = ?
        `;
        await executeDb(query, [CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, IsMember, CustomerPhone, ABN, Address, Suburb, State, PostCode, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, CompanyName, AssociationName, AssociationId, req.params.customerId, decoded.storeId]);

        res.status(200).json({ success: true, message: 'User updated successfully' });
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.delete('/admin-delete-user/:customerId', async (req, res) => {
  try {
    const origin_token = req.headers.authorization;
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (decoded.storeAdmin) {
        const query = 'DELETE FROM customers WHERE CustomerId = ? and StoreId = ?';
        try {
          await executeDb(query, [req.params.customerId, decoded.storeId]);
          res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (dbError) {
          if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete customer because they have related orders.',
            });
          }
          throw dbError; // 如果不是外键错误，抛出异常继续处理
        }
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post('/admin-reset-user-password', async (req, res) => {
  try{
    const origin_token = req.headers.authorization;
    if(!origin_token){
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      if (decoded.storeAdmin) {
        const { CustomerId } = req.body;  
        const hashedPassword = await bcrypt.hash("0000", 10);
        const query = 'UPDATE customers SET Password = ? WHERE CustomerId = ? and StoreId = ?';
        await executeDb(query, [hashedPassword, CustomerId, decoded.storeId]);
        res.status(200).json({ success: true, message: 'Password reset successfully' });
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// app.post('/loginCustomer', async (req, res) => {
//   try {
    
//     const { email, password, storeId } = req.body;
//     const maxLoginAttempts = 10;
//     const windowMs = 60 * 60;
//     const key = `login_attempts_${email}`;

//     const attempts = await getAsync(key);
//     if (attempts >= maxLoginAttempts) {
//       return res.status(429).json({ success: false, message: 'Too many login attempts. Please try again later.' });
//     }

//     const query = 'SELECT CustomerId, Password FROM customers WHERE CustomerEmail = ? AND StoreId = ?';
//     const results = await executeDb(query, [email, storeId], { fetchOne: true });

//     if (results) {
//       const { CustomerId, Password } = results;

//       const passwordMatch = await bcrypt.compare(password, Password);

//       if (passwordMatch) {
//         const fetchCustomerQuery = 'SELECT CustomerId, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry FROM customers WHERE CustomerId = ?';
//         const customerResults = await executeDb(fetchCustomerQuery, [CustomerId], { fetchOne: true });

//         const customer = {
//           customerId: CustomerId,
//           customerSurname: customerResults.CustomerSurname,
//           customerMiddleName: customerResults.CustomerMiddleName,
//           customerLastName: customerResults.CustomerLastName,

//           phone: customerResults.CustomerPhone,
//           CustomerEmail: email,
//           ABN: customerResults.ABN,
//           billingAddress: {
//             address: customerResults.Address,
//             city: customerResults.Suburb,
//             state: customerResults.State,
//             zip: customerResults.PostCode,
//             country: customerResults.Country
//           },
//           deliveryAddress: {
//             address: customerResults.DeliveryAddress,
//             city: customerResults.DeliverySuburb,
//             state: customerResults.DeliveryState,
//             zip: customerResults.DeliveryPostCode,
//             country: customerResults.DeliveryCountry
//           }
//         };
//         const token = jwt.sign({ userId: customerResults.CustomerId, IsMember:customerResults.IsMember},  process.env.JWT_SECRET_KEY, { expiresIn: '10y' });

//         res.status(200).json({ success: true, customerId: CustomerId, user: customer, userForHeader:customerResults, token });
//       } else {
//         res.status(401).json({ success: false, message: 'Incorrect password' });
//       }
//     } else {
//       res.status(404).json({ success: false, message: 'Customer not found' });
//     }
//   } catch (error) {
//     console.error('Error logging in customer:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// }
// );


app.post('/confirmCustomerSaving', async (req, res) => {
  const { onlineCustomerId, success } = req.body;

  try {
    if (customerPromises[onlineCustomerId]) {
      if (success) {
        // 如果客户端确认成功，则 resolve 相关的 Promise
        customerPromises[onlineCustomerId].resolve();
        res.status(200).json({ success: true, message: 'Customer confirmed successfully' });
      } else {
        // 如果客户端确认失败，则 reject 相关的 Promise
        customerPromises[onlineCustomerId].reject(new Error('Customer registration confirmation failed'));
        res.status(400).json({ success: false, message: 'Customer confirmation failed' });
      }
      // 移除已处理的 Promise
      delete customerPromises[onlineCustomerId];
    } else {
      res.status(404).json({ success: false, message: 'Customer ID not found' });
    }
  } catch (error) {
    console.error('Error in confirmCustomerSaving:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.post('/onlineOrderAdminLogin', function(req, res, next) {

  passport.authenticate('local', { session: false } , function(err, user, info) {
 
    if (err) { 
      return next(err); 
    }
    if (!user) { 
      return res.status(401).send('Authentication failed'); // 验证失败的响应
    }

    //generate jwt token
    const payload = { cusId:user.Id, email: user.Email, storeId: user.StoreId, storeAdmin: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '100y' });
    return res.status(200).json({ jwt: token });
  })(req, res, next);

});

app.get('/getStoreLogo/:storeUrl', async (req, res) => {
   try{
    const storeUrl = req.params.storeUrl;
    const storeIdQuery = 'SELECT StoreId FROM stores WHERE StoreUrl = ? LIMIT 1';
    const storeIdResults = await executeReportDb(storeIdQuery, [storeUrl], { fetchOne: true });
    
    if (!storeIdResults || storeIdResults==undefined) {
      console.log('Store not found:', storeUrl);
      res.sendFile(path.join(__dirname, '../public/images/ipos_logo.png'));
      return;
    }

    const logoPath = path.join(__dirname, `../public/images/${storeIdResults.StoreId}/storeIcon.png`);
    res.sendFile(logoPath, (err) => {
        if (err) {
            console.error(`Error sending logo for store ${storeUrl}:`, err);
            // 如果未找到对应的图片，返回默认图片

            res.sendFile(path.join(__dirname, '../public/images/ipos_logo.png'));
        }
    });
  } catch (error) {
    console.error('Error fetching store logo:', error);
    res.sendFile(path.join(__dirname, '../public/images/ipos_logo.png'));
  }
  });


  app.post('/fetch-order-list', async (req, res) => {
    try {
      const origin_token = req.headers['authorization'];
    
      // 检查 origin_token 是否存在
      if (!origin_token) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
      }
    
      const token = origin_token.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
       
        if (decoded.storeAdmin) {
          const ausCurrentTime = moment().tz('Australia/Melbourne').format('YYYY-MM-DD 23:59:59');
          //one year ago
          const twoWeekAgo = moment().tz('Australia/Melbourne').subtract(365, 'days').format('YYYY-MM-DD 00:00:00');
          const storeInformation = {storeId: decoded.storeId, adminEmail: decoded.email, adminId: decoded.cusId};
          // 执行查询，获取订单、客户和订单项的数据
          const selectQuery = `
          SELECT 
            orders.OrderId,
            orders.EnrichInvoiceId,
            orders.CustomerId,
            orders.CreatedAt,
            orders.Paid,
            orders.StripePaymentId,
            orders.Surcharge,
            orders.Freight,
            orders.Notes,
            orders.DeliveryMethod,
            customers.CustomerSurname,
            customers.CustomerMiddleName,
            customers.CustomerLastName,
            customers.CustomerPhone,
            customers.CustomerEmail,
            customers.ABN,
            customers.Address,
            customers.Suburb,
            customers.State,
            customers.PostCode,
            customers.Country,
            orders.DeliveryAddress,
            orders.DeliverySuburb,
            orders.DeliveryState,
            orders.DeliveryPostCode,
            orders.DeliveryCountry,
            orderitems.StockId,
            orderitems.Quantity,
            orderitems.Price,
            orderitems.GSTRate,
            orderitems.OrderItemId,
            stockitem.Description1,
            stockitem.Description2
          FROM orders
          JOIN customers ON orders.CustomerId = customers.CustomerId
          JOIN orderitems ON orders.OrderId = orderitems.OrderId
          JOIN stockitem ON orderitems.StockId = stockitem.StockId
          WHERE orders.StoreId = ? AND orders.CreatedAt BETWEEN ? AND ?
          ORDER BY orders.OrderId DESC
          `;

          const results = await executeDb(selectQuery, [decoded.storeId, twoWeekAgo, ausCurrentTime], { fetchAll: true });

          // 创建一个数组，用来存储所有订单的详细信息
          const orders = [];

          for (const row of results) {
          // 检查是否已有此订单，避免重复
          let order = orders.find(o => o.onlineOrderId === row.OrderId);

          // 如果订单还不存在，创建一个新的订单对象
          if (!order) {
            order = {
              onlineOrderId: row.OrderId,
              onlineCustomerId: row.CustomerId,
              enrichInvoiceId: row.EnrichInvoiceId,
              //format('YYYY-MM-DD HH:mm:ss'),
              orderTime: moment(row.CreatedAt).tz('Australia/Melbourne').format('YYYY-MM-DD HH:mm:ss'),
              paid: row.Paid,
              paymentMethod: "Stripe", // 假设所有订单的支付方式都是 Stripe
              paymentId: row.StripePaymentId,
              surcharge: row.Surcharge,
              freight: row.Freight,
              orderNotes: row.Notes,
              deliveryMethod: row.DeliveryMethod,
              deliveryAddress: row.DeliveryAddress,
              deliverySuburb: row.DeliverySuburb,
              deliveryState: row.DeliveryState,
              deliveryPostCode: row.DeliveryPostCode,
              deliveryCountry: row.DeliveryCountry,
              itemDetails: [],
              customer: {
                onlineCustomerId: row.CustomerId,
                customerName: `${row.CustomerSurname} ${row.CustomerMiddleName ? row.CustomerMiddleName + ' ' : ''}${row.CustomerLastName}`,
                mobile: row.CustomerPhone,
                email: row.CustomerEmail,
                ABN: row.ABN,
                address: row.Address,
                suburb: row.Suburb,
                state: row.State,
                postCode: row.PostCode,
                country: row.Country,
                deliveryAddress: row.DeliveryAddress,
                deliverySuburb: row.DeliverySuburb,
                deliveryState: row.DeliveryState,
                deliveryPostCode: row.DeliveryPostCode,
                deliveryCountry: row.DeliveryCountry
              }
            };
            orders.push(order);
          }
          
          // 添加订单项到当前订单的 itemDetails 中
          order.itemDetails.push({
            stockId: row.StockId,
            quantity: row.Quantity,
            price: row.Price,
            gstRate: row.GSTRate,
            stockOnlineId: row.OrderItemId,
            description1: row.Description1,
            description2: row.Description2,
          });
          }

          // 将结果数组转换为 JSON 格式并返回
          
          const jsonResult = JSON.parse(JSON.stringify(orders));
          res.status(200).json({ success: true, results:jsonResult , storeInformation});
        }
        else {
          res.status(401).json({ success: false, message: 'Invalid token' });
        }
      }
      );
    } catch (error) {
      console.error('Error executing SELECT query:', error);
      res.status(500).send('An error occurred');
    }
  });

app.get('/fetch-user-list', async (req, res) => {
  try {
    
    const origin_token = req.headers['authorization'];

    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    const token = origin_token.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
       
        if (decoded.storeAdmin) {
          const storeInformation = {storeId: decoded.storeId, adminEmail: decoded.email, adminId: decoded.cusId};
          const selectQuery = 'SELECT * FROM customers WHERE StoreId = ?';
          const results = await executeDb(selectQuery, [decoded.storeId], { fetchAll: true });
          res.status(200).json({ success: true, results, storeInformation });
        }
        else {
          res.status(400).json({ success: false, message: 'Authorization error' });
        }
      });
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.get('/deleteAllImages', async (req, res) => {
  try {
    const storeId = req.query.storeId;
    const deleteImagesPath = path.join(__dirname, `../public/images/${storeId}`);
    if (fs.existsSync(deleteImagesPath)) {
      fs.rmdirSync(deleteImagesPath, { recursive: true });
    }
    res.status(200).json({ success: true, message: 'All images deleted successfully' });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
  
});

app.get('/fetchStoreConfig/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;

    const storeConfigQuery = 'SELECT * FROM store_online_information WHERE StoreId = ?';
    const storeConfigResult = await executeDb(storeConfigQuery, [storeId], { fetchOne: true });
   
    // Parse ShippingDiscountTiers JSON if it exists
    if (storeConfigResult && storeConfigResult.ShippingDiscountTiers) {
      try {
        if (typeof storeConfigResult.ShippingDiscountTiers === 'string') {
          storeConfigResult.ShippingDiscountTiers = JSON.parse(storeConfigResult.ShippingDiscountTiers);
        }
      } catch (e) {
        storeConfigResult.ShippingDiscountTiers = [];
      }
    } else if (storeConfigResult) {
      storeConfigResult.ShippingDiscountTiers = [];
    }

    res.status(200).json({ success: true, storeConfig: storeConfigResult });
  } catch (error) {
    console.error('Errors occur during store config fetching.', error);
    res.status(400).json({ success: false, message: 'Errors occur during store config fetching.' });
  }
}
);
  

app.get('/fetchStoreConfigAdmin', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    const token = origin_token.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
       
        if (decoded.storeAdmin) {
          const storeConfigQuery = 'SELECT * FROM store_online_information WHERE StoreId = ?';
          const storeConfigResult = await executeDb(storeConfigQuery, [decoded.storeId], { fetchOne: true });
          
          // 如果没有查询到结果，直接返回错误
          if (!storeConfigResult) {
            return res.status(404).json({ success: false, message: 'Store configuration not found' });
          }
          
          // Parse ShippingDiscountTiers JSON if it exists
          if (storeConfigResult.ShippingDiscountTiers) {
            try {
              if (typeof storeConfigResult.ShippingDiscountTiers === 'string') {
                storeConfigResult.ShippingDiscountTiers = JSON.parse(storeConfigResult.ShippingDiscountTiers);
              }
            } catch (e) {
              storeConfigResult.ShippingDiscountTiers = [];
            }
          } else {
            storeConfigResult.ShippingDiscountTiers = [];
          }
          
          const promotionImageUrl = path.join(__dirname, `../public/images/${decoded.storeId}/promotion1.jpg`);
          const promotionImageUrl2 = path.join(__dirname, `../public/images/${decoded.storeId}/promotion2.jpg`);
          const promotionImageUrl3 = path.join(__dirname, `../public/images/${decoded.storeId}/promotion3.jpg`);
          const promotionImageUrl4 = path.join(__dirname, `../public/images/${decoded.storeId}/promotion4.jpg`);

          if (fs.existsSync(promotionImageUrl)) {
            storeConfigResult.promotionImage1 = '/images/' + decoded.storeId + '/promotion1.jpg';
          }
          if (fs.existsSync(promotionImageUrl2)) {
            storeConfigResult.promotionImage2 =   '/images/' + decoded.storeId + '/promotion2.jpg';
          }
          if (fs.existsSync(promotionImageUrl3)) {
            storeConfigResult.promotionImage3 = '/images/' + decoded.storeId + '/promotion3.jpg';
          }
          if (fs.existsSync(promotionImageUrl4)) {
            storeConfigResult.promotionImage4 = '/images/' + decoded.storeId + '/promotion4.jpg';
          }


          const storeSelectQuery = 'SELECT * FROM stores WHERE StoreId = ?';
          const storeResult = await executeReportDb(storeSelectQuery, [decoded.storeId], { fetchOne: true });
          
          const storeInformation = {storeId: decoded.storeId, storeUrl: storeResult.StoreUrl, adminEmail: decoded.email, adminId: decoded.cusId, StorePhone: storeResult.StorePhone, StoreAddress: storeResult.StoreAddress};
          
          const itemTagsQuery = 'SELECT * FROM item_tags WHERE StoreId = ? ORDER BY TagId';
          const itemTagsResult = await executeDb(itemTagsQuery, [decoded.storeId], { fetchAll: true });
          const itemTags = itemTagsResult;

          const parcelsettingsQuery = 'SELECT * FROM parcelsetting WHERE StoreId = ?';
          const parcelsettingsResult = await executeDb(parcelsettingsQuery, [decoded.storeId], { fetchAll: true });
          const parcelSettings = parcelsettingsResult;




          res.status(200).json({ success: true, storeConfig: storeConfigResult, storeInformation, itemTags, parcelSettings });
        }
        else {
          res.status(400).json({ success: false, message: 'Authorization error' });
        }
      });
  } catch (error) {
    console.error('Errors occur during store config fetching.', error);
    res.status(400).json({ success: false, message: 'Errors occur during store config fetching.' });
  }
});

app.post('/uploadPromotionImage', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        //print formatData
      
        const { promotionImage, promotionIndex } = req.body; // 读取图片和对应的 index
        if (!promotionImage || promotionIndex === undefined) {
          return res.status(400).json({ success: false, message: 'Invalid data' });
        }
      
        const promotionImageFilePath = path.join(
          __dirname,
          `../public/images/${decoded.storeId}/promotion${promotionIndex}.jpg`
        );

        // 检查并创建目录
        const dir = path.dirname(promotionImageFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 删除旧文件（如果存在）
        if (fs.existsSync(promotionImageFilePath)) {
          fs.unlinkSync(promotionImageFilePath);
        }

        // 从 Base64 数据中提取并保存图片
        const base64Data = promotionImage.split(';base64,').pop();
        fs.writeFile(promotionImageFilePath, base64Data, { encoding: 'base64' }, (err) => {
          if (err) {
            console.error('Error saving image:', err);
            return res.status(400).json({ success: false, message: 'Error saving image' });
          }
          res.status(200).json({
            success: true,
            message: 'Promotion image uploaded',
            imageUrl: `/images/${decoded.storeId}/promotion${promotionIndex}.png`,
          });
        });
      } else {
        res.status(403).json({ success: false, message: 'Authorization error' });
      }
    });
  } catch (error) {
    console.error('Error uploading promotion image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/deletePromotionImage', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const { promotionIndex } = req.body;
        if (promotionIndex === undefined) {
          return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const promotionImageFilePath = path.join(
          __dirname,
          `../public/images/${decoded.storeId}/promotion${promotionIndex}.jpg`
        );

        if (fs.existsSync(promotionImageFilePath)) {
          fs.unlinkSync(promotionImageFilePath);
        }

        res.status(200).json({ success: true, message: 'Promotion image deleted' });
      } else {
        res.status(403).json({ success: false, message: 'Authorization error' });
      }
    });
  } catch (error) {
    console.error('Error deleting promotion image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/updateStoreConfig', async (req, res) => {
  try {


    const origin_token = req.headers['authorization'];
     // 检查 origin_token 是否存在
     if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
    const token = origin_token.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
       
        if (decoded.storeAdmin) {
          const { storeConfig, iconUrl } = req.body;

          if (iconUrl&&iconUrl.length > 200) {
            const iconFilePath = path.join(__dirname, `../public/images/${decoded.storeId}/storeIcon.png`);

            // 检查文件是否存在
            if (fs.existsSync(iconFilePath)) {
                // 如果文件存在，删除文件
                fs.unlinkSync(iconFilePath);
            } else {
                // 如果文件不存在，检查目录是否存在，如果不存在，则创建它
                const dir = path.dirname(iconFilePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }
            
            // 从 URL 中获取 Base64 数据
            const base64Data = iconUrl.split(';base64,').pop();
           
            
            // 将 Base64 数据转换为二进制数据，并写入文件
            fs.writeFile(iconFilePath, base64Data, { encoding: 'base64' }, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send('Error saving image');
                }
                // 文件保存成功的逻辑处理
            });
        }

          
          let EnableAUPost;
          if (storeConfig.shippingEnabled) {
            EnableAUPost = 1;
          }
          else {
            EnableAUPost = 0;
          }

          if (EnableAUPost === 1) {

          
            if (storeConfig.itemTags.length > 0) {
              // Check for existing tags and handle update, delete, or insert
              for (const itemTag of storeConfig.itemTags) {
                // Check if tag exists in the database
              
                const foundTag = await executeDb('SELECT * FROM item_tags WHERE StoreId = ? AND TagId = ?', [decoded.storeId, itemTag.size]);
                
                if (foundTag.length > 0) {
                  // Tag exists: Update the tag's capacity
                  const updateTagQuery = 'UPDATE item_tags SET Capacity = ? WHERE StoreId = ? AND TagId = ?';
                  await executeDb(updateTagQuery, [parseFloat(itemTag.unit), decoded.storeId, itemTag.size]);
                } else {
                  // Tag does not exist: Insert new tag
                  const insertTagQuery = 'INSERT INTO item_tags (StoreId, TagId, Capacity) VALUES (?, ?, ?)';
                  await executeDb(insertTagQuery, [decoded.storeId, itemTag.size, parseFloat(itemTag.unit)]);
                }
              }
            
              //  delete for tags that are in the foundTag but not in storeConfig.itemTags
              const existingTagsQuery = 'SELECT TagId FROM item_tags WHERE StoreId = ?';
              const existingTags = await executeDb(existingTagsQuery, [decoded.storeId]);
              
              const storeTagIds = storeConfig.itemTags.map(tag => tag.size);
              const dbTagIds = existingTags.map(tag => tag.TagId);
              
              const tagsToDelete = dbTagIds.filter(tagId => !storeTagIds.includes(tagId));
              
              if (tagsToDelete.length > 0) {
                const deleteTagQuery = 'DELETE FROM item_tags WHERE StoreId = ? AND TagId = ?';
                for (const tagId of tagsToDelete) {
                  await executeDb(deleteTagQuery, [decoded.storeId, tagId]);
                }
              }
            }
            
            if (storeConfig.parcels.length > 0) {
              // Check for existing parcels and handle update, delete, or insert
              for (const parcel of storeConfig.parcels) {
                // Check if parcel exists in the database
                const foundParcel = await executeDb('SELECT * FROM parcelsetting WHERE StoreId = ? AND ParcelId = ?', [decoded.storeId, parcel.parcelNumber]);
                
                if (foundParcel.length > 0) {
                  // Parcel exists: Update the parcel's information
                  const updateParcelQuery = 'UPDATE parcelsetting SET Length = ?, Width = ?, Height = ?, Capacity = ?, ExtraCharge = ? WHERE StoreId = ? AND ParcelId = ?';
                  await executeDb(updateParcelQuery, [
                    parseFloat(parcel.length),
                    parseFloat(parcel.width),
                    parseFloat(parcel.height),
                    parseFloat(parcel.capacity),
                    parseFloat(parcel.extraCharge),
                    decoded.storeId,
                    parcel.parcelNumber
                  ]);
                } else {
                  // Parcel does not exist: Insert new parcel
                  const insertParcelQuery = 'INSERT INTO parcelsetting (StoreId, ParcelId, Length, Width, Height, Capacity) VALUES (?, ?, ?, ?, ?, ?)';
                  await executeDb(insertParcelQuery, [
                    decoded.storeId,
                    parcel.parcelNumber,
                    parseFloat(parcel.length),
                    parseFloat(parcel.width),
                    parseFloat(parcel.height),
                    parseFloat(parcel.capacity)
                  ]);
                }
              }
            
              // Handle delete for parcels that are in the database but not in storeConfig.parcels
              const existingParcelIds = storeConfig.parcels.map(parcel => parcel.parcelNumber);
              const deleteParcelsQuery = 'DELETE FROM parcelsetting WHERE StoreId = ? AND ParcelId NOT IN (?)';
              await executeDb(deleteParcelsQuery, [decoded.storeId, existingParcelIds]);
            }
            
          }
            
         
          // Prepare ShippingDiscountTiers JSON
          let shippingDiscountTiersJSON = null;
          if (storeConfig.shippingDiscountTiers && Array.isArray(storeConfig.shippingDiscountTiers) && storeConfig.shippingDiscountTiers.length > 0) {
            shippingDiscountTiersJSON = JSON.stringify(storeConfig.shippingDiscountTiers);
          }
          
          const updateStoreConfigQuery = 'UPDATE store_online_information SET DefaultProductUnit = ?, ShippingRate = ?, SurchargeDescription = ?,StoreLocationZip = ?, Surcharge = ?, EnableAuPost = ?, DefaultProductLength = ?, DefaultProductWidth = ?, DefaultProductHeight = ?, DefaultProductWeight = ?, FreeShippingLimit = ? , RecipientEmail = ? , StoreName = ?, ShippingDiscountTiers = ?, MondayStart = ?, MondayEnd = ?, TuesdayStart = ?, TuesdayEnd = ?, WednesdayStart = ?, WednesdayEnd = ?, ThursdayStart = ?, ThursdayEnd = ?, FridayStart = ?, FridayEnd = ?, SaturdayStart = ?, SaturdayEnd = ?, SundayStart = ?, SundayEnd = ?, MondayBreakStart = ?, MondayBreakEnd = ?, TuesdayBreakStart = ?, TuesdayBreakEnd = ?, WednesdayBreakStart = ?, WednesdayBreakEnd = ?, ThursdayBreakStart = ?, ThursdayBreakEnd = ?, FridayBreakStart = ?, FridayBreakEnd = ?, SaturdayBreakStart = ?, SaturdayBreakEnd = ?, SundayBreakStart= ?, SundayBreakEnd = ? WHERE StoreId = ?';
         
          await executeDb(updateStoreConfigQuery, [storeConfig.DefaultProductUnit, storeConfig.shippingRate, storeConfig.SurchargeDescrip, storeConfig.StoreLocationZip, storeConfig.SurchargeRate, EnableAUPost, storeConfig.productLength, storeConfig.productWidth, storeConfig.productHeight, storeConfig.DefaultProductWeight, storeConfig.freeShippingLimit, storeConfig.RecipientEmail, storeConfig.StoreName, shippingDiscountTiersJSON, 
            storeConfig.MondayStart,
            storeConfig.MondayEnd,
            storeConfig.TuesdayStart,
            storeConfig.TuesdayEnd,
            storeConfig.WednesdayStart,
            storeConfig.WednesdayEnd,
            storeConfig.ThursdayStart,
            storeConfig.ThursdayEnd,
            storeConfig.FridayStart,
            storeConfig.FridayEnd,
            storeConfig.SaturdayStart,
            storeConfig.SaturdayEnd,
            storeConfig.SundayStart,
            storeConfig.SundayEnd,
            storeConfig.MondayBreakStart,
            storeConfig.MondayBreakEnd,
            storeConfig.TuesdayBreakStart,
            storeConfig.TuesdayBreakEnd,
            storeConfig.WednesdayBreakStart,
            storeConfig.WednesdayBreakEnd,
            storeConfig.ThursdayBreakStart,
            storeConfig.ThursdayBreakEnd,
            storeConfig.FridayBreakStart,
            storeConfig.FridayBreakEnd,
            storeConfig.SaturdayBreakStart,
            storeConfig.SaturdayBreakEnd,
            storeConfig.SundayBreakStart,
            storeConfig.SundayBreakEnd,
            decoded.storeId]);

          const updateStoreQuery = 'UPDATE stores SET StorePhone = ?, StoreAddress = ? WHERE StoreId = ?';
          await executeReportDb(updateStoreQuery, [storeConfig.ContactNumber, storeConfig.Address, decoded.storeId]);
          const updatePromotionQuery = 'UPDATE store_online_information SET PromotionSubtitle1 = ?, PromotionText1 = ?, PromotionSubtitle2 = ?, PromotionText2 = ?, PromotionSubtitle3 = ?, PromotionText3 = ?, PromotionSubtitle4 = ?, PromotionText4 = ? WHERE StoreId = ?';
          await executeDb(updatePromotionQuery, [storeConfig.PromotionSubtitle1, storeConfig.PromotionText1, storeConfig.PromotionSubtitle2, storeConfig.PromotionText2, storeConfig.PromotionSubtitle3, storeConfig.PromotionText3, storeConfig.PromotionSubtitle4, storeConfig.PromotionText4, decoded.storeId]);
        
          res.status(200).json({ success: true, message: 'Store config updated'});
        }
        else {
          res.status(400).json({ success: false, message: 'Authorization error' });
        }
      });
  } catch (error) {
    console.error('Errors occur during store config updating.', error);
    res.status(400).json({ success: false, message: 'Errors occur during store config updating.' });
  }
});
// 在顶部定义固定的每页显示数量（不再需要，因为后端不分页）
const PAGE_SIZE = 20;

// fetchCategories Customer Endpoint

app.get('/getCategories/:storeUrl', async (req, res) => {

  try {
    const storeUrl = req.params.storeUrl;
    
    const storeId = await getStoreIdByUrl(storeUrl);
    const categoryQuery = 'SELECT * FROM category WHERE StoreId = ? AND Disable = 0 ORDER BY CateId ASC';
    const categoryResults = await executeDb(categoryQuery, [storeId], { fetchAll: true });
  
    res.status(200).json({ success: true, categoryResults });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/getLatestUpdates/:storeUrl', async (req, res) => {
  try {
    const storeUrl = req.params.storeUrl;
    const storeId = await getStoreIdByUrl(storeUrl);
    // ALTER TABLE `store_online_information` ADD `PromotionSubtitle1` VARCHAR(20) NULL DEFAULT NULL AFTER `PaymentGateway`, ADD `PromotionSubtitle2` VARCHAR(20) NULL DEFAULT NULL AFTER `PromotionSubtitle1`, ADD `PromotionSubtitle3` VARCHAR(20) NULL DEFAULT NULL AFTER `PromotionSubtitle2`, ADD `PromotionSubtitle4` VARCHAR(20) NULL DEFAULT NULL AFTER `PromotionSubtitle3`, ADD `PromotionText1` VARCHAR(100) NULL DEFAULT NULL AFTER `PromotionSubtitle4`, ADD `PromotionText2` VARCHAR(100) NULL DEFAULT NULL AFTER `PromotionText1`, ADD `PromotionText3` VARCHAR(100) NULL DEFAULT NULL AFTER `PromotionText2`, ADD `PromotionText4` VARCHAR(100) NULL DEFAULT NULL AFTER `PromotionText3`;
    const latestUpdatesQuery = 'SELECT PromotionSubtitle1, PromotionText1, PromotionSubtitle2, PromotionText2, PromotionSubtitle3, PromotionText3, PromotionSubtitle4, PromotionText4 FROM store_online_information WHERE StoreId = ?';
    const latestUpdatesResults = await executeDb(latestUpdatesQuery, [storeId], { fetchOne: true });
    const updates = [];
    
    // Check if latestUpdatesResults exists before accessing its properties
    if (latestUpdatesResults) {
      if (latestUpdatesResults.PromotionSubtitle1) {
        updates.push({
          subtitle: latestUpdatesResults.PromotionSubtitle1,
          text: latestUpdatesResults.PromotionText1,
          imgUrl: `images/${storeId}/promotion1.jpg`,
        });
      }
      if (latestUpdatesResults.PromotionSubtitle2) {
        updates.push({
          subtitle: latestUpdatesResults.PromotionSubtitle2,
          text: latestUpdatesResults.PromotionText2,
          imgUrl: `images/${storeId}/promotion2.jpg`,
        });
      }
      if (latestUpdatesResults.PromotionSubtitle3) {
        updates.push({
          subtitle: latestUpdatesResults.PromotionSubtitle3,
          text: latestUpdatesResults.PromotionText3,
          imgUrl: `images/${storeId}/promotion3.jpg`,
        });
      }
      if (latestUpdatesResults.PromotionSubtitle4) {
        updates.push({
          subtitle: latestUpdatesResults.PromotionSubtitle4,
          text: latestUpdatesResults.PromotionText4,
          imgUrl: `images/${storeId}/promotion4.jpg`,
        });
      }
    }
   
    res.status(200).json({ success: true, updates:updates });
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    res.status(500).send('An error occurred');
  }
}
);

// fetchCategories Admin Endpoint
app.get('/fetchCategories', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

    // 检查是否存在授权头
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const storeId = decoded.storeId;

        // 从查询参数中提取关键词，设置默认值
        const { keyword = '' } = req.query;

        // 构建 SQL 查询，从 categories 表中获取所有分类
        let categoryQuery = 'SELECT * FROM category WHERE StoreId = ?';
        let queryParams = [storeId];

        if (keyword) {
          categoryQuery += ' AND Category LIKE ?';
          queryParams.push(`%${keyword}%`);
        }

        categoryQuery += ' ORDER BY CateId ASC'; // 根据 CateId 排序

        // 执行查询
        const categoryResult = await executeDb(categoryQuery, queryParams, { fetchAll: true });

        res.status(200).json({ success: true, categoryResult });
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error executing SELECT query:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/fetchTagsWithUnits', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];
    
    // Check if origin_token exists
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const storeId = decoded.storeId;
        const tagsQuery = 'SELECT * FROM item_tags WHERE StoreId = ? Order By TagId';
        const tagsResult = await executeDb(tagsQuery, [storeId], { fetchAll: true });
        const tags = tagsResult.map(tag => ({Id:tag.Id, TagId: tag.TagId, unit: tag.Capacity }));
        res.status(200).json({ success: true, tags });
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/groupStockItems', async (req, res) => {
  const origin_token = req.headers['authorization'];
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }
  const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {

        const { tagId, packTagId, weight, packWeight, category } = req.body;
      
        // 构建动态查询和参数
        const updateFields = [];
        const updateParams = [];
        
        if (tagId === 'none') {
          updateFields.push('TagId = NULL');
        } else if (tagId) {
          updateFields.push('TagId = ?');
          updateParams.push(tagId);
        }
        
        if (packTagId === 'none') {
          updateFields.push('PackTagId = NULL');
        } else if (packTagId) {
          updateFields.push('PackTagId = ?');
          updateParams.push(packTagId);
        }
        
        if (weight == 0) {
          updateFields.push('Weight = NULL');
        } else if (weight) {
          updateFields.push('Weight = ?');
          updateParams.push(weight);
        }
        
        if (packWeight == 0) {
          updateFields.push('PackWeight = NULL');
        } else if (packWeight) {
          updateFields.push('PackWeight = ?');
          updateParams.push(packWeight);
        }
        
        // 公共字段
        updateParams.push(category, decoded.storeId);
        
        // 动态构建 SQL 查询
        const updateQuery = `UPDATE stockitem SET ${updateFields.join(', ')} WHERE Category = ? AND StoreId = ?`;

        try {
          const updateResult = await executeDb(updateQuery, updateParams, { fetchAll: false });
        
          if (updateResult.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Stock items updated successfully' });
          } else {
            res.status(400).json({ success: false, message: 'No stock items found for the category' });
          }
        } catch (error) {
          console.error('Error updating stock items:', error);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
        
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
});

// fetchStockItemList Endpoint
app.get('/fetchStockItemList', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

    // Check if origin_token exists
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const storeId = decoded.storeId;

        // Extract query parameters with default values
        const { category = '', keyword = '', page = 1 , tag = ''} = req.query;

        // Use fixed page size
        const parsedLimit = PAGE_SIZE;

        // Validate and parse page as integer
        const parsedPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

        // Calculate offset for pagination
        const offset = (parsedPage - 1) * parsedLimit;

        // Build SQL query with optional category and keyword filters
        let selectQuery = 'SELECT * FROM stockitem WHERE StoreId = ?';
        let queryParams = [storeId];

        if (category && category !== 'All') {
          selectQuery += ' AND Category = ?';
          queryParams.push(category);
        }
        if (tag && tag !== 'All') {
          selectQuery += ' AND (TagId = ? OR PackTagId = ?)';
          queryParams.push(tag, tag);
        }
       
        if (keyword) {
          selectQuery += ' AND (';
          selectQuery += 'Description1 LIKE ? OR ';
          selectQuery += 'Description2 LIKE ? OR ';
          selectQuery += 'Description3 LIKE ? OR ';
          selectQuery += 'Description4 LIKE ? OR ';
          selectQuery += 'StockId LIKE ? OR ';
          selectQuery += 'BarCode LIKE ?';
          
          selectQuery += ')';
          const likeKeyword = `%${keyword}%`;
          queryParams.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword);
        }

        selectQuery += ' ORDER BY StockId ASC LIMIT ? OFFSET ?';
        queryParams.push(parsedLimit, offset);
       
        // Execute the query
        const stockItemsResult = await executeDb(selectQuery, queryParams, { fetchAll: true });
  
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM stockitem WHERE StoreId = ?';
        let countParams = [storeId];

        if (category && category !== 'All') {
          countQuery += ' AND Category = ?';
          countParams.push(category);
        }
        if (tag && tag !== 'All') {
          countQuery += ' AND TagId = ?';
          countParams.push(tag);
        }

        if (keyword) {
          countQuery += ' AND (';
        
          countQuery += 'Description1 LIKE ? OR ';
          countQuery += 'Description2 LIKE ? OR ';
          countQuery += 'Description3 LIKE ? OR ';
          countQuery += 'Description4 LIKE ? OR ';
          countQuery += 'StockId LIKE ? OR ';
          countQuery += 'BarCode LIKE ?';
          countQuery += ')';
          const likeKeyword = `%${keyword}%`;
          countParams.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword);
        }

        const countResult = await executeDb(countQuery, countParams, { fetchOne: true });
        const total = countResult.count;

        res.status(200).json({ success: true, stockItemsResult, total, storeId: decoded.storeId });
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error executing SELECT query:', error);
    res.status(500).send('An error occurred');
  }
});


app.post('/shiftCateId', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

    // Check if origin_token exists
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const storeId = decoded.storeId;
        const { CateOnlineId, newCateId } = req.body;

        if (!CateOnlineId || newCateId === undefined) {
          return res.status(400).json({ success: false, message: 'CateOnlineId and newCateId are required' });
        }

        // Update the CateId
        const updateQuery = 'UPDATE category SET CateId = ? WHERE CateOnlineId = ? AND StoreId = ?';
        const updateParams = [newCateId, CateOnlineId, storeId];

        const updateResult = await executeDb(updateQuery, updateParams, { fetchAll: false });

        if (updateResult.affectedRows > 0) {
          res.status(200).json({ success: true, message: 'CateId shifted successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Category not found or no changes made' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error executing UPDATE query:', error);
    res.status(500).send('An error occurred');
  }
});
app.post('/updateCategory', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

    // Check if origin_token exists
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      if (decoded.storeAdmin) {
        const storeId = decoded.storeId;
        const { CateOnlineId, Category, Disable, CateId } = req.body;

        if (!CateOnlineId || Category === undefined || Disable === undefined || CateId === undefined) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Update the category
        //fetch the old category name
        const oldCategoryQuery = 'SELECT Category FROM category WHERE CateOnlineId = ? AND StoreId = ?';
        const oldCategoryResult = await executeDb(oldCategoryQuery, [CateOnlineId, storeId], { fetchOne: true });
        const oldCategory = oldCategoryResult.Category;
       

        const updateQuery = 'UPDATE category SET Category = ?, Disable = ?, CateId = ? WHERE CateOnlineId = ? AND StoreId = ?';
        const updateParams = [Category, Disable, CateId, CateOnlineId, storeId];

        const updateResult = await executeDb(updateQuery, updateParams, { fetchAll: false });

        const updateRelatedStockItemsQuery = 'UPDATE stockitem SET Category = ? WHERE Category = ? AND StoreId = ?';
        const updateRelatedStockItemsParams = [Category, oldCategory, storeId];
        await executeDb(updateRelatedStockItemsQuery, updateRelatedStockItemsParams, { fetchAll: false });


        if (updateResult.affectedRows > 0) {
          res.status(200).json({ success: true, message: 'Category updated successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Category not found or no changes made' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error executing UPDATE query:', error);
    res.status(500).send('An error occurred');
  }
});

app.post('/updateStockItemImage', async (req, res) => {
  const { stockOnlineId, imageUrl } = req.body;
  const origin_token = req.headers['authorization'];
 
  // Check if origin_token exists
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }
  const token = origin_token.split(' ')[1];


  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
        
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
      
        if (decoded.storeAdmin) {
          const storeId = decoded.storeId;
          const stockId = req.body.stockId;
          const imageBase64 = req.body.imageBase64

          //把base64图片转换成图片保存到服务器
          const imagePath = path.join(__dirname, `../public/images/${storeId}/stockItems/${stockId}.jpg`);
          const dir = path.dirname(imagePath);
          if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFile(imagePath, imageBase64, { encoding: 'base64' }, (err) => {
              if (err) {
                  console.error(err);
                  return res.status(400).send('Error saving image');
              }
              // 文件保存成功的逻辑处理
          });
          res.status(200).json({ success: true, message: 'Stock item image updated successfully' });
        }
        else {
          res.status(401).json({ success: false, message: 'Not authorized as store admin' });
        }
      }
  );
});
       


app.get('/fetchStoreInfo', async (req, res) => {
  try {
   
    const origin_token = req.headers['authorization'];
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    
      if (decoded.storeAdmin) {
       
        const storeId = decoded.storeId;

       
        const storeInformation = {storeId: decoded.storeId, adminEmail: decoded.email, adminId: decoded.cusId};
        // const storeMultipleLanguageQuery = 'SELECT MultiLanguage, FirstLanguage,SecondLanguage FROM store_qr_information WHERE StoreId = ?';
        // const storeMultipleLanguageResult = await executeOnlineOrderDb(storeMultipleLanguageQuery, [storeId], { fetchOne: true });

        
        res.status(200).json({ success: true, storeInformation });
      } else {
        res.status(401).json({ success: false, message: 'Not authorized as store admin' });
      }
    });
  } catch (error) {
    console.error('Error executing SELECT query:', error);
    res.status(500).send('An error occurred');
  }
});





app.post('/updateCustomerAccount', authenticateJWT, async (req, res) => {
  try {
    const { CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, CustomerPhone, Address, Suburb, State, PostCode, Country, ShippingAddress, ShippingSuburb, ShippingState, ShippingPostCode, ShippingCountry, ABN } = req.body;
    const userId = req.user.userId; // Extracted from JWT

    // Update the customer account
    const updateCustomerQuery = 'UPDATE customers SET CustomerSurname = ?, CustomerMiddleName = ?, CustomerLastName = ?, CustomerEmail = ?, CustomerPhone = ?, Address = ?, Suburb = ?, State = ?, PostCode = ?, Country = ?, DeliveryAddress = ?, DeliverySuburb = ?, DeliveryState = ?, DeliveryPostCode = ?, DeliveryCountry = ?, ABN = ? WHERE CustomerId = ?';
    await executeDb(updateCustomerQuery, [CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail, CustomerPhone, Address, Suburb, State, PostCode, Country, ShippingAddress, ShippingSuburb, ShippingState, ShippingPostCode, ShippingCountry, ABN, userId]);

    // Fetch the updated customer account
    const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
    const customer = await executeDb(customerQuery, [userId], { fetchOne: true });

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error('Error updating customer account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
  
});



app.get('/customerAccount', authenticateJWT, async (req, res) => {
  const userId = req.user.userId; // Extracted from JWT

  try {
      // Fetch customer details
      const customerQuery = 'SELECT CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerEmail , CustomerPhone, Address, Suburb, State, PostCode, Country ,ABN, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry FROM customers WHERE CustomerId = ?';
      const customer = await executeDb(customerQuery, [userId], { fetchOne: true });

      if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
      }

      // Fetch order history
      const ordersQuery = 'SELECT * FROM orders WHERE CustomerId = ? ORDER BY CreatedAt DESC';
      const orders = await executeDb(ordersQuery, [userId], { fetchAll: true });

      


      res.json({ customer, orders });
  } catch (error) {
      console.error('Error fetching customer account:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/orderDetail/:orderId', authenticateJWT, async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.user.userId;

  try {
    // Verify that the order belongs to the authenticated customer
    const orderQuery = 'SELECT * FROM orders WHERE OrderId = ? AND CustomerId = ?';
    const order = await executeDb(orderQuery, [orderId, customerId], { fetchOne: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or access denied.' });
    }

    // Corrected SQL query in your server.js
    const orderItemsQuery = `
    SELECT 
      orderitems.OrderItemId,
      orderitems.StockId,
      orderitems.Quantity,
      orderitems.Price,
      stockitem.Description1,
      stockitem.Description2
    FROM orderitems
    JOIN stockitem ON orderitems.StockId = stockitem.StockId
    WHERE orderitems.OrderId = ?
    `;

    const orderItems = await executeDb(orderItemsQuery, [orderId], { fetchAll: true });


    // Fetch customer data
    const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
    const customer = await executeDb(customerQuery, [customerId], { fetchOne: true });

   

    // Fetch billing and delivery addresses
    const billingAddress = {
      name: `${customer.CustomerSurname} ${customer.CustomerMiddleName || ''} ${customer.CustomerLastName}`,
      address: customer.Address,
      email: customer.CustomerEmail,
      phone: customer.CustomerPhone,
      city: customer.Suburb,
      state: customer.State,
      postalCode: customer.PostCode,
      country: customer.Country,
    };

    const deliveryAddress = {
      name: `${customer.CustomerSurname} ${customer.CustomerMiddleName || ''} ${customer.CustomerLastName}`,
      address: customer.DeliveryAddress,
     
      city: customer.DeliverySuburb,
      state: customer.DeliveryState,
      postalCode: customer.DeliveryPostCode,
      country: customer.DeliveryCountry,
    };

    res.json({
      success: true,
      data: {
        orderItems,
        deliveryAddress,
        billingAddress,
        order,
        // order: {
        //   orderId: order.OrderId,
        //   orderDate: order.CreatedAt,
        //   amount: order.Amount,
        //   surcharge: order.Surcharge,
        //   freight: order.Freight,
        //   paid: order.Paid,
        //   deliveryMethod: order.DeliveryMethod,
          
        // },
       
      },
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.post('/resend-order', async (req, res) => {

  const { orderId } = req.body;

  const origin_token = req.headers['authorization'];
  // Check if origin_token exists
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }
  const token = origin_token.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
   
    if (decoded.storeAdmin) {
      const storeId = decoded.storeId;
 
      const clientSocketId = await find_client_socket(storeId);
      console.log('clientSocketId:', clientSocketId);
      
      if (clientSocketId) {
        
    const orderItemsQuery = 'SELECT * FROM orderitems WHERE OrderId = ?';
    const orderItems = await executeDb(orderItemsQuery, [orderId], { fetchAll: true });
    const cartItems = [];
    for (const item of orderItems) {
      cartItems.push({
        stockId: item.StockId,
        quantity: item.Quantity,
        price: item.Price,
        gstRate: item.GSTRate,
        stockOnlineId: item.OrderItemId
      });
    }
    const orderQuery = 'SELECT * FROM orders WHERE OrderId = ?';
    const orderResults = await executeDb(orderQuery, [orderId], { fetchOne: true });
    const { CustomerId, Paid, StripePaymentId, Surcharge, Notes, Freight } = orderResults;
    const customerQuery = 'SELECT * FROM customers WHERE CustomerId = ?';
    const customerResults = await executeDb(customerQuery, [CustomerId], { fetchOne: true });
    const { CustomerEmail, CustomerSurname, CustomerMiddleName, CustomerLastName, CustomerPhone, ABN, Address, Suburb, State, PostCode, Country, DeliveryAddress, DeliverySuburb, DeliveryState, DeliveryPostCode, DeliveryCountry, CustomCustomerId } = customerResults;

    // 如果 CustomCustomerId 不为 null，使用它；否则使用 CustomerId
    const displayCustomerId = CustomCustomerId ? CustomCustomerId : "ZA"+CustomerId;

    const orderDetail = {
      onlineOrderId: orderId,
      onlineCustomerId: displayCustomerId,
      paid: 0,
      paymentMethod: null,
      paymentId: StripePaymentId,
      surcharge: Surcharge,
      freight: Freight,
      orderNotes: Notes,
      itemDetails: cartItems,
      customer: {
        onlineCustomerId: displayCustomerId,
        customerName: `${CustomerSurname} ${CustomerMiddleName ? CustomerMiddleName + ' ' : ''}${CustomerLastName}`,
        mobile: CustomerPhone,
        email:CustomerEmail,
        ABN,
        address: Address,
        suburb: Suburb,
        state: State,
        postCode: PostCode,
        country: Country,
        deliveryAddress: DeliveryAddress,
        deliverySuburb: DeliverySuburb,
        deliveryState: DeliveryState,
        deliveryPostCode: DeliveryPostCode,
        deliveryCountry: DeliveryCountry
      }
    };
       
        io.to(clientSocketId).emit('saveOrder',{orderDetail});
        res.status(200).json({ success: true, message: 'Order resend request sent' });
      }
      else {
        res.status(400).json({ success: false, message: 'Store not connected' });
      }
    }
    else {
      res.status(401).json({ success: false, message: 'Not authorized as store admin' });
    }
  });
});




  






async function sendOrderEmail(recipientEmail, subject, orderInfo) {
  // Validate input parameters

  if (!recipientEmail || !subject || !orderInfo) {
      throw new Error('Missing required parameters: recipientEmail, subject, and orderInfo are required.');
  }

  // Destructure order information
  const {
      storeId,
      onlineOrderId,
      orderTime,
      customer,
      paymentMethod,
      surcharge,
      freight,
      paid,
      orderNotes,
      itemDetails,storeUrl
  } = orderInfo;


  // Sender credentials from environment variables
  // const senderEmail = process.env.SENDER_EMAIL;
  // const senderPassword = process.env.SENDER_PASSWORD;

  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const fontUrl = process.env.REACT_APP_FONT_ONLINEORDER_URL;


  // Social Media URLs
  const facebookUrl = 'https://www.facebook.com/changhongherbs';
  const twitterUrl = 'https://twitter.com/changhongherbs';
  const pinterestUrl = 'https://www.pinterest.com/changhongherbs';

  // Paths to images
 
  const logoPath = path.join(__dirname, `../public/images/${storeId}/storeIcon.png`);
  const cartIconPath = path.join(__dirname, `../public/images/${storeId}/cart.jpg`);
  const footerImagePath = path.join(__dirname, `../public/images/${storeId}/footer.jpg`);

  // Function to generate image URLs if they exist
  const generateImageUrl = (imagePath, imageName) => {
      return fs.existsSync(imagePath) ? `${serverUrl}/images/${storeId}/${imageName}` : '';
  };

  const logoUrl = generateImageUrl(logoPath, 'storeIcon.png');
  const cartIconUrl = generateImageUrl(cartIconPath, 'cart.jpg');
  const footerImageUrl = generateImageUrl(footerImagePath, 'footer.jpg');

  const facebookIconUrl = `${serverUrl}/images/emailFormat/facebook2x.png`;
  const twitterIconUrl = `${serverUrl}/images/emailFormat/twitter2x.png`;

  // Format order date
  const formattedOrderDate = new Date(orderTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
  


  // Calculate totals
  const subtotal = itemDetails.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = paid;
  

  // Construct items HTML
  const itemsHtml = itemDetails.map(item => {
    //check if item has image path
    let itemImageUrl = '';
    if (fs.existsSync(path.join(__dirname, `../public/images/${storeId}/stockItems/${item.stockId}.jpg`)) ) {
     
      itemImageUrl = `${serverUrl}/images/${storeId}/stockItems/${item.stockId}.jpg`;
    } else {
      itemImageUrl =  `${serverUrl}/images/default-product-image.png`;
    }

console.log(storeId,item.stockId);
    // const itemImageUrl = item.imgUrl ? `${serverUrl}${item.imgUrl}` : `${serverUrl}/images/default-product-image.png`;
 
    return `
        <tr>
             <td style="padding: 10px; border-bottom: 1px solid #F0F0F0;">
                <img src="${itemImageUrl}" alt="${item.description1}" width="60" style="display: block; width: 60px; height: auto; border: 0" />
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #F0F0F0;">
                <strong>${item.description1}</strong><br/>
                ${item.description2}<br/>
                Quantity: ${item.quantity}<br/>
                Price: $${item.price.toFixed(2)}<br/>
            </td>
        </tr>
    `;
}).join('');



  // HTML Content
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
      /* Add your CSS styling here */
      body { font-family: 'Montserrat', sans-serif; background-color: #f8f8f9; margin: 0; padding: 0; }
      .container { width: 100%; max-width: 640px; margin: 0 auto; background-color: #ffffff; }
      .header {padding: 20px; text-align: center; }
      .header img { max-width: 100px; height: auto; }
      .content { padding: 20px; }
      .order-details, .shipping-address { margin-bottom: 20px; }
      .order-details table, .shipping-address table { width: 100%; }
      .order-details th, .order-details td, .shipping-address th, .shipping-address td { padding: 10px; text-align: left; }
      .items table { width: 100%; border-collapse: collapse; }
      .items th, .items td { padding: 10px; border: 1px solid #F0F0F0; text-align: left; }
      .footer { background-color: #2b303a; color: #ffffff; padding: 20px; text-align: center; }
      .social-icons img { width: 32px; height: auto; margin: 0 10px; }
      .button { background-color: #1aa19c; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 60px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
      <!-- Header -->
      <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Store Logo"/>` : ''}
      </div>

      <!-- Content -->
      <div class="content">
          <h2>Thank you for your order!</h2>
          <p>This email is to confirm your recent order.</p>

          <!-- Order Number -->
          <div class="order-number">
              <strong>Order Number:</strong> #${onlineOrderId}
          </div>

          <!-- Order Date -->
          <div class="order-date">
              <strong>Order Date:</strong> ${formattedOrderDate}
          </div>

          <!-- Items Ordered -->
          <div class="items">
              <h3>Products Ordered (${itemDetails.length})</h3>
              <table>
                  <tr>
                      <th>Product</th>
                      <th>Description</th>
                  </tr>
                  ${itemsHtml}
              </table>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
              <h3>Order Summary</h3>
              <table>
                  <tr>
                      <th>Subtotal</th>
                      <td>$${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                      <th>Freight</th>
                      <td>$${freight.toFixed(2)}</td>
                  </tr>
                  <tr>
                      <th>Surcharge</th>
                      <td>$${surcharge.toFixed(2)}</td>
                  </tr>
              
                  <tr>
                      <th>Grant Total</th>
                      <td>$${total.toFixed(2)}</td>
                  </tr>
              </table>
          </div>

          <!-- Payment Method -->
          <div class="payment-method">
              <strong>Payment Method:</strong> ${paymentMethod}
          </div>

          <!-- Shipping Address -->
          <div class="shipping-address">
              <h3>Shipping Address</h3>
              <p>
                  ${customer.deliveryAddress}<br/>
                  ${customer.deliverySuburb}, ${customer.deliveryState} ${customer.deliveryPostCode}<br/>
                  ${customer.deliveryCountry}
              </p>
          </div>

          <!-- Order Notes -->
          ${orderNotes ? `<div class="order-notes">
              <strong>Order Notes:</strong>
              <p>${orderNotes}</p>
          </div>` : ''}

          <!-- View Order Button -->
          <div style="text-align: center; margin-top: 30px;">
              <a href="${fontUrl}/order-success/${storeUrl}/${await encrypt(onlineOrderId)}" class="button">View Order</a>
          </div>
      </div>

      <!-- Footer -->
      <div class="footer">
          ${footerImageUrl ? `<img src="${footerImageUrl}" alt="Footer Image" style="max-width: 100%; height: auto;"/>` : ''}
          <p>
              At Chang Hong, we understand that managing your health can be time-consuming. Ensuring that you get the best price for quality herbs and medicinal products can easily be overlooked, even though it can lead to substantial savings each year. We strive to establish an open and honest relationship with our clients, and we value empowering you to become as knowledgeable as possible in identifying quality.
          </p>
          <div class="social-icons">
              <a href="${facebookUrl}" target="_blank"><img src="${facebookIconUrl}" alt="Facebook"/></a>
              <a href="${twitterUrl}" target="_blank"><img src="${twitterIconUrl}" alt="Twitter"/></a>
             
          </div>
          <p>© 2024 Chang Hong Trading. All rights reserved.</p>
      </div>
  </div>
</body>
</html>`;


  try {
      // Send email
      const info = await AliYunSendEmail(recipientEmail, subject, htmlContent);
      
      return { success: true, response: info};
  } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error };
  }
}


// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { storeId, stockId } = req.body;
    if (!storeId || !stockId) {
      return cb(new Error('storeId and stockId are required in the request body.'));
    }
    const dir = path.resolve(__dirname, 'public', 'images', storeId, 'stockItems');
    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.stockId}.jpg`);
  },
});

// Multer Upload Configuration
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only JPG files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload Endpoint
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

//   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
//     if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
//     req.user = user;
//     next();
//   });
// }

app.post('/uploadStockImage',  (req, res) => {
  try {
    const { storeId, stockId, image } = req.body;
   
    // Validate input
    if (!storeId || !stockId || !image) {
      return res.status(400).json({ success: false, message: 'storeId, stockId, and image are required.' });
    }

    const stockItemsPath = path.join(__dirname, `../public/images/${storeId}/stockItems`);
    console.log(stockItemsPath);
    // 如果目录不存在，则创建目录
    if (!fs.existsSync(stockItemsPath)) {
      fs.mkdirSync(stockItemsPath, { recursive: true });
    }
    
   
    const fileName = `${stockId}.jpg`;
    // 构建菜单照片本地存储路径
    const filePath = path.join(stockItemsPath, fileName);
    // 将图片数据写入文件
    // 解码 Base64 图片数据
    let buffer;
    try {
      buffer = Buffer.from(image, 'base64');
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid Base64 data' });
    }
    // 写入文件, if exist -> overwrite

    fs.writeFile(filePath, buffer, (error) => {
      if (error) {
        console.error('ERROR: ', error);
        res.status(400).json({ success: false, message: 'Error when writing the file' });
      } else {
     
        res.status(200).json({ success: true, message: 'Item image uploaded' });
      }
    });
  
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image.', error: error.message });
  }
});
// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // Handle other errors
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});




  const PORT = 5062; //外部是5052公开，转发入5053
  server.listen(PORT, () => {

    console.log(` Server running on port ${PORT}`);
 });



// 添加获取用户证书图片的API端点
app.get('/certificate-image/:storeId/:customerId', (req, res) => {
  try {
    const { storeId, customerId } = req.params
    
    // 构建证书图片的目录路径
    const certificateDir = path.join(__dirname, 'uploads', 'certificates', storeId.toString());
    
    // 如果目录不存在，返回404
    if (!fs.existsSync(certificateDir)) {
      return res.status(404).send('Certificate directory not found');
    }
    
    // 读取目录中的文件
    const files = fs.readdirSync(certificateDir);
    
    // 查找以customerId开头的文件
    const certificateFile = files.find(file => file.startsWith(customerId));
    
    if (!certificateFile) {
      return res.status(404).send('Certificate image not found');
    }
    
    // 获取文件的完整路径
    const filePath = path.join(certificateDir, certificateFile);
    
    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error retrieving certificate image:', error);
    res.status(500).send('Error retrieving certificate image');
  }
});




// Register Endpoint
