<!--
  @component
  Generates HTML text labels for a nested data structure. It places the label near the y-value of the highest x-valued data point. This is useful for labeling the final point in a multi-series line chart, for example. It expects your data to be an array of objects where each has `values` field that is an array of data objects. It uses the `z` field accessor to pull the text label.
 -->
<script>
  import { getContext } from 'svelte';
  import { max } from 'd3-array';

  const { data, x, y, xScale, yScale, xRange, yRange } = getContext('LayerCake');

  /* --------------------------------------------
   * Title case the first letter
   */
  const cap = val => val.replace(/^\w/, d => d.toUpperCase());

  /* --------------------------------------------
   * Put the label on the highest value
   */
  $: left = values => $xScale(max(values, $x)) /  Math.max(...$xRange);
  $: top = group => {
    const { values, label } = group;
    const finalValuePercent = $yScale($y(values[values.length - 1])) / Math.max(...$yRange);

    // TODO: Avoid other labels!
    // - use 2nd last value to decide ties
    // - set a minimum similarity between values to avoid overlap
    if (label === 'United States') {
      return finalValuePercent + 0.11;
    }
    return finalValuePercent;
  }
</script>

{#each $data as group}
  <div
    class="label"
    style="
      color:{group.colour};
      top:{top(group) * 100}%;
      left: calc({left(group.values) * 100}% + 72px);
    "
  ><span>{cap((group.label))}</span></div>
{/each}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%)translateY(1px);
    width: 60px;
    font-size: 12px;
    z-index: 19;
  }
</style>
