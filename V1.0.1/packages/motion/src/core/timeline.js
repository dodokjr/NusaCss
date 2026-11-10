import { animate } from "./animate.js";

export function timeline(options = {}) {
  const steps = [];
  let running = null;

  function add(target, properties, config = {}) {
    steps.push({ target, properties, config });
    return controller;
  }

  async function play() {
    for (const step of steps) {
      running = animate(step.target, step.properties, {
        ...options,
        ...step.config
      });

      await running.finished;
    }
  }

  function pause() {
    running?.pause();
  }

  function cancel() {
    running?.cancel();
  }

  const controller = {
    add,
    play,
    pause,
    cancel,
    get steps() {
      return [...steps];
    }
  };

  return controller;
}
