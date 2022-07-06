declare global {
  interface Window {
    KeyshapeJS: {
      timelines: () => any[];
      globalPause: () => void;
      globalPlay: () => void;
    };
  }
}

type MessageData = {
  type: string;
  payload: unknown;
};

window.addEventListener('message', (message: { data: MessageData }) => {
  if (message.data.type === 'command') {
    const { method, args } = (message.data as any);
    window.KeyshapeJS[method].apply(null, args);
  }

  // Allow keyshape animation timelines to be triggered
  if (message.data.type === 'marker') {

    const { frames } = (message.data as any);
    const tl = window.KeyshapeJS.timelines()[0];


    const next = () => {
      const frame = frames.shift();
      if (!frame) {
        return;
      }
      tl.onfinish = null;
      const { start, end, loop } = frame;

      console.log(start, end, loop);

      // Don't call next as looping lasts forever
      if (loop) {
        tl.range(start, end || tl.duration()).loop(true);
        return tl.play(start);
      }

      // If there's another frame afterwards set it to play "onfinish"
      if (frames.length > 0) {
        tl.onfinish = next;
      }

      // Play through once
      tl.range(tl.time(), end || tl.duration()).loop(0);
      return tl.play(tl.time());
    };

    return next();
  }

  // Pause the animation timeline
  if (message.data.type === 'tl-pause') {
    const tl = window.KeyshapeJS.timelines()[0];
    tl.pause();
  }
});

export {};


