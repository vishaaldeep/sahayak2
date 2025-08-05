// Simple test to check if CSV file can be read
const fs = require('fs');
const path = require('path');

console.log('🎯 Testing CSV file access...');

const csvFilePath = path.join(__dirname, 'jobs_data.csv');
console.log('CSV file path:', csvFilePath);

// Check if file exists
if (fs.existsSync(csvFilePath)) {
    console.log('✅ CSV file exists');
    
    // Check file stats
    const stats = fs.statSync(csvFilePath);
    console.log('File size:', stats.size, 'bytes');
    console.log('File modified:', stats.mtime);
    
    // Try to read first few lines
    try {
        const content = fs.readFileSync(csvFilePath, 'utf8');
        const lines = content.split('\n');
        console.log('Total lines:', lines.length);
        console.log('First line (header):', lines[0]);
        console.log('Second line (first data):', lines[1]?.substring(0, 100) + '...');
        console.log('✅ CSV file is readable');
    } catch (error) {
        console.error('❌ Error reading CSV file:', error.message);
    }
} else {
    console.error('❌ CSV file not found at:', csvFilePath);
}

// Test csv-parser dependency
try {
    const csv = require('csv-parser');
    console.log('✅ csv-parser dependency is available');
} catch (error) {
    console.error('❌ csv-parser dependency not found:', error.message);
}

console.log('🏁 CSV test completed');