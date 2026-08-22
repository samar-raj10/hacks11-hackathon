import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

<<<<<<< HEAD
=======
const featureCards = [
  {
    icon: '⌁',
    title: 'Explainable outbreak radar',
    body: 'Evidence panels connect time, place, symptoms, meals, water sources, and confidence signals.',
  },
  {
    icon: '+',
    title: 'Student-first reporting',
    body: 'A mobile-ready reporting surface designed for fast, low-friction health updates.',
  },
  {
    icon: 'π',
    title: 'Python analytics service',
    body: 'A dedicated analytics tier reserved for baseline, clustering, and source-attribution methods.',
  },
];

function App() {
  return (
    <main className="cs-app-shell">
      <header className="cs-topbar" aria-label="CampusShield primary navigation">
        <div className="cs-brand" aria-label="CampusShield">
          <span className="cs-brand__mark" aria-hidden="true">CS</span>
          <span>CAMPUSSHIELD</span>
        </div>
        <nav className="cs-nav" aria-label="Phase 1 sections">
          <a href="#radar">Radar</a>
          <a href="#evidence">Evidence</a>
          <a href="#status">Status</a>
        </nav>
      </header>

      <section className="cs-hero">
        <div className="cs-container cs-hero__grid">
          <div>
            <p className="cs-badge">DEMO MODE • Phase 1 scaffold</p>
            <h1 className="cs-title">CAMPUS SHIELD</h1>
            <p className="cs-subtitle">Detect the cluster. Find the source. Stop the spread.</p>
            <p className="cs-subtitle">
              A professional public-health monitoring interface for explainable campus outbreak detection and source attribution.
            </p>
            <div className="cs-actions" aria-label="Primary actions">
              <a className="cs-button cs-button--primary" href="#radar">View outbreak radar</a>
              <a className="cs-button cs-button--ghost" href="#status">Implementation status</a>
            </div>

            <div className="cs-feature-grid" aria-label="CampusShield platform capabilities">
              {featureCards.map((item) => (
                <article className="cs-card cs-feature-card" key={item.title}>
                  <span className="cs-feature-card__icon" aria-hidden="true">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="cs-card cs-dashboard-card" id="radar" aria-label="Outbreak Radar visual preview">
            <div className="cs-card-header">
              <h2 className="cs-card-title">OUTBREAK RADAR</h2>
              <span className="cs-risk-pill cs-risk-pill--high">HIGH RISK</span>
            </div>
            <div className="cs-kpi-grid" id="status">
              <div className="cs-kpi"><span>Total reports</span><strong>127</strong></div>
              <div className="cs-kpi"><span>Active cases</span><strong>31</strong></div>
              <div className="cs-kpi"><span>Active clusters</span><strong>3</strong></div>
              <div className="cs-kpi"><span>Suspected sources</span><strong>4</strong></div>
            </div>
            <div className="cs-map" aria-label="Aggregated campus risk map preview">
              <span className="cs-marker cs-marker--red">A1</span>
              <span className="cs-marker cs-marker--amber">B2</span>
              <span className="cs-marker cs-marker--green">C</span>
            </div>
            <section className="cs-evidence" id="evidence" aria-label="Explainable alert evidence preview">
              <h4>WHY THIS ALERT WAS GENERATED</h4>
              <ul>
                <li>4.7× expected number of cases</li>
                <li>Cases concentrated in adjacent hostel blocks</li>
                <li>Shared dinner exposure requires investigation</li>
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

>>>>>>> 1e5f83279ff54e951d1ab9e6405460b3e20949de
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
