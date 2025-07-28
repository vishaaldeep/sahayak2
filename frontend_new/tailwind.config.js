module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue
        accent: '#a7f3d0', // light green
        background: '#f9fafb', // lightest
        card: '#fff',
      },
    },
  },
  plugins: [],
}; 