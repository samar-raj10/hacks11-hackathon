import React from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { getDashboard, getReports, submitReport } from './lib/api';
import type { UserRole } from './types';

const rolePaths: Record<UserRole, string> = {
  STUDENT: '/student/dashboard',
  HEALTH_ADMIN: '/health-admin/dashboard',
  FACILITY_MANAGER: '/facility/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
  PUBLIC_HEALTH_VIEWER: '/public-health/dashboard',
};

const roleNavItems: Record<UserRole, Array<{ label: string; to: string }>> = {
  STUDENT: [
    { label: 'Dashboard', to: '/student/dashboard' },
    { label: 'Report Symptoms', to: '/student/report' },
    { label: 'History', to: '/student/history' },
    { label: 'Advisories', to: '/student/advisories' },
    { label: 'Profile', to: '/student/profile' },
  ],
  HEALTH_ADMIN: [
    { label: 'Dashboard', to: '/health-admin/dashboard' },
    { label: 'Radar', to: '/health-admin/radar' },
    { label: 'Cases', to: '/health-admin/cases' },
    { label: 'Clusters', to: '/health-admin/clusters' },
    { label: 'Exposures', to: '/health-admin/exposures' },
    { label: 'Sources', to: '/health-admin/sources' },
    { label: 'Analytics', to: '/health-admin/analytics' },
    { label: 'Advisories', to: '/health-admin/advisories' },
  ],
  FACILITY_MANAGER: [
    { label: 'Dashboard', to: '/facility/dashboard' },
    { label: 'Alerts', to: '/facility/dashboard' },
    { label: 'Facilities', to: '/facility/dashboard' },
    { label: 'Actions', to: '/facility/dashboard' },
  ],
  SYSTEM_ADMIN: [
    { label: 'Dashboard', to: '/system-admin/dashboard' },
    { label: 'Users', to: '/system-admin/dashboard' },
    { label: 'Infrastructure', to: '/system-admin/dashboard' },
    { label: 'Configuration', to: '/system-admin/dashboard' },
    { label: 'Audit Logs', to: '/system-admin/dashboard' },
  ],
  PUBLIC_HEALTH_VIEWER: [
    { label: 'Dashboard', to: '/public-health/dashboard' },
    { label: 'Surveillance', to: '/public-health/dashboard' },
    { label: 'Trends', to: '/public-health/dashboard' },
    { label: 'Reports', to: '/public-health/dashboard' },
  ],
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems =
    isAuthenticated && user
      ? [
          ...roleNavItems[user.role],
          { label: 'Logout', to: '#' },
        ]
      : [
          { label: 'Home', to: '/' },
          { label: 'How It Works', to: '#how-it-works' },
          { label: 'Features', to: '#features' },
          { label: 'Login', to: '/login' },
          { label: 'Register', to: '/register' },
        ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-cyan-300">
            CAMPUSSHIELD
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            {navItems.map((item) =>
              item.label === 'Logout' ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="rounded-full border border-cyan-400/50 px-3 py-1.5 text-cyan-200 transition hover:bg-cyan-500/10"
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `transition ${isActive || location.pathname === item.to ? 'text-cyan-300' : 'hover:text-cyan-200'}`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-6 inline-flex w-fit rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
          DEMO MODE • Phase 1 scaffold
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-50 md:text-7xl">CAMPUSSHIELD</h1>
        <p className="mt-4 max-w-2xl text-xl text-cyan-100">Detect the cluster. Find the source. Stop the spread.</p>

        <div className="mt-8 flex flex-wrap gap-4">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="rounded-full border border-cyan-400/50 bg-slate-900 px-6 py-3 font-medium text-cyan-200 transition hover:bg-slate-800"
              >
                REGISTER
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate(rolePaths[user!.role])}
              className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Go to Dashboard
            </button>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {['Explainable outbreak radar', 'Student-first reporting', 'Python analytics service'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-3xl font-bold text-white">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['1. Report', 'Students submit symptoms and exposures quickly through a secure form.'],
            ['2. Detect', 'Health teams review clusters, risks, and source patterns in one place.'],
            ['3. Respond', 'Administrators act on advisories, alerts, and facility actions.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <h3 className="mb-3 text-xl font-semibold text-cyan-300">{title}</h3>
              <p className="text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 text-3xl font-bold text-white">Features</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            'Real student reporting and exposures',
            'Role-specific dashboards',
            'Health admin outbreak radar',
            'Facility action tracking and alerts',
            'System admin management and audit controls',
            'Analytics-ready data collection pipeline',
          ].map((feature) => (
            <div key={feature} className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 text-slate-200">
              {feature}
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function AuthForm({
  title,
  submitLabel,
  onSubmit,
  children,
}: {
  title: string;
  submitLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
          <h2 className="mb-6 text-3xl font-bold text-white">{title}</h2>
          <form className="space-y-5" onSubmit={onSubmit}>
            {children}
            <button type="submit" className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = React.useState('student@campusshield.local');
  const [password, setPassword] = React.useState('Student@123');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (user) navigate(rolePaths[user.role], { replace: true });
  }, [user, navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      const nextUser = JSON.parse(localStorage.getItem('campusshield_user') ?? 'null') as { role?: UserRole } | null;
      navigate(nextUser?.role ? rolePaths[nextUser.role] : '/student/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm title="Login" submitLabel={loading ? 'Signing in...' : 'LOGIN'} onSubmit={onSubmit}>
      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      <div>
        <label className="mb-2 block text-sm text-slate-300">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
          type="email"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
          type="password"
          required
        />
      </div>
      <div className="text-sm text-slate-400">
        Demo accounts: student@campusshield.local / Student@123, admin@campusshield.local / Admin@123
      </div>
    </AuthForm>
  );
}

function RegisterPage() {
  const { register: createAccount, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    hostel: '',
    block: '',
    mess: '',
    waterSource: '',
    meal: '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate(rolePaths[user.role], { replace: true });
  }, [user, navigate]);

  const handleChange = (field: string, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createAccount(form);
      const nextUser = JSON.parse(localStorage.getItem('campusshield_user') ?? 'null') as { role?: UserRole } | null;
      navigate(nextUser?.role ? rolePaths[nextUser.role] : '/student/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm title="Register" submitLabel={loading ? 'Creating account...' : 'REGISTER'} onSubmit={onSubmit}>
      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">Full name</label>
          <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input value={form.email} onChange={(event) => handleChange('email', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="email" required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input value={form.password} onChange={(event) => handleChange('password', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="password" required />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Phone</label>
          <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="tel" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Hostel</label>
          <input value={form.hostel} onChange={(event) => handleChange('hostel', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Block</label>
          <input value={form.block} onChange={(event) => handleChange('block', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Mess</label>
          <input value={form.mess} onChange={(event) => handleChange('mess', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Water source</label>
          <input value={form.waterSource} onChange={(event) => handleChange('waterSource', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">Meal preference</label>
          <input value={form.meal} onChange={(event) => handleChange('meal', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" type="text" />
        </div>
      </div>
    </AuthForm>
  );
}

function DashboardShell({
  title,
  subtitle,
  cards,
  children,
}: {
  title: string;
  subtitle: string;
  cards: Array<{ label: string; value: string; tone?: string }>;
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">CampusShield</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-slate-300">{subtitle}</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <div className="text-sm text-slate-400">{card.label}</div>
              <div className={`mt-3 text-3xl font-bold ${card.tone ?? 'text-cyan-300'}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">{children}</div>
      </div>
    </AppLayout>
  );
}

function StudentDashboardPage() {
  const { user, token } = useAuth();
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const response = await getDashboard('student', token);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
      }
    }
    loadData();
  }, [token]);

  return (
    <DashboardShell
      title="Student Dashboard"
      subtitle="Health status overview and reporting tools"
      cards={[
        { label: 'Campus status', value: data?.overview?.campusHealth ?? 'Stable', tone: 'text-emerald-300' },
        { label: 'Open reports', value: String(data?.overview?.openReports ?? 0) },
        { label: 'Advisories', value: String(data?.overview?.advisories ?? 0) },
        { label: 'Profile', value: user?.hostel ? user.hostel : 'Not set' },
      ]}
    >
      <div className="space-y-6">
        {error ? <div className="text-red-300">{error}</div> : null}
        <div className="flex flex-wrap gap-3">
          <Link to="/student/report" className="rounded-full bg-cyan-500 px-4 py-2 font-medium text-slate-950">Report Symptoms</Link>
          <Link to="/student/history" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Report History</Link>
          <Link to="/student/advisories" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Advisories</Link>
          <Link to="/student/profile" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Profile</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
            <h3 className="mb-3 text-lg font-semibold text-white">Current campus health status</h3>
            <p className="text-slate-300">{data?.overview?.campusHealth ?? 'No data available'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
            <h3 className="mb-3 text-lg font-semibold text-white">Notifications</h3>
            <p className="text-slate-300">{data?.notifications?.[0]?.title ?? 'No data available'}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StudentReportPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<{
    symptoms: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    onsetDateTime: string;
    hostel: string;
    block: string;
    meal: string;
    mess: string;
    waterSource: string;
    otherExposureInfo: string;
  }>({
    symptoms: '',
    severity: 'MODERATE',
    onsetDateTime: new Date().toISOString().slice(0, 16),
    hostel: user?.hostel ?? '',
    block: user?.block ?? '',
    meal: user?.meal ?? '',
    mess: user?.mess ?? '',
    waterSource: user?.waterSource ?? '',
    otherExposureInfo: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setMessage('');

    try {
      const result = await submitReport(
        {
          ...form,
          severity: form.severity,
          onsetDateTime: new Date(form.onsetDateTime).toISOString(),
        },
        token,
      );
      setMessage(result.message ?? 'Report submitted successfully.');
      setTimeout(() => navigate('/student/history'), 800);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-white">Report Symptoms</h1>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-slate-900 p-6">
          {message ? <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-200">{message}</div> : null}

          <div>
            <label className="mb-2 block text-sm text-slate-300">Symptoms</label>
            <textarea value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Severity</label>
              <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as any })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Onset date and time</label>
              <input value={form.onsetDateTime} onChange={(event) => setForm({ ...form, onsetDateTime: event.target.value })} type="datetime-local" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Hostel</label>
              <input value={form.hostel} onChange={(event) => setForm({ ...form, hostel: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Block</label>
              <input value={form.block} onChange={(event) => setForm({ ...form, block: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Meal</label>
              <input value={form.meal} onChange={(event) => setForm({ ...form, meal: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Mess</label>
              <input value={form.mess} onChange={(event) => setForm({ ...form, mess: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Water source if known</label>
            <input value={form.waterSource} onChange={(event) => setForm({ ...form, waterSource: event.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Other exposure information</label>
            <textarea value={form.otherExposureInfo} onChange={(event) => setForm({ ...form, otherExposureInfo: event.target.value })} className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
          </div>

          <button type="submit" disabled={loading} className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

function StudentHistoryPage() {
  const { token } = useAuth();
  const [reports, setReports] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const response = await getReports(token);
        setReports(response.reports ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load report history.');
      }
    }
    load();
  }, [token]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Report History</h1>
        {error ? <div className="text-red-300">{error}</div> : null}
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-300">No data available</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id ?? report.createdAt} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{report.severity}</div>
                  <div className="text-sm text-slate-400">{new Date(report.createdAt).toLocaleString()}</div>
                </div>
                <p className="mt-3 text-slate-300">{report.symptoms}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                  {report.hostel ? <span>Hostel: {report.hostel}</span> : null}
                  {report.block ? <span>Block: {report.block}</span> : null}
                  {report.mess ? <span>Mess: {report.mess}</span> : null}
                  {report.waterSource ? <span>Water: {report.waterSource}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StudentAdvisoriesPage() {
  const { token } = useAuth();
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const response = await getDashboard('student', token);
        setData(response);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [token]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Advisories</h1>
        {(data?.advisories?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-300">No data available</div>
        ) : (
          <div className="space-y-4">
            {(data?.advisories ?? []).map((item: any, index: number) => (
              <div key={item.id ?? index} className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-5 text-slate-200">
                {item.title ?? 'Health Advisory'}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Profile</h1>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div><div className="text-sm text-slate-400">Name</div><div className="text-lg text-white">{user?.name ?? 'Not available'}</div></div>
            <div><div className="text-sm text-slate-400">Role</div><div className="text-lg text-white">{user?.role ?? 'STUDENT'}</div></div>
            <div><div className="text-sm text-slate-400">Email</div><div className="text-lg text-white">{user?.email ?? 'Not available'}</div></div>
            <div><div className="text-sm text-slate-400">Phone</div><div className="text-lg text-white">{user?.phone ?? 'Not provided'}</div></div>
            <div><div className="text-sm text-slate-400">Hostel</div><div className="text-lg text-white">{user?.hostel ?? 'Not provided'}</div></div>
            <div><div className="text-sm text-slate-400">Block</div><div className="text-lg text-white">{user?.block ?? 'Not provided'}</div></div>
            <div><div className="text-sm text-slate-400">Mess</div><div className="text-lg text-white">{user?.mess ?? 'Not provided'}</div></div>
            <div><div className="text-sm text-slate-400">Water Source</div><div className="text-lg text-white">{user?.waterSource ?? 'Not provided'}</div></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function HealthAdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const response = await getDashboard('health-admin', token);
        setData(response);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [token]);

  return (
    <DashboardShell
      title="Health Admin Dashboard"
      subtitle="Campus outbreak monitoring and source review"
      cards={[
        { label: 'Total cases', value: String(data?.overview?.totalCases ?? 0), tone: 'text-cyan-300' },
        { label: 'Active cases', value: String(data?.overview?.activeCases ?? 0), tone: 'text-amber-300' },
        { label: 'Active clusters', value: String(data?.overview?.activeClusters ?? 0), tone: 'text-rose-300' },
        { label: 'Campus risk', value: String(data?.overview?.campusRisk ?? 'LOW'), tone: 'text-emerald-300' },
      ]}
    >
      <div className="space-y-5 text-slate-300">
        <div className="flex flex-wrap gap-3">
          <Link to="/health-admin/radar" className="rounded-full bg-cyan-500 px-4 py-2 font-medium text-slate-950">Outbreak Radar</Link>
          <Link to="/health-admin/cases" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Cases</Link>
          <Link to="/health-admin/clusters" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Clusters</Link>
          <Link to="/health-admin/exposures" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Exposures</Link>
          <Link to="/health-admin/sources" className="rounded-full border border-white/10 px-4 py-2 text-slate-200">Sources</Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 text-slate-300">
          {data?.message ?? 'No data available'}
        </div>
      </div>
    </DashboardShell>
  );
}

function RoleDashboardStub({ role, title, cards }: { role: UserRole; title: string; cards: Array<{ label: string; value: string }> }) {
  const { token } = useAuth();
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const response = await getDashboard(role.toLowerCase().replace(/_/g, '-'), token);
        setData(response);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [role, token]);

  return (
    <DashboardShell
      title={title}
      subtitle="Role-based operational view"
      cards={cards.map((card) => ({ ...card, value: (data?.overview && card.label.toLowerCase().includes('case')) ? String(data.overview?.[card.label.toLowerCase().replace(/[^a-z]/g, '')] ?? 0) : card.value }))}
    >
      <div className="text-slate-300">{data?.message ?? 'No data available'}</div>
    </DashboardShell>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="STUDENT"><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/report" element={<ProtectedRoute allowedRole="STUDENT"><StudentReportPage /></ProtectedRoute>} />
      <Route path="/student/history" element={<ProtectedRoute allowedRole="STUDENT"><StudentHistoryPage /></ProtectedRoute>} />
      <Route path="/student/advisories" element={<ProtectedRoute allowedRole="STUDENT"><StudentAdvisoriesPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRole="STUDENT"><StudentProfilePage /></ProtectedRoute>} />

      <Route path="/health-admin/dashboard" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><HealthAdminDashboardPage /></ProtectedRoute>} />
      <Route path="/health-admin/radar" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Outbreak Radar" subtitle="Geospatial monitoring" cards={[{ label: 'Risk score', value: 'LOW' }, { label: 'Clusters', value: '0' }, { label: 'Cases', value: '0' }, { label: 'Sources', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/cases" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Cases" subtitle="Case review" cards={[{ label: 'Cases', value: '0' }, { label: 'New', value: '0' }, { label: 'Reviewed', value: '0' }, { label: 'Flagged', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/clusters" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Clusters" subtitle="Detected clusters" cards={[{ label: 'Clusters', value: '0' }, { label: 'High risk', value: '0' }, { label: 'Active', value: '0' }, { label: 'Resolved', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/exposures" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Exposures" subtitle="Exposure tracking" cards={[{ label: 'Exposures', value: '0' }, { label: 'Meals', value: '0' }, { label: 'Water', value: '0' }, { label: 'Facilities', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/sources" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Sources" subtitle="Suspected source review" cards={[{ label: 'Sources', value: '0' }, { label: 'Mess', value: '0' }, { label: 'Tap water', value: '0' }, { label: 'Shared areas', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/analytics" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Analytics" subtitle="Evidence and trend analysis" cards={[{ label: 'Signals', value: '0' }, { label: 'Risk score', value: '0' }, { label: 'Correlations', value: '0' }, { label: 'Confidence', value: '0%' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/health-admin/advisories" element={<ProtectedRoute allowedRole="HEALTH_ADMIN"><DashboardShell title="Advisories" subtitle="Health advisories" cards={[{ label: 'Advisories', value: '0' }, { label: 'Sent', value: '0' }, { label: 'Pending', value: '0' }, { label: 'Escalated', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />

      <Route path="/facility/dashboard" element={<ProtectedRoute allowedRole="FACILITY_MANAGER"><DashboardShell title="Facility Dashboard" subtitle="Mess, water, and facility operations" cards={[{ label: 'Alerts', value: '0' }, { label: 'Water', value: '0' }, { label: 'Mess', value: '0' }, { label: 'Actions', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/system-admin/dashboard" element={<ProtectedRoute allowedRole="SYSTEM_ADMIN"><DashboardShell title="System Admin Dashboard" subtitle="Platform and infrastructure overview" cards={[{ label: 'Users', value: '0' }, { label: 'Hostels', value: '0' }, { label: 'Blocks', value: '0' }, { label: 'Systems', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />
      <Route path="/public-health/dashboard" element={<ProtectedRoute allowedRole="PUBLIC_HEALTH_VIEWER"><DashboardShell title="Public Health Dashboard" subtitle="Read-only aggregated surveillance overview" cards={[{ label: 'Case trends', value: '0' }, { label: 'Cluster counts', value: '0' }, { label: 'Risk levels', value: 'LOW' }, { label: 'Hostels', value: '0' }]}><div className="text-slate-300">No data available</div></DashboardShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
