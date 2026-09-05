import { useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Circle, X, Minus, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeDef } from "@/lib/algorithmCode";

interface CodePanelProps {
  codeDef: CodeDef;
  activeLine: number | null;
  stepMessage?: string;
  stepType?: string;
}

const LANG_BADGE: Record<string, string> = {
  typescript: "TS",
  javascript: "JS",
};

// Custom style derived from vscDarkPlus — keep the background transparent
// so our own panel bg shows through.
const codeStyle: Record<string, React.CSSProperties> = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...(vscDarkPlus['pre[class*="language-"]'] as React.CSSProperties),
    background: "transparent",
    margin: 0,
    padding: 0,
    fontSize: "0.75rem",
    lineHeight: "1.6",
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
  },
  'code[class*="language-"]': {
    ...(vscDarkPlus['code[class*="language-"]'] as React.CSSProperties),
    background: "transparent",
    fontSize: "0.75rem",
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
  },
};

const STEP_TYPE_COLOR: Record<string, string> = {
  'fill-cell':     'bg-violet-500/20 border-l-2 border-violet-400',
  'consider-item': 'bg-cyan-500/15 border-l-2 border-cyan-400',
  'select-item':   'bg-emerald-500/15 border-l-2 border-emerald-400',
  'reject-item':   'bg-red-500/10 border-l-2 border-red-400',
  'backtrack':     'bg-amber-500/15 border-l-2 border-amber-400',
  'explore-node':  'bg-blue-500/15 border-l-2 border-blue-400',
  'prune':         'bg-orange-500/15 border-l-2 border-orange-400',
};

const STEP_TYPE_DOT: Record<string, string> = {
  'fill-cell':     'bg-violet-400',
  'consider-item': 'bg-cyan-400',
  'select-item':   'bg-emerald-400',
  'reject-item':   'bg-red-400',
  'backtrack':     'bg-amber-400',
  'explore-node':  'bg-blue-400',
  'prune':         'bg-orange-400',
};

export function CodePanel({ codeDef, activeLine, stepMessage, stepType }: CodePanelProps) {
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = codeDef.code.split("\n");

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      const visTop = container.scrollTop;
      const visBottom = visTop + container.clientHeight;
      const margin = 80;
      if (elTop - margin < visTop) {
        container.scrollTo({ top: elTop - margin, behavior: "smooth" });
      } else if (elBottom + margin > visBottom) {
        container.scrollTo({ top: elBottom + margin - container.clientHeight, behavior: "smooth" });
      }
    }
  }, [activeLine]);

  const highlightClass = stepType ? (STEP_TYPE_COLOR[stepType] ?? 'bg-primary/20 border-l-2 border-primary') : '';
  const dotClass = stepType ? (STEP_TYPE_DOT[stepType] ?? 'bg-primary') : '';

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/8 bg-[#1e1e1e]" style={{ fontFamily: "inherit" }}>
      {/* Title bar — macOS-style dots */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#323233] border-b border-white/8 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[11px] text-[#cccccc]/60 font-medium select-none">
            VS Code — Knapsack Algorithms
          </span>
        </div>
        <div className="w-14" />
      </div>

      {/* Tab bar */}
      <div className="flex items-end bg-[#2d2d2d] border-b border-white/8 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-[#007acc] bg-[#1e1e1e] text-[11px] text-[#cccccc]">
          <FileCode2 className="w-3.5 h-3.5 text-[#519aba]" />
          <span>{codeDef.filename}</span>
          <span className="ml-1 px-1 py-0.5 rounded text-[9px] bg-[#007acc]/20 text-[#007acc] font-bold">
            {LANG_BADGE[codeDef.language] ?? codeDef.language.toUpperCase()}
          </span>
        </div>
        <div className="flex-1" />
      </div>

      {/* Editor area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Line numbers gutter */}
        <div className="select-none shrink-0 bg-[#1e1e1e] text-right pr-3 pt-3 pb-3 pl-3 border-r border-white/5 overflow-hidden">
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isActive = activeLine === lineNum;
            return (
              <div
                key={lineNum}
                className={cn(
                  "text-[0.72rem] leading-[1.6] font-mono transition-colors duration-150",
                  isActive ? "text-[#c6c6c6]" : "text-[#858585]"
                )}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Code content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto relative">
          {/* Active line highlight — positioned behind code */}
          {activeLine !== null && (
            <AnimatePresence>
              <motion.div
                key={activeLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn("absolute left-0 right-0 pointer-events-none z-10 transition-all", highlightClass)}
                style={{
                  top: `calc(${(activeLine - 1)} * 1.6 * 0.75rem + 0.75rem)`,
                  height: "calc(1.6 * 0.75rem)",
                }}
              />
            </AnimatePresence>
          )}

          <div className="relative pt-3 pb-3 pl-3">
            <SyntaxHighlighter
              language={codeDef.language}
              style={codeStyle}
              wrapLines
              useInlineStyles
              customStyle={{ background: "transparent", padding: 0, margin: 0 }}
              lineProps={(lineNumber) => {
                const isActive = activeLine === lineNumber;
                return {
                  style: {
                    display: "block",
                    position: "relative",
                    zIndex: 20,
                  },
                  ref: isActive ? activeRef : undefined,
                  "data-active": isActive ? "true" : undefined,
                } as React.HTMLAttributes<HTMLElement>;
              }}
            >
              {codeDef.code}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Minimap */}
        <div className="w-14 shrink-0 bg-[#1e1e1e] border-l border-white/5 overflow-hidden relative">
          <div className="absolute inset-2 opacity-30">
            {lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "h-[2px] rounded-full mb-[2px] transition-colors",
                  activeLine === i + 1 ? "bg-primary" : "bg-white/20"
                )}
                style={{ width: `${Math.min((line.length / 60) * 100, 100)}%` }}
              />
            ))}
          </div>
          {/* Minimap viewport indicator */}
          {activeLine && (
            <motion.div
              className="absolute left-0 right-0 bg-white/5 pointer-events-none"
              animate={{ top: `${((activeLine - 1) / Math.max(lines.length, 1)) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ height: "16px" }}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-3 py-1 bg-[#007acc] text-white text-[10px] shrink-0">
        <div className="flex items-center gap-1.5">
          <Circle className="w-2 h-2 fill-white" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Ln {activeLine ?? 1}, Col 1</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {stepType && (
            <AnimatePresence mode="wait">
              <motion.div
                key={stepType}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
                <span className="capitalize">{stepType.replace("-", " ")}</span>
              </motion.div>
            </AnimatePresence>
          )}
          <span className="opacity-60">TypeScript</span>
          <span className="opacity-60">UTF-8</span>
        </div>
      </div>

      {/* Step message tooltip strip */}
      <AnimatePresence>
        {stepMessage && (
          <motion.div
            key={stepMessage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="px-3 py-1.5 bg-[#252526] border-t border-white/8 text-[10px] font-mono text-[#cccccc]/70 truncate shrink-0"
          >
            <span className="text-[#569cd6]">// </span>{stepMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
