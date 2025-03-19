select *
FROM category;
SELECT *
FROM PRODUCT
WHERE Remaining > 0;
SELECT EXTRACT(
        MONTH
        FROM ExportingDate
    ) AS Month,
    SUM(TotalCost) AS Revenue
FROM Invoice
GROUP BY Month
ORDER BY Month;
SELECT *
FROM customer;
SELECT *
FROM ordertable;
Select Invoice.totalcost,
    customer.name
FROM Invoice
    INNER JOIN customer ON invoice.customerid = customer.customerid;
Select Invoice.totalcost,
    customer.name
FROM Invoice
    FULL JOIN customer ON invoice.customerid = customer.customerid;
ALTER TABLE customer DROP COLUMN customerid;
ALTER TABLE customer
ADD COLUMN customerid SERIAL PRIMARY KEY;
UPDATE Customer
SET customerid = 3
WHERE name = 'David Johnson';
INSERT INTO customer(
        Name,
        PhoneNumber,
        Email,
        Address
    )
VALUES (
        'David CSDCS',
        '43534545',
        'DDSF@gmail.com',
        '123 Main St'
    );
DELETE FROM customer
WHERE name = 'David CSDCS';
ALTER SEQUENCE customer_customerid_seq RESTART WITH 4;