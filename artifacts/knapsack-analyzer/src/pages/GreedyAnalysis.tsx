import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/contexts/AppContext";
import { runGreedyVariants, runFractionalKnapsack, runDP, REAL_WORLD_SCENARIOS, type GreedyVariantResult, type FractionalResult, type Scenario } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import { TrendingUp, Zap, Package, Scale, ChevronRight, CheckCircle2, XCircle, Scissors } from "lucide-react";
import { useTranslation } from "react-i18next";

const VARIANT_COLORS = [
  "hsl(263, 90%, 65%)",
  "hsl(190, 100%, 50%)",
  "hsl(45, 93%, 58%)",
  "hsl(213, 100%, 60%)",
];

export default function GreedyAnalysis() {
  const { items, capacity } = useAppContext();
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState<Scenario>(REAL_WORLD_SCENARIOS[0]);

  const STRATEGY_DESC: Record<string, string> = {
    ratio:        t('greedy.strategyRatio'),
    value:        t('greedy.strategyValue'),
    "weight-asc": t('greedy.strategyWeightAsc'),
    "weight-desc": t('greedy.strategyWeightDesc'),
  };

  const variants = useMemo(() => runGreedyVariants(items, capacity), [items, capacity]);
  const fractional = useMemo(() => runFractionalKnapsack(items, capacity), [items, capacity]);
  const dpResult = useMemo(() => runDP(items, capacity), [items, capacity]);

  const scenarioVariants = useMemo(() => runGreedyVariants(activeScenario.items, activeScenario.capacity), [activeScenario]);
  const scenarioDP = useMemo(() => runDP(activeScenario.items, activeScenario.capacity), [activeScenario]);
  const scenarioFrac = useMemo(() => runFractionalKnapsack(activeScenario.items, activeScenario.capacity), [activeScenario]);

  const bestVariant = variants.reduce((a, b) => a.totalValue > b.totalValue ? a : b);

  const greedySteps = t('greedy.greedySteps', { returnObjects: true }) as string[];
  const useGreedyPros = t('greedy.useGreedyPros', { returnObjects: true }) as string[];
  const useGreedyCons = t('greedy.useGreedyCons', { returnObjects: true }) as string[];
  const useFractionalPros = t('greedy.useFractionalPros', { returnObjects: true }) as string[];
  const useFractionalCons = t('greedy.useFractionalCons', { returnObjects: true }) as string[];
  const useDPPros = t('greedy.useDPPros', { returnObjects: true }) as string[];
  const useDPCons = t('greedy.useDPCons', { returnObjects: true }) as string[];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('greedy.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t('greedy.subtitle')}</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            {t('greedy.dpOptimalBadge')} {dpResult.totalValue}
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="variants" className="space-y-5">
        <TabsList className="bg-muted/30 border border-white/8">
          <TabsTrigger value="variants" className="text-xs gap-1.5"><Scale className="w-3.5 h-3.5" />{t('greedy.tabVariants')}</TabsTrigger>
          <TabsTrigger value="fractional" className="text-xs gap-1.5"><Scissors className="w-3.5 h-3.5" />{t('greedy.tabFractional')}</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-xs gap-1.5"><Package className="w-3.5 h-3.5" />{t('greedy.tabRealWorld')}</TabsTrigger>
          <TabsTrigger value="approx" className="text-xs gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{t('greedy.tabApprox')}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Greedy Variants ── */}
        <TabsContent value="variants" className="space-y-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {variants.map((v, i) => (
              <VariantCard key={v.strategy} variant={v} color={VARIANT_COLORS[i]} dpOptimal={dpResult.totalValue} isBest={v.strategy === bestVariant.strategy} index={i} totalValueLabel={t('greedy.totalValue')} />
            ))}
          </motion.div>

          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">{t('greedy.valueComparisonTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  ...variants.map((v, i) => ({ name: v.label.split(' ')[0], value: v.totalValue, fill: VARIANT_COLORS[i] })),
                  { name: 'DP Optimal', value: dpResult.totalValue, fill: 'hsl(142, 71%, 45%)' },
                ]} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(222 50% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {[...variants.map((_, i) => VARIANT_COLORS[i]), 'hsl(142, 71%, 45%)'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">{t('greedy.strategyDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={v.strategy} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/2 border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: VARIANT_COLORS[i] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{v.label}</span>
                        {v.strategy === bestVariant.strategy && <Badge className="text-[10px] h-4 bg-primary/20 text-primary border-primary/30">{t('greedy.bestGreedy')}</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{STRATEGY_DESC[v.strategy]}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                      <span className="text-muted-foreground">V: <span className="text-foreground font-semibold">{v.totalValue}</span></span>
                      <span className="text-muted-foreground">W: <span className="text-foreground">{v.totalWeight}/{capacity}</span></span>
                      <ApproxBadge ratio={v.approximationRatio} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-emerald-400">{t('greedy.dpReference')}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t('greedy.dpReferenceDesc')}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <span className="text-muted-foreground">V: <span className="text-emerald-400 font-semibold">{dpResult.totalValue}</span></span>
                    <span className="text-muted-foreground">W: <span className="text-foreground">{dpResult.totalWeight}/{capacity}</span></span>
                    <Badge className="text-[10px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">100%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Fractional Knapsack ── */}
        <TabsContent value="fractional" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-panel h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                      {t('greedy.fractionalTitle')}
                    </CardTitle>
                    <Badge className="text-[10px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{t('greedy.fractionalOptimal')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 leading-relaxed">
                    {t('greedy.fractionalExplain')}
                  </div>

                  {/* Capacity bar */}
                  <div className="space-y-1">
                    <div className="relative h-5 rounded-full overflow-hidden bg-muted/40 border border-white/10">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(fractional.totalWeight / capacity) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{t('greedy.weightUsed')} {fractional.totalWeight.toFixed(1)}/{capacity}</span>
                      <span className="text-cyan-400">{t('greedy.totalValueLabel')} {fractional.totalValue.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Item rows */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {fractional.items.filter(it => it.fractionTaken > 0).map(item => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground font-medium">{item.name}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            {item.fractionTaken < 1 ? (
                              <Badge className="text-[10px] h-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                                {(item.fractionTaken * 100).toFixed(0)}% taken
                              </Badge>
                            ) : (
                              <Badge className="text-[10px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{t('greedy.full')}</Badge>
                            )}
                            <span className="text-muted-foreground">+{item.valueTaken.toFixed(1)} val</span>
                          </div>
                        </div>
                        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: item.fractionTaken < 1 ? 'hsl(45,93%,58%)' : 'hsl(190,100%,50%)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.fractionTaken * 100}%` }}
                            transition={{ duration: 0.5, delay: item.id * 0.05 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-panel h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">{t('greedy.fractionalVsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t('greedy.fractionalTitle'), value: fractional.totalValue.toFixed(1), sub: "Optimal — greedy works!", color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
                      { label: "0/1 DP Optimal", value: dpResult.totalValue.toString(), sub: "Optimal — but needs DP", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
                      { label: "0/1 Greedy (ratio)", value: variants.find(v => v.strategy === 'ratio')?.totalValue.toString() ?? '-', sub: "Approximate only", color: "text-primary", border: "border-primary/20", bg: "bg-primary/10" },
                      { label: "Greedy Advantage", value: `+${(fractional.totalValue - dpResult.totalValue).toFixed(1)}`, sub: "Extra value from fractions", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
                    ].map(stat => (
                      <div key={stat.label} className={cn("rounded-lg p-3 border", stat.border, stat.bg)}>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        <p className={cn("text-lg font-bold font-mono mt-0.5", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground font-medium">{t('greedy.whyGreedyWorks')}</p>
                    {greedySteps.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 text-muted-foreground">
                        <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                        {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Real-World Scenarios ── */}
        <TabsContent value="scenarios" className="space-y-5">
          <div className="flex gap-3">
            {REAL_WORLD_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                className={cn(
                  "flex-1 p-3 rounded-xl border text-left transition-all duration-200",
                  activeScenario.id === scenario.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/8 bg-white/2 hover:bg-white/5"
                )}
              >
                <div className="text-xl mb-1">{scenario.icon}</div>
                <p className="text-xs font-semibold text-foreground">{scenario.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{scenario.description}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  {activeScenario.icon} {t('greedy.availableItems')}
                  <Badge variant="secondary" className="text-xs">{activeScenario.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1.5">
                  {activeScenario.items.map(item => {
                    const bestPick = scenarioVariants[0].selectedItems.includes(item.id);
                    const dpPick = scenarioDP.selectedItems.includes(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/2 border border-white/5 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
                          <span>{item.weight}{activeScenario.capacityUnit}</span>
                          <span className="text-foreground font-semibold">{item.value}v</span>
                          <span className="text-cyan-400">{(item.value/item.weight).toFixed(1)}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {bestPick ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <XCircle className="w-3 h-3 text-white/20" />}
                          {dpPick ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-white/20" />}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-3 pt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-primary" />Greedy</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />DP</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">{t('greedy.algoResults')} {activeScenario.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: scenarioVariants[0].label.split(' ')[0] + ' Greedy', value: scenarioVariants[0].totalValue, color: 'text-primary', pct: scenarioVariants[0].approximationRatio },
                    { label: t('greedy.bestValueFirst'), value: scenarioVariants[1].totalValue, color: 'text-cyan-400', pct: scenarioVariants[1].approximationRatio },
                    { label: t('greedy.fractionalGreedy'), value: scenarioFrac.totalValue.toFixed(1), color: 'text-amber-400', pct: 100 + ((scenarioFrac.totalValue - scenarioDP.totalValue) / scenarioDP.totalValue * 100) },
                    { label: t('greedy.dpOptimalLabel'), value: scenarioDP.totalValue, color: 'text-emerald-400', pct: 100 },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-white/2 border border-white/5">
                      <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                      <p className={cn("text-base font-bold font-mono mt-1", stat.color)}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{Number(stat.pct).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={scenarioVariants.map((v, i) => ({ name: ['Ratio', 'Value', 'Light', 'Heavy'][i], value: v.totalValue, fill: VARIANT_COLORS[i] })).concat([{ name: 'DP', value: scenarioDP.totalValue, fill: 'hsl(142,71%,45%)' }])} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(222 50% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {[...VARIANT_COLORS, 'hsl(142,71%,45%)'].map((c, i) => <Cell key={i} fill={c} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="p-3 rounded-lg bg-muted/20 border border-white/5 text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">{t('greedy.insight')} </span>
                  {scenarioVariants[0].approximationRatio >= 95
                    ? t('greedy.insightGood', { pct: scenarioVariants[0].approximationRatio.toFixed(1) })
                    : t('greedy.insightGap', { pct: scenarioVariants[0].approximationRatio.toFixed(1), gap: scenarioDP.totalValue - scenarioVariants[0].totalValue })
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Approximation Ratio ── */}
        <TabsContent value="approx" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  {t('greedy.approxQualityTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={v.strategy} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{v.label.split(' ')[0]}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-foreground">{v.totalValue}</span>
                          <ApproxBadge ratio={v.approximationRatio} />
                        </div>
                      </div>
                      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ background: VARIANT_COLORS[i] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${v.approximationRatio}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-[9px] font-mono text-white/70">{v.approximationRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400">{t('greedy.dpOptimalLabel')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">{dpResult.totalValue}</span>
                        <Badge className="text-[10px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">100%</Badge>
                      </div>
                    </div>
                    <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">{t('greedy.whenToUseTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {[
                  {
                    title: t('greedy.useGreedyTitle'),
                    when: t('greedy.useGreedyWhen'),
                    pros: useGreedyPros,
                    cons: useGreedyCons,
                    color: "border-primary/20 bg-primary/5",
                    titleColor: "text-primary",
                  },
                  {
                    title: t('greedy.useFractionalTitle'),
                    when: t('greedy.useFractionalWhen'),
                    pros: useFractionalPros,
                    cons: useFractionalCons,
                    color: "border-cyan-500/20 bg-cyan-500/5",
                    titleColor: "text-cyan-400",
                  },
                  {
                    title: t('greedy.useDPTitle'),
                    when: t('greedy.useDPWhen'),
                    pros: useDPPros,
                    cons: useDPCons,
                    color: "border-emerald-500/20 bg-emerald-500/5",
                    titleColor: "text-emerald-400",
                  },
                ].map(item => (
                  <div key={item.title} className={cn("p-3 rounded-lg border", item.color)}>
                    <p className={cn("text-xs font-semibold", item.titleColor)}>{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.when}</p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex-1">
                        {item.pros.map(p => <p key={p} className="text-[10px] text-emerald-400 flex items-center gap-1"><span>+</span>{p}</p>)}
                      </div>
                      <div className="flex-1">
                        {item.cons.map(c => <p key={c} className="text-[10px] text-red-400 flex items-center gap-1"><span>−</span>{c}</p>)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VariantCard({ variant, color, dpOptimal, isBest, index, totalValueLabel }: { variant: GreedyVariantResult; color: string; dpOptimal: number; isBest: boolean; index: number; totalValueLabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Card className={cn("glass-panel h-full relative overflow-hidden", isBest && "ring-1 ring-primary/30")}>
        {isBest && <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">BEST</div>}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs font-semibold text-foreground leading-tight">{variant.label}</span>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold font-mono" style={{ color }}>{variant.totalValue}</p>
            <p className="text-[11px] text-muted-foreground">{totalValueLabel}</p>
          </div>

          <div className="space-y-1">
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${variant.approximationRatio}%` }} transition={{ duration: 0.8, delay: index * 0.1 }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{variant.approximationRatio.toFixed(1)}% of optimal</span>
              <span>{variant.totalWeight}/{dpOptimal > 0 ? Math.round(dpOptimal) : '-'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="p-1.5 rounded bg-white/3 text-center">
              <p className="text-muted-foreground">Items</p>
              <p className="font-mono font-semibold text-foreground">{variant.itemsChosen}</p>
            </div>
            <div className="p-1.5 rounded bg-white/3 text-center">
              <p className="text-muted-foreground">Weight</p>
              <p className="font-mono font-semibold text-foreground">{variant.totalWeight}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ApproxBadge({ ratio }: { ratio: number }) {
  const color = ratio >= 98 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : ratio >= 90 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-red-500/20 text-red-400 border-red-500/30";
  return <Badge className={cn("text-[10px] h-4 border", color)}>{ratio.toFixed(1)}%</Badge>;
}
