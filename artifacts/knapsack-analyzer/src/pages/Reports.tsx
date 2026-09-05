import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, FileText, ClipboardList } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const COLORS: Record<string, string> = {
  dp: "hsl(263, 90%, 65%)",
  greedy: "hsl(190, 100%, 50%)",
  backtracking: "hsl(45, 93%, 58%)",
  "branch-bound": "hsl(213, 100%, 60%)",
};

export default function Reports() {
  const { runHistory, clearRunHistory, items, capacity } = useAppContext();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const LABELS: Record<string, string> = {
    dp: t('dashboard.dp'),
    greedy: t('dashboard.greedy'),
    backtracking: t('dashboard.backtracking'),
    "branch-bound": t('dashboard.branchBound'),
  };

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currentDataset: { items, capacity },
      runHistory: runHistory.map((e) => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
        result: { ...e.result, steps: `[${e.result.steps.length} steps — omitted for brevity]` },
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knapsack-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = ["id", "timestamp", "algorithm", "capacity", "numItems", "totalValue", "totalWeight", "stepsCount", "timeMs", "isOptimal"];
    const rows = runHistory.map((e) =>
      [
        e.id,
        e.timestamp.toISOString(),
        e.algorithm,
        e.capacity,
        e.numItems,
        e.result.totalValue,
        e.result.totalWeight,
        e.result.stepsCount,
        e.result.timeMs.toFixed(4),
        e.result.isOptimal,
      ].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knapsack-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t('reports.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={runHistory.length === 0}
            className="border-white/10 text-foreground hover:bg-white/5 text-sm"
            data-testid="btn-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('reports.exportCSV')}
          </Button>
          <Button
            onClick={exportJSON}
            disabled={runHistory.length === 0}
            className="bg-primary hover:bg-primary/90 text-sm"
            data-testid="btn-export-json"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('reports.exportJSON')}
          </Button>
        </div>
      </motion.div>

      {/* Summary stats */}
      {runHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t('reports.totalRuns'), value: runHistory.length },
              { label: t('reports.uniqueAlgos'), value: new Set(runHistory.map((r) => r.algorithm)).size },
              { label: t('reports.bestValue'), value: Math.max(...runHistory.map((r) => r.result.totalValue)) },
              { label: t('reports.avgExecTime'), value: `${(runHistory.reduce((s, r) => s + r.result.timeMs, 0) / runHistory.length).toFixed(3)}ms` },
            ].map((stat, i) => (
              <Card key={i} className="glass-panel">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* History table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              {t('reports.runHistory')} ({runHistory.length})
            </CardTitle>
            {runHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRunHistory}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                data-testid="btn-clear-history"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                {t('reports.clearAll')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {runHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-muted-foreground">{t('reports.noRuns')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('reports.noRunsDesc')}</p>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/visualizer")}
                  className="mt-4 border-white/10 hover:bg-white/5 text-sm"
                  data-testid="btn-goto-visualizer"
                >
                  {t('reports.goToVisualizer')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-white/5">
                      <th className="text-left py-2 pr-4">#</th>
                      <th className="text-left py-2 pr-4">{t('reports.timestamp')}</th>
                      <th className="text-left py-2 pr-4">{t('reports.algorithm')}</th>
                      <th className="text-right py-2 px-4">{t('reports.capacity')}</th>
                      <th className="text-right py-2 px-4">{t('reports.items')}</th>
                      <th className="text-right py-2 px-4">{t('reports.value')}</th>
                      <th className="text-right py-2 px-4">{t('reports.weight')}</th>
                      <th className="text-right py-2 px-4">{t('reports.steps')}</th>
                      <th className="text-right py-2 px-4">{t('reports.time')}</th>
                      <th className="text-right py-2 pl-4">{t('reports.optimal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runHistory.map((entry, i) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        data-testid={`history-row-${entry.id}`}
                      >
                        <td className="py-3 pr-4 text-muted-foreground text-xs font-mono">{runHistory.length - i}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[entry.algorithm] }} />
                            <span className="text-xs">{LABELS[entry.algorithm]}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-mono text-xs">{entry.capacity}</td>
                        <td className="text-right py-3 px-4 font-mono text-xs">{entry.numItems}</td>
                        <td className="text-right py-3 px-4 font-mono font-semibold">{entry.result.totalValue}</td>
                        <td className="text-right py-3 px-4 font-mono text-xs">{entry.result.totalWeight}</td>
                        <td className="text-right py-3 px-4 font-mono text-xs">{entry.result.stepsCount}</td>
                        <td className="text-right py-3 px-4 font-mono text-xs">{entry.result.timeMs.toFixed(3)}ms</td>
                        <td className="text-right py-3 pl-4">
                          <Badge
                            variant={entry.result.isOptimal ? "default" : "secondary"}
                            className="text-xs h-5 px-1.5"
                            style={entry.result.isOptimal ? { background: COLORS[entry.algorithm] + "33", color: COLORS[entry.algorithm], border: "1px solid " + COLORS[entry.algorithm] + "66" } : {}}
                          >
                            {entry.result.isOptimal ? t('reports.yes') : t('reports.no')}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
