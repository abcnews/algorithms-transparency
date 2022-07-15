export interface RiskDist {
  low: number;
  med: number;
  high: number;
}

export const calcDist = (rate1: number, rate2: number): any => {
  const ratio = Math.max(0.5, Math.min(2, (rate1 - 0.09) / (rate2 - 0.09)));

  // Set the ratio of high vs low risk people to be equal to the ratio between the rejection rates
  const high = (1 / 3) * ratio;
  const low = 2 / 3 - high;

  // Leave medium-risk dist equal
  const med = 1 - high - low;

  return { low, med, high };
};
