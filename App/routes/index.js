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
const csv = require('csv-parser'); // Add this import for CSV parsing

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
        employee: req.session.isEmployee || false,
        base_url: ""
    });
});

router.get('/auth/email-login', function (req, res, next) {
    console.log("base:"+req.session.isAuthenticated)
    res.render('email-signin', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,    
    });
});

// Add POST route for email login form submission
router.post('/auth/email-login', async function (req, res, next) {
    const { email, password } = req.body;
    
    try {
        const isValidUser = await validateEmailPassword(email, password);
        
        if (isValidUser) {
            // Check if user is employee or customer
            const customers = await readAllCustomers();
            console.log('Checking customer existence for email:', email);
            console.log()
            const customerExists = customers.some(customer => customer.customer_email && customer.customer_email.toLowerCase() === email.toLowerCase());

            
            if (customerExists) {
                const matchedCustomer = customers.find(customer => customer.customer_email && customer.customer_email.toLowerCase() === email.toLowerCase());
                const parentId = matchedCustomer.parent || matchedCustomer.customer_internal_id;
                
                if (parentId === null || parentId === undefined) {
                    req.session.isAuthenticated = true;
                    req.session.account = matchedCustomer.customer_email;
                    req.session.isEmployee = false;
                    req.session.customer_id = matchedCustomer.customer_internal_id;
                    req.session.parentId = matchedCustomer.customer_parent_customer_internal_id;
                } else {
                    console.log('Parent ID:', parentId);
                    const relatedCustomers = customers.filter(customer => 
                       (customer.parent && customer.parent === parentId) || (customer.customer_internal_id && customer.customer_internal_id === parentId)
                    );
                    req.session.isAuthenticated = true;
                    req.session.account = matchedCustomer.customer_email;
                    req.session.isEmployee = false;
                    req.session.customer_id = matchedCustomer.customer_internal_id;
                    req.session.relatedCustomers = relatedCustomers;
                    req.session.parentId = matchedCustomer.customer_parent_customer_internal_id;
                }
            }
            
            res.redirect('/');
        } else {
            res.render('email-signin', {
                title: 'MSAL Node & Express Web App',
                isAuthenticated: false,
                username: null,
                error: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('email-signin', {
            title: 'MSAL Node & Express Web App',
            isAuthenticated: false,
            username: null,
            error: 'Login failed. Please try again.'
        });
    }
});

router.get('/', isAuthenticated, function (req, res, next) {
    console.log("authed:"+req.session.isAuthenticated)
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account,
        employee: req.session.isEmployee || false,
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
        /*console.log("employeeList:", employeeList);
        console.log("customers:", customers);*/
        //console.log('All customers being checked:', customers.map(c => ({ id: c.id, email: c.customer_email, parent: c.parent })));
        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username) ;
        const customerExists =  customers.some(customer => customer.customer_email === decodedToken.preferred_username);
        console.log("userExists:", userExists);
        console.log("customerExists:", customerExists);
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
        res.redirect('/');
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
        req.session.account = null;
        res.redirect('/');
    }
    //res.redirect('/');


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
        var relatedCustomerIds = null;
        // If user is not an employee, filter customers to only show related customers
        //req.session.parentId = matchedCustomer.customer_parent_customer_internal_id;
        if (!req.session.isEmployee) {
            if(!req.session.relatedCustomers || req.session.relatedCustomers.length === 0) {
            }else{
                relatedCustomerIds = req.session.relatedCustomers.map(customer => customer.customer_email);
            }
            for (let i = 0; i < customers.length; i++) {
                if(relatedCustomerIds === null || relatedCustomerIds === undefined || relatedCustomerIds.length === 0) {
                    if( customers[i].customer_internal_id === req.session.customer_id) {
                        console.log('Customer ID1:', customers[i].customer_email, 'is the current customer');
                        if(customers[i].customer_email !== null && customers[i].customer_email !== undefined) {
                            ret_customers.push(customers[i]);
                        }
                    }
                } else if( customers[i].customer_parent_customer_internal_id === req.session.parentId) {
                    console.log('Customer ID2:', customers[i].customer_email, 'is in related customers');
                    if(customers[i].customer_email !== null && customers[i].customer_email !== undefined) {
                        ret_customers.push(customers[i]);
                    }
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

// Function to validate email and password from CSV
function validateEmailPassword(email, password) {
    return new Promise((resolve, reject) => {
        const csvPath = path.join(__dirname, '../../users.csv'); // Adjust path as needed
        
        if (!fs.existsSync(csvPath)) {
            console.error('CSV file not found:', csvPath);
            resolve(false);
            return;
        }
        
        const users = [];
        fs.createReadStream(csvPath)
            .pipe(csv({ headers: false })) // Assuming no headers, first column is email, second is password
            .on('data', (row) => {
                const columns = Object.values(row);
                if (columns.length >= 2) {
                    users.push({
                        email: columns[0].trim(),
                        password: columns[1].trim()
                    });
                }
            })
            .on('end', () => {
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
                resolve(!!user);
            })
            .on('error', (error) => {
                console.error('Error reading CSV:', error);
                reject(error);
            });
    });
}

// Run fetchAndStoreAllCustomers every hour
setInterval(() => {
    fetchAndStoreAllCustomers()
        .then(() => console.log('Customer list updated and stored in customers.json'))
        .catch(err => console.error('Error updating customer list:', err));
}, 5 * 60 * 1000); // 5 min in milliseconds

module.exports = router;
