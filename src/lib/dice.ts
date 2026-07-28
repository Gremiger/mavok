export interface DiceRoll {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: number;
}

export function parseExpression(
  expression: string
): { count: number; faces: number; modifier: number } {
  const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice expression: ${expression}`);
  return {
    count: parseInt(match[1]),
    faces: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0,
  };
}

export function generateFaces(count: number, faces: number): number[] {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * faces) + 1
  );
}

export function composeRoll(
  expression: string,
  rolls: number[],
  modifier: number
): DiceRoll {
  return {
    expression,
    rolls,
    modifier,
    total: rolls.reduce((a, b) => a + b, 0) + modifier,
    timestamp: Date.now(),
  };
}

export function rollDice(expression: string): DiceRoll {
  const { count, faces, modifier } = parseExpression(expression);
  return composeRoll(expression, generateFaces(count, faces), modifier);
}

export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? "+" : ""}${modifier}`);
}

export function rollD20WithAdvantage(modifier: number = 0): DiceRoll {
  const [d1, d2] = generateFaces(2, 20);
  return {
    expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
    rolls: [d1, d2],
    modifier,
    total: Math.max(d1, d2) + modifier,
    timestamp: Date.now(),
  };
}

function isD20Roll(roll: DiceRoll): boolean {
  return roll.expression.startsWith("1d20");
}

export function isD20Crit(roll: DiceRoll): boolean {
  return isD20Roll(roll) && roll.rolls.some((r) => r === 20);
}

export function isD20Fumble(roll: DiceRoll): boolean {
  return (
    isD20Roll(roll) &&
    roll.rolls.length > 0 &&
    roll.rolls.every((r) => r === 1)
  );
}

export async function rollDiceAsync(expression: string): Promise<DiceRoll> {
  return rollDice(expression);
}

export async function rollD20Async(modifier: number = 0): Promise<DiceRoll> {
  return rollD20(modifier);
}

export async function rollD20WithAdvantageAsync(
  modifier: number = 0
): Promise<DiceRoll> {
  return rollD20WithAdvantage(modifier);
}
