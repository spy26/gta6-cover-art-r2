// SPDX-License-Identifier: MIT
// Leonida Cover Studio — state: colour presets, layouts and the default cover.
// Every value here is original work for the gta6-cover-art-01 round 2 entry.

export const PRESETS = {
  sunset: {
    id: 'sunset',
    name: 'Sunset Strip',
    blurb: 'Orange dusk over purple streets',
    sky: ['#ff9a3d', '#ff5e62', '#7b2fbe', '#2b1055'],
    band: '#2b1055',
    bandEnd: '#4a0e6e',
    accent: '#ffb347',
    accent2: '#ff5e62',
    titleFill: '#ffffff',
    titleStroke: '#1c0533',
    titleGlow: '#ff2e88',
    pillFill: '#ff7a18',
    pillText: '#1c0533',
    subText: '#ffd9a0',
    gutter: '#1c0533',
    line: '#ffb347',
    grade: 'saturate(1.30) contrast(1.07) sepia(0.22) brightness(1.02)',
    tint: 'rgba(255,94,98,0.14)',
    scrim: 'rgba(43,16,85,0.55)',
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    blurb: 'Hot pink and cyan after dark',
    sky: ['#12082e', '#3b0f66', '#a4138a', '#0d0221'],
    band: '#0d0221',
    bandEnd: '#2a0a4a',
    accent: '#00e5ff',
    accent2: '#ff2e88',
    titleFill: '#f2feff',
    titleStroke: '#0d0221',
    titleGlow: '#ff2e88',
    pillFill: '#00e5ff',
    pillText: '#0d0221',
    subText: '#8ef6ff',
    gutter: '#0d0221',
    line: '#00e5ff',
    grade: 'saturate(1.50) contrast(1.12) hue-rotate(-8deg) brightness(0.98)',
    tint: 'rgba(255,46,136,0.10)',
    scrim: 'rgba(13,2,33,0.60)',
  },
  postcard: {
    id: 'postcard',
    name: 'Postcard Vice',
    blurb: 'Faded cream, pink ink, holiday stamp',
    sky: ['#ffe3c2', '#ffc9a3', '#ff9ebb', '#f7f0e3'],
    band: '#fbf3e4',
    bandEnd: '#ffe0ec',
    accent: '#ff2e88',
    accent2: '#0f766e',
    titleFill: '#ff2e88',
    titleStroke: '#ffffff',
    titleGlow: '#ffc53d',
    pillFill: '#ff2e88',
    pillText: '#ffffff',
    subText: '#7a3b5e',
    gutter: '#fbf3e4',
    line: '#ff2e88',
    grade: 'saturate(1.10) contrast(0.98) sepia(0.28) brightness(1.05)',
    tint: 'rgba(255,46,136,0.08)',
    scrim: 'rgba(251,243,228,0.35)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Vice',
    blurb: 'Teal water, navy sky, electric signs',
    sky: ['#062a33', '#0b3d4d', '#123a6b', '#050914'],
    band: '#050914',
    bandEnd: '#0b2545',
    accent: '#2de1c2',
    accent2: '#ff2e88',
    titleFill: '#eafcff',
    titleStroke: '#050914',
    titleGlow: '#2de1c2',
    pillFill: '#2de1c2',
    pillText: '#050914',
    subText: '#9be8d8',
    gutter: '#050914',
    line: '#2de1c2',
    grade: 'saturate(1.35) contrast(1.15) hue-rotate(-18deg) brightness(0.92)',
    tint: 'rgba(45,225,194,0.10)',
    scrim: 'rgba(5,9,20,0.62)',
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    blurb: 'Warm gold light, deep teal shade',
    sky: ['#ffd76e', '#ff9d45', '#e2603f', '#173f3a'],
    band: '#173f3a',
    bandEnd: '#0f2e2b',
    accent: '#ffd76e',
    accent2: '#ff9d45',
    titleFill: '#fff6d8',
    titleStroke: '#0f2e2b',
    titleGlow: '#ff9d45',
    pillFill: '#ffd76e',
    pillText: '#0f2e2b',
    subText: '#ffe9ad',
    gutter: '#0f2e2b',
    line: '#ffd76e',
    grade: 'saturate(1.35) contrast(1.05) sepia(0.35) brightness(1.04)',
    tint: 'rgba(255,157,69,0.12)',
    scrim: 'rgba(15,46,43,0.55)',
  },
};

