/**
 * Icon Generation Script for Gym Tracker React
 * Creates icon assets and iOS PWA screenshots using the professional logo design
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const BASE_ICON_PATH = path.join(__dirname, '../public/icon.svg');

/**
 * Read the base icon SVG and scale it for different sizes
 */
function generateIconFromBase(size, outputPath) {
  // Read the base icon SVG
  const baseSvg = fs.readFileSync(BASE_ICON_PATH, 'utf8');
  
  // Extract the viewBox from the base SVG
  const viewBoxMatch = baseSvg.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 512 512';
  
  // Create the scaled SVG with proper dimensions
  const scaledSvg = baseSvg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`)
    .replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`);
  
  // Save as SVG first
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, scaledSvg);
  console.log(`✅ Generated SVG: ${svgPath}`);
}

/**
 * Generate all standard icons
 */
function generateAllIcons() {
  console.log('🎨 Generating icons...');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Check if base icon exists
  if (!fs.existsSync(BASE_ICON_PATH)) {
    console.error(`❌ Base icon file not found: ${BASE_ICON_PATH}`);
    console.log('Please ensure public/icon.svg exists with the professional logo design.');
    return;
  }
  
  // Standard PNG icons
  [16, 32, 48, 64, 128, 192, 256, 512].forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    generateIconFromBase(size, outputPath);
  });
  
  // Apple touch icons
  [120, 152, 167, 180].forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `apple-touch-icon-${size}x${size}.png`);
    generateIconFromBase(size, outputPath);
  });
  
  // Android icons
  [192, 512].forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `android-chrome-${size}x${size}.png`);
    generateIconFromBase(size, outputPath);
  });
  
  // Maskable icons
  [192, 512].forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `maskable-icon-${size}x${size}.png`);
    generateIconFromBase(size, outputPath);
  });
  
  // Favicon (16x16 and 32x32)
  [16, 32].forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
    generateIconFromBase(size, outputPath);
  });
}

/**
 * Generate iOS PWA screenshots using the professional logo design
 */
