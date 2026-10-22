const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../node_modules/rollup/dist/native.js');

try {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    if (!content.includes('@rollup/wasm-node/dist/native.js')) {
      const pattern = /if \(error instanceof Error && error\.code === 'ERR_DLOPEN_FAILED'\) \{\s*throw error;\s*\}/;
      const replacement = `if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {
  try {
    return require('@rollup/wasm-node/dist/native.js');
  } catch {
    throw error;
  }
}`;
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log('Successfully patched rollup for wasm-node fallback.');
      }
    }
  }
} catch (err) {
  // Non-fatal if rollup is not yet installed or already handled
  console.warn('Note: Could not patch rollup native.js:', err.message);
}
