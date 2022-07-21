<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleOrdinal } from 'd3-scale';
  import { format, precisionFixed } from 'd3-format';
  import { LINE_CHART_COLOURS } from '../../constants';

  import MultiLine from './MultiLine.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import Labels from './GroupLabels.html.svelte';
  import SharedTooltip from './SharedTooltip.html.svelte';
  import OverlayBox from './OverlayBox.html.svelte';

  // This example loads csv data as json using @rollup/plugin-dsv
  // import data from './_data/fruit.csv';

  /* --------------------------------------------
   * Set what is our x key to separate it from the other series
   */
  // const xKey = 'month';
  // const yKey = 'value';
  // const zKey = 'fruit';

  // const seriesNames: string[] = Object.keys(data[0]).filter(d => d !== xKey);
  // const seriesColors: string[] = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];

  // const parseDate = timeParse('%Y-%m-%d');

  interface Point {
    x: number;
    y: number;
    z: string;
  }

  interface LineData {
    label: string;
    colour: string;
    values: Point[];
  }

  const addZ = (data: any[]): LineData[] => {
    return data.map(d => ({
      ...d,
      values: d.values.map((v: any) => ({ ...v, z: d.label })),
    }));
  };

  const dataLong: LineData[] = addZ([
    {
      label: 'Australia',
      colour: LINE_CHART_COLOURS['Australia'],
      values: [
        { x: 2008, y: 6 },
        { x: 2009, y: 48 },
        { x: 2010, y: 53 },
        { x: 2011, y: 62 },
        { x: 2012, y: 71 },
        { x: 2013, y: 74 },
        { x: 2014, y: 76 },
        { x: 2015, y: 77 },
        { x: 2016, y: 79 },
        { x: 2017, y: 76 },
        { x: 2018, y: 74 },
        { x: 2019, y: 77 },
        { x: 2020, y: 93 },
        { x: 2021, y: 95 },
        { x: 2022, y: 96 },
      ],
    },
    {
      label: 'Nepal',
      colour: LINE_CHART_COLOURS['Nepal'],
      values: [
        { x: 2008, y: 58 },
        { x: 2009, y: 51 },
        { x: 2010, y: 48 },
        { x: 2011, y: 43 },
        { x: 2012, y: 11 },
        { x: 2013, y: 37 },
        { x: 2014, y: 44 },
        { x: 2015, y: 4 },
        { x: 2016, y: 4 },
        { x: 2017, y: 4 },
        { x: 2018, y: 6 },
        { x: 2019, y: 8 },
        { x: 2020, y: 76 },
        { x: 2021, y: 68 },
        { x: 2022, y: 61 },
      ],
    },
    {
      label: 'United States',
      colour: LINE_CHART_COLOURS['United States'],
      values: [
        { x: 2008, y: 1 },
        { x: 2009, y: 40 },
        { x: 2010, y: 51 },
        { x: 2011, y: 62 },
        { x: 2012, y: 61 },
        { x: 2013, y: 60 },
        { x: 2014, y: 65 },
        { x: 2015, y: 62 },
        { x: 2016, y: 60 },
        { x: 2017, y: 66 },
        { x: 2018, y: 68 },
        { x: 2019, y: 67 },
        { x: 2020, y: 94 },
        { x: 2021, y: 79 },
        { x: 2022, y: 96 },
      ],
    },
  ]);

  // /* --------------------------------------------
  //  * Create a "long" format that is a grouped series of data points
  //  * Layer Cake uses this data structure and the key names
  //  * set in xKey, yKey and zKey to map your data into each scale.
  //  */
  // const dataLong = seriesNames.map(key => {
  //   return {
  //     [zKey]: key,
  //     values: data.map(d => {
  //       d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey]; // Conditional required for sapper
  //       return {
  //         [yKey]: +d[key],
  //         [xKey]: d[xKey],
  //         [zKey]: key
  //       };
  //     })
  //   };
  // });

  /* --------------------------------------------
   * Make a flat array of the `values` of our nested series
   * we can pluck the field set from `yKey` from each item
   * in the array to measure the full extents
   */
  const flatten = (data: LineData[]): Point[] => data.reduce(
    (memo: Point[], group: LineData) => {
      return memo.concat(group.values);
    },
    []
  );

  const formatTickX = (d: number): string => String(d);
  const formatTickY = (d: number): string => `${d}%`; // format(`.${precisionFixed(d)}`)(d);

  let width: number;
  $: numTicksX = Math.min(width / 50, dataLong[0].values.length);
</script>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    height: 300px;
    width: 100%;
    font-family: "ABCSans";
    margin: 0.5rem;
  }

   @media (min-width: 76rem) {
    .chart-container {
       height: 400px;
     }
   }

  .chart-container :global(svg) {
    z-index: 5;
  }

  .title {
    font-family: "ABCSans";
    color: white;
  }

  .source {
    font-family: "ABCSans";
    color: white;
    font-size: 12px;
    font-style: italic;
    font-weight: 400;
    justify-content: space-between;
    line-height: 18px;
    text-decoration: none;
  }
</style>

<h2 class="title">UK visa approval rates by country</h2>

<div class="chart-container" bind:clientWidth={width}>
  <LayerCake
    padding={{ top: 7, right: 70, bottom: 20, left: 25 }}
    x={'x'}
    y={'y'}
    z={'z'}
    yDomain={[0, 100]}
    zScale={scaleOrdinal()}
    zRange={dataLong.map(d => d.colour)}
    flatData={flatten(dataLong)}
    data={dataLong}
  >
    <Svg>
      <AxisX
        gridlines={false}
        ticks={numTicksX}
        formatTick={formatTickX}
        snapTicks={false}
      />
      <AxisY
        ticks={4}
        formatTick={formatTickY}
      />
      <MultiLine/>
    </Svg>

    <Html>
      <Labels/>
      <SharedTooltip
        formatTitle={formatTickX}
        formatValue={formatTickY}
        dataset={flatten(dataLong)}
      />
      <OverlayBox
        startX={2015}
        endX={2020}
        label="Algorithm in use"
      />
    </Html>
  </LayerCake>
</div>

<p class="source">Source: UK Home Office</p>
