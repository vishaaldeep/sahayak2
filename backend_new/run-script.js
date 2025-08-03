#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get script name from command line arguments
const scriptName = process.argv[2];

if (!scriptName) {
    console.log('Usage: node run-script.js <script-name>');
    console.log('Available scripts:');
    console.log('  - assignCreditScore');
    console.log('  - updateCreditScores');
    console.log('  - assignSkills');
    console.log('  - seedJobs');
    process.exit(1);
}

const scripts = {
    'assignCreditScore': 'scripts/assignCreditScore.js',
    'updateCreditScores': 'scripts/updateCreditScores.js',
    'assignSkills': 'assignSkills.js',
    'seedJobs': 'seedJobs.js'
};

const scriptPath = scripts[scriptName];

if (!scriptPath) {
    console.error(`Script "${scriptName}" not found.`);
    console.log('Available scripts:', Object.keys(scripts).join(', '));
    process.exit(1);
}

console.log(`Running script: ${scriptName}`);
console.log(`File: ${scriptPath}`);
console.log('---');

// Run the script
const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    cwd: __dirname
});

child.on('close', (code) => {
    console.log('---');
    console.log(`Script "${scriptName}" finished with exit code ${code}`);
});

child.on('error', (error) => {
    console.error(`Error running script "${scriptName}":`, error.message);
});