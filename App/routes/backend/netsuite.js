var https = require('follow-redirects').https;
var fs = require('fs');
const { get_token } = require('../libs/get_token');
const path = require('path');

function netsuite_querry(postData) {
    //console.log("postData:", postData);
    return new Promise((resolve, reject) => {
        const tokenFilePath = path.join(__dirname, 'token.txt');

        async function makeRequest(token) {
            //console.log("req_token:", token);
            var options = {
                'method': 'POST',
                'hostname': '11374585.suitetalk.api.netsuite.com',
                'path': '/services/rest/query/v1/suiteql',
                'headers': {
                    'Prefer': 'transient',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Add params section here
                'maxRedirects': 20
            };
            console.log("options:", options);
            var req = https.request(options, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", async function () {
                    var body = Buffer.concat(chunks);
                    //console.log("returned data:", body.toString());

                    if (res.statusCode === 401) {
                        console.log('Received 401, refreshing token...');
                        try {
                            const newToken = await get_token();
                            fs.writeFileSync(tokenFilePath, newToken, 'utf8');
                            makeRequest(newToken);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve(body.toString());
                        return JSON.parse(body.toString());
                    }
                });

                res.on("error", function (error) {
                    console.error(error);
                    reject(error);
                });
            });
            //console.log("req_postData:", postData);
            req.write(postData);
            req.end();
        }

        // Read the token from the file and make the request
        (async () => {
            if (fs.existsSync(tokenFilePath) && fs.statSync(tokenFilePath).size > 0) {
                const token = fs.readFileSync(tokenFilePath, 'utf8');
                console.log("token:", token);
                await makeRequest(token);
            } else {
                try {
                    const token = await get_token();
                    console.log("token:", token);
                    fs.writeFileSync(tokenFilePath, token, 'utf8');
                    await makeRequest(token);
                } catch (error) {
                    reject(error);
                }
            }
        })();
    });
}

function netsuite_query_with_url(postData, limit = 1000, offset = 0) {
    const url = `https://11374585.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql?limit=${limit}&offset=${offset}`;
    return new Promise((resolve, reject) => {
        const tokenFilePath = path.join(__dirname, 'token.txt');

        async function makeRequest(token) {
            const parsedUrl = new URL(url);
            var options = {
                'method': 'POST',
                'hostname': parsedUrl.hostname,
                'path': parsedUrl.pathname + parsedUrl.search,
                'headers': {
                    'Prefer': 'transient',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                'maxRedirects': 20
            };
            console.log("options:", options);
            var req = https.request(options, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", async function () {
                    var body = Buffer.concat(chunks);

                    if (res.statusCode === 401) {
                        console.log('Received 401, refreshing token...');
                        try {
                            const newToken = await get_token();
                            fs.writeFileSync(tokenFilePath, newToken, 'utf8');
                            makeRequest(newToken);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve(body.toString());
                    }
                });

                res.on("error", function (error) {
                    console.error(error);
                    reject(error);
                });
            });
            req.write(postData);
            req.end();
        }

        (async () => {
            if (fs.existsSync(tokenFilePath) && fs.statSync(tokenFilePath).size > 0) {
                const token = fs.readFileSync(tokenFilePath, 'utf8');
                console.log("token:", token);
                await makeRequest(token);
            } else {
                try {
                    const token = await get_token();
                    console.log("token:", token);
                    fs.writeFileSync(tokenFilePath, token, 'utf8');
                    await makeRequest(token);
                } catch (error) {
                    reject(error);
                }
            }
        })();
    });
}

async function get_employees() {
    var postData = JSON.stringify({
        "q": "SELECT id, entityid, email FROM employee;"
    });
    var tmp = await netsuite_querry(postData);
    //console.log("tmp:" , tmp);
    return tmp;
}

