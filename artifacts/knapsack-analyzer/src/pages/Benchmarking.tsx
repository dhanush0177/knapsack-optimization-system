import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Check, X, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/contexts/AppContext";
import { runDP, runGreedy, runBacktracking, runBranchAndBound, generateDataset, KnapsackResult } from "@/lib/algorithms";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { useTranslation } from "react-i18next";

const COLORS: Record<string, string> = {
  dp: "hsl(263, 90%, 65%)",
  greedy: "hsl(190, 100%, 50%)",
  backtracking: "hsl(45, 93%, 58%)",
  "branch-bound": "hsl(213, 100%, 60%)",
};

type AlgoKey = "dp" | "greedy" | "backtracking" | "branch-bound";

interface BenchResults {
  dp: KnapsackResult;
  greedy: KnapsackResult;
  backtracking: KnapsackResult;
  "branch-bound": KnapsackResult;
}

export default function Benchmarking() {
  const { capacity } = useAppContext();
  const { t } = useTranslation();
  const [itemCount, setItemCount] = useState("8");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BenchResults | null>(null);

  const LABELS: Record<string, string> = {
    dp: t('dashboard.dp'),
    greedy: t('dashboard.greedy'),
    backtracking: t('dashboard.backtracking'),
    "branch-bound": t('dashboard.branchBound'),
  };

  const runBenchmark = async () => {
    setRunning(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 400));
    const dataset = generateDataset(Number(itemCount));
    const cap = capacity;
    const res: BenchResults = {
      dp: runDP(dataset, cap),
      greedy: runGreedy(dataset, cap),
      backtracking: runBacktracking(dataset, Math.min(Number(itemCount), 14) <= 14 ? cap : cap),
      "branch-bound": runBranchAndBound(dataset, cap),
    };
    setResults(res);
    setRunning(false);
  };

  const optimalValue = results ? Math.max(...Object.values(results).map((r) => r.totalValue)) : 0;

  const barData = results
    ? (Object.keys(results) as AlgoKey[]).map((key) => ({
        name: LABELS[key],
        shortName: key === "branch-bound" ? "B&B" : key === "backtracking" ? "BT" : key === "greedy" ? "Greedy" : "DP",
        timeMs: Number(results[key].timeMs.toFixed(4)),
        value: results[key].totalValue,
        steps: results[key].stepsCount,
        key,
      }))
    : [];

  const radarData = results
    ? [
        { metric: "Optimality", dp: 100, greedy: results.greedy.totalValue / optimalValue * 100, backtracking: 100, bb: 100 },
        { metric: "Speed", dp: 80, greedy: 100, backtracking: 20, bb: 60 },
        { metric: "Memory", dp: 40, greedy: 100, backtracking: 85, bb: 75 },
        { metric: "Scalability", dp: 85, greedy: 100, backtracking: 10, bb: 50 },
        { metric: "Simplicity", dp: 65, greedy: 100, backtracking: 55, bb: 30 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel">
          <CardContent className="p-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t('benchmark.datasetSize')}</span>
              <Select value={itemCount} onValueChange={setItemCount} data-testid="select-item-count">
                <SelectTrigger className="w-28 bg-muted/40 border-white/10 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "8", "10", "12", "14"].map((n) => (
                    <SelectItem key={n} value={n} data-testid={`item-count-${n}`}>
                      {t('benchmark.nItems', { n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runBenchmark}
              disabled={running}
              className="bg-primary hover:bg-primary/90 glow-primary"
              data-testid="btn-run-benchmark"
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('benchmark.running')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {t('benchmark.runBenchmark')}
                </span>
              )}
            </Button>
            {results && (
              <span className="text-xs text-muted-foreground ml-auto">
                {t('benchmark.benchmarkedMsg', { n: itemCount, cap: capacity })}
              </span>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {!results && !running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-primary">
            <BarChart2 className="w-7 h-7 text-primary" />
          </div>
          <p className="text-lg font-semibold">{t('benchmark.readyTitle')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('benchmark.readyDesc')}</p>
        </motion.div>
      )}

      {running && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex gap-2">
            {["dp", "greedy", "backtracking", "branch-bound"].map((k, i) => (
              <motion.div
                key={k}
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS[k] }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t('benchmark.runningAll')}</p>
        </div>
      )}

      {results && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Result cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(results) as AlgoKey[]).map((key, i) => {
              const r = results[key];
              const isOptimal = r.totalValue === optimalValue;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  data-testid={`result-card-${key}`}
                >
                  <Card className="glass-panel overflow-hidden">
                    <div className="h-1" style={{ background: COLORS[key] }} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{LABELS[key]}</p>
                          <p className="text-2xl font-bold font-mono mt-0.5">{r.totalValue}</p>
                        </div>
                        {isOptimal ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/20 text-success border border-success/30">
                            <Check className="w-3 h-3" /> {t('benchmark.optimal')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning border border-warning/30">
                            <X className="w-3 h-3" /> {t('benchmark.subOptimal')}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>{t('benchmark.weight')}</span>
                          <span className="font-mono text-foreground">{r.totalWeight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('benchmark.steps')}</span>
                          <span className="font-mono text-foreground">{r.stepsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('benchmark.time')}</span>
                          <span className="font-mono text-foreground">{r.timeMs.toFixed(3)}ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('benchmark.execTimeChart')}</CardTitle>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 12, bottom: 4, left: -20 }}>
                    <XAxis dataKey="shortName" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(215 40% 9%)", border: "1px solid hsl(215 30% 15%)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v}ms`, "Time"]}
                    />
                    <Bar dataKey="timeMs" radius={[4, 4, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.key} fill={COLORS[entry.key]} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('benchmark.multiDimChart')}</CardTitle>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(215 30% 15%)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} />
                    <Radar name="DP" dataKey="dp" stroke={COLORS.dp} fill={COLORS.dp} fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Greedy" dataKey="greedy" stroke={COLORS.greedy} fill={COLORS.greedy} fillOpacity={0.1} strokeWidth={1.5} />
                    <Tooltip
                      contentStyle={{ background: "hsl(215 40% 9%)", border: "1px solid hsl(215 30% 15%)", borderRadius: 8, fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed table */}
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('benchmark.detailedResults')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-white/5">
                      <th className="text-left py-2 pr-4">{t('benchmark.algorithm')}</th>
                      <th className="text-right py-2 px-4">{t('benchmark.totalValue')}</th>
                      <th className="text-right py-2 px-4">{t('benchmark.weightUsed')}</th>
                      <th className="text-right py-2 px-4">{t('benchmark.steps')}</th>
                      <th className="text-right py-2 px-4">{t('benchmark.execTime')}</th>
                      <th className="text-right py-2 px-4">{t('benchmark.itemsSelected')}</th>
                      <th className="text-right py-2 pl-4">{t('benchmark.optimal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(results) as AlgoKey[]).map((key) => {
                      const r = results[key];
                      return (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`table-row-${key}`}>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[key] }} />
                              <span className="font-medium">{LABELS[key]}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-mono font-semibold">{r.totalValue}</td>
                          <td className="text-right py-3 px-4 font-mono">{r.totalWeight}</td>
                          <td className="text-right py-3 px-4 font-mono">{r.stepsCount}</td>
                          <td className="text-right py-3 px-4 font-mono">{r.timeMs.toFixed(4)}ms</td>
                          <td className="text-right py-3 px-4 font-mono">{r.selectedItems.length}</td>
                          <td className="text-right py-3 pl-4">
                            <Badge variant={r.isOptimal ? "default" : "secondary"} className="text-xs" style={r.isOptimal ? { background: COLORS[key] + "33", color: COLORS[key], border: "1px solid " + COLORS[key] + "66" } : {}}>
                              {r.isOptimal ? t('benchmark.yes') : t('benchmark.no')}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
