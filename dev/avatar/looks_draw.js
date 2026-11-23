/* 2D + 3D drawing for new optional looks. Relies on page helpers: block, circ, rrect, poly, shade. */
function drawLookHat(ctx, av){
  const h = av && av.hat;
  if (!h) return;
  if (h === 'beanie'){ rrect(ctx, 84, 20, 92, 42, 16, '#3a86ff'); rrect(ctx, 84, 50, 92, 10, 4, '#ffd23f'); circ(ctx, 130, 18, 8, '#ff6fb5'); }
  else if (h === 'bucket'){ rrect(ctx, 86, 28, 88, 28, 10, '#2ec27e'); ctx.fillStyle = '#1f9460'; ctx.beginPath(); ctx.ellipse(130, 58, 70, 10, 0, 0, Math.PI*2); ctx.fill(); }
  else if (h === 'visor'){ rrect(ctx, 88, 48, 84, 10, 4, '#8b5cf6'); ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.ellipse(130, 62, 54, 8, 0, 0, Math.PI); ctx.fill(); }
  else if (h === 'beret'){ circ(ctx, 128, 36, 36, '#1d2340'); circ(ctx, 150, 22, 8, '#1d2340'); ctx.fillStyle = '#ffd23f'; ctx.fillRect(122, 32, 16, 4); }
  else if (h === 'tophat'){ rrect(ctx, 108, 4, 44, 40, 2, '#1d1d1d'); rrect(ctx, 92, 40, 76, 10, 4, '#1d1d1d'); rrect(ctx, 108, 32, 44, 6, 2, '#ffd23f'); }
  else if (h === 'slouch'){ rrect(ctx, 80, 16, 100, 44, 18, '#4a3b32'); rrect(ctx, 150, 20, 28, 22, 10, '#4a3b32'); }
  else if (h === 'earmuffs'){ circ(ctx, 86, 56, 16, '#ff6fb5'); circ(ctx, 174, 56, 16, '#ff6fb5'); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(130, 50, 48, Math.PI, 0); ctx.stroke(); }
  else if (h === 'newsboy'){ rrect(ctx, 90, 28, 80, 24, 10, '#6b3e1f'); ctx.fillStyle = '#4a2c14'; ctx.beginPath(); ctx.ellipse(130, 54, 56, 8, 0, 0, Math.PI); ctx.fill(); }
  else if (h === 'flower'){ ['#ff6fb5','#ffd23f','#8b5cf6','#2ec27e','#ff9f1c'].forEach((c, i) => { const a = i * 1.26; circ(ctx, 130 + Math.cos(a)*28, 36 + Math.sin(a)*10, 8, c); }); circ(ctx, 130, 36, 7, '#ffd23f'); }
  else if (h === 'jellycap'){ rrect(ctx, 86, 18, 88, 40, 16, '#2a8aaa'); rrect(ctx, 86, 48, 88, 8, 4, '#7ad0e8'); circ(ctx, 130, 16, 9, '#d8b0ff'); }
  else if (h === 'tidecap'){ rrect(ctx, 90, 16, 80, 38, 12, '#1d5a78'); rrect(ctx, 90, 46, 80, 8, 4, '#f4e27a'); circ(ctx, 130, 14, 7, '#f4e27a'); }
}

