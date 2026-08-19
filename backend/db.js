CREATE DATABASE studentdb;

USE studentdb;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    course VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (name, email, course)
VALUES
('Ravi', 'ravi@gmail.com', 'AWS DevOps'),
('John', 'john@gmail.com', 'Java'),
('Priya', 'priya@gmail.com', 'Python');
