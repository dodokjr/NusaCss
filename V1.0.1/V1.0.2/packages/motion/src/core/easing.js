export const easing = {
    linear: "linear",
  
    ease: "ease",
  
    easeIn: "cubic-bezier(0.42, 0, 1, 1)",
  
    easeOut: "cubic-bezier(0, 0, 0.58, 1)",
  
    easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  
    smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  
    backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  
    anticipate: "cubic-bezier(0.36, 0, 0.66, -0.56)"
  };
  
  export function resolveEasing(value = "easeOut") {
    return easing[value] ?? value;
  }