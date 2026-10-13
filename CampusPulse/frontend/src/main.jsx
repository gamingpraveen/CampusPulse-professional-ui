import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, MapPin, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import './styles.css';

const demoEvents = [
  { _id: 'demo-1', title: 'Buildathon 2026', category: 'Hackathon', description: 'Build useful solutions, find teammates, and turn bold ideas into working prototypes.', venue: 'Innovation Lab · Block C', date: '2026-10-24T09:00:00', organizer: 'CampusPulse Tech Club', capacity: 120, seatsLeft: 42 },
  { _id: 'demo-2', title: 'DesignVerse', category: 'Design', description: 'A creative sprint for UI/UX, product thinking, and visual storytelling.', venue: 'Design Studio · Block A', date: '2026-10-28T10:00:00', organizer: 'Design Society', capacity: 80, seatsLeft: 26 },
  { _id: 'demo-3', title: 'AI & Future Forum', category: 'Technology', description: 'Explore practical AI, responsible innovation, and the future of intelligent systems.', venue: 'Main Auditorium', date: '2026-11-02T14:00:00', organizer: 'CSE Association', capacity: 200, seatsLeft: 91 },
  { _id: 'demo-4', title: 'Campus League', category: 'Sports', description: 'Bring your team spirit to a friendly day of games, challenges, and campus fun.', venue: 'University Sports Ground', date: '2026-11-07T08:30:00', organizer: 'Sports Committee', capacity: 160, seatsLeft: 63 },
  { _id: 'demo-5', title: 'Startup Pitch Night', category: 'Entrepreneurship', description: 'Pitch an idea, get feedback from mentors, and meet other student founders.', venue: 'Seminar Hall 2', date: '2026-11-12T16:00:00', organizer: 'E-Cell', capacity: 100, seatsLeft: 18 },
  { _id: 'demo-6', title: 'Code & Coffee', category: 'Community', description: 'A relaxed coding meetup to share projects, learn together, and make new connections.', venue: 'Student Commons', date: '2026-11-16T11:00:00', organizer: 'Developer Community', capacity: 60, seatsLeft: 33 },
];
const categories = ['All events', 'Hackathon', 'Technology', 'Design', 'Sports', 'Entrepreneurship', 'Community'];
const dateLabel = value => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateParts = value => ({ day: new Date(value).toLocaleDateString('en-IN', { day: '2-digit' }), month: new Date(value).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() });

