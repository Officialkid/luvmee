const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const assetsDir = path.resolve(__dirname, '../assets');

  // 1. Generate 512x512 App Icon
  await sharp(path.join(assetsDir, 'icon.png'))
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'play-store-icon-512.png'));
  console.log('✓ Created 512x512 App Icon');

  // 2. Generate 1024x500 Feature Graphic
  const bgSvg = Buffer.from(`
    <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0F4"/>
          <stop offset="50%" stop-color="#FCE7ED"/>
          <stop offset="100%" stop-color="#FAD4DF"/>
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#E11D48" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="1024" height="500" fill="url(#bg)"/>
      <circle cx="120" cy="80" r="160" fill="#FFD7E2" opacity="0.5"/>
      <circle cx="920" cy="420" r="200" fill="#FFD7E2" opacity="0.5"/>
      <rect x="362" y="55" width="300" height="300" rx="40" fill="#FFFFFF" filter="url(#cardShadow)"/>
    </svg>
  `);

  const textSvg = Buffer.from(`
    <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <text x="512" y="405" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold" fill="#4C0519" letter-spacing="1.5">LUVMEE</text>
      <text x="512" y="445" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#E11D48" letter-spacing="0.5">Couples &amp; Private Love Notes</text>
    </svg>
  `);

  const logo = await sharp(path.join(assetsDir, 'logo-stacked.png'))
    .resize(220, 220, { fit: 'inside' })
    .toBuffer();

  await sharp(bgSvg)
    .composite([
      { input: logo, top: 95, left: 402 },
      { input: textSvg, top: 0, left: 0 }
    ])
    .png()
    .toFile(path.join(assetsDir, 'play-store-feature-graphic-1024x500.png'));
  console.log('✓ Created 1024x500 Feature Graphic');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
