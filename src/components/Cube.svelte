<script lang="ts">
  export let isExpanded: boolean;
</script>

<g
  class="cube"
  transform="translate(50, 50) {isExpanded ? 'scale(10) translate(-200, -200)' : ''}"
  style="opacity: {isExpanded ? '0' : '1'}"
>
  <polygon filter="url(#glow)" transform="scale(0.5)" style="fill: #2b2b2b;" points="480,112 256,0 32,112 32,400 256,512 480,400 "/>
  <polygon filter="url(#glow)" transform="scale(0.5)"style="fill: #191a1a;" points="256,224 32,112 32,400 256,512 480,400 480,112 "/>
  <polygon filter="url(#glow2)" transform="scale(0.5)" style="fill: #000000;" points="256,224 256,512 480,400 480,112 "/>

  <text
    class="box-label"
    x="30"
    y="100"
    stroke="#e688f6"
    fill="#e688f6"
  >
    HOME AFFAIRS
  </text>
</g>


<style lang="scss">
  .box-label {
    font-size: 12px;
    font-family: helvetica;
    transform: skewY(26.6deg);
  }

  .cube {
    transition-property: transform, opacity;
    transition-duration: 1s;
  }
</style>
