import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type AnimatedContainerProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom, duration: 0.6, ease: "easeOut" },
  }),
};

const AnimatedContainer = ({ children, delay = 0, className, id }: AnimatedContainerProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
