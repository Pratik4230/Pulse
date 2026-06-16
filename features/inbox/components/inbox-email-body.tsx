"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type InboxEmailBodyProps = {
  bodyHtml?: string
  bodyText: string
  className?: string
}

/** White email card, iframe cannot read app CSS variables. */
const EMAIL_SURFACE = "#ffffff"
const EMAIL_TEXT = "#1c1917"
const EMAIL_MUTED = "#78716c"

const EMAIL_VIEWER_STYLES = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

  html, body {
    margin: 0;
    padding: 0;
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    background-color: ${EMAIL_SURFACE} !important;
    color: ${EMAIL_TEXT};
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  body {
    padding: 0;
    text-align: center;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .pulse-email-root {
    display: inline-block;
    vertical-align: top;
    max-width: 100%;
    text-align: left;
  }

  /* Gmail-style: shrink-wrap fixed-width layouts so they center in the card */
  body > table,
  body > center,
  body > div,
  .pulse-email-root > table,
  .pulse-email-root > div {
    display: inline-block;
    vertical-align: top;
    max-width: 100% !important;
    text-align: left;
  }

  .email-body,
  .email-wrapper,
  .email-container,
  .email-content,
  .email-column-container {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    max-width: 100% !important;
  }

  details.pulse-email-quote {
    margin-top: 1rem;
    border-left: 3px solid #d6d3d1;
    padding-left: 0.75rem;
  }

  details.pulse-email-quote > summary {
    cursor: pointer;
    color: ${EMAIL_MUTED};
    font-size: 0.8125rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    user-select: none;
  }

  details.pulse-email-quote[open] > summary {
    margin-bottom: 0.75rem;
  }

  img { max-width: 100%; height: auto; }
  table { max-width: 100%; }
  td, th { overflow-wrap: anywhere; word-break: break-word; }
  pre, code { white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-all; }
  a { color: #57534e; overflow-wrap: anywhere; }
`

function wrapEmailDocument(html: string) {
  const hasDocument = /<html[\s>]/i.test(html)
  const fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />`
  const styles = `<style>${EMAIL_VIEWER_STYLES}</style>`

  if (hasDocument) {
    let doc = html

    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", `${fontLink}${styles}</head>`)
    }

    if (/<body[\s>]/i.test(doc)) {
      doc = doc
        .replace(/<body([^>]*)>/i, `<body$1><div class="pulse-email-root">`)
        .replace(/<\/body>/i, `</div></body>`)
    }

    return doc
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${fontLink}
    ${styles}
    <base target="_blank" rel="noopener noreferrer" />
  </head>
  <body><div class="pulse-email-root">${html}</div></body>
</html>`
}

function measureIframeContent(frame: HTMLIFrameElement) {
  const doc = frame.contentDocument
  if (!doc) return 0

  const html = doc.documentElement
  const body = doc.body
  if (!body) return 0

  return Math.max(
    html.scrollHeight,
    html.offsetHeight,
    body.scrollHeight,
    body.offsetHeight,
  )
}

export function InboxEmailBody({
  bodyHtml,
  bodyText,
  className,
}: InboxEmailBodyProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !bodyHtml) return

    function resize() {
      const frame = iframeRef.current
      if (!frame) return
      const height = measureIframeContent(frame)
      if (height > 0) {
        frame.style.height = `${height}px`
      }
    }

    function bindQuoteToggles() {
      const doc = iframeRef.current?.contentDocument
      if (!doc) return
      for (const details of doc.querySelectorAll("details")) {
        details.addEventListener("toggle", resize)
      }
    }

    function observeImages() {
      const doc = iframeRef.current?.contentDocument
      if (!doc) return
      for (const img of doc.images) {
        if (!img.complete) {
          img.addEventListener("load", resize)
        }
      }
    }

    function onLoad() {
      resize()
      observeImages()
      bindQuoteToggles()
    }

    iframe.addEventListener("load", onLoad)
    onLoad()

    const observer = new ResizeObserver(resize)
    const doc = iframe.contentDocument
    if (doc?.body) {
      observer.observe(doc.body)
    }
    if (doc?.documentElement) {
      observer.observe(doc.documentElement)
    }

    return () => {
      iframe.removeEventListener("load", onLoad)
      observer.disconnect()
    }
  }, [bodyHtml])

  if (bodyHtml?.trim()) {
    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        srcDoc={wrapEmailDocument(bodyHtml)}
        title="Email content"
        scrolling="no"
        className={cn(
          "block w-full overflow-hidden bg-white",
          className,
        )}
        style={{ backgroundColor: EMAIL_SURFACE, minHeight: 0 }}
      />
    )
  }

  return (
    <div
      className={cn(
        "px-5 py-4 font-sans text-sm leading-relaxed text-foreground/90",
        className,
      )}
    >
      {bodyText}
    </div>
  )
}
