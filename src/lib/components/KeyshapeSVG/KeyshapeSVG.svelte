<script lang="ts">
  import './keyshapejs-1.2.0.min.js';
  import InlineSVG from './InlineSVG.svelte';

  // Path of SVG asset
  export let path: string;
  export let timeline: any = null;

  // Callback for parent
  export let onLoad = () => null; 
  export let onFinishAnimation = (end: string) => end;

  const onLoadCb = () => {
    timeline = animateFn();
    timeline?.pause();

    onLoad();
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
    // Prefix all IDs to prevent clashes with other SVGs in the DOM
    //
    const prefix = (Math.random() + 1).toString(36).substring(7);
    const idMap: Record<string, string> = {};
    const allObjectsWithIds = svg.querySelectorAll('[id]');
    Array.from(allObjectsWithIds).forEach((elem: Element) => {
      const originalID = elem.getAttribute('id');
      if (!originalID) {
        return;
      }
      const newID = `${prefix}-${originalID}`;
      elem.setAttribute('id', newID);
      idMap[originalID] = newID;

      const ATTRS = ['fill', 'stroke', 'mask'];
      ATTRS.forEach(attr => {
        const elemsUsing = svg.querySelectorAll(`[${attr}="url(#${originalID})"]`);
        Array.from(elemsUsing).forEach(elem => {
          elem.setAttribute(attr, `url(#${newID})`);
        });
      });

      const XLINK_ATTRS = ['href'];
      XLINK_ATTRS.forEach(attr => {
        const elemsUsing = svg.querySelectorAll(`[*|${attr}="#${originalID}"]`);
        Array.from(elemsUsing).forEach(elem => {
          elem.setAttribute(`xlink:${attr}`, `#${newID}`);
        });
      });
    });

    //
    // Extract Keyshape JS code so we can call it in the svelte script
    //
    // TODO: Clean this up - possible XSS vector?
    const regex = /ks\.animate.*ks\.globalPause\(\)/gs;
    const found = svg.innerHTML.match(regex);
    if (found) {
      let animationCode = found[0];

      // Replace any prefixed IDs in the SVG
      Object.keys(idMap).forEach(id => {
        animationCode = animationCode.replace(`"#${id}"`, `"#${idMap[id]}"`);
      });

      // Insert extracted code into a function
      animateFn = new Function(`ks=window.KeyshapeJS; const tl = ${animationCode}; return tl;`);
    }
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
        timeline.onfinish = () => onFinishAnimation(end);
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
