(this["webpackJsonpmy-react-contenteditable"]=this["webpackJsonpmy-react-contenteditable"]||[]).push([[0],{16:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n(4),o=n.n(r),l=n(7),i=n(9),c=n(1),s=n(5),u=n(6),p=n(10),h=n(8),v=function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(){var e;Object(s.a)(this,n);for(var a=arguments.length,r=new Array(a),o=0;o<a;o++)r[o]=arguments[o];return(e=t.call.apply(t,[this].concat(r))).lastHtml=e.props.value||"",e.el=null,e.getEl=function(){var t=e.props.innerRef;return t&&"function"!==typeof t?t.current:e.el},e.emitEvent=function(t){var n=e.getEl();if(n){var a=n.innerHTML;if(e.props.onChange&&a!==e.lastHtml){var r=Object(c.a)(Object(c.a)({},t),{},{target:Object(c.a)(Object(c.a)({},t.target),{},{value:a||""})});e.props.onChange(r)}e.lastHtml=a}},e}return Object(u.a)(n,[{key:"shouldComponentUpdate",value:function(e){return!this.props.checkUpdate||this.props.checkUpdate(e,this.props)}},{key:"componentDidUpdate",value:function(){var e=this.getEl();e&&(this.lastHtml=this.props.value||"",function(e){var t=document.createTextNode("");e.appendChild(t);var n=document.activeElement===e;if(null!==t&&null!==t.nodeValue&&n){var a=window.getSelection();if(null!==a){var r=document.createRange();r.setStart(t,t.nodeValue.length),r.collapse(!0),a.removeAllRanges(),a.addRange(r)}e instanceof HTMLElement&&e.focus()}}(e))}},{key:"render",value:function(){var e=this,t=this.props,n=t.tagName,r=t.value,o=t.innerRef,l=Object(i.a)(t,["tagName","value","innerRef"]);return Object(a.createElement)(n||"div",Object(c.a)(Object(c.a)({},l),{},{ref:"function"===typeof o?function(t){o(t),e.el=t}:o||null,contentEditable:!this.props.disabled,onInput:this.emitEvent,onBlur:this.props.onBlur||this.emitEvent,onKeyUp:this.props.onKeyUp||this.emitEvent,onKeyDown:this.props.onKeyDown||this.emitEvent,dangerouslySetInnerHTML:{__html:r||""}}),this.props.children)}}]),n}(a.Component),d=n(2);var f=function(){var e=Object(a.useState)(""),t=Object(l.a)(e,2),n=t[0],r=t[1];return Object(d.jsx)("div",{style:{border:"1px solid black"},children:Object(d.jsx)(v,{disabled:!1,style:{height:300},value:n,onChange:function(e){console.log("change",e.target.value),r(e.target.value)}})})};o.a.render(Object(d.jsx)(f,{}),document.getElementById("root"))}},[[16,1,2]]]);
//# sourceMappingURL=main.b5044840.chunk.js.map