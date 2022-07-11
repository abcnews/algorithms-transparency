<script lang="ts">
  import { sum, range } from 'd3';
  import { sankeyTop, sankeyLinkVertical } from 'jtfell-d3-sankey';
  import {
    genNodes,
    genLinks,
  } from '../data';
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
  export let year: string;

  export let state: string | null;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: bandWidth = innerWidth / 4 - padding * 3;
  $: sankeyHeight = innerHeight * 0.75;

  // Draw links based on the first results structure (it will be the same for both)
  $: nodes = genNodes(results[0].outcome);
  $: links = genLinks(results[0].outcome);
  $: sankey = sankeyTop()
      .nodeId(d => d.name)
      .nodeWidth(1)
      .nodePadding(padding)
      .size([innerWidth, sankeyHeight])
    ({
      nodes: nodes.map(n => ({ ...n, fixedValue: 1 })), // `fixedValue`, because all nodes have fixed height
      links: links.map(l => ({ ...l, value: 0 })) // `value: 0`, to start links from a single point
    });
    
  $: centeredLinks = sankey.links.map(l => {
    const width = l.source.x1 - l.source.x0;
    return {
      ...l,
      y0: l.y0 + width / 2,
      y1: l.y1 + width / 2,
    };
  });

  $: finishedParticles = {
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
    total: {
      approved: [0, 0],
      rejected: [0, 0],
    },
  };

  let approvedCount0 = 0;
  let approvedCount1 = 0;
  let rejectedCount0 = 0;
  let rejectedCount1 = 0;

  const onUpdateFinishedParticles = (nation, finished) => {
    const nationId = results.findIndex(r => r.nation.name === nation.name);
    if (nationId === -1) {
      throw new Error('no good');
    }

    const low = finishedParticles.low;
    const med = finishedParticles.med;
    const high = finishedParticles.high;
    low.approved[nationId] = finished.low.approved;
    low.rejected[nationId] = finished.low.rejected;
    med.approved[nationId] = finished.med.approved;
    med.rejected[nationId] = finished.med.rejected;
    high.approved[nationId] = finished.high.approved;
    high.rejected[nationId] = finished.high.rejected;

    const total = {
      approved: [
        sum([low.approved[0], med.approved[0], high.approved[0]]),
        sum([low.approved[1], med.approved[1], high.approved[1]]),
      ],
      rejected: [
        sum([low.rejected[0], med.rejected[0], high.rejected[0]]),
        sum([low.rejected[1], med.rejected[1], high.rejected[1]]),
      ],
    };

    finishedParticles = { low, med, high, total };
    approvedCount0 = total.approved[0];
    approvedCount1 = total.approved[1];
    rejectedCount0 = total.rejected[0];
    rejectedCount1 = total.rejected[1];
  };

</script>

<svg {width} {height} viewBox="0 0 {width} {height}">
  <g class="wrapper" {width} {height}>
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

      {#if year !== 'none' && year !== 'historical'}
        <g
          transform="translate(0, {sankeyHeight + margin.bottom + padding})"
        >
          <text class="labels" x={8} y={15}>Approved</text>
          <rect
            x={5}
            width={innerWidth / 2 - 10}
            y={0}
            height={innerHeight * 0.25}
            fill={'green'}
            opacity={0.6}
          />
          {#each range(approvedCount0) as i}
            <rect
              class="particle"
              opacity="0.8"
              fill="blue"
              width={psize}
              height={(innerHeight * 0.25 - 20) * 0.5 - 20}
              x={7 + i}
              y={20}
            />
          {/each}
          {#each range(approvedCount1) as i}
            <rect
              class="particle"
              opacity="0.8"
              fill="orange"
              width={psize}
              height={(innerHeight * 0.25 - 20) * 0.5 - 20}
              x={7 + i}
              y={20 + (innerHeight * 0.25 - 20) * 0.25}
            />
          {/each}
          <text class="labels" x={5 + innerWidth / 2 + 8} y={15}>Rejected</text>
          <rect
            x={5 + innerWidth / 2}
            width={innerWidth / 2 - 10} 
            y={0}
            height={innerHeight * 0.25}
            fill={'red'}
            opacity={0.6}
          />

          {#each range(rejectedCount0) as i}
            <rect
              class="particle"
              opacity="0.8"
              fill="blue"
              width={psize}
              height={(innerHeight * 0.25 - 20) * 0.5 - 20}
              x={5 + innerWidth / 2 + 7 + i}
              y={20}
            />
          {/each}
          {#each range(rejectedCount1) as i}
            <rect
              class="particle"
              opacity="0.8"
              fill="orange"
              width={psize}
              height={(innerHeight * 0.25 - 20) * 0.5 - 20}
              x={5 + innerWidth / 2 + 7 + i}
              y={20 + (innerHeight * 0.25 - 20) * 0.25}
            />
          {/each}

        </g>
      {/if}

      <g class="labels">
        {#if year !== 'none'}
          <g transform="translate({innerWidth - 40}, {40})" text-anchor="end">
            <text>Year: {year}</text>
          </g>
        {/if}

        {#each centeredLinks as link}
          <g transform="translate({link.y1}, {sankeyHeight - 20})" text-anchor="middle">
            <text>{link.target.name}</text>
          </g>
        {/each}
      </g>
    </g>
  </g>
</svg>

<style>
  svg {
    background: rgb(31, 20, 41);
  }

  .links {
    fill: none;
    stroke-opacity: 1;
    stroke: var(--background-colour);
  }

  .wrapper {
    fill: black;
  }

  .labels {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
