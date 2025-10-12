'use client';

import type { GraphData } from '@/lib/numericalTestV2/types';

interface GraphVisualizationProps {
  data: GraphData;
}

export function GraphVisualization({ data }: GraphVisualizationProps) {
  const { type, title, xAxisLabel, yAxisLabel } = data;

  if (type === 'bar') {
    return <BarChart data={data} />;
  } else if (type === 'line') {
    return <LineChart data={data} />;
  } else if (type === 'pie') {
    return <PieChart data={data} />;
  }

  return null;
}

function BarChart({ data }: { data: GraphData }) {
  const values = data.data.datasets[0].data;
  const labels = data.data.labels;
  const maxValue = Math.max(...values);
  const barWidth = 60;
  const barGap = 40;
  const chartHeight = 300;
  const chartWidth = labels.length * (barWidth + barGap);

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
      <h3 className="text-center font-bold text-slate-900 mb-4">{data.title}</h3>
      <svg width={chartWidth} height={chartHeight + 80} className="mx-auto">
        {/* Bars */}
        {values.map((value, i) => {
          const barHeight = (value / maxValue) * chartHeight;
          const x = i * (barWidth + barGap) + barGap / 2;
          const y = chartHeight - barHeight + 40;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={data.data.datasets[0].color || '#3b82f6'}
                rx="4"
              />
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-sm font-semibold fill-slate-700"
              >
                {value}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 60}
                textAnchor="middle"
                className="text-sm fill-slate-600"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        {data.yAxisLabel && (
          <text
            x={-chartHeight / 2 - 20}
            y={15}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-sm fill-slate-600 font-medium"
          >
            {data.yAxisLabel}
          </text>
        )}

        {/* X-axis label */}
        {data.xAxisLabel && (
          <text
            x={chartWidth / 2}
            y={chartHeight + 80}
            textAnchor="middle"
            className="text-sm fill-slate-600 font-medium"
          >
            {data.xAxisLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

function LineChart({ data }: { data: GraphData }) {
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 60;
  const datasets = data.data.datasets;
  const labels = data.data.labels;
  const allValues = datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
      <h3 className="text-center font-bold text-slate-900 mb-4">{data.title}</h3>
      <svg width={chartWidth} height={chartHeight + 80} className="mx-auto">
        {datasets.map((dataset, datasetIndex) => {
          const points = dataset.data.map((value, i) => {
            const x = padding + (i * (chartWidth - 2 * padding)) / (labels.length - 1);
            const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * (chartHeight - padding) + 20;
            return `${x},${y}`;
          }).join(' ');

          const color = dataset.color || colors[datasetIndex % colors.length];

          return (
            <g key={datasetIndex}>
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {dataset.data.map((value, i) => {
                const x = padding + (i * (chartWidth - 2 * padding)) / (labels.length - 1);
                const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * (chartHeight - padding) + 20;
                return (
                  <circle key={i} cx={x} cy={y} r="5" fill={color} />
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = padding + (i * (chartWidth - 2 * padding)) / (labels.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + 40}
              textAnchor="middle"
              className="text-sm fill-slate-600"
            >
              {label}
            </text>
          );
        })}

        {/* Legend */}
        {datasets.map((dataset, i) => {
          const color = dataset.color || colors[i % colors.length];
          return (
            <g key={i} transform={`translate(${padding}, ${chartHeight + 55 + i * 20})`}>
              <line x1="0" y1="0" x2="20" y2="0" stroke={color} strokeWidth="3" />
              <text x="25" y="5" className="text-xs fill-slate-700">
                {dataset.label}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        {data.yAxisLabel && (
          <text
            x={-chartHeight / 2}
            y={20}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-sm fill-slate-600 font-medium"
          >
            {data.yAxisLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

function PieChart({ data }: { data: GraphData }) {
  const values = data.data.datasets[0].data;
  const labels = data.data.labels;
  const total = values.reduce((sum, val) => sum + val, 0);
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  let currentAngle = -90; // Start at top

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
      <h3 className="text-center font-bold text-slate-900 mb-4">{data.title}</h3>
      <div className="flex items-center justify-center gap-8">
        <svg width="300" height="300">
          {values.map((value, i) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            currentAngle = endAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const midAngle = (startAngle + endAngle) / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const textX = centerX + (radius / 1.5) * Math.cos(midRad);
            const textY = centerY + (radius / 1.5) * Math.sin(midRad);

            return (
              <g key={i}>
                <path d={path} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-white"
                >
                  {percentage.toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="space-y-2">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm text-slate-700">{label}</span>
              <span className="text-sm font-semibold text-slate-900">({values[i]}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
