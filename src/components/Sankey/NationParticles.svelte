<script lang="ts">
  import { scaleLinear, scaleThreshold, range } from "d3";
  import { sankeyTop, sankeyAlignJustify, sankeyLinkVertical } from 'jtfell-d3-sankey';

  import Particle from './Particle.svelte';

  import {
    genNodes,
    genLinks,
    genHierarchy,
    genTargetsAbs,
    genTargets,
    genThresholds,
    genRoutes,
  } from './helpers';

  export let padding: number;
  export let psize: number;
  export let speed: number;

  export let onUpdateFinishedParticles: any;
  export let bandWidth: number;
  export let width: number;
  export let height: number;
  export let progressPercentage: number;
  export let result: any;

  export let topHeightPercentage: number;
  export let sankeyHeightPercentage: number;

  $: nodes = genNodes(result.outcome);
  $: links = genLinks(result.outcome);

  // Common data structure format that d3 uses to layout networks (e.g. d3-sankey, d3-force)
  $: dataForSankey = {
    nodes: nodes.map(n => ({ ...n, fixedValue: 1 })), // `fixedValue`, because all nodes have fixed height
    links: links.map(l => ({ ...l, value: 0 })) // `value: 0`, to start links from a single point
  };

  $: hierarchy = genHierarchy(result.outcome);
  $: sankey = sankeyTop()
      .nodeId(d => d.name)
      .nodeAlign(sankeyAlignJustify)
      .nodeWidth(1)
      .nodePadding(padding)
      .size([width, height * sankeyHeightPercentage])
    (dataForSankey);
    
  $: targetsAbs = genTargetsAbs(hierarchy);
  $: targets = genTargets(targetsAbs);
  $: thresholds = genThresholds(targets);
  $: routes = genRoutes(sankey);

  //
  // Scales
  //
  // takes a random number [0..1] and returns a target, based on distribution
  $: targetScale = scaleThreshold()
    .domain(thresholds)
    .range(targets)

  // takes a random number [0..1] and returns vertical position on the band
  $: offsetScale = scaleLinear()
    .range([-bandWidth / 2 + psize, bandWidth / 2 - psize])

  // takes a random number [0..1] and returns particle speed
  $: speedScale = scaleLinear().range([1, 1 + speed])

  $: positionScale = scaleLinear().domain([0, 100]).range([-1 * topHeightPercentage, sankeyHeightPercentage + topHeightPercentage]);

  let topPath: SVGPathElement;
  let paths: SVGPathElement[] = [];
  let cache = {};
  let particles: any[] = [];
  $: {
    console.log(width);
    paths.forEach((path, i) => {
      if (!path || !topPath) {
        return;
      }
      // Compute particle positions along the lines.
      const route = routes[i].map(r => `/${r.name}`).join('');
      const points = range(100).map((y: number) => {
        const yPosition = positionScale(y);
        if (yPosition < 0) {
          const length = topPath.getTotalLength();
          const progress = -1 * (yPosition / topHeightPercentage);
          return topPath.getPointAtLength(progress * length);
        }

        const length = path.getTotalLength();
        // If in the extended bottom bars
        if (yPosition > sankeyHeightPercentage) {
          const endPos = path.getPointAtLength(length);
          const percentageOfFinalBar = (yPosition - sankeyHeightPercentage) / topHeightPercentage;
          const finalBarLength = topHeightPercentage * height * 0.5 * 0.3;
          // console.log(percentageOfFinalBar, finalBarLength);
          return {
            x: endPos.x,
            y: endPos.y + percentageOfFinalBar * finalBarLength,
          };
        }

        return path.getPointAtLength((yPosition / sankeyHeightPercentage) * length);
      });

      cache[route] = { points };
    });

    // Initial state of particles
    particles = range(result.nation.numberOfApplicants).map(id => {
      const target = targetScale(id / 100);
      return {
        id,
        speed: speedScale(Math.random()),
        colour: result.nation.colour,
        offset: offsetScale(Math.random()),
        // current position on the route (will be updated in `chart.update`)
        pos: 0,
        // total length of the route, used to determine that the particle has arrived
        length,
        // target where the particle is moving
        target,
      };
    });
  }

  // Update particles based on "progressPercentage"
  $: {
    // Reset this count
    const finishedParticles = {
      low: {
        approved: 0,
        rejected: 0
      },
      med: {
        approved: 0,
        rejected: 0
      },
      high: {
        approved: 0,
        rejected: 0
      },
    };

    if (!isNaN(progressPercentage)) {
      particles = particles.map(d => {
        const path = cache[d.target.path];
        if (!path) {
          return d;
        }

        // every particle appears at its own time, so adjust the global time `t` to local time
        d.pos = Math.floor(progressPercentage * d.speed);
        // extract the current and the next point coordinates from the precomputed cache
        let coo = path.points[d.pos]
        if (!coo) {
          // Add to graph at the end
          finishedParticles[d.target.name][d.target.group] += 1;

          return {
            ...d,
            x: null,
            y: null,
          };
        }

        return {
          ...d,
          x: coo.x + d.offset,
          y: coo.y,
        };
      });

      onUpdateFinishedParticles(result.nation, finishedParticles);
    }
  }

  $: centeredLinks = sankey.links.map(l => {
    const width = l.source.x1 - l.source.x0;
    return {
      ...l,
      y0: l.y0 + width / 2,
      y1: l.y1 + width / 2,
    };
  });

</script>

{#key width}
  <g class="guides">
      <line
        x1={width / 2 - 1}
        x2={width / 2 + 1}
        y1={0}
        y2={-1 * height * topHeightPercentage}
        bind:this={topPath}
      />

    {#each centeredLinks as link, i}
      <path
        d={sankeyLinkVertical()(link)} 
        stroke-width={bandWidth}
        bind:this={paths[i]}
      />
    {/each}
  </g>

  <g class="particles">
    {#each particles as particle}
      {#if particle.x && particle.y}
        <Particle
          opacity={progressPercentage < 10 ? progressPercentage / 10 : 1}
          colour={particle.colour}
          size={psize}
          x={particle.x}
          y={particle.y}
        />
      {/if}
    {/each}
  </g>
{/key}

<style>
  .particles {
    transition-property: x,y;
    transition-duration: 2s;
    width: 100%;
    height: 100%;

    /* stroke: #5d5165; */
    /* stroke-width: 1px; */
  }

  /* Links are drawn by top chart, this is just for guiding the particles */
  .guides {
    fill: none;
    stroke-opacity: 0;
  }
</style>
