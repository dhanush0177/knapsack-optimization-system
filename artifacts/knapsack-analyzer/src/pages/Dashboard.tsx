import { motion } from "framer-motion";
import { Zap, TrendingUp, Clock, Package, Activity, ArrowRight, Cpu, GitBranch, BarChart3, Layers } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CounterAnimation } from "@/components/CounterAnimation";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { runDP } from "@/lib/algorithms";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const ALGO_COLORS: Record<string, string> = {
  dp: "hsl(263, 90%, 65%)",
  greedy: "hsl(190, 100%, 50%)",
  backtracking: "hsl(45, 93%, 58%)",
  "branch-bound": "hsl(213, 100%, 60%)",
};

const chartData = [
  { n: 4, dp: 0.01, greedy: 0.002, bt: 0.03, bb: 0.02 },
  { n: 6, dp: 0.02, greedy: 0.003, bt: 0.15, bb: 0.08 },
  { n: 8, dp: 0.04, greedy: 0.004, bt: 0.7, bb: 0.25 },
  { n: 10, dp: 0.08, greedy: 0.005, bt: 3.2, bb: 0.6 },
  { n: 12, dp: 0.14, greedy: 0.006, bt: 14, bb: 1.8 },
  { n: 15, dp: 0.22, greedy: 0.008, bt: 120, bb: 5.5 },
];

