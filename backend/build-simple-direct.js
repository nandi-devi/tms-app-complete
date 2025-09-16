const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting simple direct build...');

// Clean dist directory
if (fs.existsSync('./dist')) {
  console.log('Cleaning dist directory...');
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Compile with absolute minimal settings
console.log('Compiling TypeScript...');
try {
  execSync('./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false --strict false --noEmitOnError false --target es2019 --module commonjs --moduleResolution node --outDir ./dist --rootDir ./src --esModuleInterop true', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
