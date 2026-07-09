'use client'

import { useEffect } from 'react'

const PROTECTED_SELECTOR = '.copy-protected, .article-content'
const ALLOWED_SELECTOR = [
  'input',
  'textarea',
  'select',
  'option',
  'button',
  'a',
  'pre',
  'code',
  'kbd',
  'samp',
  'iframe',
  'audio',
  'video',
  '[contenteditable="true"]',
  '[data-copy-allow]',
  '.copy-allow',
].join(', ')

function getElement(target: EventTarget | null) {
  if (!target) return null
  if (target instanceof Element) return target
  if (target instanceof Node) return target.parentElement
  return null
}

function isAllowedElement(element: Element | null) {
  return Boolean(element?.closest(ALLOWED_SELECTOR))
}

function isProtectedElement(element: Element | null) {
  return Boolean(element?.closest(PROTECTED_SELECTOR))
}

function selectionTouchesProtectedContent() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false

  const protectedElements = Array.from(document.querySelectorAll(PROTECTED_SELECTOR))
  for (let index = 0; index < selection.rangeCount; index++) {
    const range = selection.getRangeAt(index)
    if (protectedElements.some((element) => range.intersectsNode(element))) return true
  }

  return false
}

function selectionStartsInAllowedContent() {
  const selection = window.getSelection()
  const anchorNode = selection?.anchorNode
  const anchorElement = getElement(anchorNode || null)
  return isAllowedElement(anchorElement)
}

export default function ContentProtection() {
  useEffect(() => {
    const shouldBlockByTarget = (event: Event) => {
      const element = getElement(event.target)
      return isProtectedElement(element) && !isAllowedElement(element)
    }

    const shouldBlockCopy = (event: Event) => {
      if (shouldBlockByTarget(event)) return true
      return selectionTouchesProtectedContent() && !selectionStartsInAllowedContent()
    }

    const blockEvent = (event: Event) => {
      if (!shouldBlockByTarget(event)) return
      event.preventDefault()
    }

    const blockCopyEvent = (event: Event) => {
      if (!shouldBlockCopy(event)) return
      event.preventDefault()
    }

    const blockKeyboardCopy = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const isCopyShortcut = (event.metaKey || event.ctrlKey) && ['a', 'c', 'x'].includes(key)
      if (!isCopyShortcut) return
      if (!shouldBlockCopy(event)) return
      event.preventDefault()
    }

    document.addEventListener('copy', blockCopyEvent, true)
    document.addEventListener('cut', blockCopyEvent, true)
    document.addEventListener('contextmenu', blockEvent, true)
    document.addEventListener('dragstart', blockEvent, true)
    document.addEventListener('selectstart', blockEvent, true)
    document.addEventListener('keydown', blockKeyboardCopy, true)

    return () => {
      document.removeEventListener('copy', blockCopyEvent, true)
      document.removeEventListener('cut', blockCopyEvent, true)
      document.removeEventListener('contextmenu', blockEvent, true)
      document.removeEventListener('dragstart', blockEvent, true)
      document.removeEventListener('selectstart', blockEvent, true)
      document.removeEventListener('keydown', blockKeyboardCopy, true)
    }
  }, [])

  return null
}
