import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, SkipForward, SkipBack, Shuffle,
  ChevronRight, Code2, Pencil, Presentation, XCircle,
  TrendingUp, Weight, Layers, Zap, GitBranch, Cpu,
} from "lucide-react";
import { ItemEditor } from "@/components/ItemEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/contexts/AppContext";
import { runDP, runGreedy, runBacktracking, runBranchAndBound, KnapsackResult, Step } from "@/lib/algorithms";
import { cn } from "@/lib/utils";
import { CodePanel } from "@/components/CodePanel";
import { ALGORITHM_CODE } from "@/lib/algorithmCode";
import { useTranslation } from "react-i18next";

const ALGO_META: Record<string, { color: string; icon: typeof Layers; label: string; pill: string }> = {
  dp:            { color: "hsl(263,90%,65%)", icon: Layers,    label: "Dynamic Programming", pill: "algo-pill-dp" },
  greedy:        { color: "hsl(190,100%,50%)", icon: Zap,       label: "Greedy",              pill: "algo-pill-gr" },
  backtracking:  { color: "hsl(45,93%,58%)",   icon: GitBranch, label: "Backtracking",        pill: "algo-pill-bt" },
  "branch-bound":{ color: "hsl(213,100%,60%)", icon: Cpu,       label: "Branch & Bound",      pill: "algo-pill-bb" },
};

const SPEED_MS: Record<string, number> = { slow: 620, medium: 220, fast: 55 };

type AlgoType = "dp" | "greedy" | "backtracking" | "branch-bound";
const DEMO_ALGOS: AlgoType[] = ["dp", "greedy", "backtracking", "branch-bound"];

/* ratio → color gradient */
function ratioGradient(ratio: number) {
  if (ratio >= 7) return "from-emerald-500 to-emerald-600";
  if (ratio >= 4) return "from-cyan-500 to-blue-600";
  if (ratio >= 2) return "from-amber-500 to-orange-600";
  return "from-rose-500 to-red-700";
}
function ratioLabel(ratio: number) {
  if (ratio >= 7) return "text-emerald-400";
  if (ratio >= 4) return "text-cyan-400";
  if (ratio >= 2) return "text-amber-400";
  return "text-rose-400";
}

/* step type → callout class */
function stepCallout(type?: string) {
  if (!type) return "step-msg-skip";
  if (type === "select-item") return "step-msg-select";
  if (type === "fill-cell")   return "step-msg-fill";
  if (type === "prune")       return "step-msg-prune";
  if (type === "check-item")  return "step-msg-check";
  return "step-msg-skip";
}

