/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: {
          DEFAULT: '#f7931a',
          dark: '#d87915',
          light: '#f9a54a',
        },
        background: 'hsl(0 0% 4%)',
        foreground: 'hsl(0 0% 98%)',
        card: 'hsl(0 0% 10%)',
        'card-foreground': 'hsl(0 0% 98%)',
        primary: 'hsl(28 93% 53%)',
        'primary-foreground': 'hsl(0 0% 98%)',
        secondary: 'hsl(0 0% 15%)',
        'secondary-foreground': 'hsl(0 0% 98%)',
        muted: 'hsl(0 0% 15%)',
        'muted-foreground': 'hsl(0 0% 63%)',
        accent: 'hsl(0 0% 15%)',
        'accent-foreground': 'hsl(0 0% 98%)',
        destructive: 'hsl(0 84% 60%)',
        'destructive-foreground': 'hsl(0 0% 98%)',
        border: 'hsl(0 0% 20%)',
        input: 'hsl(0 0% 20%)',
        ring: 'hsl(28 93% 53%)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
}
