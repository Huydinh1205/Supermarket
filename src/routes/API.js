const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");

// ------------------ MULTER CONFIGURATION ------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ------------------ PRODUCT ROUTES ------------------

// Get all products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Product");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single product by ID
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, c.Name AS categoryname
       FROM Product p
       LEFT JOIN Category c ON p.CategoryID = c.CategoryID
       WHERE p.ProductID = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new product (with image)
router.post("/products", upload.single("image"), async (req, res) => {
  const { name, price, remaining, categoryid } = req.body;
  const imageurl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  try {
    await pool.query(
      `INSERT INTO Product (Name, Price, Remaining, CategoryID, ImageURL, CreatedAt, Sold)
       VALUES ($1, $2, $3, $4, $5, NOW(), 0)`,
      [name, price, remaining || 0, categoryid || null, imageurl]
    );
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ CATEGORY ROUTES ------------------

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Category");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ CUSTOMER ROUTES ------------------

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Customer");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a customer by UserID
router.get("/customers/by-user/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM Customer WHERE UserID = $1", [userid]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching customer by userId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update customer profile
router.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phonenumber, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Customer
       SET Name = $1, Email = $2, PhoneNumber = $3, Address = $4
       WHERE CustomerID = $5
       RETURNING *`,
      [name, email, phonenumber, address, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get customer profile by UserID
router.get("/profile/customer/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
    const cust = await pool.query(
      `SELECT customerid, name, phonenumber, email, address
       FROM Customer
       WHERE UserID = $1`,
      [userid]
    );
    if (!cust.rows.length) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(cust.rows[0]);
  } catch (err) {
    console.error("Error fetching customer profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ ORDER ROUTES ------------------

// Create new order
router.post('/orders', async (req, res) => {
  const { customerID, productID, paymentmethod } = req.body;
  console.log("Received order request with:", req.body);

  try {
    const customerResult = await pool.query(
      'SELECT address FROM Customer WHERE CustomerID = $1',
      [customerID]
    );
    if (!customerResult.rows.length) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }
    const address = customerResult.rows[0].address;

    const orderRes = await pool.query(
      `INSERT INTO OrderTable
         (orderdate, address, status, customerid, productid, paymentmethod)
       VALUES
         (CURRENT_DATE, $1, 'Pending', $2, $3, $4)
       RETURNING *`,
      [address, customerID, productID, paymentmethod]
    );

    const orderID = orderRes.rows[0].orderid;
    res.status(201).json({ message: "Order created successfully", orderID });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get orders by customer ID
router.get('/customers/:customerid/orders', async (req, res) => {
  const { customerid } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM OrderTable
       WHERE customerid = $1
       ORDER BY orderdate DESC`,
      [customerid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ------------------ INVOICE ROUTES ------------------

// Create invoice from multiple orders
router.post("/invoices", async (req, res) => {
  const { customerID, orderIDs, counterID } = req.body;
  
  try {
    await pool.query('BEGIN');
    
    const ordersResult = await pool.query(
      `SELECT o.*, p.price 
       FROM OrderTable o
       JOIN Product p ON o.productid = p.productid
       WHERE o.orderid = ANY($1::int[]) AND o.customerid = $2`,
      [orderIDs, customerID]
    );
    
    if (ordersResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: "No valid orders found" });
    }
    
    const totalCost = ordersResult.rows.reduce((sum, order) => sum + parseFloat(order.price), 0);
    const quantity = ordersResult.rows.length;
    
    const invoiceResult = await pool.query(
      `INSERT INTO Invoice 
       (totalcost, exportingdate, quantity, customerid, counterid) 
       VALUES ($1, CURRENT_DATE, $2, $3, $4) 
       RETURNING invoiceid`,
      [totalCost, quantity, customerID, counterID || null]
    );
    
    const invoiceID = invoiceResult.rows[0].invoiceid;
    
    await pool.query(
      `UPDATE OrderTable 
       SET status = 'Paid', 
           paymentid = $1 
       WHERE orderid = ANY($2::int[])`,
      [invoiceID, orderIDs]
    );
    
    await pool.query('COMMIT');
    
    res.status(201).json({ 
      message: "Invoice created successfully", 
      invoiceID,
      totalCost,
      orderCount: quantity
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});


router.post("/customers/:customerid/invoices", async (req, res) => {
  const { customerid } = req.params;
  const { orderids } = req.body; // array of order IDs to include

  if (!Array.isArray(orderids) || orderids.length === 0) {
    return res.status(400).json({ error: "Order IDs are required" });
  }

  try {
    // Step 1: Calculate total cost and quantity
    const ordersQuery = await pool.query(
      `SELECT o.orderid, p.price
       FROM OrderTable o
       JOIN Product p ON o.productid = p.productid
       WHERE o.orderid = ANY($1::int[])`,
      [orderids]
    );

    if (ordersQuery.rows.length === 0) {
      return res.status(400).json({ error: "No valid orders found" });
    }

    // Calculate total cost by summing the prices of selected orders
    const totalCost = ordersQuery.rows.reduce((sum, row) => sum + Number(row.price), 0);
    const quantity = ordersQuery.rows.length;

    // Step 2: Insert into Invoice table
    const invoiceResult = await pool.query(
      `INSERT INTO Invoice (totalcost, exportingdate, quantity, customerid)
       VALUES ($1, CURRENT_DATE, $2, $3)
       RETURNING invoiceid`,
      [totalCost, quantity, customerid]
    );

    const invoiceId = invoiceResult.rows[0].invoiceid;

    // Step 3: Update the status of the orders to 'Paid' and link to the invoice
    const updateOrdersQuery = `
      UPDATE OrderTable
      SET status = 'Paid', invoiceid = $1
      WHERE orderid = ANY($2::int[])`;
    await pool.query(updateOrdersQuery, [invoiceId, orderids]);

    // Step 4: Send a success response
    res.status(201).json({
      message: "Invoice created successfully and orders marked as Paid",
      invoiceId,
    });
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Get all invoices for a customer
router.get("/customers/:customerid/invoices", async (req, res) => {
  const { customerid } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT i.*, 
       (SELECT COUNT(*) FROM OrderTable o WHERE o.paymentid = i.invoiceid) AS order_count
       FROM Invoice i
       WHERE i.customerid = $1
       ORDER BY i.exportingdate DESC`,
      [customerid]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customer invoices:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
// Get detailed invoice information including all associated orders
router.get("/invoices/:invoiceid", async (req, res) => {
  const { invoiceid } = req.params;
  
  try {
    // Get the invoice information
    const invoiceResult = await pool.query(
      `SELECT * FROM Invoice WHERE invoiceid = $1`,
      [invoiceid]
    );
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    // Get all orders associated with this invoice
    const ordersResult = await pool.query(
      `SELECT o.*, p.name AS product_name, p.price, p.imageurl
       FROM OrderTable o
       JOIN Product p ON o.productid = p.productid
       WHERE o.paymentid = $1`,
      [invoiceid]
    );
    
    // Combine results
    const response = {
      invoice: invoiceResult.rows[0],
      orders: ordersResult.rows
    };
    
    res.json(response);
  } catch (err) {
    console.error("Error fetching invoice details:", err);
    res.status(500).json({ error: "Failed to fetch invoice details" });
  }
});

// ------------------ EMPLOYEE ROUTES ------------------

// Get employee info by UserID
router.get("/employee/by-user/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
    const result = await pool.query(`
      SELECT e.employeeid, e.name, e.phonenumber, 
             CASE 
               WHEN EXISTS (SELECT 1 FROM Cashier c WHERE c.employeeid = e.employeeid) THEN 'Cashier'
               WHEN EXISTS (SELECT 1 FROM Consultant c WHERE c.employeeid = e.employeeid) THEN 'Consultant'
               ELSE 'Unknown'
             END AS role
      FROM Employee e
      WHERE e.userid = $1
    `, [userid]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Employee not found for user" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching employee by user ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ CASHIER ROUTES ------------------

// Get cashier info by employee ID
router.get("/cashiers/:empId", async (req, res) => {
  const { empId } = req.params;
  try {
    const result = await pool.query(`
      SELECT e.employeeid, e.name, e.phonenumber, e.salary, c.counterid
      FROM Cashier c
      JOIN Employee e ON c.employeeid = e.employeeid
      WHERE c.employeeid = $1
    `, [empId]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Not a cashier or not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching cashier:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ CONSULTANT ROUTES ------------------
// Get consultant's profile
router.get("/employee/:employeeid/profile", async (req, res) => {
  let { employeeid } = req.params;  
  employeeid = Number(employeeid); 

  //console.log("[API] /:employeeid/profile called with employeeid:", employeeid);

  try {
    // Query Employee table using employeeid from users table
    const result = await pool.query(
      `
        SELECT e.name, e.phonenumber, e.role, e.salary
        FROM Employee e
        JOIN users u ON e.employeeid = u.employeeid  -- Join users table on employeeid
        WHERE u.employeeid = $1 AND e.role = 'Consultant'  -- Only fetch consultants
      `,
      [employeeid]
    );

    //console.log("[API] Query result:", result.rows);  // Log the result from the query

    if (result.rows.length === 0) {
      console.log("[API] Consultant not found for employeeid:", employeeid);
      return res.status(404).json({ error: "Consultant not found" });
    }

    res.json(result.rows[0]);  // Respond with the consultant's profile data
  } catch (error) {
    console.error("[API] Error fetching consultant profile:", error);
    res.status(500).json({ error: "Failed to fetch consultant profile" });
  }
});



// Get invoices handled by a consultant
router.get("/consultants/:employeeid/invoices", async (req, res) => {
  let { employeeid } = req.params;
  //console.log("Fetching invoices for employee ID (raw):", employeeid); // Debug

  employeeid = Number(employeeid); // Make sure it's number type

  try {
    const result = await pool.query(
      `SELECT i.invoiceid, i.totalcost, i.exportingdate, i.quantity, 
              c.name AS customer_name, i.consultantid
       FROM Invoice i
       JOIN Customer c ON i.customerid = c.customerid
       WHERE i.consultantid = $1`, 
      [employeeid]
    );
    //console.log("API Response Data:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching consultant invoices:", err);
    res.status(500).json({ error: "Failed to fetch consultant invoices" });
  }
});
// Backend route to get member account by username
router.get('/memberaccount/user/:username', async (req, res) => {
  const { username } = req.params;
  console.log("Received username:", username);
  try {
    // Step 1: Get customerID from username
    const customerResult = await pool.query(
      `SELECT c.customerid FROM Customer c 
       JOIN users u ON c.userid = u.id 
       WHERE u.username = $1`,
      [username]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found for this user" });
    }

    const customerId = customerResult.rows[0].customerid;

    // Step 2: Get member account using customerID
    const memberResult = await pool.query(
      `SELECT * FROM MemberAccount WHERE customerid = $1`,
      [customerId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ message: "Member account not found" });
    }

    res.json(memberResult.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});



module.exports = router;