export default function Visualizer() {
  const {
    items, setItems, capacity, setCapacity,
    selectedAlgorithm, setSelectedAlgorithm,
    animationSpeed, setAnimationSpeed,
    addRunHistory, showDPTable, regenerateDataset,
  } = useAppContext();
  const { t } = useTranslation();

  const [result, setResult] = useState<KnapsackResult | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [numItems, setNumItems] = useState(items.length);
  const [showCode, setShowCode] = useState(false);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);

  const DEMO_NARRATIONS: Record<AlgoType, { title: string; text: string }> = {
    dp:             { title: t("visualizer.demo.dp.title"),            text: t("visualizer.demo.dp.text") },
    greedy:         { title: t("visualizer.demo.greedy.title"),        text: t("visualizer.demo.greedy.text") },
    backtracking:   { title: t("visualizer.demo.backtracking.title"),  text: t("visualizer.demo.backtracking.text") },
    "branch-bound": { title: t("visualizer.demo.bb.title"),            text: t("visualizer.demo.bb.text") },
  };

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAlgorithm = useCallback((alg = selectedAlgorithm) => {
    let res: KnapsackResult;
    if (alg === "dp") res = runDP(items, capacity);
    else if (alg === "greedy") res = runGreedy(items, capacity);
    else if (alg === "backtracking") res = runBacktracking(items, capacity);
    else res = runBranchAndBound(items, capacity);
    setResult(res);
    setCurrentStep(-1);
    setPlaying(false);
    addRunHistory({ id: Date.now().toString(), timestamp: new Date(), capacity, numItems: items.length, algorithm: alg, result: res });
  }, [items, capacity, selectedAlgorithm, addRunHistory]);

  const stopInterval = useCallback(() => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    if (!playing || !result) return;
    stopInterval();
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= result.steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, SPEED_MS[animationSpeed]);
    return stopInterval;
  }, [playing, result, animationSpeed, stopInterval]);

  const handleStart = () => {
    if (!result) runAlgorithm();
    if (result && currentStep >= result.steps.length - 1) setCurrentStep(-1);
    setPlaying(true);
  };
  const handlePause = () => setPlaying(false);
  const handleReset = () => { setPlaying(false); setCurrentStep(-1); };
  const handleStepForward = () => { if (!result) return; setCurrentStep(p => Math.min(p + 1, result.steps.length - 1)); };
  const handleStepBack = () => setCurrentStep(p => Math.max(p - 1, -1));
  const handleGenerate = () => { regenerateDataset(numItems); setResult(null); setCurrentStep(-1); setPlaying(false); };

  const stopDemo = useCallback(() => {
    setDemoMode(false); setPlaying(false);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
  }, []);

  const startDemo = useCallback(() => {
    setAnimationSpeed("medium"); setDemoMode(true); setDemoIdx(0);
  }, [setAnimationSpeed]);

  useEffect(() => {
    if (!demoMode) return;
    const algo = DEMO_ALGOS[demoIdx];
    setSelectedAlgorithm(algo);
    runAlgorithm(algo);
    demoTimeoutRef.current = setTimeout(() => setPlaying(true), 380);
    return () => { if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current); };
  }, [demoIdx, demoMode]); // eslint-disable-line

  useEffect(() => {
    if (!demoMode || playing || !result) return;
    if (currentStep < result.steps.length - 1) return;
    demoTimeoutRef.current = setTimeout(() => {
      const next = demoIdx + 1;
      if (next < DEMO_ALGOS.length) setDemoIdx(next);
      else setDemoMode(false);
    }, 3000);
    return () => { if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current); };
  }, [playing, demoMode, result, currentStep, demoIdx]);

  const currentStepData: Step | null = result && currentStep >= 0 ? result.steps[currentStep] ?? null : null;

  const selectedAtStep = result && currentStep >= 0
    ? (() => {
        const sel = new Set<number>();
        for (let i = 0; i <= currentStep; i++) {
          const s = result.steps[i];
          if (s.type === "select-item" && s.itemIndex !== undefined) sel.add(s.itemIndex - 1);
        }
        return sel;
      })()
    : new Set<number>(result?.selectedItems.map(id => items.findIndex(it => it.id === id)) ?? []);

  const finalSelected = result
    ? new Set<number>(result.selectedItems.map(id => items.findIndex(it => it.id === id)))
    : new Set<number>();

  const displaySelected = currentStep >= 0 ? selectedAtStep : finalSelected;

  const totalWeight = [...displaySelected].reduce((s, i) => s + (items[i]?.weight ?? 0), 0);
  const totalValue  = [...displaySelected].reduce((s, i) => s + (items[i]?.value ?? 0), 0);
  const fillPct = capacity > 0 ? Math.min((totalWeight / capacity) * 100, 100) : 0;
  const isNearFull = fillPct > 85;
  const isWarning  = fillPct > 60;

  const algoMeta = ALGO_META[selectedAlgorithm];
  const dpTableCols = Math.min(capacity, 15);
  const dpHighlightCell = currentStepData?.type === "fill-cell" ? { row: currentStepData.itemIndex, col: currentStepData.capacity } : null;

  return (
    <div className="space-y-4">

      {/* ── Top Control Bar ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel border-white/8">
          <CardContent className="p-3.5">
            <div className="flex flex-wrap items-center gap-3">

              {/* Algorithm pills */}
              <div className="flex gap-1.5">
                {(Object.entries(ALGO_META) as [AlgoType, typeof ALGO_META[string]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedAlgorithm(key); setResult(null); setCurrentStep(-1); }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
                      selectedAlgorithm === key
                        ? cn(meta.pill, "scale-105")
                        : "border-white/8 bg-white/3 text-muted-foreground hover:bg-white/7 hover:text-foreground",
                    )}
                    data-testid={`algo-pill-${key}`}
                  >
                    <meta.icon className="w-3 h-3" />
                    <span className="hidden sm:block">{meta.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-white/10 hidden sm:block" />

              {/* Capacity */}
              <div className="flex items-center gap-2.5 min-w-36">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("visualizer.capacity")} <span className="font-mono font-semibold text-foreground">{capacity}</span>
                </span>
                <Slider min={10} max={100} step={5} value={[capacity]} onValueChange={v => setCapacity(v[0])} className="w-20" data-testid="slider-capacity" />
              </div>

              {/* Num items */}
              <div className="flex items-center gap-2.5 min-w-32">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("visualizer.items")} <span className="font-mono font-semibold text-foreground">{numItems}</span>
                </span>
                <Slider min={3} max={15} step={1} value={[numItems]} onValueChange={v => setNumItems(v[0])} className="w-16" data-testid="slider-num-items" />
              </div>

              {/* Speed */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("visualizer.speed")}</span>
                <Select value={animationSpeed} onValueChange={v => setAnimationSpeed(v as typeof animationSpeed)} data-testid="select-speed">
                  <SelectTrigger className="w-24 bg-muted/40 border-white/10 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">{t("settings.slow")}</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="fast">{t("settings.fast")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <Button variant="outline" onClick={() => setShowItemEditor(true)} className="border-white/10 hover:bg-white/6 h-8 text-xs gap-1.5" data-testid="btn-edit-items">
                  <Pencil className="w-3 h-3" /> {t("visualizer.editItems")}
                </Button>
                <Button variant="outline" onClick={handleGenerate} className="border-white/10 hover:bg-white/6 h-8 text-xs" data-testid="btn-generate">
                  <Shuffle className="w-3 h-3 mr-1.5" /> {t("visualizer.randomize")}
                </Button>
                <Button
                  onClick={demoMode ? stopDemo : startDemo}
                  className={cn("h-8 text-xs gap-1.5",
                    demoMode
                      ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      : "bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-violet-500/20 border-0"
                  )}
                  data-testid="btn-demo"
                >
                  {demoMode
                    ? <><XCircle className="w-3 h-3" /> {t("visualizer.stopDemo")}</>
                    : <><Presentation className="w-3 h-3" /> {t("visualizer.autoDemo")}</>
                  }
                </Button>
                <Button
                  variant={showCode ? "default" : "outline"}
                  onClick={() => setShowCode(v => !v)}
                  className={cn("h-8 text-xs gap-1.5",
                    showCode ? "bg-primary hover:bg-primary/90 glow-primary" : "border-white/10 hover:bg-white/6"
                  )}
                  data-testid="btn-toggle-code"
                >
                  <Code2 className="w-3 h-3" />
                  {showCode ? t("visualizer.hideCode") : t("visualizer.showCode")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Demo Banner ───────────────────────────────────── */}
      <AnimatePresence>
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden rounded-xl border p-4"
            style={{
              borderColor: `${ALGO_META[DEMO_ALGOS[demoIdx]].color}40`,
              background: `${ALGO_META[DEMO_ALGOS[demoIdx]].color}0e`,
            }}
          >
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: ALGO_META[DEMO_ALGOS[demoIdx]].color }} />

            <div className="relative z-10 flex items-start gap-4">
              {/* Progress dots */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ALGO_META[DEMO_ALGOS[demoIdx]].color }}>
                  {demoIdx + 1}
                </div>
                <div className="flex gap-1">
                  {DEMO_ALGOS.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{ background: i === demoIdx ? ALGO_META[DEMO_ALGOS[demoIdx]].color : "rgba(255,255,255,0.15)" }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: ALGO_META[DEMO_ALGOS[demoIdx]].color }}>
                    {t("visualizer.algorithm")} {demoIdx + 1}/{DEMO_ALGOS.length} — {DEMO_NARRATIONS[DEMO_ALGOS[demoIdx]].title}
                  </span>
                  {playing && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      {t("visualizer.runningDot")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{DEMO_NARRATIONS[DEMO_ALGOS[demoIdx]].text}</p>
              </div>
              <button onClick={stopDemo} className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className={cn("gap-4", showCode ? "flex flex-col xl:flex-row" : "grid grid-cols-1 lg:grid-cols-5")}>

        {/* ─ Item list panel ─ */}
        <motion.div
          layout
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={showCode ? "xl:w-60 shrink-0" : "lg:col-span-2"}
        >
          <Card className="glass-panel border-white/8 h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-semibold">{t("visualizer.items")}</CardTitle>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{items.length}</Badge>
                <span className="ml-auto text-[10px] text-muted-foreground hidden sm:block">Ratio = Value÷Weight</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {/* Column header */}
              <div className="grid grid-cols-[1fr_40px_40px_44px] gap-1 px-2.5 pb-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider border-b border-white/5">
                <span>Name</span>
                <span className="text-center">W</span>
                <span className="text-center">V</span>
                <span className="text-center">Ratio</span>
              </div>

              <div className="space-y-1 mt-2 max-h-72 overflow-y-auto pr-1">
                {items.map((item, i) => {
                  const isSelected = displaySelected.has(i);
                  const isConsidering = currentStepData?.itemIndex === i + 1;
                  const ratio = item.value / item.weight;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={cn(
                        "grid grid-cols-[1fr_40px_40px_44px] gap-1 items-center px-2.5 py-2 rounded-lg border text-xs transition-all duration-250",
                        isSelected
                          ? "border-primary/30 bg-primary/8 text-foreground"
                          : isConsidering
                          ? "border-amber-500/35 bg-amber-500/8 text-foreground"
                          : "border-white/5 bg-white/2 text-muted-foreground hover:bg-white/4",
                      )}
                      data-testid={`item-row-${item.id}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />}
                        {isConsidering && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />}
                        {!isSelected && !isConsidering && <span className="w-1.5 h-1.5 rounded-full bg-white/15 shrink-0" />}
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <span className="text-center font-mono text-[11px]">{item.weight}</span>
                      <span className={cn("text-center font-mono text-[11px] font-semibold", isSelected ? "text-primary" : "text-foreground")}>{item.value}</span>
                      <div className="flex items-center justify-end gap-1">
                        <span className={cn("font-mono text-[11px] font-bold", ratioLabel(ratio))}>
                          {ratio.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Ratio legend */}
              <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-1">
                {[
                  { color: "bg-emerald-500", label: "≥7 Excellent" },
                  { color: "bg-cyan-500",    label: "4-7 Good" },
                  { color: "bg-amber-500",   label: "2-4 Fair" },
                  { color: "bg-rose-500",    label: "<2 Poor" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                    <span className={cn("w-2 h-2 rounded-sm shrink-0", l.color)} />
                    {l.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─ Code panel (conditional) ─ */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="flex-1 min-w-0"
              style={{ minHeight: 440 }}
            >
              <CodePanel
                codeDef={ALGORITHM_CODE[selectedAlgorithm]}
                activeLine={currentStepData ? ALGORITHM_CODE[selectedAlgorithm].getHighlightLine(currentStepData.type, currentStepData.message) : null}
                stepMessage={currentStepData?.message}
                stepType={currentStepData?.type}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─ Knapsack container ─ */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={showCode ? "xl:w-80 shrink-0" : "lg:col-span-3"}
        >
          <Card className="glass-panel border-white/8 h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  🎒 {t("visualizer.knapsackVisualization")}
                </CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Weight className="w-3 h-3" />
                    <span className="font-mono font-semibold text-foreground">{totalWeight}</span>
                    <span className="text-muted-foreground/60">/{capacity}</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-mono font-semibold" style={{ color: algoMeta.color }}>{totalValue}</span>
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 space-y-3">
              {/* ── Capacity bar ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{t("visualizer.capacity")}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono font-bold transition-colors duration-300"
                      style={{ color: isNearFull ? "hsl(0,84%,65%)" : isWarning ? "hsl(45,93%,60%)" : "hsl(142,71%,52%)" }}
                    >
                      {fillPct.toFixed(0)}%
                    </span>
                    {isNearFull && (
                      <Badge className="text-[9px] h-3.5 px-1 bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse">
                        Near Full
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Segmented bar */}
                <div className="relative h-3 rounded-full overflow-hidden bg-muted/40 border border-white/5">
                  {/* Segment dividers */}
                  {[25, 50, 75].map(p => (
                    <div key={p} className="absolute inset-y-0 border-l border-background/40" style={{ left: `${p}%` }} />
                  ))}
                  {/* Fill */}
                  <motion.div
                    className={cn("absolute inset-y-0 left-0 rounded-full",
                      isNearFull ? "cap-bar-danger" : isWarning ? "cap-bar-warn" : "cap-bar-safe"
                    )}
                    animate={{
                      width: `${fillPct}%`,
                      ...(isNearFull && fillPct > 95 ? { opacity: [1, 0.7, 1] } : {}),
                    }}
                    transition={{
                      width: { duration: 0.45, ease: "easeOut" },
                      opacity: { duration: 0.6, repeat: Infinity },
                    }}
                  />
                  {/* Shimmer */}
                  <div className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                      animation: "shimmer-slide 2.5s linear infinite",
                    }} />
                </div>

                {/* Tick labels */}
                <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                  <span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              {/* ── Knapsack visual container ── */}
              <div className="relative">
                {/* Bag mouth / opening */}
                <div
                  className="mx-5 h-4 rounded-t-2xl border-x border-t"
                  style={{ borderColor: `${algoMeta.color}30`, background: `${algoMeta.color}08` }}
                />
                {/* Bag strap hints */}
                <div className="absolute top-0 left-7 w-3 h-4 rounded-t-sm border-x border-t border-white/10 bg-white/3" />
                <div className="absolute top-0 right-7 w-3 h-4 rounded-t-sm border-x border-t border-white/10 bg-white/3" />

                {/* Main bag body */}
                <div
                  className="relative rounded-b-2xl rounded-tr-2xl overflow-hidden border"
                  style={{
                    borderColor: `${algoMeta.color}25`,
                    background: `linear-gradient(180deg, ${algoMeta.color}06, ${algoMeta.color}03)`,
                    minHeight: "160px",
                  }}
                >
                  {/* Fill level */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 pointer-events-none"
                    animate={{ height: `${Math.max(fillPct, 4)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                      background: isNearFull
                        ? "linear-gradient(to top, rgba(239,68,68,0.18), transparent)"
                        : isWarning
                        ? "linear-gradient(to top, rgba(245,158,11,0.15), transparent)"
                        : "linear-gradient(to top, rgba(34,197,94,0.12), transparent)",
                    }}
                  />

                  {/* Ruler lines */}
                  {[25, 50, 75].map(p => (
                    <div
                      key={p}
                      className="absolute inset-x-0 border-t border-dashed border-white/5 flex items-center"
                      style={{ bottom: `${p}%` }}
                    >
                      <span className="text-[8px] text-white/15 pl-2 leading-none font-mono">{p}%</span>
                    </div>
                  ))}

                  {/* Items inside */}
                  <div className="relative z-10 p-3 flex flex-wrap gap-2 content-start items-start">
                    <AnimatePresence>
                      {items.map((item, i) => {
                        if (!displaySelected.has(i)) return null;
                        const ratio = item.value / item.weight;
                        const grad = ratioGradient(ratio);

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.25, y: -90, rotate: -25 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.2, y: 30, rotate: 18 }}
                            transition={{ type: "spring", stiffness: 480, damping: 28, mass: 0.6 }}
                            whileHover={{ scale: 1.07, zIndex: 20, rotate: 1 }}
                            className={cn(
                              "bg-gradient-to-br text-white rounded-xl flex flex-col items-center justify-center text-center p-2 border border-white/20 shadow-lg cursor-default select-none relative overflow-hidden",
                              grad,
                            )}
                            style={{
                              width: `${Math.max(item.weight * 6, 52)}px`,
                              height: `${Math.max(item.value * 1.5, 48)}px`,
                            }}
                            data-testid={`knapsack-item-${item.id}`}
                          >
                            {/* Inner shine */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/12 rounded-t-xl pointer-events-none" />
                            <p className="text-[10px] font-bold leading-tight relative z-10">
                              {item.name.length > 7 ? item.name.slice(0, 6) + "…" : item.name}
                            </p>
                            <p className="text-[9px] text-white/75 font-mono mt-0.5 relative z-10">V:{item.value}</p>
                          </motion.div>
                        );
                      })}

                      {/* Empty state */}
                      {displaySelected.size === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full flex flex-col items-center justify-center py-8 text-center gap-2.5"
                        >
                          <motion.div
                            className="text-5xl opacity-30"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            🎒
                          </motion.div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">{t("visualizer.pressRunHint")}</p>
                            {!demoMode && <p className="text-[10px] text-muted-foreground/60">{t("visualizer.autoDemoHint")}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── Step message callout ── */}
              <AnimatePresence mode="wait">
                {currentStepData && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn("flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs", stepCallout(currentStepData.type))}
                  >
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="font-mono leading-relaxed flex-1">{currentStepData.message}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                      {currentStep + 1}/{result?.steps.length}
                    </Badge>
                  </motion.div>
                )}
                {!currentStepData && result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{ background: `${algoMeta.color}12`, border: `1px solid ${algoMeta.color}30` }}
                  >
                    <span className="text-xs font-semibold" style={{ color: algoMeta.color }}>
                      {currentStep === -1
                        ? t("visualizer.readyMsg", { steps: result.steps.length })
                        : t("visualizer.completeMsg", { value: result.totalValue })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Result summary badges ── */}
              {result && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Value",   val: result.totalValue,           color: algoMeta.color },
                    { label: "Weight",  val: `${result.totalWeight}/${capacity}`, color: "hsl(215,20%,65%)" },
                    { label: "Steps",   val: result.stepsCount,           color: "hsl(215,20%,65%)" },
                    { label: "Time",    val: `${result.timeMs.toFixed(2)}ms`, color: "hsl(215,20%,65%)" },
                  ].map(b => (
                    <div key={b.label} className="px-3 py-2 rounded-lg bg-white/3 border border-white/7 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{b.label}</p>
                      <p className="text-sm font-bold data-mono mt-0.5" style={{ color: b.color }}>{b.val}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Playback Controls ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <Card className="glass-panel border-white/8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">

              {/* Transport */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  data-testid="btn-reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStepBack}
                  disabled={currentStep <= -1}
                  className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  data-testid="btn-step-back"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play/Pause — hero button */}
                {playing ? (
                  <button
                    onClick={handlePause}
                    className="h-10 px-6 rounded-xl font-semibold text-sm text-white flex items-center gap-2 shadow-lg transition-all hover:opacity-90 active:scale-95 glow-primary"
                    style={{ background: `linear-gradient(135deg, ${algoMeta.color}, ${algoMeta.color}bb)` }}
                    data-testid="btn-pause"
                  >
                    <Pause className="w-4 h-4" />
                    {t("visualizer.pause")}
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="h-10 px-6 rounded-xl font-semibold text-sm text-white flex items-center gap-2 shadow-lg transition-all hover:opacity-90 active:scale-95 glow-primary"
                    style={{ background: `linear-gradient(135deg, ${algoMeta.color}, ${algoMeta.color}bb)` }}
                    data-testid="btn-play"
                  >
                    <Play className="w-4 h-4" />
                    {result
                      ? currentStep >= result.steps.length - 1
                        ? t("visualizer.restart")
                        : t("visualizer.play")
                      : t("visualizer.run")
                    }
                  </button>
                )}

                <button
                  onClick={handleStepForward}
                  disabled={!result || currentStep >= result.steps.length - 1}
                  className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  data-testid="btn-step-forward"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Progress track */}
              {result && (
                <div className="flex items-center gap-3 flex-1 max-w-72">
                  <span className="text-xs text-muted-foreground font-mono w-12 text-right tabular-nums">
                    {currentStep + 1}
                  </span>
                  <div className="relative flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: algoMeta.color }}
                      animate={{ width: `${((currentStep + 1) / result.steps.length) * 100}%` }}
                      transition={{ duration: 0.15 }}
                    />
                    <div className="absolute inset-0 opacity-20" style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                      animation: "shimmer-slide 2s linear infinite",
                    }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-12 tabular-nums">
                    {result.steps.length}
                  </span>
                </div>
              )}

              {/* Algo label */}
              <div
                className={cn("hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold", algoMeta.pill)}
              >
                <algoMeta.icon className="w-3.5 h-3.5" />
                {algoMeta.label}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Item Editor modal ── */}
      <ItemEditor open={showItemEditor} onClose={() => setShowItemEditor(false)} />

      {/* ── DP Table ── */}
      {showDPTable && selectedAlgorithm === "dp" && result && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <Card className="glass-panel border-white/8 overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold">
                {t("visualizer.dpTableLabel")}
                <span className="text-muted-foreground font-normal ml-2 text-[10px]">
                  rows = items · cols = weight 0..{dpTableCols}
                </span>
              </CardTitle>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/50" />
                {t("visualizer.currentCell")}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 overflow-x-auto">
              <DPTable
                items={items}
                capacity={capacity}
                result={result}
                currentStep={currentStep}
                dpTableCols={dpTableCols}
                highlight={dpHighlightCell}
                algoColor={algoMeta.color}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function DPTable({ items, capacity, result, currentStep, dpTableCols, highlight, algoColor }: {
  items: { id: number; name: string; weight: number; value: number }[];
  capacity: number;
  result: KnapsackResult;
  currentStep: number;
  dpTableCols: number;
  highlight: { row?: number; col?: number } | null;
  algoColor: string;
}) {
  const n = items.length;
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(dpTableCols + 1).fill(0));

  for (let i = 0; i <= currentStep && i < result.steps.length; i++) {
    const s = result.steps[i];
    if (s.type === "fill-cell" && s.itemIndex !== undefined && s.capacity !== undefined && s.value !== undefined) {
      if (s.itemIndex <= n && s.capacity <= dpTableCols) dp[s.itemIndex][s.capacity] = s.value;
    }
  }

  return (
    <table className="text-xs border-collapse min-w-0">
      <thead>
        <tr>
          <th className="px-2.5 py-1.5 text-muted-foreground font-medium border border-white/5 bg-muted/20 text-left rounded-tl-lg whitespace-nowrap">Item \ W</th>
          {Array.from({ length: dpTableCols + 1 }, (_, c) => (
            <th key={c} className="px-2 py-1.5 text-muted-foreground font-mono font-normal border border-white/5 bg-muted/20 text-center text-[10px]">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: n + 1 }, (_, row) => (
          <tr key={row}>
            <td className="px-2.5 py-1.5 border border-white/5 bg-muted/10 text-muted-foreground font-medium whitespace-nowrap">
              {row === 0 ? "∅" : (() => { const nm = items[row - 1]?.name ?? `${row}`; return nm.length > 5 ? nm.slice(0, 4) + "…" : nm; })()}
            </td>
            {Array.from({ length: dpTableCols + 1 }, (_, col) => {
              const isHl = highlight?.row === row && highlight?.col === col;
              const val = dp[row][col];
              return (
                <motion.td
                  key={col}
                  className={cn(
                    "px-2 py-1.5 border border-white/5 text-center font-mono text-[11px] transition-colors duration-200",
                    isHl ? "font-bold" : val > 0 ? "text-foreground" : "text-white/20",
                  )}
                  style={isHl ? { background: `${algoColor}28`, color: algoColor } : {}}
                  animate={isHl ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.28 }}
                >
                  {val || "·"}
                </motion.td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
