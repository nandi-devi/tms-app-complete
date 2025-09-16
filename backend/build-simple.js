const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting simple build process...');

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

// Compile TypeScript with simple config
console.log('Compiling TypeScript with simple config...');
try {
  execSync('npx tsc --project tsconfig.simple.json --skipLibCheck true --noImplicitAny false', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Simple build failed:', error.message);
  process.exit(1);
}
