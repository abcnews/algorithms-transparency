<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleOrdinal } from 'd3-scale';
  import { data } from './data';

  import MultiLine from './MultiLine.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import Labels from './GroupLabels.html.svelte';
  import SharedTooltip from './SharedTooltip.html.svelte';
  import OverlayBox from './OverlayBox.html.svelte';

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

  /* --------------------------------------------
   * Construct the dataLong data structure
   */
  const addZ = (data: any[]): LineData[] => {
    return data.map(d => ({
      ...d,
      values: d.values.map((v: any) => ({ ...v, z: d.label })),
    }));
  };

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

  const dataLong: LineData[] = addZ(data);

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
