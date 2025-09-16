const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting JavaScript compilation build...');

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

// Simple TypeScript to JavaScript conversion
console.log('Converting TypeScript to JavaScript...');

function convertTsToJs(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      convertTsToJs(srcPath, destPath);
    } else if (file.endsWith('.ts')) {
      // Convert .ts to .js
      const jsFile = file.replace('.ts', '.js');
      const jsPath = path.join(dest, jsFile);
      
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Simple TypeScript to JavaScript conversions
      content = content
        .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, "const $1 = require('$2');")
        .replace(/import\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"];?/g, "const { $1 } = require('$2');")
        .replace(/export\s+default\s+/g, 'module.exports = ')
        .replace(/export\s*{\s*([^}]+)\s*};?/g, 'module.exports = { $1 };')
        .replace(/export\s+const\s+(\w+)/g, 'const $1')
        .replace(/export\s+function\s+(\w+)/g, 'function $1')
        .replace(/export\s+interface\s+\w+[^{]*{[^}]*}/g, '')
        .replace(/export\s+type\s+\w+[^=]*=[^;]*;?/g, '')
        .replace(/:\s*string\s*[=;]/g, '')
        .replace(/:\s*number\s*[=;]/g, '')
        .replace(/:\s*boolean\s*[=;]/g, '')
        .replace(/:\s*any\s*[=;]/g, '')
        .replace(/:\s*[A-Z]\w*\[\]\s*[=;]/g, '')
        .replace(/:\s*[A-Z]\w*\s*[=;]/g, '')
        .replace(/interface\s+\w+[^{]*{[^}]*}/g, '')
        .replace(/type\s+\w+[^=]*=[^;]*;?/g, '')
        .replace(/as\s+any/g, '')
        .replace(/as\s+string/g, '')
        .replace(/as\s+number/g, '')
        .replace(/as\s+boolean/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\[\]/g, '')
        .replace(/\?\s*:/g, ':')
        .replace(/:\s*\?/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      fs.writeFileSync(jsPath, content);
      console.log(`Converted: ${file} -> ${jsFile}`);
    } else {
      // Copy other files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

convertTsToJs('./src', './dist');
console.log('JavaScript compilation build completed successfully!');
