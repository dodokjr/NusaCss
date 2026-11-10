import { animate } from "./core/animate.js";
import { timeline } from "./core/timeline.js";
import { presets } from "./presets/index.js";

export const motion = {
  animate,
  timeline,
  presets,

  runPreset(target, name, options = {}) {
    const preset = presets[name];

    if (!preset) {
      throw new Error(`NusaCss preset "${name}" tidak ditemukan.`);
    }

    const {
      duration,
      easing,
      spring,
      ...properties
    } = preset;

    return animate(target, properties, {
      duration,
      easing,
      spring,
      ...options
    });
  }
};

export { animate, timeline, presets };
export { easings, resolveEasing } from "./core/easing.js";
export { springProgress, springDuration } from "./core/spring.js";

export default motion;
