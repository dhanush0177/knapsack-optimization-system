export interface Item {
  id: number;
  name: string;
  weight: number;
  value: number;
}

export interface Step {
  type: 'fill-cell' | 'consider-item' | 'select-item' | 'reject-item' | 'backtrack' | 'explore-node' | 'prune';
  itemIndex?: number;
  capacity?: number;
  value?: number;
  message: string;
}

export interface KnapsackResult {
  algorithm: 'dp' | 'greedy' | 'backtracking' | 'branch-bound';
  selectedItems: number[]; // item ids
  totalValue: number;
  totalWeight: number;
  isOptimal: boolean;
  timeMs: number;
  stepsCount: number;
  nodesExplored: number;
  steps: Step[];
}

export const generateDataset = (numItems: number): Item[] => {
  return Array.from({ length: numItems }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    weight: Math.floor(Math.random() * 20) + 1,
    value: Math.floor(Math.random() * 50) + 10,
  }));
};

export interface Preset {
  label: string;
  icon: string;
  capacity: number;
  items: Item[];
}

export const PRESET_DATASETS: Record<string, Preset> = {
  treasure: {
    label: 'Treasure Hunt',
    icon: '💎',
    capacity: 50,
    items: [
      { id: 1, name: 'Gold Bar',       weight: 15, value: 95 },
      { id: 2, name: 'Diamond',         weight: 5,  value: 85 },
      { id: 3, name: 'Ruby Necklace',  weight: 3,  value: 60 },
      { id: 4, name: 'Silver Coin',    weight: 2,  value: 25 },
      { id: 5, name: 'Ancient Vase',   weight: 20, value: 70 },
      { id: 6, name: 'Emerald Ring',   weight: 4,  value: 55 },
      { id: 7, name: 'Bronze Statue',  weight: 18, value: 40 },
      { id: 8, name: 'Pearl Brooch',   weight: 1,  value: 30 },
    ],
  },
  hiking: {
    label: 'Hiking Gear',
    icon: '🏔️',
    capacity: 15,
    items: [
      { id: 1, name: 'Tent',           weight: 3,  value: 90 },
      { id: 2, name: 'Sleeping Bag',   weight: 2,  value: 80 },
      { id: 3, name: 'Water Filter',   weight: 1,  value: 95 },
      { id: 4, name: 'First Aid Kit',  weight: 1,  value: 85 },
      { id: 5, name: 'Food Rations',   weight: 4,  value: 70 },
      { id: 6, name: 'GPS Device',     weight: 1,  value: 75 },
      { id: 7, name: 'Rain Jacket',    weight: 2,  value: 50 },
      { id: 8, name: 'Camera',         weight: 2,  value: 40 },
    ],
  },
  gadgets: {
    label: 'Tech Gadgets',
    icon: '💻',
    capacity: 40,
    items: [
      { id: 1, name: 'Laptop',         weight: 15, value: 100 },
      { id: 2, name: 'Smartphone',     weight: 5,  value: 80 },
      { id: 3, name: 'Tablet',         weight: 10, value: 70 },
      { id: 4, name: 'Headphones',     weight: 3,  value: 55 },
      { id: 5, name: 'Power Bank',     weight: 4,  value: 60 },
      { id: 6, name: 'Smart Watch',    weight: 2,  value: 50 },
      { id: 7, name: 'DSLR Camera',    weight: 8,  value: 75 },
      { id: 8, name: 'Kindle',         weight: 4,  value: 45 },
    ],
  },
  museum: {
    label: 'Museum Heist',
    icon: '🖼️',
    capacity: 30,
    items: [
      { id: 1, name: 'Mona Lisa',      weight: 12, value: 100 },
      { id: 2, name: 'Sculpture',      weight: 20, value: 85 },
      { id: 3, name: 'Gold Mask',      weight: 8,  value: 90 },
      { id: 4, name: 'Ancient Coin',   weight: 1,  value: 50 },
      { id: 5, name: 'Jade Figurine',  weight: 3,  value: 65 },
      { id: 6, name: 'War Medallion',  weight: 2,  value: 45 },
      { id: 7, name: 'Ivory Dagger',   weight: 5,  value: 70 },
      { id: 8, name: 'Crystal Ball',   weight: 6,  value: 55 },
    ],
  },
};

