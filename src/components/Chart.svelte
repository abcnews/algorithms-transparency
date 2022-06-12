<script lang="ts">
  import { scaleLinear, scaleOrdinal, scaleThreshold, range } from "d3";

  import {
    genNodes,
    genLinks,
    genHierarchy,
    genSankey,
    genTargetsAbs,
    genTargets,
    genThresholds,
    genRoutes,
    // genLeaves,
    sankeyLinkCustom
  } from './data';

  const margin = { top: 25, bottom: 25, left: 5, right: 25 };
  // const margin = { top: 5, bottom: 5, left: 5, right: 5 };
  const padding = 20;
  const curve = 0.6;
  const psize = 7;
  const speed = 0.2;

  // const density = 7;

  export let width: number;
  export let height: number;
  export let totalParticles: number;
  export let progressPercentage: number;
  export let orientation: 'vertical' | 'horizontal';
  export let input: any;
  export let colours: Record<string, boolean>;

  let innerWidth: number;
  let innerHeight: number;
  let canvasTransform: string;

  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;
  $: t = `translate( ${height / 2 - width / 2}, ${height / 2 - width / 2})`;
  $: canvasTransform = orientation === 'vertical' ? `rotate(90) ${t}` : '';

  $: bandHeight = ((orientation === 'vertical' ? innerWidth : innerHeight) / 8) - padding / 2;

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
  // $: leaves = genLeaves(sankey, targetsAbs);


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
  $: speedScale = scaleLinear().range([1, 1 + speed])

  let paths: SVGPathElement[] = [];
  let cache = {};
  $: {
    console.log(innerWidth);
    paths.forEach((path, i) => {
      // Compute particle positions along the lines.
      const length = path.getTotalLength();
      const route = routes[i].map(r => `/${r.name}`).join('');
      cache[route] = { points: range(100).map((x: number) => path.getPointAtLength(x * length / 100)) };
    });
  }

  // Initial state of particles
  $: particles = range(totalParticles).map(id => {
    const target = targetScale(Math.random())
    return {
      id,
      speed: speedScale(Math.random()),
      colour: colorScale(target.group),
      offset: offsetScale(Math.random()),
      // current position on the route (will be updated in `chart.update`)
      pos: 0,
      // total length of the route, used to determine that the particle has arrived
      length,
      // target where the particle is moving
      target,
    };
  });

  // Update particles based on "progressPercentage"
  $: {
    particles = particles.map(d => {
      const path = cache[d.target.path];
      if (!path) {
        return d;
      }

      // every particle appears at its own time, so adjust the global time `t` to local time
      d.pos = (progressPercentage * path.points.length / 100) * d.speed;
      // extract the current and the next point coordinates from the precomputed cache
      const index = Math.floor(d.pos)
      const coo = path.points[index]
      const nextCoo = path.points[index + 1]

      if (!coo || !nextCoo) {
        return d;
      }
      const delta = d.pos - index // try to set it to 0 to see how jerky the animation is
      const x = coo.x + (nextCoo.x - coo.x) * delta
      const y = coo.y + (nextCoo.y - coo.y) * delta + d.offset;

      return {
        ...d,
        x,
        y,
      };
    });
  }

</script>

<g class="wrapper" transform={canvasTransform}>
  <g 
    class="inner"
     width={innerWidth}
     height={innerHeight}
     transform={`translate(${margin.left},${margin.top})`}
   >
    <g class="routes">
      {#each routes as route, i}
        <path
          d={sankeyLinkCustom(bandHeight, route)} 
          stroke-width={bandHeight}
          bind:this={paths[i]}
        />
      {/each}
    </g>

    <g class="particles">
      {#each particles as particle}
        <rect
          class="particle"
          opacity="0.8"
          fill={colours[particle.target.name] ? particle.colour : 'black'}
          width={psize}
          height={psize}
          x={particle.x}
          y={particle.y}
        />
      {/each}
    </g>
  </g>
</g>


<style>
  .wrapper {
    transform-box: fill-box;
    transform-origin: center;
  }

  .particles {
    transition-property: x,y;
    transition-duration: 0.2s;
    width: 100%;
    height: 100%;
  }

  .routes {
    fill: none;
    stroke-opacity: 0.1;
    stroke: rgb(238, 238, 238);
  }
</style>
