import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <p className="mb-4 inline-flex w-fit rounded-full border border-cyan-400/40 px-3 py-1 text-sm text-cyan-200">DEMO MODE • Phase 1 scaffold</p>
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">CAMPUSSHIELD</h1>
        <p className="mt-4 text-xl text-cyan-100">Detect the cluster. Find the source. Stop the spread.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {['Explainable outbreak radar', 'Student-first reporting', 'Python analytics service'].map((item) => (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl" key={item}>{item}</div>
          ))}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
