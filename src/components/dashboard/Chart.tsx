import React from 'react';
import { cn } from '../../lib/utils';
import type { LegacyChartData } from '../../types/dashboard';

type ChartType = 'line' | 'bar' | 'area';
type ChartColor = 'gold' | 'cyan' | 'purple' | 'green';

interface ColorConfig {
  primary: string;
  gradient: string;
  glow: string;
}

interface ChartProps {
  data: LegacyChartData;
  type?: ChartType;
  height?: number;
  className?: string;
  color?: ChartColor;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

const Chart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  height = 300,
  className,
  color = 'cyan',
  showGrid = true,

  animate = true
}) => {
  const { labels, datasets } = data;
  const title = datasets[0]?.label || 'Chart';
  const dataPoints = datasets[0]?.data || [];
  
  // Find min and max values for scaling
  const values: number[] = dataPoints;
  const minValue: number = Math.min(...values);
  const maxValue: number = Math.max(...values);
  const range: number = maxValue - minValue || 1;
  
  // Chart dimensions
  const chartWidth: number = 100; // percentage
  const chartHeight: number = height - 80; // account for padding and labels
  
  // Color configurations
  const colorConfigs: Record<ChartColor, ColorConfig> = {
    gold: {
      primary: '#F59E0B',
      gradient: 'from-gold-500/30 to-gold-600/10',
      glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    },
    cyan: {
      primary: '#00F5FF',
      gradient: 'from-cyan-500/30 to-cyan-600/10',
      glow: 'drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]'
    },
    purple: {
      primary: '#8B5CF6',
      gradient: 'from-purple-500/30 to-purple-600/10',
      glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]'
    },
    green: {
      primary: '#10B981',
      gradient: 'from-green-500/30 to-green-600/10',
      glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
    }
  };
  
  const colorConfig: ColorConfig = colorConfigs[color];
  
  // Generate SVG path for line chart
  const generateLinePath = (): string => {
    if (dataPoints.length === 0) return '';
    
    const points: string[] = dataPoints.map((value: number, index: number): string => {
      const x: number = (index / (dataPoints.length - 1)) * chartWidth;
      const y: number = chartHeight - ((value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };
  
  // Generate SVG path for area chart
  const generateAreaPath = (): string => {
    if (dataPoints.length === 0) return '';
    
    const linePath: string = generateLinePath();
    const lastX: number = ((dataPoints.length - 1) / (dataPoints.length - 1)) * chartWidth;
    
    return `${linePath} L ${lastX},${chartHeight} L 0,${chartHeight} Z`;
  };
  
  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  

  
  return (
    <div className={cn(
      'glass-card backdrop-blur-lg bg-white/5 border border-white/10 p-6',
      className
    )}>
      {/* Chart Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Últimos {dataPoints.length} dias</span>
          <span>•</span>
          <span>Máx: {formatValue(maxValue)}</span>
          <span>•</span>
          <span>Mín: {formatValue(minValue)}</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {showGrid && (
            <g className="opacity-20">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <line
                  key={`h-grid-${index}`}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              ))}
              {/* Vertical grid lines */}
              {dataPoints.map((_: number, index: number) => {
                if (index % Math.ceil(dataPoints.length / 6) === 0) {
                  const x: number = (index / (dataPoints.length - 1)) * chartWidth;
                  return (
                    <line
                      key={`v-grid-${index}`}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={chartHeight}
                      stroke="white"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  );
                }
                return null;
              })}
            </g>
          )}
          
          {/* Chart Content */}
          {type === 'area' && (
            <path
              d={generateAreaPath()}
              fill={`url(#gradient-${color})`}
              className={animate ? 'animate-pulse' : ''}
            />
          )}
          
          {(type === 'line' || type === 'area') && (
            <path
              d={generateLinePath()}
              fill="none"
              stroke={colorConfig.primary}
              strokeWidth="2"
              className={cn(
                colorConfig.glow,
                animate ? 'animate-pulse' : ''
              )}
            />
          )}
          
          {type === 'bar' && (
            <g>
              {dataPoints.map((value: number, index: number) => {
                const barWidth: number = chartWidth / dataPoints.length * 0.6;
                const x: number = (index / (dataPoints.length - 1)) * chartWidth - barWidth / 2;
                const barHeight: number = ((value - minValue) / range) * chartHeight;
                const y: number = chartHeight - barHeight;
                
                return (
                  <rect
                    key={index}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={colorConfig.primary}
                    className={cn(
                      colorConfig.glow,
                      animate ? 'animate-pulse' : ''
                    )}
                  />
                );
              })}
            </g>
          )}
          
          {/* Data Points */}
          {(type === 'line' || type === 'area') && (
            <g>
              {dataPoints.map((value: number, index: number) => {
                const x: number = (index / (dataPoints.length - 1)) * chartWidth;
                const y: number = chartHeight - ((value - minValue) / range) * chartHeight;
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={colorConfig.primary}
                    className={cn(
                      colorConfig.glow,
                      'hover:r-4 transition-all cursor-pointer'
                    )}
                  />
                );
              })}
            </g>
          )}
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorConfig.primary} stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2">
          {labels.map((label: string, index: number) => {
            if (index % Math.ceil(labels.length / 6) === 0) {
              return (
                <span key={index}>
                  {label}
                </span>
              );
            }
            return null;
          })}
        </div>
        
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 -ml-12">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio: number, index: number) => (
            <span key={index}>
              {formatValue(minValue + (range * ratio))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chart;