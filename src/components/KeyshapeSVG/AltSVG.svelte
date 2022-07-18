<script context="module" lang="ts">
  import '../../keyshapejs-1.2.0.min.js';
</script>

<script lang="ts">
  import InlineSVG from 'svelte-inline-svg'

  // Path of SVG asset
  export let path: string;

  // Callback for parent
  export let onLoad: any;
  export let onFinishAnimation: any;

  let timeline: any = null;
  const onLoadCb = () => {
    timeline = animateFn();
    timeline?.pause();

    if (onLoad) {
      onLoad();
    }
  };

  const regex = /ks\.animate.*ks\.globalPause\(\)/gs;

  let animateFn;
  const transform = (svg: any) => {
    //
    // Update relative URLs on image assets
    //
    const images = svg.querySelectorAll('image');
    const basePath = path.split('/').slice(0, -1).join('/');
    images.forEach(image => {
      if (image.href.baseVal.startsWith('./')) {
        image.setAttribute('href', `${basePath}/${image.href.baseVal.slice(2)}`);
      }
    });

    //
    // Extract Keyshape JS code so we can call it in the svelte script
    //
    const found = svg.innerHTML.match(regex);
    // Insert extracted code into a function
    animateFn = new Function(`ks=window.KeyshapeJS; const tl = ${found}; return tl;`);
    return svg;
  };

  export function animate(frames: any[]) {
    if (!timeline) {
      return;
    }

    const next = () => {
      const frame = frames.shift();
      if (!frame) {
        return;
      }
      timeline.onfinish = null;
      const { start, end, loop } = frame;

      // console.log(start, end, loop);

      if (start === end) {
        return timeline.time(start).pause();
      }

      // Don't call next as looping lasts forever
      if (loop) {
        timeline.range(start, end || timeline.duration()).loop(true);
        return timeline.play(start);
      }

      // If there's another frame afterwards set it to play "onfinish"
      if (frames.length > 0) {
        timeline.onfinish = next;
      } else {
        timeline.onfinish = () => {
          if (onFinishAnimation) {
            onFinishAnimation(end);
          }
        };
      }

      // Play through once
      timeline.range(timeline.time(), end || timeline.duration()).loop(0);
      return timeline.play(timeline.time());
    };

    return next();
  }
</script>

<InlineSVG
  src={`${path}?global=paused`}
  transformSrc={transform}
  on:loaded={onLoadCb}
/>
