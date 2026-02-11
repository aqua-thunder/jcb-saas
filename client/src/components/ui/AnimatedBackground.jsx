import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
            {/* Ultra-subtle texture for a premium feel */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Animated Lines */}
            <div className="absolute inset-0">
                {[...Array(35)].map((_, i) => (
                    <motion.div
                        key={`line-${i}`}
                        className="absolute bg-gradient-to-r from-transparent via-[#fc8e00]/20 to-transparent"
                        initial={{
                            top: `${Math.random() * 100}%`,
                            left: `-${Math.random() * 200 + 400}px`,
                            width: `${Math.random() * 300 + 400}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            opacity: 0
                        }}
                        animate={{
                            left: "110%",
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 15 + 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 20
                        }}
                        style={{
                            transform: `rotate(${Math.random() * 40 - 20}deg)`
                        }}
                    />
                ))}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`line-v-${i}`}
                        className="absolute bg-gradient-to-b from-transparent via-[#fc8e00]/10 to-transparent"
                        initial={{
                            left: `${Math.random() * 100}%`,
                            top: `-${Math.random() * 200 + 400}px`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 300 + 400}px`,
                            opacity: 0
                        }}
                        animate={{
                            top: "110%",
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 20 + 15,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 25
                        }}
                    />
                ))}
            </div>

            {/* Added subtle depth gradients as well to look "good" while remaining white-compatible */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-white opacity-40"></div>
        </div>
    );
};

export default AnimatedBackground;
