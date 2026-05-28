/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f8f2e9",
        ink: "#24302f",
        sage: "#d8e0d2",
        clay: "#c98162",
        river: "#3d6f7d",
        wheat: "#f0d89c"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(36, 48, 47, 0.10)"
      }
    }
  },
  plugins: []
};
