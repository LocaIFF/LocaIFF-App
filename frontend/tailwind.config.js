/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.12)",
        glow: "0 0 40px rgba(52, 211, 153, 0.35)",
        "glow-lg": "0 0 60px rgba(52, 211, 153, 0.5)"
      },
      animation: {
        "glass-shimmer": "glass-shimmer 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out both",
        "fade-out": "fade-out 0.4s ease-in both",
        "slide-up": "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down": "slide-down 0.4s ease-in both",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "slide-out-right": "slide-out-right 0.4s ease-in both",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite",
        "route-dash": "route-dash 1.5s linear infinite",
        "hotspot-float": "hotspot-float 3s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out"
      },
      keyframes: {
        "glass-shimmer": {
          "0%, 100%": { backgroundPosition: "200% 50%" },
          "50%": { backgroundPosition: "0% 50%" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-down": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(24px)" }
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(48px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(48px)" }
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" }
        },
        "route-dash": {
          "0%": { strokeDashoffset: "20" },
          "100%": { strokeDashoffset: "0" }
        },
        "hotspot-float": {
          "0%, 100%": { transform: "translate(-50%, -50%) translateY(0)" },
          "50%": { transform: "translate(-50%, -50%) translateY(-4px)" }
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" }
        }
      },
      backdropBlur: {
        "3xl": "64px"
      }
    }
  },
  plugins: []
};
