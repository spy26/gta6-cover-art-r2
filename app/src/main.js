// SPDX-License-Identifier: MIT
// Leonida Cover Studio — the editor: layout and preset pickers, per-panel
// crop controls, caption editing, photo slots and PNG export.

import { PRESETS, PRESET_ORDER, LAYOUTS, LAYOUT_ORDER, EXPORT_SIZES, defaultState } from './state.js';
import { renderCover, loadPhotos, panelAt } from './cover.js';

const $ = (sel) => document.querySelector(sel);
const state = defaultState();
let exportSize = EXPORT_SIZES[0];
let drag = null;

const preview = $('#preview');
const pctx = preview.getContext('2d');

function renderPreview() {
  const ratio = exportSize.w / exportSize.h;
  const maxSide = 880;
  const w = ratio >= 1 ? maxSide : Math.round(maxSide * ratio);
  const h = ratio >= 1 ? Math.round(maxSide / ratio) : maxSide;
  if (preview.width !== w || preview.height !== h) {
    preview.width = w;
    preview.height = h;
  }
  renderCover(pctx, state, w, h);
  const sel = $('#selPanel');
  if (sel) sel.textContent = 'Panel ' + state.selected;
}

function syncControls() {
  document.querySelectorAll('[data-layout]').forEach((b) =>
    b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('[data-preset]').forEach((b) =>
    b.classList.toggle('active', b.dataset.preset === state.preset));
  document.querySelectorAll('[data-size]').forEach((b) =>
    b.classList.toggle('active', b.dataset.size === exportSize.id));
  document.querySelectorAll('[data-slotpick]').forEach((b) => {
    const crop = state.crops[state.selected] || {};
    b.classList.toggle('active', Number(b.dataset.slotpick) === crop.slot);
  });
  const crop = state.crops[state.selected] || { zoom: 1 };
  const zoom = $('#zoom');
  if (zoom) zoom.value = crop.zoom;
  const zoomVal = $('#zoomVal');
  if (zoomVal) zoomVal.textContent = (crop.zoom || 1).toFixed(2) + '×';
  const flip = $('#flip');
  if (flip) flip.checked = !!crop.flip;
  const grade = $('#grade');
  if (grade) grade.checked = state.gradeOn !== false;
  for (const key of ['grain', 'halftone', 'palms', 'sun', 'skyline', 'vignette']) {
    const el = $('#fx-' + key);
    if (el) el.checked = (state.effects || {})[key] !== false;
  }
  const titleScale = $('#titleScale');
  if (titleScale) titleScale.value = state.titleScale || 1;
}

function buildPickers() {
  const layoutBox = $('#layouts');
  for (const id of LAYOUT_ORDER) {
    const l = LAYOUTS[id];
    const b = document.createElement('button');
    b.className = 'pick';
    b.dataset.layout = id;
    b.innerHTML = `<b>${l.name}</b><span>${l.blurb}</span>`;
    b.addEventListener('click', () => { state.layout = id; syncControls(); renderPreview(); });
    layoutBox.appendChild(b);
  }
  const presetBox = $('#presets');
  for (const id of PRESET_ORDER) {
    const p = PRESETS[id];
    const b = document.createElement('button');
    b.className = 'swatch';
    b.dataset.preset = id;
    b.style.background = `linear-gradient(135deg, ${p.sky[0]}, ${p.sky[1]} 55%, ${p.sky[2]})`;
    b.title = p.name + ' — ' + p.blurb;
    b.innerHTML = `<b>${p.name}</b>`;
    b.addEventListener('click', () => { state.preset = id; syncControls(); renderPreview(); });
    presetBox.appendChild(b);
  }
  const sizeBox = $('#sizes');
  for (const s of EXPORT_SIZES) {
    const b = document.createElement('button');
    b.className = 'pick';
    b.dataset.size = s.id;
    b.innerHTML = `<b>${s.label}</b>`;
    b.addEventListener('click', () => { exportSize = s; syncControls(); renderPreview(); });
    sizeBox.appendChild(b);
  }
  const slotBox = $('#slots');
  state.photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'pick slot';
    b.dataset.slotpick = String(i);
    b.innerHTML = `<b>Photo ${'ABC'[i]}</b><span>${p.label}</span>`;
    b.addEventListener('click', () => {
      const crop = state.crops[state.selected];
      if (crop) crop.slot = i;
      syncControls(); renderPreview();
    });
    slotBox.appendChild(b);
  });
}

