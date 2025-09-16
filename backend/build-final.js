const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting final build process...');

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

// Copy and convert files
console.log('Converting TypeScript to JavaScript...');

function convertFile(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8');
  
  // Remove TypeScript-specific syntax
  content = content
    // Remove import type statements
    .replace(/import\s+type\s+[^;]+;?\n?/g, '')
    // Convert import statements to require
    .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, "const $1 = require('$2');")
    .replace(/import\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"];?/g, "const { $1 } = require('$2');")
    // Convert export statements
    .replace(/export\s+default\s+/g, 'module.exports = ')
    .replace(/export\s*{\s*([^}]+)\s*};?/g, 'module.exports = { $1 };')
    .replace(/export\s+const\s+(\w+)/g, 'const $1')
    .replace(/export\s+function\s+(\w+)/g, 'function $1')
    .replace(/export\s+interface\s+\w+[^{]*{[^}]*}/g, '')
    .replace(/export\s+type\s+\w+[^=]*=[^;]*;?/g, '')
    // Remove type annotations
    .replace(/:\s*string\s*[=;]/g, '')
    .replace(/:\s*number\s*[=;]/g, '')
    .replace(/:\s*boolean\s*[=;]/g, '')
    .replace(/:\s*any\s*[=;]/g, '')
    .replace(/:\s*[A-Z]\w*\[\]\s*[=;]/g, '')
    .replace(/:\s*[A-Z]\w*\s*[=;]/g, '')
    .replace(/:\s*[A-Z]\w*\[\]\s*[=;]/g, '')
    // Remove interfaces and types
    .replace(/interface\s+\w+[^{]*{[^}]*}/g, '')
    .replace(/type\s+\w+[^=]*=[^;]*;?/g, '')
    // Remove enums
    .replace(/export\s+enum\s+\w+[^{]*{[^}]*}/g, '')
    .replace(/enum\s+\w+[^{]*{[^}]*}/g, '')
    // Remove interface blocks more aggressively
    .replace(/export\s+interface\s+\w+[^{]*{[^}]*}/g, '')
    .replace(/export\s+type\s+\w+[^=]*=[^;]*;?/g, '')
    // Remove any remaining interface-like blocks
    .replace(/{\s*[^}]*:\s*[^}]*\s*}/g, '')
    // Remove type assertions
    .replace(/as\s+any/g, '')
    .replace(/as\s+string/g, '')
    .replace(/as\s+number/g, '')
    .replace(/as\s+boolean/g, '')
    .replace(/as\s+[A-Z]\w*/g, '')
    // Remove generic types
    .replace(/<[^>]*>/g, '')
    // Remove array type syntax
    .replace(/\[\]/g, '')
    // Remove optional properties
    .replace(/\?\s*:/g, ':')
    .replace(/:\s*\?/g, '')
    // Remove Express types
    .replace(/\(req:\s*express\.Request,\s*res:\s*express\.Response\)/g, '(req, res)')
    .replace(/\(req:\s*express\.Request,\s*res:\s*express\.Response,\s*next:\s*express\.NextFunction\)/g, '(req, res, next)')
    .replace(/\(req:\s*Request,\s*res:\s*Response\)/g, '(req, res)')
    .replace(/\(req:\s*Request,\s*res:\s*Response,\s*next:\s*NextFunction\)/g, '(req, res, next)')
    .replace(/express\.Request/g, 'req')
    .replace(/express\.Response/g, 'res')
    .replace(/express\.NextFunction/g, 'next')
    .replace(/:\s*Request/g, '')
    .replace(/:\s*Response/g, '')
    .replace(/:\s*NextFunction/g, '')
    // Clean up extra whitespace but preserve line breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  fs.writeFileSync(destPath, content);
}

function convertDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      convertDir(srcPath, destPath);
    } else if (file.endsWith('.ts')) {
      const jsFile = file.replace('.ts', '.js');
      const jsPath = path.join(dest, jsFile);
      convertFile(srcPath, jsPath);
      console.log(`Converted: ${file} -> ${jsFile}`);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

convertDir('./src', './dist');
console.log('Final build completed successfully!');
