/** @type {import('tailwindcss').Config} */
module.exports = {
  // Crucial for the Theme Switcher to work manually
  darkMode: 'class', 
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Custom ALU colors extended here if needed for utility classes
        alu: {
          navy: '#162A43',
          gold: '#BFA15F',
          red: '#DB2B39',
        }
      }
    },
  },
  plugins: [],
}
