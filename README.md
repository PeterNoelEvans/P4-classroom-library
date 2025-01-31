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

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/PeterNoelEvans/P4-classroom-library.git
cd P4-classroom-library
```

2. Install dependencies:
```bash
npm install
```

3. Create required directories:
```bash
mkdir -p data/db
mkdir -p data/log
mkdir -p backups
```

## MongoDB Setup

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. Add MongoDB to your system PATH (Windows):
   - Default path: `C:\Program Files\MongoDB\Server\{version}\bin`

3. Start MongoDB:
```bash
# Using the provided batch file:
start_mongodb.bat

# Or manually:
mongod --dbpath="D:/P4-books-V2/data/db" --port 27018
```

## Data Preparation

1. Prepare student lists:
   - Create `student-lists/G4-1-students.txt` and `G4-2-students.txt`
   - Format: `Full Name    Nickname` (tab-separated)
   - Example:
     ```
     John Smith    Johnny
     Mary Jones    May
     ```

2. Prepare book lists:
   - Create `book-lists/G4-1-books.txt` and `G4-2-books.txt`
   - One book title per line
   - Example:
     ```
     The Magic Key
     Underground Adventure
     ```

3. Clean and verify data:
```bash
# Check student data format
node scripts/checkStudentData.js

# Clean student data
node scripts/cleanStudentData.js

# Check book data
node scripts/checkBooks.js
```

## Database Population

1. Import students:
```bash
node scripts/importStudents.js
```

2. Import books:
```bash
node scripts/importBooks.js
```

3. Verify imports:
```bash
# Check students
node scripts/checkUsers.js

# Check books
node scripts/checkBooks.js
```

## Environment Configuration

1. Create `.env` file in project root:
```env
PORT=4000
MONGODB_URL=mongodb://127.0.0.1:27018/SchoolLibrary
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

## Running the Application

1. Start all services:
```bash
# Using batch file:
start_all.bat

# Or manually:
start mongod --dbpath="D:/P4-books-V2/data/db" --port 27018
node server.js
```

2. Access the application:
- Student interface: `http://localhost:4000`
- Admin interface: `http://localhost:4000/admin-login.html`

## Backup and Recovery

1. Create backup:
```bash
node scripts/backupDatabase.js
```

2. Restore from backup:
```bash
node scripts/restoreDatabase.js
```

## Troubleshooting

1. If MongoDB fails to start:
   - Check if the data directory exists and is writable
   - Ensure port 27018 is not in use
   - Check MongoDB logs in data/log

2. If student import fails:
   - Run `checkStudentData.js` to verify data format
   - Clean data using `cleanStudentData.js`
   - Check for duplicate entries

3. If book import fails:
   - Verify book list format
   - Check for duplicate titles
   - Run `checkBooks.js` to verify database state

## License

MIT License 