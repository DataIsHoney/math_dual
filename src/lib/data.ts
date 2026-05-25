export type Difficulty = "easy" | "medium" | "hard";
export type TopicId =
  | "nikhilam-division"
  | "flag-division"
  | "divisibility"
  | "standard-division"
  | "fraction-crosswise"
  | "fraction-compare"
  | "gcd-simplify"
  | "mixed-improper";

export type Lesson = {
  id: TopicId;
  title: string;
  shortTitle: string;
  category: "Long Division" | "Fractions";
  minutes: string;
  reward: number;
  badge: string;
  demo: string[];
  examples: {
    title: string;
    problem: string;
    steps: string[];
  }[];
  guidedExample: string;
};

export const lessons: Lesson[] = [
  {
    id: "nikhilam-division",
    title: "Near-Base Division",
    shortTitle: "Nikhilam",
    category: "Long Division",
    minutes: "4 min",
    reward: 30,
    badge: "Base Breaker",
    demo: [
      "Spot a divisor near 10, 100, or 1000.",
      "Measure how far it is from that base.",
      "Use the small difference to shrink the work.",
    ],
    examples: [
      {
        title: "Near 10",
        problem: "72 ÷ 9",
        steps: ["9 is close to 10.", "Try 8 groups because 8 x 10 is 80.", "Check: 8 x 9 = 72, so the answer is 8."],
      },
      {
        title: "Near 100",
        problem: "396 ÷ 99",
        steps: ["99 is 1 less than 100.", "Try 4 because 4 x 100 is 400.", "Take away 4 more: 400 - 4 = 396, so the answer is 4."],
      },
    ],
    guidedExample: "For 72 ÷ 9, think 9 is 1 less than 10, then check with 9 x 8 = 72.",
  },
  {
    id: "flag-division",
    title: "Flag Method",
    shortTitle: "Flag",
    category: "Long Division",
    minutes: "5 min",
    reward: 35,
    badge: "Flag Flyer",
    demo: [
      "Break the divisor into tens and ones.",
      "Use the tens part to make a smart guess.",
      "Use the ones part to check and adjust the guess.",
    ],
    examples: [
      {
        title: "Why 12 Becomes 10 + 2",
        problem: "84 ÷ 12",
        steps: [
          "Think of 12 as 10 + 2. The 10 is the easy main part, and the 2 is the flag part.",
          "Ask: about how many groups of 10 fit in 84? Seven groups gives 7 x 10 = 70.",
          "Now check the flag part too: 7 groups also need 7 x 2 = 14.",
          "Put both parts together: 70 + 14 = 84. That exactly matches, so 84 ÷ 12 = 7.",
        ],
      },
      {
        title: "Try, Check, Adjust",
        problem: "156 ÷ 13",
        steps: [
          "Think of 13 as 10 + 3.",
          "Start with the easy part: 12 groups of 10 makes 120.",
          "Check the flag part: 12 groups of 3 makes 36 more.",
          "Add the parts: 120 + 36 = 156. The guess works, so 156 ÷ 13 = 12.",
        ],
      },
    ],
    guidedExample: "For this first version, use the flag idea as a smarter check: split 12 into 10 + 2, guess with 10, then check with the extra 2.",
  },
  {
    id: "divisibility",
    title: "Divisibility Shortcuts",
    shortTitle: "Divisibility",
    category: "Long Division",
    minutes: "3 min",
    reward: 25,
    badge: "Shortcut Scout",
    demo: [
      "For 3 and 9, add the digits.",
      "For 11, compare alternating digit sums.",
      "Use the shortcut before you start long division.",
    ],
    examples: [
      {
        title: "Rule for 9",
        problem: "Is 729 divisible by 9?",
        steps: ["Add the digits: 7 + 2 + 9 = 18.", "18 is divisible by 9.", "So 729 is divisible by 9."],
      },
      {
        title: "Rule for 11",
        problem: "Is 121 divisible by 11?",
        steps: ["Add alternating digits: 1 + 1 = 2.", "Compare with the middle digit: 2.", "They match, so 121 is divisible by 11."],
      },
    ],
    guidedExample: "729 works for 9 because 7 + 2 + 9 = 18, and 18 is divisible by 9.",
  },
  {
    id: "standard-division",
    title: "Long Division Fallback",
    shortTitle: "Fallback",
    category: "Long Division",
    minutes: "4 min",
    reward: 25,
    badge: "Steady Solver",
    demo: [
      "Divide the first useful chunk.",
      "Multiply, subtract, and bring down.",
      "Repeat until the remainder is smaller than the divisor.",
    ],
    examples: [
      {
        title: "Fact Family",
        problem: "96 ÷ 8",
        steps: ["8 goes into 9 one time.", "Bring the 6 beside the 1 leftover to make 16.", "8 goes into 16 two times, so the answer is 12."],
      },
      {
        title: "Quick Check",
        problem: "56 ÷ 7",
        steps: ["Think of the matching multiplication fact.", "7 x 8 = 56.", "So 56 ÷ 7 = 8."],
      },
    ],
    guidedExample: "96 ÷ 8 is 12 because 8 goes into 9 once, then into 16 twice.",
  },
  {
    id: "fraction-crosswise",
    title: "Crosswise Fraction Add",
    shortTitle: "Crosswise",
    category: "Fractions",
    minutes: "5 min",
    reward: 35,
    badge: "Crosswise Captain",
    demo: [
      "Cross multiply the opposite numerator and denominator.",
      "Add or subtract those cross-products.",
      "Multiply the denominators for the bottom number, then simplify.",
    ],
    examples: [
      {
        title: "Unlike Denominators",
        problem: "1/3 + 1/4",
        steps: ["Cross multiply: 1 x 4 = 4 and 1 x 3 = 3.", "Add the tops: 4 + 3 = 7.", "Multiply the bottoms: 3 x 4 = 12, so the answer is 7/12."],
      },
      {
        title: "Simplify After",
        problem: "1/2 + 1/4",
        steps: ["Cross multiply: 1 x 4 = 4 and 1 x 2 = 2.", "4 + 2 = 6, and 2 x 4 = 8.", "6/8 simplifies to 3/4."],
      },
    ],
    guidedExample: "1/3 + 1/4 becomes (1x4 + 1x3) / 12 = 7/12.",
  },
  {
    id: "fraction-compare",
    title: "Compare Fractions Fast",
    shortTitle: "Compare",
    category: "Fractions",
    minutes: "3 min",
    reward: 25,
    badge: "Fraction Judge",
    demo: [
      "Cross multiply the two fractions.",
      "Compare the two cross-products.",
      "The bigger cross-product points to the bigger fraction.",
    ],
    examples: [
      {
        title: "Left Is Bigger",
        problem: "2/5 ? 3/8",
        steps: ["Cross multiply left: 2 x 8 = 16.", "Cross multiply right: 3 x 5 = 15.", "16 is bigger, so 2/5 > 3/8."],
      },
      {
        title: "Right Is Bigger",
        problem: "1/3 ? 2/5",
        steps: ["Cross multiply left: 1 x 5 = 5.", "Cross multiply right: 2 x 3 = 6.", "6 is bigger, so 1/3 < 2/5."],
      },
    ],
    guidedExample: "2/5 vs 3/8: 2x8 = 16 and 3x5 = 15, so 2/5 is bigger.",
  },
  {
    id: "gcd-simplify",
    title: "Simplify With GCD",
    shortTitle: "Simplify",
    category: "Fractions",
    minutes: "4 min",
    reward: 30,
    badge: "GCD Genius",
    demo: [
      "Find a number that divides the top and bottom.",
      "Divide both numbers by it.",
      "Repeat until no shared factor is left.",
    ],
    examples: [
      {
        title: "Divide by 6",
        problem: "18/24",
        steps: ["18 and 24 can both be divided by 6.", "18 ÷ 6 = 3 and 24 ÷ 6 = 4.", "So 18/24 simplifies to 3/4."],
      },
      {
        title: "Divide by 4",
        problem: "12/20",
        steps: ["12 and 20 can both be divided by 4.", "12 ÷ 4 = 3 and 20 ÷ 4 = 5.", "So 12/20 simplifies to 3/5."],
      },
    ],
    guidedExample: "18/24 has GCD 6, so it simplifies to 3/4.",
  },
  {
    id: "mixed-improper",
    title: "Mixed and Improper",
    shortTitle: "Mixed",
    category: "Fractions",
    minutes: "4 min",
    reward: 30,
    badge: "Mixer Master",
    demo: [
      "Mixed to improper: multiply whole by denominator.",
      "Add the numerator.",
      "Keep the same denominator.",
    ],
    examples: [
      {
        title: "Two Wholes",
        problem: "2 1/3",
        steps: ["Multiply the whole by the bottom: 2 x 3 = 6.", "Add the top: 6 + 1 = 7.", "Keep the bottom, so 2 1/3 = 7/3."],
      },
      {
        title: "Three Wholes",
        problem: "3 2/5",
        steps: ["Multiply: 3 x 5 = 15.", "Add: 15 + 2 = 17.", "Keep the bottom, so 3 2/5 = 17/5."],
      },
    ],
    guidedExample: "2 1/3 becomes (2x3 + 1)/3 = 7/3.",
  },
];

