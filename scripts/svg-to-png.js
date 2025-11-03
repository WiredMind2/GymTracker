/**
 * Convert SVG icons to PNG format for iOS PWA support
 * iOS requires PNG format for app icons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/icons');

// Function to create a simple PNG converter using Canvas (browser-based)
function generateConversionHTML() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG to PNG Converter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin: 5px;
    }
    button:hover {
      background: #1d4ed8;
    }
    #status {
      margin-top: 20px;
      padding: 10px;
      background: #e5e7eb;
      border-radius: 6px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    canvas {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>SVG to PNG Icon Converter</h1>
    <p>This tool converts all SVG icons in the icons folder to PNG format for iOS PWA support.</p>
    
    <div>
      <button onclick="convertAllIcons()">Convert All Icons to PNG</button>
      <button onclick="downloadZip()">Download All PNGs as ZIP</button>
    </div>
    
    <div id="status">Ready to convert icons...</div>
    <canvas id="canvas"></canvas>
  </div>

  <script>
    const iconSizes = {
      'icon-16x16': 16,
      'icon-32x32': 32,
      'icon-48x48': 48,
      'icon-64x64': 64,
      'icon-128x128': 128,
      'icon-192x192': 192,
      'icon-256x256': 256,
      'icon-512x512': 512,
      'apple-touch-icon-120x120': 120,
      'apple-touch-icon-152x152': 152,
      'apple-touch-icon-167x167': 167,
      'apple-touch-icon-180x180': 180,
      'android-chrome-192x192': 192,
      'android-chrome-512x512': 512,
      'maskable-icon-192x192': 192,
      'maskable-icon-512x512': 512,
      'favicon-16x16': 16,
      'favicon-32x32': 32
    };

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('status');
    const convertedImages = {};

    async function convertSvgToPng(svgUrl, size, name) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = size;
          canvas.height = size;
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          
          canvas.toBlob((blob) => {
            convertedImages[name] = blob;
            resolve(canvas.toDataURL('image/png'));
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = svgUrl;
      });
    }

    async function convertAllIcons() {
      status.textContent = 'Starting conversion...\\n';
      let converted = 0;
      const total = Object.keys(iconSizes).length;

      for (const [name, size] of Object.entries(iconSizes)) {
        try {
          const svgPath = \`/GymTracker/icons/\${name}.svg\`;
          status.textContent += \`Converting \${name}.svg (\${size}x\${size})...\\n\`;
          
          const pngDataUrl = await convertSvgToPng(svgPath, size, \`\${name}.png\`);
          converted++;
          
          // Auto-download each PNG
          const a = document.createElement('a');
          a.href = pngDataUrl;
          a.download = \`\${name}.png\`;
          a.click();
          
          status.textContent += \`✅ Converted \${name}.png\\n\`;
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          status.textContent += \`❌ Failed to convert \${name}: \${error.message}\\n\`;
        }
      }

      status.textContent += \`\\n🎉 Conversion complete! \${converted}/\${total} icons converted.\\n\`;
      status.textContent += 'Please move the downloaded PNG files to the public/icons/ folder.\\n';
    }

    async function downloadZip() {
      status.textContent = 'ZIP download not implemented. Please use "Convert All Icons" and manually collect the files.';
    }
  </script>
</body>
</html>`;

  const outputPath = path.join(__dirname, '../public/convert-icons.html');
  fs.writeFileSync(outputPath, htmlContent);
  console.log('✅ Created conversion tool: public/convert-icons.html');
  console.log('🌐 Open this file in your browser and visit: http://localhost:5173/GymTracker/convert-icons.html');
  console.log('   (after running npm run dev)');
}

function main() {
  console.log('🎨 SVG to PNG Converter Setup\n');
  generateConversionHTML();
  console.log('\n📝 Instructions:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:5173/GymTracker/convert-icons.html');
  console.log('3. Click "Convert All Icons to PNG"');
  console.log('4. Save all downloaded PNG files to public/icons/ folder');
  console.log('5. Commit the PNG files to your repository\n');
}

main();
