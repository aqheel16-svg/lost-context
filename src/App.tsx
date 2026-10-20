
import { useEffect, useState } from 'react'

type Announcement = {
  id: number
  title: string
  category: string
  location: string
  author: string
  date: string
  status: string
  content: string
  previous?: string
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Water supply maintenance',
    category: 'Utilities',
    location: 'North Block',
    author: 'Community Admin',
    date: 'Today, 9:30 AM',
    status: 'Updated',
    content:
      'Water supply will be interrupted on Thursday from 10 AM to 1 PM for maintenance.',
    previous:
      'Water supply will be interrupted on Thursday from 10 AM to 12 PM for maintenance.',
  },
  {
    id: 2,
    title: 'Community park renovation',
    category: 'Community',
    location: 'Central Park',
    author: 'Priya S.',
    date: 'Today, 8:15 AM',
    status: 'Needs clarity',
    content:
      'Renovation work begins this weekend. Please avoid the main playground area.',
  },
  {
    id: 3,
    title: 'Road closure notice',
    category: 'Transport',
    location: 'East Street',
    author: 'Residents Association',
    date: 'Yesterday',
    status: 'Confirmed',
    content:
      'East Street will be closed for repair work. An alternate route is available via Market Road.',
  },
  {
    id: 4,
    title: 'Neighborhood meeting',
    category: 'Events',
    location: 'Community Hall',
    author: 'Community Admin',
    date: 'Yesterday',
    status: 'Needs clarity',
    content:
      'A neighborhood meeting is planned for this week. More details will follow.',
  },
]

const navItems = [
  { name: 'Overview', icon: '◫' },
  { name: 'Announcements', icon: '▤' },
  { name: 'Changes & History', icon: '⟳' },
  { name: 'Clarifications', icon: '◎' },
]


