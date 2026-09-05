import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Item, KnapsackResult, generateDataset } from '@/lib/algorithms';

interface RunHistoryEntry {
  id: string;
  timestamp: Date;
  capacity: number;
  numItems: number;
  algorithm: string;
  result: KnapsackResult;
}

interface AppContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  capacity: number;
  setCapacity: React.Dispatch<React.SetStateAction<number>>;
  selectedAlgorithm: 'dp' | 'greedy' | 'backtracking' | 'branch-bound';
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<'dp' | 'greedy' | 'backtracking' | 'branch-bound'>>;
  animationSpeed: 'slow' | 'medium' | 'fast';
  setAnimationSpeed: React.Dispatch<React.SetStateAction<'slow' | 'medium' | 'fast'>>;
  runHistory: RunHistoryEntry[];
  addRunHistory: (entry: RunHistoryEntry) => void;
  clearRunHistory: () => void;
  regenerateDataset: (numItems: number) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light' | 'system'>>;
  showDPTable: boolean;
  setShowDPTable: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(() => generateDataset(8));
  const [capacity, setCapacity] = useState<number>(50);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'dp' | 'greedy' | 'backtracking' | 'branch-bound'>('dp');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [showDPTable, setShowDPTable] = useState(true);

  const addRunHistory = (entry: RunHistoryEntry) => {
    setRunHistory(prev => [entry, ...prev]);
  };

  const clearRunHistory = () => {
    setRunHistory([]);
  };

  const regenerateDataset = (numItems: number) => {
    setItems(generateDataset(numItems));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        items,
        setItems,
        capacity,
        setCapacity,
        selectedAlgorithm,
        setSelectedAlgorithm,
        animationSpeed,
        setAnimationSpeed,
        runHistory,
        addRunHistory,
        clearRunHistory,
        regenerateDataset,
        theme,
        setTheme,
        showDPTable,
        setShowDPTable
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
