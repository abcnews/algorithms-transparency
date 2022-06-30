<script lang="ts">
  import { sum } from 'd3';
  import { sankeyTop, sankeyAlignJustify, sankeyLinkVertical } from 'jtfell-d3-sankey';
  import {
    genNodes,
    genLinks,
  } from './data';
  import NationParticles from './NationParticles.svelte';

  // const margin = { top: 0, bottom: 0, left: 0, right: 0 };
  // const margin = { top: 25, bottom: 25, left: 25, right: 25 };
  const margin = { top: 5, bottom: 5, left: 5, right: 5 };
  const padding = 10;
  const psize = 4;
  const speed = 2;

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let results: any;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: bandWidth = innerWidth / 4 - padding / 3;

  $: sankeyHeight = innerHeight * 0.75;

  // Draw links based on the first results structure (it will be the same for both)
  $: nodes = genNodes(results[0].outcome);
  $: links = genLinks(results[0].outcome);
  $: sankey = sankeyTop()
      .nodeId(d => d.name)
      .nodeAlign(sankeyAlignJustify)
      .nodeWidth(1)
      .nodePadding(padding)
      .size([innerWidth, sankeyHeight])
    ({
      nodes: nodes.map(n => ({ ...n, fixedValue: 1 })), // `fixedValue`, because all nodes have fixed height
      links: links.map(l => ({ ...l, value: 0 })) // `value: 0`, to start links from a single point
    });
    
  $: centeredLinks = sankey.links.map(l => {
    return {
      ...l,
      y0: l.y0 + bandWidth / 2,
      y1: l.y1 + bandWidth / 2,
    };
  });

  let finishedParticles = {
    low: {
      approved: [0, 0],
      rejected: [0, 0],
    },
    med: {
      approved: [0, 0],
      rejected: [0, 0],
    },
    high: {
      approved: [0, 0],
      rejected: [0, 0],
    },
  };
  const onUpdateFinishedParticles = (nation, finished) => {
    const nationId = results.findIndex(r => r.nation.name === nation.name);
    if (nationId === -1) {
      throw new Error('no good');
    }

    finishedParticles.low.approved[nationId] = finished.low.approved;
    finishedParticles.low.rejected[nationId] = finished.low.rejected;
    finishedParticles.med.approved[nationId] = finished.med.approved;
    finishedParticles.med.rejected[nationId] = finished.med.rejected;
    finishedParticles.high.approved[nationId] = finished.high.approved;
    finishedParticles.high.rejected[nationId] = finished.high.rejected;
  };

  $: BAR_WIDTH = bandWidth / 3;
</script>

<g class="wrapper" width={width} height={height}>
  <g transform="translate({margin.left}, {margin.top})">
    <g class="links">
      {#each centeredLinks as link}
        <path
          d={sankeyLinkVertical()(link)} 
          stroke-width={bandWidth}
        />
      {/each}
    </g>

    {#each results as result}
      <NationParticles
        width={innerWidth}
        height={sankeyHeight}
        {bandWidth}
        {progressPercentage}
        {result}
        {psize}
        {padding}
        {speed}
        {onUpdateFinishedParticles}
      />
    {/each}

    <g class="labels">
      <g transform="translate({innerWidth - 40}, {40})" text-anchor="end">
        <text>Year: 2015</text>
      </g>

      {#each centeredLinks as link}
        <rect
          x={link.y1 - (bandWidth / 4) - BAR_WIDTH / 2}
          y={sankeyHeight + 5}
          width={BAR_WIDTH}
          height={sum(finishedParticles[link.target.name].approved) / 100 * (innerHeight * 0.25) + 5}
          fill={'green'}
          opacity={0.4}
        />
        <rect
          x={link.y1 - (bandWidth / 4) - BAR_WIDTH / 2 + (BAR_WIDTH / 4)}
          y={sankeyHeight + 5}
          width={BAR_WIDTH / 2}
          height={finishedParticles[link.target.name].approved[0] * (innerHeight * 0.25) / 100}
          fill={'orange'}
          opacity={0.8}
        />
        <rect
          x={link.y1 - (bandWidth / 4) - BAR_WIDTH / 2 + (BAR_WIDTH / 4)}
          y={sankeyHeight + 5 + finishedParticles[link.target.name].approved[0] * (innerHeight * 0.25) / 100}
          width={BAR_WIDTH / 2}
          height={finishedParticles[link.target.name].approved[1] * (innerHeight * 0.25) / 100}
          fill={'blue'}
          opacity={0.8}
        />

        <rect
          x={link.y1 + (bandWidth / 4) - BAR_WIDTH / 2}
          y={sankeyHeight + 5}
          width={BAR_WIDTH}
          height={sum(finishedParticles[link.target.name].rejected) / 100 * (innerHeight * 0.25) + 5}
          fill={'red'}
          opacity={0.4}
        />
        <rect
          x={link.y1 + (bandWidth / 4) - BAR_WIDTH / 2 + (BAR_WIDTH / 4)}
          y={sankeyHeight + 5}
          width={BAR_WIDTH / 2}
          height={finishedParticles[link.target.name].rejected[0] * (innerHeight * 0.25) / 100}
          fill={'orange'}
          opacity={0.8}
        />
        <rect
          x={link.y1 + (bandWidth / 4) - BAR_WIDTH / 2 + (BAR_WIDTH / 4)}
          y={sankeyHeight + 5 + finishedParticles[link.target.name].rejected[0] * (innerHeight * 0.25) / 100}
          width={BAR_WIDTH / 2}
          height={finishedParticles[link.target.name].rejected[1] * (innerHeight * 0.25) / 100}
          fill={'blue'}
          opacity={0.8}
        />

        <g transform="translate({link.y1}, {sankeyHeight - 20})" text-anchor="middle">
          <text>{link.target.name}</text>
        </g>
      {/each}
    </g>
  </g>
</g>


<style>
  .links {
    fill: none;
    stroke-opacity: 0.8;
    stroke: rgb(238, 238, 238);
  }

  .labels {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
