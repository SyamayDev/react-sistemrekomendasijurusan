import { motion } from "framer-motion";

export default function AnimatedButton({ children, onClick, className = "" }) {
  // Combine the global 'btn' class with any custom classes passed in
  const buttonClasses = `btn ${className}`;

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={buttonClasses}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
