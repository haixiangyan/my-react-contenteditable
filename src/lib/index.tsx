import React, {createRef, SyntheticEvent} from 'react'
import {Component} from "react"

export type ContentEditableEvent = SyntheticEvent<any, Event> & {
  target: { value: string }
};

interface Props {
  value?: string
  onChange?: (e: ContentEditableEvent) => void
}

const replaceCaret = (el: HTMLElement) => {
  // 创建光标
  const cursor = document.createTextNode('')
  el.appendChild(cursor)

  // 判断是否选中
  const isFocused = document.activeElement === el
  if (!cursor || !cursor.nodeValue || !isFocused) return

  // 将光标放到最后
  const selection = window.getSelection()
  if (selection !== null) {
    const range = document.createRange()
    range.setStart(cursor, cursor.nodeValue.length)
    range.collapse()

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
  }

  render() {
    const { value } = this.props

    return (
      <div
        ref={this.ref}
        contentEditable
        onInput={this.emitEvent}
        dangerouslySetInnerHTML={{__html: value || ''}}
      />
    )
  }
}

export default ContentEditable
