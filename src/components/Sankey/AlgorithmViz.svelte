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

  const TOP_PIPE_HEIGHT = 0.2;
  const SANKEY_HEIGHT = 0.35;

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let results: any;
  export let year: string;

  export let state: string | null;

  $: console.log(state);

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: bandWidth = innerWidth / 4 - padding * 3;

  $: topPipeHeight = innerHeight * TOP_PIPE_HEIGHT;
  $: sankeyHeight = innerHeight * SANKEY_HEIGHT;

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
  <defs>
    <linearGradient id="linearSankey" x1="0%" y1="60%" x2="0%" y2="0%">
      <stop offset="0%"   stop-color="#C5B8DF"/>
      <stop offset="55%" stop-color="#C5B8DF"/>
    </linearGradient>
  </defs>

  <g class="wrapper" {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      <rect
        class="middle-link"
        x={innerWidth / 2 - bandWidth / 2}
        fill={"url(#linearSankey)"}
        width={bandWidth}
        y={0}
        height={sankeyHeight + topPipeHeight}
      />
    </g>
    <g transform="translate({margin.left}, {margin.top + topPipeHeight})">
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
          height={height}
          topHeightPercentage={TOP_PIPE_HEIGHT}
          sankeyHeightPercentage={SANKEY_HEIGHT}
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
        {#if year !== 'none' && year !== 'historical'}
          <g class="year-label" transform="translate({innerWidth / 2}, {(sankeyHeight / 2) * 0.90})" text-anchor="middle">
            <text>{year}</text>
          </g>
        {/if}

        {#if year !== 'none' && year !== 'historical'}
          <g class="refusals-label" transform="translate({innerWidth / 2}, {sankeyHeight + 85})" text-anchor="middle">
            <text>refusals</text>
          </g>

          <g class="refusals-label" style="fill:{results[0].nation.colour}" transform="translate({80}, {sankeyHeight + 85 + 20})" text-anchor="middle">
            <text>4%</text>
          </g>
          <g style="fill:{results[0].nation.colour}" transform="translate({80}, {sankeyHeight + 85 - 20})">
            <circle cx={0} cy={0} r={10} />
          </g>

          <g class="refusals-label" style="fill:{results[1].nation.colour}" transform="translate({innerWidth - 80}, {sankeyHeight + 85 + 20})" text-anchor="middle">
            <text>7%</text>
          </g>
          <g style="fill:{results[1].nation.colour}" transform="translate({innerWidth - 80}, {sankeyHeight + 85 - 20})">
            <circle cx={0} cy={0} r={10} />
          </g>

        {/if}

        {#each centeredLinks as link}
          <g transform="translate({link.y1}, {sankeyHeight + 5})" text-anchor="middle">
            <text>
              <tspan x="1" dy="1.2em" text-anchor="middle">{link.target.name}</tspan>
              <tspan x="0" dy="1.2em" text-anchor="middle">risk</tspan>
            </text>
          </g>
        {/each}
      </g>
    </g>
  </g>
</svg>

<style>
  svg {
    background: #1B1023;
  }

  .middle-link {
    /* fill: url(#linearSankey); */
    fill: #9187a3;
  }
  .links {
    fill: none;
    stroke-opacity: 1;
    stroke: #9187a3;
    /* stroke: url(#linearSankey); */
    /* stroke: var(--background-colour); */
    /* stroke: linear-gradient(179.46deg, rgba(197, 184, 223, 0) 0.48%, rgba(197, 184, 223, 0.55) 99.55%); */
  }

  .wrapper {
    fill: black;
  }

  .labels {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    fill: white;
    font-size: 12px;
  }

  .labels .year-label {
    font-size: 28px;
  }

  .labels .refusals-label {
    font-size: 18px;
  }
</style>
