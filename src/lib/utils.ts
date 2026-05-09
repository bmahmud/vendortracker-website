import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LinkItem } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LINKS_SEPARATOR = '\n\n--- LINKS ---\n'

export function parseLinkBlock(notes: string | null): { freeText: string; links: LinkItem[] } {
  if (!notes) return { freeText: '', links: [] }
  const parts = notes.split(LINKS_SEPARATOR)
  if (parts.length < 2) return { freeText: notes, links: [] }
  const [textPart, linksPart] = parts
  const links = linksPart
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const sepIdx = line.indexOf(' | ')
      if (sepIdx === -1) return { url: line.trim(), label: '' }
      return { url: line.slice(0, sepIdx).trim(), label: line.slice(sepIdx + 3).trim() }
    })
    .filter(l => l.url)
  return { freeText: textPart, links }
}

export function serializeLinkBlock(freeText: string, links: LinkItem[]): string {
  const validLinks = links.filter(l => l.url.trim())
  if (!validLinks.length) return freeText
  const linksStr = validLinks.map(l => `${l.url} | ${l.label}`).join('\n')
  return `${freeText}${LINKS_SEPARATOR}${linksStr}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    hired: 'Already Hired',
    to_hire: 'To Hire',
    do_not_hire: 'Do Not Hire',
  }
  return labels[status] ?? status
}
