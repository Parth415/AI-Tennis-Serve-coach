
import React from 'react';

export interface ChartDataPoint {
  x: number; // Timestamp
  y: number; // Percentage value
}

interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const WIDTH = 600;
  const HEIGHT = 300;
  const MARGIN = { top: 20, right: 30, bottom: 50, left: 50 };
  const CHART_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
  const CHART_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

  if (data.length < 2) {
    return null; // Should be handled by parent component
  }

  const minX = data[0].x;
  const maxX = data[data.length - 1].x;
  const minY = 0;
  const maxY = 100;

  const xScale = (value: number) => {
    return ((value - minX) / (maxX - minX)) * CHART_WIDTH;
  };

  const yScale = (value: number) => {
    return CHART_HEIGHT - ((value - minY) / (maxY - minY)) * CHART_HEIGHT;
  };

  const path = data.map((point, i) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

  const xLabels = () => {
    const labels = [];
    const numLabels = Math.min(data.length, 5);
    for (let i = 0; i < numLabels; i++) {
        const index = Math.floor(i * (data.length - 1) / (numLabels - 1));
        const point = data[index];
        labels.push({
            x: xScale(point.x),
            label: new Date(point.x).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
        });
    }
    return labels;
  };

  const yLabels = [0, 25, 50, 75, 100];

  return (
    <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="figure" aria-labelledby="chart-title" className="w-full h-auto">
            <title id="chart-title">{title} over time</title>
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                {/* Grid Lines */}
                {yLabels.map(label => (
                    <line
                        key={label}
                        x1={0}
                        y1={yScale(label)}
                        x2={CHART_WIDTH}
                        y2={yScale(label)}
                        stroke="#e5e7eb"
                        strokeDasharray="2,2"
                    />
                ))}
                
                {/* Axes */}
                <line x1={0} y1={0} x2={0} y2={CHART_HEIGHT} stroke="#9ca3af" />
                <line x1={0} y1={CHART_HEIGHT} x2={CHART_WIDTH} y2={CHART_HEIGHT} stroke="#9ca3af" />

                {/* Y-Axis Labels */}
                {yLabels.map(label => (
                    <text
                        key={label}
                        x={-10}
                        y={yScale(label)}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        fontSize="10"
                        fill="#6b7280"
                    >
                        {label}%
                    </text>
                ))}

                 {/* X-Axis Labels */}
                {xLabels().map(({ x, label }) => (
                     <text
                        key={label}
                        x={x}
                        y={CHART_HEIGHT + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                    >
                        {label}
                    </text>
                ))}
                <text x={CHART_WIDTH / 2} y={CHART_HEIGHT + 40} textAnchor="middle" fontSize="12" fill="#374151">Date</text>


                {/* Data Line */}
                <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />

                {/* Data Points */}
                {data.map((point, i) => (
                    <g key={i} transform={`translate(${xScale(point.x)}, ${yScale(point.y)})`}>
                        <circle r="4" fill="#10b981">
                             <title>
                                {`${new Date(point.x).toLocaleDateString()}: ${point.y}%`}
                            </title>
                        </circle>
                    </g>
                ))}
            </g>
        </svg>
    </div>
  );
};
