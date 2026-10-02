# ChaJoy - Online Tea Shop & E-Commerce Platform

ChaJoy is a web-based online tea shop and e-commerce platform developed as a **Web Technologies course project**. The system provides a complete online shopping experience for customers while offering an administrative interface for managing products, users, orders, and other store operations.

The project was developed using **PHP with the MVC (Model-View-Controller) architecture**, along with HTML, CSS, JavaScript, and MySQL. The system focuses on applying server-side web development concepts, database integration, authentication, CRUD operations, role-based access, and responsive user interface design.

## Features

### Customer Module

* Customer registration and login
* Secure session-based authentication
* Customer profile management
* Browse available tea products
* View product details
* Add products to shopping cart
* Update or remove cart items
* Place orders
* View order history
* Track order information
* Responsive navigation and user interface

### Admin Module

* Admin authentication
* Admin dashboard
* Product management
* Add, update, and delete products
* Manage product information and pricing
* View and manage customer orders
* Manage customer accounts
* Monitor store activities
* Administrative profile section

### Product & Shopping System

* Database-driven product catalog
* Product categories
* Product pricing and availability
* Dynamic shopping cart
* Order calculation
* Database-based order management

## Technology Stack

**Frontend**

* HTML5
* CSS3
* JavaScript

**Backend**

* PHP
* MVC Architecture

**Database**

* MySQL
* phpMyAdmin

**Development Environment**

* XAMPP
* Apache
* Visual Studio Code

## System Architecture

ChaJoy follows the **MVC architecture** to separate the application's responsibilities into three major components:

* **Model:** Handles database operations and application data.
* **View:** Responsible for the user interface and presentation.
* **Controller:** Processes user requests, manages application logic, and connects the Model with the View.

This structure makes the application easier to organize, maintain, debug, and extend.

## Database

The system uses **MySQL** as its relational database. It stores and manages information such as:

* Users
* Products
* Categories
* Cart items
* Orders
* Order details
* Administrative information

Database operations are handled through PHP and integrated with the MVC structure.

## Project Structure

```text
ChaJoy/
│
├── app/
│   ├── controllers/
│   ├── models/
│   └── views/
│
├── config/
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── database/
│
├── index.php
└── README.md
```

The exact folder structure may vary depending on the final project configuration.

## Key Concepts Implemented

This project demonstrates practical implementation of several Web Technologies concepts:

* Client-side and server-side development
* PHP programming
* MVC architecture
* MySQL database integration
* CRUD operations
* User authentication
* Session management
* Role-based access
* Form handling and validation
* Dynamic content generation
* Database-driven web applications
* E-commerce workflow
* Responsive web design

## Installation & Setup

### 1. Install XAMPP

Install **XAMPP** and make sure Apache and MySQL are available.

### 2. Clone the Repository

Place the project inside the XAMPP `htdocs` directory.

```bash
git clone <repository-url>
```

Example:

```text
C:\xampp\htdocs\ChaJoy
```

### 3. Start XAMPP

Open XAMPP Control Panel and start:

```text
Apache
MySQL
```

### 4. Create the Database

Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Create the required ChaJoy database and import the SQL file provided with the project.

### 5. Configure Database Connection

Update the database configuration in the project according to your local MySQL credentials.

Typical configuration:

```text
Database Host: localhost
Database Name: chajoy
Username: root
Password: 
```

### 6. Run the Application

Open the project through your browser:

```text
http://localhost/ChaJoy
```

## Project Objectives

The main objectives of ChaJoy were to:

* Develop a functional database-driven web application.
* Apply PHP and MySQL in a real-world e-commerce scenario.
* Implement the MVC architectural pattern.
* Develop separate customer and administrative functionality.
* Practice CRUD operations and database management.
* Implement authentication and session-based access.
* Understand the complete workflow of a web-based shopping system.
* Apply frontend and backend web development concepts learned in the Web Technologies course.

## Learning Outcomes

Through this project, I gained practical experience in:

* Developing web applications using PHP.
* Structuring applications using MVC architecture.
* Designing and interacting with relational databases.
* Connecting PHP applications with MySQL.
* Implementing authentication and user sessions.
* Developing CRUD-based functionality.
* Building customer and admin interfaces.
* Debugging server-side and database-related issues.
* Managing a complete web development project using XAMPP and Git.

## Academic Project

**Course:** Web Technologies
**Project:** ChaJoy - Online Tea Shop & E-Commerce Platform
**Development Type:** Academic / Course Project
**Architecture:** MVC
**Backend:** PHP
**Database:** MySQL
**Server:** Apache / XAMPP
