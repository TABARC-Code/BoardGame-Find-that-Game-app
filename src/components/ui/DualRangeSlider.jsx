import { useState } from 'react';

// Two native <input type="range"> elements stacked on the same track via
// CSS (see .dual-range-input in index.css), rather than a from-scratch
// pointer-drag implementation - this keeps native keyboard behavior
// (arrow keys, Home/End, Page Up/Down) and screen reader range semantics
// for free. The two inputs' invisible full-width tracks would otherwise
// fight over clicks/drags, so index.css sets pointer-events: none on the
// track and re-enables it only on each thumb; `z-index` here decides
// which thumb answers when they end up visually stacked (default: the
// one further from the low end, i.e. `max`, except while a thumb is
// actively being dragged, or when both handles sit on the same value -
// in which case `min` needs to be reachable to pull them apart).
export function DualRangeSlider({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  ariaLabelMin = 'Minimum value',
  ariaLabelMax = 'Maximum value',
}) {
  const [activeThumb, setActiveThumb] = useState(null); // 'min' | 'max' | null

  const toPercent = (value) => ((value - min) / (max - min)) * 100;
  const minPercent = toPercent(valueMin);
  const maxPercent = toPercent(valueMax);

  const minZ = activeThumb === 'min' ? 5 : valueMin >= valueMax ? 4 : 2;
  const maxZ = activeThumb === 'max' ? 5 : 3;

  const releaseActive = () => setActiveThumb(null);

  return (
    <div className="relative h-5">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[var(--border)]" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[var(--navy)]"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => onChangeMin(Math.min(parseFloat(e.target.value), valueMax))}
        onPointerDown={() => setActiveThumb('min')}
        onPointerUp={releaseActive}
        onKeyDown={() => setActiveThumb('min')}
        onKeyUp={releaseActive}
        aria-label={ariaLabelMin}
        className="dual-range-input"
        style={{ zIndex: minZ }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => onChangeMax(Math.max(parseFloat(e.target.value), valueMin))}
        onPointerDown={() => setActiveThumb('max')}
        onPointerUp={releaseActive}
        onKeyDown={() => setActiveThumb('max')}
        onKeyUp={releaseActive}
        aria-label={ariaLabelMax}
        className="dual-range-input"
        style={{ zIndex: maxZ }}
      />
    </div>
  );
}
