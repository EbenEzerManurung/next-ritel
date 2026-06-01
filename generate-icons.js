const fs = require('fs');
const { createCanvas } = require('canvas');

// Ukuran icon yang dibutuhkan
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Warna
const bgColor = '#3B82F6';
const textColor = '#FFFFFF';

console.log('Generating icons...');

sizes.forEach(size => {
    // Buat canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background biru
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Tulisan R putih
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.floor(size / 2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', size / 2, size / 2);
    
    // Simpan ke file
    const buffer = canvas.toBuffer('image/png');
    const filename = `public/icon-${size}.png`;
    fs.writeFileSync(filename, buffer);
    
    console.log(`✅ Created: ${filename}`);
});

console.log('🎉 All icons generated successfully!');
