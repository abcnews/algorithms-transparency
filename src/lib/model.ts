import { INITIAL_YEAR, AUS, INDIA, REJECTION_RATES } from '../constants';

// Must add up to 1
interface RiskDist {
  low: number;
  med: number;
  high: number;
}

// A point in time (one year)
interface Nation {
  name: string;
  colour: string;
  numberOfApplicants: number;
  dist: RiskDist;
}

interface RejectionRates {
  low: number;
  med: number;
  high: number;
}

interface SimulationResult {
  nation: Nation;
  rejectionRate: number;
  outcome: {
    low: {
      approved: number;
      rejected: number;
    };
    med: {
      approved: number;
      rejected: number;
    };
    high: {
      approved: number;
      rejected: number;
    };
  };
}

export const simulate = (nation: Nation, rates: RejectionRates): SimulationResult => {
  const { name, numberOfApplicants, dist } = nation;
  const outcome = {
    low: {
      rejected: numberOfApplicants * dist.low * rates.low,
      approved: numberOfApplicants * dist.low * (1 - rates.low)
    },
    med: {
      rejected: numberOfApplicants * dist.med * rates.med,
      approved: numberOfApplicants * dist.med * (1 - rates.med)
    },
    high: {
      rejected: numberOfApplicants * dist.high * rates.high,
      approved: numberOfApplicants * dist.high * (1 - rates.high)
    }
  };

  return {
    nation,
    rejectionRate: (outcome.low.rejected + outcome.med.rejected + outcome.high.rejected) / numberOfApplicants,
    outcome
  };
};

const getRejectionRate = (result: SimulationResult): number => {
  const {
    outcome: { low, med, high },
    nation
  } = result;

  return (low.rejected + med.rejected + high.rejected) / nation.numberOfApplicants;
};

export const updateNation = (nation: Nation, results: SimulationResult[]): Nation => {
  const thisResult = results.find(r => r.nation.name === nation.name);
  const otherResult = results.find(r => r.nation.name !== nation.name);
  if (results.length !== 2 || !thisResult || !otherResult) {
    throw new Error('Bad results');
  }

  const thisRR = getRejectionRate(thisResult);
  const otherRR = getRejectionRate(otherResult);

  const ratio = Math.max(0.5, Math.min(2, thisRR / otherRR));

  // Set the ratio of high vs low risk people to be equal to the ratio between the rejection rates
  const high = (1 / 3) * ratio;
  const low = 2 / 3 - high;

  // Leave medium-risk dist equal
  const med = 1 / 3;

  return {
    ...nation,
    dist: { low, med, high }
  };
};

export const runSimulation = (year: number): SimulationResult[] => {
  if (year < INITIAL_YEAR) {
    throw new Error(`Cant run sim before ${INITIAL_YEAR}`);
  }

  let australia = AUS;
  let india = INDIA;

  let results: SimulationResult[] = [];
  for (let y = INITIAL_YEAR; y <= year; y++) {
    const ausRes = simulate(australia, REJECTION_RATES);
    const indRes = simulate(india, REJECTION_RATES);
    results = [ausRes, indRes];

    australia = updateNation(australia, results);
    india = updateNation(india, results);
  }

  return results;
};
