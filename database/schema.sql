CREATE DATABASE ration_system;
USE ration_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  aadhaar VARCHAR(12) UNIQUE,
  password VARCHAR(255),
  role ENUM('user','shopkeeper','admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT true,
  ration_card_number VARCHAR(50),
  ration_category ENUM('AAY', 'PHH'),
  family_members INT,
  mobile_number VARCHAR(15),
  city VARCHAR(100)
);

CREATE TABLE shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100)
);

CREATE TABLE stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT,
  rice INT,
  wheat INT
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  shop_id INT,
  rice INT,
  wheat INT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);