import type { Config } from 'tailwindcss'
import {
  borderRadius,
  boxShadow,
  colors,
  fontFamily,
  fontSize,
  maxWidth,
  touchTarget,
} from './src/styles/tokens.ts'

// Tokens live in src/styles/tokens.ts so tests can read them too.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      ...colors,
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily,
    fontSize,
    borderRadius,
    boxShadow,
    extend: {
      maxWidth,
      minHeight: { touch: touchTarget },
      minWidth: { touch: touchTarget },
      spacing: { touch: touchTarget },
    },
  },
  plugins: [],
}

export default config
