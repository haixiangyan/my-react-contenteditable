import React, {createElement, HTMLAttributes, SyntheticEvent} from 'react'
import {Component} from "react"

export type ContentEditableEvent = SyntheticEvent<any, Event> & {
  target: { value: string }
};

interface Props extends HTMLAttributes<HTMLElement> {
  tagName?: string
  disabled?: boolean
  value?: string
  onChange?: (e: ContentEditableEvent) => void
  innerRef?: React.RefObject<HTMLDivElement> | Function
  checkUpdate?: (nextProps: Props, thisProps: Props) => boolean
}

const replaceCaret = (el: HTMLElement) => {
  // 创建光标
  const cursor = document.createTextNode('')
  el.appendChild(cursor)

  // 判断是否选中
  const isFocused = document.activeElement === el
  if (cursor === null || cursor.nodeValue === null || !isFocused) return

  // 将光标放到最后
  const selection = window.getSelection()
  if (selection !== null) {
    const range = document.createRange()
    range.setStart(cursor, cursor.nodeValue.length)
    range.collapse(true)

    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 重新 focus
  if (el instanceof HTMLElement) el.focus()
}

class ContentEditable extends Component<Props> {
  private lastHtml: string = this.props.value || ''
  private el: HTMLElement | null = null

  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    if (this.props.checkUpdate) {
      return this.props.checkUpdate(nextProps, this.props)
    }
    return true
  }

  componentDidUpdate() {
    const el = this.getEl()

    if (!el) return

    this.lastHtml = this.props.value || ''

    replaceCaret(el)
  }

  getEl = (): HTMLElement | null => {
    const {innerRef} = this.props

    if (!!innerRef && typeof innerRef !== 'function') {
      return innerRef.current
    }

    return this.el
  }

  emitEvent = (originalEvent: SyntheticEvent<any>) => {
    const el = this.getEl()

    if (!el) return

    const html = el.innerHTML
    if (this.props.onChange && html !== this.lastHtml) {
      const event = {
        ...originalEvent,
        target: {
          ...originalEvent.target,
            value: html || ''
        }
      }
      this.props.onChange(event)
    }

    this.lastHtml = html
  }

  render() {
    const {tagName, value, innerRef, ...passProps} = this.props

    return createElement(
      tagName || 'div',
      {
        ...passProps,
        ref: typeof innerRef === 'function' ? (node: HTMLDivElement) => {
          innerRef(node)
          this.el = node
        } : innerRef || null,
        contentEditable: this.props.disabled,
        onInput: this.emitEvent,
        onBlur: this.props.onBlur || this.emitEvent,
        onKeyUp: this.props.onKeyUp || this.emitEvent,
        onKeyDown: this.props.onKeyDown || this.emitEvent,
        dangerouslySetInnerHTML: {__html: value || ''}
      },
      this.props.children
    )
  }
}

export default ContentEditable
