"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Maximize2, Minimize2, Eye, EyeOff, Settings } from "lucide-react"
import ChromeExtensionPopup from "./popup"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function DesktopExtension() {
  const [isDesktopMode, setIsDesktopMode] = useState(true)
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentNote, setCurrentNote] = useState("")
  const [showExtensionPopup, setShowExtensionPopup] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.screen.width || window.innerWidth,
        height: window.screen.height || window.innerHeight,
      })
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Hotkey functionality for Ctrl+Alt+N (Toggle Extension)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault()
        e.stopPropagation()
        setShowExtensionPopup((prev) => !prev)
        toast({
          title: showExtensionPopup ? "Extension hidden" : "Extension shown",
          description: showExtensionPopup ? "Floaty extension hidden" : "Use Ctrl+Alt+N to toggle quickly",
          duration: 2000,
        })
      }
      // Hotkey for Desktop Mode Toggle
      else if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault()
        e.stopPropagation()
        setIsDesktopMode((prev) => !prev)
        toast({
          title: isDesktopMode ? "Desktop mode disabled" : "Desktop mode enabled",
          description: isDesktopMode ? "Switched to normal mode" : "Switched to desktop integration mode",
          duration: 2000,
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showExtensionPopup, isDesktopMode, toast])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="desktop-extension-container">
      {/* Desktop Background - Black and White */}
      {isDesktopMode && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(128, 128, 128, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%)
              `,
              backgroundSize: "100% 100%",
              backgroundAttachment: "fixed",
            }}
          />

          {/* Desktop Pattern Overlay */}
          <div
            className="fixed inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        </>
      )}

      {/* Desktop Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={() => setIsDesktopMode(!isDesktopMode)}
          size="sm"
          variant="secondary"
          className={`transition-all duration-300 ${
            isDesktopMode
              ? "bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/30"
              : "bg-white text-black hover:bg-gray-100 border-gray-300"
          }`}
        >
          {isDesktopMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="ml-2">{isDesktopMode ? "Exit Desktop" : "Desktop Mode"}</span>
        </Button>

        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="secondary"
          className={`transition-all duration-300 ${
            isDesktopMode
              ? "bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/30"
              : "bg-white text-black hover:bg-gray-100 border-gray-300"
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

        <Button
          onClick={() => setShowExtensionPopup(!showExtensionPopup)}
          size="sm"
          variant="secondary"
          className={`transition-all duration-300 ${
            isDesktopMode
              ? "bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/30"
              : "bg-white text-black hover:bg-gray-100 border-gray-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="ml-2">{showExtensionPopup ? "Hide" : "Show"} Extension</span>
        </Button>
      </div>

      {/* Screen Size Indicator */}
      {isDesktopMode && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs border border-white/20">
            <div className="flex items-center gap-2">
              <Monitor className="w-3 h-3" />
              <span>
                {screenSize.width} × {screenSize.height}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      {isDesktopMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs border border-white/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs border border-white/30">Ctrl+Alt+N</kbd>
                <span>Toggle Extension</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs border border-white/30">Ctrl+Alt+D</kbd>
                <span>Desktop Mode</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center transition-all duration-300 ${
          !isDesktopMode ? "bg-gray-50" : ""
        }`}
      >
        {/* Extension Popup */}
        {showExtensionPopup && (
          <div className="relative">
            <ChromeExtensionPopup
              currentNote={currentNote}
              setCurrentNote={setCurrentNote}
              onClose={() => setShowExtensionPopup(false)}
              isDesktopMode={isDesktopMode}
            />
          </div>
        )}

        {/* Welcome Message when Extension is Hidden */}
        {!showExtensionPopup && (
          <div
            className={`text-center p-8 rounded-lg transition-all duration-300 ${
              isDesktopMode
                ? "bg-black/20 backdrop-blur-md border border-white/20 text-white"
                : "bg-white border border-gray-300 text-black shadow-lg"
            }`}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto mb-4">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isDesktopMode ? "bg-white/20 border border-white/30" : "bg-black border border-gray-300"
                  }`}
                >
                  <Settings className={`w-8 h-8 ${isDesktopMode ? "text-white" : "text-white"}`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Floaty Extension</h2>
              <p className={`text-sm ${isDesktopMode ? "text-white/80" : "text-gray-600"}`}>
                Your smart note-taking and task management extension
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  Press{" "}
                  <kbd
                    className={`px-2 py-1 rounded ${
                      isDesktopMode
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-gray-200 text-black border border-gray-400"
                    }`}
                  >
                    Ctrl+Alt+N
                  </kbd>{" "}
                  to show the extension
                </p>
                <p>
                  Press{" "}
                  <kbd
                    className={`px-2 py-1 rounded ${
                      isDesktopMode
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-gray-200 text-black border border-gray-400"
                    }`}
                  >
                    Ctrl+Alt+D
                  </kbd>{" "}
                  to toggle desktop mode
                </p>
              </div>
              <Button
                onClick={() => setShowExtensionPopup(true)}
                className={`mt-4 ${
                  isDesktopMode
                    ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    : "bg-black hover:bg-gray-800 text-white"
                }`}
                variant={isDesktopMode ? "outline" : "default"}
              >
                Show Extension
              </Button>
            </div>
          </div>
        )}
      </div>

      <Toaster />

      {/* CSS for enhanced transparency effects */}
      <style jsx global>{`
        .desktop-extension-container {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        /* Enhanced backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .desktop-blur {
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
          }
        }

        /* Fallback for browsers without backdrop-filter */
        @supports not (backdrop-filter: blur(10px)) {
          .desktop-blur {
            background: rgba(0, 0, 0, 0.1);
          }
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .desktop-extension-container {
            background-size: 200% 200%;
          }
        }

        @media (max-width: 480px) {
          .desktop-extension-container {
            background-size: 300% 300%;
          }
        }

        /* High DPI display support */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .desktop-extension-container {
            background-attachment: scroll;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .desktop-extension-container {
            filter: brightness(0.9) contrast(1.1);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .desktop-extension-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Smooth animations */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease,
            transform 0.3s ease;
        }
      `}</style>
    </div>
  )
}
