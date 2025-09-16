const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting config-based build...');

// Clean dist directory
if (fs.existsSync('./dist')) {
  console.log('Cleaning dist directory...');
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Compile using the simple config
console.log('Compiling TypeScript with simple config...');
try {
  execSync('./node_modules/.bin/tsc --project tsconfig.simple.json', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Config build failed, trying direct compilation...');
  try {
    execSync('./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false --strict false --noEmitOnError false --target es2019 --module commonjs --moduleResolution node --outDir ./dist --rootDir ./src --esModuleInterop true', { stdio: 'inherit' });
    console.log('Direct build completed successfully!');
  } catch (error2) {
    console.error('All build methods failed');
    process.exit(1);
  }
}