function drawLookHair(ctx, av){
  const h = av && av.hair, hc = av && av.hairColor;
  if (!h || !hc) return;
  const dk = typeof shade === 'function' ? shade(hc, -30) : hc;
  if (h === 'wolf'){ block(ctx, 84, 30, 92, 22, hc); block(ctx, 80, 40, 14, 70, hc); block(ctx, 166, 40, 14, 70, hc); poly(ctx, [[86,34],[96,8],[110,34],[124,4],[140,34],[156,10],[174,36]], hc); }
  else if (h === 'shag'){ block(ctx, 86, 32, 88, 20, hc); for (let i = 0; i < 6; i++) block(ctx, 86 + i*14, 48, 10, 6 + (i%2)*4, i%2 ? dk : hc); block(ctx, 84, 48, 14, 40, hc); block(ctx, 162, 48, 14, 40, hc); } // audit56: strands stop above the eyes
  else if (h === 'curtains'){ block(ctx, 86, 32, 88, 18, hc); block(ctx, 84, 48, 18, 36, hc); block(ctx, 158, 48, 18, 36, hc); poly(ctx, [[102,48],[122,48],[102,62]], hc); poly(ctx, [[138,48],[158,48],[158,62]], hc); } // audit56: parted to the sides, eyes clear
  else if (h === 'crimped'){ block(ctx, 86, 30, 88, 20, hc); for (let y = 50; y < 110; y += 8){ block(ctx, 82, y, 16, 5, (y/8)%2 ? dk : hc); block(ctx, 162, y, 16, 5, (y/8)%2 ? dk : hc); } }
  else if (h === 'waves'){ block(ctx, 86, 32, 88, 18, hc); block(ctx, 80, 48, 16, 80, hc); block(ctx, 164, 48, 16, 80, hc); ctx.fillStyle = dk; ctx.fillRect(84, 70, 6, 40); ctx.fillRect(170, 70, 6, 40); }
  else if (h === 'updo'){ circ(ctx, 130, 22, 28, hc); block(ctx, 94, 40, 72, 16, hc); rrect(ctx, 118, 8, 24, 8, 3, '#ffd23f'); }
  else if (h === 'slickbob'){ rrect(ctx, 86, 30, 88, 26, 10, hc); block(ctx, 82, 44, 18, 54, hc); block(ctx, 160, 44, 18, 54, hc); ctx.fillStyle = dk; ctx.fillRect(96, 52, 68, 3); } // audit56: was one slab over the eyes
  else if (h === 'undercut'){ block(ctx, 100, 28, 70, 22, hc); poly(ctx, [[100,30],[130,8],[170,32]], hc); block(ctx, 86, 48, 10, 20, dk); block(ctx, 164, 48, 10, 20, dk); }
  else if (h === 'milkmaid'){ block(ctx, 86, 36, 88, 16, hc); circ(ctx, 104, 32, 14, hc); circ(ctx, 156, 32, 14, hc); block(ctx, 86, 48, 10, 28, hc); block(ctx, 164, 48, 10, 28, hc); }
  else if (h === 'mullet'){ block(ctx, 86, 32, 88, 20, hc); block(ctx, 86, 50, 12, 24, hc); block(ctx, 162, 50, 12, 24, hc); } // audit56: the long back part now draws behind the head (drawLookHairBack)
}

function drawLookShirt(ctx, av){
  const p = av && av.shirtPat, c = av && av.shirt;
  if (!p || !c) return;
  if (p === 'babyt'){ block(ctx, 96, 116, 68, 70, c); ctx.fillStyle = '#ff6fb5'; ctx.fillRect(118, 140, 24, 8); }
  else if (p === 'flannel'){ const ink = 'rgba(29,35,64,.28)'; for (let y = 120; y < 200; y += 14){ ctx.fillStyle = ink; ctx.fillRect(50, y, 160, 4); } for (let x = 60; x < 200; x += 16){ ctx.fillStyle = ink; ctx.fillRect(x, 116, 4, 88); } }
  else if (p === 'sweater'){ rrect(ctx, 82, 112, 96, 96, 8, c); ctx.fillStyle = typeof shade === 'function' ? shade(c, 30) : '#fff'; ctx.fillRect(100, 130, 60, 8); }
  else if (p === 'blouse'){ block(ctx, 86, 116, 88, 88, c); circ(ctx, 130, 128, 8, '#ffffff'); ctx.fillStyle = '#ffd23f'; ctx.fillRect(126, 140, 8, 24); }
  else if (p === 'tux'){ block(ctx, 104, 120, 52, 80, '#ffffff'); block(ctx, 122, 120, 16, 70, c); circ(ctx, 130, 150, 4, '#1d1d1d'); circ(ctx, 130, 164, 4, '#1d1d1d'); }
  else if (p === 'cardigan'){ block(ctx, 86, 116, 88, 92, c); block(ctx, 118, 124, 24, 70, '#fff4d6'); rrect(ctx, 124, 150, 12, 10, 3, '#ffd23f'); }
}