export const PRESET_ORDER = ['sunset', 'neon', 'postcard', 'midnight', 'golden'];

// Panel rects are normalised (0..1) polygons in cover space.
// kind: 'hero' | 'duo' | 'triptych' | 'magazine' | 'split'
// photoZone: normalised rect the decorations (palms, skyline) are clipped to.
// titleZone: normalised rect for the title block; titleTop: where the band starts.
export const LAYOUTS = {
  diagonal: {
    id: 'diagonal',
    name: 'Diagonal Vice',
    blurb: 'Slanted hero, stacked side panels',
    panels: [
      { id: 'A', slot: 0, poly: [[0, 0], [0.62, 0], [0.62, 0.58], [0, 0.70]] },
      { id: 'B', slot: 1, poly: [[0.62, 0], [1, 0], [1, 0.29], [0.62, 0.29]] },
      { id: 'C', slot: 0, poly: [[0.62, 0.29], [1, 0.29], [1, 0.58], [0.62, 0.58]] },
    ],
    photoZone: [0, 0, 1, 0.70],
    bandTop: 0.70,
    titleZone: [0.045, 0.735, 0.91, 0.155],
    taglineAt: [0.05, 0.715],
    badgeAt: [0.90, 0.075],
    sunAt: [0.90, 0.085],
    palms: 'corners',
    skyline: true,
    slant: -0.028,
    halftoneAt: [0.885, 0.625],
    // wide short side panels: shift the photo down so faces stay in frame
    crops: {
      B: { zoom: 1.25, dx: 0.06, dy: 0.12 },
      C: { zoom: 1.2, dx: -0.05, dy: 0.18 },
    },
  },
  hero: {
    id: 'hero',
    name: 'Hero Split',
    blurb: 'Big hero, two panels, title band',
    panels: [
      { id: 'A', slot: 0, poly: [[0, 0], [1, 0], [1, 0.52], [0, 0.52]] },
      { id: 'B', slot: 0, poly: [[0, 0.52], [0.5, 0.52], [0.5, 0.74], [0, 0.74]] },
      { id: 'C', slot: 1, poly: [[0.5, 0.52], [1, 0.52], [1, 0.74], [0.5, 0.74]] },
    ],
    photoZone: [0, 0, 1, 0.74],
    bandTop: 0.74,
    titleZone: [0.045, 0.775, 0.91, 0.145],
    taglineAt: [0.05, 0.752],
    badgeAt: [0.90, 0.075],
    sunAt: [0.90, 0.085],
    palms: 'corners',
    skyline: true,
    slant: 0,
    halftoneAt: [0.885, 0.748],
    // the hero band is a wide short slice of a portrait photo: shift down
    // so the face, not the torso, fills the frame
    crops: {
      A: { zoom: 1.05, dx: 0, dy: 0.55 },
      B: { zoom: 1.1, dx: 0, dy: 0.38 },
      C: { zoom: 1.05, dx: 0, dy: 0.5 },
    },
  },
  triptych: {
    id: 'triptych',
    name: 'Triptych',
    blurb: 'Three tall frames, three crops',
    panels: [
      { id: 'A', slot: 0, poly: [[0, 0], [0.335, 0], [0.335, 0.68], [0, 0.68]] },
      { id: 'B', slot: 1, poly: [[0.335, 0], [0.665, 0], [0.665, 0.68], [0.335, 0.68]] },
      { id: 'C', slot: 0, poly: [[0.665, 0], [1, 0], [1, 0.68], [0.665, 0.68]] },
    ],
    photoZone: [0, 0, 1, 0.68],
    bandTop: 0.68,
    titleZone: [0.045, 0.715, 0.91, 0.155],
    taglineAt: [0.05, 0.695],
    badgeAt: null,
    sunAt: null,
    palms: 'none',
    skyline: false,
    slant: 0,
    crops: {
      B: { zoom: 1.2, dx: 0.05, dy: 0.06 },
    },
  },
  magazine: {
    id: 'magazine',
    name: 'Magazine',
    blurb: 'Full-bleed photo, stacked giant title',
    panels: [
      { id: 'A', slot: 0, poly: [[0, 0], [1, 0], [1, 1], [0, 1]] },
    ],
    photoZone: [0, 0, 1, 1],
    bandTop: null,
    titleZone: [0.05, 0.56, 0.90, 0.34],
    taglineAt: [0.055, 0.505],
    badgeAt: [0.895, 0.085],
    sunAt: null,
    palms: 'none',
    skyline: false,
    slant: 0,
    stacked: true,
    // full-bleed portrait photo: pull back and shift down so the face is whole
    crops: {
      A: { zoom: 1.02, dx: 0, dy: 0.12 },
    },
  },
  duo: {
    id: 'duo',
    name: 'Duo Portrait',
    blurb: 'Two portraits side by side',
    panels: [
      { id: 'A', slot: 0, poly: [[0, 0], [0.5, 0], [0.5, 0.70], [0, 0.70]] },
      { id: 'B', slot: 1, poly: [[0.5, 0], [1, 0], [1, 0.70], [0.5, 0.70]] },
    ],
    photoZone: [0, 0, 1, 0.70],
    bandTop: 0.70,
    titleZone: [0.045, 0.735, 0.91, 0.155],
    taglineAt: [0.05, 0.715],
    badgeAt: [0.90, 0.075],
    sunAt: [0.90, 0.085],
    palms: 'none',
    skyline: false,
    slant: 0,
  },
};

