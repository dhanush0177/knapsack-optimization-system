import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Play,
  BarChart2,
  Activity,
  ListTree,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const ALGO_COLORS: Record<string, string> = {
  dp: 'hsl(263,90%,65%)',
  greedy: 'hsl(190,100%,50%)',
  backtracking: 'hsl(45,93%,58%)',
  bb: 'hsl(213,100%,60%)',
};

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  const sections = [
    {
      label: 'Core',
      routes: [
        { path: '/',           label: t('nav.dashboard'),  icon: LayoutDashboard },
        { path: '/visualizer', label: t('nav.visualizer'), icon: Play },
      ],
    },
    {
      label: 'Analysis',
      routes: [
        { path: '/benchmark', label: t('nav.benchmark'),  icon: Activity },
        { path: '/analytics', label: t('nav.analytics'),  icon: BarChart2 },
        { path: '/compare',   label: t('nav.complexity'), icon: ListTree },
        { path: '/greedy',    label: t('nav.greedy'),     icon: Zap },
      ],
    },
    {
      label: 'System',
      routes: [
        { path: '/reports',  label: t('nav.reports'),  icon: FileText },
        { path: '/settings', label: t('nav.settings'), icon: Settings },
      ],
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 252 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="h-screen bg-sidebar border-r border-sidebar-border relative flex flex-col z-20 shrink-0 overflow-hidden"
    >
      {/* Logo header */}
      <div className="h-[60px] flex items-center border-b border-sidebar-border shrink-0 px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 flex items-center justify-center border border-violet-500/30 shrink-0 glow-primary-pulse">
                <Hexagon className="w-4.5 h-4.5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <span className="text-gradient-animated font-bold text-[15px] tracking-tight leading-none block">
                  KnapAnalyzer
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-mono tracking-widest">v2.0 PRO</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-mini"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 flex items-center justify-center border border-violet-500/30"
            >
              <Hexagon className="w-5 h-5 text-violet-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            {/* Section label (only when expanded) */}
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="section-label"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            {section.routes.map((route) => {
              const isActive = location === route.path;
              return (
                <Link key={route.path} href={route.path}>
                  <div
                    title={collapsed ? route.label : undefined}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 group my-0.5',
                      collapsed ? 'justify-center px-0 py-2.5 mx-0.5' : 'px-3 py-2.5',
                      isActive
                        ? 'nav-item-active text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                  >
                    {/* Active glow blob */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'linear-gradient(90deg, hsl(263 90% 65% / 0.18), hsl(263 90% 65% / 0.04))',
                          borderLeft: '2px solid hsl(263 90% 65%)',
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 34 }}
                      />
                    )}

                    <route.icon className={cn(
                      'w-4 h-4 shrink-0 z-10 transition-all duration-200',
                      isActive
                        ? 'text-primary drop-shadow-[0_0_8px_hsl(263_90%_65%/0.7)]'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )} />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            'z-10 text-sm font-medium whitespace-nowrap',
                            isActive ? 'text-primary' : '',
                          )}
                        >
                          {route.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Active dot for collapsed */}
                    {isActive && collapsed && (
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: collapse toggle + status */}
      <div className="border-t border-sidebar-border p-3 shrink-0 space-y-2">
        {/* Status row */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 overflow-hidden"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] text-emerald-400 font-medium">All systems online</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all',
            collapsed ? 'w-9 mx-auto flex' : 'w-full',
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </Button>
      </div>
    </motion.aside>
  );
}
