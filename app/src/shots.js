// SPDX-License-Identifier: MIT
// Leonida Cover Studio — headless shot mode for screenshots and benchmarks.
// ?shot=cover&preset=sunset&layout=diagonal&photo=boulevard&title=SUNSET%20HEIST&size=1080x1080
// ?shot=editor&preset=sunset&layout=diagonal&photo=boulevard&title=SUNSET%20HEIST

import { initEditor } from './main.js';
import { renderCover, loadPhotos } from './cover.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

function applyParams(state) {
  const preset = params.get('preset');
  if (preset) state.preset = preset;
  const layout = params.get('layout');
  if (layout) state.layout = layout;
  const title = params.get('title');
  if (title) state.title = title;
  const tagline = params.get('tagline');
  if (tagline) state.tagline = tagline;
  const subtitle = params.get('subtitle');
  if (subtitle) state.subtitle = subtitle;
  const photo = params.get('photo');
  if (photo === 'pier') {
    for (const k of Object.keys(state.crops)) state.crops[k].slot = 1;
  } else if (photo === 'mix') {
    state.crops.A.slot = 0; state.crops.B.slot = 1; state.crops.C.slot = 0;
  }
  const grade = params.get('grade');
  if (grade === 'off') state.gradeOn = false;
}

async function coverShot() {
  const { defaultState } = await import('./state.js');
  const state = defaultState();
  applyParams(state);
  const size = (params.get('size') || '1080x1080').split('x').map(Number);
  const w = size[0] || 1080, h = size[1] || 1080;
  await loadPhotos(state);
  document.body.classList.add('shot');
  document.getElementById('app').style.display = 'none';
  const canvas = document.createElement('canvas');
  canvas.id = 'shotCanvas';
  canvas.width = w; canvas.height = h;
  // fit the canvas inside the viewport, keeping its aspect, so the
  // screenshot is exactly the viewport size (e.g. 1024x1280 from 1080x1350)
  const scale = Math.min(window.innerWidth / w, window.innerHeight / h, 1);
  canvas.style.width = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  document.body.appendChild(canvas);
  renderCover(canvas.getContext('2d'), state, w, h);
  window.__vice2 = { state, renderCover };
  window.__shotReady = true;
}

async function editorShot() {
  await initEditor();
  const state = window.__vice2.state;
  applyParams(state);
  await loadPhotos(state);
  window.__vice2.renderPreview();
  window.__shotReady = true;
}

if (shot === 'cover') {
  coverShot();
} else if (shot === 'editor') {
  editorShot();
} else {
  initEditor();
}
