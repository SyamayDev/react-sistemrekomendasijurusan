import React from "react";
import { motion } from "framer-motion";

export default function AnimateOnScroll({
  children,
  delay = 0,
  threshold = 0.15,
  once = true,
  className = "",
  ...rest
}) {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 1.46, 1],
        delay: delay / 1000,
      }}
      variants={variants}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
