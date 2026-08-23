import { ROUND_TYPE_META } from './constants'
import type { Round } from './types'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Converts a Date object into Google Calendar / iCal UTC timestamp string (YYYYMMDDTHHmmssZ) */
export function formatUtcCalendarTimestamp(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

/** Escapes special characters for standard .ics format */
function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function getRoundCalendarDetails(round: Round) {
  const typeMeta = ROUND_TYPE_META[round.type]?.label || round.type
  const title = `${round.companyName} — ${round.title ? `${round.title} (${typeMeta})` : `${typeMeta} Round`}`

  const startDate = new Date(round.scheduledAt)
  const duration = round.durationMinutes || 60
  const endDate = new Date(startDate.getTime() + duration * 60000)

  const detailsLines: string[] = [
    `Company: ${round.companyName}`,
    `Round: ${typeMeta}${round.title ? ` - ${round.title}` : ''}`,
    `Mode: ${round.mode === 'ONLINE' ? 'Online' : 'In Person'}`,
    `Duration: ${duration} minutes`,
  ]

  if (round.meetingLink) {
    detailsLines.push(`Meeting Link: ${round.meetingLink}`)
  }
  if (round.location) {
    detailsLines.push(`Location: ${round.location}`)
  }

  detailsLines.push('\nTracked with PlaceTrack')

  const description = detailsLines.join('\n')
  const location = round.location || (round.mode === 'ONLINE' ? round.meetingLink || 'Online' : '')

  return {
    title,
    startDate,
    endDate,
    description,
    location,
  }
}

/** Generates a 1-click Google Calendar web creation URL */
export function getGoogleCalendarUrl(round: Round): string {
  const { title, startDate, endDate, description, location } = getRoundCalendarDetails(round)

  const startUtc = formatUtcCalendarTimestamp(startDate)
  const endUtc = formatUtcCalendarTimestamp(endDate)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startUtc}/${endUtc}`,
    details: description,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Generates standard iCalendar (.ics) format string */
export function generateIcsContent(round: Round): string {
  const { title, startDate, endDate, description, location } = getRoundCalendarDetails(round)

  const nowUtc = formatUtcCalendarTimestamp(new Date())
  const startUtc = formatUtcCalendarTimestamp(startDate)
  const endUtc = formatUtcCalendarTimestamp(endDate)
  const uid = `round-${round.id}-${startUtc}@placetrack.app`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlaceTrack//Interview Command Center//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/** Triggers a browser download for a .ics calendar file */
export function downloadIcsFile(round: Round): void {
  const icsContent = generateIcsContent(round)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const cleanCompanyName = round.companyName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const cleanType = round.type.toLowerCase()
  const filename = `${cleanCompanyName}_${cleanType}_round.ics`

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