// --- Dynamic Programming ---
export const runDP = (items: Item[], capacity: number): KnapsackResult => {
  const start = performance.now();
  const n = items.length;
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  const steps: Step[] = [];
  let stepsCount = 0;

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      stepsCount++;
      if (items[i - 1].weight <= w) {
        const include = items[i - 1].value + dp[i - 1][w - items[i - 1].weight];
        const exclude = dp[i - 1][w];
        dp[i][w] = Math.max(include, exclude);
        steps.push({
          type: 'fill-cell',
          itemIndex: i,
          capacity: w,
          value: dp[i][w],
          message: `Cell [${i}][${w}] = max(${include}, ${exclude}) = ${dp[i][w]}`
        });
      } else {
        dp[i][w] = dp[i - 1][w];
        steps.push({
          type: 'fill-cell',
          itemIndex: i,
          capacity: w,
          value: dp[i][w],
          message: `Item weight > capacity, Cell [${i}][${w}] = ${dp[i][w]}`
        });
      }
    }
  }

  const selectedItems: number[] = [];
  let w = capacity;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(items[i - 1].id);
      w -= items[i - 1].weight;
    }
  }

  const timeMs = performance.now() - start;
  return {
    algorithm: 'dp',
    selectedItems: selectedItems.reverse(),
    totalValue: dp[n][capacity],
    totalWeight: capacity - w,
    isOptimal: true,
    timeMs,
    stepsCount,
    nodesExplored: stepsCount,
    steps
  };
};

// --- Greedy Algorithm ---
export const runGreedy = (items: Item[], capacity: number): KnapsackResult => {
  const start = performance.now();
  const sortedItems = [...items].map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  
  const steps: Step[] = [];
  const selectedItems: number[] = [];
  let totalValue = 0;
  let totalWeight = 0;
  let stepsCount = 0;

  for (const item of sortedItems) {
    stepsCount++;
    steps.push({
      type: 'consider-item',
      itemIndex: item.originalIndex + 1,
      message: `Considering Item ${item.id} (Value/Weight = ${(item.value / item.weight).toFixed(2)})`
    });

    if (totalWeight + item.weight <= capacity) {
      selectedItems.push(item.id);
      totalValue += item.value;
      totalWeight += item.weight;
      steps.push({
        type: 'select-item',
        itemIndex: item.originalIndex + 1,
        message: `Selected Item ${item.id}`
      });
    } else {
      steps.push({
        type: 'reject-item',
        itemIndex: item.originalIndex + 1,
        message: `Rejected Item ${item.id} - Exceeds capacity`
      });
    }
  }

  const timeMs = performance.now() - start;
  return {
    algorithm: 'greedy',
    selectedItems: selectedItems.sort((a, b) => a - b),
    totalValue,
    totalWeight,
    isOptimal: false, // greedy doesn't guarantee optimality
    timeMs,
    stepsCount,
    nodesExplored: stepsCount,
    steps
  };
};

