import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue':  '#1A73C1',
        'brand-teal':  '#00897B',
        'brand-light': '#E8F0FB',
        'field-bg':    '#F2F2F2',
        'risk-red':    '#D32F2F',
        // alias used in some Part 05 pages
        'brand-primary': '#1A73C1',
      },
      borderRadius: {
        'card':  '12px',
        'btn':   '8px',
        'chip':  '16px',
        'badge': '4px',
        'box':   '8px',
      },
      fontSize: {
        'label':      ['11px', { lineHeight: '16px' }],
        'label-sm':   ['12px', { lineHeight: '18px' }],
        'body':       ['13px', { lineHeight: '20px' }],
        'item':       ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'field-label':['13px', { lineHeight: '18px' }],
        'field-val':  ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'heading-sm': ['17px', { lineHeight: '26px', fontWeight: '500' }],
        'heading':    ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'metric':     ['18px', { lineHeight: '26px', fontWeight: '700' }],
        'metric-lg':  ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'queue-no':   ['28px', { lineHeight: '36px', fontWeight: '700' }],
      },
      height: {
        'header': '48px',
        'btn-lg': '52px',
        'textarea-sm': '80px',
      },
    },
  },
  plugins: [],
}
export default config
