/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend_src/*.{js,ts,jsx,tsx}", 
			"./frontend_src/common_components/*.{js,ts,jsx,tsx}",
			"./frontend_src/pages/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  
  darkMode: 'class',
}

