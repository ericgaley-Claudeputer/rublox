/* Menu cards for the five t302 modes. Original art only. */
function drawGarden(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#9ee0ff', '#e8ffe8');
  else { ctx.fillStyle = '#9ee0ff'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#6fbf5a'; ctx.fillRect(0, 140, 320, 60);
  [[50,150,'#8d5524'],[110,150,'#8d5524'],[170,150,'#8d5524'],[230,150,'#8d5524']].forEach(([x,y,c]) => { ctx.fillStyle = c; ctx.fillRect(x, y, 40, 28); });
  ctx.fillStyle = '#7ad46a'; ctx.beginPath(); ctx.arc(70, 148, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c45c4a'; ctx.beginPath(); ctx.arc(130, 146, 11, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.arc(190, 144, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c48a5a'; ctx.fillRect(250, 120, 46, 36);
  if (typeof guy === 'function') guy(ctx, 90, 110, 12, '#3a86ff');
  ctx.font = '22px sans-serif'; ctx.fillText('🌱', 40, 50); ctx.fillText('🍈', 250, 55); ctx.fillText('✨', 150, 48);
}
function drawMeadow(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#87c8ef', '#e8ffe8');
  else { ctx.fillStyle = '#87c8ef'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#7dce6a'; ctx.fillRect(0, 130, 320, 70);
  ctx.fillStyle = '#5aaa48'; ctx.fillRect(0, 170, 320, 30);
  ctx.fillStyle = '#f4a05c'; ctx.beginPath(); ctx.arc(220, 150, 16, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7ec8e3'; ctx.beginPath(); ctx.arc(80, 155, 14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e88bb0'; ctx.beginPath(); ctx.arc(280, 148, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(140, 100, 8, 40);
  ctx.beginPath(); ctx.arc(144, 96, 10, 0, Math.PI*2); ctx.fill();
  if (typeof guy === 'function') guy(ctx, 150, 120, 12, '#ff9f1c');
  ctx.font = '22px sans-serif'; ctx.fillText('🥣', 40, 50); ctx.fillText('📖', 260, 50);
}
function drawRides(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#8fd3ff', '#fff4d0');
  else { ctx.fillStyle = '#8fd3ff'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#d9d4c8'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.arc(90, 130, 34, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(90, 130, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8b5cf6'; ctx.fillRect(200, 70, 18, 80);
  ctx.fillStyle = '#c4b5fd'; ctx.fillRect(190, 70, 38, 12);
  ctx.fillStyle = '#3a86ff'; ctx.fillRect(250, 110, 50, 8);
  ctx.fillStyle = '#ff6fb5'; ctx.beginPath(); ctx.arc(275, 108, 10, 0, Math.PI*2); ctx.fill();
  if (typeof guy === 'function') guy(ctx, 150, 130, 12, '#2ec27e');
  ctx.font = '22px sans-serif'; ctx.fillText('🎠', 40, 50); ctx.fillText('🗼', 260, 50);
}
function drawHive(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#9ee0ff', '#fff6c2');
  else { ctx.fillStyle = '#9ee0ff'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#7dce6a'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#f4c84a';
  ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(200, 150); ctx.lineTo(100, 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0a020'; ctx.fillRect(140, 120, 20, 30);
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(70, 145, 8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(240, 145, 8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff4c2'; ctx.beginPath(); ctx.arc(120, 90, 5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(180, 70, 5, 0, Math.PI*2); ctx.fill();
  if (typeof guy === 'function') guy(ctx, 60, 120, 11, '#c45c4a');
  ctx.font = '22px sans-serif'; ctx.fillText('🐝', 40, 50); ctx.fillText('🍯', 260, 55); ctx.fillText('🧸', 200, 60);
}
function drawCamp(ctx){
  if (!ctx) return;
  if (typeof sky === 'function') sky(ctx, '#1d2340', '#3b2a5c');
  else { ctx.fillStyle = '#1d2340'; ctx.fillRect(0, 0, 320, 200); }
  ctx.fillStyle = '#2a3a28'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#3d2a1a'; ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(80, 90); ctx.lineTo(120, 150); ctx.fill();
  ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(150, 150); ctx.lineTo(170, 100); ctx.lineTo(190, 150); ctx.fill();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(158, 150); ctx.lineTo(170, 118); ctx.lineTo(182, 150); ctx.fill();
  ctx.fillStyle = '#fff4c2'; ctx.beginPath(); ctx.arc(240, 40, 10, 0, Math.PI*2); ctx.fill();
  if (typeof guy === 'function') guy(ctx, 200, 120, 12, '#8d5524');
  ctx.font = '22px sans-serif'; ctx.fillText('🔥', 40, 50); ctx.fillText('🏮', 260, 50);
}
