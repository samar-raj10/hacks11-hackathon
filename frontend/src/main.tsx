import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Role = 'STUDENT' | 'HEALTH_ADMIN' | 'FACILITY_MANAGER' | 'SYSTEM_ADMIN' | 'PUBLIC_HEALTH_VIEWER';
type User = { id: string; name: string; email: string; role: Role; studentId?: string; hostel?: string; block?: string; room?: string };
type Session = { token: string; user: User };

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const roleHome: Record<Role, string> = {
  STUDENT: '/student/dashboard',
  HEALTH_ADMIN: '/health-admin/dashboard',
  FACILITY_MANAGER: '/facility/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
  PUBLIC_HEALTH_VIEWER: '/public-health/dashboard',
};

function getRoute() { return window.location.pathname; }
function navigate(path: string) { window.history.pushState({}, '', path); window.dispatchEvent(new Event('campusshield:navigate')); }
function loadSession(): Session | null { try { return JSON.parse(localStorage.getItem('campusshield.session') ?? 'null'); } catch { return null; } }
function saveSession(session: Session | null) { if (session) localStorage.setItem('campusshield.session', JSON.stringify(session)); else localStorage.removeItem('campusshield.session'); }

async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

function Landing({ session }: { session: Session | null }) {
  const destination = session ? roleHome[session.user.role] : '/login';
  return (
    <main className="cs-app-shell">
      <header className="cs-topbar" aria-label="CampusShield primary navigation">
        <div className="cs-brand"><span className="cs-brand__mark">CS</span><span>CAMPUSSHIELD</span></div>
        <nav className="cs-nav"><a href="#how">How It Works</a><a href="#features">Features</a><a href="#students">For Students</a><a href="#health">For Health Teams</a><a href="#about">About</a></nav>
        <div className="cs-nav-actions">
          {session ? <button className="cs-button cs-button--primary" onClick={() => navigate(destination)}>Go to dashboard</button> : <><button className="cs-button cs-button--ghost" onClick={() => navigate('/login')}>Login</button><button className="cs-button cs-button--primary" onClick={() => navigate('/register')}>Register</button></>}
        </div>
      </header>
      <section className="cs-hero">
        <div className="cs-container cs-hero__grid">
          <div>
            <p className="cs-badge">Explainable campus outbreak intelligence</p>
            <h1 className="cs-title">CAMPUS SHIELD</h1>
            <p className="cs-subtitle">Detect the cluster. Find the source. Stop the spread.</p>
            <p className="cs-subtitle">Role-based surveillance for students, health teams, facility managers, system administrators, and public-health viewers with privacy-preserving data access.</p>
            <div className="cs-actions"><button className="cs-button cs-button--primary" onClick={() => navigate(session ? destination : '/register')}>{session ? 'Go to dashboard' : 'Register'}</button><button className="cs-button cs-button--ghost" onClick={() => navigate('/login')}>Login</button></div>
            <div className="cs-feature-grid" id="features">
              {['Explainable outbreak radar', 'Student-first reporting', 'Real-time surveillance', 'Exposure/source attribution', 'Backend-enforced RBAC', 'Privacy-first advisories'].map((title) => <article className="cs-card cs-feature-card" key={title}><span className="cs-feature-card__icon">✓</span><h3>{title}</h3><p>Connected workflows use authenticated APIs and stored records instead of frontend-only mock state.</p></article>)}
            </div>
          </div>
          <aside className="cs-card cs-dashboard-card" id="how"><div className="cs-card-header"><h2 className="cs-card-title">FULL-STACK FLOW</h2><span className="cs-risk-pill cs-risk-pill--watch">LIVE DATA</span></div><ol className="cs-flow"><li>React form submits to Express API</li><li>JWT + role middleware authorizes the action</li><li>MongoDB stores reports, advisories, notifications, and audit logs</li><li>Backend calls Python analytics with service secret</li><li>Dashboards read protected aggregate data</li></ol></aside>
        </div>
      </section>
    </main>
  );
}

