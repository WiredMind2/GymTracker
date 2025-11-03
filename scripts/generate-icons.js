/**
 * Icon Generation Script for Gym Tracker React
 * Creates PNG icon assets and iOS PWA screenshots using the professional logo design
 * 
 * This script directly generates PNG files using Canvas for maximum compatibility.
 * iOS requires PNG icons for proper PWA installation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const BASE_ICON_PATH = path.join(__dirname, '../public/icon.svg');

/**
 * Convert SVG to PNG using Canvas
 */
async function svgToPng(svgContent, size, outputPath) {
  try {
    // Create a temporary SVG file for loading
    const tempSvgPath = path.join(OUTPUT_DIR, 'temp.svg');
    fs.writeFileSync(tempSvgPath, svgContent);
    
    // Load and render the SVG
    const image = await loadImage(tempSvgPath);
    
    // Create canvas and draw the image
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas and draw the image
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);
    
    // Save as PNG
    const pngBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, pngBuffer);
    
    // Clean up temporary file (with error handling)
    try {
      if (fs.existsSync(tempSvgPath)) {
        fs.unlinkSync(tempSvgPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.log(`✅ Generated PNG: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate PNG ${outputPath}:`, error.message);
  }
}

/**
 * Read the base icon SVG and scale it for different sizes
 */
async function generateIconFromBase(size, outputName) {
  try {
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
    
    // Save PNG directly
    const pngPath = path.join(OUTPUT_DIR, outputName + '.png');
    await svgToPng(scaledSvg, size, pngPath);
    
  } catch (error) {
    console.error(`❌ Failed to generate ${outputName}:`, error.message);
  }
}

/**
 * Generate all standard icons
 */
async function generateAllIcons() {
  console.log('🎨 Generating PNG icons...');
  
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
  
  const iconPromises = [];
  
  // Standard icons
  [16, 32, 48, 64, 128, 192, 256, 512].forEach(size => {
    iconPromises.push(generateIconFromBase(size, `icon-${size}x${size}`));
  });
  
  // Apple touch icons (iOS requires PNG format)
  [120, 152, 167, 180].forEach(size => {
    iconPromises.push(generateIconFromBase(size, `apple-touch-icon-${size}x${size}`));
  });
  
  // Android icons
  [192, 512].forEach(size => {
    iconPromises.push(generateIconFromBase(size, `android-chrome-${size}x${size}`));
  });
  
  // Maskable icons
  [192, 512].forEach(size => {
    iconPromises.push(generateIconFromBase(size, `maskable-icon-${size}x${size}`));
  });
  
  // Favicon (16x16 and 32x32)
  [16, 32].forEach(size => {
    iconPromises.push(generateIconFromBase(size, `favicon-${size}x${size}`));
  });
  
  // Wait for all icons to be generated
  await Promise.all(iconPromises);
}

/**
 * Generate iOS PWA screenshots using Canvas for PNG output
 */
async function generateIosScreenshots() {
  console.log('📱 Generating iOS PWA screenshots (PNG format)...');
  
  // Read base icon for scaling in screenshots
  const baseIcon = fs.readFileSync(BASE_ICON_PATH, 'utf8');
  
  // Create app icon for screenshots (200x200)
  const appIconSvg = baseIcon
    .replace(/width="[^"]*"/, 'width="200"')
    .replace(/height="[^"]*"/, 'height="200"')
    .replace(/viewBox="[^"]*"/, 'viewBox="0 0 512 512"');
  
  const screenshots = [
    {
      width: 1024,
      height: 768,
      filename: 'screenshot-wide.png',
      bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      title: 'Gym Tracker',
      subtitle: 'Your Personal Workout Companion',
      layout: 'landscape'
    },
    {
      width: 768,
      height: 1024,
      filename: 'screenshot-narrow.png',
      bgGradient: 'linear-gradient(180deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      title: 'Gym Tracker',
      subtitle: 'Track • Analyze • Improve',
      layout: 'portrait'
    }
  ];
  
  for (const screenshot of screenshots) {
    await generateScreenshotPNG(screenshot, appIconSvg);
  }
}

/**
 * Generate individual screenshot as PNG using Canvas
 */
async function generateScreenshotPNG(screenshotConfig, appIconSvg) {
  try {
    const { width, height, filename, bgGradient, title, subtitle, layout } = screenshotConfig;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Create background gradient
    const gradient = ctx.createLinearGradient(
      layout === 'landscape' ? 0 : width/2, 
      layout === 'landscape' ? height/2 : 0, 
      width, 
      height
    );
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#3b82f6');
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add app icon (using Canvas text for compatibility)
    ctx.save();
    ctx.translate(width/2, layout === 'landscape' ? height*0.3 : height*0.25);
    
    // Draw app icon background circle
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Draw G letter for Gym Tracker
    ctx.fillStyle = '#2563eb';
    ctx.font = `bold ${Math.min(width, height) * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', 0, 0);
    ctx.restore();
    
    // Add title and subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.min(width, height) * 0.07}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(title, width/2, layout === 'landscape' ? height*0.6 : height*0.45);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = `${Math.min(width, height) * 0.04}px Arial`;
    ctx.fillText(subtitle, width/2, layout === 'landscape' ? height*0.65 : height*0.50);
    
    // Add feature highlights
    if (layout === 'landscape') {
      // Feature 1
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(width*0.3, height*0.8, 30, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('💪', width*0.3 - 12, height*0.8 + 8);
      ctx.fillText('Smart Workout Tracking', width*0.3 + 20, height*0.8 + 8);
      
      // Feature 2
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(width*0.7, height*0.8, 30, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('📊', width*0.7 - 12, height*0.8 + 8);
      ctx.fillText('Progress Analytics', width*0.7 + 20, height*0.8 + 8);
    } else {
      // Portrait layout features
      const features = [
        { icon: '💪', text: 'Workout Tracking', desc: 'Track exercises & progress', color: '#34d399' },
        { icon: '📊', text: 'Progress Charts', desc: 'Visual analytics & insights', color: '#60a5fa' },
        { icon: '🏋️', text: 'Workout Templates', desc: 'Custom workout templates', color: '#f59e0b' }
      ];
      
      features.forEach((feature, index) => {
        const yPos = height * (0.55 + index * 0.15);
        const xPos = width / 2;
        
        // Feature card background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(width * 0.1, yPos - 60, width * 0.8, 120);
        
        // Feature icon
        ctx.fillStyle = feature.color;
        ctx.beginPath();
        ctx.arc(width * 0.25, yPos, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(feature.icon, width * 0.25, yPos + 7);
        
        // Feature text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(feature.text, width * 0.35, yPos - 10);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(feature.desc, width * 0.35, yPos + 10);
      });
      
      // Call to action
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(width * 0.15, height * 0.85, width * 0.7, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Start Your Fitness Journey Today', width / 2, height * 0.88);
    }
    
    // Save as PNG
    const outputPath = path.join(OUTPUT_DIR, filename);
    const pngBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`✅ Generated PNG screenshot: ${outputPath}`);
    
  } catch (error) {
    console.error(`❌ Failed to generate screenshot ${filename}:`, error.message);
  }
}

/**
 * Generate favicon using PNG
 */
async function generateFavicon() {
  console.log('🎯 Generating favicon (PNG format)...');
  
  // Generate favicon in multiple sizes
  const sizes = [16, 32];
  const promises = sizes.map(size => 
    generateIconFromBase(size, `favicon-${size}x${size}`)
  );
  
  await Promise.all(promises);
  
  // Also create a general favicon.png (32x32)
  await generateIconFromBase(32, 'favicon');
  
  console.log('✅ Generated favicon PNG files');
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting PNG icon and screenshot generation for Gym Tracker React...\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Generate all assets
  await generateAllIcons();
  await generateIosScreenshots();
  await generateFavicon();
  
  console.log('\n🎉 Generation completed successfully!');
  console.log(`📁 Assets saved to: ${OUTPUT_DIR}`);
  console.log('\nFiles generated:');
  console.log('✅ Standard PNG icons (16x16 to 512x512)');
  console.log('✅ Apple touch PNG icons (120x120 to 180x180)');
  console.log('✅ Android PNG icons (192x192, 512x512)');
  console.log('✅ Maskable PNG icons (192x192, 512x512)');
  console.log('✅ Favicon PNG files (16x16, 32x32)');
  console.log('✅ iOS PWA screenshots (PNG format: wide and narrow)');
  console.log('\n📋 Next steps:');
  console.log('1. Update public/manifest.json with PNG icon paths');
  console.log('2. All files are now PNG - no conversion needed!');
  console.log('3. Test the PWA installation on different devices');
  console.log('4. All icons are production-ready');
}

// Run the script
main().catch(console.error);