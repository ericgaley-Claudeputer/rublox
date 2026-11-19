function drawElevator(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#b8e0ff', '#ffe8a8');
  else { ctx.fillStyle = '#b8e0ff'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#8fbf6a'; ctx.fillRect(0, 150, 320, 50);
  // lobby building
  ctx.fillStyle = '#f4efe4'; ctx.fillRect(40, 70, 240, 90);
  ctx.strokeStyle = '#1d2340'; ctx.lineWidth = 2; ctx.strokeRect(40, 70, 240, 90);
  // elevator shaft
  ctx.fillStyle = '#d9d2c5'; ctx.fillRect(118, 40, 84, 120);
  ctx.strokeRect(118, 40, 84, 120);
  // doors
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(128, 78, 30, 72); ctx.fillRect(162, 78, 30, 72);
  ctx.strokeRect(128, 78, 30, 72); ctx.strokeRect(162, 78, 30, 72);
  // bell / Bingle
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(160, 62, 14, Math.PI, 0); ctx.fill();
  ctx.fillRect(146, 62, 28, 10);
  ctx.fillStyle = '#1d2340'; ctx.beginPath(); ctx.arc(160, 74, 3, 0, Math.PI * 2); ctx.fill();
  // floors lights
  ['#ff6fb5','#3a86ff','#2ec27e','#ff9f1c'].forEach((c, i) => {
    ctx.fillStyle = c; ctx.fillRect(128 + i * 16, 50, 12, 8);
  });
  if (typeof guy === 'function') guy(ctx, 92, 176, 12, '#8b5cf6');
  if (typeof guy === 'function') guy(ctx, 230, 176, 12, '#ff9f1c');
  ctx.font = '22px sans-serif';
  ctx.fillText('🛎️', 150, 36);
  ctx.fillText('🛗', 152, 120);
}
