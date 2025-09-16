const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting robust build process...');

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

// Check if TypeScript is properly installed
console.log('Checking TypeScript installation...');
try {
  execSync('npm list typescript', { stdio: 'pipe' });
  console.log('TypeScript is installed');
} catch (error) {
  console.error('TypeScript not found in dependencies');
  process.exit(1);
}

// Try to compile with the most permissive settings
console.log('Compiling TypeScript with robust settings...');
try {
  // Use the local TypeScript installation
  execSync('./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false --strict false', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Local tsc failed, trying npx...');
  try {
    execSync('npx tsc --skipLibCheck true --noImplicitAny false --strict false', { stdio: 'inherit' });
    console.log('Build completed with npx!');
  } catch (error2) {
    console.error('All TypeScript compilation methods failed');
    console.error('Error 1:', error.message);
    console.error('Error 2:', error2.message);
    process.exit(1);
  }
}
