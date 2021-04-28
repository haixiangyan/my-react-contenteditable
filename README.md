# 造一个 react-contenteditable 轮子

> 文章源码：https://github.com/Haixiang6123/my-react-contenteditable
>
> 预览链接：http://yanhaixiang.com/my-react-contenteditable/
>
> 参考轮子：https://www.npmjs.com/package/react-contenteditable


以前在知乎看到一篇关于《一行代理可以做什么？》的回答：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2042a68c44a4af6986858c442edd006~tplv-k3u1fbpfcp-zoom-1.image)

当时试了一下确实很好玩，于是每次都可以在妹子面前秀一波操作，在他们惊叹的目光中，我心里开心地笑了——嗯，又让一个不懂技术的人发现到了程序的美🐶，咳咳。

一直以来，我都觉得这个属性只是为了存在而存在的，然而在今天接到的需求之后，我发现这个感觉没什么用的属性竟然完美地解决了我的需求。

## 一个需求

需求很简单，在输入框里添加按钮就好了。这种功能一般用于邮件群发，这里的按钮“姓名”其实就是一个变量，后端应该要自动填充真实用户的姓名，然后再把邮件发给用户的。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21248d1ac3ff49e791ce9ab6b0e2445b~tplv-k3u1fbpfcp-zoom-1.image)

这个需求第一感觉像是 textarea 里加入一个 button，但是想想又不对：textarea 里加不了 button。那用 div 包裹呢？也不对：div 不能输入啊，唉，谁说不能输入的？`contentEditable` 属性就是可以让用户手动输入的。

下面就带大家手写一个 `react-contenteditable` 的轮子吧。

## 用例

参考 input 元素的受控组件写法，可以想到肯定得有 `value` 和 `onChange` 两个 props，使用方法大概像这样：

```ts
function App() {
  const [value, setValue] = useState('');

  const onChange = (e: ContentEditableEvent) => {
    console.log('change', e.target.value)
    setValue(e.target.value)
  }

  return (
    <div style={{ border: '1px solid black' }}>
      <ContentEditable style={{ height: 300 }} value={value} onChange={onChange} />
    </div>
  );
}
```

重新再认识一下 `contentEditable` 属性：一个枚举属性，表示元素是否可被用户编辑。浏览器会修改元素的部件以允许编辑。详情可看 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/contenteditable)。

为了可以插入 html，需要用到 `dangerouslySetInnerHTML` 这个属性来设置 `innerHTML`，并通过 `onInput` 来执行 `onChange` 回调。一个简单的实现如下：

```ts
// 修改后的 onChange 事件
export type ContentEditableEvent = SyntheticEvent<any, Event> & {
  target: { value: string }
};

interface Props {
  value?: string // 值
  onChange?: (e: ContentEditableEvent) => void // 值改动的回调
}

class ContentEditable extends Component<Props> {
  lastHtml = this.props.value // 记录上一次的值
  ref = createRef<HTMLDivElement>() // 当前容器

  emitEvent = (originalEvent: SyntheticEvent<any>) => {
    if (!this.ref.current) return

    const html = this.ref.current.innerHTML
    if (this.props.onChange && html !== this.lastHtml) { // 与上次的值不一样才回调
      const event = { // 合并事件，这里主要改变 target.value 的值
        ...originalEvent,
        target: {
          ...originalEvent.target,
          value: html || ''
        }
      }

      this.props.onChange(event) // 执行回调
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
```

但是很快你会发现一个问题：怎么打出来的字都是倒着输出的？比如打个 "hello"，会变成：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8060aca938244736861526b753ae85bd~tplv-k3u1fbpfcp-zoom-1.image)

## 解决倒序输出的问题

如果你把 `onChange` 里的 `setValue(e.target.value)` 去掉，会发现这个 bug 又没了，又可以正常输出了。

这是因为每次 `setValue` 的时候组件会重新渲染，每次渲染的时候光标会跑到最前面，所以当 `setValue` 的时候会出现倒序输出的问题。

解决方法是在 `componentDidUpdate` 里把光标重新放到最后就可以了，每次渲染后光标回到最后的位置。

```ts
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

    replaceCaret(this.ref.current) // 把光标放到最后
  }

  ...
}
```

