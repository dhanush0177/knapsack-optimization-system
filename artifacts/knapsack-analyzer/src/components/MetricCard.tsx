import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentColor = 'violet' | 'cyan' | 'amber' | 'blue' | 'emerald';

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; positive?: boolean };
  delay?: number;
  className?: string;
  color?: AccentColor;
}

const COLOR_MAP: Record<AccentColor, {
  accent: string;
  iconBg: string;
  iconColor: string;
  glow: string;
  valueShadow: string;
  borderTop: string;
}> = {
  violet: {
    accent: 'hsl(263 90% 65%)',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    glow: 'glow-primary',
    valueShadow: 'value-primary',
    borderTop: 'accent-violet',
  },
  cyan: {
    accent: 'hsl(190 100% 50%)',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    glow: 'glow-secondary',
    valueShadow: 'value-cyan',
    borderTop: 'accent-cyan',
  },
  amber: {
    accent: 'hsl(45 93% 58%)',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    glow: 'glow-amber',
    valueShadow: 'value-amber',
    borderTop: 'accent-amber',
  },
  blue: {
    accent: 'hsl(213 100% 60%)',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    glow: 'glow-blue',
    valueShadow: 'value-blue',
    borderTop: 'accent-blue',
  },
  emerald: {
    accent: 'hsl(142 71% 45%)',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    glow: 'glow-emerald',
    valueShadow: 'value-emerald',
    borderTop: 'accent-emerald',
  },
};

export function MetricCard({
  title, value, icon: Icon, description, trend, delay = 0, className, color = 'violet',
}: MetricCardProps) {
  const c = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group card-interactive', className)}
    >
      <div className={cn('glass-panel rounded-xl overflow-hidden h-full relative', c.borderTop)}>
        {/* Subtle inner gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{ background: `radial-gradient(ellipse at top left, ${c.accent}10, transparent 60%)` }}
        />

        <div className="p-5 relative z-10">
          {/* Top row: title + icon */}
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <div className={cn(
              'p-2 rounded-lg transition-all duration-300 group-hover:scale-110',
              c.iconBg,
            )}>
              <Icon className={cn('w-4 h-4', c.iconColor)} />
            </div>
          </div>

          {/* Value */}
          <div className={cn('text-3xl font-bold tracking-tight data-mono mb-3', c.valueShadow)}>
            {value}
          </div>

          {/* Bottom row */}
          {(description || trend) && (
            <div className="flex items-center gap-2 text-xs">
              {trend && (
                <span className={cn(
                  'flex items-center gap-0.5 font-semibold',
                  trend.positive ? 'text-emerald-400' : 'text-rose-400',
                )}>
                  {trend.positive
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {trend.value}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground truncate">{description}</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
        />
      </div>
    </motion.div>
  );
}
