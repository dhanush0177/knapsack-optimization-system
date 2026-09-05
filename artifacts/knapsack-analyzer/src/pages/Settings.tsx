import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "@/contexts/AppContext";
import { Sun, Moon, Monitor, Zap, Table2, Layers, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Settings() {
  const {
    theme, setTheme,
    animationSpeed, setAnimationSpeed,
    selectedAlgorithm, setSelectedAlgorithm,
    showDPTable, setShowDPTable,
    capacity, setCapacity,
    items, regenerateDataset,
  } = useAppContext();
  const { t } = useTranslation();

  const speedValues: Record<string, number[]> = { slow: [1], medium: [2], fast: [3] };
  const reverseSpeed: Record<number, "slow" | "medium" | "fast"> = { 1: "slow", 2: "medium", 3: "fast" };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold">{t('settings.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="glass-panel border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">{t('settings.languageDesc')}</p>
            <LanguageSwitcher />
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" />
              {t('settings.appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">{t('settings.theme')}</Label>
              <div className="flex gap-2">
                {[
                  { value: "dark", label: t('settings.dark'), icon: Moon },
                  { value: "light", label: t('settings.light'), icon: Sun },
                  { value: "system", label: t('settings.system'), icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as "dark" | "light" | "system")}
                    data-testid={`btn-theme-${value}`}
                    className={`flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                      theme === value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/3 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visualizer */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t('settings.visualizer')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-sm mb-3 block">{t('settings.animationSpeed')}</Label>
              <Slider
                min={1}
                max={3}
                step={1}
                value={speedValues[animationSpeed]}
                onValueChange={(v) => setAnimationSpeed(reverseSpeed[v[0]])}
                className="w-full"
                data-testid="slider-animation-speed"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{t('settings.slow')}</span>
                <span className="font-medium text-primary capitalize">{animationSpeed}</span>
                <span>{t('settings.fast')}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">{t('settings.defaultAlgorithm')}</Label>
              <Select value={selectedAlgorithm} onValueChange={(v) => setSelectedAlgorithm(v as typeof selectedAlgorithm)} data-testid="select-default-algorithm">
                <SelectTrigger className="w-full bg-muted/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dp">{t('dashboard.dp')}</SelectItem>
                  <SelectItem value="greedy">{t('dashboard.greedy')}</SelectItem>
                  <SelectItem value="backtracking">{t('dashboard.backtracking')}</SelectItem>
                  <SelectItem value="branch-bound">{t('dashboard.branchBound')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">{t('settings.showDPTable')}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.showDPTableDesc')}</p>
              </div>
              <Switch
                checked={showDPTable}
                onCheckedChange={setShowDPTable}
                data-testid="switch-show-dp-table"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dataset */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              {t('settings.datasetDefaults')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-sm mb-3 block">{t('settings.defaultCapacity')}: <span className="font-mono text-primary">{capacity}</span></Label>
              <Slider
                min={10}
                max={200}
                step={5}
                value={[capacity]}
                onValueChange={(v) => setCapacity(v[0])}
                className="w-full"
                data-testid="slider-capacity"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block">{t('settings.defaultItems')}: <span className="font-mono text-primary">{items.length}</span></Label>
              <Slider
                min={3}
                max={20}
                step={1}
                value={[items.length]}
                onValueChange={(v) => regenerateDataset(v[0])}
                className="w-full"
                data-testid="slider-num-items"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>3</span>
                <span>20</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Display options */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Table2 className="w-4 h-4 text-primary" />
              {t('settings.display')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: t('settings.showStepMessages'), sub: t('settings.showStepMessagesDesc') },
              { label: t('settings.highlightItems'), sub: t('settings.highlightItemsDesc') },
              { label: t('settings.autoRun'), sub: t('settings.autoRunDesc') },
            ].map((opt, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{opt.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                </div>
                <Switch defaultChecked={i === 0} data-testid={`switch-opt-${i}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="text-xs text-muted-foreground text-center">{t('settings.footer')}</p>
      </motion.div>
    </div>
  );
}
