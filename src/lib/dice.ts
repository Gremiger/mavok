export interface DiceRoll {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: number;
}

export function rollDice(expression: string): DiceRoll {
  const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice expression: ${expression}`);

  const count = parseInt(match[1]);
  const faces = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  const rolls = Array.from({ length: count }, () =>
    Math.floor(Math.random() * faces) + 1
  );

  return {
    expression,
    rolls,
    modifier,
    total: rolls.reduce((a, b) => a + b, 0) + modifier,
    timestamp: Date.now(),
  };
}

export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? "+" : ""}${modifier}`);
}

export function rollD20WithAdvantage(modifier: number = 0): DiceRoll {
  const d1 = Math.floor(Math.random() * 20) + 1;
  const d2 = Math.floor(Math.random() * 20) + 1;
  return {
    expression: `1d20adv${modifier >= 0 ? "+" : ""}${modifier}`,
    rolls: [d1, d2],
    modifier,
    total: Math.max(d1, d2) + modifier,
    timestamp: Date.now(),
  };
}
