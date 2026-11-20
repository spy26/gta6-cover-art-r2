// SPDX-License-Identifier: MIT
// Leonida Cover Studio — the cover renderer. Draws every layout and preset on
// a 2D canvas: graded photos in shaped panels, skyline, palms, retro sun,
// halftone, grain, vignette and the big auto-fitting poster title.

import { PRESETS, LAYOUTS } from './state.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polyPath(ctx, poly, W, H) {
  ctx.beginPath();
  poly.forEach(([nx, ny], i) => {
    const x = nx * W, y = ny * H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function polyBBox(poly, W, H) {
  const xs = poly.map(([nx]) => nx * W);
  const ys = poly.map(([, ny]) => ny * H);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function pointInPoly(px, py, poly, W, H) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0] * W, yi = poly[i][1] * H;
    const xj = poly[j][0] * W, yj = poly[j][1] * H;
    if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

export function panelAt(state, W, H, x, y) {
  const layout = LAYOUTS[state.layout];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    if (pointInPoly(x, y, layout.panels[i].poly, W, H)) return layout.panels[i].id;
  }
  return null;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPhoto(ctx, img, box, crop, grade, tint) {
  if (!img || !img.naturalWidth) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(box.w / iw, box.h / ih) * (crop.zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const cx = box.x + box.w / 2 + (crop.dx || 0) * box.w;
  const cy = box.y + box.h / 2 + (crop.dy || 0) * box.h;
  ctx.save();
  ctx.filter = grade || 'none';
  if (crop.flip) {
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  }
  ctx.restore();
  if (tint) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = tint;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }
}

function drawSun(ctx, cx, cy, r, preset) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(r * 2) + 4; off.height = Math.ceil(r * 2) + 4;
  const o = off.getContext('2d');
  const g = o.createLinearGradient(0, 0, 0, off.height);
  g.addColorStop(0, '#ffd76e'); g.addColorStop(0.45, '#ff9d45');
  g.addColorStop(0.75, '#ff5e62'); g.addColorStop(1, '#ff2e88');
  o.fillStyle = g;
  o.beginPath(); o.arc(off.width / 2, off.height / 2, r, 0, Math.PI * 2); o.fill();
  o.globalCompositeOperation = 'destination-out';
  const stripes = [[0.62, 3], [0.70, 4], [0.79, 6], [0.89, 8]];
  for (const [fy, fh] of stripes) {
    o.fillRect(0, off.height * fy, off.width, Math.max(2, r * fh / 40));
  }
  ctx.save();
  ctx.shadowColor = preset.titleGlow;
  ctx.shadowBlur = r * 0.35;
  ctx.drawImage(off, cx - off.width / 2, cy - off.height / 2);
  ctx.restore();
}

function drawPalm(ctx, bx, by, s, lean, flip, color) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(flip ? -s : s, s);
  ctx.rotate(lean);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // trunk: tapered curve
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.quadraticCurveTo(-2, -70, 14, -118);
  ctx.quadraticCurveTo(18, -122, 20, -116);
  ctx.quadraticCurveTo(8, -66, 7, 0);
  ctx.closePath();
  ctx.fill();
  // fronds from the crown
  const top = [17, -118];
  for (let i = 0; i < 7; i++) {
    const a = (-0.15 - i * 0.30) * Math.PI;
    const len = 95 - Math.abs(i - 3) * 9;
    const ex = top[0] + Math.cos(a) * len;
    const ey = top[1] + Math.sin(a) * len * 0.55 - 18;
    const mx = top[0] + Math.cos(a) * len * 0.5;
    const my = top[1] + Math.sin(a) * len * 0.28 - 26;
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.lineWidth = 7 - Math.abs(i - 3) * 0.6;
    ctx.stroke();
  }
  // coconuts
  ctx.beginPath(); ctx.arc(top[0] - 4, top[1] + 6, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(top[0] + 5, top[1] + 8, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSkyline(ctx, x0, x1, baseY, H, color, seed) {
  const rng = mulberry32(seed);
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  let x = x0;
  while (x < x1) {
    const bw = 14 + rng() * 34;
    const bh = 12 + rng() * (H * 0.055);
    ctx.fillRect(x, baseY - bh, bw, bh);
    if (rng() > 0.72) ctx.fillRect(x + bw / 2 - 1, baseY - bh - 10 - rng() * 8, 2, 12 + rng() * 8);
    x += bw + 3 + rng() * 8;
  }
  ctx.restore();
}

function drawHalftone(ctx, x, y, cols, rows, gap, maxR, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = (r + c) / (rows + cols);
      const rad = Math.max(0.6, maxR * (1 - d * 0.85));
      ctx.beginPath();
      ctx.arc(x + c * gap, y + r * gap, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawGrain(ctx, W, H, seed) {
  const rng = mulberry32(seed);
  ctx.save();
  const n = Math.floor((W * H) / 1100);
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = 0.03 + rng() * 0.06;
    ctx.fillStyle = rng() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(rng() * W, rng() * H, 1.4, 1.4);
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.30)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function fitFont(ctx, text, maxW, startPx, family, weight, spacing) {
  let px = startPx;
  for (let i = 0; i < 40; i++) {
    ctx.font = `${weight} ${px}px ${family}`;
    try { ctx.letterSpacing = `${(px * spacing).toFixed(1)}px`; } catch { /* older canvas */ }
    const w = ctx.measureText(text).width + text.length * px * spacing;
    if (w <= maxW || px <= 12) return px;
    px *= 0.94;
  }
  return px;
}

function drawViBadge(ctx, cx, cy, r, preset) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, r * 0.09);
  ctx.strokeStyle = preset.accent2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = preset.accent2;
  ctx.font = `900 ${r * 0.95}px "Liberation Sans", Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = '0px'; } catch { /* noop */ }
  ctx.fillText('VI', 0, r * 0.04);
  ctx.restore();
}

function drawTitleBlock(ctx, state, preset, layout, W, H) {
  const [zx, zy, zw, zh] = layout.titleZone;
  const x = zx * W, y = zy * H, w = zw * W, h = zh * H;
  const family = '"Liberation Sans", Arial, sans-serif';
  ctx.save();
  if (layout.slant) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(layout.slant);
    ctx.translate(-(x + w / 2), -(y + h / 2));
  }
  const title = (state.title || 'VICE CITY').toUpperCase();
  if (layout.stacked) {
    // two-line stacked title: split at the space nearest the middle
    const words = title.split(/\s+/);
    let line1 = words[0], line2 = words.slice(1).join(' ') || 'VICE';
    if (words.length > 2) {
      let best = 0, bestDiff = 99;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ').length;
        const b = words.slice(i).join(' ').length;
        const d = Math.abs(a - b);
        if (d < bestDiff) { bestDiff = d; best = i; }
      }
      line1 = words.slice(0, best).join(' ');
      line2 = words.slice(best).join(' ');
    }
    const lineH = h / 2;
    for (const [line, ly] of [[line1, y + lineH * 0.5], [line2, y + lineH * 1.5]]) {
      const px = fitFont(ctx, line, w, lineH * 0.98, family, 900, 0.02) * (state.titleScale || 1);
      ctx.font = `900 ${px}px ${family}`;
      try { ctx.letterSpacing = `${(px * 0.02).toFixed(1)}px`; } catch { /* noop */ }
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = px * 0.14;
      ctx.strokeStyle = preset.titleStroke;
      ctx.shadowColor = preset.titleGlow; ctx.shadowBlur = px * 0.22;
      ctx.strokeText(line, x, ly);
      ctx.shadowBlur = 0;
      ctx.fillStyle = preset.titleFill;
      ctx.fillText(line, x, ly);
    }
  } else {
    const px = fitFont(ctx, title, w, h * 0.78, family, 900, 0.03) * (state.titleScale || 1);
    ctx.font = `900 ${px}px ${family}`;
    try { ctx.letterSpacing = `${(px * 0.03).toFixed(1)}px`; } catch { /* noop */ }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = px * 0.15;
    ctx.strokeStyle = preset.titleStroke;
    ctx.shadowColor = preset.titleGlow; ctx.shadowBlur = px * 0.24;
    ctx.strokeText(title, x, y + h * 0.52);
    ctx.shadowBlur = 0;
    ctx.fillStyle = preset.titleFill;
    ctx.fillText(title, x, y + h * 0.52);
    // subtitle under the title, letterspaced caps
    const sub = (state.subtitle || '').toUpperCase();
    if (sub) {
      const spx = Math.max(11, h * 0.17);
      ctx.font = `700 ${spx}px ${family}`;
      try { ctx.letterSpacing = `${(spx * 0.32).toFixed(1)}px`; } catch { /* noop */ }
      ctx.fillStyle = preset.subText;
      ctx.fillText(sub, x, y + h * 0.92);
    }
  }
  ctx.restore();
}

function drawTaglinePill(ctx, state, preset, layout, W, H) {
  const tag = (state.tagline || '').trim();
  if (!tag) return;
  const [tx, ty] = layout.taglineAt;
  const family = '"Liberation Sans", Arial, sans-serif';
  const pillH = Math.max(20, W * 0.034);
  const px = pillH * 0.46;
  ctx.save();
  ctx.font = `800 ${px}px ${family}`;
  try { ctx.letterSpacing = `${(px * 0.14).toFixed(1)}px`; } catch { /* noop */ }
  // measure first: the pill is sized to the text, so it can never clip it
  const tw = ctx.measureText(tag.toUpperCase()).width + tag.length * px * 0.14;
  const pillW = tw + pillH * 1.15;
  const x = tx * W, y = ty * H;
  ctx.fillStyle = preset.pillFill;
  ctx.shadowColor = preset.titleGlow; ctx.shadowBlur = pillH * 0.35;
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = preset.pillText;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(tag.toUpperCase(), x + pillW / 2, y + pillH * 0.54);
  ctx.restore();
}

export function renderCover(ctx, state, W, H) {
  const preset = PRESETS[state.preset] || PRESETS.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.diagonal;
  const fx = state.effects || {};
  const gutter = Math.max(3, W * 0.006);

  // 1. sky / base
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  preset.sky.forEach((c, i) => sky.addColorStop(i / (preset.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // 2. title band (layouts that have one)
  if (layout.bandTop != null) {
    const band = ctx.createLinearGradient(0, layout.bandTop * H, 0, H);
    band.addColorStop(0, preset.band);
    band.addColorStop(1, preset.bandEnd);
    ctx.fillStyle = band;
    ctx.fillRect(0, layout.bandTop * H, W, H - layout.bandTop * H);
    // accent rule above the band, following the diagonal on slanted layouts
    ctx.strokeStyle = preset.line;
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.beginPath();
    if (layout.id === 'diagonal') {
      ctx.moveTo(0, 0.70 * H); ctx.lineTo(W, 0.58 * H);
    } else {
      ctx.moveTo(0, layout.bandTop * H); ctx.lineTo(W, layout.bandTop * H);
    }
    ctx.stroke();
  }

  // 3. photo panels
  const grade = state.gradeOn === false ? 'none' : preset.grade;
  for (const panel of layout.panels) {
    const base = (state.crops && state.crops[panel.id]) || { slot: panel.slot, zoom: 1, dx: 0, dy: 0 };
    const tweak = (layout.crops && layout.crops[panel.id]) || {};
    const crop = { ...base, ...tweak };
    const photo = state.photos[crop.slot] || state.photos[0];
    const img = photo && photo.img;
    const box = polyBBox(panel.poly, W, H);
    ctx.save();
    polyPath(ctx, panel.poly, W, H);
    ctx.clip();
    if (img) drawPhoto(ctx, img, box, crop, grade, preset.tint);
    else { ctx.fillStyle = '#333'; ctx.fillRect(box.x, box.y, box.w, box.h); }
    ctx.restore();
    ctx.save();
    polyPath(ctx, panel.poly, W, H);
    ctx.strokeStyle = preset.gutter;
    ctx.lineWidth = gutter;
    ctx.stroke();
    ctx.restore();
  }

  // diagonal accent stripe along the hero's slanted edge
  if (layout.id === 'diagonal') {
    ctx.save();
    ctx.strokeStyle = preset.accent;
    ctx.lineWidth = Math.max(3, W * 0.007);
    ctx.beginPath();
    ctx.moveTo(0, 0.70 * H); ctx.lineTo(0.62 * W, 0.58 * H);
    ctx.stroke();
    ctx.restore();
  }

  // 4. decorations, clipped to the photo zone
  const [pzX, pzY, pzW, pzH] = layout.photoZone;
  ctx.save();
  ctx.beginPath();
  ctx.rect(pzX * W, pzY * H, pzW * W, pzH * H);
  ctx.clip();
  if (fx.skyline !== false && layout.skyline) {
    drawSkyline(ctx, 0, W, pzH * H, H, preset.band, 42);
  }
  if (fx.palms !== false && layout.palms === 'corners') {
    const s = W / 1080;
    drawPalm(ctx, W * 0.02, pzH * H + 6, s * 1.05, 0.10, false, preset.band);
    drawPalm(ctx, W * 0.99, pzH * H + 6, s * 0.95, -0.08, true, preset.band);
  }
  ctx.restore();

  // retro sun badge (drawn over the hero, top right). The VI mark lives
  // inside the sun itself, so it never collides with a second badge.
  if (fx.sun !== false && layout.sunAt) {
    const sx = layout.sunAt[0] * W, sy = layout.sunAt[1] * H;
    drawSun(ctx, sx, sy, W * 0.068, preset);
    ctx.save();
    ctx.fillStyle = preset.titleStroke;
    ctx.font = `900 ${W * 0.038}px "Liberation Sans", Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    try { ctx.letterSpacing = '0px'; } catch { /* noop */ }
    ctx.fillText('VI', sx, sy - H * 0.008);
    ctx.restore();
  }

  // 5. magazine scrim so the stacked title always reads
  if (layout.stacked) {
    const scrim = ctx.createLinearGradient(0, H * 0.30, 0, H);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(0.55, preset.scrim);
    scrim.addColorStop(1, preset.scrim);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H);
  }

  // 6. tagline pill (measured, never clipped), title, badge
  drawTaglinePill(ctx, state, preset, layout, W, H);
  drawTitleBlock(ctx, state, preset, layout, W, H);
  if (layout.badgeAt && !layout.sunAt) {
    drawViBadge(ctx, layout.badgeAt[0] * W, layout.badgeAt[1] * H, W * 0.038, preset);
  }

  // 7. halftone corner in the title band (per-layout spot, clear of the title)
  if (fx.halftone !== false && layout.bandTop != null) {
    const [hx, hy] = layout.halftoneAt || [0.885, 0.845];
    drawHalftone(ctx, hx * W, hy * H, 7, 4, W * 0.014, W * 0.0042, preset.accent);
  }

  // 8. footer: stars left, place right
  if (layout.bandTop != null) {
    const fpx = Math.max(11, W * 0.016);
    ctx.save();
    ctx.font = `700 ${fpx}px "Liberation Sans", Arial, sans-serif`;
    try { ctx.letterSpacing = `${(fpx * 0.3).toFixed(1)}px`; } catch { /* noop */ }
    ctx.textBaseline = 'middle';
    ctx.fillStyle = preset.accent;
    ctx.textAlign = 'left';
    ctx.fillText('★ ★ ★ ★ ★', W * 0.045, H * 0.975);
    ctx.fillStyle = preset.subText;
    ctx.textAlign = 'right';
    ctx.fillText((state.footer || 'LEONIDA').toUpperCase(), W * 0.955, H * 0.975);
    ctx.restore();
  } else {
    const fpx = Math.max(11, W * 0.016);
    ctx.save();
    ctx.font = `700 ${fpx}px "Liberation Sans", Arial, sans-serif`;
    try { ctx.letterSpacing = `${(fpx * 0.3).toFixed(1)}px`; } catch { /* noop */ }
    ctx.textBaseline = 'middle';
    ctx.fillStyle = preset.accent;
    ctx.textAlign = 'left';
    ctx.fillText('★ ★ ★ ★ ★', W * 0.05, H * 0.965);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText((state.footer || 'LEONIDA').toUpperCase() + '  •  VICE CITY', W * 0.95, H * 0.965);
    ctx.restore();
  }

  // 9. grain + vignette
  if (fx.grain !== false) drawGrain(ctx, W, H, 1337);
  if (fx.vignette !== false) drawVignette(ctx, W, H);
}

export async function loadPhotos(state) {
  for (const photo of state.photos) {
    if (!photo.src || photo.img) continue;
    photo.img = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = photo.src;
    });
  }
}

export function renderToCanvas(canvas, state) {
  const ctx = canvas.getContext('2d');
  renderCover(ctx, state, canvas.width, canvas.height);
}
