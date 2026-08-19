'use client';

export const FONT_FAMILIES = [
  // Heavy / Punchy Display
  {
    id: 'Bebas Neue',
    name: 'Bebas Neue (Heavy Poster)',
    category: 'Heavy',
    style: { fontFamily: "'Bebas Neue', sans-serif" },
  },
  {
    id: 'Syne',
    name: 'Syne (Extra Bold Display)',
    category: 'Heavy',
    style: { fontFamily: "'Syne', sans-serif", fontWeight: 800 },
  },
  {
    id: 'Oswald',
    name: 'Oswald (Impact Bold)',
    category: 'Heavy',
    style: { fontFamily: "'Oswald', sans-serif", fontWeight: 700 },
  },
  {
    id: 'Space Grotesk',
    name: 'Space Grotesk (Bold Tech)',
    category: 'Heavy',
    style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
  },
  {
    id: 'Permanent Marker',
    name: 'Permanent Marker (Brush)',
    category: 'Heavy',
    style: { fontFamily: "'Permanent Marker', cursive" },
  },

  // Light / Minimalist
  {
    id: 'Outfit',
    name: 'Outfit (Light Minimal)',
    category: 'Light',
    style: { fontFamily: "'Outfit', sans-serif", fontWeight: 300 },
  },
  {
    id: 'Cormorant Garamond',
    name: 'Cormorant (Light Editorial Serif)',
    category: 'Light',
    style: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 },
  },
  {
    id: 'Inter Light',
    name: 'Inter (Clean Light)',
    category: 'Light',
    style: { fontFamily: "'Inter', sans-serif", fontWeight: 300 },
  },

  // Clean Sans / Modern
  {
    id: 'Inter',
    name: 'Inter (Standard Sans)',
    category: 'Sans',
    style: { fontFamily: "'Inter', sans-serif" },
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans (Modern)',
    category: 'Sans',
    style: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
  },

  // Display & Editorial Serifs
  {
    id: 'DM Serif Display',
    name: 'DM Serif (Luxury Display)',
    category: 'Display',
    style: { fontFamily: "'DM Serif Display', serif" },
  },
  {
    id: 'Playfair Display',
    name: 'Playfair Display (Editorial)',
    category: 'Display',
    style: { fontFamily: "'Playfair Display', serif" },
  },
  {
    id: 'Cinzel',
    name: 'Cinzel (Classical Display)',
    category: 'Display',
    style: { fontFamily: "'Cinzel', serif", fontWeight: 700 },
  },
  {
    id: 'Lora',
    name: 'Lora (Book Serif)',
    category: 'Serif',
    style: { fontFamily: "'Lora', serif" },
  },

  // Handwritten & Expressive
  {
    id: 'Caveat',
    name: 'Caveat (Handwritten Script)',
    category: 'Handwriting',
    style: { fontFamily: "'Caveat', cursive" },
  },
  {
    id: 'Patrick Hand',
    name: 'Patrick Hand (Marker Note)',
    category: 'Handwriting',
    style: { fontFamily: "'Patrick Hand', cursive" },
  },
  {
    id: 'Comic Neue',
    name: 'Comic Neue (Casual Playful)',
    category: 'Handwriting',
    style: { fontFamily: "'Comic Neue', cursive" },
  },

  // Code & Monospace
  {
    id: 'JetBrains Mono',
    name: 'JetBrains Mono (Developer)',
    category: 'Monospace',
    style: { fontFamily: "'JetBrains Mono', monospace" },
  },
];

export function getFontFamilyStyle(fontId) {
  const found = FONT_FAMILIES.find((f) => f.id === fontId);
  return found ? found.style.fontFamily : "'Inter', sans-serif";
}

export function getFontWeight(fontId) {
  const found = FONT_FAMILIES.find((f) => f.id === fontId);
  return found?.style?.fontWeight || 'normal';
}