function drawLookPants(ctx, av){
  const p = av && av.pantsPat, col = av && av.pants;
  if (!p) return;
  if (p === 'cargo'){ block(ctx, 88, 210, 20, 16, typeof shade === 'function' ? shade(col, -20) : col); block(ctx, 152, 210, 20, 16, typeof shade === 'function' ? shade(col, -20) : col); }
  else if (p === 'ripped'){ block(ctx, 98, 230, 20, 8, av.head); block(ctx, 140, 248, 16, 7, av.head); }
  else if (p === 'joggers'){ rrect(ctx, 92, 250, 36, 16, 8, typeof shade === 'function' ? shade(col, -25) : col); rrect(ctx, 132, 250, 36, 16, 8, typeof shade === 'function' ? shade(col, -25) : col); }
  else if (p === 'dressy'){ ctx.fillStyle = typeof shade === 'function' ? shade(col, 25) : '#fff'; ctx.fillRect(108, 200, 6, 80); ctx.fillRect(146, 200, 6, 80); }
  else if (p === 'baggy'){ block(ctx, 86, 200, 44, 90, col); block(ctx, 130, 200, 44, 90, col); }
  else if (p === 'gown'){ poly(ctx, [[90,200],[170,200],[200,300],[60,300]], col); rrect(ctx, 118, 210, 24, 8, 3, '#ffd23f'); }
  else if (p === 'sundress'){ poly(ctx, [[96,198],[164,198],[188,280],[72,280]], col); circ(ctx, 118, 230, 6, '#ffd23f'); circ(ctx, 142, 242, 6, '#ff6fb5'); }
}

/* audit56: long back hair for the newer looks, drawn BEHIND the head in 2D (hairBack) so it never covers the face */
function drawLookHairBack(ctx, av){
  const h = av && av.hair, hc = av && av.hairColor;
  if (!h || !hc) return;
  const dk = typeof shade === 'function' ? shade(hc, -20) : hc;
  if (h === 'mullet'){ block(ctx, 90, 60, 80, 70, dk); }
  else if (h === 'wolf' || h === 'shag' || h === 'waves'){ block(ctx, 84, 44, 92, 74, dk); }
  else if (h === 'slickbob'){ block(ctx, 82, 40, 96, 58, dk); }
}