function AuthPage({ mode, onAuth }: { mode: 'login' | 'register'; onAuth: (session: Session) => void }) {
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const session = await api<Session>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      saveSession(session); onAuth(session); navigate(roleHome[session.user.role]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed'); } finally { setLoading(false); }
  }
  return <main className="cs-page"><section className="cs-auth-card cs-card"><button className="cs-link-button" onClick={() => navigate('/')}>← Back to home</button><h1>{mode === 'login' ? 'Login to CampusShield' : 'Register as a Student'}</h1><p>{mode === 'login' ? 'Use your registered email and password. Your role determines your dashboard.' : 'Public registration creates a STUDENT account. Administrative accounts must be created by a system admin.'}</p>{error && <div className="cs-alert cs-alert--error">{error}</div>}<form className="cs-form" onSubmit={submit}><label>Name<input name="name" required={mode === 'register'} hidden={mode === 'login'} /></label><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label>{mode === 'register' && <><label>Student ID<input name="studentId" required /></label><div className="cs-form-grid"><label>Hostel<input name="hostel" required /></label><label>Block<input name="block" required /></label></div><div className="cs-form-grid"><label>Room<input name="room" /></label><label>Contact<input name="contactNumber" /></label></div></>}<button className="cs-button cs-button--primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create student account'}</button></form><p className="cs-muted">{mode === 'login' ? 'Need an account?' : 'Already registered?'} <button className="cs-link-button" onClick={() => navigate(mode === 'login' ? '/register' : '/login')}>{mode === 'login' ? 'Register' : 'Login'}</button></p></section></main>;
}

function Protected({ session, roles, children }: { session: Session | null; roles: Role[]; children: React.ReactNode }) {
  if (!session) return <AuthGate message="Please login to continue." />;
  if (!roles.includes(session.user.role)) return <AuthGate message="Your role is not authorized for this dashboard." />;
  return <>{children}</>;
}
function AuthGate({ message }: { message: string }) { return <main className="cs-page"><section className="cs-card cs-auth-card"><h1>Access controlled</h1><p>{message}</p><div className="cs-actions"><button className="cs-button cs-button--primary" onClick={() => navigate('/login')}>Login</button><button className="cs-button cs-button--ghost" onClick={() => navigate('/')}>Home</button></div></section></main>; }

function AppLayout({ session, onLogout, children }: { session: Session; onLogout: () => void; children: React.ReactNode }) { return <main className="cs-layout"><aside className="cs-sidebar"><div className="cs-brand"><span className="cs-brand__mark">CS</span><span>CAMPUSSHIELD</span></div><p className="cs-muted">{session.user.role.replaceAll('_', ' ')}</p><nav className="cs-side-nav"><button onClick={() => navigate(roleHome[session.user.role])}>Dashboard</button>{session.user.role === 'STUDENT' && <><button onClick={() => navigate('/student/report')}>Report symptoms</button><button onClick={() => navigate('/student/history')}>History</button><button onClick={() => navigate('/student/advisories')}>Advisories</button></>} {['HEALTH_ADMIN','SYSTEM_ADMIN'].includes(session.user.role) && <><button onClick={() => navigate('/health-admin/dashboard')}>Health dashboard</button><button onClick={() => navigate('/health-admin/cases')}>Cases</button><button onClick={() => navigate('/health-admin/advisories')}>Advisories</button></>}</nav><button className="cs-button cs-button--ghost" onClick={onLogout}>Logout</button></aside><section className="cs-content">{children}</section></main>; }

function StudentDashboard({ session }: { session: Session }) { const { data, error, loading } = useApi<any>('/dashboard/student', session.token); return <DashboardState loading={loading} error={error}><PageHeader title={`Welcome, ${session.user.name}`} subtitle="Personal health reporting and campus advisories." /><KpiGrid items={[['Campus risk', data?.campusRisk ?? '—'], ['Active cases', data?.activeCases ?? '—'], ['Your reports', data?.myReports?.length ?? 0], ['Advisories', data?.advisories?.length ?? 0]]} /><div className="cs-actions"><button className="cs-button cs-button--primary" onClick={() => navigate('/student/report')}>Report symptoms</button><button className="cs-button cs-button--ghost" onClick={() => navigate('/student/history')}>View history</button></div></DashboardState>; }

