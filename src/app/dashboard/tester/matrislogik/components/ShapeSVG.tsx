'use client';

import { Shape } from '@/lib/tester/patternTypes';

interface ShapeSVGProps {
  shape: Shape;
  className?: string;
}

export function ShapeSVG({ shape, className = '' }: ShapeSVGProps) {
  const { form, fill, color, size, rotation = 0 } = shape;

  // Color mapping (WCAG AA-compliant)
  const colorMap = {
    blue: '#2563eb',
    red: '#dc2626',
    green: '#16a34a',
    black: '#000000',
    yellow: '#ca8a04',
    purple: '#9333ea'
  };

  // Size mapping (percentage of container)
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80
  };

  const strokeColor = colorMap[color];
  const fillColor = fill === 'solid' ? strokeColor : 'none';
  const sizePercent = sizeMap[size];

  // Pattern definitions for fills
  const patternId = `${fill}-${color}-${Math.random().toString(36).substr(2, 9)}`;

  const renderPattern = () => {
    if (fill === 'striped') {
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform={`rotate(45)`}>
          <line x1="0" y1="0" x2="0" y2="8" stroke={strokeColor} strokeWidth="4" />
        </pattern>
      );
    }
    if (fill === 'dotted') {
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="2" fill={strokeColor} />
        </pattern>
      );
    }
    if (fill === 'crosshatch') {
      return (
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,0 L8,8 M8,0 L0,8" stroke={strokeColor} strokeWidth="1" />
        </pattern>
      );
    }
    return null;
  };

  const getFillAttribute = () => {
    if (fill === 'solid') return fillColor;
    if (fill === 'empty') return 'none';
    return `url(#${patternId})`;
  };

  const renderShape = () => {
    const cx = 50; // Center X
    const cy = 50; // Center Y
    const r = sizePercent / 2;

    switch (form) {
      case 'circle':
        return <circle cx={cx} cy={cy} r={r} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />;

      case 'square':
        const squareSize = r * 1.4; // Adjusted for visual balance
        return (
          <rect
            x={cx - squareSize}
            y={cy - squareSize}
            width={squareSize * 2}
            height={squareSize * 2}
            fill={getFillAttribute()}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case 'triangle':
        const h = r * 1.5;
        return (
          <polygon
            points={`${cx},${cy - h} ${cx - h},${cy + h / 2} ${cx + h},${cy + h / 2}`}
            fill={getFillAttribute()}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case 'diamond':
        return (
          <polygon
            points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
            fill={getFillAttribute()}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case 'hexagon':
        const hexR = r;
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i;
          return `${cx + hexR * Math.cos(angle)},${cy + hexR * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={hexPoints} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />;

      case 'star':
        const starPoints = [];
        for (let i = 0; i < 5; i++) {
          const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          starPoints.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
          starPoints.push(`${cx + (r / 2) * Math.cos(innerAngle)},${cy + (r / 2) * Math.sin(innerAngle)}`);
        }
        return <polygon points={starPoints.join(' ')} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />;

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>{renderPattern()}</defs>
      {renderShape()}
    </svg>
  );
}
