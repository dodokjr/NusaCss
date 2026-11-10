import { animate } from "./core/animate.js";
import { resolveEasing, easing } from "./core/easing.js";

export { animate, easing, resolveEasing };

export const motion = {
  animate,

  set(target, values) {
    const elements = typeof target === "string"
      ? document.querySelectorAll(target)
      : target instanceof Element
        ? [target]
        : target;

    for (const element of elements) {
      Object.assign(element.style, values);
    }
  }
};