const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Connected to MySQL");
        connection.release();
    }
});

app.get("/api/students", (req, res) => {

    db.query("SELECT * FROM students", (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

app.post("/api/students", (req, res) => {

    const { name, email, course } = req.body;

    const sql =
        "INSERT INTO students (name, email, course) VALUES (?, ?, ?)";

    db.query(
        sql,
        [name, email, course],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Student created successfully",
                id: result.insertId
            });
        }
    );
});

app.get("/health", (req, res) => {
    res.json({
        status: "UP"
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(Backend running on port ${PORT});
});
