import { resolveEasing } from "./easing.js";
import { springProgress, springDuration } from "./spring.js";

const TRANSFORMS = new Set([
  "x",
  "y",
  "z",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "skewX",
  "skewY"
]);

function toElements(target) {
  if (typeof target === "string") {
    return [...document.querySelectorAll(target)];
  }

  if (target instanceof Element) {
    return [target];
  }

  if (target && typeof target.length === "number") {
    return [...target].filter((item) => item instanceof Element);
  }

  return [];
}

function normalizeValue(value) {
  return Array.isArray(value) ? value : [value, value];
}

function interpolate(from, to, progress) {
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * progress;
  }

  return progress < 1 ? from : to;
}

function transformValue(values, progress) {
  const parts = [];

  for (const [key, rawValue] of Object.entries(values)) {
    const [from, to] = normalizeValue(rawValue);
    const value = interpolate(from, to, progress);

    switch (key) {
      case "x":
        parts.push(`translateX(${value}px)`);
        break;
      case "y":
        parts.push(`translateY(${value}px)`);
        break;
      case "z":
        parts.push(`translateZ(${value}px)`);
        break;
      case "scale":
        parts.push(`scale(${value})`);
        break;
      case "scaleX":
        parts.push(`scaleX(${value})`);
        break;
      case "scaleY":
        parts.push(`scaleY(${value})`);
        break;
      case "rotate":
        parts.push(`rotate(${value}deg)`);
        break;
      case "rotateX":
        parts.push(`rotateX(${value}deg)`);
        break;
      case "rotateY":
        parts.push(`rotateY(${value}deg)`);
        break;
      case "skewX":
        parts.push(`skewX(${value}deg)`);
        break;
      case "skewY":
        parts.push(`skewY(${value}deg)`);
        break;
    }
  }

  return parts.join(" ");
}

function buildFrames(properties, springOptions) {
  const sampleCount = springOptions ? 60 : 2;

  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const progress = index / sampleCount;
    const eased = springOptions
      ? springProgress(springOptions, progress)
      : progress;

    const frame = {};
    const transforms = {};

    for (const [property, rawValue] of Object.entries(properties)) {
      const [from, to] = normalizeValue(rawValue);

      if (TRANSFORMS.has(property)) {
        transforms[property] = rawValue;
        continue;
      }

      frame[property] = interpolate(from, to, eased);
    }

    if (Object.keys(transforms).length) {
      frame.transform = transformValue(transforms, eased);
    }

    frame.offset = progress;
    return frame;
  });
}

function createAnimation(element, properties, options) {
  if (typeof element.animate !== "function") {
    throw new Error("NusaCss Motion membutuhkan Web Animations API.");
  }

  const {
    duration = 600,
    delay = 0,
    easing = "ease-out",
    fill = "both",
    iterations = 1,
    direction = "normal",
    spring = false,
    onComplete,
    onUpdate
  } = options;

  const springOptions = spring === true ? {} : spring || null;

  const actualDuration = springOptions
    ? springDuration(springOptions)
    : duration;

  const frames = buildFrames(properties, springOptions);

  const animation = element.animate(frames, {
    duration: actualDuration,
    delay,
    easing: springOptions ? "linear" : resolveEasing(easing),
    fill,
    iterations,
    direction
  });

  animation.onfinish = () => onComplete?.(element);

  if (onUpdate) {
    const update = () => {
      onUpdate(element, animation.currentTime);
      if (animation.playState === "running") {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  return animation;
}

export function animate(target, properties, options = {}) {
  if (typeof document === "undefined") {
    throw new Error("motion.animate() hanya dapat digunakan di browser.");
  }

  const elements = toElements(target);

  if (!elements.length) {
    return {
      animations: [],
      cancel() {},
      pause() {},
      play() {},
      reverse() {},
      finished: Promise.resolve()
    };
  }

  const animations = elements.map((element) =>
    createAnimation(element, properties, options)
  );

  return {
    animations,
    cancel() {
      animations.forEach((animation) => animation.cancel());
    },
    pause() {
      animations.forEach((animation) => animation.pause());
    },
    play() {
      animations.forEach((animation) => animation.play());
    },
    reverse() {
      animations.forEach((animation) => animation.reverse());
    },
    finished: Promise.all(animations.map((animation) => animation.finished))
  };
}
