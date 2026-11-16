function drawLantern(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#7ec8ff', '#ffd9f0');
  else { ctx.fillStyle = '#7ec8ff'; ctx.fillRect(0, 0, 320, 200); }
  // grass
  ctx.fillStyle = '#7bc96f'; ctx.fillRect(0, 150, 320, 50);
  // ferris wheel (back left)
  ctx.strokeStyle = '#6b3cff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(52, 100, 36, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++){
    const a = i * Math.PI / 4;
    ctx.beginPath(); ctx.moveTo(52, 100); ctx.lineTo(52 + Math.cos(a) * 36, 100 + Math.sin(a) * 36); ctx.stroke();
    ctx.fillStyle = ['#ff6b6b','#ffd25a','#7cffd0','#8ecaff'][i % 4];
    ctx.beginPath(); ctx.arc(52 + Math.cos(a) * 36, 100 + Math.sin(a) * 36, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#4a2a10'; ctx.fillRect(49, 136, 6, 20);
  // striped big top
  const stripes = ['#e31c23', '#fff8f0'];
  ctx.beginPath(); ctx.moveTo(160, 18); ctx.lineTo(286, 150); ctx.lineTo(34, 150); ctx.closePath();
  ctx.save(); ctx.clip();
  for (let i = 0; i < 16; i++){
    ctx.fillStyle = stripes[i % 2];
    ctx.beginPath(); ctx.moveTo(160, 18); ctx.lineTo(34 + i * 16, 150); ctx.lineTo(34 + (i + 1) * 16, 150); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#1d2340'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(160, 18); ctx.lineTo(286, 150); ctx.lineTo(34, 150); ctx.closePath(); ctx.stroke();
  // flag
  ctx.fillStyle = '#ffd25a';
  ctx.beginPath(); ctx.moveTo(160, 18); ctx.lineTo(160, 4); ctx.lineTo(184, 12); ctx.lineTo(160, 16); ctx.fill();
  // doorway
  ctx.fillStyle = '#3a1860'; ctx.fillRect(140, 110, 40, 40);
  ctx.fillStyle = '#ffd25a'; ctx.beginPath(); ctx.arc(160, 110, 20, Math.PI, 0); ctx.fill();
  // balloons
  [['#ff6b9a', 230, 70], ['#6b3cff', 248, 62], ['#7cffd0', 240, 50]].forEach(([c, x, y]) => {
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, 10, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1d2340'; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + 4, 150); ctx.stroke();
  });
  if (typeof guy === 'function') guy(ctx, 96, 176, 12, '#d61c8c');
  if (typeof guy === 'function') guy(ctx, 200, 176, 12, '#3a86ff');
  ctx.font = '22px sans-serif';
  ctx.fillText('🏮', 150, 70);
  ctx.fillText('🎩', 152, 100);
}
