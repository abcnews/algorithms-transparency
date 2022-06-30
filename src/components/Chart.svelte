<script lang="ts">
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
  const psize = 7;
  const speed = 2;

  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let results: any;

  let innerWidth: number;
  // let innerHeight: number;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: bandWidth = innerWidth / 4 - padding / 3;

  // Draw links based on the first results structure (it will be the same for both)
  $: nodes = genNodes(results[0].outcome);
  $: links = genLinks(results[0].outcome);
  $: sankey = sankeyTop()
      .nodeId(d => d.name)
      .nodeAlign(sankeyAlignJustify)
      .nodeWidth(1)
      .nodePadding(padding)
      .size([innerWidth, innerHeight])
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

</script>

<g class="wrapper" width={width} height={height}>
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
      height={innerHeight}
      {bandWidth}
      {progressPercentage}
      {result}
      {psize}
      {padding}
      {speed}
    />
  {/each}
</g>


<style>
  .links {
    fill: none;
    stroke-opacity: 0.8;
    stroke: rgb(238, 238, 238);
  }

  /* .node-labels { */
  /*   font-family: ABCSans, Helvetica, sans-serif; */
  /*   font-weight: 700; */
  /* } */
</style>
