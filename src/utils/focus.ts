const FOCUSABLE_SELECTORS =
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  )
}

export function focusFirstFocusable(container: HTMLElement): void {
  const elements = getFocusableElements(container)
  if (elements.length > 0) {
    elements[0].focus()
  } else {
    container.focus()
  }
}

interface TrapFocusEvent {
  shiftKey: boolean
  preventDefault: () => void
}

export function trapFocus(container: HTMLElement, event: TrapFocusEvent): void {
  const elements = getFocusableElements(container)
  if (elements.length === 0) return

  const firstElement = elements[0]
  const lastElement = elements[elements.length - 1]
  const currentElement = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (currentElement === firstElement || !container.contains(currentElement)) {
      event.preventDefault()
      lastElement.focus()
    }
  } else {
    if (currentElement === lastElement || !container.contains(currentElement)) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}
