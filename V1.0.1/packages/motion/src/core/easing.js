export const easings = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  "ease-in-quad": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
  "ease-out-quad": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  "ease-in-out-quad": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
  "ease-out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "ease-out-circ": "cubic-bezier(0.075, 0.82, 0.165, 1)"
};

export function resolveEasing(value = "ease-out") {
  if (typeof value === "string") {
    return easings[value] || value;
  }

  return "ease-out";
}
