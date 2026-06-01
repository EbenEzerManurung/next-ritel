# Next Ritel

A modern retail management system built with Next.js 15.5 and Vite, designed to help businesses manage customers, products, and sales transactions efficiently through a responsive and user-friendly interface.

## Backend API

This application is designed to work with a Golang REST API backend for data management, authentication, and database operations.

To connect this frontend application to the backend service, please refer to the following repository:

Backend API Repository:
https://github.com/EbenEzerManurung/API_GOLANG

The Golang API provides database connectivity, authentication services, customer management, product management, transaction processing, and other business-related operations required by the Next Ritel application.

![Next](https://img.shields.io/badge/Next.js 15.5-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38BDF8)
![PWA](https://img.shields.io/badge/PWA-Enabled-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Project Overview

Next Ritel is a Progressive Web Application (PWA) that provides a complete retail management solution for small and medium-sized businesses. The application offers customer management, product inventory management, transaction processing, reporting, and role-based authentication.

The project aims to demonstrate modern frontend development practices using Next.js 15.5, Vite, Tailwind CSS, and Progressive Web App technologies while delivering practical business functionality.

---

## Objectives

The main goals of Next Ritel are:

* Simplify daily retail operations.
* Improve transaction efficiency.
* Provide secure role-based access.
* Support mobile and desktop devices.
* Deliver a fast and responsive user experience.
* Demonstrate modern Next application architecture.
* Enable offline-capable Progressive Web App functionality.

---

## Technology Stack

### Frontend

* Next.js 15.5
* Vite
* Next js Router
* Tailwind CSS
* Heroicons
* SweetAlert2

### Progressive Web App

* Service Workers
* Manifest.json
* Offline Support
* Installable Application

### Data Export

* XLSX Excel Export

---

## Features

### Multi-Role Authentication

Supports two user roles:

* Admin
* Cashier

Features:

* Secure Login
* Role-Based Route Protection
* Session Management
* Protected Pages

---

### Dashboard

Real-time business statistics:

* Total Customers
* Total Products
* Total Transactions
* Total Revenue

---

### Customer Management (Admin & Cashier)

Features:

* Create Customer
* View Customer
* Update Customer
* Delete Customer
* Customer Search
* Pagination (10 records per page)
* Export to Excel
* Form Validation
* Soft Delete (Inactive Customer)

Search by:

* Customer Name
* Customer Code
* Phone Number

---

### Features:

* Create Product
* View Product
* Update Product
* Delete Product
* Product Search
* Pagination
* Export to Excel

Pricing Types:

| Code | Type            | Discount |
| ---- | --------------- | -------- |
| R    | Regular         | 0%       |
| SW   | Special Weekday | 25%      |
| D    | Discount        | 35%      |

---

### Transaction Management

Available for Admin and Cashier.

Features:

* Select Customer
* Add Multiple Products
* Shopping Cart
* Quantity Update
* Remove Products
* Automatic Total Calculation
* Stock Validation
* Multiple Payment Methods

Payment Methods:

* Cash
* QRIS
* Bank Transfer

---

### Transaction History

Features:

* View Transaction Records
* Search Transactions
* Pagination
* Export to Excel

---

### Progressive Web App (PWA)

Features:

* Installable on Desktop
* Installable on Mobile Devices
* Offline Support
* Service Workers
* Manifest Configuration
* Custom "R" Application Icon

---

### Modern UI/UX

Features:

* Responsive Design
* Mobile Friendly
* Tailwind CSS Styling
* Loading Spinner
* SweetAlert2 Notifications
* Heroicons
* Modern Gradient Design

---

## Application Modules

```text
Authentication
├── Admin
└── Cashier


Progressive Web App
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/EbenEzerManurung/next-ritel.git
```

Navigate to the project directory:

```bash
cd next-ritel
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

## Screenshots

Add screenshots of:

* Login Page
* Dashboard
* Customer Management
* Product Management
* Transaction Page
* Transaction History

screenshots:

# \# Lighthouse
<img width="844" height="216" alt="image" src="https://github.com/user-attachments/assets/be7a1988-e255-4e22-839e-8afdfd6cba16" />

# \# Dashboard

<img width="1891" height="927" alt="image" src="https://github.com/user-attachments/assets/c7faa538-d75b-4c43-9dce-c2a44f991dfc" />

<img width="1909" height="913" alt="image" src="https://github.com/user-attachments/assets/34cf6d81-2deb-467b-a13b-b8b7e6c02748" />

# \# Customer

<img width="1912" height="936" alt="image" src="https://github.com/user-attachments/assets/388dd92f-8c3e-44e5-b988-bf3304bd4ba9" />

# \# Produk
<img width="1896" height="931" alt="image" src="https://github.com/user-attachments/assets/cdaa4d70-7eb6-44c5-8c12-e2c792fe4198" />


# \# Transaksi
<img width="1909" height="925" alt="image" src="https://github.com/user-attachments/assets/0be5a383-e21a-4500-a4e9-83459c54307b" />


# \# Riwayat Transaksi (Transaction history)
<img width="1914" height="934" alt="image" src="https://github.com/user-attachments/assets/d34efb59-013d-48ab-9c8e-82d0768556af" />


```



