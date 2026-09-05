import React from 'react';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/contexts/AppContext';

const ALGO_COLORS: Record<string, string> = {
  dp: 'hsl(263,90%,65%)',
  greedy: 'hsl(190,100%,50%)',
  backtracking: 'hsl(45,93%,58%)',
  'branch-bound': 'hsl(213,100%,60%)',
};

const ALGO_SHORT: Record<string, string> = {
  dp: 'DP',
  greedy: 'Greedy',
  backtracking: 'Backtracking',
  'branch-bound': 'B&B',
};

export function Navbar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { selectedAlgorithm, runHistory } = useAppContext();

  const PAGE_LABELS: Record<string, string> = {
    '/': t('nav.dashboard'),
    '/visualizer': t('nav.visualizer'),
    '/benchmark': t('nav.benchmark'),
    '/analytics': t('nav.analytics'),
    '/compare': t('nav.complexity'),
    '/greedy': t('nav.greedy'),
    '/reports': t('nav.reports'),
    '/settings': t('nav.settings'),
  };

  const pageTitle = PAGE_LABELS[location] ?? '';
  const algoColor = ALGO_COLORS[selectedAlgorithm];
  const algoLabel = ALGO_SHORT[selectedAlgorithm];

  return (
    <header className="h-[60px] border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-5 shrink-0">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-muted-foreground/70 hidden sm:block shrink-0">KnapAnalyzer</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:block shrink-0" />
        <span className="text-sm font-semibold text-foreground truncate">{pageTitle}</span>

        {/* Active algorithm pill */}
        <div
          className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[11px] font-medium border"
          style={{
            background: `${algoColor}18`,
            color: algoColor,
            borderColor: `${algoColor}35`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: algoColor }} />
          {algoLabel}
        </div>
      </div>

      {/* Center: search */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder={t('navbar.searchPlaceholder')}
            className="pl-9 h-8 text-xs bg-muted/40 border-white/8 focus-visible:border-primary/50 focus-visible:ring-0 rounded-full placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Run count badge */}
        {runHistory.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-white/8 text-[11px] text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{runHistory.length}</span>
            <span>runs</span>
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </Button>

        <Avatar className="h-8 w-8 border border-primary/25 ring-2 ring-background/80 cursor-pointer">
          <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-primary text-xs font-semibold">
            CS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
