import { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Square, Plus, Trash2, Clock, TrendingUp, Star } from 'lucide-react'

const ACCENT = '#8b5cf6'

interface Session {
  id: string
  date: string
  instrument: string
  piece: string
  duration: number
  bpm: number
  rating: number
  notes: string
  tags: string[]
}

const INSTRUMENTS = ['Guitar', 'Piano', 'Bass', 'Violin', 'Drums', 'Vocals', 'Ukulele', 'Saxophone', 'Other']
const TAGS = ['Scales', 'Chords', 'Sight-reading', 'Improv', 'Technique', 'Theory', 'Repertoire', 'Ear training']

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [tab, setTab] = useState<'log' | 'timer' | 'stats'>('timer')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [instrument, setInstrument] = useState('Guitar')
  const [piece, setPiece] = useState('')
  const [bpm, setBpm] = useState(120)
  const [rating, setRating] = useState(3)
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [manualDuration, setManualDuration] = useState(30)

  useEffect(() => {
    const saved = localStorage.getItem('sl_sessions')
    if (saved) setSessions(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  function saveSessions(list: Session[]) { setSessions(list); localStorage.setItem('sl_sessions', JSON.stringify(list)) }

  function saveSession(dur: number) {
    const s: Session = { id: Date.now().toString(), date: new Date().toISOString(), instrument, piece: piece.trim(), duration: Math.round(dur / 60), bpm, rating, notes: notes.trim(), tags: selectedTags }
    saveSessions([s, ...sessions])
    setElapsed(0); setRunning(false); setPiece(''); setNotes(''); setRating(3); setSelectedTags([])
  }

  function deleteSession(id: string) { saveSessions(sessions.filter(s => s.id !== id)) }
  function fmt(s: number) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }

  const totalMin = sessions.reduce((a, s) => a + s.duration, 0)
  const totalH = Math.floor(totalMin / 60)
  const avgRating = sessions.length ? (sessions.reduce((a, s) => a + s.rating, 0) / sessions.length).toFixed(1) : '-'
  const weekMin = sessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 86400000
  }).reduce((a, s) => a + s.duration, 0)

  const instrCounts: Record<string, number> = {}
  sessions.forEach(s => { instrCounts[s.instrument] = (instrCounts[s.instrument] || 0) + s.duration })
  const topInstr = Object.entries(instrCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div style={{ background: '#0a0514', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ background: 'linear-gradient(135deg,#1a0f3d,#2d1a6e)', padding: '1.2rem 1.5rem', borderBottom: '1px solid #2d1a6e' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Music size={24} style={{ color: ACCENT }} />
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>StudioLog</h1>
          <span style={{ marginLeft: 'auto', color: '#7c3aed', fontSize: 13 }}>{totalH}h total practice</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.2rem' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['timer', 'log', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? ACCENT : '#1a0f3d', border: 'none', borderRadius: 10, padding: '0.6rem', color: tab === t ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'timer' ? '⏱ Practice' : t === 'log' ? '📋 Sessions' : '📊 Stats'}
            </button>
          ))}
        </div>

        {tab === 'timer' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,#1a0f3d,#2d1a6e)', borderRadius: 24, padding: '2.5rem', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 64, fontWeight: 100, color: ACCENT, letterSpacing: 4, marginBottom: 16 }}>{fmt(elapsed)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                <button onClick={() => setRunning(!running)} style={{ background: running ? '#dc2626' : ACCENT, border: 'none', borderRadius: 50, width: 56, height: 56, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{running ? <Pause size={24} /> : <Play size={24} />}</button>
                {elapsed > 0 && <button onClick={() => { setElapsed(0); setRunning(false) }} style={{ background: '#2d1a6e', border: 'none', borderRadius: 50, width: 56, height: 56, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}><Square size={20} /></button>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {INSTRUMENTS.slice(0, 6).map(i => <button key={i} onClick={() => setInstrument(i)} style={{ background: instrument === i ? ACCENT : '#1a0f3d', border: 'none', borderRadius: 20, padding: '0.3rem 0.8rem', color: instrument === i ? '#fff' : '#888', fontSize: 12, cursor: 'pointer' }}>{i}</button>)}
              </div>
              <input value={piece} onChange={e => setPiece(e.target.value)} placeholder="What are you practicing?" style={{ width: '80%', background: '#1a0f3d', border: '1px solid #2d1a6e', borderRadius: 10, padding: '0.6rem', color: '#fff', fontSize: 14, textAlign: 'center', maxWidth: 300 }} />
            </div>

            <div style={{ background: '#0f0a2e', borderRadius: 16, padding: '1.2rem', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Session Details</h3>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <label style={{ color: '#94a3b8', fontSize: 13, width: 50 }}>BPM</label>
                <input type="range" min={40} max={240} value={bpm} onChange={e => setBpm(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT }} />
                <span style={{ color: ACCENT, fontWeight: 700, width: 40, textAlign: 'right' }}>{bpm}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <label style={{ color: '#94a3b8', fontSize: 13, width: 50 }}>Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => <Star key={n} size={20} onClick={() => setRating(n)} style={{ color: n <= rating ? '#f59e0b' : '#2d1a6e', cursor: 'pointer' }} fill={n <= rating ? '#f59e0b' : 'none'} />)}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {TAGS.map(tag => <button key={tag} onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])} style={{ background: selectedTags.includes(tag) ? ACCENT : '#1a0f3d', border: 'none', borderRadius: 20, padding: '0.25rem 0.7rem', color: selectedTags.includes(tag) ? '#fff' : '#64748b', fontSize: 12, cursor: 'pointer' }}>{tag}</button>)}
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." rows={2} style={{ width: '100%', background: '#1a0f3d', border: '1px solid #2d1a6e', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
            </div>

            {elapsed > 0 ? (
              <button onClick={() => saveSession(elapsed)} style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 14, padding: '1rem', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Plus size={18} /> Save Session ({fmt(elapsed)})</button>
            ) : (
              <div style={{ background: '#0f0a2e', borderRadius: 14, padding: '1rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: 13, flex: 1 }}>Or log manually:</span>
                <input type="number" value={manualDuration} onChange={e => setManualDuration(Number(e.target.value))} style={{ width: 60, background: '#1a0f3d', border: '1px solid #2d1a6e', borderRadius: 8, padding: '0.4rem', color: '#fff', fontSize: 14, textAlign: 'center' }} />
                <span style={{ color: '#64748b', fontSize: 13 }}>min</span>
                <button onClick={() => saveSession(manualDuration * 60)} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Log</button>
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#2d1a6e' }}>
                <Music size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ color: '#4c1d95', fontSize: 16 }}>No sessions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map(s => (
                  <div key={s.id} style={{ background: '#0f0a2e', borderRadius: 12, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start', border: '1px solid #1a0f3d' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: ACCENT, fontWeight: 700, fontSize: 14 }}>{s.instrument}</span>
                        {s.piece && <span style={{ color: '#94a3b8', fontSize: 13 }}>· {s.piece}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {s.duration}min</span>
                        <div style={{ display: 'flex', gap: 1 }}>{[1,2,3,4,5].map(n => <Star key={n} size={10} style={{ color: n <= s.rating ? '#f59e0b' : '#2d1a6e' }} fill={n <= s.rating ? '#f59e0b' : 'none'} />)}</div>
                        <span style={{ color: '#475569', fontSize: 11 }}>{new Date(s.date).toLocaleDateString()}</span>
                      </div>
                      {s.tags.length > 0 && <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>{s.tags.map(t => <span key={t} style={{ background: '#1a0f3d', color: '#7c3aed', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: 11 }}>{t}</span>)}</div>}
                    </div>
                    <button onClick={() => deleteSession(s.id)} style={{ background: 'transparent', border: 'none', color: '#2d1a6e', cursor: 'pointer', marginLeft: 8 }}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#0f0a2e', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: ACCENT, fontSize: 24, fontWeight: 800 }}>{totalH}h</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>Total</p>
              </div>
              <div style={{ background: '#0f0a2e', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: '#22c55e', fontSize: 24, fontWeight: 800 }}>{Math.round(weekMin / 60)}h</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>This Week</p>
              </div>
              <div style={{ background: '#0f0a2e', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: '#f59e0b', fontSize: 24, fontWeight: 800 }}>{avgRating}★</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>Avg Rating</p>
              </div>
            </div>
            {topInstr.length > 0 && (
              <div style={{ background: '#0f0a2e', borderRadius: 16, padding: '1.2rem' }}>
                <h3 style={{ fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Time by Instrument</h3>
                {topInstr.map(([name, min]) => (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#e2e8f0', fontSize: 13 }}>{name}</span>
                      <span style={{ color: ACCENT, fontSize: 13 }}>{Math.floor(min / 60)}h {min % 60}m</span>
                    </div>
                    <div style={{ height: 6, background: '#1a0f3d', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: (min / topInstr[0][1] * 100) + '%', background: ACCENT, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
