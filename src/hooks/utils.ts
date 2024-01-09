import { useCallback } from 'react'

export function useOnChange(setter: (value: any) => void, preventDefault: boolean = true) {
  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (preventDefault) {
        event.preventDefault()
      }
      setter(event.target.value)
    },
    [setter, preventDefault]
  )
}
