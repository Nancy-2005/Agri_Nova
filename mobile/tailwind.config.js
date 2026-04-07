/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                'farm-green': {
                    600: '#16a34a',
                    700: '#15803d',
                },
                'farm-brown': {
                    600: '#a18072',
                },
                'farm-sky': {
                    600: '#0284c7',
                }
            }
        },
    },
    plugins: [],
}
