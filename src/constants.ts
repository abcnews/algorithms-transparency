import { calcDist } from './lib/calc';

export const HISTORICAL_REJECTION_RATES = [0.26, 0.33];

export const RED = {
  name: 'RED',
  colour: '#FF645C',
  numberOfApplicants: 100,
  dist: calcDist(HISTORICAL_REJECTION_RATES[1], HISTORICAL_REJECTION_RATES[0]),
}

export const BLUE = {
  name: 'BLUE',
  colour: '#7085FF',
  numberOfApplicants: 100,
  dist: calcDist(HISTORICAL_REJECTION_RATES[0], HISTORICAL_REJECTION_RATES[1]),
}

// From "Experiments in Automating Immigration"
export const REJECTION_RATES = {
  low: 0.04,
  med: 0.3,
  high: 0.5,
};

export const INITIAL_YEAR = 2015;

export const PINK_BG = '#c5b8df';
export const DARK_BG = '#1B1023';
export const DARK_SCRIM = '#1D1326';
export const PINK_SCRIM = '#C5B9DE';

export const AUDIT_SCORECARD = [
  {
    label: 'Nationality',
    p1: 20,
    p2: 42,
  },
  {
    label: 'Age',
    p1: 36,
    p2: 32,
  },
  {
    label: 'Gender',
    p1: 32,
    p2: 31,
  },
];
const EVEN = {
  low: 1/3,
  med: 1/3,
  high: 1/3,
};
export const AUDIT_DATA = [
  {
    nation: { ...BLUE, numberOfApplicants: 150, dist: EVEN },
    rejectionRate: 0.22,
    outcome: {
      low: {
        approved: 74,
        rejected: 31,
      },
      med: {
        approved: 47,
        rejected: 32,
      },
      high: {
        approved: 17,
        rejected: 27,
      },
    },
  },
  {
    nation: { ...RED, numberOfApplicants: 150, dist: EVEN },
    rejectionRate: 0.24,
    outcome: {
      low: {
        approved: 97,
        rejected: 23,
      },
      med: {
        approved: 43,
        rejected: 33,
      },
      high: {
        approved: 19,
        rejected: 23,
      },
    },
  }
];
