import React from 'react'
import { IconStarFilled } from './IconStarFilled'
import { IconStarOutlined } from './IconStarOutlined'

export interface IconStarProps extends React.SVGProps<SVGSVGElement> {
  filled: boolean
}

export function IconStar(props: IconStarProps) {
  const { filled, ...rest } = props

  const style = React.useMemo(() => {
    return {
      ...rest.style,
      transform: 'scale(0.9)'
    }
  }, [rest.style])

  return filled ? <IconStarFilled {...rest} style={style} /> : <IconStarOutlined {...rest} style={style} />
}