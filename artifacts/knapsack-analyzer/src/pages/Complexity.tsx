import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useTranslation } from "react-i18next";

const COLORS = {
  dp: "hsl(263, 90%, 65%)",
  greedy: "hsl(190, 100%, 50%)",
  backtracking: "hsl(45, 93%, 58%)",
  bb: "hsl(213, 100%, 60%)",
  nlogn: "hsl(142, 71%, 45%)",
  exponential: "hsl(0, 84%, 60%)",
};

const growthData = Array.from({ length: 12 }, (_, i) => {
  const n = i + 2;
  return {
    n,
    "n·W (DP)": n * 50,
    "n log n (Greedy)": Math.round(n * Math.log2(n) * 10) / 10,
    "2^n (Backtracking)": Math.min(Math.pow(2, n), 5000),
    "n² (B&B approx)": n * n,
  };
});

export default function Complexity() {
  const { t } = useTranslation();

  const algorithms = [
    {
      key: "dp",
      name: t('dashboard.dp'),
      color: COLORS.dp,
      timeWorst: "O(n·W)",
      timeBest: "O(n·W)",
      timeAvg: "O(n·W)",
      space: "O(n·W)",
      optimal: true,
      pros: t('complexity.dp.pros', { returnObjects: true }) as string[],
      cons: t('complexity.dp.cons', { returnObjects: true }) as string[],
      useCases: t('complexity.dp.useCase'),
    },
    {
      key: "greedy",
      name: t('dashboard.greedy'),
      color: COLORS.greedy,
      timeWorst: "O(n log n)",
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      space: "O(n)",
      optimal: false,
      pros: t('complexity.greedy.pros', { returnObjects: true }) as string[],
      cons: t('complexity.greedy.cons', { returnObjects: true }) as string[],
      useCases: t('complexity.greedy.useCase'),
    },
    {
      key: "backtracking",
      name: t('dashboard.backtracking'),
      color: COLORS.backtracking,
      timeWorst: "O(2ⁿ)",
      timeBest: "O(n)",
      timeAvg: "O(2ⁿ)",
      space: "O(n)",
      optimal: true,
      pros: t('complexity.bt.pros', { returnObjects: true }) as string[],
      cons: t('complexity.bt.cons', { returnObjects: true }) as string[],
      useCases: t('complexity.bt.useCase'),
    },
    {
      key: "bb",
      name: t('dashboard.branchBound'),
      color: COLORS.bb,
      timeWorst: "O(2ⁿ)",
      timeBest: "O(n log n)",
      timeAvg: "Varies",
      space: "O(n·b)",
      optimal: true,
      pros: t('complexity.bb.pros', { returnObjects: true }) as string[],
      cons: t('complexity.bb.cons', { returnObjects: true }) as string[],
      useCases: t('complexity.bb.useCase'),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold">{t('complexity.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('complexity.subtitle')}</p>
      </motion.div>

      {/* Big-O Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('complexity.timeSpaceTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/5">
                    <th className="text-left py-3 pr-6">{t('complexity.algorithm')}</th>
                    <th className="text-center py-3 px-4">{t('complexity.bestCase')}</th>
                    <th className="text-center py-3 px-4">{t('complexity.avgCase')}</th>
                    <th className="text-center py-3 px-4">{t('complexity.worstCase')}</th>
                    <th className="text-center py-3 px-4">{t('complexity.space')}</th>
                    <th className="text-center py-3 pl-4">{t('complexity.isOptimal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {algorithms.map((algo, i) => (
                    <motion.tr
                      key={algo.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      data-testid={`complexity-row-${algo.key}`}
                    >
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: algo.color }} />
                          <span className="font-medium">{algo.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{algo.timeBest}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{algo.timeAvg}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{algo.timeWorst}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{algo.space}</span>
                      </td>
                      <td className="text-center py-4 pl-4">
                        {algo.optimal ? (
                          <span className="flex items-center justify-center gap-1 text-success">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-warning">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth rate chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('complexity.growthTitle')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('complexity.growthDesc')}</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 4, right: 16, bottom: 16, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 12%)" />
                <XAxis dataKey="n" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "n", fill: "hsl(215 20% 55%)", fontSize: 11, position: "insideBottom", dy: 14 }} />
                <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(215 40% 9%)", border: "1px solid hsl(215 30% 15%)", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Line type="monotone" dataKey="n·W (DP)" stroke={COLORS.dp} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="n log n (Greedy)" stroke={COLORS.greedy} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="2^n (Backtracking)" stroke={COLORS.backtracking} strokeWidth={2} strokeDasharray="5 3" dot={false} />
                <Line type="monotone" dataKey="n² (B&B approx)" stroke={COLORS.bb} strokeWidth={2} strokeDasharray="3 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Algorithm detail cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {algorithms.map((algo, i) => (
            <motion.div
              key={algo.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              data-testid={`algo-detail-${algo.key}`}
            >
              <Card className="glass-panel h-full">
                <div className="h-0.5 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${algo.color}, transparent)` }} />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: algo.color }} />
                    <h3 className="font-semibold">{algo.name}</h3>
                    <Badge variant="outline" className="ml-auto text-xs" style={{ borderColor: algo.color + "66", color: algo.color }}>
                      {algo.optimal ? t('complexity.optimal') : t('complexity.approximate')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{algo.useCases}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-success mb-2">{t('complexity.advantages')}</p>
                      <ul className="space-y-1">
                        {algo.pros.map((pro, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-success shrink-0 mt-0.5" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-destructive mb-2">{t('complexity.limitations')}</p>
                      <ul className="space-y-1">
                        {algo.cons.map((con, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <X className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