const ALGO_CARDS = [
  {
    key: "dp",
    label: "Dynamic Programming",
    short: "DP",
    complexity: "O(n·W)",
    space: "O(n·W)",
    optimal: true,
    desc: "Solves all subproblems bottom-up. Guaranteed optimality via memoization table.",
    icon: Layers,
    pill: "algo-pill-dp",
  },
  {
    key: "greedy",
    label: "Greedy (Ratio)",
    short: "GR",
    complexity: "O(n log n)",
    space: "O(n)",
    optimal: false,
    desc: "Sorts items by value/weight ratio. Blazing fast but may miss the optimal.",
    icon: Zap,
    pill: "algo-pill-gr",
  },
  {
    key: "backtracking",
    label: "Backtracking",
    short: "BT",
    complexity: "O(2ⁿ)",
    space: "O(n)",
    optimal: true,
    desc: "Explores the full decision tree with pruning. Exponential worst-case.",
    icon: GitBranch,
    pill: "algo-pill-bt",
  },
  {
    key: "branch-bound",
    label: "Branch & Bound",
    short: "B&B",
    complexity: "O(2ⁿ) best",
    space: "O(n·b)",
    optimal: true,
    desc: "Prunes branches with fractional upper bounds. Often much faster than BT.",
    icon: Cpu,
    pill: "algo-pill-bb",
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2.5 text-xs space-y-1 border-primary/20">
      <p className="text-muted-foreground font-medium mb-1">n = {label} items</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono text-foreground">{p.value}ms</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { items, capacity, runHistory } = useAppContext();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const latestResult = useMemo(() => runDP(items, capacity), [items, capacity]);

  const algorithmLabels: Record<string, string> = {
    dp: t('dashboard.dp'),
    greedy: t('dashboard.greedy'),
    backtracking: t('dashboard.backtracking'),
    "branch-bound": t('dashboard.branchBound'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-7"
    >
      {/* ── Hero Banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/8"
      >
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-background/80 to-blue-900/30" />
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/3 w-56 h-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left: headline */}
          <div className="lg:col-span-3 p-7 lg:p-9">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('dashboard.liveAnalysis')}
              </span>
              <span className="text-[11px] text-muted-foreground border border-white/10 px-2.5 py-1 rounded-full">
                {items.length} items · cap {capacity}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              <span className="text-gradient-animated">{t('dashboard.title')}</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed">
              {t('dashboard.subtitle')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                onClick={() => setLocation("/visualizer")}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/25 border-0 h-10"
                data-testid="btn-launch-visualizer"
              >
                <Zap className="w-4 h-4 mr-2" />
                {t('dashboard.startVisualizing')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/benchmark")}
                className="border-white/12 hover:bg-white/6 h-10"
                data-testid="btn-run-benchmark"
              >
                {t('dashboard.viewBenchmarks')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right: live mini-stats */}
          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-white/8 p-5 flex flex-col gap-3">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Live Results</p>
            {ALGO_CARDS.slice(0,4).map((algo, i) => (
              <motion.div
                key={algo.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/4 border border-white/6 hover:bg-white/7 transition-colors"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${ALGO_COLORS[algo.key]}22` }}>
                  <algo.icon className="w-3.5 h-3.5" style={{ color: ALGO_COLORS[algo.key] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{algo.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{algo.complexity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold data-mono" style={{ color: ALGO_COLORS[algo.key] }}>
                    {latestResult.totalValue}
                  </p>
                  <p className="text-[9px] text-muted-foreground">value</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Metric Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('dashboard.optimalValueCard')}
          value={<CounterAnimation value={latestResult.totalValue} />}
          icon={TrendingUp}
          description={t('dashboard.fromDP')}
          trend={{ value: "+12%", positive: true }}
          color="violet"
          delay={0.08}
        />
        <MetricCard
          title={t('dashboard.itemsEvaluated')}
          value={<CounterAnimation value={items.length} />}
          icon={Package}
          description={`${t('dashboard.capacityLabel')} ${capacity}`}
          color="cyan"
          delay={0.13}
        />
        <MetricCard
          title={t('dashboard.dpSteps')}
          value={<CounterAnimation value={latestResult.stepsCount} />}
          icon={Activity}
          description={t('dashboard.tableCells')}
          color="amber"
          delay={0.18}
        />
        <MetricCard
          title={t('dashboard.execTime')}
          value={<CounterAnimation value={Number(latestResult.timeMs.toFixed(3))} format={(v) => `${v.toFixed(2)}ms`} />}
          icon={Clock}
          description={t('dashboard.dynamicProgramming')}
          color="blue"
          delay={0.23}
        />
      </div>

      {/* ── What is Knapsack ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card className="glass-panel border-white/8 overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/6">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🎒</span>
                  <span className="text-sm font-bold">The Knapsack Problem</span>
                  <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30 ml-auto">NP-Complete</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Given a bag with a <span className="text-foreground font-medium">weight limit</span> and items with weight + value —
                  find the combination that <span className="text-primary font-medium">maximises total value</span> without exceeding capacity.
                </p>
                <div className="mt-3.5 p-3 rounded-lg bg-primary/6 border border-primary/15 text-[11px] font-mono">
                  <span className="text-muted-foreground">Cap=<span className="text-primary">10</span>  B(6kg,$7)  C(4kg,$5)  D(3kg,$4)</span><br />
                  <span className="text-emerald-400 font-semibold">→ Best: C+D = 7kg, $9 ✓</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold mb-3">Why is it hard?</p>
                <div className="space-y-2.5">
                  {[
                    { icon: "💥", title: "2ⁿ combinations", desc: "20 items → 1M+ subsets to check" },
                    { icon: "🧩", title: "No simple formula", desc: "Can't just sort by value or weight" },
                    { icon: "🌍", title: "NP-Complete", desc: "No known polynomial solution exists" },
                  ].map(item => (
                    <div key={item.title} className="flex gap-2.5 text-xs">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div>
                        <span className="font-semibold text-foreground">{item.title} — </span>
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold mb-3">Real-World Applications</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { icon: "📦", text: "Logistics routing" },
                    { icon: "💰", text: "Portfolio selection" },
                    { icon: "☁️", text: "Cloud scheduling" },
                    { icon: "🔒", text: "Cryptography" },
                    { icon: "🎮", text: "Game inventory" },
                    { icon: "🛰️", text: "Satellite bandwidth" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{item.icon}</span>{item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Chart + Recent Runs ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="glass-panel h-full border-white/8">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{t('dashboard.runtimeComparison')}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.runtimeCompDesc')}</p>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  {[
                    { key: "dp", label: "DP" },
                    { key: "greedy", label: "Greedy" },
                    { key: "bb", label: "B&B" },
                  ].map(a => (
                    <span key={a.key} className="flex items-center gap-1">
                      <span className="w-2 h-0.5 rounded-full" style={{ background: ALGO_COLORS[a.key === 'bb' ? 'branch-bound' : a.key] }} />
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-52 px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 8, left: -24 }}>
                  <defs>
                    {[
                      { id: "dpG", color: ALGO_COLORS.dp },
                      { id: "grG", color: ALGO_COLORS.greedy },
                      { id: "bbG", color: ALGO_COLORS["branch-bound"] },
                    ].map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={g.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="n" tick={{ fill: "hsl(215 20% 48%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 48%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="dp" stroke={ALGO_COLORS.dp} fill="url(#dpG)" strokeWidth={2} name="DP" dot={false} />
                  <Area type="monotone" dataKey="greedy" stroke={ALGO_COLORS.greedy} fill="url(#grG)" strokeWidth={2} name="Greedy" dot={false} />
                  <Area type="monotone" dataKey="bb" stroke={ALGO_COLORS["branch-bound"]} fill="url(#bbG)" strokeWidth={1.5} strokeDasharray="4 3" name="B&B" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent runs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-panel h-full border-white/8">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-semibold">{t('dashboard.recentRuns')}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {runHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{t('dashboard.noRunsYet')}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t('dashboard.runAlgoDesc')}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {runHistory.slice(0, 6).map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors group"
                      data-testid={`history-entry-${entry.id}`}
                    >
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: ALGO_COLORS[entry.algorithm] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{algorithmLabels[entry.algorithm]}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{entry.numItems} items · cap {entry.capacity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold data-mono" style={{ color: ALGO_COLORS[entry.algorithm] }}>
                          {entry.result.totalValue}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{entry.result.timeMs.toFixed(2)}ms</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Algorithm Overview Grid ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">{t('dashboard.algorithmOverview')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click any card to jump to the visualizer</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALGO_CARDS.map((algo, i) => (
            <motion.button
              key={algo.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33 + i * 0.07 }}
              onClick={() => setLocation("/visualizer")}
              className="text-left group card-interactive"
              data-testid={`algo-card-${algo.key}`}
            >
              <div className="glass-panel rounded-xl overflow-hidden h-full">
                {/* Colored top accent */}
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${ALGO_COLORS[algo.key]}, transparent)` }} />

                <div className="p-4 space-y-3">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${ALGO_COLORS[algo.key]}20` }}
                    >
                      <algo.icon className="w-4.5 h-4.5" style={{ color: ALGO_COLORS[algo.key] }} />
                    </div>
                    <span
                      className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", algo.pill)}
                    >
                      {algo.optimal ? t('common.yes') : '~Approx'}
                    </span>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{algo.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{algo.desc}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('dashboard.time')}</span>
                      <span className="font-mono font-semibold text-foreground">{algo.complexity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('dashboard.space')}</span>
                      <span className="font-mono text-foreground">{algo.space}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom hover line */}
                <div
                  className="h-px opacity-0 group-hover:opacity-80 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${ALGO_COLORS[algo.key]}, transparent)` }}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
