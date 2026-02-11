"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  to?: string;
  back?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function RedirectWithFadeButton({
  to,
  back,
  className,
  children,
}: Props) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const handle = () => {
    setShow(true);
  };

  return (
    <>
      <button onClick={handle} className={className}>
        {children}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onAnimationComplete={() => {
              if (back) router.back();
              else if (to) router.push(to);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#000",
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
