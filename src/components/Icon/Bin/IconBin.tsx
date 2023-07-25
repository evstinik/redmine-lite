import * as React from 'react'

export interface IconBinProps extends React.SVGProps<SVGSVGElement> {
  color?: string
}

export function IconBin(props: IconBinProps) {
  const { color = 'var(--action-fg-color)', ...rest } = props
  return (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      data-name='trash bin'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      <path data-name='Rectangle 4' fill='none' d='M0 0h24v24H0z' />
      <path
        d='M5 8h14l-1 13H6z'
        fill='none'
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        data-name='Rectangle 3'
        d='M7 5h10a3 3 0 013 3h0H4h0a3 3 0 013-3z'
        fill='none'
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d='M14 4.5a2 2 0 00-2-2 2 2 0 00-2 2'
        fill='none'
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d='M10 12v5'
        fill='none'
        stroke={color}
        strokeLinecap='square'
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        data-name='Line'
        d='M14 12v5'
        fill='none'
        stroke={color}
        strokeLinecap='square'
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  )
}
