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
  }
}

export const simulate = (nation: Nation, rates: RejectionRates): SimulationResult => {
  const { name, numberOfApplicants, dist } = nation;
  return {
    nation,
    rejectionRate:
      (numberOfApplicants * dist.low * rates.low +
        numberOfApplicants * dist.med * rates.med +
        numberOfApplicants * dist.high * rates.high) /
      numberOfApplicants,
    outcome: {
      low: {
        rejected: numberOfApplicants * dist.low * rates.low,
        approved: numberOfApplicants * (1 - dist.low * rates.low)
      },
      med: {
        rejected: numberOfApplicants * dist.med * rates.med,
        approved: numberOfApplicants * (1 - dist.med * rates.med)
      },
      high: {
        rejected: numberOfApplicants * dist.high * rates.high,
        approved: numberOfApplicants * (1 - dist.high * rates.high)
      }
    }
  };
};

export const updateNation = (nation: Nation, results: SimulationResult[]): Nation => {
  const thisResults = results.find(r => r.nation.name === nation.name);
  const otherResults = results.find(r => r.nation.name !== nation.name);
  if (results.length !== 2 || !thisResults || !otherResults) {
    throw new Error('Bad results');
  }

  // const thisRR =
  //   thisResults.low.rejected + thisResults.med.rejected + thisResults.high.rejected / nation.numberOfApplicants;
  // const otherRR =
  //   otherResults.low.rejected + otherResults.med.rejected + otherResults.high.rejected / nation.numberOfApplicants;

  // TODO: Optimisation problem?
  const low = 0.4;
  const med = 0.4;
  const high = 0.2;

  return {
    ...nation,
    dist: { low, med, high }
  };
};

// List of SimulationResults is input into Sankey:
//
// {for result in results}
//   {for particle in result.particles}
//     <rect>
//
