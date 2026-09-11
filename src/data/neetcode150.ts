import type { Chapter, Problem, TopicId } from '../types'

type Seed = {
  order: number
  title: string
  difficulty: Problem['difficulty']
  topic: TopicId
  pattern: string
  slug: string
  phase: 1 | 2
  chapterId: string
  effortDays: number
  whyThis: string
}

const why = {
  foundation: 'Builds a core pattern you will reuse across interviews and production debugging.',
  transfer: 'Strengthens pattern recognition — the skill that separates grinding from readiness.',
  depth: 'Deepens an advanced variant so mediums stop feeling novel under pressure.',
  design: 'Touches design + data-structure tradeoffs you already reason about in distributed systems.',
  graph: 'Graph thinking maps cleanly onto cluster topology, replication sets, and dependency graphs.',
  dp: 'Teaches state decomposition — the same mental model as caching layers and incremental compute.',
}

const seeds: Seed[] = [
  // —— Phase 1: Foundation ——
  { order: 1, title: 'Contains Duplicate', difficulty: 'Easy', topic: 'arrays-hashing', pattern: 'Hash Set', slug: 'contains-duplicate', phase: 1, chapterId: 'ch-arrays', effortDays: 0.4, whyThis: why.foundation },
  { order: 2, title: 'Valid Anagram', difficulty: 'Easy', topic: 'arrays-hashing', pattern: 'Frequency Map', slug: 'valid-anagram', phase: 1, chapterId: 'ch-arrays', effortDays: 0.4, whyThis: why.foundation },
  { order: 3, title: 'Two Sum', difficulty: 'Easy', topic: 'arrays-hashing', pattern: 'Hash Map Lookup', slug: 'two-sum', phase: 1, chapterId: 'ch-arrays', effortDays: 0.5, whyThis: why.foundation },
  { order: 4, title: 'Group Anagrams', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Hash Map + Canonical Key', slug: 'group-anagrams', phase: 1, chapterId: 'ch-arrays', effortDays: 1, whyThis: why.transfer },
  { order: 5, title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Heap / Bucket Sort', slug: 'top-k-frequent-elements', phase: 1, chapterId: 'ch-arrays', effortDays: 1.2, whyThis: why.transfer },
  { order: 6, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Prefix / Suffix', slug: 'product-of-array-except-self', phase: 1, chapterId: 'ch-arrays', effortDays: 1.2, whyThis: why.transfer },
  { order: 7, title: 'Valid Sudoku', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Hash Set Constraints', slug: 'valid-sudoku', phase: 1, chapterId: 'ch-arrays', effortDays: 1, whyThis: why.foundation },
  { order: 8, title: 'Encode and Decode Strings', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Serialization', slug: 'encode-and-decode-strings', phase: 1, chapterId: 'ch-arrays', effortDays: 1.2, whyThis: 'Serialization discipline — same instinct as framing network payloads.' },
  { order: 9, title: 'Longest Consecutive Sequence', difficulty: 'Medium', topic: 'arrays-hashing', pattern: 'Hash Set Stretch', slug: 'longest-consecutive-sequence', phase: 1, chapterId: 'ch-arrays', effortDays: 1.3, whyThis: why.transfer },

  { order: 10, title: 'Valid Palindrome', difficulty: 'Easy', topic: 'two-pointers', pattern: 'Two Pointers', slug: 'valid-palindrome', phase: 1, chapterId: 'ch-two-pointers', effortDays: 0.4, whyThis: why.foundation },
  { order: 11, title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', topic: 'two-pointers', pattern: 'Two Pointers', slug: 'two-sum-ii-input-array-is-sorted', phase: 1, chapterId: 'ch-two-pointers', effortDays: 0.8, whyThis: why.foundation },
  { order: 12, title: '3Sum', difficulty: 'Medium', topic: 'two-pointers', pattern: 'Sort + Two Pointers', slug: '3sum', phase: 1, chapterId: 'ch-two-pointers', effortDays: 1.5, whyThis: why.transfer },
  { order: 13, title: 'Container With Most Water', difficulty: 'Medium', topic: 'two-pointers', pattern: 'Greedy Two Pointers', slug: 'container-with-most-water', phase: 1, chapterId: 'ch-two-pointers', effortDays: 1.2, whyThis: why.transfer },
  { order: 14, title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'two-pointers', pattern: 'Two Pointers / Stack', slug: 'trapping-rain-water', phase: 1, chapterId: 'ch-two-pointers', effortDays: 2.5, whyThis: why.depth },

  { order: 15, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'sliding-window', pattern: 'Running Min', slug: 'best-time-to-buy-and-sell-stock', phase: 1, chapterId: 'ch-sliding', effortDays: 0.5, whyThis: why.foundation },
  { order: 16, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'sliding-window', pattern: 'Variable Window', slug: 'longest-substring-without-repeating-characters', phase: 1, chapterId: 'ch-sliding', effortDays: 1.2, whyThis: why.transfer },
  { order: 17, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', topic: 'sliding-window', pattern: 'Variable Window', slug: 'longest-repeating-character-replacement', phase: 1, chapterId: 'ch-sliding', effortDays: 1.4, whyThis: why.transfer },
  { order: 18, title: 'Permutation in String', difficulty: 'Medium', topic: 'sliding-window', pattern: 'Fixed Window', slug: 'permutation-in-string', phase: 1, chapterId: 'ch-sliding', effortDays: 1.2, whyThis: why.foundation },
  { order: 19, title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'sliding-window', pattern: 'Variable Window', slug: 'minimum-window-substring', phase: 1, chapterId: 'ch-sliding', effortDays: 2.5, whyThis: why.depth },
  { order: 20, title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'sliding-window', pattern: 'Monotonic Deque', slug: 'sliding-window-maximum', phase: 1, chapterId: 'ch-sliding', effortDays: 2.5, whyThis: why.depth },

  { order: 21, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'stack', pattern: 'Stack Matching', slug: 'valid-parentheses', phase: 1, chapterId: 'ch-stack', effortDays: 0.4, whyThis: why.foundation },
  { order: 22, title: 'Min Stack', difficulty: 'Medium', topic: 'stack', pattern: 'Auxiliary Stack', slug: 'min-stack', phase: 1, chapterId: 'ch-stack', effortDays: 1, whyThis: why.design },
  { order: 23, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', topic: 'stack', pattern: 'Stack Evaluation', slug: 'evaluate-reverse-polish-notation', phase: 1, chapterId: 'ch-stack', effortDays: 1, whyThis: why.foundation },
  { order: 24, title: 'Generate Parentheses', difficulty: 'Medium', topic: 'stack', pattern: 'Backtracking + Stack', slug: 'generate-parentheses', phase: 1, chapterId: 'ch-stack', effortDays: 1.3, whyThis: why.transfer },
  { order: 25, title: 'Daily Temperatures', difficulty: 'Medium', topic: 'stack', pattern: 'Monotonic Stack', slug: 'daily-temperatures', phase: 1, chapterId: 'ch-stack', effortDays: 1.3, whyThis: why.transfer },
  { order: 26, title: 'Car Fleet', difficulty: 'Medium', topic: 'stack', pattern: 'Stack + Sort', slug: 'car-fleet', phase: 1, chapterId: 'ch-stack', effortDays: 1.4, whyThis: why.transfer },
  { order: 27, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topic: 'stack', pattern: 'Monotonic Stack', slug: 'largest-rectangle-in-histogram', phase: 1, chapterId: 'ch-stack', effortDays: 2.8, whyThis: why.depth },

  { order: 28, title: 'Binary Search', difficulty: 'Easy', topic: 'binary-search', pattern: 'Classic Binary Search', slug: 'binary-search', phase: 1, chapterId: 'ch-binary', effortDays: 0.4, whyThis: why.foundation },
  { order: 29, title: 'Search a 2D Matrix', difficulty: 'Medium', topic: 'binary-search', pattern: 'Matrix Binary Search', slug: 'search-a-2d-matrix', phase: 1, chapterId: 'ch-binary', effortDays: 1, whyThis: why.foundation },
  { order: 30, title: 'Koko Eating Bananas', difficulty: 'Medium', topic: 'binary-search', pattern: 'Binary Search on Answer', slug: 'koko-eating-bananas', phase: 1, chapterId: 'ch-binary', effortDays: 1.4, whyThis: 'Search-on-answer is capacity planning in disguise — think throughput vs deadline.' },
  { order: 31, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', topic: 'binary-search', pattern: 'Rotated Array', slug: 'find-minimum-in-rotated-sorted-array', phase: 1, chapterId: 'ch-binary', effortDays: 1.2, whyThis: why.transfer },
  { order: 32, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'binary-search', pattern: 'Rotated Array', slug: 'search-in-rotated-sorted-array', phase: 1, chapterId: 'ch-binary', effortDays: 1.4, whyThis: why.transfer },
  { order: 33, title: 'Time Based Key-Value Store', difficulty: 'Medium', topic: 'binary-search', pattern: 'Binary Search + Design', slug: 'time-based-key-value-store', phase: 1, chapterId: 'ch-binary', effortDays: 1.5, whyThis: 'Versioned lookups — conceptually adjacent to point-in-time reads in storage systems.' },
  { order: 34, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'binary-search', pattern: 'Partition Binary Search', slug: 'median-of-two-sorted-arrays', phase: 1, chapterId: 'ch-binary', effortDays: 3, whyThis: why.depth },

  { order: 35, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'linked-list', pattern: 'Pointer Rewiring', slug: 'reverse-linked-list', phase: 1, chapterId: 'ch-linked', effortDays: 0.5, whyThis: why.foundation },
  { order: 36, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'linked-list', pattern: 'Two Pointers', slug: 'merge-two-sorted-lists', phase: 1, chapterId: 'ch-linked', effortDays: 0.5, whyThis: why.foundation },
  { order: 37, title: 'Reorder List', difficulty: 'Medium', topic: 'linked-list', pattern: 'Split + Reverse + Merge', slug: 'reorder-list', phase: 1, chapterId: 'ch-linked', effortDays: 1.3, whyThis: why.transfer },
  { order: 38, title: 'Remove Nth Node From End of List', difficulty: 'Medium', topic: 'linked-list', pattern: 'Two Pointers', slug: 'remove-nth-node-from-end-of-list', phase: 1, chapterId: 'ch-linked', effortDays: 1, whyThis: why.foundation },
  { order: 39, title: 'Copy List with Random Pointer', difficulty: 'Medium', topic: 'linked-list', pattern: 'Clone with Map', slug: 'copy-list-with-random-pointer', phase: 1, chapterId: 'ch-linked', effortDays: 1.4, whyThis: why.design },
  { order: 40, title: 'Add Two Numbers', difficulty: 'Medium', topic: 'linked-list', pattern: 'Simulation', slug: 'add-two-numbers', phase: 1, chapterId: 'ch-linked', effortDays: 1, whyThis: why.foundation },
  { order: 41, title: 'Linked List Cycle', difficulty: 'Easy', topic: 'linked-list', pattern: "Floyd's Cycle", slug: 'linked-list-cycle', phase: 1, chapterId: 'ch-linked', effortDays: 0.6, whyThis: why.foundation },
  { order: 42, title: 'Find the Duplicate Number', difficulty: 'Medium', topic: 'linked-list', pattern: "Floyd's Cycle", slug: 'find-the-duplicate-number', phase: 1, chapterId: 'ch-linked', effortDays: 1.4, whyThis: why.transfer },
  { order: 43, title: 'LRU Cache', difficulty: 'Medium', topic: 'linked-list', pattern: 'Hash Map + DLL', slug: 'lru-cache', phase: 1, chapterId: 'ch-linked', effortDays: 2, whyThis: 'Cache eviction policy — same family of tradeoffs as storage page caches and CDN TTLs.' },
  { order: 44, title: 'Merge k Sorted Lists', difficulty: 'Hard', topic: 'linked-list', pattern: 'Heap / Divide & Conquer', slug: 'merge-k-sorted-lists', phase: 1, chapterId: 'ch-linked', effortDays: 2.5, whyThis: why.depth },
  { order: 45, title: 'Reverse Nodes in k-Group', difficulty: 'Hard', topic: 'linked-list', pattern: 'Segment Reversal', slug: 'reverse-nodes-in-k-group', phase: 1, chapterId: 'ch-linked', effortDays: 2.8, whyThis: why.depth },

  { order: 46, title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS/BFS', slug: 'invert-binary-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.4, whyThis: why.foundation },
  { order: 47, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS/BFS', slug: 'maximum-depth-of-binary-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.4, whyThis: why.foundation },
  { order: 48, title: 'Diameter of Binary Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS Postorder', slug: 'diameter-of-binary-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.8, whyThis: why.foundation },
  { order: 49, title: 'Balanced Binary Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS Height', slug: 'balanced-binary-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.7, whyThis: why.foundation },
  { order: 50, title: 'Same Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS/BFS', slug: 'same-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.4, whyThis: why.foundation },
  { order: 51, title: 'Subtree of Another Tree', difficulty: 'Easy', topic: 'trees', pattern: 'DFS Match', slug: 'subtree-of-another-tree', phase: 1, chapterId: 'ch-trees', effortDays: 0.8, whyThis: why.foundation },
  { order: 52, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium', topic: 'trees', pattern: 'BST Property', slug: 'lowest-common-ancestor-of-a-binary-search-tree', phase: 1, chapterId: 'ch-trees', effortDays: 1, whyThis: why.transfer },
  { order: 53, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'trees', pattern: 'BFS', slug: 'binary-tree-level-order-traversal', phase: 1, chapterId: 'ch-trees', effortDays: 1, whyThis: why.foundation },
  { order: 54, title: 'Binary Tree Right Side View', difficulty: 'Medium', topic: 'trees', pattern: 'BFS/DFS', slug: 'binary-tree-right-side-view', phase: 1, chapterId: 'ch-trees', effortDays: 1.1, whyThis: why.transfer },
  { order: 55, title: 'Count Good Nodes in Binary Tree', difficulty: 'Medium', topic: 'trees', pattern: 'DFS Path State', slug: 'count-good-nodes-in-binary-tree', phase: 1, chapterId: 'ch-trees', effortDays: 1.1, whyThis: why.transfer },
  { order: 56, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'trees', pattern: 'Bounds DFS', slug: 'validate-binary-search-tree', phase: 1, chapterId: 'ch-trees', effortDays: 1.3, whyThis: why.transfer },
  { order: 57, title: 'Kth Smallest Element in a BST', difficulty: 'Medium', topic: 'trees', pattern: 'Inorder', slug: 'kth-smallest-element-in-a-bst', phase: 1, chapterId: 'ch-trees', effortDays: 1.1, whyThis: why.transfer },
  { order: 58, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', topic: 'trees', pattern: 'Tree Construction', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', phase: 1, chapterId: 'ch-trees', effortDays: 1.6, whyThis: why.depth },
  { order: 59, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', topic: 'trees', pattern: 'DFS Path Gain', slug: 'binary-tree-maximum-path-sum', phase: 2, chapterId: 'ch-adv-trees', effortDays: 2.5, whyThis: why.depth },
  { order: 60, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'trees', pattern: 'Serialization', slug: 'serialize-and-deserialize-binary-tree', phase: 2, chapterId: 'ch-adv-trees', effortDays: 2.5, whyThis: why.design },

  { order: 64, title: 'Kth Largest Element in a Stream', difficulty: 'Easy', topic: 'heap', pattern: 'Min Heap', slug: 'kth-largest-element-in-a-stream', phase: 1, chapterId: 'ch-heap', effortDays: 0.8, whyThis: why.foundation },
  { order: 65, title: 'Last Stone Weight', difficulty: 'Easy', topic: 'heap', pattern: 'Max Heap', slug: 'last-stone-weight', phase: 1, chapterId: 'ch-heap', effortDays: 0.6, whyThis: why.foundation },
  { order: 66, title: 'K Closest Points to Origin', difficulty: 'Medium', topic: 'heap', pattern: 'Heap Selection', slug: 'k-closest-points-to-origin', phase: 1, chapterId: 'ch-heap', effortDays: 1.1, whyThis: why.transfer },
  { order: 67, title: 'Kth Largest Element in an Array', difficulty: 'Medium', topic: 'heap', pattern: 'Quickselect / Heap', slug: 'kth-largest-element-in-an-array', phase: 1, chapterId: 'ch-heap', effortDays: 1.3, whyThis: why.transfer },
  { order: 68, title: 'Task Scheduler', difficulty: 'Medium', topic: 'heap', pattern: 'Greedy + Heap', slug: 'task-scheduler', phase: 1, chapterId: 'ch-heap', effortDays: 1.6, whyThis: 'Scheduling with cooldown — cousin to job queues and rate-limited workers.' },
  { order: 69, title: 'Design Twitter', difficulty: 'Medium', topic: 'heap', pattern: 'Heap Merge Design', slug: 'design-twitter', phase: 2, chapterId: 'ch-design-ds', effortDays: 2, whyThis: why.design },
  { order: 70, title: 'Find Median from Data Stream', difficulty: 'Hard', topic: 'heap', pattern: 'Two Heaps', slug: 'find-median-from-data-stream', phase: 2, chapterId: 'ch-design-ds', effortDays: 2.5, whyThis: why.depth },

  { order: 71, title: 'Subsets', difficulty: 'Medium', topic: 'backtracking', pattern: 'Include/Exclude', slug: 'subsets', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.1, whyThis: why.foundation },
  { order: 72, title: 'Combination Sum', difficulty: 'Medium', topic: 'backtracking', pattern: 'Choose Reuse', slug: 'combination-sum', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.2, whyThis: why.foundation },
  { order: 73, title: 'Permutations', difficulty: 'Medium', topic: 'backtracking', pattern: 'Swap / Used Array', slug: 'permutations', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.2, whyThis: why.foundation },
  { order: 74, title: 'Subsets II', difficulty: 'Medium', topic: 'backtracking', pattern: 'Duplicate Skipping', slug: 'subsets-ii', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.3, whyThis: why.transfer },
  { order: 75, title: 'Combination Sum II', difficulty: 'Medium', topic: 'backtracking', pattern: 'Duplicate Skipping', slug: 'combination-sum-ii', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.3, whyThis: why.transfer },
  { order: 76, title: 'Word Search', difficulty: 'Medium', topic: 'backtracking', pattern: 'Grid DFS', slug: 'word-search', phase: 1, chapterId: 'ch-backtracking', effortDays: 1.4, whyThis: why.transfer },
  { order: 77, title: 'Palindrome Partitioning', difficulty: 'Medium', topic: 'backtracking', pattern: 'Partition DFS', slug: 'palindrome-partitioning', phase: 2, chapterId: 'ch-adv-backtracking', effortDays: 1.8, whyThis: why.depth },
  { order: 78, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', topic: 'backtracking', pattern: 'Digit Map DFS', slug: 'letter-combinations-of-a-phone-number', phase: 1, chapterId: 'ch-backtracking', effortDays: 1, whyThis: why.foundation },
  { order: 79, title: 'N-Queens', difficulty: 'Hard', topic: 'backtracking', pattern: 'Constraint DFS', slug: 'n-queens', phase: 2, chapterId: 'ch-adv-backtracking', effortDays: 2.5, whyThis: why.depth },

  { order: 80, title: 'Number of Islands', difficulty: 'Medium', topic: 'graphs', pattern: 'DFS/BFS Flood Fill', slug: 'number-of-islands', phase: 1, chapterId: 'ch-graphs', effortDays: 1.2, whyThis: why.graph },
  { order: 81, title: 'Clone Graph', difficulty: 'Medium', topic: 'graphs', pattern: 'Graph Clone', slug: 'clone-graph', phase: 1, chapterId: 'ch-graphs', effortDays: 1.3, whyThis: why.graph },
  { order: 82, title: 'Max Area of Island', difficulty: 'Medium', topic: 'graphs', pattern: 'DFS Area', slug: 'max-area-of-island', phase: 1, chapterId: 'ch-graphs', effortDays: 1, whyThis: why.graph },
  { order: 83, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', topic: 'graphs', pattern: 'Multi-source DFS', slug: 'pacific-atlantic-water-flow', phase: 1, chapterId: 'ch-graphs', effortDays: 1.6, whyThis: why.graph },
  { order: 84, title: 'Surrounded Regions', difficulty: 'Medium', topic: 'graphs', pattern: 'Border DFS', slug: 'surrounded-regions', phase: 1, chapterId: 'ch-graphs', effortDays: 1.4, whyThis: why.graph },
  { order: 85, title: 'Rotting Oranges', difficulty: 'Medium', topic: 'graphs', pattern: 'Multi-source BFS', slug: 'rotting-oranges', phase: 1, chapterId: 'ch-graphs', effortDays: 1.4, whyThis: 'Propagation over a grid — same intuition as failure fan-out in a cluster.' },
  { order: 86, title: 'Walls and Gates', difficulty: 'Medium', topic: 'graphs', pattern: 'Multi-source BFS', slug: 'walls-and-gates', phase: 1, chapterId: 'ch-graphs', effortDays: 1.4, whyThis: why.graph },
  { order: 87, title: 'Course Schedule', difficulty: 'Medium', topic: 'graphs', pattern: 'Topological Sort', slug: 'course-schedule', phase: 1, chapterId: 'ch-graphs', effortDays: 1.5, whyThis: 'Dependency cycles — the same question as build graphs and service boot order.' },
  { order: 88, title: 'Course Schedule II', difficulty: 'Medium', topic: 'graphs', pattern: 'Topological Sort', slug: 'course-schedule-ii', phase: 2, chapterId: 'ch-topo-uf', effortDays: 1.4, whyThis: why.graph },
  { order: 89, title: 'Redundant Connection', difficulty: 'Medium', topic: 'graphs', pattern: 'Union Find', slug: 'redundant-connection', phase: 2, chapterId: 'ch-topo-uf', effortDays: 1.4, whyThis: why.graph },
  { order: 90, title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium', topic: 'graphs', pattern: 'Union Find / DFS', slug: 'number-of-connected-components-in-an-undirected-graph', phase: 2, chapterId: 'ch-topo-uf', effortDays: 1.2, whyThis: why.graph },
  { order: 91, title: 'Graph Valid Tree', difficulty: 'Medium', topic: 'graphs', pattern: 'Union Find / DFS', slug: 'graph-valid-tree', phase: 2, chapterId: 'ch-topo-uf', effortDays: 1.3, whyThis: why.graph },
  { order: 92, title: 'Word Ladder', difficulty: 'Hard', topic: 'graphs', pattern: 'BFS Shortest Path', slug: 'word-ladder', phase: 2, chapterId: 'ch-shortest', effortDays: 2.5, whyThis: why.depth },

  { order: 99, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'dp-1d', pattern: 'Basic DP', slug: 'climbing-stairs', phase: 1, chapterId: 'ch-dp1', effortDays: 0.5, whyThis: why.dp },
  { order: 100, title: 'Min Cost Climbing Stairs', difficulty: 'Easy', topic: 'dp-1d', pattern: 'Basic DP', slug: 'min-cost-climbing-stairs', phase: 1, chapterId: 'ch-dp1', effortDays: 0.6, whyThis: why.dp },
  { order: 101, title: 'House Robber', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Linear DP', slug: 'house-robber', phase: 1, chapterId: 'ch-dp1', effortDays: 1.1, whyThis: why.dp },
  { order: 102, title: 'House Robber II', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Circular DP', slug: 'house-robber-ii', phase: 1, chapterId: 'ch-dp1', effortDays: 1.3, whyThis: why.dp },
  { order: 103, title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Expand / DP', slug: 'longest-palindromic-substring', phase: 1, chapterId: 'ch-dp1', effortDays: 1.4, whyThis: why.dp },
  { order: 104, title: 'Palindromic Substrings', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Expand Centers', slug: 'palindromic-substrings', phase: 1, chapterId: 'ch-dp1', effortDays: 1.1, whyThis: why.dp },
  { order: 105, title: 'Decode Ways', difficulty: 'Medium', topic: 'dp-1d', pattern: 'String DP', slug: 'decode-ways', phase: 1, chapterId: 'ch-dp1', effortDays: 1.5, whyThis: why.dp },
  { order: 106, title: 'Coin Change', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Unbounded Knapsack', slug: 'coin-change', phase: 1, chapterId: 'ch-dp1', effortDays: 1.5, whyThis: why.dp },
  { order: 107, title: 'Maximum Product Subarray', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Running Extrema', slug: 'maximum-product-subarray', phase: 2, chapterId: 'ch-adv-dp', effortDays: 1.5, whyThis: why.dp },
  { order: 108, title: 'Word Break', difficulty: 'Medium', topic: 'dp-1d', pattern: 'String DP', slug: 'word-break', phase: 2, chapterId: 'ch-adv-dp', effortDays: 1.5, whyThis: why.dp },
  { order: 109, title: 'Longest Increasing Subsequence', difficulty: 'Medium', topic: 'dp-1d', pattern: 'DP + Binary Search', slug: 'longest-increasing-subsequence', phase: 2, chapterId: 'ch-adv-dp', effortDays: 1.8, whyThis: why.dp },
  { order: 110, title: 'Partition Equal Subset Sum', difficulty: 'Medium', topic: 'dp-1d', pattern: 'Subset Sum', slug: 'partition-equal-subset-sum', phase: 2, chapterId: 'ch-adv-dp', effortDays: 1.6, whyThis: why.dp },

  { order: 130, title: 'Insert Interval', difficulty: 'Medium', topic: 'intervals', pattern: 'Interval Merge', slug: 'insert-interval', phase: 1, chapterId: 'ch-intervals', effortDays: 1.2, whyThis: why.foundation },
  { order: 131, title: 'Merge Intervals', difficulty: 'Medium', topic: 'intervals', pattern: 'Interval Merge', slug: 'merge-intervals', phase: 1, chapterId: 'ch-intervals', effortDays: 1.1, whyThis: why.foundation },
  { order: 132, title: 'Non-overlapping Intervals', difficulty: 'Medium', topic: 'intervals', pattern: 'Greedy Intervals', slug: 'non-overlapping-intervals', phase: 1, chapterId: 'ch-intervals', effortDays: 1.2, whyThis: why.transfer },
  { order: 133, title: 'Meeting Rooms', difficulty: 'Easy', topic: 'intervals', pattern: 'Sort Check', slug: 'meeting-rooms', phase: 1, chapterId: 'ch-intervals', effortDays: 0.5, whyThis: why.foundation },
  { order: 134, title: 'Meeting Rooms II', difficulty: 'Medium', topic: 'intervals', pattern: 'Heap / Sweep', slug: 'meeting-rooms-ii', phase: 1, chapterId: 'ch-intervals', effortDays: 1.4, whyThis: 'Resource conflict counting — like capacity planning across overlapping leases.' },
  { order: 150, title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', topic: 'intervals', pattern: 'Sort + Heap', slug: 'minimum-interval-to-include-each-query', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 2.5, whyThis: why.depth },

  // —— Phase 2: Deepening ——
  { order: 61, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', topic: 'tries', pattern: 'Trie Design', slug: 'implement-trie-prefix-tree', phase: 2, chapterId: 'ch-tries', effortDays: 1.4, whyThis: why.design },
  { order: 62, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', topic: 'tries', pattern: 'Trie + Wildcard', slug: 'design-add-and-search-words-data-structure', phase: 2, chapterId: 'ch-tries', effortDays: 1.6, whyThis: why.design },
  { order: 63, title: 'Word Search II', difficulty: 'Hard', topic: 'tries', pattern: 'Trie + Backtracking', slug: 'word-search-ii', phase: 2, chapterId: 'ch-tries', effortDays: 2.8, whyThis: why.depth },

  { order: 93, title: 'Reconstruct Itinerary', difficulty: 'Hard', topic: 'advanced-graphs', pattern: 'Eulerian Path', slug: 'reconstruct-itinerary', phase: 2, chapterId: 'ch-shortest', effortDays: 2.5, whyThis: why.graph },
  { order: 94, title: 'Min Cost to Connect All Points', difficulty: 'Medium', topic: 'advanced-graphs', pattern: 'MST', slug: 'min-cost-to-connect-all-points', phase: 2, chapterId: 'ch-shortest', effortDays: 1.8, whyThis: 'Minimum spanning cost — kinship with interconnect / fabric planning.' },
  { order: 95, title: 'Network Delay Time', difficulty: 'Medium', topic: 'advanced-graphs', pattern: "Dijkstra", slug: 'network-delay-time', phase: 2, chapterId: 'ch-shortest', effortDays: 1.8, whyThis: 'Latency to all nodes — pure distributed-systems intuition.' },
  { order: 96, title: 'Swim in Rising Water', difficulty: 'Hard', topic: 'advanced-graphs', pattern: 'Dijkstra / Binary Search', slug: 'swim-in-rising-water', phase: 2, chapterId: 'ch-shortest', effortDays: 2.5, whyThis: why.depth },
  { order: 97, title: 'Alien Dictionary', difficulty: 'Hard', topic: 'advanced-graphs', pattern: 'Topological Sort', slug: 'alien-dictionary', phase: 2, chapterId: 'ch-topo-uf', effortDays: 2.5, whyThis: why.graph },
  { order: 98, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', topic: 'advanced-graphs', pattern: 'Bellman-Ford / Dijkstra', slug: 'cheapest-flights-within-k-stops', phase: 2, chapterId: 'ch-shortest', effortDays: 2, whyThis: 'Bounded-hop routing — think overlay networks with hop limits.' },

  { order: 111, title: 'Unique Paths', difficulty: 'Medium', topic: 'dp-2d', pattern: 'Grid DP', slug: 'unique-paths', phase: 2, chapterId: 'ch-dp2', effortDays: 1.1, whyThis: why.dp },
  { order: 112, title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'dp-2d', pattern: 'String DP', slug: 'longest-common-subsequence', phase: 2, chapterId: 'ch-dp2', effortDays: 1.5, whyThis: why.dp },
  { order: 113, title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', topic: 'dp-2d', pattern: 'State Machine DP', slug: 'best-time-to-buy-and-sell-stock-with-cooldown', phase: 2, chapterId: 'ch-dp2', effortDays: 1.6, whyThis: why.dp },
  { order: 114, title: 'Coin Change II', difficulty: 'Medium', topic: 'dp-2d', pattern: 'Unbounded Knapsack', slug: 'coin-change-ii', phase: 2, chapterId: 'ch-dp2', effortDays: 1.4, whyThis: why.dp },
  { order: 115, title: 'Target Sum', difficulty: 'Medium', topic: 'dp-2d', pattern: 'Subset Sum', slug: 'target-sum', phase: 2, chapterId: 'ch-dp2', effortDays: 1.4, whyThis: why.dp },
  { order: 116, title: 'Interleaving String', difficulty: 'Medium', topic: 'dp-2d', pattern: 'String DP', slug: 'interleaving-string', phase: 2, chapterId: 'ch-dp2', effortDays: 1.8, whyThis: why.dp },
  { order: 117, title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard', topic: 'dp-2d', pattern: 'DFS + Memo', slug: 'longest-increasing-path-in-a-matrix', phase: 2, chapterId: 'ch-dp2', effortDays: 2.3, whyThis: why.dp },
  { order: 118, title: 'Distinct Subsequences', difficulty: 'Hard', topic: 'dp-2d', pattern: 'String DP', slug: 'distinct-subsequences', phase: 2, chapterId: 'ch-dp2', effortDays: 2.3, whyThis: why.dp },
  { order: 119, title: 'Edit Distance', difficulty: 'Medium', topic: 'dp-2d', pattern: 'String DP', slug: 'edit-distance', phase: 2, chapterId: 'ch-dp2', effortDays: 1.8, whyThis: why.dp },
  { order: 120, title: 'Burst Balloons', difficulty: 'Hard', topic: 'dp-2d', pattern: 'Interval DP', slug: 'burst-balloons', phase: 2, chapterId: 'ch-dp2', effortDays: 3, whyThis: why.depth },
  { order: 121, title: 'Regular Expression Matching', difficulty: 'Hard', topic: 'dp-2d', pattern: 'String DP', slug: 'regular-expression-matching', phase: 2, chapterId: 'ch-dp2', effortDays: 3, whyThis: why.depth },

  { order: 122, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'greedy', pattern: "Kadane's", slug: 'maximum-subarray', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1, whyThis: why.transfer },
  { order: 123, title: 'Jump Game', difficulty: 'Medium', topic: 'greedy', pattern: 'Reach Greedy', slug: 'jump-game', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.1, whyThis: why.transfer },
  { order: 124, title: 'Jump Game II', difficulty: 'Medium', topic: 'greedy', pattern: 'Level Greedy', slug: 'jump-game-ii', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.3, whyThis: why.transfer },
  { order: 125, title: 'Gas Station', difficulty: 'Medium', topic: 'greedy', pattern: 'Circuit Greedy', slug: 'gas-station', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.5, whyThis: why.transfer },
  { order: 126, title: 'Hand of Straights', difficulty: 'Medium', topic: 'greedy', pattern: 'Greedy Map', slug: 'hand-of-straights', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.3, whyThis: why.transfer },
  { order: 127, title: 'Merge Triplets to Form Target Triplet', difficulty: 'Medium', topic: 'greedy', pattern: 'Constraint Greedy', slug: 'merge-triplets-to-form-target-triplet', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.2, whyThis: why.transfer },
  { order: 128, title: 'Partition Labels', difficulty: 'Medium', topic: 'greedy', pattern: 'Last Index Greedy', slug: 'partition-labels', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.2, whyThis: why.transfer },
  { order: 129, title: 'Valid Parenthesis String', difficulty: 'Medium', topic: 'greedy', pattern: 'Greedy Balance', slug: 'valid-parenthesis-string', phase: 2, chapterId: 'ch-greedy-misc', effortDays: 1.5, whyThis: why.depth },

  { order: 135, title: 'Rotate Image', difficulty: 'Medium', topic: 'math-geometry', pattern: 'Matrix Transform', slug: 'rotate-image', phase: 2, chapterId: 'ch-math', effortDays: 1.1, whyThis: why.foundation },
  { order: 136, title: 'Spiral Matrix', difficulty: 'Medium', topic: 'math-geometry', pattern: 'Boundary Walk', slug: 'spiral-matrix', phase: 2, chapterId: 'ch-math', effortDays: 1.2, whyThis: why.foundation },
  { order: 137, title: 'Set Matrix Zeroes', difficulty: 'Medium', topic: 'math-geometry', pattern: 'In-place Markers', slug: 'set-matrix-zeroes', phase: 2, chapterId: 'ch-math', effortDays: 1.2, whyThis: why.foundation },
  { order: 138, title: 'Happy Number', difficulty: 'Easy', topic: 'math-geometry', pattern: 'Cycle Detect', slug: 'happy-number', phase: 2, chapterId: 'ch-math', effortDays: 0.5, whyThis: why.foundation },
  { order: 139, title: 'Plus One', difficulty: 'Easy', topic: 'math-geometry', pattern: 'Carry Propagation', slug: 'plus-one', phase: 2, chapterId: 'ch-math', effortDays: 0.4, whyThis: why.foundation },
  { order: 140, title: 'Pow(x, n)', difficulty: 'Medium', topic: 'math-geometry', pattern: 'Fast Exponentiation', slug: 'powx-n', phase: 2, chapterId: 'ch-math', effortDays: 1.1, whyThis: why.transfer },
  { order: 141, title: 'Multiply Strings', difficulty: 'Medium', topic: 'math-geometry', pattern: 'String Math', slug: 'multiply-strings', phase: 2, chapterId: 'ch-math', effortDays: 1.5, whyThis: why.transfer },
  { order: 142, title: 'Detect Squares', difficulty: 'Medium', topic: 'math-geometry', pattern: 'Geometry Hash', slug: 'detect-squares', phase: 2, chapterId: 'ch-math', effortDays: 1.6, whyThis: why.transfer },

  { order: 143, title: 'Single Number', difficulty: 'Easy', topic: 'bit-manipulation', pattern: 'XOR', slug: 'single-number', phase: 2, chapterId: 'ch-bits', effortDays: 0.4, whyThis: why.foundation },
  { order: 144, title: 'Number of 1 Bits', difficulty: 'Easy', topic: 'bit-manipulation', pattern: 'Bit Count', slug: 'number-of-1-bits', phase: 2, chapterId: 'ch-bits', effortDays: 0.4, whyThis: why.foundation },
  { order: 145, title: 'Counting Bits', difficulty: 'Easy', topic: 'bit-manipulation', pattern: 'DP + Bits', slug: 'counting-bits', phase: 2, chapterId: 'ch-bits', effortDays: 0.6, whyThis: why.foundation },
  { order: 146, title: 'Reverse Bits', difficulty: 'Easy', topic: 'bit-manipulation', pattern: 'Bit Reverse', slug: 'reverse-bits', phase: 2, chapterId: 'ch-bits', effortDays: 0.5, whyThis: why.foundation },
  { order: 147, title: 'Missing Number', difficulty: 'Easy', topic: 'bit-manipulation', pattern: 'XOR / Math', slug: 'missing-number', phase: 2, chapterId: 'ch-bits', effortDays: 0.5, whyThis: why.foundation },
  { order: 148, title: 'Sum of Two Integers', difficulty: 'Medium', topic: 'bit-manipulation', pattern: 'Bit Arithmetic', slug: 'sum-of-two-integers', phase: 2, chapterId: 'ch-bits', effortDays: 1.2, whyThis: why.transfer },
  { order: 149, title: 'Reverse Integer', difficulty: 'Medium', topic: 'bit-manipulation', pattern: 'Overflow Care', slug: 'reverse-integer', phase: 2, chapterId: 'ch-bits', effortDays: 0.9, whyThis: why.foundation },
]

const defaultRecall = (pattern: string): string[] => [
  `What pattern did you use here? (hint: ${pattern})`,
  'Why does this approach work — and when would it fail?',
  'What are the time and space complexities?',
  'Can you re-solve it tomorrow without looking?',
]

export const PROBLEMS: Problem[] = seeds
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((s) => ({
    id: `nc-${s.order}`,
    order: s.order,
    title: s.title,
    difficulty: s.difficulty,
    topic: s.topic,
    pattern: s.pattern,
    leetcodeUrl: `https://leetcode.com/problems/${s.slug}/`,
    phase: s.phase,
    chapterId: s.chapterId,
    effortDays: s.effortDays,
    whyThis: s.whyThis,
    recallPrompts: defaultRecall(s.pattern),
  }))

export const CHAPTERS: Chapter[] = [
  { id: 'ch-arrays', title: 'Chapter 1 — Signal in the Noise', subtitle: 'Arrays & Hashing', phase: 1, topic: 'arrays-hashing', order: 1, kind: 'chapter' },
  { id: 'ch-two-pointers', title: 'Chapter 2 — Converging Lines', subtitle: 'Two Pointers', phase: 1, topic: 'two-pointers', order: 2, kind: 'chapter' },
  { id: 'ch-sliding', title: 'Chapter 3 — Moving Windows', subtitle: 'Sliding Window', phase: 1, topic: 'sliding-window', order: 3, kind: 'chapter' },
  { id: 'ch-stack', title: 'Chapter 4 — Last In, First Insight', subtitle: 'Stack', phase: 1, topic: 'stack', order: 4, kind: 'chapter' },
  { id: 'ch-binary', title: 'Chapter 5 — Halving the Search', subtitle: 'Binary Search', phase: 1, topic: 'binary-search', order: 5, kind: 'chapter' },
  { id: 'ch-linked', title: 'Chapter 6 — Pointer Craft', subtitle: 'Linked List', phase: 1, topic: 'linked-list', order: 6, kind: 'chapter' },
  { id: 'ch-trees', title: 'Chapter 7 — Growing Structure', subtitle: 'Trees', phase: 1, topic: 'trees', order: 7, kind: 'chapter' },
  { id: 'ch-heap', title: 'Chapter 8 — Priority Under Pressure', subtitle: 'Heap / Priority Queue', phase: 1, topic: 'heap', order: 8, kind: 'chapter' },
  { id: 'ch-backtracking', title: 'Chapter 9 — Explore & Retreat', subtitle: 'Backtracking', phase: 1, topic: 'backtracking', order: 9, kind: 'chapter' },
  { id: 'ch-graphs', title: 'Chapter 10 — Connected Worlds', subtitle: 'Graphs', phase: 1, topic: 'graphs', order: 10, kind: 'chapter' },
  { id: 'ch-intervals', title: 'Chapter 11 — Overlap & Conflict', subtitle: 'Intervals', phase: 1, topic: 'intervals', order: 11, kind: 'chapter' },
  { id: 'ch-dp1', title: 'Chapter 12 — Optimal Substructure', subtitle: '1-D Dynamic Programming', phase: 1, topic: 'dp-1d', order: 12, kind: 'chapter' },
  { id: 'checkpoint-foundation', title: 'Foundation Checkpoint', subtitle: 'Can you still solve without help?', phase: 1, topic: 'arrays-hashing', order: 13, kind: 'checkpoint' },
  { id: 'ch-tries', title: 'Chapter 13 — Prefix Paths', subtitle: 'Tries', phase: 2, topic: 'tries', order: 14, kind: 'chapter' },
  { id: 'ch-topo-uf', title: 'Chapter 14 — Order & Components', subtitle: 'Topo Sort & Union Find', phase: 2, topic: 'graphs', order: 15, kind: 'chapter' },
  { id: 'ch-shortest', title: 'Chapter 15 — Shortest Paths', subtitle: 'Advanced Graphs', phase: 2, topic: 'advanced-graphs', order: 16, kind: 'chapter' },
  { id: 'ch-adv-trees', title: 'Chapter 16 — Tree Boss Fights', subtitle: 'Advanced Trees', phase: 2, topic: 'trees', order: 17, kind: 'boss' },
  { id: 'ch-adv-backtracking', title: 'Chapter 17 — Hard Constraints', subtitle: 'Advanced Backtracking', phase: 2, topic: 'backtracking', order: 18, kind: 'chapter' },
  { id: 'ch-adv-dp', title: 'Chapter 18 — Deeper 1-D DP', subtitle: 'Medium / Hard DP', phase: 2, topic: 'dp-1d', order: 19, kind: 'chapter' },
  { id: 'ch-dp2', title: 'Chapter 19 — Two Dimensions', subtitle: '2-D Dynamic Programming', phase: 2, topic: 'dp-2d', order: 20, kind: 'chapter' },
  { id: 'ch-design-ds', title: 'Chapter 20 — Living Structures', subtitle: 'Design + Heaps', phase: 2, topic: 'heap', order: 21, kind: 'chapter' },
  { id: 'ch-greedy-misc', title: 'Chapter 21 — Local Optima', subtitle: 'Greedy & Intervals Deep', phase: 2, topic: 'greedy', order: 22, kind: 'chapter' },
  { id: 'ch-math', title: 'Chapter 22 — Shape & Number', subtitle: 'Math & Geometry', phase: 2, topic: 'math-geometry', order: 23, kind: 'chapter' },
  { id: 'ch-bits', title: 'Chapter 23 — Bitwise Clarity', subtitle: 'Bit Manipulation', phase: 2, topic: 'bit-manipulation', order: 24, kind: 'chapter' },
  { id: 'boss-finale', title: 'Final Approach', subtitle: 'Revision + interview readiness', phase: 2, topic: 'graphs', order: 25, kind: 'boss' },
]

export const TOPIC_LABEL: Record<TopicId, string> = {
  'arrays-hashing': 'Arrays & Hashing',
  'two-pointers': 'Two Pointers',
  'sliding-window': 'Sliding Window',
  stack: 'Stack',
  'binary-search': 'Binary Search',
  'linked-list': 'Linked List',
  trees: 'Trees',
  tries: 'Tries',
  heap: 'Heap / Priority Queue',
  backtracking: 'Backtracking',
  graphs: 'Graphs',
  'advanced-graphs': 'Advanced Graphs',
  'dp-1d': '1-D DP',
  'dp-2d': '2-D DP',
  greedy: 'Greedy',
  intervals: 'Intervals',
  'math-geometry': 'Math & Geometry',
  'bit-manipulation': 'Bit Manipulation',
}

export function problemsForChapter(chapterId: string): Problem[] {
  return PROBLEMS.filter((p) => p.chapterId === chapterId)
}

export function getProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id)
}

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

export const PHASE1_COUNT = PROBLEMS.filter((p) => p.phase === 1).length
export const PHASE2_COUNT = PROBLEMS.filter((p) => p.phase === 2).length
