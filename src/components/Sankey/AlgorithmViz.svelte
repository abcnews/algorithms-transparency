<script lang="ts">
  import { sum } from 'd3';
  import { sankeyTop, sankeyLinkVertical } from 'jtfell-d3-sankey';
  import {
    genNodes,
    genLinks,
  } from './helpers';

  import NationParticles from './NationParticles.svelte';
  import Particle from './Particle.svelte';
  import Scorecard from '../Scorecard/Scorecard.svelte';

  // const margin = { top: 0, bottom: 0, left: 0, right: 0 };
  // const margin = { top: 25, bottom: 25, left: 25, right: 25 };
  const margin = { top: 5, bottom: 5, left: 5, right: 5 };
  const padding = 10;
  const psize = 4;
  const speed = 2;

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let results: Record<string, any>;
  export let year: string;
  export let state: string | null;
  export let showRefusals: boolean;
  export let scorecardScores: any[];

  // TODO: Move this down for scorecard?
  const TOP_PIPE_HEIGHT = 0.1;
  const SANKEY_HEIGHT = 0.25;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: bandWidth = innerWidth / 4 - padding * 3;

  $: topPipeHeight = innerHeight * TOP_PIPE_HEIGHT;
  $: sankeyHeight = innerHeight * SANKEY_HEIGHT;

  $: activeResults = year === 'historical' || year === 'none' ? results['2015'] : results[year];

  // Draw links based on the first results structure (it will be the same for both)
  $: nodes = genNodes(activeResults[0].outcome);
  $: links = genLinks(activeResults[0].outcome);

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
    const nationId = activeResults.findIndex(r => r.nation.name === nation.name);
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

  const linkLabelStyle = (state: string | null, name: string) => {
    console.log(state, name);
    if (state === 'highlighthigh' && name === 'high') {
      return 'red';
    }
    if (state === 'highlightlow' && name === 'low') {
      return 'green';
    }
    return '';
  };

  const GRADIENT_END = 0.8;

  $: stop1 = Math.round(TOP_PIPE_HEIGHT / (TOP_PIPE_HEIGHT + SANKEY_HEIGHT) * 100);
  $: stop2 = Math.round((100 - stop1) * GRADIENT_END);
</script>

<svg class="algo-viz" {width} {height} viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="linearSankey" x2="0" y2="1">
      <stop offset="0%"   stop-color="#8b81a3"/>
      <stop offset="{GRADIENT_END * 100}%" stop-color="#393542"/>
    </linearGradient>
    <linearGradient id="linearPipe" x2="0" y2="1">
      <stop offset="0%"   stop-color="#393542"/>
      <stop offset="20%"   stop-color="#8b81a3"/>
      <stop offset="{stop1}%" stop-color="#8b81a3"/>
      <stop offset="{stop1 + stop2}%" stop-color="#393542"/>
    </linearGradient>
  </defs>

  <g class="wrapper" {width} {height}>
    <g transform="translate({margin.left}, {margin.top + topPipeHeight})">
      <g class="links">
        {#each centeredLinks as link}
          <path
            d={sankeyLinkVertical()(link)} 
            stroke={"url(#linearSankey)"}
            stroke-width={bandWidth}
          />
        {/each}
      </g>

      <rect
        class="middle-link"
        x={innerWidth / 2 - bandWidth / 2}
        fill={"url(#linearPipe)"}
        width={bandWidth}
        y={-1 * topPipeHeight}
        height={sankeyHeight + topPipeHeight}
      />

      {#if activeResults}
        {#each activeResults as result}
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
      {/if}

      {#if scorecardScores.length}
        <foreignObject x={0} y={-45} width={innerWidth} height={280}>
          <Scorecard scores={scorecardScores} {state} />
        </foreignObject>
      {/if}

      <g class="labels">
        {#if showRefusals}
          {#if year !== 'none' && year !== 'historical'}
            <g class="year-label" transform="translate({innerWidth / 2}, {(sankeyHeight / 2) * 0.90})" text-anchor="middle">
              <text>{year}</text>
            </g>
          {/if}

          {#if rejectedCount0 && rejectedCount1}
            <g class="refusals-label" transform="translate({innerWidth / 2}, {sankeyHeight + 85})" text-anchor="middle">
              <text>Refusals</text>
            </g>

            <Particle x={80} y={sankeyHeight + 85 - 15} size={8} colour={activeResults[0].nation.colour} />
            <g class="refusals-label" style="fill:{activeResults[0].nation.colour}" transform="translate({80}, {sankeyHeight + 85 + 20})" text-anchor="middle">
              <text>{Math.round(rejectedCount0 / (approvedCount0 + rejectedCount0) * 100) || 0}%</text>
            </g>

            <Particle x={innerWidth - 82} y={sankeyHeight + 85 - 15} size={8} colour={activeResults[1].nation.colour} />
            <g class="refusals-label" style="fill:{activeResults[1].nation.colour}" transform="translate({innerWidth - 80}, {sankeyHeight + 85 + 20})" text-anchor="middle">
              <text>{Math.round(rejectedCount1 / (approvedCount1 + rejectedCount1) * 100) || 0}%</text>
            </g>
          {/if}
        {/if}

        {#each centeredLinks as link}
          <g transform="translate({link.y1}, {sankeyHeight + 5})" text-anchor="middle">
          <text fill="{linkLabelStyle(state, link.target.name)}">
              <tspan x="1" dy="1.2em" text-anchor="middle">{link.target.name === 'med' ? 'medium' : link.target.name}</tspan>
              <tspan x="0" dy="1.2em" text-anchor="middle">risk</tspan>
            </text>
          </g>
        {/each}
      </g>
    </g>
  </g>
</svg>

<style>
  .wrapper {
    fill: black;
  }

  .algo-viz {
    margin-top: 10%;
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
