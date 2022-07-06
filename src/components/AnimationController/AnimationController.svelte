<script lang="ts">
  import { onMount } from 'svelte';
  import SVG, { animateMarkers, runCommand, pauseTimeline } from '../KeyshapeSVG/KeyshapeSVG.svelte';

  let iframeEl;

  export let width: number;
  export let height: number;
  export let frameMarker: string;

  let currentMarkerState: string | null = null;

  const hasLoopFrame = (frameMarker) => {
    if (frameMarker == 4 || frameMarker == 5) {
      return false;
    }
    return true;
  };

  $: setAnimation(currentMarkerState, frameMarker);
  $: absolutePath = __webpack_public_path__ || '/';

  const setAnimation = (currentState: string, nextFrame: string) => {
    if (!nextFrame || currentState === nextFrame) {
      return;
    }

    // console.log(nextFrame);

    // Set the current state variable for next time
    currentMarkerState = nextFrame;

    const initialFrameNoLoop = { start: nextFrame, end: String(parseInt(nextFrame) + 1), loop: false };
    const initialFrameWithLoop = { start: nextFrame, end: `${nextFrame}Loop`, loop: false };
    const loopFrame = { start: `${nextFrame}Loop`, end: String(parseInt(nextFrame) + 1), loop: true };

    if (hasLoopFrame(nextFrame)) {
      
      // If scrolling up, just do the loop frame
      if (currentState > nextFrame) {
        return animateMarkers(iframeEl, [loopFrame]);
      }

      // Else, do the initial animation followed by the loop frame
      return animateMarkers(iframeEl, [
        initialFrameWithLoop,
        loopFrame
      ]);
    } 

    // The last frame just has a null end marker
    if (nextFrame == 5) {
      return animateMarkers(iframeEl, [{ start: nextFrame, loop: false }]);
    }

    // If scrolling up, pause at the end state
    if (currentState > nextFrame) {
      return animateMarkers(iframeEl, [{ start: nextFrame, end: nextFrame, loop: false }]);
    }

    return animateMarkers(iframeEl, [initialFrameNoLoop]);
  }

</script>

{#if width > 0 && height > 0}
  <SVG
    path={`${absolutePath}Algorithms-1-FullDraft`}
    bind:iframeEl={iframeEl}
    onLoad={() => {
      runCommand(iframeEl, 'globalPlay');
      pauseTimeline(iframeEl);

      setAnimation(null, frameMarker);
    }}
  />
{/if}

<style lang="scss">

</style>
