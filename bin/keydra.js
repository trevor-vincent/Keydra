#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// Get the path to the main.js file
const appPath = path.join(__dirname, '..', 'main.js');

// Forward all command line arguments
const args = process.argv.slice(2);

// Spawn electron with the app path and arguments
const proc = spawn(electron, [appPath, ...args], {
  stdio: 'inherit',
  detached: false
});

// Handle process exit
proc.on('close', (code) => {
  process.exit(code);
});