function generateIosScreenshots() {
  console.log('📱 Generating iOS PWA screenshots...');
  
  // Read base icon for scaling in screenshots
  const baseIcon = fs.readFileSync(BASE_ICON_PATH, 'utf8');
  
  // Create app icon for screenshots (200x200)
  const appIconScale = baseIcon
    .replace(/width="[^"]*"/, 'width="200"')
    .replace(/height="[^"]*"/, 'height="200"')
    .replace(/viewBox="[^"]*"/, 'viewBox="0 0 512 512"');
  
  // Wide screenshot (landscape orientation) - 1024x768
  const wideSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#bg)"/>
  
  <!-- App Icon -->
  <g transform="translate(412, 184) scale(0.39)">
    ${appIconScale.replace('<?xml version="1.0" encoding="UTF-8"?>', '').trim()}
  </g>
  
  <!-- Title -->
  <text x="512" y="450" text-anchor="middle" fill="white" font-size="56" font-family="Arial, sans-serif" font-weight="bold">Gym Tracker</text>
  <text x="512" y="500" text-anchor="middle" fill="url(#accent)" font-size="28" font-family="Arial, sans-serif">Your Personal Workout Companion</text>
  
  <!-- Feature highlights -->
  <rect x="200" y="580" width="624" height="120" fill="rgba(255,255,255,0.1)" rx="20" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  
  <g transform="translate(240, 640)">
    <circle cx="0" cy="0" r="35" fill="#34d399"/>
    <text x="0" y="8" text-anchor="middle" fill="white" font-size="28">💪</text>
    <text x="80" y="8" text-anchor="start" fill="white" font-size="24" font-weight="600">Smart Workout Tracking</text>
  </g>
  
  <g transform="translate(540, 640)">
    <circle cx="0" cy="0" r="35" fill="#60a5fa"/>
    <text x="0" y="8" text-anchor="middle" fill="white" font-size="28">📊</text>
    <text x="80" y="8" text-anchor="start" fill="white" font-size="24" font-weight="600">Progress Analytics</text>
  </g>
</svg>`;

  const wideOutput = path.join(OUTPUT_DIR, 'screenshot-wide.svg');
  fs.writeFileSync(wideOutput, wideSvg);
  console.log(`✅ Generated ${wideOutput}`);

  // Narrow screenshot (portrait orientation) - 768x1024
  const narrowSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="768" height="1024" viewBox="0 0 768 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="narrowBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="narrowAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="768" height="1024" fill="url(#narrowBg)"/>
  
  <!-- App Icon -->
  <g transform="translate(284, 120) scale(0.39)">
    ${appIconScale.replace('<?xml version="1.0" encoding="UTF-8"?>', '').trim()}
  </g>
  
  <!-- Title -->
  <text x="384" y="350" text-anchor="middle" fill="white" font-size="48" font-family="Arial, sans-serif" font-weight="bold">Gym Tracker</text>
  <text x="384" y="390" text-anchor="middle" fill="url(#narrowAccent)" font-size="22" font-family="Arial, sans-serif">Track • Analyze • Improve</text>
  
  <!-- Feature cards -->
  <rect x="50" y="450" width="300" height="120" fill="rgba(255,255,255,0.1)" rx="15" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <g transform="translate(100, 510)">
    <circle cx="0" cy="0" r="30" fill="#34d399"/>
    <text x="0" y="8" text-anchor="middle" fill="white" font-size="24">💪</text>
    <text x="60" y="5" text-anchor="start" fill="white" font-size="20" font-weight="600">Workout Tracking</text>
    <text x="60" y="25" text-anchor="start" fill="#e5e7eb" font-size="16">Track exercises &amp; progress</text>
  </g>
  
  <rect x="418" y="450" width="300" height="120" fill="rgba(255,255,255,0.1)" rx="15" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <g transform="translate(468, 510)">
    <circle cx="0" cy="0" r="30" fill="#60a5fa"/>
    <text x="0" y="8" text-anchor="middle" fill="white" font-size="24">📊</text>
    <text x="60" y="5" text-anchor="start" fill="white" font-size="20" font-weight="600">Progress Charts</text>
    <text x="60" y="25" text-anchor="start" fill="#e5e7eb" font-size="16">Visual analytics &amp; insights</text>
  </g>
  
  <rect x="234" y="600" width="300" height="120" fill="rgba(255,255,255,0.1)" rx="15" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <g transform="translate(284, 660)">
    <circle cx="0" cy="0" r="30" fill="#f59e0b"/>
    <text x="0" y="8" text-anchor="middle" fill="white" font-size="24">🏋️</text>
    <text x="60" y="5" text-anchor="start" fill="white" font-size="20" font-weight="600">Workout Templates</text>
    <text x="60" y="25" text-anchor="start" fill="#e5e7eb" font-size="16">Custom workout templates</text>
  </g>
  
  <!-- Call to action -->
  <rect x="100" y="800" width="568" height="80" fill="rgba(255,255,255,0.2)" rx="40" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="384" y="845" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="600">Start Your Fitness Journey Today</text>
</svg>`;

  const narrowOutput = path.join(OUTPUT_DIR, 'screenshot-narrow.svg');
  fs.writeFileSync(narrowOutput, narrowSvg);
  console.log(`✅ Generated ${narrowOutput}`);
}

/**
 * Generate favicon from base icon
 */
function generateFavicon() {
  console.log('🎯 Generating favicon...');
  
  // Generate favicon from base icon (32x32)
  const faviconOutput = path.join(OUTPUT_DIR, 'favicon.png');
  generateIconFromBase(32, faviconOutput);
  
  // Also create a simple 16x16 favicon
  const favicon16Output = path.join(OUTPUT_DIR, 'favicon-16x16.png');
  generateIconFromBase(16, favicon16Output);
  
  console.log('✅ Generated favicon icons');
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting icon and screenshot generation for Gym Tracker React...\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Generate all assets
  generateAllIcons();
  generateIosScreenshots();
  generateFavicon();
  
  console.log('\n🎉 Generation completed successfully!');
  console.log(`📁 Assets saved to: ${OUTPUT_DIR}`);
  console.log('\nFiles generated:');
  console.log('- Standard PNG icons (16x16 to 512x512)');
  console.log('- Apple touch icons (120x120 to 180x180)');
  console.log('- Android icons (192x192, 512x512)');
  console.log('- Maskable icons (192x192, 512x512)');
  console.log('- Favicon (SVG format)');
  console.log('- iOS PWA screenshots (wide and narrow)');
  console.log('\nNext steps:');
  console.log('1. Update public/manifest.json with the new icon paths');
  console.log('2. Convert SVG files to PNG/ICO if needed for specific platforms');
  console.log('3. Test the PWA installation on different devices');
  console.log('4. Add the new icons to your HTML head section');
}

// Run the script
main();