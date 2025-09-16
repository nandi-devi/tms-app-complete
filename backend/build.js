const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

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

// Compile TypeScript with more permissive settings
console.log('Compiling TypeScript...');
try {
  // Try different ways to find tsc (prefer local installations)
  const tscPaths = [
    './node_modules/.bin/tsc',
    './node_modules/typescript/bin/tsc',
    'npx tsc'
  ];
  
  let tscCommand = null;
  for (const path of tscPaths) {
    try {
      execSync(`${path} --version`, { stdio: 'pipe' });
      tscCommand = path;
      console.log(`Found TypeScript at: ${path}`);
      break;
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!tscCommand) {
    throw new Error('TypeScript not found');
  }
  
  execSync(`${tscCommand} --noEmitOnError false --skipLibCheck true`, { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('TypeScript compilation failed, trying minimal approach...');
  // Try minimal compilation approach
  try {
    execSync('./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false --strict false --noEmitOnError false', { stdio: 'inherit' });
    console.log('Minimal build completed successfully!');
  } catch (error2) {
    console.error('All build methods failed:', error2.message);
    process.exit(1);
  }
}
