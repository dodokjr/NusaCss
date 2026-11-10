export type EasingName =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-out-back"
  | "ease-out-circ";

export type MotionValue = number | string;

export type MotionProperties = {
  opacity?: MotionValue | [MotionValue, MotionValue];
  x?: number | [number, number];
  y?: number | [number, number];
  z?: number | [number, number];
  scale?: number | [number, number];
  scaleX?: number | [number, number];
  scaleY?: number | [number, number];
  rotate?: number | [number, number];
  rotateX?: number | [number, number];
  rotateY?: number | [number, number];
  [property: string]: unknown;
};

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
}

export interface AnimateOptions {
  duration?: number;
  delay?: number;
  easing?: EasingName | string;
  fill?: FillMode;
  iterations?: number;
  direction?: PlaybackDirection;
  spring?: boolean | SpringOptions;
  onComplete?: (element: Element) => void;
  onUpdate?: (element: Element, time: number) => void;
}

export interface AnimationController {
  animations: Animation[];
  cancel(): void;
  pause(): void;
  play(): void;
  reverse(): void;
  finished: Promise<Animation[]>;
}

export declare function animate(
  target: string | Element | Element[],
  properties: MotionProperties,
  options?: AnimateOptions
): AnimationController;

export declare function timeline(options?: AnimateOptions): {
  add(
    target: string | Element,
    properties: MotionProperties,
    options?: AnimateOptions
  ): unknown;
  play(): Promise<void>;
  pause(): void;
  cancel(): void;
};

export declare const motion: {
  animate: typeof animate;
  timeline: typeof timeline;
  presets: Record<string, Record<string, unknown>>;
  runPreset(
    target: string | Element,
    name: string,
    options?: AnimateOptions
  ): AnimationController;
};

export declare const presets: Record<string, Record<string, unknown>>;
export declare const easings: Record<string, string>;
export declare function resolveEasing(value?: string): string;
export declare function springProgress(options: SpringOptions, progress: number): number;
export declare function springDuration(options?: SpringOptions): number;

export default motion;
