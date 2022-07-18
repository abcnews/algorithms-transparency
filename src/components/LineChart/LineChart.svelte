<script lang="ts">
	import { line, range } from 'd3';
	import { scaleLinear } from 'd3-scale';
  import { LINE_CHART_COLOURS } from '../../constants';

  import Legend from './Legend.svelte';

  // let data: any[] = [];
  // $: {
  //   fetch('/linechart.csv')
  //     .then(r => r.text())
  //     .then(raw => {
  //       const lines = raw.split('\n').map(line => line.split(','));
  //       data = lines.slice(1).map(line => ({
  //         year: line[0],
  //         Australia: line[1],
  //         Nepal: line[2],
  //         'United States': line[3],
  //         Syria: line[4],
  //       }));
  //       console.log(data);
  //     });
  // }

  const data = [
    {year: '2008', Australia: '6.332842415', Nepal: '58.18672776', 'United States': '1.204093919', Syria: '8.179419525'},
    {year: '2009', Australia: '48.06417112', Nepal: '51.63204748', 'United States': '40.47033508', Syria: '42.81062124'},
    {year: '2010', Australia: '53.38020552', Nepal: '48.31811351', 'United States': '50.73853827', Syria: '40.57326415'},
    {year: '2011', Australia: '61.93527715', Nepal: '42.15080346', 'United States': '61.56978059', Syria: '32.70763692'},
    {year: '2012', Australia: '70.84901715', Nepal: '10.14388489', 'United States': '61.3716591', Syria: '50.37528868'},
    {year: '2013', Australia: '73.78836834', Nepal: '36.41641642', 'United States': '59.58314454', Syria: '51.75128971'},
    {year: '2014', Australia: '75.96656217', Nepal: '43.83501536', 'United States': '64.68956689', Syria: '70.45947117'},
    {year: '2015', Australia: '76.89554182', Nepal: '4.166666667', 'United States': '61.72462406', Syria: '18.59649123'},
    {year: '2016', Australia: '78.69565217', Nepal: '4.221388368', 'United States': '60.47562426', Syria: '9.715812485'},
    {year: '2017', Australia: '75.95846645', Nepal: '4.647478215', 'United States': '66.01082145', Syria: '50.66724064'},
    {year: '2018', Australia: '74.43056576', Nepal: '5.615036878', 'United States': '67.96996375', Syria: '16.64015272'},
    {year: '2019', Australia: '77.22816399', Nepal: '7.865685373', 'United States': '67.45012298', Syria: '51.39109698'},
    {year: '2020', Australia: '93.46357935', Nepal: '75.90963615', 'United States': '93.88961892', Syria: '72.89386612'},
    {year: '2021', Australia: '94.63224368', Nepal: '68.35715684', 'United States': '78.52283771', Syria: '68.59725477'},
    {year: '2022', Australia: '95.96638655', Nepal: '60.81386586', 'United States': '96.15096226', Syria: '66.82218766'}
  ];
	
	let el;
	
	let width: number;
	const margin = { top: 20, bottom: 20, left: 40, right: 20 };

	$: height = Math.min(300, width * 0.8);
  $: innerHeight = height - margin.top - margin.bottom;
  $: innerWidth = width - margin.left - margin.right;

	// scales
	$: xScale = scaleLinear()
		.domain([2008, 2022])
		.range([0, innerWidth]);

	$: yScale = scaleLinear()
		.domain([0, 100])
		.range([innerHeight, 0]);
	
	$: ausPath = line()
		.x((d) => xScale(d.year))
    .y((d) => yScale(d.Australia));
	$: usPath = line()
		.x((d) => xScale(d.year))
    .y((d) => yScale(d['United States']));
	$: nepalPath = line()
		.x((d) => xScale(d.year))
    .y((d) => yScale(d.Nepal));
	// $: syriaPath = line()
	// 	.x((d) => xScale(d.year))
  //   .y((d) => yScale(d.Syria));
	
	// ticks for x axis - every second year
	const xTicks = range(2008, 2023, 2);
	
	// y ticks count to label by 10's
	const yTicks = range(10, 101, 10);

  const horizontalLine = (y: number, w: number) => `M0,${y}H${w}`
	
	// d's for axis paths
  $: xPath = horizontalLine(0, innerWidth) // `M0,0H${innerWidth}`
	$: yPath = `M0,${innerHeight}H0.5V0.5H0`

	$: algoStartPath = `M${xScale(2015)},${innerHeight}V0.5`
	$: algoEndPath = `M${xScale(2020)},${innerHeight}V0.5`

