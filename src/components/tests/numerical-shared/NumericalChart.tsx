'use client';

import BarChart, { type BarSeries } from './charts/BarChart';
import PieChart, { type PieSlice } from './charts/PieChart';
import LineChart, { type LinePoint } from './charts/LineChart';

export type ChartConfig =
  | {
      chartType: 'bar';
      title?: string;
      data: BarSeries[];
      unit?: string;
      yAxisLabel?: string;
    }
  | {
      chartType: 'pie';
      title?: string;
      data: PieSlice[];
      unit?: string;
      centerLabel?: string;
    }
  | {
      chartType: 'line';
      title?: string;
      data: LinePoint[];
      unit?: string;
      xAxisLabel?: string;
      yAxisLabel?: string;
    };

interface NumericalChartProps {
  config: ChartConfig;
}

/**
 * Dispatcher som renderar rätt chart-typ baserat på config.
 * Används både i passage-display under testet och i answer-key på results.
 */
export default function NumericalChart({ config }: NumericalChartProps) {
  if (config.chartType === 'bar') {
    return (
      <BarChart
        title={config.title}
        data={config.data}
        unit={config.unit}
        yAxisLabel={config.yAxisLabel}
      />
    );
  }

  if (config.chartType === 'pie') {
    return (
      <PieChart
        title={config.title}
        data={config.data}
        unit={config.unit}
        centerLabel={config.centerLabel}
      />
    );
  }

  return (
    <LineChart
      title={config.title}
      data={config.data}
      unit={config.unit}
      xAxisLabel={config.xAxisLabel}
      yAxisLabel={config.yAxisLabel}
    />
  );
}
