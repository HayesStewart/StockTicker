var http = require('http');
var url = require('url');

const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 3000;
const mongoUrl = "mongodb+srv://hayes:hayes1@productscluster.ruwrxk8.mongodb.net/?appName=productsCluster";
const DB_NAME = 'Stock';
const COLLECTION_NAME = 'PublicCompanies';

let coll;


// Connect to mongo
MongoClient.connect(mongoUrl)
    .then(client => {
        console.log('Connected to MongoDB');
        var db = client.db("Stock");
        coll = db.collection("PublicCompanies");
        
    })
    //error catcher 
    .catch(err => {
        console.error('Mongo connect error:', err);
    });



http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    let query = parsedUrl.query;

    if (pathname == "/") {
        res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>find</title>
            </head>
            <body>
                <h2>Stock Lookup</h2>
                <form action="/process" method="GET">
                    <label for="stockInput">Enter Stock Ticker or Company Name:</label><br>
                    <input type="text" id="stockInput" name="stockInput" required><br><br>
                   
                    <label>Search Type:</label><br>
                    <input type="radio" id="ticker" name="searchType" value="ticker" checked>
                    <label for="ticker">Ticker Symbol</label><br>
                    <input type="radio" id="company" name="searchType" value="company">
                    <label for="company">Company Name</label><br><br>
                   
                    <button type="submit">Search</button>
                </form>
            </body>
            </html>
        `);
        console.log("GOT HERE LINE 59");
        res.end();
    }
    else if (pathname == "/process") {
        // i) Get the form data
        var stockInput = query.stockInput || "";
        var searchType = query.searchType || "";
       
        // ii) Determine whether searching by company name or ticker symbol
        var searchQuery = {};
       
        if (searchType === "ticker") {
            // Case-insensitive exact match on stockTicker field
            searchQuery = { stockTicker: stockInput.toUpperCase() };
           
        } else if (searchType === "company") {
            // Case-insensitive partial match on companyName field
            searchQuery = { companyName: stockInput};
        }
       
        // iii) Find matching data in MongoDB database
        coll.find(searchQuery).toArray()
            .then(results => {
                // iv) Display the results in console
                // if (results.length > 0) {
                //     console.log(`Found ${results.length} matching result(s):\n`);
                //     results.forEach((stock, index) => {
                //         console.log(`Result ${index + 1}:`);
                //         console.log(`  Name: ${stock.companyName}`);
                //         console.log(`  Ticker: ${stock.stockTicker}`);
                //         console.log(`  Price: $${stock.stockPrice}`);
                //         console.log("");
                //     });
                // } else {
                //     console.log("No Matching Stocks Found in the Database.");
                // }
               
                // Display results on webpage
                res.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Process Results</title>
                    </head>
                    <body>
                        <h2>Search Results</h2>
                        <p><strong>Input:</strong> ${stockInput}</p>
                        <p><strong>Search Type:</strong> ${searchType}</p>
                `);
               
                if (results.length > 0) {
                    res.write(`<p>Found: ${results.length} matches</p>`);
                    res.write("<ul>");
                    results.forEach(stock => {
                        res.write(`<li>${stock.companyName} (${stock.stockTicker}) - $${stock.stockPrice}</li>`);
                        console.log(stock.companyName + " " + stock.stockTicker + " " + stock.stockPrice);
                    });
                    res.write("</ul>");
                } else {
                    res.write("<p>No matching stocks found in the database.</p>");
                }
               
                res.write(`
                    </body>
                    </html>
                `);
                res.end();
            })
            .catch(err => {
                //res.write('<a href="/">Error. Back to Form</a>');
                console.log("database Error" + err)
            });
    }
    else {
        res.write("<a href='/'>Error. Go Home</a>");
        res.end();
    }
   
}).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});