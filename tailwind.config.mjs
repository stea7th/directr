/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          600: "#4f46e5",
          700: "#4338ca",
        }
      }
    },
  },
  plugins: [],
};