export const camTaunts = [
  "I warmed up with 12 times tables. Your move.",
  "My pencil is already smoking.",
  "Hope you brought your shortcut brain today.",
  "I only race fair. Mostly.",
];

export const powerUps = [
  "Hint",
  "50/50",
  "Time Freeze",
  "Cam Stumble",
  "Double Coins",
  "Skip",
] as const;

export const storePool = [
  { id: "star-cap", name: "Star Cap", price: 80, rarity: "rare", type: "Hat" },
  { id: "blue-flame", name: "Blue Flame Theme", price: 140, rarity: "epic", type: "Theme" },
  { id: "extra-spin", name: "Extra Spin", price: 45, rarity: "common", type: "Power-up" },
  { id: "hint-token", name: "Hint Lens", price: 35, rarity: "common", type: "Power-up" },
  { id: "option-eraser", name: "Option Eraser", price: 65, rarity: "rare", type: "Power-up" },
  { id: "gold-hoodie", name: "Gold Hoodie", price: 110, rarity: "rare", type: "Avatar" },
  { id: "cam-sassy", name: "Sassy Cam Pack", price: 95, rarity: "rare", type: "Taunts" },
  { id: "space-board", name: "Space Board", price: 160, rarity: "epic", type: "Theme" },
  { id: "mint-sneaks", name: "Mint Sneakers", price: 70, rarity: "common", type: "Avatar" },
  { id: "freeze-card", name: "Freeze Card", price: 60, rarity: "common", type: "Power-up" },
  { id: "coin-charm", name: "Coin Charm", price: 90, rarity: "rare", type: "Power-up" },
  { id: "stumble-card", name: "Stumble Card", price: 75, rarity: "rare", type: "Power-up" },
  { id: "skip-pass", name: "Skip Pass", price: 120, rarity: "epic", type: "Power-up" },
  { id: "crown-cap", name: "Crown Cap", price: 220, rarity: "legendary", type: "Hat" },
] as const;