// --- Backtracking ---
export const runBacktracking = (items: Item[], capacity: number): KnapsackResult => {
  const start = performance.now();
  const steps: Step[] = [];
  let maxVal = 0;
  let bestSelection: number[] = [];
  let currentSelection: number[] = [];
  let nodesExplored = 0;

  const backtrack = (idx: number, currentWeight: number, currentValue: number) => {
    nodesExplored++;
    
    if (idx === items.length) {
      if (currentValue > maxVal) {
        maxVal = currentValue;
        bestSelection = [...currentSelection];
      }
      return;
    }

    steps.push({
      type: 'explore-node',
      message: `Exploring item ${items[idx].id} (Weight: ${currentWeight}, Value: ${currentValue})`
    });

    if (currentWeight + items[idx].weight <= capacity) {
      currentSelection.push(items[idx].id);
      steps.push({ type: 'select-item', itemIndex: idx + 1, message: `Try selecting Item ${items[idx].id}` });
      backtrack(idx + 1, currentWeight + items[idx].weight, currentValue + items[idx].value);
      currentSelection.pop();
      steps.push({ type: 'backtrack', message: `Backtrack from Item ${items[idx].id}` });
    } else {
      steps.push({ type: 'prune', message: `Prune: Item ${items[idx].id} exceeds capacity` });
    }

    steps.push({ type: 'reject-item', itemIndex: idx + 1, message: `Try skipping Item ${items[idx].id}` });
    backtrack(idx + 1, currentWeight, currentValue);
  };

  backtrack(0, 0, 0);

  const timeMs = performance.now() - start;
  const totalWeight = items.filter(i => bestSelection.includes(i.id)).reduce((sum, i) => sum + i.weight, 0);

  return {
    algorithm: 'backtracking',
    selectedItems: bestSelection,
    totalValue: maxVal,
    totalWeight,
    isOptimal: true,
    timeMs,
    stepsCount: nodesExplored,
    nodesExplored,
    steps
  };
};

// --- Branch & Bound ---
export const runBranchAndBound = (items: Item[], capacity: number): KnapsackResult => {
  const start = performance.now();
  const steps: Step[] = [];
  let nodesExplored = 0;

  const sortedItems = [...items].map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

  const bound = (idx: number, weight: number, value: number) => {
    if (weight >= capacity) return 0;
    let boundVal = value;
    let totalW = weight;
    let j = idx;
    while (j < sortedItems.length && totalW + sortedItems[j].weight <= capacity) {
      totalW += sortedItems[j].weight;
      boundVal += sortedItems[j].value;
      j++;
    }
    if (j < sortedItems.length) {
      boundVal += (capacity - totalW) * (sortedItems[j].value / sortedItems[j].weight);
    }
    return boundVal;
  };

  interface Node {
    level: number;
    value: number;
    weight: number;
    bound: number;
    selection: number[];
  }

  const queue: Node[] = [];
  queue.push({ level: -1, value: 0, weight: 0, bound: bound(0, 0, 0), selection: [] });
  
  let maxVal = 0;
  let bestSelection: number[] = [];

  while (queue.length > 0) {
    queue.sort((a, b) => b.bound - a.bound); // max heap
    const u = queue.shift()!;
    nodesExplored++;
    steps.push({ type: 'explore-node', message: `Explore Node: Level ${u.level}, Value ${u.value}, Bound ${u.bound.toFixed(2)}` });

    if (u.bound <= maxVal) {
      steps.push({ type: 'prune', message: `Pruned (Bound ${u.bound.toFixed(2)} <= Max ${maxVal})` });
      continue;
    }

    if (u.level === sortedItems.length - 1) continue;

    const vLevel = u.level + 1;
    const item = sortedItems[vLevel];

    // Include next item
    const v1Weight = u.weight + item.weight;
    if (v1Weight <= capacity) {
      const v1Value = u.value + item.value;
      const v1Selection = [...u.selection, item.id];
      if (v1Value > maxVal) {
        maxVal = v1Value;
        bestSelection = v1Selection;
      }
      const v1Bound = bound(vLevel + 1, v1Weight, v1Value);
      if (v1Bound > maxVal) {
        queue.push({ level: vLevel, value: v1Value, weight: v1Weight, bound: v1Bound, selection: v1Selection });
      }
    }

    // Exclude next item
    const v2Bound = bound(vLevel + 1, u.weight, u.value);
    if (v2Bound > maxVal) {
      queue.push({ level: vLevel, value: u.value, weight: u.weight, bound: v2Bound, selection: u.selection });
    }
  }

  const timeMs = performance.now() - start;
  const totalWeight = items.filter(i => bestSelection.includes(i.id)).reduce((sum, i) => sum + i.weight, 0);

  return {
    algorithm: 'branch-bound',
    selectedItems: bestSelection,
    totalValue: maxVal,
    totalWeight,
    isOptimal: true,
    timeMs,
    stepsCount: nodesExplored,
    nodesExplored,
    steps
  };
};

