<script lang="ts">
  import { fade } from 'svelte/transition';
  export let colour: string;
  export let x: number;
  export let y: number;
  export let size: number;
  export let opacity = 1;

  $: absolutePath = __webpack_public_path__ || '/';

  const SQUARE_STAR_ASPECT_RATIO = 22/19;
  const SQUARE_STAR_DOWNSIZE = 0.8;
  const PI = 3.14;
</script>

{#if colour === '#FF645C'}
  <image
    class="particle"
    href="{absolutePath}squarestar.svg"
    {opacity}
    transition:fade="{{duration:400}}"
    width={size * PI * SQUARE_STAR_ASPECT_RATIO * SQUARE_STAR_DOWNSIZE}
    height={size * PI * SQUARE_STAR_DOWNSIZE}
    x={x - size * (PI / 2) * SQUARE_STAR_ASPECT_RATIO * SQUARE_STAR_DOWNSIZE}
    y={y - size * (PI / 2) * SQUARE_STAR_DOWNSIZE}
  />
{:else}
  <circle
    class="particle"
    {opacity}
    transition:fade="{{duration:400}}"
    stroke="black"
    stroke-width="0.5"
    fill="{colour}"
    r={size}
    cx={x}
    cy={y}
  />
{/if}
