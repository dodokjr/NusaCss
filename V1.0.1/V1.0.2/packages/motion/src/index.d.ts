export interface MotionOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  autoplay?: boolean;
  iterations?: number;
}

export interface MotionController {
  play(): this;
  pause(): this;
  reverse(): this;
  cancel(): this;
  finish(): this;
  seek(time: number): this;
  speed(value: number): this;
  destroy(): void;
}

export declare function animate(
  target: string | Element | Iterable<Element>,
  keyframes: Record<string, unknown> | Keyframe[],
  options?: MotionOptions
): MotionController;

export declare const motion: {
  animate: typeof animate;
};
