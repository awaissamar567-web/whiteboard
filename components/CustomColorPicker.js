'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, ArrowUpDown, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';

// Color math conversion utilities
function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return { r: 254, g: 240, b: 138 }; // default light yellow
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0,
    gPrime = 0,
    bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

const QUICK_SWATCHES = [
  '#FEF08A', // Soft Amber / Post-it Yellow
  '#99F6E4', // Soft Teal
  '#FECDD3', // Soft Rose
  '#DDD6FE', // Soft Violet
  '#A7F3D0', // Soft Emerald
  '#BAE6FD', // Soft Sky
  '#FED7AA', // Soft Peach
  '#E2E8F0', // Soft Slate
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#18181A', // Dark Slate
  '#FFFFFF', // White
];

export default function CustomColorPicker({
  value = '#FEF08A',
  onChange,
  onClose,
  position = 'bottom',
}) {
  const { isDark } = useTheme();
  const pickerRef = useRef(null);
  const satValBoxRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Parse current initial color into HSV
  const initialRgb = hexToRgb(value.startsWith('#') ? value : '#FEF08A');
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hsv, setHsv] = useState(initialHsv);
  const [rgb, setRgb] = useState(initialRgb);
  const [hexInput, setHexInput] = useState(
    rgbToHex(initialRgb.r, initialRgb.g, initialRgb.b)
  );
  const [inputMode, setInputMode] = useState('HEX'); // 'HEX' or 'RGB'

  // Update internal state when value prop changes externally
  useEffect(() => {
    if (value && typeof value === 'string' && value.startsWith('#')) {
      const parsedRgb = hexToRgb(value);
      const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setHsv(parsedHsv);
      setRgb(parsedRgb);
      setHexInput(value.toUpperCase());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Notify parent of color update
  const emitColorChange = useCallback(
    (newHsv) => {
      const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      setHsv(newHsv);
      setRgb(newRgb);
      setHexInput(newHex);
      onChange && onChange(newHex);
    },
    [onChange]
  );

  // Saturation / Value Box drag handler
  const handleSatValPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updateSatVal = (event) => {
      if (!satValBoxRef.current) return;
      const rect = satValBoxRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      const s = x / rect.width;
      const v = 1 - y / rect.height;

      emitColorChange({ ...hsv, s, v });
    };

    updateSatVal(e);

    const handlePointerMove = (event) => updateSatVal(event);
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Hue Slider drag handler
  const handleHuePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updateHue = (event) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const h = Math.round((x / rect.width) * 360) % 360;

      emitColorChange({ ...hsv, h });
    };

    updateHue(e);

    const handlePointerMove = (event) => updateHue(event);
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // EyeDropper API support
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const pickedRgb = hexToRgb(result.sRGBHex);
          const pickedHsv = rgbToHsv(pickedRgb.r, pickedRgb.g, pickedRgb.b);
          emitColorChange(pickedHsv);
        }
      } catch (err) {
        // User canceled eye dropper
      }
    }
  };

  const handleHexInputChange = (e) => {
    const raw = e.target.value;
    setHexInput(raw);
    let val = raw.trim();
    if (!val.startsWith('#')) val = `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      const parsedRgb = hexToRgb(val);
      const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setHsv(parsedHsv);
      setRgb(parsedRgb);
      onChange && onChange(rgbToHex(parsedRgb.r, parsedRgb.g, parsedRgb.b));
    }
  };

  const handleRgbInputChange = (channel, val) => {
    const num = Math.max(0, Math.min(255, parseInt(val, 10) || 0));
    const nextRgb = { ...rgb, [channel]: num };
    const nextHsv = rgbToHsv(nextRgb.r, nextRgb.g, nextRgb.b);
    setRgb(nextRgb);
    setHsv(nextHsv);
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setHexInput(nextHex);
    onChange && onChange(nextHex);
  };

  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const pureHueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div
      ref={pickerRef}
      role="dialog"
      aria-label="Custom color picker"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className={`absolute z-50 p-3 rounded-2xl bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl shadow-black/25 flex flex-col gap-3 w-[260px] animate-in fade-in zoom-in-95 duration-100 select-none text-neutral-800 dark:text-neutral-100 font-sans pointer-events-auto ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}
    >
      {/* 2D Saturation / Value Gradient Canvas Area */}
      <div
        ref={satValBoxRef}
        onPointerDown={handleSatValPointerDown}
        className="relative w-full h-36 rounded-xl overflow-hidden cursor-crosshair shadow-inner ring-1 ring-black/5 dark:ring-white/10"
        style={{ backgroundColor: pureHueColor }}
      >
        {/* White-to-transparent gradient (horizontal) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #FFFFFF, transparent)',
          }}
        />
        {/* Transparent-to-black gradient (vertical) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, #000000)',
          }}
        />

        {/* 2D Draggable Handle Indicator */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none ring-1 ring-black/40"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* Controls Bar: Eyedropper + Live Preview + Rainbow Hue Slider */}
      <div className="flex items-center gap-2.5">
        {typeof window !== 'undefined' && 'EyeDropper' in window && (
          <button
            type="button"
            onClick={handleEyeDropper}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer shrink-0"
            title="Pick color from screen"
          >
            <Pipette className="w-4 h-4" />
          </button>
        )}

        {/* Large Circular Color Preview Swatch */}
        <div
          className="w-7 h-7 rounded-full border border-black/10 dark:border-white/20 shadow-xs shrink-0 ring-1 ring-black/5"
          style={{ backgroundColor: currentHex }}
          title={`Selected: ${currentHex}`}
        />

        {/* 1D Rainbow Hue Slider Track */}
        <div
          ref={hueSliderRef}
          onPointerDown={handleHuePointerDown}
          className="relative flex-1 h-3.5 rounded-full cursor-pointer shadow-inner"
          style={{
            background:
              'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
          }}
        >
          {/* Draggable Hue Thumb Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-white shadow-md ring-1 ring-black/30 pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
              backgroundColor: pureHueColor,
            }}
          />
        </div>
      </div>

      {/* Hex or RGB Numerical Input Fields */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
        {inputMode === 'HEX' ? (
          <div className="flex-1 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10">
            <span className="text-[10px] font-mono text-neutral-400">#</span>
            <input
              type="text"
              value={hexInput.replace('#', '')}
              onChange={handleHexInputChange}
              maxLength={6}
              className="w-full bg-transparent font-mono text-xs font-semibold outline-none uppercase text-neutral-800 dark:text-neutral-100"
              placeholder="FEF08A"
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => handleRgbInputChange('r', e.target.value)}
                className="w-full px-1 py-1 text-center font-mono text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 outline-none"
              />
              <span className="text-[9px] text-neutral-400 font-medium mt-0.5">R</span>
            </div>
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => handleRgbInputChange('g', e.target.value)}
                className="w-full px-1 py-1 text-center font-mono text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 outline-none"
              />
              <span className="text-[9px] text-neutral-400 font-medium mt-0.5">G</span>
            </div>
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => handleRgbInputChange('b', e.target.value)}
                className="w-full px-1 py-1 text-center font-mono text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 outline-none"
              />
              <span className="text-[9px] text-neutral-400 font-medium mt-0.5">B</span>
            </div>
          </div>
        )}

        {/* Mode Switcher Toggle (HEX <-> RGB) */}
        <button
          type="button"
          onClick={() => setInputMode(inputMode === 'HEX' ? 'RGB' : 'HEX')}
          className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold uppercase shrink-0"
          title={`Switch to ${inputMode === 'HEX' ? 'RGB' : 'HEX'} mode`}
        >
          <span>{inputMode}</span>
          <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>

      {/* Preset Swatches Palette */}
      <div>
        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 block mb-1.5">
          Preset swatches
        </span>
        <div className="grid grid-cols-8 gap-1.5">
          {QUICK_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => {
                const parsedRgb = hexToRgb(swatch);
                const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
                emitColorChange(parsedHsv);
              }}
              className={`w-5 h-5 rounded-md border transition-transform cursor-pointer flex items-center justify-center ${
                currentHex.toUpperCase() === swatch.toUpperCase()
                  ? 'ring-2 ring-blue-500 scale-110 border-transparent shadow-xs'
                  : 'border-black/10 dark:border-white/10 hover:scale-110 opacity-90 hover:opacity-100'
              }`}
              style={{ backgroundColor: swatch }}
              title={swatch}
            >
              {currentHex.toUpperCase() === swatch.toUpperCase() && (
                <Check
                  className={`w-2.5 h-2.5 ${
                    hsv.v < 0.6 ? 'text-white' : 'text-neutral-900'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
