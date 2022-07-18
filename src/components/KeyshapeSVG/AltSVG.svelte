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

  let animateFn: any;
  const transform = (svg: SVGElement) => {
    //
    // Update relative URLs on image assets
    //
    const images = svg.querySelectorAll('image');
    const basePath = path.split('/').slice(0, -1).join('/');
    images.forEach(image => {
      if (image.href.baseVal.startsWith('./')) {
        image.setAttribute('xlink:href', `${basePath}/${image.href.baseVal.slice(2)}`);
      }
    });

    //
    // Prefix all filter/gradient IDs to prevent clashes with other SVGs in the DOM
    //
    const prefix = (Math.random() + 1).toString(36).substring(7);
    const defs = Array.from(svg.childNodes || []).find(n => n.nodeName === 'defs')?.childNodes;
    Array.from(defs).forEach((def: Element) => {
      const originalID = def.getAttribute('id');
      const newID = `${prefix}-${originalID}`;
      def.setAttribute('id', newID);

      // TODO: Handle attributes other than fill
      const elemsUsing = svg.querySelectorAll(`[fill="url(#${originalID})"]`);
      Array.from(elemsUsing).forEach(elem => {
        elem.setAttribute('fill', `url(#${newID})`);
      });
    });

    //
    // Extract Keyshape JS code so we can call it in the svelte script
    //
    const regex = /ks\.animate.*ks\.globalPause\(\)/gs;
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