</script>

<Legend />

<div class="svg-wrapper" bind:clientWidth={width} style="height:{height}px;">
  <svg bind:this={el} transform="translate({margin.left}, {margin.top})">
    <g class="box">
      <rect
        fill="#24272B"
        x={xScale(2015)}
        y={0}
        width={xScale(2020) - xScale(2015)}
        height={innerHeight}
      />
      <!-- Algo markers -->
      <path stroke="#838FA0" d="{algoStartPath}" stroke-dasharray="4" fill="none" />
      <path stroke="#838FA0" d="{algoEndPath}" stroke-dasharray="4" fill="none" />
      <text class="box-label" x={(xScale(2015) + xScale(2020)) / 2} y={20}>Algorithm in use</text>
    </g>

    <!-- y axis -->
    <g>
      <path class="axis" stroke="currentColor" transform="translate({0}, 0)" d="{yPath}" fill="none" />

      {#each yTicks as y} 

        {#if y % 20 === 0}
          <path class="grid" stroke="currentColor" d="{horizontalLine(yScale(y), innerWidth)}" fill="none" />
        {/if}


        <g class="tick y" opacity="1" transform="translate({0},{yScale(y)})">
          <path stroke="currentColor" x2="5" />
          <text dy="0.32em" fill="currentColor" x="-2">
            {y}%
          </text>
        </g>
      {/each}
    </g>
    
    <!-- x axis -->
    <g transform="translate(0, {innerHeight})">
      <path class="axis" stroke="currentColor" d="{xPath}" fill="none" />
      
      {#each xTicks as x} 
        <g class="tick x" opacity="1" transform="translate({xScale(x)},0)">
          <path stroke="currentColor" y2="6" />
          <text fill="currentColor" y="9" dy="0.71em" x="0">
            {x}
          </text>
        </g>
      {/each}
    </g>

    <g class="line">
      <!-- lines -->
      <path 
        d="{ausPath(data)}"
        fill="none"
        stroke="{LINE_CHART_COLOURS.Australia}"
      />
      <path 
        d="{usPath(data)}"
        fill="none"
        stroke="{LINE_CHART_COLOURS['United States']}"
      />
      <path 
        d="{nepalPath(data)}"
        fill="none"
        stroke="{LINE_CHART_COLOURS.Nepal}"
      />
      <!-- <path  -->
      <!--   d="{syriaPath(data)}" -->
      <!--   fill="none" -->
      <!--   stroke="{LINE_CHART_COLOURS.Syria}" -->
      <!-- /> -->
    </g>
    
  </svg>
</div>

<style lang="scss">
	svg {
		width: 100%;
		height: 100%;
    overflow: overlay;
	}
	.box {
		font-size: 13px;
    font-family: "ABCSans";
    color: #838FA0;
    text-anchor: middle;

    .box-label {
      fill: #838FA0;
    }
  }
	.tick {
		font-size: 11px;
    font-family: "ABCSans";
    color: #838FA0;
  }
	.tick.y {
    text-anchor: end;
	}
	.tick.x {
    text-anchor: middle;
	}

  .line {
    stroke-width: 2px;
  }

  .svg-wrapper {
		width: 100%;
		height: 100%;
  }

  .grid {
    color: #31363C;
  }
  .axis {
    color: #838FA0;
  }
</style>

