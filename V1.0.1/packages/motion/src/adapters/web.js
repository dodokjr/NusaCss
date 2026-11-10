import { animate } from "../core/animate.js";
import { timeline } from "../core/timeline.js";

export const webAdapter = {
  animate,
  timeline,

  set(target, styles) {
    const elements =
      typeof target === "string"
        ? document.querySelectorAll(target)
        : target instanceof Element
          ? [target]
          : target;

    for (const element of elements) {
      Object.assign(element.style, styles);
    }

    return elements;
  }
};
