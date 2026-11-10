import {
    useEffect,
    useRef,
    useCallback
  } from "react";
  
  import { animate } from "../../motion/src/core/animate.js";
  
  export function useMotion(config = {}) {
    const ref = useRef(null);
    const animationRef = useRef(null);
  
    const {
      from,
      to,
      duration = 600,
      delay = 0,
      easing = "easeOut",
      autoplay = true,
      ...options
    } = config;
  
    const play = useCallback(() => {
      const element = ref.current;
  
      if (!element) return null;
  
      animationRef.current?.cancel();
  
      const animation = animate(
        element,
        {
          ...from,
          ...to
        },
        {
          duration,
          delay,
          easing,
          autoplay: true,
          ...options
        }
      );
  
      animationRef.current = animation;
  
      return animation;
    }, [from, to, duration, delay, easing]);
  
    const pause = useCallback(() => {
      animationRef.current?.pause();
    }, []);
  
    const reverse = useCallback(() => {
      animationRef.current?.reverse();
    }, []);
  
    const cancel = useCallback(() => {
      animationRef.current?.cancel();
      animationRef.current = null;
    }, []);
  
    useEffect(() => {
      if (autoplay && ref.current) {
        play();
      }
  
      return () => {
        animationRef.current?.destroy();
        animationRef.current = null;
      };
    }, [play, autoplay]);
  
    return {
      ref,
      play,
      pause,
      reverse,
      cancel,
      animation: animationRef
    };
  }