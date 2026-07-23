type Category =
  | "planning"
  | "releases"
  | "ownership"
  | "validation"
  | "execution";

export interface ScoreInput {
  planning: boolean[];
  releases: boolean[];
  ownership: boolean[];
  validation: boolean[];
  execution: boolean[];
}

export interface Scorecard {
  categories: Record<Category, number>;
  total: number;
  tenOfTen: boolean;
}

export function calculateScorecard(input: ScoreInput): Scorecard {
  if (Object.values(input).some((evidence) => evidence.length !== 4)) {
    throw new Error("Each scorecard category requires exactly four criteria");
  }
  const names: Category[] = [
    "planning",
    "releases",
    "ownership",
    "validation",
    "execution",
  ];
  const categories = Object.fromEntries(
    names.map((name) => [
      name,
      input[name].reduce(
        (sum: number, present: boolean) => sum + (present ? 5 : 0),
        0,
      ),
    ]),
  ) as Record<Category, number>;
  const total = Object.values(categories).reduce(
    (sum, value) => sum + value,
    0,
  );
  return { categories, total, tenOfTen: total === 100 };
}
