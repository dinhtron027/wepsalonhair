import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

type ParallaxReturn = {
  ref: React.RefObject<HTMLDivElement>;
  y: MotionValue<string | number>;
  opacity: MotionValue<number>;
};

const useParallax = (): ParallaxReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6]);

  return { ref, y, opacity };
};

export default useParallax;
