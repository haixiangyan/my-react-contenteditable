import React, {createRef, HTMLAttributes, SyntheticEvent} from 'react'
import {Component} from "react"

export type ContentEditableEvent = SyntheticEvent<any, Event> & {
  target: { value: string }
};

interface Props extends HTMLAttributes<HTMLElement> {
  disabled?: boolean
  value?: string
  onChange?: (e: ContentEditableEvent) => void
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
  lastHtml = this.props.value
  ref = createRef<HTMLDivElement>()

  componentDidUpdate() {
    if (!this.ref.current) return

    this.lastHtml = this.props.value

    replaceCaret(this.ref.current)
  }

  emitEvent = (originalEvent: SyntheticEvent<any>) => {
    if (!this.ref.current) return

    const html = this.ref.current.innerHTML
    if (this.props.onChange && html !== this.lastHtml) {
      const event = {
        ...originalEvent,
        target: {
          value: html || ''
        }
      }
      // @ts-ignore
      this.props.onChange(event)
    }

    this.lastHtml = html
  }

  render() {
    const { disabled, value, ...passProps } = this.props

    return (
      <div
        {...passProps}
        ref={this.ref}
        contentEditable={disabled === undefined}
        onInput={this.emitEvent}
        onBlur={this.props.onBlur || this.emitEvent}
        onKeyUp={this.props.onKeyUp || this.emitEvent}
        onKeyDown={this.props.onKeyDown || this.emitEvent}
        dangerouslySetInnerHTML={{__html: value || ''}}
      >
        {this.props.children}
      </div>
    )
  }
}

export default ContentEditable
