export type AlgorithmKey = 'dp' | 'greedy' | 'backtracking' | 'branch-bound';

export interface CodeDef {
  filename: string;
  language: string;
  code: string;
  getHighlightLine: (stepType: string, message: string) => number | null;
}

// ─── Dynamic Programming ───────────────────────────────────────────────────
const dpCode = `function knapsackDP(items, W) {
  const n = items.length;
  const dp = Array(n + 1).fill(null)
    .map(() => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (items[i - 1].weight <= w) {
        const take = items[i - 1].value
          + dp[i - 1][w - items[i - 1].weight];
        const skip = dp[i - 1][w];
        dp[i][w] = Math.max(take, skip);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Traceback to find selected items
  const selected = [];
  let rem = W;
  for (let i = n; i > 0 && rem > 0; i--) {
    if (dp[i][rem] !== dp[i - 1][rem]) {
      selected.push(items[i - 1]);
      rem -= items[i - 1].weight;
    }
  }
  return { dp, selected };
}`;

// ─── Greedy ────────────────────────────────────────────────────────────────
const greedyCode = `function knapsackGreedy(items, W) {
  // Sort by value/weight ratio (descending)
  const sorted = [...items].sort((a, b) =>
    (b.value / b.weight) - (a.value / a.weight)
  );

  let totalWeight = 0, totalValue = 0;
  const selected = [];

  for (const item of sorted) {
    // Consider item by value/weight ratio
    if (totalWeight + item.weight <= W) {
      selected.push(item);
      totalWeight += item.weight;
      totalValue  += item.value;
    } else {
      // Skip — adding would exceed capacity
      continue;
    }
  }

  return { selected, totalValue, totalWeight };
}`;

// ─── Backtracking ──────────────────────────────────────────────────────────
const backtrackingCode = `function knapsackBacktrack(items, W) {
  let maxVal = 0;
  let best = [];

  function backtrack(i, weight, value, current) {
    if (i === items.length) {
      if (value > maxVal) {
        maxVal = value;
        best = [...current];
      }
      return;
    }

    // Explore: try including items[i]
    if (weight + items[i].weight <= W) {
      current.push(items[i]);
      backtrack(
        i + 1,
        weight + items[i].weight,
        value  + items[i].value,
        current
      );
      current.pop(); // backtrack
    } else {
      // Prune — item exceeds remaining capacity
    }

    // Try skipping items[i]
    backtrack(i + 1, weight, value, current);
  }

  backtrack(0, 0, 0, []);
  return best;
}`;

// ─── Branch & Bound ────────────────────────────────────────────────────────
const branchBoundCode = `function knapsackBranchBound(items, W) {
  // Sort by value/weight ratio
  const sorted = [...items].sort(byRatio);

  function bound(level, weight, value) {
    let b = value, w = weight;
    for (let j = level + 1; j < sorted.length; j++) {
      if (w + sorted[j].weight <= W) {
        w += sorted[j].weight;
        b += sorted[j].value;
      } else {
        b += (W - w) * (sorted[j].value / sorted[j].weight);
        break;
      }
    }
    return b;
  }

  const queue = [{ level: -1, value: 0, weight: 0 }];
  let maxVal = 0, best = [];

  while (queue.length > 0) {
    // Pop highest-bound node (best-first)
    queue.sort((a, b) => b.bound - a.bound);
    const u = queue.shift();
    // Explore node at next level
    if (u.bound <= maxVal) {
      // Prune — bound can't beat current best
      continue;
    }
    // Branch: include next item
    const v1 = include(u);
    if (v1.value > maxVal) maxVal = v1.value;
    if (v1.bound > maxVal) queue.push(v1);
    // Branch: exclude next item
    const v2 = exclude(u);
    if (v2.bound > maxVal) queue.push(v2);
  }
  return best;
}`;

// ─── Step → line mappings (1-indexed) ─────────────────────────────────────
function dpHighlight(stepType: string, message: string): number | null {
  if (stepType === 'fill-cell') {
    if (message.includes('max(')) return 12;
    return 14;
  }
  return null;
}

function greedyHighlight(stepType: string): number | null {
  if (stepType === 'consider-item') return 11;
  if (stepType === 'select-item')   return 12;
  if (stepType === 'reject-item')   return 17;
  return null;
}

function backtrackHighlight(stepType: string): number | null {
  if (stepType === 'explore-node') return 13;
  if (stepType === 'select-item')  return 15;
  if (stepType === 'backtrack')    return 21;
  if (stepType === 'prune')        return 23;
  if (stepType === 'reject-item')  return 26;
  return null;
}

function branchBoundHighlight(stepType: string): number | null {
  if (stepType === 'explore-node') return 25;
  if (stepType === 'prune')        return 27;
  if (stepType === 'select-item')  return 30;
  if (stepType === 'reject-item')  return 33;
  return null;
}

export const ALGORITHM_CODE: Record<AlgorithmKey, CodeDef> = {
  dp: {
    filename: 'knapsack-dp.ts',
    language: 'typescript',
    code: dpCode,
    getHighlightLine: dpHighlight,
  },
  greedy: {
    filename: 'knapsack-greedy.ts',
    language: 'typescript',
    code: greedyCode,
    getHighlightLine: (t) => greedyHighlight(t),
  },
  backtracking: {
    filename: 'knapsack-backtrack.ts',
    language: 'typescript',
    code: backtrackingCode,
    getHighlightLine: (t) => backtrackHighlight(t),
  },
  'branch-bound': {
    filename: 'knapsack-branch-bound.ts',
    language: 'typescript',
    code: branchBoundCode,
    getHighlightLine: (t) => branchBoundHighlight(t),
  },
};
