function drawLantern(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#7ec8ff', '#ffd9f0');
  else { ctx.fillStyle = '#7ec8ff'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#ff8fc8'; ctx.fillRect(36, 48, 248, 118);
  ctx.fillStyle = '#fff7fb'; ctx.fillRect(36, 48, 248, 16);
  ctx.fillStyle = '#6b3cff'; ctx.fillRect(140, 24, 40, 28);
  ctx.fillStyle = '#ffd25a';
  ctx.beginPath(); ctx.moveTo(130, 28); ctx.lineTo(160, 8); ctx.lineTo(190, 28); ctx.fill();
  ctx.fillStyle = '#c8f0ff'; ctx.fillRect(56, 78, 44, 36); ctx.fillRect(220, 78, 44, 36);
  ctx.fillStyle = '#ffe8a8'; ctx.fillRect(130, 110, 60, 56);
  ctx.fillStyle = '#6b3cff'; ctx.fillRect(148, 128, 24, 38);
  ctx.fillStyle = '#ffd25a';
  [[70, 64], [160, 40], [250, 64], [100, 160], [210, 160]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
  });
  if (typeof guy === 'function') guy(ctx, 96, 176, 12, '#d61c8c');
  if (typeof guy === 'function') guy(ctx, 200, 176, 12, '#3a86ff');
  ctx.font = '22px sans-serif';
  ctx.fillText('🏮', 150, 70);
  ctx.fillText('👁️', 64, 70);
  ctx.fillText('👁️', 232, 70);
}
