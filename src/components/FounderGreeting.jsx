// "A message from the founder" surprise popup. Shown once per user on their
// first portal login; plays the founder's personal video with sound.
import { useRef, useEffect } from 'react'
import { useAuth } from '../lib/auth'

export default function FounderGreeting({ open, onClose }) {
  const { user } = useAuth()
  const vidRef = useRef(null)

  // Reset/restart playback each time the modal opens.
  useEffect(() => {
    if (open && vidRef.current) {
      try { vidRef.current.currentTime = 0; vidRef.current.play() } catch {}
    }
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const first = user?.name ? user.name.trim().split(/\s+/)[0] : 'there'

  return (
    <div className="modal-ov greeting-ov" onClick={onClose}>
      <div className="modal greeting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="greeting-head">
          <h3>💌 A message from the founder</h3>
          <button className="close-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="greeting-lead">Hi {first}, please watch this first — Sohag.</p>
        <video
          ref={vidRef}
          className="greeting-video"
          src="/founder-greeting.mp4"
          autoPlay
          controls
          playsInline
        />
        <div className="greeting-foot">
          <button className="btn btn-primary" onClick={onClose}>Got it, thanks 💙</button>
        </div>
      </div>
    </div>
  )
}
