<script lang="ts">
  import { scaleLinear, scaleBand, scaleOrdinal, scaleThreshold, sum } from "d3";

  import {
    genNodes,
    genLinks,
    genHierarchy,
    genSankey,
    genTargetsAbs,
    genTargets,
    genThresholds,
    genRoutes,
    genLeaves,
    sankeyLinkCustom
  } from './data';

  const margin = { top: 15, bottom: 25, left: 35, right: 35 };
  const padding = 20;
  const curve = 0.6;
  const psize = 7;
  const bandHeight = 60 - padding / 2;
  const speed = 0.7;
  const density = 7;
  const MOBILE_BREAKPOINT = 480;

  // Responsively sized dimensions (1:1 on mobile, 2:3 on desktop)
  export let width: number;

  $: height = width > MOBILE_BREAKPOINT ? width * 2/3 : width;
  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

  const input = {
    // nationa: {
    //   compliancey: {
    //     riskl: 0,
    //     riskm: 0,
    //     riskh: 20,
    //   },
    // },
    nationb: {
      compliancey: {
        riskl: 3,
        riskm: 5,
        riskh: 10,
      },
      compliancen: {
        riskl: 3,
        riskm: 5,
        riskh: 2,
      },
    },
    nationc: {
      compliancey: {
        riskl: 18,
        riskm: 2,
        riskh: 0,
      },
      compliancen: {
        riskl: 10,
        riskm: 8,
        riskh: 0,
      },
    },
  };

  // const input = {
  //   nationa: {
  //       riskl: 0,
  //       riskm: 0,
  //       riskh: 20,
  //   },
  //   nationb: {
  //       riskl: 3,
  //       riskm: 5,
  //       riskh: 10,
  //   },
  //   nationc: {
  //       riskl: 18,
  //       riskm: 2,
  //       riskh: 0,
  //   },
  // };

  $: nodes = genNodes(input);
  $: links = genLinks(input);

  // Common data structure format that d3 uses to layout networks (e.g. d3-sankey, d3-force)
  $: dataForSankey = {
    nodes: nodes.map(n => ({ ...n, fixedValue: 1 })), // `fixedValue`, because all nodes have fixed height
    links: links.map(l => ({ ...l, value: 0 })) // `value: 0`, to start links from a single point
  };

  $: hierarchy = genHierarchy(input);
  $: sankey = genSankey(innerWidth, innerHeight, margin, padding, hierarchy, curve, dataForSankey);
  $: targetsAbs = genTargetsAbs(hierarchy);
  $: targets = genTargets(targetsAbs);
  $: thresholds = genThresholds(targets);
  $: routes = genRoutes(sankey);
  $: leaves = genLeaves(sankey, targetsAbs);

  // Can set to anything
  $: totalParticles = sum(targetsAbs, t => t.value)

  $: console.log({
    nodes,
    links,
    hierarchy,
    sankey,
    targetsAbs,
    targets,
    thresholds,
    routes,
    leaves,
    totalParticles,
  });

  //
  // Scales
  //

  // takes a random number [0..1] and returns a target, based on distribution
  $: targetScale = scaleThreshold()
    .domain(thresholds)
    .range(targets)

  // takes a group type and returns a color
  $: colorScale = scaleOrdinal()
    .domain(['riskl', 'riskm', 'riskh'])
    .range(['green', 'orange', 'red'])

  // takes a random number [0..1] and returns vertical position on the band
  $: offsetScale = scaleLinear()
    .range([-bandHeight / 2 - psize / 2, bandHeight / 2 - psize / 2])

  // takes a random number [0..1] and returns particle speed
  $: speedScale = scaleLinear().range([speed, speed + 0.5])

  $: yScale = scaleBand()
    .domain(routes.map(r => r.target))
    .range([innerHeight, 0])
    .paddingInner(0.3)


  // // Compute particle positions along the lines.
  // // This technic relies on path.getPointAtLength function that returns coordinates of a point on the path
  // // Another example of this technic:
  // // https://observablehq.com/@oluckyman/point-on-a-path-detection
  // //
  // $: link.each(function(d) {
  //   const path = this
  //   const length = path.getTotalLength()
  //   const points = d3.range(length).map(l => {
  //     const point = path.getPointAtLength(l)
  //     return { x: point.x, y: point.y }
  //   })
  //   const key = `${d.source}_${d.target}`
  //   cache[key] = { points }
  // })

</script>

<main class="graphic">

  <svg {width} {height}>
    <g transform={`translate(${margin.left},${margin.top})`}>
      
      <g class="routes">
        {#each routes as route}
          <path
            d={sankeyLinkCustom(bandHeight, route)} 
            stroke-width={bandHeight}
          />
        {/each}
      </g>

    </g>
  </svg>

</main>


<style>
  .graphic {
    position: relative;
    max-height: 90vh;
  }

  .graphic > svg {
    margin-top: 0.75rem;
  }

  .routes {
    fill: none;
    stroke-opacity: 0.3;
    stroke: rgb(45 36 36);
  }
</style>
