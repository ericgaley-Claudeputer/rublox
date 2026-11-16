function drawParty(ctx){
    if (!ctx) return;
    if (typeof sky === 'function') sky(ctx, '#f6c58a', '#ffe9c4');
    else { ctx.fillStyle = '#f6c58a'; ctx.fillRect(0, 0, 320, 200); }
    ctx.fillStyle = '#d7b48a'; ctx.fillRect(0, 150, 320, 50);
    ctx.fillStyle = '#6d4c3d'; ctx.fillRect(20, 40, 280, 16);
    ctx.fillStyle = '#c9a06a'; ctx.fillRect(24, 56, 272, 100);
    // dance floor
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      ctx.fillStyle = ((r + c) % 2) ? '#ff6fb5' : '#3a86ff';
      ctx.fillRect(112 + c * 24, 88 + r * 16, 24, 16);
    }
    ctx.fillStyle = '#8b5a3c'; ctx.fillRect(36, 120, 50, 22); ctx.fillRect(234, 120, 50, 22);
    if (typeof guy === 'function'){ guy(ctx, 160, 148, 12, '#ff6fb5'); guy(ctx, 128, 148, 12, '#3a86ff'); }
    ctx.font = '22px sans-serif'; ctx.fillText('🎉', 40, 70); ctx.fillText('📸', 260, 70); ctx.fillText('⚽', 250, 160);
  }

