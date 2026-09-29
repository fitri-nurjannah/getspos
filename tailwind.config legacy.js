/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        slidedown: {
          "0%": { top: "-9rem", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { top: "0" },
        },
        slidedownclose: {
          "0%": { top: "0", opacity: "1" },
          "50%": { opacity: "0" },
          "100%": { top: "-12rem", opacity: "0" },
        },
      },
      animation: {
        slidedown: "slidedown 400ms ease-in-out",
        slidedownclose: "slidedownclose 300ms ease-in-out",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        offblack: '#141516',
        primary: '#b164ff',
        secondary: '#FF652F',
        positive: '#38DA95',
        notice: '#FFDE48',
        informative: '#8BF3F5',
        negative: '#FF3131'
      },
      fontFamily: {
        poppins: ['poppins', 'Helvetica', 'sans-serif'],
      },
      aspectRatio: {
        '3/2': '3 / 2',
      },
    },
  },
  plugins: [],
}

