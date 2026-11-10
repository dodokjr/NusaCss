import React, { useEffect, useRef } from "react";
import { animate } from "../../motion/src/core/animate.js";

function createMotionComponent(tag) {
  return React.forwardRef(function NusaMotionComponent(
    {
      animate: animationProps,
      transition = {},
      initial,
      onAnimationComplete,
      children,
      style,
      ...rest
    },
    forwardedRef
  ) {
    const elementRef = useRef(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element || !animationProps) return;

      const animation = animate(element, animationProps, {
        ...transition,
        onComplete: onAnimationComplete
      });

      return () => animation.cancel();
    }, []);

    const setRef = (node) => {
      elementRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return React.createElement(
      tag,
      {
        ...rest,
        ref: setRef,
        style: {
          ...style,
          ...(initial || {})
        }
      },
      children
    );
  });
}

const tags = [
  "div", "section", "article", "main", "header",
  "footer", "nav", "span", "p", "button",
  "img", "ul", "li", "h1", "h2", "h3"
];

export const Motion = Object.fromEntries(
  tags.map((tag) => [tag, createMotionComponent(tag)])
);

export function useNusaMotion() {
  const ref = useRef(null);
  const activeAnimation = useRef(null);

  const start = (properties, options = {}) => {
    if (!ref.current) return null;

    activeAnimation.current?.cancel();

    activeAnimation.current = animate(
      ref.current,
      properties,
      options
    );

    return activeAnimation.current;
  };

  useEffect(() => {
    return () => activeAnimation.current?.cancel();
  }, []);

  return {
    ref,
    animate: start,
    cancel: () => activeAnimation.current?.cancel(),
    pause: () => activeAnimation.current?.pause(),
    play: () => activeAnimation.current?.play()
  };
}
