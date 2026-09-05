import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "@/contexts/AppContext";
import { PRESET_DATASETS, generateDataset, Item } from "@/lib/algorithms";
import { Plus, Trash2, Shuffle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ItemEditorProps {
  open: boolean;
  onClose: () => void;
}

export function ItemEditor({ open, onClose }: ItemEditorProps) {
  const { items, setItems, capacity, setCapacity } = useAppContext();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Item[]>(() => items.map(it => ({ ...it })));
  const [draftCap, setDraftCap] = useState(capacity);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(items.map(it => ({ ...it })));
      setDraftCap(capacity);
      setActivePreset(null);
    }
    if (!isOpen) onClose();
  };

  const applyPreset = (key: string) => {
    const preset = PRESET_DATASETS[key];
    setDraft(preset.items.map(it => ({ ...it })));
    setDraftCap(preset.capacity);
    setActivePreset(key);
  };

  const applyRandom = () => {
    setDraft(generateDataset(8));
    setDraftCap(50);
    setActivePreset('random');
  };

  const updateItem = (id: number, field: keyof Item, value: string | number) => {
    setDraft(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
    setActivePreset(null);
  };

  const addItem = () => {
    const newId = Math.max(...draft.map(it => it.id), 0) + 1;
    setDraft(prev => [...prev, { id: newId, name: `Item ${newId}`, weight: 5, value: 30 }]);
    setActivePreset(null);
  };

  const removeItem = (id: number) => {
    if (draft.length <= 2) return;
    setDraft(prev => prev.filter(it => it.id !== id));
    setActivePreset(null);
  };

  const handleSave = () => {
    setItems(draft);
    setCapacity(draftCap);
    onClose();
  };

  const ratioColor = (w: number, v: number) => {
    const r = v / w;
    if (r >= 8) return "text-emerald-400";
    if (r >= 4) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl bg-[hsl(222,50%,7%)] border border-white/10 text-foreground p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/8">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            {t('itemEditor.title')}
            <Badge variant="secondary" className="text-xs">{draft.length} items</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Preset buttons */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">{t('itemEditor.chooseScenario')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'random', label: t('itemEditor.random'), icon: '🎲' },
                ...Object.entries(PRESET_DATASETS).map(([key, p]) => ({ key, label: p.label, icon: p.icon })),
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => key === 'random' ? applyRandom() : applyPreset(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150",
                    activePreset === key
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/3 text-muted-foreground hover:bg-white/8 hover:text-foreground"
                  )}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity slider */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/8">
            <span className="text-xs text-muted-foreground whitespace-nowrap w-28 shrink-0">
              {t('itemEditor.bagCapacity')} <span className="font-mono font-semibold text-foreground">{draftCap}</span>
            </span>
            <Slider min={5} max={200} step={5} value={[draftCap]} onValueChange={(v) => setDraftCap(v[0])} className="flex-1" />
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px_48px_32px] gap-2 px-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            <span>{t('itemEditor.itemName')}</span>
            <span className="text-center">{t('itemEditor.weight')}</span>
            <span className="text-center">{t('itemEditor.value')}</span>
            <span className="text-center">{t('itemEditor.ratio')}</span>
            <span />
          </div>

          {/* Items list */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {draft.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-[1fr_80px_80px_48px_32px] gap-2 items-center"
                >
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="h-8 text-xs bg-white/3 border-white/10 focus:border-primary/40"
                    maxLength={20}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={item.weight}
                    onChange={(e) => updateItem(item.id, 'weight', Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs bg-white/3 border-white/10 text-center focus:border-primary/40"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={item.value}
                    onChange={(e) => updateItem(item.id, 'value', Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs bg-white/3 border-white/10 text-center focus:border-primary/40"
                  />
                  <div className={cn("text-xs font-mono font-semibold text-center", ratioColor(item.weight, item.value))}>
                    {(item.value / item.weight).toFixed(1)}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={draft.length <= 2}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-white/8">
            <Button
              variant="ghost"
              size="sm"
              onClick={addItem}
              disabled={draft.length >= 15}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('itemEditor.addItem')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-white/10 hover:bg-white/5">
                {t('itemEditor.cancel')}
              </Button>
              <Button size="sm" onClick={handleSave} className="text-xs bg-primary hover:bg-primary/90 glow-primary gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {t('itemEditor.applyClose')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
