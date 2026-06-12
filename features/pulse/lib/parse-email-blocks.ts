export type EmailBlock = {
  from: string
  subject: string
  date: string
  preview: string
}

function cleanField(value: string) {
  return value.replace(/\*\*/g, "").trim()
}

const EMAIL_BLOCK_MULTILINE_RE =
  /(?:^|\n)(?:[-•]\s*)?(?:\*\*)?From(?:\*\*)?:?\s*(.+?)\n(?:\*\*)?Subject(?:\*\*)?:?\s*(.+?)\n(?:\*\*)?(?:Date|Time)(?:\*\*)?:?\s*(.+?)\n(?:\*\*)?Preview(?:\*\*)?:?\s*([\s\S]+?)(?=\n\n|\n(?:[-•]\s*)?(?:\*\*)?From(?:\*\*)?:|$)/gi

// "From: Name email@x.com Subject: ... Date: ... Preview: ..."
const EMAIL_BLOCK_INLINE_RE =
  /(?:^|\n)(?:[-•]\s*)?From:\s*(.+?)\s+Subject:\s*(.+?)\s+(?:Date|Time):\s*(.+?)\s+Preview:\s*([\s\S]*?)(?=(?:\n(?:[-•]\s*)?From:)|$)/gi

// "Name email@x.com Subject: ... Date: ... Preview: ..." (no From: prefix)
const EMAIL_BLOCK_COMPACT_RE =
  /(?:^|\n)(?:[-•]\s*)?("?[^"\n]+?"?\s+)?([^\s]+@[^\s]+)\s+Subject:\s*(.+?)\s+(?:Date|Time):\s*(.+?)\s+Preview:\s*([\s\S]*?)(?=(?:\n[^\n]+@[^\s]+\s+Subject:)|$)/gi

const SENDER_FIRST_BLOCK_RE =
  /^([^\n]+)\nSubject:\s*(.+)\n(?:Time|Date):\s*(.+?)(?:\nPreview:\s*([\s\S]*))?$/m

function parseWithRegex(text: string, regex: RegExp) {
  const emails: EmailBlock[] = []
  let firstMatchIndex = -1
  let lastMatchEnd = 0

  for (const match of text.matchAll(regex)) {
    const isCompact = match.length === 6

    if (firstMatchIndex === -1 && match.index !== undefined) {
      firstMatchIndex = match.index
    }

    if (isCompact) {
      const name = cleanField(match[1] ?? "").replace(/^"|"$/g, "")
      const email = cleanField(match[2])
      const from = name ? `${name} ${email}` : email
      emails.push({
        from,
        subject: cleanField(match[3]),
        date: cleanField(match[4]),
        preview: cleanField(match[5]),
      })
    } else {
      emails.push({
        from: cleanField(match[1]),
        subject: cleanField(match[2]),
        date: cleanField(match[3]),
        preview: cleanField(match[4] ?? ""),
      })
    }

    if (match.index !== undefined) {
      lastMatchEnd = Math.max(lastMatchEnd, match.index + match[0].length)
    }
  }

  if (emails.length === 0) {
    return null
  }

  return {
    intro: text.slice(0, firstMatchIndex).trim(),
    emails,
    outro: text.slice(lastMatchEnd).trim(),
  }
}

function parseSenderFirstFormat(text: string) {
  const emails: EmailBlock[] = []
  let firstMatchIndex = -1
  let lastMatchEnd = 0
  let offset = 0

  for (const block of text.split(/\n{2,}/)) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const match = trimmed.match(SENDER_FIRST_BLOCK_RE)
    if (!match) continue

    const index = text.indexOf(trimmed, offset)
    if (index === -1) continue

    if (firstMatchIndex === -1) {
      firstMatchIndex = index
    }

    emails.push({
      from: cleanField(match[1]),
      subject: cleanField(match[2]),
      date: cleanField(match[3]),
      preview: cleanField(match[4] ?? ""),
    })

    lastMatchEnd = Math.max(lastMatchEnd, index + trimmed.length)
    offset = index + trimmed.length
  }

  if (emails.length === 0) {
    return null
  }

  return {
    intro: text.slice(0, firstMatchIndex).trim(),
    emails,
    outro: text.slice(lastMatchEnd).trim(),
  }
}

export function parseEmailBlocks(text: string) {
  const regexParsers = [
    EMAIL_BLOCK_MULTILINE_RE,
    EMAIL_BLOCK_INLINE_RE,
    EMAIL_BLOCK_COMPACT_RE,
  ]

  for (const regex of regexParsers) {
    const result = parseWithRegex(text, regex)
    if (result) return result
  }

  const senderFirst = parseSenderFirstFormat(text)
  if (senderFirst) return senderFirst

  return { intro: text, emails: [], outro: "" }
}

export function hasEmailBlocks(text: string) {
  return parseEmailBlocks(text).emails.length > 0
}
