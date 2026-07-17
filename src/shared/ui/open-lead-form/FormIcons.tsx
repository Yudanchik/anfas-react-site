import type { SVGProps } from 'react'

export type FormIconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number | string
}

const getCommonProps = ({ size = 24, ...props }: FormIconProps): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
})

export function ConsultationIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <path d="M7.4 18.2 3.5 20l1.15-4.05A8.15 8.15 0 0 1 3 11c0-4.42 4.03-8 9-8s9 3.58 9 8-4.03 8-9 8a10.2 10.2 0 0 1-4.6-.8Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  )
}

export function HomeIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5.5 8.5V21h13V8.5" />
      <path d="M9.5 21v-7h5v7" />
    </svg>
  )
}

export function PackageIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.25" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.25" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.25" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.25" />
    </svg>
  )
}

export function UserIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21v-1.5A6.5 6.5 0 0 1 11 13h2a6.5 6.5 0 0 1 6.5 6.5V21" />
    </svg>
  )
}

export function PhoneIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <path d="M8.1 3.5 5.55 4.7a2 2 0 0 0-1.08 2.2c1.2 6.35 6.28 11.43 12.63 12.63a2 2 0 0 0 2.2-1.08l1.2-2.55a1.5 1.5 0 0 0-.5-1.85l-3.05-2.18a1.5 1.5 0 0 0-1.92.15l-1.57 1.57a13.1 13.1 0 0 1-3.05-3.05l1.57-1.57a1.5 1.5 0 0 0 .15-1.92L9.95 4a1.5 1.5 0 0 0-1.85-.5Z" />
    </svg>
  )
}

export function ArrowRightIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  )
}

export function ShieldCheckIcon(props: FormIconProps) {
  return (
    <svg {...getCommonProps(props)}>
      <path d="M12 3 5 6v5.2c0 4.45 2.85 8.25 7 9.8 4.15-1.55 7-5.35 7-9.8V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function InteriorSketchIcon(
  props: Omit<FormIconProps, 'size'> & {
    width?: number | string
    height?: number | string
  },
) {
  const { width = 520, height = 300, ...svgProps } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 520 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...svgProps}
    >
      <path d="M41 245V33h438v212" />
      <path d="M83 245V62h67v183" />
      <path d="M169 245V62h67v183" />
      <path d="M255 245V62h67v183" />
      <path d="M341 245V62h96v183" />
      <path d="M41 33h438" />
      <rect x="382" y="80" width="67" height="92" rx="2" />
      <path d="M393 153c9-23 18-37 27-44M416 153c-2-24 3-42 15-56" />
      <path d="M402 126c-7-5-10-11-9-18M420 117c8-4 12-10 13-17" />
      <path d="M135 198v-35c0-12 9-21 21-21h205c12 0 21 9 21 21v35" />
      <path d="M120 186c0-9 7-16 16-16h5v52h-21v-36Z" />
      <path d="M377 170h5c9 0 16 7 16 16v36h-21v-52Z" />
      <path d="M141 206h236" />
      <path d="M153 206v28M365 206v28" />
      <path d="M163 151c12-6 25-7 38-2l5 36c-15 5-29 4-41-3l-2-31Z" />
      <path d="M207 148c13-4 27-3 39 3l-4 34c-14 4-27 2-39-4l4-33Z" />
      <path d="M310 151c12-6 25-7 38-2l-2 33c-12 7-26 8-41 3l5-34Z" />
      <ellipse cx="260" cy="229" rx="75" ry="24" />
      <path d="M185 229v26c0 13 34 24 75 24s75-11 75-24v-26" />
      <path d="M185 255c0 13 34 24 75 24s75-11 75-24" />
      <path d="M248 225c2-10 3-19 2-28h20c-1 9 0 18 2 28" />
      <path d="M250 197c5 3 15 3 20 0" />
      <path d="M260 197c-2-21 0-37 7-51" />
      <path d="M260 183c-8-9-13-19-15-30" />
      <path d="M263 174c9-9 15-19 17-30" />
      <path d="M247 158c-7 0-12-3-16-9" />
      <path d="M274 153c7-1 12-5 15-11" />
      <path d="M266 162c-7-3-11-8-13-14" />
      <path d="M94 239h27M399 239h37" />
      <path d="M107 222v17M420 222v17" />
    </svg>
  )
}
