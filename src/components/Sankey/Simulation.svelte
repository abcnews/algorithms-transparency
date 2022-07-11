<script lang="ts">
  import AlgorithmViz from './AlgorithmViz.svelte';
  import { runSimulation } from '../../lib/model';

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let year: string;
  export let state: string | null;

  $: results = runSimulation(parseInt(year) || 2015);
</script>

{#if results.length}
  <AlgorithmViz
    {width}
    {height}
    {progressPercentage}
    {results}
    {year}
    {state}
  />
{/if}
