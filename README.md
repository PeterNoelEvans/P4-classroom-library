# P4 Classroom Library Management System

A digital library management system designed for fourth-grade classes (4/1 and 4/2), built with Node.js and MongoDB.

## Features

- Student authentication with nickname-based passwords
- Class-specific book lists
- Book borrowing and return system
- Reading progress tracking
- Quiz system for each book
- Affective domain evaluation with emoji ratings
- Book popularity tracking
- Administrative dashboard for teachers
- Detailed reports and statistics

## Prerequisites

- Node.js
- MongoDB (running on port 27018)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PeterNoelEvans/P4-classroom-library.git
cd P4-classroom-library
```

2. Install dependencies:
```bash
npm install
```

3. Create data directories:
```bash
mkdir -p data/db
mkdir -p data/log
```

4. Set up your book and student lists in:
- `book-lists/G4-1-books.txt`
- `book-lists/G4-2-books.txt`
- `student-lists/G4-1-students.txt`
- `student-lists/G4-2-students.txt`

## Configuration

1. Create a `.env` file with:
```env
PORT=4000
MONGODB_URL=mongodb://127.0.0.1:27018/SchoolLibrary
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

## Running the Application

1. Start MongoDB:
```bash
mongod --dbpath="D:/P4-books-V2/data/db" --port 27018
```

2. Start the server:
```bash
npm start
```

Or use the provided batch files:
- `start_mongodb.bat`
- `start_server.bat`
- `start_all.bat`

## Usage

1. Access the application:
- Student interface: `http://localhost:4000`
- Admin interface: `http://localhost:4000/admin-login.html`

2. Import initial data:
```bash
node scripts/importStudents.js
node scripts/importBooks.js
```

## Directory Structure

```
project/
├── server.js
├── models/
│   ├── user.js
│   ├── book.js
├── routes/
│   ├── auth.js
│   ├── books.js
│   ├── admin.js
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
├── book-lists/
│   ├── G4-1-books.txt
│   ├── G4-2-books.txt
├── student-lists/
│   ├── G4-1-students.txt
│   ├── G4-2-students.txt
└── scripts/
    ├── importBooks.js
    ├── importStudents.js
    └── various utility scripts
```

## Backup and Recovery

Use the provided scripts:
```bash
node scripts/backupDatabase.js
node scripts/restoreDatabase.js
```

## License

MIT License 