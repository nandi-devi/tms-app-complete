const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting minimal build process...');

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

// Compile with minimal settings
console.log('Compiling TypeScript with minimal settings...');
try {
  // Use the most permissive settings possible
  execSync('./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false --strict false --noEmitOnError false', { stdio: 'inherit' });
  console.log('Minimal build completed successfully!');
} catch (error) {
  console.error('Minimal build failed:', error.message);
  process.exit(1);
}