function describeChanges(previous: string, current: string) {
  const oldWords = previous.match(/[A-Za-z0-9']+/g) ?? []
  const newWords = current.match(/[A-Za-z0-9']+/g) ?? []

  const added = newWords.filter(
    word =>
      !oldWords.some(
        oldWord => oldWord.toLowerCase() === word.toLowerCase(),
      ),
  )

  const removed = oldWords.filter(
    word =>
      !newWords.some(
        newWord => newWord.toLowerCase() === word.toLowerCase(),
      ),
  )

  const changes: string[] = []

  if (added.length > 0) {
    changes.push(`Added: ${added.join(', ')}`)
  }

  if (removed.length > 0) {
    changes.push(`Removed: ${removed.join(', ')}`)
  }

  return changes.length > 0
    ? changes.join(' | ')
    : 'No word additions or removals detected.'
}


function App() {

  const [activePage, setActivePage] = useState('Overview')
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(() => {
      const saved = localStorage.getItem('lost-context-announcements')
      if (saved) {
        try {
          return JSON.parse(saved) as Announcement[]
        } catch {
          return initialAnnouncements
        }
      }
      return initialAnnouncements
    })
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Community')
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState<Record<number, string[]>>({})
  const [notice, setNotice] = useState('')
  
  const [editingId, setEditingId] = useState<number | null>(null)

    useEffect(() => {
    localStorage.setItem(
      'lost-context-announcements',
      JSON.stringify(announcements),
    )
  }, [announcements])
    

  const filtered = announcements.filter((item) =>
    `${item.title} ${item.category} ${item.location} ${item.content}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const updatedCount = announcements.filter(
    (item) => item.status === 'Updated',
  ).length

  const unclearCount = announcements.filter(
    (item) => item.status === 'Needs clarity',
  ).length

  function addAnnouncement() {
    if (!title.trim() || !location.trim() || !content.trim()) {
      setNotice('Please complete the title, location and announcement.')
      return
    }

    const newItem: Announcement = {
      id: Date.now(),
      title: title.trim(),
      category,
      location: location.trim(),
      author: 'You',
      date: 'Just now',
      status: 'New',
      content: content.trim(),
    }

    setAnnouncements((items) => [newItem, ...items])
    setTitle('')
    setLocation('')
    setContent('')
    setShowForm(false)
    setActivePage('Announcements')
    setNotice('Announcement added successfully.')
    setSelected(null)
  }
 
  function updateAnnouncement() {
    if (editingId === null) return

    const updatedContent = content.trim()
    if (!title.trim() || !location.trim() || !updatedContent) {
      setNotice('Please complete all required fields.')
      return
    }

    setAnnouncements((items) =>
      items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: title.trim(),
              category,
              location: location.trim(),
              previous: item.content,
              content: updatedContent,
              status: 'Updated',
              date: 'Just now',
            }
          : item,
      ),
    )

    setEditingId(null)
    setTitle('')
    setLocation('')
    setContent('')
    setShowForm(false)
    setSelected(null)
    setActivePage('Announcements')
    setNotice('Announcement updated successfully!')
  }

  function submitQuestion(id: number) {
    if (!question.trim()) return

    setQuestions((old) => ({
      ...old,
      [id]: [...(old[id] || []), question.trim()],
    }))
    setQuestion('')
    setNotice('Your clarification question has been saved.')
  }

  function markConfirmed(id: number) {
    setAnnouncements((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'Confirmed' } : item,
      ),
    )
    setSelected(null)
    setNotice('Announcement marked as confirmed.')
  }

  async function copySummary(item: Announcement) {
    const summary = `${item.title}\nLocation: ${item.location}\nStatus: ${item.status}\n\n${item.content}`

    try {
      await navigator.clipboard.writeText(summary)
      setNotice('Summary copied to clipboard.')
    } catch {
      setNotice('Clipboard unavailable. Select and copy the announcement text.')
    }
  }

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        :root {
          font-family: 'DM Sans', sans-serif;
          color: #e9eaf3;
          background: #090a10;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          --panel: #11131d;
          --line: #252736;
          --muted: #85899f;
          --purple: #987cff;
        }

        * { box-sizing: border-box; }
        body { margin: 0; min-width: 320px; }
        button, input, textarea, select { font: inherit; }
        button { cursor: pointer; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid #987cff;
          outline-offset: 3px;
        }

        .app-shell { min-height: 100vh; background:
          radial-gradient(ellipse at 65% -20%, #292044 0%, transparent 42%),
          #090a10; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar {
          width: 248px; flex-shrink: 0; padding: 27px 17px;
          border-right: 1px solid var(--line); background: #0d0e16;
          display: flex; flex-direction: column;
        }
        .brand { display: flex; gap: 11px; align-items: center; padding: 0 9px 34px; }
        .brand-mark {
          width: 39px; height: 39px; border-radius: 13px;
          display: grid; place-items: center; font-size: 21px;
          background: linear-gradient(145deg,#a78bfa,#6546dc);
          box-shadow: 0 5px 25px #7954f344;
        }
        .brand-name { font: 700 18px 'Space Grotesk',sans-serif; letter-spacing: -.5px; }
        .brand-sub { font-size: 10px; color: var(--muted); margin-top: 3px; }
        .nav-label { padding: 0 11px; margin-bottom: 11px; color: #686c80;
          font-size: 10px; font-weight: 700; letter-spacing: 1.6px; }
        .nav-list { display: grid; gap: 6px; }
        .nav-button {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 12px 13px; border: 1px solid transparent; border-radius: 10px;
          background: transparent; color: #979bb0; text-align: left; font-size: 13px;
        }
        .nav-button:hover { background: #171824; color: #fff; }
        .nav-button.active { background: #201a35; color: #c4b5fd; border-color: #423264; }
        .nav-icon { width: 20px; font-size: 19px; text-align: center; }
        .sidebar-bottom { margin-top: auto; }
        .community-box { padding: 15px; background: #141520; border: 1px solid var(--line); border-radius: 13px; }
        .online-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4adea4; margin-right: 6px; }
        .small-muted { font-size: 11px; color: var(--muted); line-height: 1.7; }
        .community-title { font-size: 12px; font-weight: 600; margin-bottom: 5px; }
        .main { flex: 1; min-width: 0; }
        .topbar {
          min-height: 78px; padding: 18px 36px; border-bottom: 1px solid var(--line);
          display: flex; justify-content: space-between; align-items: center; gap: 15px;
          background: #0b0c13aa;
        }
        .breadcrumb { font-size: 12px; color: var(--muted); }
        .breadcrumb strong { color: #e9eaf3; font-weight: 500; }
        .top-actions { display: flex; gap: 10px; align-items: center; }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
          background: #33254e; color: #d7c8ff; font-size: 12px; font-weight: 700;
          border: 1px solid #59457e;
        }
        .content { max-width: 1320px; padding: 34px 36px 60px; margin: auto; }
        .eyebrow { color: #b3a0ff; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
        h1,h2,h3,p { margin-top: 0; }
        h1 { font: 600 30px 'Space Grotesk',sans-serif; letter-spacing: -1px; margin: 9px 0 9px; }
        h2 { font: 600 18px 'Space Grotesk',sans-serif; letter-spacing: -.4px; }
        h3 { font-size: 14px; font-weight: 600; }
        .subtitle { color: var(--muted); font-size: 13px; line-height: 1.7; margin-bottom: 0; }
        .heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 27px; }
        .primary-btn {
          border: 1px solid #a997ff; border-radius: 9px; padding: 11px 15px;
          background: linear-gradient(135deg,#a18aff,#7855eb); color: white;
          font-weight: 700; font-size: 12px; box-shadow: 0 4px 22px #7954f322;
        }
        .primary-btn:hover { filter: brightness(1.1); }
        .secondary-btn { border: 1px solid #343648; background: #171823; color: #e0e1ee; border-radius: 9px; padding: 10px 13px; font-size: 12px; }
        .secondary-btn:hover { background: #232437; }
        .stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; margin-bottom: 25px; }
        .stat-card { border: 1px solid var(--line); border-radius: 13px; padding: 19px; background: linear-gradient(140deg,#141521,#10111a); min-width: 0; }
        .stat-top { display: flex; justify-content: space-between; gap: 7px; align-items: center; color: var(--muted); font-size: 11px; }
        .stat-icon { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: #25203a; color: #bca9ff; font-size: 16px; }
        .stat-number { font: 600 28px 'Space Grotesk',sans-serif; margin-top: 16px; }
        .stat-foot { color: #8c91a7; font-size: 10px; margin-top: 5px; }
        .good { color: #62dbab; }
        .columns { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(250px,1fr); gap: 18px; align-items: start; }
        .panel { background: #11121b; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; min-width: 0; }
        .panel-head { padding: 19px 21px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid var(--line); }
        .panel-head h2 { margin: 0; }
        .panel-body { padding: 19px 21px; }
        .text-link { border: 0; background: transparent; color: #b6a4ff; font-size: 11px; }
        .text-link:hover { color: #d8ccff; }
        .announcement-list { display: grid; }
        .announcement-row { display: flex; align-items: flex-start; gap: 13px; padding: 17px 21px; border-bottom: 1px solid #20212d; cursor: pointer; }
        .announcement-row:last-child { border-bottom: 0; }
        .announcement-row:hover { background: #171823; }
        .category-icon { flex-shrink: 0; width: 37px; height: 37px; display: grid; place-items: center; border-radius: 11px; background: #222035; color: #b8a5ff; font-size: 17px; }
        .row-main { min-width: 0; flex: 1; }
        .row-title { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
        .row-description { color: var(--muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
        .row-meta { color: #71758b; font-size: 10px; margin-top: 7px; }
        .status { display: inline-flex; align-items: center; border: 1px solid #383448; background: #242036; color: #c6b5ff; border-radius: 20px; padding: 5px 8px; font-size: 9px; white-space: nowrap; }
        .status.confirmed { background: #142a25; border-color: #245442; color: #70d8ad; }
        .status.unclear { background: #302719; border-color: #5b4629; color: #f3c67c; }
        .status.new { background: #1b293c; border-color: #2c496b; color: #91c6ff; }
        .search-box { width: 100%; padding: 11px 13px; background: #0d0e16; border: 1px solid #303143; border-radius: 9px; color: #eee; outline: none; font-size: 12px; }
        .search-box:focus { border-color: #8068cf; }
        .activity-item { display: flex; gap: 11px; padding: 14px 0; border-bottom: 1px solid #252633; }
        .activity-item:last-child { border: 0; }
        .activity-mark { width: 8px; height: 8px; border-radius: 50%; background: #9e83ff; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 10px #9e83ff55; }
        .activity-title { font-size: 11px; line-height: 1.6; }
        .activity-time { font-size: 10px; color: #797e92; margin-top: 4px; }
        .insight-box { border: 1px solid #3b315b; background: linear-gradient(135deg,#211a36,#151421); border-radius: 12px; padding: 17px; margin-top: 17px; }
        .insight-heading { color: #c6b5ff; font-size: 11px; font-weight: 700; margin-bottom: 9px; }
        .insight-box p { color: #aaa6c2; font-size: 11px; line-height: 1.8; margin: 0; }
        .section-title { margin: 28px 0 14px; }
        .empty-state { padding: 36px 20px; text-align: center; color: var(--muted); font-size: 12px; }
        .form-grid { display: grid; gap: 15px; }
        .field { display: grid; gap: 7px; }
        .field label { color: #b5b7c9; font-size: 11px; font-weight: 600; }
        .field input,.field textarea,.field select { width: 100%; border: 1px solid #333548; background: #0c0d15; color: #e9eaf3; border-radius: 8px; padding: 11px 12px; font-size: 12px; }
        .field textarea { min-height: 110px; resize: vertical; line-height: 1.6; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .detail-content { white-space: pre-wrap; color: #c4c5d4; font-size: 13px; line-height: 1.9; }
        .change-box { border: 1px solid #39334e; border-radius: 10px; padding: 14px; margin-top: 13px; background: #171521; }
        .change-label { font-size: 10px; color: #bba9ff; font-weight: 700; margin-bottom: 7px; }
        .change-text { font-size: 12px; color: #c5c3d5; line-height: 1.8; }
        .question-item { padding: 12px; border: 1px solid #303143; background: #0e0f17; border-radius: 9px; font-size: 12px; line-height: 1.7; margin-top: 8px; }
        .notice { position: fixed; right: 22px; bottom: 22px; max-width: calc(100vw - 44px); z-index: 10; background: #242039; border: 1px solid #514276; border-radius: 11px; padding: 13px 17px; color: #e0d7ff; font-size: 12px; box-shadow: 0 12px 40px #0008; }
        .mobile-brand { display: none; }
        @media(max-width:1000px) {
          .sidebar { width: 210px; }
          .content { padding: 27px 22px 45px; }
          .topbar { padding: 17px 22px; }
          .stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .columns { grid-template-columns: 1fr; }
        }
        @media(max-width:650px) {
          .layout { display: block; }
          .sidebar { width: 100%; padding: 14px 12px; border-right: 0; border-bottom: 1px solid var(--line); }
          .brand { padding: 0 5px 15px; }
          .nav-label,.sidebar-bottom { display: none; }
          .nav-list { display: flex; overflow-x: auto; padding-bottom: 3px; }
          .nav-button { width: auto; flex-shrink: 0; padding: 10px; gap: 7px; font-size: 11px; }
          .nav-icon { font-size: 15px; width: auto; }
          .topbar { min-height: 57px; padding: 12px 16px; }
          .content { padding: 25px 14px 40px; }
          .heading-row { flex-direction: column; align-items: stretch; }
          .heading-row .primary-btn { align-self: flex-start; }
          h1 { font-size: 25px; }
          .stats { gap: 9px; }
          .stat-card { padding: 14px; }
          .stat-number { font-size: 24px; }
          .stat-top { font-size: 10px; }
          .panel-head,.panel-body { padding: 16px; }
          .announcement-row { padding: 15px; gap: 10px; }
          .status { font-size: 8px; padding: 4px 6px; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">⌁</div>
            <div>
              <div className="brand-name">Lost Context</div>
              <div className="brand-sub">COMMUNITY INTELLIGENCE</div>
            </div>
          </div>

          <div className="nav-label">WORKSPACE</div>
          <nav className="nav-list">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`nav-button ${activePage === item.name ? 'active' : ''}`}
                onClick={() => {
                  setActivePage(item.name)
                  setSelected(null)
                  setShowForm(false)
                  setNotice('')
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
                {item.name === 'Clarifications' && unclearCount > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {unclearCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="community-box">
              <div className="community-title">Your community</div>
              <div className="small-muted">
                <span className="online-dot" />
                Local workspace active
              </div>
              <div className="small-muted" style={{ marginTop: 8 }}>
                A clearer picture of what is happening around you.
              </div>
            </div>
            <div className="small-muted" style={{ padding: '18px 8px 0' }}>
              LOST CONTEXT · MVP 0.1
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">
              Workspace&nbsp; / &nbsp;<strong>{selected ? selected.title : activePage}</strong>
            </div>
            <div className="top-actions">
              <span className="small-muted">Local demo</span>
              <div className="avatar">LC</div>
            </div>
          </header>

          <div className="content">
            {selected ? (
              <>
                <div className="heading-row">
                  <div>
                    <button className="text-link" onClick={() => setSelected(null)}>
                      ← Back to announcements
                    </button>
                    <div className="eyebrow" style={{ marginTop: 17 }}>
                      {selected.category} / {selected.location}
                    </div>
                    <h1>{selected.title}</h1>
                    <p className="subtitle">
                      Posted by {selected.author} · {selected.date}
                    </p>
                  </div>
                  <span className={`status ${selected.status === 'Confirmed' ? 'confirmed' : selected.status === 'Needs clarity' ? 'unclear' : selected.status === 'New' ? 'new' : ''}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <h2>Current announcement</h2>
                    <button className="secondary-btn" onClick={() => copySummary(selected)}>
                      Copy summary
                    </button>
                                        <button
                      className="secondary-btn"
                      onClick={() => {
                        setTitle(selected.title)
                        setCategory(selected.category)
                        setLocation(selected.location)
                        setContent(selected.content)
                        setEditingId(selected.id)
                        setSelected(null)
                        setShowForm(true)
                        setNotice('')
                      }}
                    >
                      Edit announcement
                    </button>
                  </div>
                  <div className="panel-body">
                    <div className="detail-content">{selected.content}</div>

                    {selected.previous && (
                      <div className="change-box">
                        <div className="change-label">PREVIOUS VERSION</div>
                        <div className="change-text">{selected.previous}</div>
                        <div className="change-label" style={{ marginTop: 13 }}>
                          WHAT CHANGED?
                        </div>
                        <div className="change-text">
  {selected.previous
  ? describeChanges(selected.previous, selected.content)
  : 'No previous version available.'}
</div>
                      </div>
                    )}

                    <div className="change-box">
                      <div className="change-label">CLARIFICATION QUESTIONS</div>
                      <div className="field" style={{ marginTop: 12 }}>
                        <label htmlFor="question">What needs to be clarified?</label>
                        <textarea
                          id="question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="e.g. Can the exact start time be confirmed?"
                        />
                      </div>
                      <button
                        className="primary-btn"
                        style={{ marginTop: 11 }}
                        onClick={() => submitQuestion(selected.id)}
                      >
                        Add question
                      </button>
                      {(questions[selected.id] || []).map((q, i) => (
                        <div className="question-item" key={i}>? {q}</div>
                      ))}
                    </div>

                    {selected.status === 'Confirmed' ? (
  <div className="change-text" style={{ marginTop: 17 }}>
    ✓ This announcement has been confirmed.
  </div>
) : (
  <button
    className="secondary-btn"
    style={{ marginTop: 17 }}
    onClick={() => markConfirmed(selected.id)}
  >
    Mark as confirmed
  </button>
)}
                      
                    
                  </div>
                </div>
              </>
            ) : showForm ? (
              <>
                <div className="heading-row">
                  <div>
                    <div className="eyebrow">Community workspace</div>
                    <h1>New announcement</h1>
                    <p className="subtitle">Share an update with your neighborhood.</p>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Announcement details</h2></div>
                  <div className="panel-body">
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="title">Announcement title *</label>
                        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend road maintenance" />
                      </div>
                      <div className="field">
                        <label htmlFor="category">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                          <option>Community</option>
                          <option>Utilities</option>
                          <option>Transport</option>
                          <option>Events</option>
                          <option>Safety</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor="location">Location *</label>
                        <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. North Block, Main Road" />
                      </div>
                      <div className="field">
                        <label htmlFor="content">Announcement details *</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What happened? What do residents need to know?" />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                      
<button
  className="primary-btn"
  onClick={editingId === null ? addAnnouncement : updateAnnouncement}
>
  {editingId === null ? 'Publish announcement' : 'Save changes'}
</button>

                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="heading-row">
                  <div>
                    <div className="eyebrow">Community intelligence platform</div>
                    <h1>
                      {activePage === 'Overview' ? 'Your neighborhood, in context.' : activePage}
                    </h1>
                    <p className="subtitle">
                      {activePage === 'Overview'
                        ? 'Understand what changed, what is confirmed, and what still needs answers.'
                        : activePage === 'Announcements'
                          ? 'Explore community updates and open an announcement to inspect its details.'
                          : activePage === 'Changes & History'
                            ? 'Review updated announcements and compare available versions.'
                            : 'Find announcements that still need clear answers.'}
                    </p>
                  </div>
                 <button
  className="primary-btn"
  onClick={() => {
    setEditingId(null)
    setTitle('')
    setCategory('Community')
    setLocation('')
    setContent('')
    setShowForm(true)
    setNotice('')
  }}
>
  + New announcement
</button>
                </div>

                {activePage === 'Overview' && (
                  <div className="stats">
                    <div className="stat-card">
                      <div className="stat-top"><span>Total announcements</span><span className="stat-icon">▤</span></div>
                      <div className="stat-number">{announcements.length}</div>
                      <div className="stat-foot">Across your workspace</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-top"><span>Updated notices</span><span className="stat-icon">⟳</span></div>
                      <div className="stat-number">{updatedCount}</div>
                      <div className="stat-foot">Review what changed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-top"><span>Need clarification</span><span className="stat-icon">?</span></div>
                      <div className="stat-number">{unclearCount}</div>
                      <div className="stat-foot">Questions still open</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-top"><span>Confirmed</span><span className="stat-icon">✓</span></div>
                      <div className="stat-number">{announcements.filter((item) => item.status === 'Confirmed').length}</div>
                      <div className="stat-foot"><span className="good">●</span> Marked as confirmed</div>
                    </div>
                  </div>
                )}

                {activePage === 'Overview' && (
                  <div className="columns">
                    <section className="panel">
                      <div className="panel-head">
                        <h2>Recent announcements</h2>
                        <button className="text-link" onClick={() => setActivePage('Announcements')}>View all →</button>
                      </div>
                      <div className="announcement-list">
                        {announcements.slice(0, 4).map((item) => (
                          <AnnouncementRow key={item.id} item={item} onClick={() => setSelected(item)} />
                        ))}
                      </div>
                    </section>
                    <section className="panel">
                      <div className="panel-head"><h2>Context activity</h2></div>
                      <div className="panel-body">
                        <div className="activity-item">
                          <span className="activity-mark" />
                          <div><div className="activity-title">Workspace is ready for community updates.</div><div className="activity-time">Just now</div></div>
                        </div>
                        <div className="activity-item">
                          <span className="activity-mark" />
                          <div><div className="activity-title">{updatedCount} announcement(s) have an updated status.</div><div className="activity-time">Review version history</div></div>
                        </div>
                        <div className="activity-item">
                          <span className="activity-mark" />
                          <div><div className="activity-title">{unclearCount} announcement(s) need clearer information.</div><div className="activity-time">Clarifications</div></div>
                        </div>
                        <div className="insight-box">
                          <div className="insight-heading">✧ THE LOST CONTEXT IDEA</div>
                          <p>
                            An announcement can change over time. Keep the original
                            wording, show the differences, and ask for clarification
                            instead of guessing what the update means.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activePage !== 'Overview' && (
                  <section className="panel">
                    <div className="panel-head">
                      <h2>
                        {activePage === 'Announcements'
                          ? 'All announcements'
                          : activePage === 'Changes & History'
                            ? 'Announcements with version history'
                            : 'Announcements needing clarity'}
                      </h2>
                      <span className="small-muted">{filtered.length} results</span>
                    </div>
                    <div className="panel-body">
                      <input
                        className="search-box"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search titles, locations and details..."
                        aria-label="Search announcements"
                      />
                    </div>
                    <div className="announcement-list">
                      {filtered
                        .filter((item) =>
                          activePage === 'Changes & History'
                            ? Boolean(item.previous)
                            : activePage === 'Clarifications'
                              ? item.status === 'Needs clarity'
                              : true,
                        )
                        .map((item) => (
                          <AnnouncementRow key={item.id} item={item} onClick={() => setSelected(item)} />
                        ))}
                      {filtered.filter((item) =>
                        activePage === 'Changes & History'
                          ? Boolean(item.previous)
                          : activePage === 'Clarifications'
                            ? item.status === 'Needs clarity'
                            : true,
                      ).length === 0 && (
                        <div className="empty-state">No announcements found here yet.</div>
                      )}
                    </div>
                  </section>
                )}

                {activePage === 'Overview' && (
                  <div className="section-title">
                    <h2>Search your community updates</h2>
                    <input
                      className="search-box"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search announcements by title, category or location..."
                    />
                    {search && (
                      <div className="panel" style={{ marginTop: 12 }}>
                        <div className="announcement-list">
                          {filtered.map((item) => (
                            <AnnouncementRow key={item.id} item={item} onClick={() => setSelected(item)} />
                          ))}
                          {filtered.length === 0 && <div className="empty-state">No matches. Try another search.</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {notice && (
        <button className="notice" onClick={() => setNotice('')} title="Dismiss message">
          {notice} &nbsp; ×
        </button>
      )}
    </div>
  )
}

function AnnouncementRow({
  item,
  onClick,
}: {
  item: Announcement
  onClick: () => void
}) {
  const icon =
    item.category === 'Utilities' ? 'ϟ'
      : item.category === 'Transport' ? '⇄'
        : item.category === 'Events' ? '✳'
          : item.category === 'Safety' ? '◇'
            : '⌂'

  return (
    <div className="announcement-row" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick()
    }}>
      <div className="category-icon">{icon}</div>
      <div className="row-main">
        <div className="row-title">{item.title}</div>
        <div className="row-description">{item.content}</div>
        <div className="row-meta">{item.location} · {item.author} · {item.date}</div>
      </div>
      <span className={`status ${item.status === 'Confirmed' ? 'confirmed' : item.status === 'Needs clarity' ? 'unclear' : item.status === 'New' ? 'new' : ''}`}>
        {item.status}
      </span>
    </div>
  )
}

export default App
