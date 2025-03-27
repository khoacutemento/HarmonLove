/** @type {import('tailwindcss').Config} */
import scrollbarHide from "tailwind-scrollbar-hide";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: "#FBF4FF",
        heading: "#8327DE",
        text: "#9854DB",
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(180deg, #C6ACFF 0%, #D19FFF 50%, #E4B1F0 100%)",
      },
    },
  },
  plugins: [scrollbarHide],
};