function Query_Customers(){
    var postData = JSON.stringify({
    "q": "SELECT customersubsidiaryrelationship.subsidiary AS customer_subsidiary_internal_id, subsid.name AS customer_subsidiary_name, customer.id AS customer_internal_id, customer.companyname AS customer_company_name, customer.parent AS customer_parent_customer_internal_id, parent.companyname AS customer_parent_customer_company_name, customer.salesrep AS salesrep_internal_id, salesrep.entityid AS salesrep_name, salesrep.email AS salesrep_email, customer.email AS customer_email, customer.custentity_2663_email_address_notif AS customer_alt_email, customer.phone AS customer_phone, customer.defaultbillingaddress AS customer_default_billing_address_internal_id, customer.defaultshippingaddress AS customer_default_shipping_address_internal_id, customer.terms AS customer_terms_internal_id, term.name AS customer_terms_name, customer.comments AS customer_comments, customer.custentity_on_hold AS customer_on_hold, customer.pricelevel AS customer_price_level_internal_id, pricelevel.name AS customer_price_level_name FROM customer AS customer LEFT JOIN customer AS parent ON parent.id = customer.parent LEFT JOIN employee AS salesrep ON salesrep.id = customer.salesrep LEFT JOIN term AS term ON customer.terms = term.id LEFT JOIN customersubsidiaryrelationship AS customersubsidiaryrelationship ON customer.id = customersubsidiaryrelationship.entity LEFT JOIN subsidiary AS subsid ON customersubsidiaryrelationship.subsidiary = subsid.id LEFT JOIN pricelevel AS pricelevel ON customer.pricelevel = pricelevel.id ORDER BY customer.companyname;"
    });
    return netsuite_querry(postData);
}
function Query_Customers_Addresses(CUSTOMER_INTERNAL_ID){
    var postData = JSON.stringify({
        "q": "SELECT address_book.addressbookaddress AS address_book_internal_id, address.addrtext AS address_text, address.addressee AS attention, address.addressee AS address_addressee, address.addrphone AS address_phone, address.addr1 AS address_line_1, address.addr2 AS address_line_2, address.addr3 AS address_line_3, address.city AS address_city, address.state AS address_state, address.zip AS address_zip, address.country AS address_country FROM customerAddressbook AS address_book LEFT JOIN entityaddress AS address ON address.nkey = address_book.addressbookaddress WHERE address_book.entity = {{CUSTOMER_INTERNAL_ID}};"
        });
    return netsuite_querry(postData);
}
function Customers_Contacts(){
    var postData = JSON.stringify({
    "q": "SELECT ContactSubsidiaryRelationship.subsidiary AS customer_subsidiary_internal_id, subsid.name AS customer_subsidiary_name, contact.id AS contact_internal_id, contact.firstname AS contact_first_name, contact.middlename AS contact_middle_name, contact.lastname AS contact_last_name, contact.entityid AS contact_name, contact.title AS contact_title, contact.company AS contact_customer_internal_id, customer.companyname AS customer_company_name, customer.parent AS customer_parent_internal_id, customerparent.companyname AS customer_parent_companyname, contact.email AS contact_email, contact.phone AS contact_phone, contact.mobilephone AS contact_mobile_phone, FROM contact AS contact JOIN customer AS customer ON customer.id = contact.company LEFT JOIN customer AS customerparent ON customer.parent = customerparent.id LEFT JOIN ContactSubsidiaryRelationship AS ContactSubsidiaryRelationship ON contact.id = ContactSubsidiaryRelationship .entity LEFT JOIN subsidiary AS subsid ON ContactSubsidiaryRelationship .subsidiary = subsid.id ORDER BY contact.entityid;"
    });
    return netsuite_querry(postData);
}
async function Inventory(offset = 0) {
    const postData = JSON.stringify({
        "q": `SELECT inventory.item AS item_internal_id, item.isinactive ,item.subsidiary AS item_subsidiary_internal_id, subsid.name AS item_subsidiary_name, item.itemid AS item_name, item.displayname AS item_display_name, item.upccode AS item_upc_code, item.description AS item_sales_description, item.purchasedescription AS item_purchase_description, item.custitem_discontinued AS item_discontinued, item.class AS item_class_id, class.fullname AS item_class_name, item.unitstype AS item_unit_type_internal_id, unitsType.name AS item_units_name, item.totalquantityonhand AS item_total_quanity_on_hand, item.minimumquantity AS item_minimum_order_quantity, item.totalvalue AS item_total_value_on_hand, inventory.location AS item_location_internal_id, location.name AS item_location_name, inventory.quantityonhand AS item_location_quantity_on_hand, inventory.quantitycommitted AS item_location_quantity_committed, inventory.quantityavailable AS item_location_quantity_available, inventory.quantityonorder AS item_location_quantity_on_order, inventory.quantityintransit AS item_location_quantity_in_transit, inventory.onhandvaluemli AS item_location_value_on_hand FROM inventoryItemLocations AS inventory LEFT JOIN item AS item ON inventory.item = item.id LEFT JOIN itemsubsidiarymap AS itemsubsidiarymap ON item.id = itemsubsidiarymap.item LEFT JOIN subsidiary AS subsid ON itemsubsidiarymap.subsidiary = subsid.id LEFT JOIN classification AS class ON item.class = class.id JOIN location AS location ON location.id = inventory.location LEFT JOIN unitsType AS unitsType ON item.unitstype = unitsType.id ORDER BY item.itemid, location.name;`
    });
    return netsuite_query_with_url(postData, 1000, offset);
}

