'use client';

import { useEffect, useState } from 'react';


/* =========================================================
   IRONPATH — Pass 2: Motion + Graphs
   Adds:
   ✅ Workout / Graphs toggle
   ✅ Full analytics screen (reference-style)
   ✅ Subtle motion + transitions
   ✅ Animated timer pulse
   ========================================================= */


/* ===================== Types ===================== */
type Day = 1 | 2 | 3 | 4 | 5;
type Performance = { weight?: number; reps?: number };
type SessionLog = {
  date: string;
  day: Day;
  performance: Record<string, Performance>;
};

/* ===================== Brand ===================== */
const brand = {
  bg: '#0b0b0d',
  card: 'linear-gradient(180deg,#1f1f25 0%,#121215 100%)',
  accent: '#3b82f6',
  text: '#f8fafc',
  muted: '#9ca3af',
  divider: '#26262b',
};

const workouts: Record<Day, { title: string; exercises: string[] }> = {
  1: { title: 'Upper Push', exercises: ['DB Bench', 'Incline Press', 'Landmine Press', 'Pushdown'] },
  2: { title: 'Upper Pull', exercises: ['Row', 'Pulldown', 'Face Pull', 'Hammer Curl'] },
  3: { title: 'Lower Body', exercises: ['Leg Press', 'RDL', 'Split Squat', 'Calf Raise'] },
  4: { title: 'Conditioning', exercises: ['Bike Intervals', 'Pallof Press', 'Farmer Carry', 'Reverse Crunch'] },
  5: { title: 'Optional Mix', exercises: ['Goblet Squat', 'Machine Press', 'Row', 'Laterals'] },
};


/* ===================== Simple SVG Graph ===================== */
function WeightGraph({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((w, i) => {
      const x = (i / (data.length - 1)) * 300;
      const y = 100 - ((w - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(' ');


  return (
    <svg width={320} height={120} style={{ marginTop: 12 }}>
      <polyline fill="none" stroke={brand.accent} strokeWidth="3" points={points} />
    </svg>
  );
}


/* ===================== Component ===================== */
export default function IronPathApp() {
  const [view, setView] = useState<'workout' | 'graphs'>('workout');
  const [day, setDay] = useState<Day>(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [performance, setPerformance] = useState<Record<string, Performance>>({});
  const [history, setHistory] = useState<SessionLog[]>([]);


  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(t => t <= 1 ? (setRunning(false), 0) : t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);


  function saveSession() {
    setHistory(h => [
      { date: new Date().toISOString(), day, performance },
      ...h,
    ]);
    setPerformance({});
  }


  const workout = workouts[day];


  return (
    <div style={{ minHeight: '100vh', background: brand.bg, color: brand.text }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>

        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1>IRONPATH</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('workout')} style={{ opacity: view === 'workout' ? 1 : 0.5 }}>Workout</button>
            <button onClick={() => setView('graphs')} style={{ opacity: view === 'graphs' ? 1 : 0.5 }}>Graphs</button>
          </div>
        </header>
        {/* WORKOUT VIEW */}
        {view === 'workout' && (
          <div style={{ transition: 'opacity .3s' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[1,2,3,4,5].map(d => (
                <button key={d} onClick={() => setDay(d as Day)} style={{ padding: '8px 14px' }}>Day {d}</button>
              ))}
            </div>
            <div style={{ background: brand.card, borderRadius: 24, padding: 24 }}>
              {workout.exercises.map(e => (
                <div key={e} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 12, marginBottom: 12 }}>
                  <div>{e}</div>
                  <input type="number" placeholder="kg" value={performance[e]?.weight ?? ''}
                    onChange={ev => setPerformance(p => ({ ...p, [e]: { ...p[e], weight: Number(ev.target.value) } }))}
                  />
                  <input type="number" placeholder="reps" value={performance[e]?.reps ?? ''}
                    onChange={ev => setPerformance(p => ({ ...p, [e]: { ...p[e], reps: Number(ev.target.value) } }))}
                  />
                </div>
              ))}
            </div>
            <div style={{ background: brand.card, borderRadius: 24, padding: 24, marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, transform: running ? 'scale(1.05)' : 'scale(1)', transition: 'transform .3s' }}>
                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
              </div>
              <button onClick={() => setRunning(v => !v)}>{running ? 'Pause' : 'Start'}</button>
              <button onClick={saveSession} style={{ marginLeft: 12 }}>Save</button>
            </div>
          </div>
        )}

        {/* GRAPHS VIEW */}
        {view === 'graphs' && (
          <div style={{ background: brand.card, borderRadius: 24, padding: 24, transition: 'opacity .3s' }}>
            <h2>Progress</h2>
            {Object.values(workouts).flatMap(w =>
              w.exercises.map(e => {
                const values = history
                  .filter(h => h.performance?.[e]?.weight)
                  .map(h => h.performance[e].weight!);
                if (values.length < 2) return null;
                return (
                  <div key={e} style={{ marginTop: 20 }}>
                    <strong>{e}</strong>
                    <WeightGraph data={values} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}