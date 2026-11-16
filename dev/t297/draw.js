function drawCafe(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#f3d7b5', '#fff3e0');
  else { ctx.fillStyle = '#f3d7b5'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#c48a5a'; ctx.fillRect(0, 130, 320, 70);
  ctx.fillStyle = '#8d4f2a'; ctx.fillRect(40, 80, 240, 70);
  ctx.fillStyle = '#6b3a1d'; ctx.fillRect(40, 70, 240, 14);
  ctx.fillStyle = '#fff'; ctx.fillRect(70, 100, 40, 30); ctx.fillRect(140, 100, 40, 30); ctx.fillRect(210, 100, 40, 30);
  ctx.fillStyle = '#6b3a1d'; ctx.fillRect(60, 150, 50, 20); ctx.fillRect(200, 150, 50, 20);
  if (typeof guy === 'function') guy(ctx, 160, 150, 12, '#c45c4a');
  ctx.font = '22px sans-serif'; ctx.fillText('☕', 60, 60); ctx.fillText('🧁', 250, 60);
}
function drawFish(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#87c8ef', '#e8f6ff');
  else { ctx.fillStyle = '#87c8ef'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#2f8f6a'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#3aa0d8'; ctx.fillRect(0, 120, 320, 40);
  ctx.fillStyle = '#8d5524'; ctx.fillRect(40, 110, 140, 14);
  ctx.fillStyle = '#6b3a1d'; ctx.fillRect(40, 110, 16, 50);
  if (typeof guy === 'function') guy(ctx, 90, 110, 11, '#3a86ff');
  ctx.font = '22px sans-serif'; ctx.fillText('🎣', 200, 90); ctx.fillText('🐟', 240, 140); ctx.fillText('🐠', 60, 145);
}
function drawPetShow(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#d8c6f0', '#fff');
  else { ctx.fillStyle = '#d8c6f0'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#6b4aa0'; ctx.fillRect(30, 70, 260, 80);
  ctx.fillStyle = '#f4e27a'; ctx.fillRect(80, 110, 160, 40);
  ctx.fillStyle = '#3d2a62'; ctx.fillRect(50, 80, 24, 28); ctx.fillRect(150, 80, 24, 28); ctx.fillRect(250, 80, 24, 28);
  if (typeof guy === 'function') guy(ctx, 160, 150, 12, '#ff9f1c');
  ctx.font = '22px sans-serif'; ctx.fillText('🐾', 40, 50); ctx.fillText('🎀', 260, 50); ctx.fillText('🥇', 150, 55);
}
function drawHunt(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#f7d7a0', '#fff4d8');
  else { ctx.fillStyle = '#f7d7a0'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#d9b56a'; ctx.fillRect(0, 140, 320, 60);
  ctx.fillStyle = '#2f8f4a';
  ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(70, 80); ctx.lineTo(100, 150); ctx.fill();
  ctx.fillStyle = '#8d5524'; ctx.fillRect(200, 100, 50, 50);
  ctx.fillStyle = '#c45c4a'; ctx.beginPath(); ctx.moveTo(190, 100); ctx.lineTo(225, 70); ctx.lineTo(260, 100); ctx.fill();
  ctx.fillStyle = '#ffc61a'; ctx.beginPath(); ctx.arc(160, 160, 14, 0, Math.PI*2); ctx.fill();
  if (typeof guy === 'function') guy(ctx, 130, 150, 11, '#3a86ff');
  ctx.font = '22px sans-serif'; ctx.fillText('🗺️', 40, 50); ctx.fillText('💎', 250, 60);
}
