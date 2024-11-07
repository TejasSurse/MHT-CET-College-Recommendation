const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");


app.set("view engine", "ejs");
app.set("Views", path.join(__dirname, "/Views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/public")));


app.listen(8080, ()=>{
    console.log("Server listening");
});


const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CETREC'
});

app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.get("/streams", (req, res)=>{
    res.render("streams.ejs");
});

app.get("/find", (req, res)=>{
    res.render("find.ejs");
});

app.post("/find", (req, res) => {
    const { location, percentile } = req.body;

    // Define cutoff range (±3 of input percentile)
    const minCutoff = parseFloat(percentile) - 3;
    const maxCutoff = parseFloat(percentile) + 3;

    const query = `SELECT * FROM colleges WHERE Location = ? AND cutoff BETWEEN ? AND ?;`;

    conn.query(query, [location, minCutoff, maxCutoff], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).send("Internal Server Error");
        }

        // Check if results are empty
        if (results.length === 0) {
            // Pass a message to the view if no records found
            return res.render("result.ejs", { colleges: null, message: "No colleges found matching your criteria." });
        }
        
        // If records are found, pass them to the view
        res.render("result.ejs", { colleges: results, message: null });
    });
});


app.get("/contact", (req, res)=>{
    res.render("contact.ejs");
});

app.get("/show/:code", (req, res) => {
    let { code } = req.params;
    let query = "SELECT * FROM colleges WHERE `Institute Code` = ?;";
    conn.query(query, code, (err, result) => {
        if (err) {
            res.send("Something Went Wrong");
            console.log(err);
        } else {
            res.render('show.ejs', { collegeData: result });
        }
    });
});
