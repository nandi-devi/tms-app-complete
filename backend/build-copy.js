const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting copy-based build process...');

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

// Create dist directory
console.log('Creating dist directory...');
fs.mkdirSync('./dist', { recursive: true });

// Copy all files from src to dist
console.log('Copying source files...');
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir('./src', './dist');
console.log('Copy build completed successfully!');
