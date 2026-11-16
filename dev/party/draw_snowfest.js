function drawSnowFest(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#c8def6', '#f7fbff');
  else { ctx.fillStyle = '#c8def6'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#f4fbff'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#dbeaf8'; ctx.fillRect(0, 148, 320, 8);
  ctx.fillStyle = '#1f7a4c';
  ctx.beginPath(); ctx.moveTo(50, 150); ctx.lineTo(70, 90); ctx.lineTo(90, 150); ctx.fill();
  ctx.fillStyle = '#c45c4a'; ctx.fillRect(240, 110, 50, 40); ctx.fillStyle = '#6b3c2a'; ctx.fillRect(248, 90, 34, 22);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(160, 135, 18, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(160, 112, 13, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ff9f1c'; ctx.fillRect(156, 110, 12, 4);
  if (typeof guy === 'function') guy(ctx, 200, 150, 12, '#3a86ff');
  ctx.font = '22px sans-serif'; ctx.fillText('❄️', 30, 50); ctx.fillText('🛷', 270, 60); ctx.fillText('⛸️', 120, 70);
}
