import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, Legend, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

const COLORS = {
  dp: "hsl(263, 90%, 65%)",
  greedy: "hsl(190, 100%, 50%)",
  backtracking: "hsl(45, 93%, 58%)",
  bb: "hsl(213, 100%, 60%)",
};

const runtimeData = [
  { n: 4, dp: 0.008, greedy: 0.001, bt: 0.02, bb: 0.015 },
  { n: 6, dp: 0.014, greedy: 0.002, bt: 0.08, bb: 0.05 },
  { n: 8, dp: 0.03, greedy: 0.003, bt: 0.4, bb: 0.18 },
  { n: 10, dp: 0.06, greedy: 0.004, bt: 2.1, bb: 0.5 },
  { n: 12, dp: 0.11, greedy: 0.005, bt: 9.8, bb: 1.4 },
  { n: 15, dp: 0.20, greedy: 0.007, bt: 85, bb: 4.2 },
  { n: 18, dp: 0.35, greedy: 0.009, bt: 780, bb: 14 },
  { n: 20, dp: 0.5, greedy: 0.011, bt: 4200, bb: 38 },
];

const memoryData = [
  { name: "DP", memory: 480, optimal: true },
  { name: "Greedy", memory: 42, optimal: false },
  { name: "Backtracking", memory: 68, optimal: true },
  { name: "B&B", memory: 95, optimal: true },
];

const qualityData = [
  { n: 5, dp: 100, greedy: 92, bt: 100, bb: 100 },
  { n: 8, dp: 100, greedy: 88, bt: 100, bb: 100 },
  { n: 10, dp: 100, greedy: 85, bt: 100, bb: 100 },
  { n: 12, dp: 100, greedy: 83, bt: 100, bb: 100 },
  { n: 15, dp: 100, greedy: 79, bt: 100, bb: 100 },
  { n: 20, dp: 100, greedy: 74, bt: 100, bb: 100 },
];

const generateHeatmap = () => {
  const rows = [];
  const ns = [4, 6, 8, 10, 12, 15];
  const caps = [20, 30, 50, 70, 100];
  for (const n of ns) {
    for (const c of caps) {
      const time = (n * c * 0.001 + n * 0.003).toFixed(3);
      rows.push({ n, capacity: c, time: Number(time), value: Math.min(Number(time) * 300, 100) });
    }
  }
  return rows;
};

const heatmapData = generateHeatmap();

const CustomTooltipStyle = {
  contentStyle: { background: "hsl(215 40% 9%)", border: "1px solid hsl(215 30% 15%)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "hsl(210 40% 95%)" },
};

export default function Analytics() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold">{t('analytics.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
      </motion.div>

      {/* Runtime line chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('analytics.runtimeChart')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('analytics.runtimeDesc')}</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runtimeData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 12%)" />
                <XAxis dataKey="n" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "n (items)", fill: "hsl(215 20% 55%)", fontSize: 11, position: "insideBottom", dy: 12 }} />
                <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [`${v}ms`]} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Line type="monotone" dataKey="dp" stroke={COLORS.dp} strokeWidth={2} dot={{ fill: COLORS.dp, r: 3 }} name="Dynamic Programming" />
                <Line type="monotone" dataKey="greedy" stroke={COLORS.greedy} strokeWidth={2} dot={{ fill: COLORS.greedy, r: 3 }} name="Greedy" />
                <Line type="monotone" dataKey="bt" stroke={COLORS.backtracking} strokeWidth={2} strokeDasharray="5 3" dot={{ fill: COLORS.backtracking, r: 3 }} name="Backtracking" />
                <Line type="monotone" dataKey="bb" stroke={COLORS.bb} strokeWidth={2} strokeDasharray="3 2" dot={{ fill: COLORS.bb, r: 3 }} name="Branch & Bound" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory bar chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-panel h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('analytics.memoryChart')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('analytics.memoryDesc')}</p>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memoryData} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [`${v} KB`, "Memory"]} />
                  <Bar dataKey="memory" radius={[6, 6, 0, 0]}>
                    {memoryData.map((entry, i) => (
                      <Cell key={i} fill={[COLORS.dp, COLORS.greedy, COLORS.backtracking, COLORS.bb][i]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Solution quality */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-panel h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('analytics.qualityChart')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('analytics.qualityDesc')}</p>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityData} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 12%)" />
                  <XAxis dataKey="n" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 105]} tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [`${v}%`]} />
                  <Line type="monotone" dataKey="dp" stroke={COLORS.dp} strokeWidth={2} dot={false} name="DP" />
                  <Line type="monotone" dataKey="greedy" stroke={COLORS.greedy} strokeWidth={2} strokeDasharray="4 2" dot={false} name="Greedy" />
                  <Line type="monotone" dataKey="bt" stroke={COLORS.backtracking} strokeWidth={1.5} dot={false} name="Backtracking" />
                  <Line type="monotone" dataKey="bb" stroke={COLORS.bb} strokeWidth={1.5} dot={false} name="B&B" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Heatmap scatter */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('analytics.heatmapChart')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('analytics.heatmapDesc')}</p>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 4, right: 16, bottom: 16, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 12%)" />
                <XAxis dataKey="n" name="n" type="number" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "n items", fill: "hsl(215 20% 55%)", fontSize: 11, position: "insideBottom", dy: 16 }} />
                <YAxis dataKey="capacity" name="Capacity" type="number" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <ZAxis dataKey="value" range={[40, 400]} />
                <Tooltip {...CustomTooltipStyle} cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, name: string) => [name === "time" ? `${v}ms` : v, name]} />
                <Scatter data={heatmapData} fill={COLORS.dp} fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary insights */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('analytics.fastest'), value: "Greedy", sub: t('analytics.fastestSub'), color: COLORS.greedy },
            { label: t('analytics.mostOptimal'), value: "DP / B&B", sub: t('analytics.mostOptimalSub'), color: COLORS.dp },
            { label: t('analytics.worstScaling'), value: "Backtracking", sub: t('analytics.worstScalingSub'), color: COLORS.backtracking },
          ].map((item, i) => (
            <Card key={i} className="glass-panel border border-white/5">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
