const fs = require('fs');
const path = require('path');

function cleanStudentFile(filename) {
    const filePath = path.join(__dirname, '..', 'student-lists', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Clean and standardize the data
    const cleanedLines = content
        .split('\n')
        .map(line => {
            if (!line.trim()) return '';
            
            // Split on any whitespace and filter out empty strings
            const parts = line.split(/[\t\s]+/).filter(Boolean);
            if (parts.length < 2) return '';
            
            // Last part is nickname, rest is full name
            const nickname = parts[parts.length - 1];
            const fullName = parts.slice(0, -1).join(' ');
            
            return `${fullName}\t${nickname}`;
        })
        .filter(Boolean)
        .join('\n');
    
    // Write cleaned data back to a new file
    const cleanedPath = path.join(__dirname, '..', 'student-lists', `cleaned_${filename}`);
    fs.writeFileSync(cleanedPath, cleanedLines + '\n');
    
    console.log(`Cleaned data written to cleaned_${filename}`);
    
    // Show sample of cleaned data
    console.log('\nSample of cleaned data:');
    cleanedLines.split('\n').slice(0, 3).forEach(line => {
        console.log(line);
    });
}

// Clean both files
cleanStudentFile('G4-1-students.txt');
cleanStudentFile('G4-2-students.txt'); 