function App() {
  const [events, setEvents] = useState(demoEvents);
  const [category, setCategory] = useState('All events');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('student');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [apiOnline, setApiOnline] = useState(false);
  const [registered, setRegistered] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'Hackathon', description: '', venue: '', date: '', organizer: 'Student Organizer', capacity: 100 });
  const [person, setPerson] = useState({ name: '', email: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/events').then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setEvents(data.length ? data : demoEvents); setApiOnline(true); })
      .catch(() => { setApiOnline(false); });
  }, []);

  const filtered = useMemo(() => events.filter(e => (category === 'All events' || e.category === category) && `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(search.toLowerCase())), [events, category, search]);
  const updateForm = e => setForm({ ...form, [e.target.name]: e.target.value });
  const showNotice = text => { setNotice(text); setTimeout(() => setNotice(''), 3500); };

  async function createEvent(e) {
    e.preventDefault();
    const payload = { ...form, capacity: Number(form.capacity), date: new Date(form.date).toISOString() };
    if (apiOnline) {
      try {
        const response = await fetch('http://localhost:5000/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not create event');
        setEvents(old => [data, ...old]);
      } catch (err) { showNotice(err.message); return; }
    } else {
      setEvents(old => [{ ...payload, _id: `local-${Date.now()}`, seatsLeft: payload.capacity }, ...old]);
      showNotice('Demo event added locally. Connect MongoDB to save it permanently.');
    }
    setModal(null); setForm({ title: '', category: 'Hackathon', description: '', venue: '', date: '', organizer: 'Student Organizer', capacity: 100 });
  }

  async function registerEvent(e) {
    e.preventDefault(); const event = modal.event;
    if (apiOnline && !String(event._id).startsWith('demo-') && !String(event._id).startsWith('local-')) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${event._id}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(person) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Registration failed');
        showNotice(data.message);
      } catch (err) { showNotice(err.message); return; }
    } else { showNotice(`You're on the demo registration list for ${event.title}.`); }
    setRegistered(old => old.includes(event._id) ? old : [...old, event._id]); setModal(null); setPerson({ name: '', email: '' });
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Activity size={22}/></span><span>Campus<span className="brand-accent">Pulse</span><small>YOUR CAMPUS, IN MOTION</small></span></a><nav><button className={view === 'student' ? 'nav-link active' : 'nav-link'} onClick={() => setView('student')}>Discover events</button><button className={view === 'organizer' ? 'nav-link active' : 'nav-link'} onClick={() => setView('organizer')}>Host an event</button></nav><div className="top-actions"><span className="api-status"><i className={apiOnline ? 'status-dot online' : 'status-dot'}></i>{apiOnline ? 'API connected' : 'Demo mode'}</span><button className="avatar" title="Student profile">P</button></div></header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> THE CAMPUS EVENT ECOSYSTEM</div><h1>Good things happen<br/>when <span>campus connects.</span></h1><p>One pulse for every idea, meetup, competition, and unforgettable campus moment.</p><div className="hero-actions"><button className="btn-primary" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>Explore events <ArrowRight size={17}/></button><button className="btn-quiet" onClick={() => setView('organizer')}>I'm an organizer <ChevronRight size={17}/></button></div><div className="hero-proof"><div className="avatar-stack"><span>R</span><span>M</span><span>A</span><span>+</span></div><span><b>Student-powered.</b> Community-approved.</span></div></div><div className="hero-art"><div className="orb orb-one"></div><div className="orb orb-two"></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="pulse-core"><Activity size={52}/><span>CP</span></div><div className="float-card float-card-top"><span className="mini-icon violet"><CalendarDays size={17}/></span><span><b>Events that matter</b><small>Find your next thing</small></span><span className="live-tag">LIVE</span></div><div className="float-card float-card-bottom"><span className="mini-icon green"><Users size={17}/></span><span><b>Community first</b><small>Meet. Build. Belong.</small></span><span className="tiny-avatars"><i></i><i></i><i></i></span></div><div className="art-caption">DISCOVER · CONNECT · CREATE</div></div><div className="hero-grid"></div></section>
      <section className="stats-strip"><div><span className="stat-icon"><CalendarDays size={19}/></span><span><b>{events.length.toString().padStart(2, '0')}</b><small>Upcoming events</small></span></div><div><span className="stat-icon"><Users size={19}/></span><span><b>1,200+</b><small>Student community</small></span></div><div><span className="stat-icon"><Activity size={19}/></span><span><b>One hub</b><small>Every campus moment</small></span></div><div className="stat-note"><span className="pulse-dot"></span> YOUR NEXT EXPERIENCE STARTS HERE</div></section>
      {view === 'organizer' ? <section className="organizer-panel"><div><div className="eyebrow">FOR EVENT ORGANIZERS</div><h2>Make your next event<br/><span>the one everyone talks about.</span></h2><p>Create an event, share it with campus, and bring the right people together.</p><button className="btn-primary" onClick={() => setModal({ type: 'create' })}><Plus size={18}/> Create an event</button></div><div className="organizer-preview"><div className="preview-top"><span>ORGANIZER OVERVIEW</span><span className="preview-chip">THIS SEMESTER</span></div><div className="preview-metric"><span>Published events</span><b>{events.length}</b><small>Across campus categories</small></div><div className="preview-bars"><i style={{height:'40%'}}></i><i style={{height:'64%'}}></i><i style={{height:'48%'}}></i><i style={{height:'82%'}}></i><i style={{height:'60%'}}></i><i style={{height:'100%'}}></i><i style={{height:'72%'}}></i><i style={{height:'88%'}}></i></div><div className="preview-bottom"><span><i className="status-dot online"></i> Event pipeline</span><b>Ready to grow ↗</b></div></div></section> : null}
      <section className="events-section" id="events"><div className="section-heading"><div><div className="eyebrow">WHAT'S HAPPENING</div><h2>Find your <span>next thing.</span></h2><p>From big ideas to good times — there's a place for you.</p></div><button className="text-action" onClick={() => setView('organizer')}>Host an event <ArrowRight size={16}/></button></div>
        <div className="event-tools"><div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? 'category-tab selected' : 'category-tab'} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."/><kbd>⌘ K</kbd></label></div>
        <div className="event-grid">{filtered.map((event, i) => { const dp = dateParts(event.date); const already = registered.includes(event._id); return <article className="event-card" key={event._id}><div className={`event-visual visual-${i % 6}`}><span className="event-category">{event.category}</span><div className="visual-symbol">{event.category === 'Hackathon' ? '⌘' : event.category === 'Design' ? '◈' : event.category === 'Sports' ? '✳' : event.category === 'Entrepreneurship' ? '↗' : event.category === 'Community' ? '◎' : '✧'}</div><div className="date-badge"><b>{dp.day}</b><span>{dp.month}</span></div><span className="visual-index">CP / 0{i + 1}</span></div><div className="event-content"><div className="event-meta"><span><CalendarDays size={14}/>{dateLabel(event.date)}</span><span><Clock3 size={14}/>{new Date(event.date).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</span></div><h3>{event.title}</h3><p>{event.description}</p><div className="event-location"><MapPin size={15}/><span>{event.venue}</span></div><div className="event-footer"><div className="seats"><span className="seat-track"><i style={{width: `${Math.min(100, Math.max(0, 100 - (event.seatsLeft ?? event.capacity ?? 100) / (event.capacity || 100) * 100))}%`}}></i></span><small>{event.seatsLeft ?? event.capacity ?? '—'} seats left</small></div><button className={already ? 'register-btn registered' : 'register-btn'} onClick={() => { setModal({ type: 'register', event }); }} aria-label={`Register for ${event.title}`}>{already ? <CheckCircle2 size={17}/> : <ArrowRight size={18}/>}</button></div></div></article>; })}</div>
        {filtered.length === 0 && <div className="empty-state"><Search size={28}/><h3>No events found</h3><p>Try a different search or category.</p><button className="btn-quiet" onClick={() => { setSearch(''); setCategory('All events'); }}>Clear filters</button></div>}
        <div className="events-bottom"><span>SHOWING <b>{filtered.length}</b> OF <b>{events.length}</b> EVENTS</span><span>MORE EXPERIENCES. MORE CONNECTIONS. <span className="brand-accent">MORE PULSE.</span></span></div>
      </section>
      <section className="cta-banner"><div className="cta-glow"></div><div><div className="eyebrow">HAVE AN IDEA?</div><h2>Your event deserves<br/>a bigger <span>audience.</span></h2><p>Bring your campus community together. Start with CampusPulse.</p></div><button className="btn-light" onClick={() => { setView('organizer'); window.scrollTo({top:0,behavior:'smooth'}); }}>Start hosting <ArrowRight size={17}/></button></section>
    </main><footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Activity size={20}/></span><span>Campus<span className="brand-accent">Pulse</span><small>YOUR CAMPUS, IN MOTION</small></span></a><span>Built for campus communities, powered by student ideas.</span><span>© 2026 CampusPulse</span></footer>
    {notice && <div className="toast"><CheckCircle2 size={18}/>{notice}<button onClick={() => setNotice('')}><X size={16}/></button></div>}
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><div className="modal"><div className="modal-heading"><div><div className="eyebrow">{modal.type === 'create' ? 'HOST SOMETHING GREAT' : 'SAVE YOUR SPOT'}</div><h2>{modal.type === 'create' ? 'Create an event' : 'Join the experience.'}</h2></div><button className="modal-close" onClick={() => setModal(null)}><X size={19}/></button></div>{modal.type === 'create' ? <form onSubmit={createEvent} className="modal-form"><label>Event title<input required name="title" value={form.title} onChange={updateForm} placeholder="e.g. Campus Hackathon"/></label><div className="form-row"><label>Category<select name="category" value={form.category} onChange={updateForm}>{categories.filter(c => c !== 'All events').map(c => <option key={c}>{c}</option>)}</select></label><label>Capacity<input required type="number" min="1" name="capacity" value={form.capacity} onChange={updateForm}/></label></div><label>Description<textarea name="description" value={form.description} onChange={updateForm} placeholder="What should students know?" rows="3"/></label><label>Venue<input required name="venue" value={form.venue} onChange={updateForm} placeholder="Building / room / campus location"/></label><label>Date and time<input required type="datetime-local" name="date" value={form.date} onChange={updateForm} min={new Date().toISOString().slice(0,16)}/></label><button className="btn-primary submit-btn" type="submit">Create event <ArrowRight size={17}/></button></form> : <><div className="register-event-summary"><span className="event-category">{modal.event.category}</span><h3>{modal.event.title}</h3><p><CalendarDays size={15}/>{dateLabel(modal.event.date)} <span>·</span><MapPin size={15}/>{modal.event.venue}</p></div><form onSubmit={registerEvent} className="modal-form"><label>Your full name<input required value={person.name} onChange={e => setPerson({...person,name:e.target.value})} placeholder="Enter your name"/></label><label>College email<input required type="email" value={person.email} onChange={e => setPerson({...person,email:e.target.value})} placeholder="you@college.edu"/></label><button className="btn-primary submit-btn" type="submit">Confirm registration <ArrowRight size={17}/></button><small className="form-note">Demo note: connect authentication before using this for real student data.</small></form></>}</div></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
