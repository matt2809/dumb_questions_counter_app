import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const files = ['_headers'];

console.log('Copying Cloudflare assets to dist folder...');

files.forEach(file => {
  const sourcePath = file;
  const destPath = join(distDir, file);
  
  if (existsSync(sourcePath)) {
    try {
      copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist/`);
    } catch (error) {
      console.error(`❌ Failed to copy ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠️  ${file} not found, skipping...`);
  }
});

console.log('Asset copying complete!');
