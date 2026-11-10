import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  View
} from "react-native";

function toNativeTransform(properties) {
  const transforms = [];

  if (properties.x !== undefined) {
    transforms.push({ translateX: properties.x });
  }

  if (properties.y !== undefined) {
    transforms.push({ translateY: properties.y });
  }

  if (properties.scale !== undefined) {
    transforms.push({ scale: properties.scale });
  }

  if (properties.rotate !== undefined) {
    transforms.push({
      rotate: `${properties.rotate}deg`
    });
  }

  return transforms;
}

export const MotionView = React.forwardRef(function MotionView(
  {
    animate: animationProps,
    transition = {},
    style,
    children,
    ...rest
  },
  forwardedRef
) {
  const values = useRef({
    opacity: new Animated.Value(1),
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    scale: new Animated.Value(1),
    rotate: new Animated.Value(0)
  }).current;

  useEffect(() => {
    if (!animationProps) return;

    const animations = [];

    for (const [key, rawValue] of Object.entries(animationProps)) {
      const [from, to] = Array.isArray(rawValue)
        ? rawValue
        : [values[key].__getValue(), rawValue];

      if (!values[key]) continue;

      values[key].setValue(from);

      const animation = transition.spring
        ? Animated.spring(values[key], {
            toValue: to,
            stiffness: transition.spring.stiffness || 170,
            damping: transition.spring.damping || 26,
            mass: transition.spring.mass || 1,
            useNativeDriver: true
          })
        : Animated.timing(values[key], {
            toValue: to,
            duration: transition.duration || 600,
            delay: transition.delay || 0,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          });

      animations.push(animation);
    }

    const group = Animated.parallel(animations);
    group.start();

    return () => group.stop();
  }, []);

  const animatedStyle = {
    opacity: values.opacity,
    transform: [
      { translateX: values.x },
      { translateY: values.y },
      { scale: values.scale },
      {
        rotate: values.rotate.interpolate({
          inputRange: [-360, 360],
          outputRange: ["-360deg", "360deg"]
        })
      }
    ]
  };

  return React.createElement(
    Animated.View,
    {
      ...rest,
      ref: forwardedRef,
      style: [style, animatedStyle]
    },
    children
  );
});

export function createMotionValue(initialValue = 0) {
  const value = new Animated.Value(initialValue);

  return {
    value,

    set(nextValue) {
      value.setValue(nextValue);
    },

    animateTo(nextValue, options = {}) {
      const animation = options.spring
        ? Animated.spring(value, {
            toValue: nextValue,
            stiffness: options.stiffness || 170,
            damping: options.damping || 26,
            useNativeDriver: options.useNativeDriver ?? true
          })
        : Animated.timing(value, {
            toValue: nextValue,
            duration: options.duration || 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: options.useNativeDriver ?? true
          });

      animation.start();
      return animation;
    }
  };
}
