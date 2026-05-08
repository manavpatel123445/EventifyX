import React from "react";
import { Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

/**
 * AnimatedRoutes provides smooth page transitions using framer-motion.
 * It wraps the standard Routes component and uses AnimatePresence to
 * manage the entry/exit animations.
 */
const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <Routes location={location} key={location.pathname}>
          {children}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
