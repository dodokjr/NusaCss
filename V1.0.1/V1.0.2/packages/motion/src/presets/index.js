export const presets = {
    fadeIn: {
      opacity: [0, 1],
      duration: 500,
      easing: "easeOut"
    },
  
    fadeUp: {
      opacity: [0, 1],
      y: [40, 0],
      duration: 650,
      easing: "smooth"
    },
  
    fadeDown: {
      opacity: [0, 1],
      y: [-40, 0],
      duration: 650,
      easing: "smooth"
    },
  
    zoomIn: {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 500,
      easing: "backOut"
    },
  
    slideLeft: {
      opacity: [0, 1],
      x: [80, 0],
      duration: 600,
      easing: "smooth"
    },
  
    slideRight: {
      opacity: [0, 1],
      x: [-80, 0],
      duration: 600,
      easing: "smooth"
    },
  
    rotateIn: {
      opacity: [0, 1],
      rotate: [-15, 0],
      scale: [0.9, 1],
      duration: 700,
      easing: "backOut"
    },
  
    bounceIn: {
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 800,
      easing: "backOut"
    }
  };