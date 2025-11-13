/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Esta é a linha importante
  ],
  theme: {
    extend: {
      // Aqui podemos adicionar as nossas cores "cósmicas" no futuro
    },
  },
  plugins: [],
}