这里要注意的是：对于 Range，可以是选区，也可以是光标。上面创建了一个 Range，`setCollapse(true)` 把 Range 设置为 [空选区](https://developer.mozilla.org/en-US/docs/Web/API/Range/collapse) 也就变成了光标的了。然后把 Range 放到创建的 Node 里，这个 Node 又放到容器最后。这就实现了 **“把光标放到最后”** 的效果了。

## checkUpdate

有人可能会有疑问：一般使用 `input` 之类输入组件的时候，如果没在 `onChange` 里 `setValue`，值都是不会改变的呀。上面提到不加 `setValue` 也可以再次输入，也就说我设置 `value` 就好了，不用手动再去更新 `value` 了，这里是不是可以做输入性能的优化呢？

答案是可以的，在 [react-contentedtiable 源码](https://github.com/lovasoa/react-contenteditable/blob/master/src/react-contenteditable.tsx#L58) 里就做了性能的优化。

```ts
  shouldComponentUpdate(nextProps: Props): boolean {
    const { props } = this;
    const el = this.getEl();

    // We need not rerender if the change of props simply reflects the user's edits.
    // Rerendering in this case would make the cursor/caret jump

    // Rerender if there is no element yet... (somehow?)
    if (!el) return true;

    // ...or if html really changed... (programmatically, not by user edit)
    if (
      normalizeHtml(nextProps.html) !== normalizeHtml(el.innerHTML)
    ) {
      return true;
    }

    // Handle additional properties
    return props.disabled !== nextProps.disabled ||
      props.tagName !== nextProps.tagName ||
      props.className !== nextProps.className ||
      props.innerRef !== nextProps.innerRef ||
      !deepEqual(props.style, nextProps.style);
  }
```

但是随之而来的是由于阻止更新而引发的 Bug：https://github.com/lovasoa/react-contenteditable/issues/161。

在这个 Issue 里说到因为没有对 `onBlur` 进行更新判断，因此，每次改变了值之后，再触发 blur 事件，值都不会改变。那加个 `onBlur` 的检查是否可行呢？如果要这么做，那别的 `onInput`，`onClick` 等回调也要加判断才可以，其实这么下来还不如在 `shouldComponentUpdate` 里 `return true` 就好了。完全起不到性能优化的作用。

一个比较折中的方案是添加一个 `checkUpdate` 的 props 给使用的人去做性能优化。源码是对每次的值以及一些 `props` 更新进行判定是否需要更新。

```ts
interface Props extends HTMLAttributes<HTMLElement> {
  value?: string
  onChange?: (e: ContentEditableEvent) => void
  checkUpdate?: (nextProps: Props, thisProps: Props) => boolean // 判断是否应该更新
}
```

在 `shouldComponentUpdate` 里返回这个函数的返回值即可：

```ts
class ContentEditable extends Component<Props> {
  ...

  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    if (this.props.checkUpdate) {
      return this.props.checkUpdate(nextProps, this.props)
    }
    return true
  }

  ...
}
```

## innerRef

上面通过 ref 获取容器元素的代码比较冗余，而且还没有向外暴露 ref。这一步优化获取容器元素代码，并向外暴露 ref 参数。

```ts
interface Props extends HTMLAttributes<HTMLElement> {
  disabled?: boolean
  value?: string
  onChange?: (e: ContentEditableEvent) => void
  innerRef?: React.RefObject<HTMLDivElement> | Function // 向外暴露的 ref
  checkUpdate?: (nextProps: Props, thisProps: Props) => boolean
}
```

需要注意的是，ref 可能为 Ref 对象，也可能为一个函数，要兼容这两种情况。

```ts
class ContentEditable extends Component<Props> {
  private lastHtml: string = this.props.value || ''
  private el: HTMLElement | null = null

  componentDidUpdate() {
    const el = this.getEl()

    if (!el) return

    this.lastHtml = this.props.value || ''

    replaceCaret(el)
  }

  getEl = (): HTMLElement | null => { // 获取容器的方法
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
          value: html || ''
        }
      }
      // @ts-ignore
      this.props.onChange(event)
    }

    this.lastHtml = html
  }

  render() {
    const { disabled, value, innerRef, ...passProps } = this.props

    return (
      <div
        {...passProps}
        ref={typeof innerRef === 'function' ? (node: HTMLDivElement) => {
          innerRef(node)
          this.el = node
        }: innerRef || null}
        contentEditable
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
```

上面添加了 `getEl` 函数，用于获取当前容器。

## 补充 props

除了上面一些比较重要的 props，还有一些增强扩展性的 props，如 `disabled`, `tagName`。

```ts
class ContentEditable extends Component<Props> {
  ...

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
        contentEditable: !this.props.disabled,
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
```

## 总结

至此，一个 react-contenteditable 的组件就完成了，主要实现了：

* value 和 onChange 的数据流
* 在 `componentDidUpdate` 里处理光标总是被放在最前面的问题
* 在 `shouldComponentUpdate` 里添加 `checkUpdate`，开发者用于优化渲染性能
* 向外暴露  ref，disabled，tagName 的 props

虽然这个 react-contenteditable 看起来还不错，但是看了源码之后发现这个库的很多兼容性的问题都没有考虑到，比如 [这篇 Stackoverflow 上的讨论](https://stackoverflow.com/questions/17890568/contenteditable-div-backspace-and-deleting-text-node-problems)，再加上上面提到的蛋疼 Issue，如果真要在生产环境实现富文本最好不要用这个库，推荐使用 [draft.js](https://draftjs.org/)。当然简单的功能用这个库实现还是比较轻量的。
