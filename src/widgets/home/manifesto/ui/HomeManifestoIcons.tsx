import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number
}

function getIconProps({ size = 34, ...props }: IconProps): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 34 34',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: 1.55,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    focusable: false,
    'aria-hidden': true,
    ...props,
  }
}

export function ColumnIcon(props: IconProps) {
  return (
    <svg {...getIconProps(props)}>
      <path d="M7.5 28.5h19" />
      <path d="M9 12.5h16" />
      <path d="M11 12.5v16" />
      <path d="M16 12.5v16" />
      <path d="M21 12.5v16" />
      <path d="M7.5 9.5c2.3 0 2.3-3 4.6-3s2.3 3 4.6 3 2.3-3 4.6-3 2.3 3 4.7 3" />
      <path d="M8.5 9.5h17" />
    </svg>
  )
}

export function BuildingIcon(props: IconProps) {
  return (
    <svg {...getIconProps(props)}>
      <path d="M8.5 28.5V11.2l10-4.4v21.7" />
      <path d="M18.5 14.5h7v14" />
      <path d="M12 14h2" />
      <path d="M12 18.5h2" />
      <path d="M12 23h2" />
      <path d="M21.5 18.5h1.5" />
      <path d="M21.5 23h1.5" />
      <path d="M6.5 28.5h21" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...getIconProps(props)}>
      <path d="M17 5.5 8.5 9v7.2c0 5.5 3.4 10 8.5 12.3 5.1-2.3 8.5-6.8 8.5-12.3V9L17 5.5Z" />
      <path d="m13.2 17.2 2.5 2.5 5.2-5.5" />
    </svg>
  )
}

export function RubleIcon(props: IconProps) {
  return (
    <svg {...getIconProps(props)}>
      <path d="M12 6.5h8.2a5.3 5.3 0 0 1 0 10.6H12" />
      <path d="M12 6.5v22" />
      <path d="M9 17.1h11.3" />
      <path d="M9 21.4h13" />
    </svg>
  )
}
