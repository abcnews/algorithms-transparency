<script lang="ts">
  import AlgorithmViz from './AlgorithmViz.svelte';
  import { runSimulation } from '../lib/model';

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let year: number;

  $: results = runSimulation(year);
</script>

{#if results.length}
  <AlgorithmViz
    {width}
    {height}
    {progressPercentage}
    {results}
    {year}
  />
{/if}
