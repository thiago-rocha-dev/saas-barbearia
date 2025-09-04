import React from 'react';
import { cn } from '../../lib/utils';
import type { DashboardKPI } from '../../types/dashboard';

type KPISize = 'sm' | 'md' | 'lg';
type KPIVariant = 'default' | 'compact';
type KPIColor = 'gold' | 'cyan' | 'purple';

interface KPICardProps {
  kpi: DashboardKPI;
  className?: string;
  size?: KPISize;
  variant?: KPIVariant;
}

interface SizeClasses {
  sm: string;
  md: string;
  lg: string;
}

interface ColorStyle {
  bg: string;
  border: string;
  icon: string;
  glow: string;
  accent: string;
}

interface ColorClasses {
  gold: ColorStyle;
  cyan: ColorStyle;
  purple: ColorStyle;
}

const KPICard: React.FC<KPICardProps> = ({
  kpi,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const { title, value, change, icon, color } = kpi;

  const sizeClasses: SizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const colorClasses: ColorClasses = {
    gold: {
      bg: 'from-gold-500/20 to-yellow-600/20',
      border: 'border-gold-500/30',
      icon: 'text-gold-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      accent: 'text-gold-400'
    },
    cyan: {
      bg: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/30',
      icon: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(0,245,255,0.3)]',
      accent: 'text-cyan-400'
    },
    purple: {
      bg: 'from-purple-500/20 to-pink-600/20',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
      accent: 'text-purple-400'
    }
  };

  const colorStyle: ColorStyle = colorClasses[color as KPIColor] || colorClasses.cyan;
  const isPositiveChange: boolean = change >= 0;
  const changeIcon: string = isPositiveChange ? '↗' : '↘';
  const changeColor: string = isPositiveChange ? 'text-green-400' : 'text-red-400';

  const formatValue = (val: number | string): string => {
    const numVal: number = typeof val === 'string' ? parseFloat(val) : val;
    if (numVal >= 1000000) {
      return `${(numVal / 1000000).toFixed(1)}M`;
    }
    if (numVal >= 1000) {
      return `${(numVal / 1000).toFixed(1)}K`;
    }
    return numVal.toString();
  };

  const formatChange = (val: number): string => {
    return `${isPositiveChange ? '+' : ''}${val.toFixed(1)}%`;
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        'glass-card backdrop-blur-lg bg-gradient-to-br',
        colorStyle.bg,
        colorStyle.border,
        colorStyle.glow,
        'border transition-all duration-300 hover:scale-105',
        'p-4 flex items-center space-x-4',
        className
      )}>
        <div className={cn('text-2xl', colorStyle.icon)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 truncate">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-xl font-bold text-white">
              {formatValue(value)}
            </p>
            <span className={cn('text-xs font-medium', changeColor)}>
              {changeIcon} {formatChange(change)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card backdrop-blur-lg bg-gradient-to-br',
      colorStyle.bg,
      colorStyle.border,
      colorStyle.glow,
      'border transition-all duration-300 hover:scale-105 group',
      sizeClasses[size],
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-3 rounded-lg bg-white/10 backdrop-blur-sm',
          'group-hover:bg-white/20 transition-colors duration-300'
        )}>
          <span className={cn('text-2xl', colorStyle.icon)}>
            {icon}
          </span>
        </div>
        <div className={cn(
          'flex items-center space-x-1 px-2 py-1 rounded-full',
          'bg-white/10 backdrop-blur-sm text-xs font-medium',
          changeColor
        )}>
          <span>{changeIcon}</span>
          <span>{formatChange(change)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-white">
            {formatValue(value)}
          </p>
          {title.toLowerCase().includes('revenue') && (
            <span className="text-lg text-gray-400">R$</span>
          )}
        </div>
      </div>

      {/* Animated border */}
      <div className={cn(
        'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100',
        'bg-gradient-to-r from-transparent via-white/20 to-transparent',
        'transition-opacity duration-500'
      )} />
    </div>
  );
};

export default KPICard;