export const runAllAlgorithms = (items: Item[], capacity: number) => {
  return {
    dp: runDP(items, capacity),
    greedy: runGreedy(items, capacity),
    backtracking: runBacktracking(items, capacity),
    'branch-bound': runBranchAndBound(items, capacity),
  };
};

// ─── Greedy Variants ────────────────────────────────────────────────────────
export type GreedyStrategy = 'ratio' | 'value' | 'weight-asc' | 'weight-desc';

export interface GreedyVariantResult {
  strategy: GreedyStrategy;
  label: string;
  selectedItems: number[];
  totalValue: number;
  totalWeight: number;
  timeMs: number;
  approximationRatio: number; // compared to DP optimal
  itemsChosen: number;
}

const greedyWithStrategy = (items: Item[], capacity: number, strategy: GreedyStrategy): Omit<GreedyVariantResult, 'approximationRatio' | 'label'> => {
  const start = performance.now();
  const sorted = [...items].sort((a, b) => {
    if (strategy === 'ratio')       return (b.value / b.weight) - (a.value / a.weight);
    if (strategy === 'value')       return b.value - a.value;
    if (strategy === 'weight-asc')  return a.weight - b.weight;
    return b.weight - a.weight; // weight-desc
  });

  const selectedItems: number[] = [];
  let totalValue = 0, totalWeight = 0;
  for (const item of sorted) {
    if (totalWeight + item.weight <= capacity) {
      selectedItems.push(item.id);
      totalValue += item.value;
      totalWeight += item.weight;
    }
  }
  return { strategy, selectedItems, totalValue, totalWeight, timeMs: performance.now() - start, itemsChosen: selectedItems.length };
};

export const runGreedyVariants = (items: Item[], capacity: number): GreedyVariantResult[] => {
  const dpOptimal = runDP(items, capacity).totalValue;
  const labels: Record<GreedyStrategy, string> = {
    ratio: 'Best Ratio (Value/Weight)',
    value: 'Most Valuable First',
    'weight-asc': 'Lightest First',
    'weight-desc': 'Heaviest First',
  };
  const strategies: GreedyStrategy[] = ['ratio', 'value', 'weight-asc', 'weight-desc'];
  return strategies.map(s => {
    const r = greedyWithStrategy(items, capacity, s);
    return {
      ...r,
      label: labels[s],
      approximationRatio: dpOptimal > 0 ? (r.totalValue / dpOptimal) * 100 : 100,
    };
  });
};

// ─── Fractional Knapsack ────────────────────────────────────────────────────
export interface FractionalItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  fractionTaken: number; // 0..1
  valueTaken: number;
  weightTaken: number;
}

export interface FractionalResult {
  items: FractionalItem[];
  totalValue: number;
  totalWeight: number;
  timeMs: number;
  isOptimal: true;
}

export const runFractionalKnapsack = (items: Item[], capacity: number): FractionalResult => {
  const start = performance.now();
  const sorted = [...items].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  let remaining = capacity;
  let totalValue = 0, totalWeight = 0;
  const result: FractionalItem[] = [];

  for (const item of sorted) {
    if (remaining <= 0) {
      result.push({ ...item, fractionTaken: 0, valueTaken: 0, weightTaken: 0 });
      continue;
    }
    const take = Math.min(item.weight, remaining);
    const fraction = take / item.weight;
    const valueTaken = fraction * item.value;
    totalValue += valueTaken;
    totalWeight += take;
    remaining -= take;
    result.push({ ...item, fractionTaken: fraction, valueTaken, weightTaken: take });
  }

  return {
    items: result.sort((a, b) => a.id - b.id),
    totalValue,
    totalWeight,
    timeMs: performance.now() - start,
    isOptimal: true,
  };
};

