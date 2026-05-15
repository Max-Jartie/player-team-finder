/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // Здесь можно будет настроить общую цветовую гамму сайта (например, под цвета CS2)
        colors: {
          csdark: "#1b2228",
          csorange: "#de9b35",
        }
      },
    },
    plugins: [],
  }
  