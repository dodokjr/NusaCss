import { resolveEasing } from "./easing.js";

const TRANSFORM_KEYS = new Set([
  "x",
  "y",
  "z",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ"
]);

function isElement(target) {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element
  );
}

function normalizeTargets(target) {
  if (typeof target === "string") {
    if (typeof document === "undefined") {
      throw new Error("DOM is not available.");
    }

    return [...document.querySelectorAll(target)];
  }

  if (isElement(target)) {
    return [target];
  }

  if (target && typeof target[Symbol.iterator] === "function") {
    return [...target].filter(isElement);
  }

  throw new TypeError("Invalid animation target.");
}

function transformValue(key, value) {
  if (typeof value === "number") {
    switch (key) {
      case "x":
      case "y":
      case "z":
        return `${value}px`;

      case "rotate":
      case "rotateX":
      case "rotateY":
      case "rotateZ":
        return `${value}deg`;

      default:
        return String(value);
    }
  }

  return String(value);
}

function buildTransform(values = {}) {
  const transforms = [];

  if (values.x !== undefined) {
    transforms.push(
      `translateX(${transformValue("x", values.x)})`
    );
  }

  if (values.y !== undefined) {
    transforms.push(
      `translateY(${transformValue("y", values.y)})`
    );
  }

  if (values.z !== undefined) {
    transforms.push(
      `translateZ(${transformValue("z", values.z)})`
    );
  }

  if (values.rotate !== undefined) {
    transforms.push(
      `rotate(${transformValue("rotate", values.rotate)})`
    );
  }

  if (values.rotateX !== undefined) {
    transforms.push(
      `rotateX(${transformValue("rotateX", values.rotateX)})`
    );
  }

  if (values.rotateY !== undefined) {
    transforms.push(
      `rotateY(${transformValue("rotateY", values.rotateY)})`
    );
  }

  if (values.rotateZ !== undefined) {
    transforms.push(
      `rotateZ(${transformValue("rotateZ", values.rotateZ)})`
    );
  }

  if (values.scale !== undefined) {
    transforms.push(`scale(${values.scale})`);
  }

  if (values.scaleX !== undefined) {
    transforms.push(`scaleX(${values.scaleX})`);
  }

  if (values.scaleY !== undefined) {
    transforms.push(`scaleY(${values.scaleY})`);
  }

  return transforms.join(" ") || "none";
}

function normalizeKeyframes(keyframes) {
  if (Array.isArray(keyframes)) {
    return keyframes.map(frame => {
      const result = { ...frame };
      const transform = {};

      for (const key of Object.keys(result)) {
        if (TRANSFORM_KEYS.has(key)) {
          transform[key] = result[key];
          delete result[key];
        }
      }

      if (Object.keys(transform).length) {
        result.transform = buildTransform(transform);
      }

      return result;
    });
  }

  if (!keyframes || typeof keyframes !== "object") {
    throw new TypeError("Animation keyframes are required.");
  }

  const properties = Object.entries(keyframes);
  const frames = [{}, {}];

  for (const [key, value] of properties) {
    const values = Array.isArray(value)
      ? value
      : [undefined, value];

    if (values.length === 0) continue;

    frames[0][key] = values[0];
    frames[1][key] = values.at(-1);
  }

  const transformStart = {};
  const transformEnd = {};

  for (const key of TRANSFORM_KEYS) {
    if (key in frames[0]) {
      transformStart[key] = frames[0][key];
      delete frames[0][key];
    }

    if (key in frames[1]) {
      transformEnd[key] = frames[1][key];
      delete frames[1][key];
    }
  }

  if (Object.keys(transformStart).length) {
    frames[0].transform = buildTransform(transformStart);
  }

  if (Object.keys(transformEnd).length) {
    frames[1].transform = buildTransform(transformEnd);
  }

  return frames;
}

function getReducedMotion() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function validateOptions(options) {
  const duration = Number(options.duration ?? 500);
  const delay = Number(options.delay ?? 0);

  if (!Number.isFinite(duration) || duration < 0) {
    throw new RangeError("duration must be >= 0.");
  }

  if (!Number.isFinite(delay)) {
    throw new RangeError("delay must be finite.");
  }

  return {
    ...options,
    duration,
    delay,
    easing: resolveEasing(options.easing),
    fill: options.fill ?? "both"
  };
}

export function animate(target, keyframes, options = {}) {
  const targets = normalizeTargets(target);

  if (!targets.length) {
    throw new Error("No animation targets found.");
  }

  if (typeof Element.prototype.animate !== "function") {
    throw new Error("Web Animations API is not supported.");
  }

  const config = validateOptions(options);

  const frames = normalizeKeyframes(keyframes);

  const duration = getReducedMotion()
    ? 0
    : config.duration;

  const animations = targets.map(element => {
    const animation = element.animate(frames, {
      duration,
      delay: config.delay,
      easing: config.easing,
      fill: config.fill,
      direction: config.direction ?? "normal",
      iterations: config.iterations ?? 1
    });

    if (config.autoplay === false) {
      animation.pause();
      animation.currentTime = 0;
    }

    if (config.signal) {
      if (config.signal.aborted) {
        animation.cancel();
      } else {
        config.signal.addEventListener(
          "abort",
          () => animation.cancel(),
          { once: true }
        );
      }
    }

    return animation;
  });

  let destroyed = false;

  const controller = {
    get animations() {
      return animations;
    },

    get finished() {
      return Promise.all(
        animations.map(animation => animation.finished)
      );
    },

    get currentTime() {
      return animations[0]?.currentTime ?? 0;
    },

    get playState() {
      return animations[0]?.playState ?? "idle";
    },

    play() {
      if (!destroyed) {
        animations.forEach(a => a.play());
      }
      return controller;
    },

    pause() {
      animations.forEach(a => a.pause());
      return controller;
    },

    reverse() {
      if (!destroyed) {
        animations.forEach(a => a.reverse());
      }
      return controller;
    },

    cancel() {
      animations.forEach(a => a.cancel());
      return controller;
    },

    finish() {
      animations.forEach(a => {
        if (a.playState !== "idle") {
          a.finish();
        }
      });
      return controller;
    },

    seek(time) {
      if (!Number.isFinite(time)) {
        throw new TypeError("Seek time must be a number.");
      }

      animations.forEach(a => {
        a.currentTime = Math.max(0, time);
      });

      return controller;
    },

    speed(value) {
      if (!Number.isFinite(value) || value === 0) {
        throw new RangeError("Speed must be a non-zero number.");
      }

      animations.forEach(a => {
        a.playbackRate = value;
      });

      return controller;
    },

    destroy() {
      if (destroyed) return;

      destroyed = true;

      animations.forEach(a => a.cancel());
    }
  };

  return controller;
}