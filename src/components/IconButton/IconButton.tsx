import React from 'react'
import classNames from 'classnames'

export interface IconButtonProps {
  className?: string
  icon: React.ReactNode
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function IconButton(props: IconButtonProps) {
  const { className, icon, ...rest } = props

  return (
    <button
      className={classNames(
        'icon-plain',
        {
          'icon-plain--disabled': props.disabled
        },
        className
      )}
      {...rest}
    >
      {icon}
    </button>
  )
}

// classNames('icon-plain', className)
// <IconButton />
// classNames('icon-plain', className) => 'icon-plain container__btn'

// `icon-plain ${className}` => 'icon-plain undefined'
