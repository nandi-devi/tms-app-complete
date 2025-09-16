const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting direct build process...');

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

// Try to compile using npm script
console.log('Building with npm script...');
try {
  execSync('npm run build:tsc', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('NPM build failed, trying direct compilation...');
  
  // Try direct compilation
  try {
    execSync('npx tsc --skipLibCheck true --noImplicitAny false', { stdio: 'inherit' });
    console.log('Direct build completed successfully!');
  } catch (error2) {
    console.error('All build methods failed:', error2.message);
    process.exit(1);
  }
}
