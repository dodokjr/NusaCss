import React, { useEffect } from "react";

import {
  View,
  Text,
  Pressable
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing
} from "react-native-reanimated";

export function useNusaMotion({
  initial = {},
  animate = {},
  transition = {}
} = {}) {
  const opacity = useSharedValue(initial.opacity ?? 0);
  const translateX = useSharedValue(initial.x ?? 0);
  const translateY = useSharedValue(initial.y ?? 0);
  const scale = useSharedValue(initial.scale ?? 1);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,

    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  const play = () => {
    const duration = transition.duration ?? 500;

    if (transition.type === "spring") {
      const config = {
        damping: transition.damping ?? 18,
        stiffness: transition.stiffness ?? 170,
        mass: transition.mass ?? 1
      };

      if (animate.opacity !== undefined) {
        opacity.value = withSpring(
          animate.opacity,
          config
        );
      }

      if (animate.x !== undefined) {
        translateX.value = withSpring(
          animate.x,
          config
        );
      }

      if (animate.y !== undefined) {
        translateY.value = withSpring(
          animate.y,
          config
        );
      }

      if (animate.scale !== undefined) {
        scale.value = withSpring(
          animate.scale,
          config
        );
      }

      return;
    }

    const config = {
      duration,
      easing: Easing.out(Easing.cubic)
    };

    if (animate.opacity !== undefined) {
      opacity.value = withTiming(
        animate.opacity,
        config
      );
    }

    if (animate.x !== undefined) {
      translateX.value = withTiming(
        animate.x,
        config
      );
    }

    if (animate.y !== undefined) {
      translateY.value = withTiming(
        animate.y,
        config
      );
    }

    if (animate.scale !== undefined) {
      scale.value = withTiming(
        animate.scale,
        config
      );
    }
  };

  const cancel = () => {
    cancelAnimation(opacity);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
  };

  return {
    style,
    play,
    cancel
  };
}

export function MotionView({
  children,
  initial,
  animate,
  transition,
  style,
  ...props
}) {
  const motion = useNusaMotion({
    initial,
    animate,
    transition
  });

  useEffect(() => {
    motion.play();

    return motion.cancel;
  }, []);

  return (
    <Animated.View
      {...props}
      style={[
        style,
        motion.style
      ]}
    >
      {children}
    </Animated.View>
  );
}

export { Animated };