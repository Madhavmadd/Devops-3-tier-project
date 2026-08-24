const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./students.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            course TEXT NOT NULL,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

app.get("/api/courses", (req, res) => {
    const courses = [
        {
            id: 1,
            name: "AWS DevOps",
            description: "Learn AWS, Linux, Docker and Jenkins",
            price: 4999
        },
        {
            id: 2,
            name: "Python Programming",
            description: "Learn Python from basics to advanced",
            price: 3999
        },
        {
            id: 3,
            name: "Full Stack Development",
            description: "HTML, CSS, JavaScript and Node.js",
            price: 5999
        }
    ];

    res.json(courses);
});

app.post("/api/register", (req, res) => {

    const { name, email, phone, course } = req.body;

    if (!name || !email || !phone || !course) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO students
        (name, email, phone, course)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [name, email, phone, course], function(err) {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json({
            message: "Registration successful",
            studentId: this.lastID
        });
    });
});

app.get("/api/students", (req, res) => {

    db.all(
        "SELECT * FROM students ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(rows);
        }
    );
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "Backend is running",
        database: "SQLite"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});
