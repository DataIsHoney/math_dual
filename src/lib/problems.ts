import type { Difficulty, TopicId } from "./data";

export type Problem = {
  prompt: string;
  answer: string;
  choices: string[];
  hint: string;
  explanation: string;
};

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const withChoices = (answer: string, wrong: string[]): string[] => {
  const wrongChoices = [...new Set(wrong.filter((choice) => choice !== answer))].slice(0, 3);
  return shuffle([answer, ...wrongChoices]);
};

const rangeFor = (difficulty: Difficulty) => {
  if (difficulty === "hard") return [6, 14] as const;
  if (difficulty === "medium") return [4, 10] as const;
  return [2, 8] as const;
};

function divisionProblem(divisors: number[], difficulty: Difficulty, hint: string): Problem {
  const [low, high] = rangeFor(difficulty);
  const divisor = divisors[rand(0, divisors.length - 1)];
  const quotient = rand(low, high);
  const answer = String(quotient);
  return {
    prompt: `${divisor * quotient} ÷ ${divisor}`,
    answer,
    choices: withChoices(answer, [quotient + 1, quotient - 1, quotient + 2, quotient * 2].map(String)),
    hint,
    explanation: `${divisor} x ${quotient} = ${divisor * quotient}, so ${divisor * quotient} ÷ ${divisor} = ${quotient}.`,
  };
}

function divisibilityProblem(difficulty: Difficulty): Problem {
  const options = difficulty === "hard" ? [9, 11] : [3, 9, 11];
  const divisor = options[rand(0, options.length - 1)];
  const base = rand(20, difficulty === "hard" ? 600 : 180);
  const number = Math.random() > 0.35 ? base * divisor : base * divisor + rand(1, divisor - 1);
  const answer = number % divisor === 0 ? "Yes" : "No";
  return {
    prompt: `Is ${number} divisible by ${divisor}?`,
    answer,
    choices: ["Yes", "No"],
    hint: divisor === 11 ? "Compare alternating digit sums." : "Add the digits first.",
    explanation:
      divisor === 11
        ? `${number} ${answer === "Yes" ? "passes" : "does not pass"} the 11 shortcut, so the answer is ${answer}.`
        : `The remainder for ${number} ÷ ${divisor} is ${number % divisor}, so the answer is ${answer}.`,
  };
}

function fractionAddProblem(difficulty: Difficulty): Problem {
  const max = difficulty === "hard" ? 10 : difficulty === "medium" ? 8 : 6;
  const a = rand(1, max - 2);
  const b = rand(a + 1, max);
  const c = rand(1, max - 2);
  const d = rand(c + 1, max);
  const numerator = a * d + c * b;
  const denominator = b * d;
  const factor = gcd(numerator, denominator);
  const answer = `${numerator / factor}/${denominator / factor}`;
  return {
    prompt: `${a}/${b} + ${c}/${d}`,
    answer,
    choices: withChoices(answer, [`${a + c}/${b + d}`, `${numerator}/${denominator}`, `${a * c}/${b * d}`]),
    hint: "Cross multiply, add, then simplify.",
    explanation: `Cross multiply: ${a}x${d} + ${c}x${b} = ${numerator}. Bottom: ${b}x${d} = ${denominator}. Simplify to ${answer}.`,
  };
}

function fractionCompareProblem(difficulty: Difficulty): Problem {
  const max = difficulty === "hard" ? 12 : 8;
  const a = rand(1, max - 1);
  const b = rand(a + 1, max + 2);
  const c = rand(1, max - 1);
  const d = rand(c + 1, max + 2);
  const left = a * d;
  const right = c * b;
  const answer = left === right ? "=" : left > right ? ">" : "<";
  return {
    prompt: `${a}/${b} ? ${c}/${d}`,
    answer,
    choices: [">", "<", "="],
    hint: `Compare ${a}x${d} and ${c}x${b}.`,
    explanation: `${a}x${d} = ${left}, and ${c}x${b} = ${right}. Since ${left} ${answer} ${right}, ${a}/${b} ${answer} ${c}/${d}.`,
  };
}

function simplifyProblem(difficulty: Difficulty): Problem {
  const factor = rand(2, difficulty === "hard" ? 9 : 6);
  const top = rand(2, 8);
  const bottom = rand(top + 1, 12);
  const g = gcd(top, bottom);
  const simpleTop = top / g;
  const simpleBottom = bottom / g;
  const answer = `${simpleTop}/${simpleBottom}`;
  return {
    prompt: `Simplify ${top * factor}/${bottom * factor}`,
    answer,
    choices: withChoices(answer, [`${top}/${bottom}`, `${top * factor}/${bottom * factor}`, `${simpleBottom}/${simpleTop}`]),
    hint: "Divide the top and bottom by their biggest shared factor.",
    explanation: `Divide the top and bottom by ${factor * g}: ${top * factor} ÷ ${factor * g} = ${simpleTop}, and ${bottom * factor} ÷ ${factor * g} = ${simpleBottom}.`,
  };
}

function mixedProblem(difficulty: Difficulty): Problem {
  const whole = rand(1, difficulty === "hard" ? 6 : 4);
  const denominator = rand(3, difficulty === "hard" ? 12 : 8);
  const numerator = rand(1, denominator - 1);
  const answer = `${whole * denominator + numerator}/${denominator}`;
  return {
    prompt: `Change ${whole} ${numerator}/${denominator} to an improper fraction`,
    answer,
    choices: withChoices(answer, [`${whole + numerator}/${denominator}`, `${whole * numerator}/${denominator}`, `${denominator * whole}/${numerator}`]),
    hint: "Whole times denominator, then add the numerator.",
    explanation: `${whole} x ${denominator} = ${whole * denominator}, then ${whole * denominator} + ${numerator} = ${whole * denominator + numerator}. Keep the denominator: ${answer}.`,
  };
}

export function generateProblem(topic: TopicId, difficulty: Difficulty = "easy"): Problem {
  switch (topic) {
    case "nikhilam-division":
      return divisionProblem([9, 11, 99], difficulty, "Use the nearby base to estimate, then confirm by multiplying.");
    case "flag-division":
      return divisionProblem([12, 13, 14, 21], difficulty, "Use the first digit to guide the division, then check the whole divisor.");
    case "divisibility":
      return divisibilityProblem(difficulty);
    case "standard-division":
      return divisionProblem([4, 5, 6, 7, 8], difficulty, "Divide, multiply, subtract, bring down.");
    case "fraction-crosswise":
      return fractionAddProblem(difficulty);
    case "fraction-compare":
      return fractionCompareProblem(difficulty);
    case "gcd-simplify":
      return simplifyProblem(difficulty);
    case "mixed-improper":
      return mixedProblem(difficulty);
    default:
      return divisionProblem([3], difficulty, "Break the problem into smaller chunks.");
  }
}

export function generateSet(topic: TopicId, difficulty: Difficulty, count: number) {
  return Array.from({ length: count }, () => generateProblem(topic, difficulty));
}