function bindEditor() {
  $('#title').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
  $('#tagline').addEventListener('input', (e) => { state.tagline = e.target.value; renderPreview(); });
  $('#subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPreview(); });
  $('#footer').addEventListener('input', (e) => { state.footer = e.target.value; renderPreview(); });
  $('#titleScale').addEventListener('input', (e) => { state.titleScale = Number(e.target.value); renderPreview(); });
  $('#zoom').addEventListener('input', (e) => {
    const crop = state.crops[state.selected];
    if (crop) crop.zoom = Number(e.target.value);
    syncControls(); renderPreview();
  });
  $('#flip').addEventListener('change', (e) => {
    const crop = state.crops[state.selected];
    if (crop) crop.flip = e.target.checked;
    renderPreview();
  });
  $('#grade').addEventListener('change', (e) => { state.gradeOn = e.target.checked; renderPreview(); });
  for (const key of ['grain', 'halftone', 'palms', 'sun', 'skyline', 'vignette']) {
    const el = $('#fx-' + key);
    if (el) el.addEventListener('change', (e) => { state.effects[key] = e.target.checked; renderPreview(); });
  }
  $('#resetCrop').addEventListener('click', () => {
    state.crops[state.selected] = { slot: 0, zoom: 1.12, dx: 0, dy: 0, flip: false };
    syncControls(); renderPreview();
  });
  $('#randomize').addEventListener('click', () => {
    state.layout = LAYOUT_ORDER[Math.floor(Math.random() * LAYOUT_ORDER.length)];
    state.preset = PRESET_ORDER[Math.floor(Math.random() * PRESET_ORDER.length)];
    for (const k of Object.keys(state.crops)) {
      state.crops[k].zoom = 1.05 + Math.random() * 0.5;
      state.crops[k].dx = (Math.random() - 0.5) * 0.2;
      state.crops[k].dy = (Math.random() - 0.5) * 0.12;
    }
    syncControls(); renderPreview();
  });
  $('#compare').addEventListener('pointerdown', () => { state.gradeOn = false; renderPreview(); });
  $('#compare').addEventListener('pointerup', () => { state.gradeOn = true; renderPreview(); });
  $('#compare').addEventListener('pointerleave', () => { if (state.gradeOn === false) { state.gradeOn = true; renderPreview(); } });
  $('#upload').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.photos[2] = { src: url, label: file.name.slice(0, 18), img };
      const crop = state.crops[state.selected];
      if (crop) crop.slot = 2;
      const slotBtns = document.querySelectorAll('[data-slotpick="2"] span');
      slotBtns.forEach((s) => { s.textContent = file.name.slice(0, 18); });
      syncControls(); renderPreview();
    };
    img.src = url;
  });
  $('#download').addEventListener('click', () => {
    const c = document.createElement('canvas');
    c.width = exportSize.w; c.height = exportSize.h;
    renderCover(c.getContext('2d'), state, c.width, c.height);
    const a = document.createElement('a');
    a.download = `leonida-cover-${exportSize.id}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  });

  // drag to pan the photo inside the clicked panel
  preview.addEventListener('pointerdown', (e) => {
    const r = preview.getBoundingClientRect();
    const x = (e.clientX - r.left) * (preview.width / r.width);
    const y = (e.clientY - r.top) * (preview.height / r.height);
    const id = panelAt(state, preview.width, preview.height, x, y);
    if (!id) return;
    state.selected = id;
    drag = { x, y, dx: state.crops[id].dx, dy: state.crops[id].dy, w: preview.width, h: preview.height };
    preview.setPointerCapture(e.pointerId);
    syncControls();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = preview.getBoundingClientRect();
    const x = (e.clientX - r.left) * (preview.width / r.width);
    const y = (e.clientY - r.top) * (preview.height / r.height);
    const crop = state.crops[state.selected];
    crop.dx = drag.dx + (x - drag.x) / drag.w;
    crop.dy = drag.dy + (y - drag.y) / drag.h;
    renderPreview();
  });
  preview.addEventListener('pointerup', () => { drag = null; });
}

export async function initEditor() {
  buildPickers();
  bindEditor();
  await loadPhotos(state);
  // keep the caption inputs in sync with the state
  $('#title').value = state.title;
  $('#tagline').value = state.tagline;
  $('#subtitle').value = state.subtitle;
  $('#footer').value = state.footer;
  syncControls();
  renderPreview();
  window.__vice2 = { state, renderPreview, renderCover, loadPhotos };
  window.__vice2Ready = true;
}
