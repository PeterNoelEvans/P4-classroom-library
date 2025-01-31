const fs = require('fs');
const path = require('path');

function checkStudentFile(filename) {
    const filePath = path.join(__dirname, '..', 'student-lists', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\nChecking ${filename}:`);
    console.log('Raw content length:', content.length);
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.trim()) {
            // Show line number, content, and character codes
            console.log(`\nLine ${index + 1}:`);
            console.log('Content:', line);
            console.log('Length:', line.length);
            console.log('Character codes:', [...line].map(c => c.charCodeAt(0)));
            
            // Split and check parts
            const parts = line.split(/[\t\s]+/);
            console.log('Parts:', parts);
            if (parts.length >= 2) {
                console.log('Full Name:', parts.slice(0, -1).join(' '));
                console.log('Nickname:', parts[parts.length - 1]);
            }
        }
    });
}

// Check both files
checkStudentFile('G4-1-students.txt');
checkStudentFile('G4-2-students.txt'); 