/**
 * ElevenLabs voice playback for the in-app coaching panel.
 *
 * Demo-grade: API key is embedded so the prototype works without a backend.
 * Rotate it before sharing the build externally.
 *
 * Mirrors the implementation used by /Users/tony/Dev/Eightfold/AI-Coach so the
 * two demos sound identical. Falls back to Web Speech if ElevenLabs is
 * unavailable / rate-limited / the user is offline.
 */

const ELEVEN_KEY = 'sk_9347d07a01167710e35cd3760ff1fa71c6f26e394595c947'
const MODEL_ID = 'eleven_turbo_v2_5'

export const DEFAULT_VOICE_ID = '15CVCzDByBinCIoCblXo' // John (AI Coach)
export const SARAH_VOICE_ID = 'EST9Ui6982FZPSi7gCHi'

let muted = false
let currentAudio: HTMLAudioElement | null = null
let fallbackVoice: SpeechSynthesisVoice | null = null
let genCounter = 0

function pickFallback(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  const score = (v: SpeechSynthesisVoice) => {
    const n = (v.name || '').toLowerCase()
    let s = /en[-_]us/i.test(v.lang) ? 40 : /^en/i.test(v.lang) ? 25 : 0
    if (/(premium|enhanced|neural|natural|studio)/.test(n)) s += 25
    if (/(samantha|ava|aria|jenny|google us english)/.test(n)) s += 15
    return s
  }
  return voices.slice().sort((a, b) => score(b) - score(a))[0] || null
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  fallbackVoice = pickFallback()
  window.speechSynthesis.onvoiceschanged = () => { fallbackVoice = pickFallback() }
}

export function stop() {
  if (currentAudio) {
    try {
      currentAudio.onended = null
      currentAudio.onerror = null
      currentAudio.pause()
      currentAudio.removeAttribute('src')
      currentAudio.load()
    } catch { /* noop */ }
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  genCounter++ // bump so any in-flight request is treated as stale
}

function speakFallback(text: string, gen: number) {
  if (gen !== genCounter) return
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    if (fallbackVoice) u.voice = fallbackVoice
    u.rate = 0.96
    u.pitch = 0.98
    window.speechSynthesis.speak(u)
  } catch { /* noop */ }
}

/** Returns a promise that resolves when playback finishes (or is superseded/muted). */
export async function speak(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<void> {
  if (muted) return
  stop()
  // stop() bumped genCounter; capture the post-stop gen as ours
  const ourGen = genCounter
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true },
        }),
      }
    )
    if (ourGen !== genCounter) return
    if (!res.ok) throw new Error('ElevenLabs ' + res.status)
    const blob = await res.blob()
    if (ourGen !== genCounter || muted) return
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    await new Promise<void>((resolve) => {
      let started = false
      audio.onplaying = () => { started = true }
      audio.onended = () => {
        URL.revokeObjectURL(url)
        if (currentAudio === audio) currentAudio = null
        resolve()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        if (ourGen !== genCounter) return resolve()
        if (!started) speakFallback(text, ourGen)
        resolve()
      }
      audio.play().catch(() => {
        if (!started && ourGen === genCounter) speakFallback(text, ourGen)
        resolve()
      })
    })
  } catch (e) {
    if (ourGen !== genCounter) return
    console.warn('[Voice] ElevenLabs failed, falling back to Web Speech:', e)
    speakFallback(text, ourGen)
  }
}

export function setMuted(v: boolean) {
  muted = !!v
  if (muted) stop()
}

export function isMuted() { return muted }
