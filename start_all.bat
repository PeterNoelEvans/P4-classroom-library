@echo off
echo Starting MongoDB and Node.js Server...

start cmd /k "mongod --dbpath="D:/P4-books-V2/data/db" --port 27018"

timeout /t 5

start cmd /k "node server.js"

echo Servers are starting...
echo MongoDB should be running on port 27018
echo Node.js server should be running on port 4000
echo.
echo You can now access the application at http://localhost:4000
pause 