// Script to generate PNG icons from SVG using canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient (indigo to purple)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#8b5cf6');

  // Rounded rect
  const r = size * 0.195;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size); ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw box icon
  const cx = size / 2;
  const s = size * 0.28;
  const top = cx - s * 0.8;
  const bot = cx + s * 0.8;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.055;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Hexagon outline
  ctx.beginPath();
  ctx.moveTo(cx - s, cx - s * 0.4);
  ctx.lineTo(cx, top);
  ctx.lineTo(cx + s, cx - s * 0.4);
  ctx.lineTo(cx + s, cx + s * 0.4);
  ctx.lineTo(cx, bot);
  ctx.lineTo(cx - s, cx + s * 0.4);
  ctx.closePath();
  ctx.stroke();

  // Vertical line
  ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, cx); ctx.stroke();
  // Left diagonal
  ctx.beginPath(); ctx.moveTo(cx - s, cx - s * 0.4); ctx.lineTo(cx, cx); ctx.stroke();
  // Right diagonal
  ctx.beginPath(); ctx.moveTo(cx + s, cx - s * 0.4); ctx.lineTo(cx, cx); ctx.stroke();

  return canvas.toBuffer('image/png');
}

try {
  const buf192 = createIcon(192);
  const buf512 = createIcon(512);
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), buf192);
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), buf512);
  console.log('Icons generated successfully!');
} catch(e) {
  console.log('canvas not available, creating placeholder icons');
  // Create minimal 1x1 transparent PNG as placeholder
  const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), placeholder);
  fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), placeholder);
  console.log('Placeholder icons created.');
}
