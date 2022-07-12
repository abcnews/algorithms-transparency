<script lang="ts">
  import HistoricalDataPoint from './HistoricalDataPoint.svelte';

  export let width: number;
  export let height: number;
  export let results: Record<string, any>;
  export let year: string;
</script>

{#if year !== 'none'}
  <g class="historical-data-box">
    <rect
      x={0}
      width={width}
      y={0}
      height={height}
      fill={'rgba(36, 27, 45, 0.75)'}
    />
    <text class="label" x={width * 0.5} y={25} text-anchor="middle">
      Enforcement Rates
    </text>

    <g transform="translate(0, {0 * (height - 55) / 3 + 55})">
      <HistoricalDataPoint
        {width}
        label="Historic"
        result={results['historical']}
      />
    </g>

    {#if year == '2016' || year == '2017'}
      <g transform="translate(0, {1 * (height - 55) / 3 + 55})">
        <HistoricalDataPoint
          {width}
          label="2015"
          result={results['2015']}
        />
      </g>
    {/if}

    {#if year == '2017'}
      <g transform="translate(0, {2 * (height - 55) / 3 + 55})">
        <HistoricalDataPoint
          {width}
          label="2016"
          result={results['2016']}
        />
      </g>
    {/if}
  </g>
{/if}

<style>
  .label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    fill: white;
  }
</style>
