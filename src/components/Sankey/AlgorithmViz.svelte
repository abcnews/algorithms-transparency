<script lang="ts">
  import { sum } from 'd3';
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { PINK_BG } from '../../constants';

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
  const SANKEY_HEIGHT = 0.30;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: psize = innerWidth > 400 ? 6 : 5;
  $: bandWidth = innerWidth / 4 - padding * 2;

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


// linear-gradient(177.74deg, #1B1023 2%, #776B89 20.89%, #786C8A 48.75%, #1B1023 92.67%);
  const GRADIENT_END = 0.19;
  const DARK_STOP = '#1B1023';
  const MID_STOP = '#786C8A';
  const XTRA_STOP = '#32273D';
  const LIGHT_STOP = '#776B89';

  $: stop1 = Math.round(TOP_PIPE_HEIGHT / (TOP_PIPE_HEIGHT + SANKEY_HEIGHT) * 100);
  $: stop2 = Math.round((100 - stop1) * GRADIENT_END);

  let labelColours = [PINK_BG, PINK_BG, PINK_BG];
  const tweenedLabelSizes = tweened([12, 12, 12], { duration: 400, easing: cubicOut });
  $: {
    if (state === 'highlighthigh') {
      tweenedLabelSizes.set([12, 12, 15]);
      labelColours = [PINK_BG, PINK_BG, 'white'];
    } else if (state === 'highlightlow') {
      tweenedLabelSizes.set([15, 12, 12]);
      labelColours = ['white', PINK_BG, PINK_BG];
    } else {
      tweenedLabelSizes.set([12, 12, 12]);
      labelColours = [PINK_BG, PINK_BG, PINK_BG];
    }
  }

</script>

<svg class="algo-viz" {width} {height} viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="linearSankey" x2="0" y2="1">
      <stop offset="0%"   stop-color="{LIGHT_STOP}"/>
      <stop offset="{GRADIENT_END * 100}%" stop-color="{MID_STOP}"/>
      <stop offset="100%" stop-color="{XTRA_STOP}"/>
    </linearGradient>
    <linearGradient id="topPipe" x2="0" y2="1">
      <stop offset="0%"   stop-color="{DARK_STOP}"/>
      <stop offset="20%"   stop-color="{MID_STOP}"/>
      <stop offset="{stop1}%" stop-color="{LIGHT_STOP}"/>
      <stop offset="{stop1 + stop2}%" stop-color="{MID_STOP}"/>
      <stop offset="100%" stop-color="{XTRA_STOP}"/>
    </linearGradient>
    <linearGradient id="bottomPipe" x2="0" y2="1">
      <stop offset="0%" stop-color="{XTRA_STOP}"/>
      <stop offset="80%" stop-color="{DARK_STOP}"/>
    </linearGradient>
  </defs>

  <g class="wrapper" {width} {height}>
    <g transform="translate({margin.left}, {margin.top + topPipeHeight})">
      <g class="links">
        {#each centeredLinks as link}
          <rect
            in:fade
            class="end-link"
            x={link.y1 - bandWidth / 2}
            fill={"url(#bottomPipe)"}
            width={bandWidth}
            y={sankeyHeight - 2}
            height={topPipeHeight / 2}
          />

          <path
            in:fade
            d={sankeyLinkVertical()(link)} 
            stroke={"url(#linearSankey)"}
            stroke-width={bandWidth}
          />
        {/each}
      </g>

      <rect
        class="middle-link"
        x={innerWidth / 2 - bandWidth / 2}
        fill={"url(#topPipe)"}
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

      <g class="labels">
        {#if showRefusals}
          {#if year !== 'none' && year !== 'historical'}
            {#key year}
              <g
                out:fade="{{duration: 400}}"
                in:fade="{{duration: 400, delay: 700}}"
                class="year-label"
                transform="translate({innerWidth / 2}, {(sankeyHeight / 2) * 0.90})"
                text-anchor="middle"
              >
                <text>{year}</text>
              </g>
            {/key}
          {/if}

          {#if rejectedCount0 || rejectedCount1}
            <g class="refusals" transition:fade="{{duration:200}}">
              <g class="refusals-label" transform="translate({innerWidth / 2}, {sankeyHeight + 85})" text-anchor="middle">
                <text>Refusals</text>
              </g>

              <g class="refusals-label" transform="translate({innerWidth / 2 - 100}, {sankeyHeight + 85 + 20})" text-anchor="middle">
                <Particle x={0} y={-35} size={8} colour={activeResults[0].nation.colour} />
                <text fill={activeResults[0].nation.colour}>
                  {Math.round(rejectedCount0 / (approvedCount0 + rejectedCount0) * 100) || 0}%
                </text>
              </g>

              <g class="refusals-label" transform="translate({innerWidth / 2 + 100}, {sankeyHeight + 85 + 20})" text-anchor="middle">
                <Particle x={-2} y={-35} size={8} colour={activeResults[1].nation.colour} />
                <text fill={activeResults[1].nation.colour}>
                  {Math.round(rejectedCount1 / (approvedCount1 + rejectedCount1) * 100) || 0}%
                </text>
              </g>
            </g>
          {/if}
        {/if}

        {#each centeredLinks as link, i}
          <g class="risk-labels" transform="translate({link.y1}, {sankeyHeight + 20})" text-anchor="middle">
            <text
              in:fade
              font-size={$tweenedLabelSizes[i]}
              fill={labelColours[i]}
            >
              <tspan x="1" dy="1.2em" text-anchor="middle">{link.target.name === 'med' ? 'medium' : link.target.name}</tspan>
              <tspan x="0" dy="1.4em" text-anchor="middle">risk</tspan>
            </text>
          </g>
        {/each}
      </g>
    </g>
  </g>
</svg>

{#if scorecardScores.length}
  <div
    class="scorecard-wrapper"
    style="
      width: {height}px;
      height: {height}px;
      padding-top: 10%;
    "
  >
    <Scorecard width={innerWidth * 0.83} height={280} scores={scorecardScores} {state} />
  </div>
{/if}


<style>
  .wrapper {
    fill: black;
  }

  .algo-viz {
    margin-top: 10%;
  }

  .labels {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    fill: white;
  }

  .labels .year-label {
    font-size: 28px;
    /* text-shadow: */
    /*   -1.25px -1.25px 0 #000, */
    /*   0 -1.25px 0 #000, */
    /*   1.25px -1.25px 0 #000, */
    /*   1.25px 0 0 #000, */
    /*   1.25px 1.25px 0 #000, */
    /*   0 1.25px 0 #000, */
    /*   -1.25px 1.25px 0 #000, */
    /*   -1.25px 0 0 #000; */
  }

  .labels .refusals-label {
    font-size: 18px;
  }

  .risk-labels {
    line-height: 15px;
  }
</style>
