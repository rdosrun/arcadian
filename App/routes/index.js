/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
var { get_token } = require('./libs/get_token');
const { get_employees, Inventory, Query_Customers } = require('./backend/netsuite');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Custom middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        console.log('User is not authenticated');
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }
    console.log('User is authenticated.');
    next();
}

router.get('/', function (req, res, next) {
    console.log("base:"+req.session.isAuthenticated)
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account,
        base_url: ""
    });
});

router.get('/', isAuthenticated, function (req, res, next) {
    console.log("authed:"+req.session.isAuthenticated)
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account,
        base_url: ""
    });
}
);

router.get('/auth/callback', async function (req, res, next) {

    //make jwt_route page

    //make it run a function that send the jwt token to the server
    //make that function do a res.redirect and preform auth above
    res.redirect('views/jwt');
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
});
router.get('/auth/callback/views/jwt', function (req, res) {
    res.sendFile(path.join(__dirname, '../views/jwt.html'));
});
router.get('/auth/callback/views/script.js', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/script/script.js'));
});

router.get('/auth/jwt_route', async function (req,res,next){
    console.log("JWT Route Loaded", req.query);
    token = req.query.idToken;
    console.log("JWT Route Loaded", token);

    try {
        const decodedToken = jwt.decode(token);
        const employees = await get_employees();
        const employeeList = JSON.parse(employees).items;
        const customers = await readAllCustomers();
        //console.log('Employee List:', employeeList);
        console.log('Decoded Token:', decodedToken);
        //console.log('All customers being checked:', customers.map(c => ({ id: c.id, email: c.customer_email, parent: c.parent })));
        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username) ;
        const customerExists =  customers.some(customer => customer.customer_email === decodedToken.preferred_username);
        if (userExists) {
            const matchedEmployee = employeeList.find(employee => employee.email === decodedToken.preferred_username);
            console.log('User exists in NetSuite. Matched email:', matchedEmployee.email);
            req.session.isAuthenticated = true;
            req.session.account = matchedEmployee.email;
            req.session.isEmployee = true;
        } else if(customerExists){
            const matchedCustomer = customers.find(customer => customer.customer_email === decodedToken.preferred_username);
            console.log('Customer found - Email:', matchedCustomer.customer_email);
            console.log('Customer found - ID:', matchedCustomer.id);
            console.log('Customer found - Parent ID:', matchedCustomer.parent);
            
            // Find all customers that share the same parent ID
            const parentId = matchedCustomer.parent || matchedCustomer.id; // Use parent ID if exists, otherwise use own ID
            relatedCustomers = [];
            if(parentId === null || parentId === undefined) {
                req.session.isAuthenticated = true;
                req.session.account = matchedCustomer.customer_email;
                req.session.isEmployee = false;
                req.session.customer_id = matchedCustomer.id;

            }else{
                const relatedCustomers = customers.filter(customer => 
                    customer.parent === parentId || customer.id === parentId
                );
                req.session.isAuthenticated = true;
                req.session.account = matchedCustomer.customer_email;
                req.session.isEmployee = false;
                req.session.customer_id = matchedCustomer.id;
                req.session.relatedCustomers = relatedCustomers;
            }
            
            
            
            console.log('Found', relatedCustomers.length, 'related customers with parent ID:', parentId);
            console.log('Related customer emails:', relatedCustomers.map(c => c.customer_email));
        }
        res.redirect('/test/');
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
        req.session.account = null;
        res.redirect('/test/');
    }
    //res.redirect('/test/');


});


