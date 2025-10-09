// src/logic/renderers.v3.tsx
import React from 'react';
import type { Cell, Question } from './types.v3';

// --- Konstanter och Hjälpkomponenter ---
const SIZE = 100, CX = 50, CY = 50;
const STROKE_COLOR = '#000';
const STROKE_WIDTH = 2.5;

const rotate = (rotation: number, content: JSX.Element) => (
  <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>{content}</g>
);

const Line: React.FC<{ x1: number, y1: number, x2: number, y2: number }> = (props) => (
  <line {...props} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
);

// Ny komponent för referensramen
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

// --- Huvudkomponent för att rendera en cell ---
export const SvgCellV3: React.FC<{ cell: Cell }> = ({ cell }) => {
  switch (cell.kind) {
    case 'dots':
      const dots = [];
      const y = cell.pos === 'T' ? 30 : cell.pos === 'C' ? 50 : 70;
      if (cell.count === 1) dots.push(<circle key={1} cx={50} cy={y} r={8} fill={STROKE_COLOR}/>);
      if (cell.count === 2) {
        dots.push(<circle key={1} cx={35} cy={y} r={8} fill={STROKE_COLOR}/>);
        dots.push(<circle key={2} cx={65} cy={y} r={8} fill={STROKE_COLOR}/>);
      }
      if (cell.count === 3) {
        if(cell.layout === 'vertical') {
            dots.push(<circle key={1} cx={50} cy={30} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={2} cx={50} cy={50} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={3} cx={50} cy={70} r={8} fill={STROKE_COLOR}/>);
        } else {
            dots.push(<circle key={1} cx={25} cy={y} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={2} cx={50} cy={y} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={3} cx={75} cy={y} r={8} fill={STROKE_COLOR}/>);
        }
      }
      return <>{dots}</>;

    case 'arrow':
      const arrowPath = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill={cell.fill ? STROKE_COLOR : 'none'} stroke={cell.fill ? STROKE_COLOR : 'none'} strokeWidth={STROKE_WIDTH} />;
      return rotate(cell.rotation, arrowPath);
      
    case 'icon':
      let iconPath;
      if (cell.shape === 'pacman') iconPath = <path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill={STROKE_COLOR}/>;
      if (cell.shape === 'star') iconPath = <path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill={STROKE_COLOR}/>;
      if (cell.shape === 'heart') iconPath = <path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill={STROKE_COLOR}/>;
      return rotate(cell.rotation ?? 0, <>{iconPath}</>);
      
    case 'fill':
      const fillShape = cell.shape === 'circle' 
        ? <circle cx={50} cy={50} r={25} /> 
        : <rect x="25" y="25" width="50" height="50" />;
      return React.cloneElement(fillShape, { fill: cell.fill ? STROKE_COLOR : 'none', stroke: STROKE_COLOR, strokeWidth: STROKE_WIDTH });

    case 'corner_dot':
      if (!cell.pos) return null;
      const posMap = { TL: {cx:25, cy:25}, TR: {cx:75, cy:25}, BR: {cx:75, cy:75}, BL: {cx:25, cy:75} };
      return <circle {...posMap[cell.pos]} r={8} fill={STROKE_COLOR} />;
      
    // Lägg till resterande cases för de andra typerna här...
    
    default: return null;
  }
};


// --- Användning i en frågekomponent ---
export const MatrixQuestionComponent: React.FC<{ question: Question }> = ({ question }) => {
  // ... state för val etc. ...
  return (
    <div>
      <div className="grid">
        {question.grid.flat().map((cell, i) => (
          <div className="cell" key={i}>
            <svg viewBox="0 0 100 100">
              {question.showGrid && <Grid />}
              {cell && <SvgCellV3 cell={cell} />}
            </svg>
          </div>
        ))}
      </div>
      {/* ... Svarsalternativ renderas på liknande sätt ... */}
    </div>
  );
};