function ReportForm({ session }: { session: Session }) { const [message, setMessage] = useState(''); const [error, setError] = useState(''); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setMessage(''); setError(''); const form = new FormData(e.currentTarget); const symptoms = form.getAll('symptoms').map(String); const body = { symptoms, severity: form.get('severity'), onsetAt: new Date(`${form.get('date')}T${form.get('time')}`).toISOString(), hostel: form.get('hostel'), block: form.get('block'), exposure: { meal: form.get('meal'), mess: form.get('mess'), foodItems: String(form.get('foodItems') ?? '').split(',').map((x) => x.trim()).filter(Boolean), waterSource: form.get('waterSource'), events: [], places: [], notes: form.get('notes') } }; try { await api('/reports', { method: 'POST', body: JSON.stringify(body) }, session.token); setMessage('Report submitted successfully.'); (e.currentTarget as HTMLFormElement).reset(); } catch (err) { setError(err instanceof Error ? err.message : 'Report failed'); } }
return <><PageHeader title="Report Symptoms" subtitle="Fast student reporting with exposure context." />{message && <div className="cs-alert cs-alert--success">{message}</div>}{error && <div className="cs-alert cs-alert--error">{error}</div>}<form className="cs-card cs-form cs-wide-form" onSubmit={submit}><fieldset><legend>Symptoms</legend><div className="cs-chip-grid">{['Diarrhea','Vomiting','Nausea','Abdominal pain','Fever','Headache','Weakness','Other'].map(s => <label className="cs-chip" key={s}><input type="checkbox" name="symptoms" value={s}/>{s}</label>)}</div></fieldset><div className="cs-form-grid"><label>Severity<select name="severity" required><option>Mild</option><option>Moderate</option><option>Severe</option></select></label><label>Date<input name="date" type="date" required /></label><label>Approx time<input name="time" type="time" required /></label></div><div className="cs-form-grid"><label>Hostel<input name="hostel" defaultValue={session.user.hostel ?? ''} required /></label><label>Block<input name="block" defaultValue={session.user.block ?? ''} required /></label><label>Meal<select name="meal"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option><option>None</option><option>Not sure</option></select></label></div><div className="cs-form-grid"><label>Mess<input name="mess" placeholder="Mess A" /></label><label>Water source<input name="waterSource" placeholder="Water Tank 1" /></label><label>Food items<input name="foodItems" placeholder="Rice, dal, paneer" /></label></div><label>Notes<textarea name="notes" rows={4} /></label><button className="cs-button cs-button--primary">Submit report</button></form></>; }

