import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

// Helper: API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  // Auth-free mode: always return a default user and no token
  const defaultUser = { name: 'Sandhya', email: 'sandhya@example.com' }
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ml_user')
    return raw ? JSON.parse(raw) : defaultUser
  })
  const token = ''
  const saveAuth = (_t, u) => {
    const nu = u || defaultUser
    setUser(nu)
    localStorage.setItem('ml_user', JSON.stringify(nu))
  }
  const logout = () => {
    // In auth-free mode, do nothing or reset to default
    saveAuth('', defaultUser)
  }
  return { token, user, saveAuth, logout }
}

function TopBar({ title = 'MedLink AI' }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur bg-white/60 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-slate-800">{title}</Link>
        <nav className="flex items-center gap-3 text-sm text-slate-700">
          <Link className="hover:text-blue-600" to="/">Dashboard</Link>
          <Link className="hover:text-blue-600" to="/symptoms">Check Symptoms</Link>
          <Link className="hover:text-blue-600" to="/consult">Consult</Link>
          <Link className="hover:text-blue-600" to="/prescription">Prescription</Link>
          <Link className="hover:text-blue-600" to="/reminders">Reminders</Link>
          <Link className="hover:text-blue-600" to="/vitals">Vitals</Link>
          <Link className="hover:text-blue-600" to="/offline">Offline</Link>
          <Link className="hover:text-blue-600" to="/profile">Profile</Link>
        </nav>
      </div>
    </div>
  )
}

