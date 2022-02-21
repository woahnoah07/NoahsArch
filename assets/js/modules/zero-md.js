class t extends HTMLElement {get src() { return this.getAttribute("src") }
    set src(t) { this.reflect("src", t) }get manualRender() { return this.hasAttribute("manual-render") }
    set manualRender(t) { this.reflect("manual-render", t) }
    reflect(t, e) {!1 === e ? this.removeAttribute(t) : this.setAttribute(t, !0 === e ? "" : e) }
    static
    get observedAttributes() { return ["src"] }
    attributeChangedCallback(t, e, s) { "src" === t && this.connected && !this.manualRender && s !== e && this.render() }
    constructor(t) {
        super(), this.version = "2.3.3", this.config = {
            markedUrl: "https://cdn.jsdelivr.net/gh/markedjs/marked@2/marked.min.js",
            prismUrl: [
                ["https://cdn.jsdelivr.net/gh/PrismJS/prism@1/prism.min.js", "data-manual"], "https://cdn.jsdelivr.net/gh/PrismJS/prism@1/plugins/autoloader/prism-autoloader.min.js"
            ],
            cssUrls: ["https://cdn.jsdelivr.net/gh/sindresorhus/github-markdown-css@4/github-markdown.min.css", "https://cdn.jsdelivr.net/gh/PrismJS/prism@1/themes/prism.min.css"],
            hostCss: ":host{display:block;position:relative;contain:content;}:host([hidden]){display:none;}",
            ...t,
            ...window.ZeroMdConfig
        }, this.cache = {}, this.root = this.hasAttribute("no-shadow") ? this : this.attachShadow({ mode: "open" }), this.constructor.ready || (this.constructor.ready = Promise.all([!!window.marked || this.loadScript(this.config.markedUrl), !!window.Prism || this.loadScript(this.config.prismUrl)])), this.clicked = this.clicked.bind(this), this.manualRender || this.render().then((() => setTimeout((() => this.goto(location.hash)), 250))), this.observer = new MutationObserver((async() => { this.observeChanges(), this.manualRender || await this.render() })), this.observeChanges()
    }
    connectedCallback() { this.connected = !0, this.fire("zero-md-connected", {}, { bubbles: !1, composed: !1 }), this.waitForReady().then((() => { this.fire("zero-md-ready") })), this.shadowRoot && this.shadowRoot.addEventListener("click", this.clicked) }
    disconnectedCallback() { this.connected = !1, this.shadowRoot && this.shadowRoot.removeEventListener("click", this.clicked) }
    waitForReady() { const t = this.connected || new Promise((t => { this.addEventListener("zero-md-connected", (function e() { this.removeEventListener("zero-md-connected", e), t() })) })); return Promise.all([this.constructor.ready, t]) }
    fire(t, e = {}, s = { bubbles: !0, composed: !0 }) { e.msg && console.warn(e.msg), this.dispatchEvent(new CustomEvent(t, { detail: { node: this, ...e }, ...s })) }
    tick() { return new Promise((t => requestAnimationFrame(t))) }
    arrify(t) { return t ? Array.isArray(t) ? t : [t] : [] }
    onload(t) { return new Promise(((e, s) => { t.onload = e, t.onerror = t => s(t.path ? t.path[0] : t.composedPath()[0]) })) }
    loadScript(t) { return Promise.all(this.arrify(t).map((t => { const [e, ...s] = this.arrify(t), r = document.createElement("script"); return r.src = e, r.async = !1, s.forEach((t => r.setAttribute(t, ""))), this.onload(document.head.appendChild(r)) }))) }
    goto(t) {
        if (t) {
            const e = this.root.getElementById(t.substring(1));
            e && e.scrollIntoView()
        }
    }
    clicked(t) {
        if (t.metaKey || t.ctrlKey || t.altKey || t.shiftKey || t.defaultPrevented) return;
        const e = t.target.closest("a");
        e && e.hash && e.host === location.host && e.pathname === location.pathname && this.goto(e.hash)
    }
    dedent(t) { const e = (t = t.replace(/^\n/, "")).match(/^\s+/); return e ? t.replace(new RegExp(`^${e[0]}`, "gm"), "") : t }
    getBaseUrl(t) { const e = document.createElement("a"); return e.href = t, e.href.substring(0, e.href.lastIndexOf("/") + 1) }
    highlight(t) {
        return new Promise((e => {
            t.querySelectorAll('pre>code:not([class*="language-"])').forEach((t => {
                const e = t.innerText.match(/^\s*</) ? "markup" : t.innerText.match(/^\s*(\$|#)/) ? "bash" : "js";
                t.classList.add(`language-${e}`)
            }));
            try { window.Prism.highlightAllUnder(t, !0, e()) } catch { window.Prism.highlightAllUnder(t), e() }
        }))
    }
    makeNode(t) { const e = document.createElement("template"); return e.innerHTML = t, e.content.firstElementChild }
    buildStyles() {
        const t = t => { const e = this.querySelector(t); return e ? e.innerHTML || " " : "" },
            e = this.arrify(this.config.cssUrls);
        return `<div class="markdown-styles"><style>${this.config.hostCss}</style>${t('template[data-merge="prepend"]')}${t("template:not([data-merge])")||e.reduce(((t,e)=>`${t}<link rel="stylesheet" href="${e}">`),"")}${t('template[data-merge="append"]')}</div>`}async buildMd(t={}){return`<div class="markdown-body${t.classes?this.arrify(t.classes).reduce(((t,e)=>`${t} ${e}`)," "):""}">${await(async()=>{if(!this.src)return"";const e=await fetch(this.src);if(e.ok){const s=await e.text();return window.marked(s,{baseUrl:this.getBaseUrl(this.src),...t})}return this.fire("zero-md-error",{msg:`[zero-md] HTTP error ${e.status} while fetching src`,status:e.status,src:this.src}),""})()||(()=>{const e=this.querySelector('script[type="text/markdown"]');if(!e)return"";const s=e.hasAttribute("data-dedent")?this.dedent(e.text):e.text;return window.marked(s,t)})()}</div>`}async stampStyles(t){const e=this.makeNode(t),s=[...e.querySelectorAll('link[rel="stylesheet"]')],r=[...this.root.children].find((t=>t.classList.contains("markdown-styles")));r?r.replaceWith(e):this.root.prepend(e),await Promise.all(s.map((t=>this.onload(t)))).catch((t=>{this.fire("zero-md-error",{msg:"[zero-md] An external stylesheet failed to load",status:void 0,src:t.href})}))}stampBody(t){const e=this.makeNode(t),s=[...this.root.children].find((t=>t.classList.contains("markdown-body")));return s?s.replaceWith(e):this.root.append(e),e}observeChanges(){this.observer.observe(this,{childList:!0}),this.querySelectorAll('template,script[type="text/markdown"]').forEach((t=>{this.observer.observe(t.content||t,{childList:!0,subtree:!0,attributes:!0,characterData:!0})}))}async render(t={}){await this.waitForReady();const e={},s=this.buildMd(t),r=this.buildStyles();r!==this.cache.styles&&(this.cache.styles=r,await this.stampStyles(r),e.styles=!0,await this.tick());const i=await s;if(i!==this.cache.body){this.cache.body=i;const t=this.stampBody(i);e.body=!0,await this.highlight(t)}this.fire("zero-md-rendered",{stamped:e})}}customElements.define("zero-md",t);export{t as ZeroMd};
//# sourceMappingURL=zero-md.min.js.map