export const LAYOUT_ORDER = ['diagonal', 'hero', 'triptych', 'magazine', 'duo'];

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
  { id: '1080x1920', label: 'Story · 1080 × 1920', w: 1080, h: 1920 },
];

export function defaultCrops() {
  return {
    A: { slot: 0, zoom: 1.12, dx: 0, dy: -0.04, flip: false },
    B: { slot: 1, zoom: 1.25, dx: 0.06, dy: 0, flip: false },
    C: { slot: 0, zoom: 1.35, dx: -0.08, dy: 0.02, flip: false },
  };
}

// A layout's framing tweaks are the STARTING crop for its panels: apply them
// when the layout is chosen, so the user (or a shot) can still move the photo
// afterwards. They must not be re-applied at render time, or dragging would
// do nothing on panels a layout tweaks.
export function applyLayoutCrops(state) {
  const fresh = defaultCrops();
  const tweak = (LAYOUTS[state.layout] && LAYOUTS[state.layout].crops) || {};
  for (const id of Object.keys(fresh)) {
    // framing only (zoom/pan); the photo slot stays whatever the user or a
    // shot chose, so a layout switch never silently swaps the photo
    const keepSlot = state.crops[id] ? state.crops[id].slot : fresh[id].slot;
    state.crops[id] = { ...fresh[id], ...(tweak[id] || {}), slot: keepSlot };
  }
}

export function defaultState() {
  return {
    layout: 'diagonal',
    preset: 'sunset',
    title: 'SUNSET HEIST',
    tagline: 'ONE LAST SCORE',
    subtitle: 'VICE CITY • EST. 2026',
    footer: 'LEONIDA',
    titleScale: 1,
    photos: [
      { src: 'samples/boulevard.jpg', label: 'Boulevard', img: null },
      { src: 'samples/pier.jpg', label: 'Pier', img: null },
      { src: null, label: 'Your photo', img: null },
    ],
    // per-panel crop: zoom, pan (fractions of panel size), flip
    crops: defaultCrops(),
    effects: { grain: true, halftone: true, palms: true, sun: true, skyline: true, vignette: true },
    gradeOn: true,
    selected: 'A',
  };
}

export function cloneState(s) {
  return JSON.parse(JSON.stringify({ ...s, photos: s.photos.map((p) => ({ src: p.src, label: p.label })) }));
}