router.post('/auth/callback', async function (req, res, next) {

    //1 get the token deal with long in
    console.log('Client Info:', req.body.client_info);

    //this is where the breaking is happening it's not an nginx issue
    const decodedToken = JSON.parse(Buffer.from(req.body.client_info, 'base64').toString('utf8'));
    console.log('Decoded Token:', decodedToken);
    console.log('Username:', decodedToken.preferred_username);
    // Check if username exists and get access token
    try {
        // Get the list of employees from NetSuite
        const employees = await get_employees();
        const employeeList = JSON.parse(employees).items;
        const customers = await readAllCustomers();
        //console.log('Employee List:', employeeList);
        console.log('Decoded Token:', decodedToken);
        console.log('All customers being checked:', customers.map(c => ({ id: c.id, email: c.customer_email, parent: c.parent })));
        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username) ;
        const customerExists =  customers.some(customer => customer.customer_email === decodedToken.preferred_username);
        console.log('Checking customer existence for email:', decodedToken.preferred_username);
        console.log('Customer exists:', customerExists);
        if (userExists) {
            const matchedEmployee = employeeList.find(employee => employee.email === decodedToken.preferred_username);
            console.log('User exists in NetSuite. Matched email:', matchedEmployee.email);
            req.session.isAuthenticated = true;
            req.session.account = matchedEmployee.email;
            req.session.isEmployee = true;
        } else if(customerExists){
            const matchedCustomer = customers.find(customer => customer.customer_email === decodedToken.preferred_username);
            console.log('Customer found - Email:', matchedCustomer.customer_email);
            console.log('Customer found - ID:', matchedCustomer.id);
            console.log('Customer found - Parent ID:', matchedCustomer.parent);
            
            // Find all customers that share the same parent ID
            const parentId = matchedCustomer.parent || matchedCustomer.id; // Use parent ID if exists, otherwise use own ID
            const relatedCustomers = customers.filter(customer => 
                customer.parent === parentId || customer.id === parentId
            );
            
            req.session.isAuthenticated = true;
            req.session.account = matchedCustomer.customer_email;
            req.session.isEmployee = false;
            req.session.customer_id = matchedCustomer.id;
            req.session.relatedCustomers = relatedCustomers;
            
            console.log('Found', relatedCustomers.length, 'related customers with parent ID:', parentId);
            console.log('Related customer emails:', relatedCustomers.map(c => c.customer_email));
        }else {
            console.log('User'+ decodedToken.preferred_username +'does not exist in NetSuite.');
            req.session.isAuthenticated = false;
        }
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
        req.session.account = null;
    }

    //2 redirect to default page (index.hbs)
    res.redirect('/');
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
});

router.get('/get_account', function (req, res) {
    res.json({
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account
    });
});

// Route to access pages in the retail folder
router.get('/retail/:page', isAuthenticated, function (req, res, next) {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../views/retail', page));
});

// Route to serve product images
router.get('/product_images/:image', function (req, res, next) {
    const image = req.params.image;
    res.sendFile(path.join(__dirname, '~/images/', image));
});

// Route to get the total number of hat images in a state's images folder
router.get('/hats/:state', isAuthenticated, function (req, res, next) {
    const state = req.params.state;
    const hatsFolderPath = path.join(__dirname, `~/images/${state}/*`);

    fs.readdir(hatsFolderPath, (err, files) => {
        if (err) {
            return next(err);
        }
        const hatImages = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        res.json({ totalHats: hatImages.length/4 });
    });
});

// Route to get inventory
router.get('/inventory', isAuthenticated, async function (req, res, next) {
    try {
        console.log('Querying inventory...', req.query);
        const offset = req.query.offset || 0;
        const inventory = await Inventory(offset);
        res.json(JSON.parse(inventory));
    } catch (error) {
        next(error);
    }
});

// Route to query customers
router.get('/customers', isAuthenticated, async function (req, res, next) {
    try {
        let customers = readAllCustomers();
        var ret_customers = [];
        // If user is not an employee, filter customers to only show related customers
        if (!req.session.isEmployee) {
            const relatedCustomerIds = req.session.relatedCustomers.map(customer => customer.id);
            for (let i = 0; i < customers.length; i++) {
                if( relatedCustomerIds.includes(customers[i].id) || customers[i].id === req.session.customer_id) {
                    //console.log('Customer ID:', customers[i].id, 'is in related customers');
                    ret_customers.push(customers[i]);
                }
            }
            console.log('Returning customers:', ret_customers.length);
            
            res.json({ items: ret_customers });
        }else if (req.session.isEmployee) {
            console.log('Returning customers:', customers.length);
            res.json({ items: customers });
        }
    } catch (error) {
        next(error);
    }
});

// Function to fetch all customers and store in a JSON file
async function fetchAndStoreAllCustomers() {
    let allCustomers = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
        const customersPage = await Query_Customers(offset);
        const parsed = JSON.parse(customersPage);
        hasMore = parsed.hasMore;
        if (parsed.items && parsed.items.length > 0) {
            allCustomers = allCustomers.concat(parsed.items);
            offset += 1000;
        }
    }
    const filePath = path.join(__dirname, '../../customers.json');
    fs.writeFileSync(filePath, JSON.stringify(allCustomers, null, 2), 'utf8');
    return allCustomers;
}

// Function to read and return the whole customers.json file
function readAllCustomers() {
    const filePath = path.join(__dirname, '../../customers.json');
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Run fetchAndStoreAllCustomers every hour
setInterval(() => {
    fetchAndStoreAllCustomers()
        .then(() => console.log('Customer list updated and stored in customers.json'))
        .catch(err => console.error('Error updating customer list:', err));
}, 5 * 60 * 1000); // 5 min in milliseconds

module.exports = router;
