<script lang="ts">
  import AlgorithmViz from './AlgorithmViz.svelte';
  import { runSimulation } from '../../lib/model';
  import { HISTORICAL_REJECTION_RATES } from '../../constants';

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let year: string;
  export let state: string | null;

  // Hardcode the historical rejection rates
  const historical = runSimulation(2015);
  historical[0].rejectionRate = HISTORICAL_REJECTION_RATES[0];
  historical[1].rejectionRate = HISTORICAL_REJECTION_RATES[1];

  const results = {
    'historical': historical,
    '2015': runSimulation(2015),
    '2016': runSimulation(2016),
    '2017': runSimulation(2017),
  };
</script>

<AlgorithmViz
  {width}
  {height}
  {progressPercentage}
  {results}
  {year}
  {state}
/>
