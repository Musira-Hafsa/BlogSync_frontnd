/** @type {import('tailwindcss').Config} */
export default {
  // 🌟 IMPORTANT: This tells Tailwind to look at the HTML tag data-theme attribute
  darkMode: ['selector', '[data-theme="dark"]'],
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tracks all your pages like Home.jsx, AuthPages.jsx, etc.
  ],
  theme: {
    extend: {
      colors: {
        // This links your CSS variables seamlessly into Tailwind utility classes!
        ink: 'var(--ink)',
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        white: 'var(--white)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        prose: ['var(--font-prose)'],
      }
    },
  },
  plugins: [],
}