function drawLook3D(av, g, bx, mat, hc){
  if (!av || typeof bx !== 'function') return;
  const hat = av.hat, hair = av.hair, sp = av.shirtPat, pp = av.pantsPat, shirt = av.shirt || '#3a86ff', pants = av.pants || '#1d2340', hairC = hc || av.hairColor || '#6b3e1f';
  if (hat === 'beanie'){ bx(.92, .32, .92, '#3a86ff', 0, 3.02, 0); bx(.2, .12, .2, '#ff6fb5', 0, 3.22, 0); }
  else if (hat === 'bucket'){ bx(.9, .22, .9, '#2ec27e', 0, 2.98, 0); bx(1.3, .06, 1.3, '#1f9460', 0, 2.86, 0); }
  else if (hat === 'visor'){ bx(.9, .08, .9, '#8b5cf6', 0, 2.92, 0); bx(.7, .04, .5, '#ff9f1c', 0, 2.86, .4); }
  else if (hat === 'beret'){ bx(.9, .16, .9, '#1d2340', 0, 3.04, 0); bx(.16, .1, .16, '#1d2340', .35, 3.16, 0); }
  else if (hat === 'tophat'){ bx(.7, .5, .7, '#1d1d1d', 0, 3.28, 0); bx(1.05, .08, 1.05, '#1d1d1d', 0, 2.98, 0); bx(.72, .08, .72, '#ffd23f', 0, 3.08, 0); }
  else if (hat === 'slouch'){ bx(1.0, .36, 1.0, '#4a3b32', 0, 3.06, 0); bx(.4, .22, .4, '#4a3b32', .28, 3.16, 0); }
  else if (hat === 'earmuffs'){ bx(.22, .22, .22, '#ff6fb5', -.52, 2.7, 0); bx(.22, .22, .22, '#ff6fb5', .52, 2.7, 0); bx(.9, .06, .08, '#ffd23f', 0, 3.0, 0); }
  else if (hat === 'newsboy'){ bx(.9, .22, .9, '#6b3e1f', 0, 3.0, 0); bx(.7, .06, .45, '#4a2c14', 0, 2.88, .4); }
  else if (hat === 'flower'){ ['#ff6fb5','#ffd23f','#8b5cf6','#2ec27e'].forEach((c, i) => { const a = i * 1.57; bx(.16, .1, .16, c, Math.cos(a)*.35, 3.0, Math.sin(a)*.35); }); }
  else if (hat === 'jellycap'){ bx(.92, .32, .92, '#2a8aaa', 0, 3.04, 0); bx(.22, .16, .22, '#d8b0ff', 0, 3.26, 0); }
  else if (hat === 'tidecap'){ bx(.88, .30, .88, '#1d5a78', 0, 3.04, 0); bx(.18, .12, .18, '#f4e27a', 0, 3.26, 0); }

  if (hair === 'wolf' || hair === 'shag' || hair === 'mullet' || hair === 'waves'){ bx(.9, 1.1, .2, hairC, 0, 2.15, -.5); bx(.16, .85, .3, hairC, -.46, 2.2, -.2); bx(.16, .85, .3, hairC, .46, 2.2, -.2); }
  else if (hair === 'curtains' || hair === 'slickbob'){ bx(.12, .6, .14, hairC, -.38, 2.48, .4); bx(.12, .6, .14, hairC, .38, 2.48, .4); if (hair === 'slickbob'){ bx(.14, .75, .7, hairC, -.47, 2.35, -.06); bx(.14, .75, .7, hairC, .47, 2.35, -.06); bx(.9, .75, .14, hairC, 0, 2.35, -.47); } } // audit56: frame the face from the edges instead of sitting on the eyes
  else if (hair === 'updo' || hair === 'milkmaid'){ bx(.55, .4, .55, hairC, 0, 3.13, -.04); } // audit56: seated on the head, no gap
  else if (hair === 'crimped'){ for (let i = -2; i <= 2; i++) bx(.12, .5 + (i%2)*.1, .12, hairC, i*.16, 2.5, -.46); }
  else if (hair === 'undercut'){ bx(.7, .25, .7, hairC, 0, 3.02, 0); }
  if (sp === 'tux'){ bx(.3, .7, .05, '#ffffff', 0, 1.7, .32); bx(.28, .08, .06, '#1d1d1d', 0, 1.95, .34); }
  else if (sp === 'babyt'){ bx(.7, .08, .08, '#ff6fb5', 0, 1.55, .32); }
  else if (sp === 'flannel'){ bx(.9, .08, .08, typeof shade === 'function' ? shade(shirt, -45) : '#1d2340', 0, 1.7, .3); }   // audit56: rgba() is not a valid 3D colour
  if (pp === 'gown'){ bx(1.16, 1.05, .62, pants, 0, .62, 0); }   // audit56: stopped swallowing the shirt
  else if (pp === 'sundress'){ bx(1.1, 1.1, .55, shirt, 0, 1.15, 0); }
  else if (pp === 'baggy' || pp === 'cargo'){ bx(.55, 1.0, .4, pants, -.22, .85, 0); bx(.55, 1.0, .4, pants, .22, .85, 0); }
}

if (typeof globalThis !== 'undefined'){
  globalThis.drawLookHat = drawLookHat;
  globalThis.drawLookHair = drawLookHair; globalThis.drawLookHairBack = drawLookHairBack;
  globalThis.drawLookShirt = drawLookShirt;
  globalThis.drawLookPants = drawLookPants;
  globalThis.drawLook3D = drawLook3D;
}