// ─── Real-world Scenarios ───────────────────────────────────────────────────
export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  capacity: number;
  capacityUnit: string;
  items: (Item & { category: string })[];
}

export const REAL_WORLD_SCENARIOS: Scenario[] = [
  {
    id: 'delivery',
    name: 'Delivery Truck',
    description: 'Pack parcels to maximize delivery value within weight limit',
    icon: '🚚',
    capacity: 100,
    capacityUnit: 'kg',
    items: [
      { id: 1, name: 'Electronics Box',  weight: 15, value: 85,  category: 'Electronics' },
      { id: 2, name: 'Furniture Piece',  weight: 40, value: 120, category: 'Furniture' },
      { id: 3, name: 'Clothing Bundle',  weight: 8,  value: 40,  category: 'Clothing' },
      { id: 4, name: 'Book Collection',  weight: 12, value: 30,  category: 'Books' },
      { id: 5, name: 'Appliance',        weight: 25, value: 95,  category: 'Electronics' },
      { id: 6, name: 'Toy Set',          weight: 6,  value: 35,  category: 'Toys' },
      { id: 7, name: 'Sports Equipment', weight: 20, value: 60,  category: 'Sports' },
      { id: 8, name: 'Food Package',     weight: 10, value: 25,  category: 'Food' },
    ],
  },
  {
    id: 'hiking',
    name: 'Hiking Backpack',
    description: 'Choose survival gear to maximize utility within backpack weight',
    icon: '🎒',
    capacity: 15,
    capacityUnit: 'kg',
    items: [
      { id: 1, name: 'Tent',           weight: 3,   value: 90,  category: 'Shelter' },
      { id: 2, name: 'Sleeping Bag',   weight: 2,   value: 80,  category: 'Shelter' },
      { id: 3, name: 'Water Filter',   weight: 1,   value: 95,  category: 'Survival' },
      { id: 4, name: 'First Aid Kit',  weight: 1,   value: 85,  category: 'Safety' },
      { id: 5, name: 'Food Rations',   weight: 4,   value: 70,  category: 'Food' },
      { id: 6, name: 'Rope (30m)',      weight: 2,   value: 60,  category: 'Tools' },
      { id: 7, name: 'GPS Device',     weight: 1,   value: 75,  category: 'Navigation' },
      { id: 8, name: 'Camera',         weight: 2,   value: 40,  category: 'Optional' },
      { id: 9, name: 'Extra Clothes',  weight: 3,   value: 30,  category: 'Clothing' },
    ],
  },
  {
    id: 'investment',
    name: 'Investment Portfolio',
    description: 'Allocate budget across projects to maximize expected return',
    icon: '💼',
    capacity: 50,
    capacityUnit: '$K',
    items: [
      { id: 1, name: 'AI Startup',      weight: 20, value: 150, category: 'Tech' },
      { id: 2, name: 'Real Estate',     weight: 30, value: 120, category: 'Property' },
      { id: 3, name: 'Green Energy',    weight: 15, value: 90,  category: 'Energy' },
      { id: 4, name: 'Biotech Fund',    weight: 25, value: 130, category: 'Health' },
      { id: 5, name: 'E-commerce',      weight: 10, value: 70,  category: 'Retail' },
      { id: 6, name: 'Crypto Index',    weight: 5,  value: 55,  category: 'Crypto' },
      { id: 7, name: 'Gov Bonds',       weight: 10, value: 35,  category: 'Bonds' },
    ],
  },
];