function History({ session }: { session: Session }) { const { data, error, loading } = useApi<any>('/reports/my', session.token); return <DashboardState loading={loading} error={error}><PageHeader title="Report History" subtitle="Your submitted reports and review status." /><DataTable rows={(data?.reports ?? []).map((r: any) => [new Date(r.createdAt).toLocaleString(), r.symptoms.join(', '), r.severity, r.status])} headers={['Date', 'Symptoms', 'Severity', 'Status']} /></DashboardState>; }
function Advisories({ session }: { session: Session }) { const { data, error, loading } = useApi<any>('/advisories', session.token); return <DashboardState loading={loading} error={error}><PageHeader title="Advisories" subtitle="Targeted health advisories for your role." />{(data?.advisories ?? []).length ? data.advisories.map((a: any) => <article className="cs-card cs-list-card" key={a._id}><span className="cs-risk-pill cs-risk-pill--watch">{a.severity}</span><h3>{a.title}</h3><p>{a.message}</p></article>) : <EmptyState message="No active advisories." />}</DashboardState>; }
function HealthAdminDashboard({ session }: { session: Session }) { const { data, error, loading } = useApi<any>('/dashboard/health-admin', session.token); return <DashboardState loading={loading} error={error}><PageHeader title="Health Admin Dashboard" subtitle="Backend-protected surveillance data from MongoDB." /><KpiGrid items={[['Total cases', data?.totalCases ?? '—'], ['Active cases', data?.activeCases ?? '—'], ['Active clusters', data?.activeClusters ?? '—'], ['Campus risk', data?.campusRisk ?? '—']]} /><DataTable headers={['Time','Hostel','Block','Severity','Symptoms']} rows={(data?.recent ?? []).map((r: any) => [new Date(r.createdAt).toLocaleString(), r.hostel, r.block, r.severity, r.symptoms.join(', ')])} /></DashboardState>; }
function SimpleRoleDashboard({ title, session, endpoint }: { title: string; session: Session; endpoint: string }) { const { data, error, loading } = useApi<any>(endpoint, session.token); return <DashboardState loading={loading} error={error}><PageHeader title={title} subtitle="Role-protected backend endpoint." /><pre className="cs-card cs-json">{JSON.stringify(data, null, 2)}</pre></DashboardState>; }
function CreateAdvisory({ session }: { session: Session }) { const [message, setMessage] = useState(''); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); const body = { title: form.get('title'), message: form.get('message'), severity: form.get('severity'), targetRoles: ['STUDENT'] }; const result = await api<any>('/advisories', { method:'POST', body: JSON.stringify(body)}, session.token); setMessage(`Advisory stored and ${result.targetedUsers} in-app notifications created.`); } return <><PageHeader title="Create Advisory" subtitle="Creates advisory records and in-app notifications." />{message && <div className="cs-alert cs-alert--success">{message}</div>}<form className="cs-card cs-form" onSubmit={submit}><label>Title<input name="title" required /></label><label>Severity<select name="severity"><option>INFO</option><option>WATCH</option><option>SUSPICIOUS</option><option>HIGH_RISK</option></select></label><label>Message<textarea name="message" required rows={5}/></label><button className="cs-button cs-button--primary">Create advisory</button></form></>; }

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) { return <header className="cs-page-header"><h1>{title}</h1><p>{subtitle}</p></header>; }
function KpiGrid({ items }: { items: [string, any][] }) { return <div className="cs-kpi-grid cs-kpi-grid--wide">{items.map(([k, v]) => <div className="cs-kpi" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>; }
function EmptyState({ message }: { message: string }) { return <div className="cs-card cs-empty">{message}</div>; }
function DashboardState({ loading, error, children }: { loading: boolean; error: string; children: React.ReactNode }) { if (loading) return <div className="cs-card cs-empty">Loading…</div>; if (error) return <div className="cs-alert cs-alert--error">{error}</div>; return <>{children}</>; }
function DataTable({ headers, rows }: { headers: string[]; rows: any[][] }) { return rows.length ? <div className="cs-table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div> : <EmptyState message="No records yet." />; }
function useApi<T>(path: string, token: string) { const [data, setData] = useState<T | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); useEffect(() => { let active = true; api<T>(path, {}, token).then(d => active && setData(d)).catch(e => active && setError(e.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [path, token]); return { data, error, loading }; }

function App() {
  const [route, setRoute] = useState(getRoute()); const [session, setSession] = useState<Session | null>(loadSession());
  useEffect(() => { const onNav = () => setRoute(getRoute()); window.addEventListener('popstate', onNav); window.addEventListener('campusshield:navigate', onNav); return () => { window.removeEventListener('popstate', onNav); window.removeEventListener('campusshield:navigate', onNav); }; }, []);
  const logout = () => { saveSession(null); setSession(null); navigate('/'); };
  const page = useMemo(() => {
    if (route === '/') return <Landing session={session} />;
    if (route === '/login') return <AuthPage mode="login" onAuth={setSession} />;
    if (route === '/register') return <AuthPage mode="register" onAuth={setSession} />;
    if (route.startsWith('/student')) return <Protected session={session} roles={['STUDENT']}><AppLayout session={session!} onLogout={logout}>{route === '/student/report' ? <ReportForm session={session!}/> : route === '/student/history' ? <History session={session!}/> : route === '/student/advisories' ? <Advisories session={session!}/> : <StudentDashboard session={session!}/>}</AppLayout></Protected>;
    if (route.startsWith('/health-admin')) return <Protected session={session} roles={['HEALTH_ADMIN','SYSTEM_ADMIN']}><AppLayout session={session!} onLogout={logout}>{route === '/health-admin/advisories' ? <CreateAdvisory session={session!}/> : <HealthAdminDashboard session={session!}/>}</AppLayout></Protected>;
    if (route.startsWith('/facility')) return <Protected session={session} roles={['FACILITY_MANAGER','SYSTEM_ADMIN']}><AppLayout session={session!} onLogout={logout}><SimpleRoleDashboard title="Facility Dashboard" session={session!} endpoint="/dashboard/facility" /></AppLayout></Protected>;
    if (route.startsWith('/system-admin')) return <Protected session={session} roles={['SYSTEM_ADMIN']}><AppLayout session={session!} onLogout={logout}><SimpleRoleDashboard title="System Admin Dashboard" session={session!} endpoint="/dashboard/system-admin" /></AppLayout></Protected>;
    if (route.startsWith('/public-health')) return <Protected session={session} roles={['PUBLIC_HEALTH_VIEWER','SYSTEM_ADMIN']}><AppLayout session={session!} onLogout={logout}><SimpleRoleDashboard title="Public Health Dashboard" session={session!} endpoint="/dashboard/public-health" /></AppLayout></Protected>;
    return <AuthGate message="Page not found." />;
  }, [route, session]);
  return page;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
