export const presets = {
  fadeIn: {
    opacity: [0, 1],
    duration: 600,
    easing: "ease-out"
  },

  fadeUp: {
    opacity: [0, 1],
    y: [35, 0],
    duration: 700,
    easing: "ease-out"
  },

  fadeDown: {
    opacity: [0, 1],
    y: [-35, 0],
    duration: 700,
    easing: "ease-out"
  },

  zoomIn: {
    opacity: [0, 1],
    scale: [0.85, 1],
    duration: 600,
    easing: "ease-out-back"
  },

  slideLeft: {
    opacity: [0, 1],
    x: [60, 0],
    duration: 700,
    easing: "ease-out"
  },

  slideRight: {
    opacity: [0, 1],
    x: [-60, 0],
    duration: 700,
    easing: "ease-out"
  },

  bounce: {
    y: [0, -20],
    duration: 500,
    spring: true
  }
};
