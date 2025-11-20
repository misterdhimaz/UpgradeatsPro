/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        upgrade: {
          dark: '#2e4835',   // Hijau tua
          leaf: '#4a7c59',   // Hijau daun medium
          light: '#f1faee',  // Putih kehijauan
          cream: '#faf3e0',  // Cream background poster
          accent: '#f4d35e', // Kuning aksen
          text: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'], // Pastikan font ini terinstall/diimport
      }
    },
  },
  plugins: [],
}