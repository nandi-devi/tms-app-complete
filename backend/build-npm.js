const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting npm build process...');

// Clean dist directory
if (fs.existsSync('./dist')) {
  console.log('Cleaning dist directory...');
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Use npm script to build
console.log('Building with npm script...');
try {
  execSync('npm run build:tsc', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('NPM build failed:', error.message);
  process.exit(1);
}
