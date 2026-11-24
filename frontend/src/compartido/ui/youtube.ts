/** Id del video en un enlace de YouTube (watch?v=, youtu.be/, /embed/, /shorts/), o null si no es de YouTube. */
export function idYoutube(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1) || null
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null
    return u.searchParams.get('v') ?? u.pathname.match(/\/(?:embed|shorts)\/([\w-]{6,})/)?.[1] ?? null
  } catch {
    return null
  }
}
