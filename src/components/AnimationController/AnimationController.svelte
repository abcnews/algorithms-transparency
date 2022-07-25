<script lang="ts">
  import SVG from '../../lib/components/KeyshapeSVG/KeyshapeSVG.svelte';

  let svgComponent: any;

  export let frameMarker: string | null;
  export let scrollytellerName: string;
  export let onTransitionToDark: any = (frame: string) => frame;

  // let onFinishAnimation: any = null;
  let currentMarkerState: string | null = null;
  let timeline: any;

  const FINAL_FRAME = {
    first: '6',
    second: '3',
    third: '6',
  };
  $: finalFrame = FINAL_FRAME[scrollytellerName];

  const SVGS = {
    first: 'Algorithms_Part1.svg',
    second: 'Algorithms_Part2.svg',
    third: 'Algorithms_Part3.svg',
  };
  $: svgPath = SVGS[scrollytellerName];

  const hasLoopFrame = (scrollytellerName: string, frameMarker: string | null) => {
    if (scrollytellerName === 'first') {
      if (frameMarker === '6') {
        return true;
      }
      return false;
    }
    if (scrollytellerName === 'second') {
      return false;
    }
    if (scrollytellerName === 'third') {
      return false;
    }
    return true;
  };

  $: setAnimation(currentMarkerState, frameMarker);
  $: absolutePath = __webpack_public_path__ || '/';

  let animationFrame;
  const setAnimation = (currentState: string | null, nextFrame: string | null) => {
    cancelAnimationFrame(animationFrame)
    if (!nextFrame || currentState === nextFrame || !svgComponent) {
      return;
    }
    const animate = svgComponent.animate;

    // Set the current state variable for next time
    currentMarkerState = nextFrame;

    const initialFrameNoLoop = { start: nextFrame, end: String(parseInt(nextFrame) + 1), loop: false };
    const initialFrameWithLoop = { start: nextFrame, end: `${nextFrame}Loop`, loop: false };
    const loopFrame = { start: `${nextFrame}Loop`, end: String(parseInt(nextFrame) + 1), loop: true };

    if (hasLoopFrame(scrollytellerName, nextFrame)) {
      // If scrolling up, just do the loop frame
      if (parseInt(currentState || '0') > parseInt(nextFrame)) {
        return animate([loopFrame]);
      }

      if (nextFrame === finalFrame) {
        return animate([
          initialFrameWithLoop,
          { ...loopFrame, end: null }
        ]);
      }

      // Else, do the initial animation followed by the loop frame
      return animate([
        initialFrameWithLoop,
        loopFrame
      ]);
    } 

    // If scrolling up, pause at the end state
    if (parseInt(currentState || '0') > parseInt(nextFrame)) {
      return animate([{ start: nextFrame, end: nextFrame, loop: false }]);
    }

    // onFinishAnimation = (frame: string) => {
    //   if (scrollytellerName === 'second' && frame === '3') {
    //     // Finish the animation
    //     animate([{ start: "3", loop: false }]);
    //     // Trigger the cross-fade
    //     onTransitionToDark();
    //   }
    // };

    const step = () => {
      const current = timeline.time();
      console.log(current);
      if (current > 2650) {
        onTransitionToDark();
        return;
      }
      animationFrame = window.requestAnimationFrame(step);
    };

    // setup check for crossfade callback
    if (scrollytellerName === 'second' && nextFrame === '2') {
      animationFrame = window.requestAnimationFrame(step);
    }

    // The last frame just has a null end marker
    if (nextFrame === finalFrame) {
      return animate([{ start: nextFrame, loop: false }]);
    }

    return animate([initialFrameNoLoop]);
  }

  // bind:onFinishAnimation={onFinishAnimation}
</script>

<SVG
  path={`${absolutePath}${svgPath}`}
  bind:this={svgComponent}
  bind:timeline={timeline}
  onLoad={() => {
    setAnimation(null, frameMarker);
  }}
/>

