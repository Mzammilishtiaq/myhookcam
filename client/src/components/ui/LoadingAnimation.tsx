import { motion } from "framer-motion";

interface LoadingAnimationProps {
  fullScreen?: boolean;
}

export function LoadingAnimation({ fullScreen = true }: LoadingAnimationProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
    : "w-full h-full flex flex-col items-center justify-center bg-transparent py-12";

  return (
    <div className={containerClasses}>
      <div className={fullScreen ? "relative w-64 h-64" : "relative w-48 h-48"}>
        {/* Crane Structure */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Base */}
          <rect x="80" y="160" width="40" height="10" fill="#555555" />
          {/* Vertical Mast */}
          <rect x="95" y="40" width="10" height="120" fill="#555555" />
          
          {/* Jib (Horizontal Arm) */}
          <motion.g
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{ originX: "100px", originY: "45px" }}
          >
            <rect x="20" y="40" width="160" height="8" fill="#FBBC05" />
            
            {/* Trolley */}
            <motion.g
              animate={{ x: [0, 40, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <rect x="60" y="48" width="15" height="5" fill="#555555" />
              
              {/* Cable */}
              <motion.line
                x1="67.5"
                y1="53"
                x2="67.5"
                y2="100"
                stroke="#555555"
                strokeWidth="2"
              />
              
              {/* Hook & Weight */}
              <motion.g
                animate={{ y: [0, 30, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Hook */}
                <path
                  d="M 65 100 Q 67.5 105 70 100"
                  fill="none"
                  stroke="#555555"
                  strokeWidth="2"
                />
                {/* Weight */}
                <rect x="60" y="105" width="15" height="15" fill="#FBBC05" />
                <text x="62" y="116" fontSize="8" fill="#555555" fontWeight="bold">HC</text>
              </motion.g>
            </motion.g>
          </motion.g>
        </svg>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-4 text-[#555555] font-bold uppercase tracking-widest"
      >
        <span className="text-[#FBBC05]">HookCam</span> Loading...
      </motion.div>
    </div>
  );
}
