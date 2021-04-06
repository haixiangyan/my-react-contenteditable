import React, {createRef, SyntheticEvent} from 'react'
import {Component} from "react"

export type ContentEditableEvent = SyntheticEvent<any, Event> & {
  target: { value: string }
};

interface Props {
  value?: string
  onChange?: (e: ContentEditableEvent) => void
}

class ContentEditable extends Component<Props> {
  lastHtml = this.props.value
  ref = createRef<HTMLDivElement>()

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
