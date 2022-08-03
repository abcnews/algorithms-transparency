<!--
  @component
 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { max } from 'd3-array';

  const { x, y, xScale, yScale, xRange, yRange } = getContext('LayerCake');

  export let startX: number = 0;
  export let endX: number = 100;
  export let label: string = '';

  /* --------------------------------------------
   * Put the label on the highest value
   */
  $: left = start => $xScale(start) /  Math.max(...$xRange);
  $: width = (start, end) => ($xScale(end) - $xScale(start)) /  Math.max(...$xRange);
  $: top = group => {
    const { values, label } = group;
    const finalValuePercent = $yScale($y(values[values.length - 1])) / Math.max(...$yRange);

    // TODO: Avoid other labels!
    // - use 2nd last value to decide ties
    // - set a minimum similarity between values to avoid overlap
    console.log(label, finalValuePercent);
    if (label === 'United States') {
      return finalValuePercent + 0.15;
    }
    return finalValuePercent;
  }
</script>

  <div
    class="overlay-box"
    style="
      top:{0}%;
      left: {left(startX) * 100}%;
      width:{width(startX, endX) * 100}%;
      height:100%;
    "
  >
      <span>{label}</span>
  </div>

<style>
  .overlay-box {
    position: absolute;
    font-size: 12px;
    background: #24272B;
    opacity: 0.8;
    text-align: center;
    padding-top: 0.25rem;
  }

  .overlay-box > span {
    color: #838FA0;
  }
</style>