function SplashHero() {
  // Kept as a decorative hero if needed, but not used for auth
  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-black text-white relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 p-10">
        <h1 className="text-4xl md:text-5xl font-extrabold">MedLink AI</h1>
        <p className="mt-3 text-slate-300 max-w-xl">Your personal healthcare companion. Check symptoms, consult doctors, manage prescriptions, and track vitals — all in one place.</p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const name = user?.name || 'Sandhya'
  const nav = useNavigate()

  const cards = [
    { title: 'Check Symptoms', path: '/symptoms', emoji: '🩺' },
    { title: 'Consult Doctor', path: '/consult', emoji: '👨‍⚕️' },
    { title: 'View Reports', path: '/prescription', emoji: '📄' },
    { title: 'Reminders', path: '/reminders', emoji: '⏰' },
    { title: 'Offline Mode', path: '/offline', emoji: '📶' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <SplashHero />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hello {name}</h2>
          <p className="text-slate-600">Here’s your health overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <button key={c.title} onClick={() => nav(c.path)} className="text-left rounded-xl border border-slate-200 bg-white hover:shadow-lg transition p-5 flex items-center gap-4">
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-semibold text-slate-800">{c.title}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'BP', value: '118/76' },
            { label: 'Heart Rate', value: '72 bpm' },
            { label: 'SpO₂', value: '98%' },
            { label: 'Temp', value: '36.8°C' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{k.label}</p>
              <p className="text-2xl font-bold text-slate-800">{k.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SymptomChecker() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ possible_causes: ['Unable to analyze right now'] })
    } finally {
      setLoading(false)
    }
  }

  const nav = useNavigate()

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      analyze()
    }
  }

  const examples = ['High fever and body ache', 'Loss of smell and dry cough', 'Runny nose and sneezing']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">AI Symptom Checker</h2>
        <p className="text-slate-600">Instant AI-based preliminary diagnosis</p>
        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your symptom"
          />
          <button onClick={analyze} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {examples.map((ex) => (
            <button key={ex} onClick={() => setText(ex)} className="px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50">{ex}</button>
          ))}
        </div>
        {result && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-700">Possible Causes:</p>
            <ul className="list-disc ml-5 mt-2 text-slate-800">
              {result.possible_causes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button onClick={() => nav('/consult')} className="mt-4 bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg">Book Consultation</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Consult() {
  const { user } = useAuth()
  const email = user?.email || 'guest@medlink.ai'
  const [doctors, setDoctors] = useState([])
  const [active, setActive] = useState(null) // { id, doctor_name }
  const [chat, setChat] = useState([])
  const [msg, setMsg] = useState('Hello Doctor!')

  useEffect(() => {
    fetch(`${API_BASE}/doctors`).then((r) => r.json()).then(setDoctors)
  }, [])

  const start = async (doctor_name) => {
    const res = await fetch(`${API_BASE}/consult/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: email, doctor_name })
    })
    const data = await res.json()
    setActive({ id: data.consultation_id, doctor_name })
  }

  const send = async () => {
    if (!active) return
    setChat((c) => [...c, { sender: 'you', text: msg }])
    await fetch(`${API_BASE}/consult/message`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: active.id, sender: 'user', text: msg })
    })
    setMsg('')
  }

  const end = async () => {
    if (!active) return
    const rating = Number(prompt('Rate your call 1-5', '5')) || 5
    await fetch(`${API_BASE}/consult/end`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: active.id, rating })
    })
    alert('Call ended. Thank you!')
    setActive(null)
    setChat([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Doctors</h2>
          {doctors.map((d) => (
            <div key={d.name} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{d.name}</p>
                <p className="text-sm text-slate-600">{d.specialty} • {d.status} • ⭐ {d.rating}</p>
              </div>
              <button onClick={() => start(d.name)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg">Start Call</button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-48 rounded-lg bg-black/80 text-white flex items-center justify-center">{active ? 'Video Stream (simulated)' : 'Start a call to see video'}</div>
          <div className="mt-3 h-40 overflow-auto rounded border border-slate-200 p-2 bg-slate-50">
            {chat.map((c, i) => (
              <div key={i} className="text-sm mb-1"><span className="font-semibold">{c.sender}:</span> {c.text}</div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2" placeholder="Type a note" />
            <button onClick={send} className="bg-slate-800 text-white rounded-lg px-3">Send</button>
            <button onClick={end} className="bg-red-600 text-white rounded-lg px-3">End Call</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Prescription() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch(`${API_BASE}/prescriptions/sample`).then((r) => r.json()).then(setData)
  }, [])

  const download = () => {
    const w = window.open('', 'PRINT', 'height=600,width=800')
    if (!w) return
    w.document.write(`<html><head><title>Prescription</title></head><body>${document.getElementById('presc').innerHTML}</body></html>`)
    w.document.close(); w.focus(); w.print(); w.close();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Prescription Viewer</h2>
        <div id="presc" className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          {data ? (
            <div>
              <p className="font-semibold">Doctor: {data.doctor_name}</p>
              <p className="text-sm text-slate-600">Date: {new Date(data.date).toLocaleString()}</p>
              <p className="mt-3">Diagnosis: <span className="font-semibold">{data.diagnosis}</span></p>
              <div className="mt-3">
                <p className="font-semibold">Medicines</p>
                <ul className="list-disc ml-5">
                  {data.medicines.map((m, i) => (
                    <li key={i}>{m.name} — {m.dosage} — {m.timing}</li>
                  ))}
                </ul>
              </div>
              {data.notes && <p className="mt-3 text-slate-700">Notes: {data.notes}</p>}
            </div>
          ) : 'Loading...'}
        </div>
        <button onClick={download} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">Download PDF</button>
      </div>
    </div>
  )
}

function Reminders() {
  const { user } = useAuth()
  const email = user?.email || 'guest@medlink.ai'
  const [medicine_name, setMed] = useState('Paracetamol 500mg')
  const [time, setTime] = useState('08:30')
  const [duration_days, setDays] = useState(5)
  const [list, setList] = useState([])

  const load = async () => {
    const res = await fetch(`${API_BASE}/reminders?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setList(data)
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    await fetch(`${API_BASE}/reminders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_email: email, medicine_name, time, duration_days }) })
    await load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Medicine Reminders</h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input value={medicine_name} onChange={(e) => setMed(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Medicine name" />
            <input value={time} onChange={(e) => setTime(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Time e.g., 08:30" />
            <input type="number" value={duration_days} onChange={(e) => setDays(Number(e.target.value))} className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Days" />
            <button onClick={add} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4">Add Reminder</button>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Upcoming Medicines</p>
            <ul className="mt-2 divide-y">
              {list.map((r) => (
                <li key={r._id} className="py-2 flex items-center justify-between">
                  <span>{r.medicine_name} • {r.time} • {r.duration_days} days</span>
                  <span className="text-slate-500 text-sm">{r.user_email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparkline({ data = [], color = '#2563eb' }) {
  if (!data.length) return <div className="h-20" />
  const width = 220, height = 80, pad = 6
  const xs = data.map((_, i) => (i / (data.length - 1)) * (width - pad * 2) + pad)
  const ys = data.map((v) => height - pad - (v / Math.max(...data)) * (height - pad * 2))
  const d = ys.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${y}`).join(' ')
  return (
    <svg width={width} height={height} className="block">
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  )
}

function Vitals() {
  const { user } = useAuth()
  const email = user?.email || 'guest@medlink.ai'
  const [vitals, setVitals] = useState([])

  const load = async () => {
    const res = await fetch(`${API_BASE}/vitals?email=${encodeURIComponent(email)}&limit=20`)
    const data = await res.json()
    setVitals(data)
  }
  useEffect(() => { load() }, [])

  const syncDevice = async () => {
    const rand = (min, max) => Math.round(min + Math.random() * (max - min))
    const vital = {
      user_email: email,
      heart_rate: rand(60, 95),
      bp_systolic: rand(105, 130),
      bp_diastolic: rand(65, 85),
      spo2: rand(96, 100),
      temperature_c: parseFloat((36 + Math.random() * 1.5).toFixed(1)),
      recorded_at: new Date().toISOString()
    }
    await fetch(`${API_BASE}/vitals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vital) })
    await load()
  }

  const hr = vitals.map(v => v.heart_rate)
  const sys = vitals.map(v => v.bp_systolic)
  const dia = vitals.map(v => v.bp_diastolic)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Vitals Dashboard</h2>
          <button onClick={syncDevice} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">Sync Device</button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">Heart Rate</p>
            <Sparkline data={hr} color="#ef4444" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">BP Systolic</p>
            <Sparkline data={sys} color="#2563eb" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">BP Diastolic</p>
            <Sparkline data={dia} color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Offline() {
  const [text, setText] = useState('Fever and cough for two days')
  const [status, setStatus] = useState('')

  const submit = async () => {
    localStorage.setItem('ml_offline_msgs', JSON.stringify([...(JSON.parse(localStorage.getItem('ml_offline_msgs')||'[]')), { text, at: new Date().toISOString() }]))
    const res = await fetch(`${API_BASE}/offline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    const data = await res.json()
    setStatus(data.info)
  }

  const items = useMemo(() => JSON.parse(localStorage.getItem('ml_offline_msgs')||'[]'), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Offline / SMS Mode</h2>
        <p className="text-slate-600">Type a message and we’ll send advice via SMS when available.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-4 w-full min-h-[120px] rounded-lg border border-slate-300 p-3" />
        <button onClick={submit} className="mt-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
        {status && <p className="mt-2 text-green-700">{status}</p>}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-semibold">Stored Offline Messages</p>
          <ul className="list-disc ml-5 mt-2 text-slate-700">
            {items.map((i, idx) => <li key={idx}>{i.text} — <span className="text-slate-500 text-sm">{new Date(i.at).toLocaleString()}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Profile() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [lang, setLang] = useState('English')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/profile`).then(r=>r.json()).then((p)=>{ setProfile(p); setLang(p.language); setDark(p.dark_mode) })
  }, [])

  const save = async () => {
    await fetch(`${API_BASE}/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: lang, dark_mode: dark }) })
    alert('Preferences saved')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Profile & Settings</h2>
        {profile ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div>
              <p className="font-semibold">Name</p>
              <p>{profile.name}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{user?.email}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600">Language</label>
                <select value={lang} onChange={(e)=>setLang(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-3 py-2 w-full">
                  {['English','Tamil','Hindi'].map(l=> <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <input id="dark" type="checkbox" checked={dark} onChange={(e)=>setDark(e.target.checked)} />
                <label htmlFor="dark">Dark mode</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">Save</button>
              <button onClick={logout} className="bg-slate-800 text-white px-4 py-2 rounded-lg">Reset</button>
            </div>
          </div>
        ) : 'Loading...'}
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/symptoms" element={<SymptomChecker />} />
      <Route path="/consult" element={<Consult />} />
      <Route path="/prescription" element={<Prescription />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="/vitals" element={<Vitals />} />
      <Route path="/offline" element={<Offline />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
