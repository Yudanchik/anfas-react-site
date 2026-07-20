import type { SVGProps } from 'react'

type ReviewIconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

type QuoteIconProps = ReviewIconProps & {
  direction: 'open' | 'close'
}

export function QuoteIcon({ direction, ...props }: QuoteIconProps) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g transform={direction === 'close' ? 'rotate(180 24 18)' : undefined}>
        <path
          fill="currentColor"
          d="M19.1 3.5C10.6 6.2 5.4 12.1 5.4 21c0 7.2 4.1 11.5 9.5 11.5 5.1 0 8.7-3.6 8.7-8.5 0-4.7-3.2-7.9-7.6-7.9-1.2 0-2.3.2-3.2.7 1-4.1 4.2-7.6 8.7-9.4l-2.4-3.9Zm21.2 0C31.8 6.2 26.6 12.1 26.6 21c0 7.2 4.1 11.5 9.5 11.5 5.1 0 8.7-3.6 8.7-8.5 0-4.7-3.2-7.9-7.6-7.9-1.2 0-2.3.2-3.2.7 1-4.1 4.2-7.6 8.7-9.4l-2.4-3.9Z"
        />
      </g>
    </svg>
  )
}

export function UsersIcon(props: ReviewIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="10" r="4" />
      <path d="M4.5 24.5v-2.1c0-3.8 3.1-6.9 6.9-6.9h1.2c3.8 0 6.9 3.1 6.9 6.9v2.1h-15Z" />
      <path d="M20.4 15.8h.8c3.5 0 6.3 2.8 6.3 6.3v2.4h-4.2" />
      <path d="M19.8 6.2a4 4 0 1 1 0 7.6" />
    </svg>
  )
}

export function HomeIcon(props: ReviewIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5.5 9v11h13V9" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  )
}

export function StarIcon(props: ReviewIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m12 2.4 2.86 5.8 6.4.93-4.63 4.51 1.09 6.37L12 17l-5.72 3.01 1.09-6.37-4.63-4.51 6.4-.93L12 2.4Z" />
    </svg>
  )
}
