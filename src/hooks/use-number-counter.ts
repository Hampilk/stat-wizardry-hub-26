import { useState, useEffect } from 'react';

interface UseNumberCounterProps {
  target: number;
  duration?: number;
  startOnMount?: boolean;
}

export const useNumberCounter = ({
  target,
  duration = 1000,
  startOnMount = true
}: UseNumberCounterProps) => {
  const [count, setCount] = useState(startOnMount ? 0 : target);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCount(0);
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }
  }, [target, startOnMount]);

  return { count, startAnimation, isAnimating };
};