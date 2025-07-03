"use client"

interface FloatingNoteLogoProps {
  size?: number
  className?: string
}

export function FloatingNoteLogo({ size = 24, className = "" }: FloatingNoteLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float"
      >
        {/* Shadow/blur effect */}
        <ellipse cx="12" cy="21" rx="4" ry="1.5" fill="rgba(0,0,0,0.2)" className="animate-pulse" />

        {/* Main note paper */}
        <rect
          x="6"
          y="4"
          width="12"
          height="14"
          rx="2"
          fill="white"
          stroke="#333333"
          strokeWidth="1"
          className="drop-shadow-md"
        />

        {/* Folded corner */}
        <path d="M15 4 L18 4 Q18 4 18 4 L18 7 L15 4 Z" fill="#f0f0f0" stroke="#333333" strokeWidth="0.5" />

        {/* Text lines */}
        <line x1="8" y1="8" x2="14" y2="8" stroke="#666666" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="10" x2="16" y2="10" stroke="#666666" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="12" x2="13" y2="12" stroke="#666666" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="14" x2="15" y2="14" stroke="#666666" strokeWidth="1" strokeLinecap="round" />

        {/* Floating sparkles - now in grayscale */}
        <circle cx="4" cy="6" r="1" fill="#666666" className="animate-twinkle" />
        <circle cx="20" cy="8" r="0.8" fill="#999999" className="animate-twinkle-delayed" />
        <circle cx="3" cy="12" r="0.6" fill="#333333" className="animate-twinkle-slow" />
        <circle cx="21" cy="14" r="0.7" fill="#777777" className="animate-twinkle-fast" />
      </svg>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-twinkle-delayed {
          animation: twinkle 2s ease-in-out infinite 0.5s;
        }
        
        .animate-twinkle-slow {
          animation: twinkle 3s ease-in-out infinite 1s;
        }
        
        .animate-twinkle-fast {
          animation: twinkle 1.5s ease-in-out infinite 0.3s;
        }
      `}</style>
    </div>
  )
}
