/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory:   "#faf6ef",
        parchment: "#f2ebe0",
        maroon:  "#6b1a2a",
        maroonlight: "#8c2238",
        ink:     "#1e1e1e",
        inksoft: "#3d3530",
        gold:    "#b08d57",
        goldlight: "#d4aa72",
        sage:    "#d6ddd0",
        mist:    "#e8e2d8",
        clay:    "#c47a5a",
        river:   "#3d6f7d"
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans:  ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '600' }],
        heading: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.005em', fontWeight: '600' }]
      },
      boxShadow: {
        card:  "0 4px 24px rgba(30,20,15,0.07), 0 1px 4px rgba(30,20,15,0.05)",
        lift:  "0 8px 40px rgba(30,20,15,0.10), 0 2px 8px rgba(30,20,15,0.06)",
        inner: "inset 0 1px 3px rgba(30,20,15,0.06)"
      },
      borderRadius: {
        card: '1rem',
        pill: '999px'
      },
      spacing: {
        section: '5rem',
        prose:   '72ch'
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease both'
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
