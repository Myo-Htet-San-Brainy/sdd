// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Make sure your component paths are included here
  ],
  theme: {
    extend: {
      animation: {
        "highlight-pulse": "highlight-pulse 2.5s ease-in-out forwards", // Animation duration and easing
      },
      keyframes: {
        "highlight-pulse": {
          "0%, 100%": {
            "border-color": "theme(colors.zinc.200)", // Original border color
            "box-shadow": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // Original shadow
            transform: "scale(1)",
          },
          "25%": {
            // Start subtle pulse
            "border-color": "theme(colors.red.400)",
            "box-shadow": "0 0 0 4px theme(colors.red.200)",
            transform: "scale(1.01)",
          },
          "50%": {
            // Peak highlight
            "border-color": "theme(colors.red.600)",
            "box-shadow": "0 0 0 8px theme(colors.red.300)",
            transform: "scale(1.02)",
          },
          "75%": {
            // Fade out pulse
            "border-color": "theme(colors.red.400)",
            "box-shadow": "0 0 0 4px theme(colors.red.200)",
            transform: "scale(1.01)",
          },
        },
      },
    },
  },
  plugins: [],
};