function Pricing(){
    var postData = JSON.stringify({
    "q": "SELECT pricing.item AS item_pricing_item_internal_id, item.itemid AS item_pricing_item_name, pricing.pricelevel AS item_pricing_price_level_internal_id, pricelevel.name AS item_pricing_price_level_name, itemquantity.mincount AS item_pricing_mincount, itemquantity.maxcount AS item_pricing_maxcount, pricing.unitprice AS item_pricing_unit_price FROM pricing AS pricing LEFT JOIN item AS item ON pricing.item = item.id LEFT JOIN pricelevel AS pricelevel ON pricing.pricelevel = pricelevel.id LEFT JOIN itemquantity AS itemquantity ON pricing.item = itemquantity.item AND pricing.quantity = itemquantity.seqnum ORDER BY item.itemid, pricelevel.name, itemquantity.mincount;"
    });
    return netsuite_querry(postData);
}
function Sales_Orders(){
    var postData = JSON.stringify({
    "q": "SELECT salesorder.id AS sales_order_internal_id, salesorder.tranid AS sales_order_number, salesorder.status AS sales_order_status_internal_id, status.name AS sales_order_status_order_name, line.subsidiary AS sales_order_subsidiary_internal_id, subsid.name AS sales_order_subsidiary_name, salesorder.entity AS sales_order_customer_internal_id, customer.companyname AS sales_order_customer_company_name, customer.parent AS sales_order_customer_parent_internal_id, parent.companyname AS sales_order_customer_parent_company_name, salesorder.otherrefnum AS sales_order_po_number, salesorder.memo AS sales_order_memo, salesorder.trandate AS sales_order_date, salesorder.terms AS sales_order_terms_internal_id, term.name AS sales_order_terms_name, salesorder.employee AS sales_order_sales_rep_internal_id, salesrep.entityid AS sales_order_sales_rep_name, salesorder.currency AS sales_order_currency_internal_id, currency.name AS sales_order_currency_name, line.location AS sales_order_location_internal_id, location.name AS sales_order_location_name, salesorder.shippingaddress AS sales_order_shipping_address_internal_id, shippingaddress.attention AS sales_order_shipping_attention, shippingaddress.addressee AS sales_order_shipping_addressee, shippingaddress.addr1 AS sales_order_shipping_address_line_1, shippingaddress.addr2 AS sales_order_shipping_address_line_2, shippingaddress.addr3 AS sales_order_shipping_address_line_3, shippingaddress.city AS sales_order_shipping_address_city, shippingaddress.state AS sales_order_shipping_address_state, shippingaddress.zip AS sales_order_shipping_address_zip, shippingaddress.country AS sales_order_shipping_address_country, salesorder.billingaddress AS sales_order_billing_address_internal_id, billingaddress.attention AS sales_order_billing_attention, billingaddress.addressee AS sales_order_billing_addressee, billingaddress.addr1 AS sales_order_billing_address_line_1, billingaddress.addr2 AS sales_order_billing_address_line_2, billingaddress.addr3 AS sales_order_billing_address_line_3, billingaddress.city AS sales_order_billing_address_city, billingaddress.state AS sales_order_billing_address_state, billingaddress.zip AS sales_order_billing_address_zip, billingaddress.country AS sales_order_billing_address_country FROM transaction AS salesorder LEFT JOIN customer AS customer ON customer.id = salesorder.entity LEFT JOIN customer AS parent ON customer.parent = parent.id LEFT JOIN currency AS currency ON currency.id = salesorder.currency LEFT JOIN term AS term ON salesorder.terms = term.id LEFT JOIN employee as salesrep ON salesorder.employee = salesrep.id LEFT JOIN transactionshippingaddress AS shippingaddress ON shippingaddress.recordowner = salesorder.shippingaddress LEFT JOIN transactionbillingaddress AS billingaddress ON billingaddress.recordowner = salesorder.billingaddress LEFT JOIN transactionstatus AS status ON status.id = salesorder.status LEFT JOIN transactionline AS line ON line.transaction = salesorder.id LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id JOIN location AS location on line.location = location.id AND line.mainline = 'F' AND line.taxline = 'F' AND status.trantype = 'SalesOrd' WHERE salesorder.recordtype = 'salesorder' GROUP BY salesorder.id, salesorder.tranid, salesorder.status, status.name, line.subsidiary, subsid.name, salesorder.entity, customer.companyname, customer.parent, parent.companyname, salesorder.otherrefnum, salesorder.memo, salesorder.trandate, salesorder.terms, term.name, salesorder.employee, salesrep.entityid, salesorder.currency, currency.name, line.location, location.name, salesorder.shippingaddress, shippingaddress.attention, shippingaddress.addressee, shippingaddress.addr1, shippingaddress.addr2, shippingaddress.addr3, shippingaddress.city, shippingaddress.state, shippingaddress.zip, shippingaddress.country, salesorder.billingaddress, billingaddress.attention, billingaddress.addressee, billingaddress.addr1, billingaddress.addr2, billingaddress.addr3, billingaddress.city, billingaddress.state, billingaddress.zip, billingaddress.country;"
    });
    return netsuite_querry(postData);
}
function sales_order_lines(){
    var postData = JSON.stringify({
    "q": "SELECT line.transaction AS sales_order_internal_id, transaction.tranid AS sales_order_sales_order_number, line.subsidiary AS sales_order_subsidiary_internal_id, subsid.name AS sales_order_subsidiary_name, line.id AS sales_order_line_id, line.item AS sales_order_line_item_id, item.itemid AS sales_order_line_item_name, line.memo AS sales_order_line_description, line.class AS sales_order_line_class_internal_id, class.name AS class_name, line.location AS sales_order_line_location, location.name AS location_name, ABS(line.quantity) AS sales_order_line_quantity, line.quantitybackordered AS sales_order_line_quantity_back_ordered, line.quantitycommitted AS sales_order_line_quantity_comitted, line.quantityshiprecv AS sales_order_line_quantity_fulfilled, line.quantitybilled AS sales_order_line_quantity_invoiced, line.price AS sales_order_line_price_level_internal_id, pricelevel.name AS sales_order_line_price_level_name, line.rate AS sales_order_line_rate, ABS(line.netamount) AS sales_order_line_amount FROM transactionline AS line JOIN transaction AS transaction ON line.transaction = transaction.id LEFT JOIN item AS item ON item.id = line.item LEFT JOIN classification AS class ON class.id = line.class LEFT JOIN location AS location ON location.id = line.location LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id LEFT JOIN pricelevel AS pricelevel ON line.price = pricelevel.id WHERE line.mainline = 'F' AND line.taxline = 'F' AND line.transaction = {{SALESORDER_INTERNAL_ID}};"
    });
    return netsuite_querry(postData);
}
function Fulfillments(){
    var postData = JSON.stringify({
    "q": "SELECT itemship.id AS item_fulfillment_internal_id, itemship.tranid AS item_fulfillment_number, itemship.status AS item_fulfillment_status_id, status.name AS item_fulfillment_status, itemship.memo AS item_fulfillment_memo, itemship.trandate AS item_fulfillment_date, itemship.shipcarrier AS item_fulfillment_shipping_carrier, itemship.shipmethod AS item_fulfillment_shipping_method, itemship.entity AS item_fulfillment_customer_id, customer.entityid AS item_fulfillment_customer_name, line.createdfrom AS item_fulfillment_sales_order_internal_id, line.subsidiary AS item_fulfillment_subsidiary_internal_id, subsid.name AS item_fulfillment_subsidiary_name, trackingnumber.trackingnumber AS item_fulfillment_tracking_number FROM transaction AS itemship JOIN transactionstatus AS status ON status.id = itemship.status AND status.trantype = 'ItemShip' JOIN customer AS customer ON customer.id = itemship.entity JOIN transactionline AS line ON line.transaction = itemship.id LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id LEFT JOIN trackingnumbermap AS trackingnumbermap ON itemship.id = trackingnumbermap.transaction LEFT JOIN trackingnumber AS trackingnumber ON trackingnumbermap.trackingnumber = trackingnumber.id WHERE itemship.recordtype = 'itemfulfillment' GROUP BY itemship.id, itemship.tranid, itemship.status, itemship.memo, status.name, itemship.trandate, itemship.shipcarrier, itemship.shipmethod, itemship.entity, customer.entityid, line.createdfrom, line.subsidiary, subsid.name, trackingnumber.trackingnumber;"
    });
    return netsuite_querry(postData);
}
function fulfillment(ITEM_FULFILLMENT_INTERNAL_ID){
    var postData = JSON.stringify({
    "q": "SELECT line.transaction AS item_fulfillment_internal_id, itemship.tranid AS item_fulfillment_number, line.subsidiary AS item_fulfillment_subsidiary_internal_id, subsid.name AS item_fulfillment_subsidiary_name, line.id AS item_fulfillment_line_id, line.item AS item_fulfillment_item_internal_id, item.itemid AS item_fulfillment_item_name, item.description AS item_fulfillment_item_description, ABS(line.quantity) AS item_fulfillment_quantity, line.location AS item_fulfillment_location_internal_id, location.name AS item_fulfillment_location_name FROM transactionline AS line LEFT JOIN transaction AS itemship ON itemship.id = line.transaction LEFT JOIN item AS item ON item.id = line.item LEFT JOIN location AS location ON location.id = line.location LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id WHERE line.mainline = 'F' AND line.taxline = 'F' AND isinventoryaffecting = 'T' AND line.transaction = {{ITEM_FULFILLMENT_INTERNAL_ID}};"
    });
    return netsuite_querry(postData);
}
function Invoices(){
    var postData = JSON.stringify({
        "q": "SELECT custinvc.id AS customer_invoice_internal_id, custinvc.tranid AS customer_invoice_number, custinvc.trandate AS customer_invoice_date, custinvc.terms AS customer_invoice_terms_id, term.name AS customer_invoice_terms_name, custinvc.shipdate AS customer_invoice_ship_date, custinvc.memo AS customer_invoice_memo, custinvc.daysopen AS customer_invoice_days_open, custinvc.email AS customer_invoice_email, custinvc.currency AS customer_invoice_currency_id, currency.name AS customer_invoice_currency_name, custinvc.duedate AS customer_invoice_due_date, custinvc.foreignamountunpaid AS customer_invoice_amount_unpaid, custinvc.custbody_track_num AS customer_invoice_custbody_track_num, custinvc.entity AS customer_invoice_customer_internal_id, customer.entityid AS customer_invoice_customer_name, parent.id AS customer_invoice_parent_customer_internal_id, parent.companyname AS customer_invoice_parent_customer_name, custinvc.otherrefnum AS customer_invoice_po_number, custinvc.foreignamountpaid AS customer_invoice_amount_paid, custinvc.status AS customer_invoice_status_internal_id, status.name AS customer_invoice_status_name, custinvc.foreigntotal customer_invoice_total, custinvc.employee AS customer_invoice_sales_rep_internal_id, salesrep.entityid AS customer_invoice_sales_rep_name, line.createdfrom AS customer_invoice_created_from_sales_order_internal_id, line.subsidiary AS customer_invoice_subsidiary_internal_id, subsid.name AS customer_invoice_subsidiary_name, line.location AS customer_invoice_location_internal_id, location.name AS customer_invoice_location_name, salesorder.tranid AS customer_invoice_created_from_sales_order_number, custinvc.custbody_comm_int AS customer_invoice_comments_internal, custinvc.shippingaddress AS customer_invoice_shipping_address_internal_id, shippingaddress.attention AS customer_invoice_shipping_attention, shippingaddress.addressee AS customer_invoice_shipping_addressee, shippingaddress.addr1 AS customer_invoice_shipping_address_line_1, shippingaddress.addr2 AS customer_invoice_shipping_address_line_2, shippingaddress.addr3 AS customer_invoice_shipping_address_line_3, shippingaddress.city AS customer_invoice_shipping_address_city, shippingaddress.state AS customer_invoice_shipping_address_state, shippingaddress.zip AS customer_invoice_shipping_address_zip, shippingaddress.country AS customer_invoice_shipping_address_country, custinvc.billingaddress AS customer_invoice_billing_address_internal_id, billingaddress.attention AS customer_invoice_billing_attention, billingaddress.addressee AS customer_invoice_billing_addressee, billingaddress.addr1 AS customer_invoice_billing_address_line_1, billingaddress.addr2 AS customer_invoice_billing_address_line_2, billingaddress.addr3 AS customer_invoice_billing_address_line_3, billingaddress.city AS customer_invoice_billing_address_city, billingaddress.state AS customer_invoice_billing_address_state, billingaddress.zip AS customer_invoice_billing_address_zip, billingaddress.country AS customer_invoice_billing_address_country FROM transaction AS custinvc LEFT JOIN term AS term ON term.id = custinvc.terms LEFT JOIN currency AS currency ON currency.id = custinvc.currency LEFT JOIN transactionstatus AS status ON status.id = custinvc.status AND status.trantype = 'CustInvc' LEFT JOIN customer AS customer ON customer.id = custinvc.entity LEFT JOIN customer AS parent ON customer.parent = parent.id LEFT JOIN employee AS salesrep ON salesrep.id = custinvc.employee LEFT JOIN transactionline AS line ON line.transaction = custinvc.id JOIN location AS location ON line.location = location.id LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id LEFT JOIN transaction AS salesorder ON line.createdfrom = salesorder.id LEFT JOIN transactionshippingaddress AS shippingaddress ON shippingaddress.recordowner = custinvc.shippingaddress LEFT JOIN transactionbillingaddress AS billingaddress ON billingaddress.recordowner = custinvc.billingaddress WHERE custinvc.recordtype = 'invoice' GROUP BY custinvc.id, custinvc.tranid, custinvc.trandate, custinvc.terms, term.name, custinvc.shipdate, custinvc.memo, custinvc.daysopen, custinvc.email, custinvc.currency, currency.name, custinvc.duedate, custinvc.foreignamountunpaid, custinvc.custbody_track_num, custinvc.entity, customer.entityid, parent.id, parent.companyname, custinvc.otherrefnum, custinvc.foreignamountpaid, custinvc.status, status.name, custinvc.foreigntotal, custinvc.employee, salesrep.entityid, line.createdfrom, line.subsidiary, subsid.name, line.location, location.name, salesorder.tranid, custinvc.custbody_comm_int, custinvc.shippingaddress, shippingaddress.attention, shippingaddress.addressee, shippingaddress.addr1, shippingaddress.addr2, shippingaddress.addr3, shippingaddress.city, shippingaddress.state, shippingaddress.zip, shippingaddress.country, custinvc.billingaddress, billingaddress.attention, billingaddress.addressee, billingaddress.addr1, billingaddress.addr2, billingaddress.addr3, billingaddress.city, billingaddress.state, billingaddress.zip, billingaddress.country;"
    });
    return netsuite_querry(postData);
}
function Invoice_Lines(CUSTOMER_INVOICE_INTERNAL_ID){
    var postData = JSON.stringify({
        "q": "SELECT line.transaction AS customer_invoice_internal_id, custinvc.tranid AS customer_invoice_number, line.subsidiary AS customer_invoice_subsidiary_intenal_id, subsid.name AS customer_invoice_subsidiary_name, line.id AS customer_invoice_line_id, line.item AS customer_invoice_item_internal_id, item.itemid AS customer_invoice_item_name, line.memo AS customer_invoice_item_description, ABS(salesorderline.quantity) AS customer_invoice_item_quantity_ordered, ABS(line.quantity) AS customer_invoice_item_quanity, line.price AS customer_invoice_item_price_level_internal_id, pricelevel.name AS customer_invoice_item_price_level_name, line.rate AS customer_item_item_rate, ABS(line.foreignamount) AS customer_invoice_item_amount, line.location AS customer_invoice_item_location_internal_id, location.name AS customer_invoice_item_location_name, line.entity AS customer_invoice_item_customer_internal_id, line.createdfrom AS customer_invoice_item_sales_order_internal_id, FROM transactionline AS line LEFT JOIN transaction AS custinvc ON custinvc.id = line.transaction LEFT JOIN item AS item ON line.item = item.id LEFT JOIN location AS location ON line.location = location.id LEFT JOIN subsidiary AS subsid ON line.subsidiary = subsid.id LEFT JOIN transactionline AS salesorderline ON line.createdfrom = salesorderline.transaction AND line.linesequencenumber = salesorderline.linesequencenumber LEFT JOIN pricelevel ON line.price = pricelevel.id WHERE custinvc.recordtype = 'invoice' AND line.taxline = 'F' AND line.mainline = 'F' AND line.accountinglinetype = 'INCOME' AND line.transaction = {{CUSTOMER_INVOICE_INTERNAL_ID}};"
    });
    return netsuite_querry(postData);
}
function Credit_Memo(){
    var postData = JSON.stringify({
    "q": "SELECT custcred.id AS customer_credit_memo_internal_id, custcred.tranid AS customer_credit_memo_number, custcred.status AS customer_credit_memo_status_internal_id, status.name AS customer_credit_memo_status, custcred.memo AS customer_credit_memo_memo, custcred.employee AS customer_credit_memo_sales_rep_internal_id, salesrep.entityid AS customer_credit_memo_sales_rep, custcred.trandate AS customer_credit_memo_date, custcred.entity AS customer_credit_memo_customer_internal_id, customer.entityid AS customer_credit_memo_customer_name, customer.parent AS customer_credit_memo_parent_customer_internal_id, parent.companyname AS customer_credit_memo_parent_customer_name, custcred.currency AS customer_credit_memo_currency_internal_id, currency.name AS customer_credit_memo_currency, ABS(custcred.foreigntotal) AS customer_credit_memo_total, custcred.foreignpaymentamountused AS customer_credit_memo_amount_applied, custcred.foreignpaymentamountunused AS customer_credit_memo_amount_unapplied, custcred.billingaddress AS customer_credit_memo_billing_address_internal_id, billingaddress.attention AS customer_credit_memo_billing_attention, billingaddress.addressee AS customer_credit_memo_billing_addressee, billingaddress.addr1 AS customer_credit_memo_billing_address_line_1, billingaddress.addr2 AS customer_credit_memo_billing_address_line_2, billingaddress.addr3 AS customer_credit_memo_billing_address_line_3, billingaddress.city AS customer_credit_memo_billing_address_city, billingaddress.state AS customer_credit_memo_billing_address_state, billingaddress.zip AS customer_credit_memo_billing_address_zip, billingaddress.country AS customer_credit_memo_billing_address_country FROM transaction AS custcred JOIN customer ON custcred.entity = customer.id LEFT JOIN customer AS parent ON customer.parent = parent.id JOIN transactionstatus AS status ON status.id = custcred.status AND status.trantype = 'CustCred' JOIN employee AS salesrep ON salesrep.id = custcred.employee JOIN currency AS currency ON currency.id = custcred.currency LEFT JOIN transactionbillingaddress AS billingaddress ON billingaddress.recordowner = custcred.billingaddress WHERE custcred.recordtype = 'creditmemo';"
    });
    return netsuite_querry(postData);
}
function Credit_Memo_lines(CUSTOMER_CREDIT_MEMO_INTERNAL_ID){
    var postData = JSON.stringify({
    "q": "SELECT line.transaction AS customer_credit_memo_internal_id, custcred.tranid AS customer_credit_memo_number, line.id AS customer_credit_memo_line_id, line.item AS customer_credit_memo_item_internal_id, item.itemid AS customer_credit_memo_item_name, line.memo AS customer_credit_memo_item_description, ABS(line.rate) AS customer_credit_memo_item_rate, ABS(line.quantity) AS customer_credit_memo_quantity, ABS(line.foreignamount) AS customer_credit_memo_item_amount FROM transactionline AS line JOIN transaction AS custcred ON custcred.id = line.transaction JOIN item AS item ON line.item = item.id JOIN location AS location ON line.location = location.id WHERE custcred.recordtype = 'creditmemo' AND line.taxline = 'F' AND line.mainline = 'F' AND line.accountinglinetype = 'INCOME' AND line.transaction = {{CUSTOMER_CREDIT_MEMO_INTERNAL_ID}};"
    });
    return netsuite_querry(postData);
}

module.exports = {
    get_employees,
    Query_Customers,
    Query_Customers_Addresses,
    Customers_Contacts,
    Inventory,
    Pricing,
    Sales_Orders,
    sales_order_lines,
    Fulfillments,
    Invoices,
    Invoice_Lines,
    Credit_Memo,
    Credit_Memo_lines
};

