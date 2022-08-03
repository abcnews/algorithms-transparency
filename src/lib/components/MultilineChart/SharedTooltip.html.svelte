<!--
  @component
  Generates a tooltip that works on multiseries datasets, like multiline charts. It creates a tooltip showing the name of the series and the current value. It finds the nearest data point using the [QuadTree.html.svelte](https://layercake.graphics/components/QuadTree.html.svelte) component.
 -->
<script>
  import { getContext } from 'svelte';
  import { format } from 'd3-format';

  import QuadTree from './QuadTree.html.svelte';

  const { data, width, yScale, config } = getContext('LayerCake');

  const commas = format(',');
  const titleCase = d => d.replace(/^\w/, w => w.toUpperCase());

  /** @type {Function} [formatTitle=d => d] - A function to format the tooltip title, which is `$config.x`. */
  export let formatTitle = d => d;

  /** @type {Function} [formatValue=d => isNaN(+d) ? d : commas(d)] - A function to format the value. */
  export let formatValue = d => isNaN(+d) ? d : commas(d);

  /** @type {Function} [formatKey=d => titleCase(d)] - A function to format the series name. */
  export let formatKey = d => titleCase(d);

  /** @type {Number} [offset=-20] - A y-offset from the hover point, in pixels. */
  export let offset = -20;

  /** @type {Array} [dataset] - The dataset to work off ofdefaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format. */
  export let dataset = undefined;

  export let useColour = false;

  const w = 150;
  const w2 = w / 2;

  /* --------------------------------------------
   * Sort the keys by the highest value
   */
  function sortResult(result) {
    if (Object.keys(result).length === 0) return [];

    const rows = Object.keys(result).filter(d => d !== $config.x).map(key => {
      return {
        key,
        colour: useColour ? $data.find(d => d.label === key)?.colour : 'white',
        value: result[key]
      };
    }).sort((a, b) => b.value - a.value);

    return rows;
  }
</script>

<style>
  .tooltip {
    position: absolute;
    transform: translate(-50%, -100%);

    font-size: 12px;
    pointer-events: none;

    background: #24272B;
    color: white;
    opacity: 0.9;

    padding: 5px;
    z-index: 15;
    pointer-events: none;
  }
  .line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 1px dotted #666;
    pointer-events: none;
  }
  .tooltip,
  .line {
    transition: left 250ms ease-out, top 250ms ease-out;
  }
  .title {
    font-weight: bold;
  }
  /* .key { */
  /*   color: #999; */
  /* } */
</style>

<QuadTree
  dataset={dataset || $data}
  let:x
  let:y
  let:visible
  let:found
  let:e
>
  {@const foundSorted = sortResult(found)}
  {#if visible === true}
    <div
      style="left:{x}px;"
      class="line"></div>
    <div
      class="tooltip"
      style="
        width:{w}px;
        display: { visible ? 'block' : 'none' };
        top:{$yScale(foundSorted[0].value) + offset}px;
        left:{Math.min(Math.max(w2, x), $width - w2)}px;"
      >
        <div class="title">{formatTitle(found[$config.x])}</div>
        {#each foundSorted as row}
          <div class="row">
            <span class="key" style="color:{row.colour}">{formatKey(row.key)}:</span>
            <span style="color:{row.colour}">{formatValue(row.value)}</span>
          </div>
        {/each}
    </div>
  {/if}
</QuadTree>
