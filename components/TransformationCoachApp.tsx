'use client';

import { useEffect, useState } from 'react';
/* =========================================================
   IRONPATH — Pass 1: Visual Strike
   Goal: Cinematic look without touching core logic
   - Hero workout header
   - Gradient cards
   - Media-style exercise rows
   - Cleaner hierarchy (reference-style)
   ========================================================= */

/* ===================== Types ===================== */
type Day = 1 | 2 | 3 | 4 | 5;
type Performance = { weight?: number; reps?: number };
type Readiness = { pain: number; energy: number; sleep: number };
type SessionLog = {
  date: string;
  day: Day;
  readiness: Readiness;
  notes: string;
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

const workouts: Record<Day, { title: string; focus: string; exercises: string[] }> = {
  1: { title: 'Upper Push', focus: 'Chest · Shoulders · Triceps', exercises: ['DB Bench', 'Incline Press', 'Landmine Press', 'Pushdown'] },
  2: { title: 'Upper Pull', focus: 'Back · Rear Delts · Biceps', exercises: ['Row', 'Pulldown', 'Face Pull', 'Hammer Curl'] },
  3: { title: 'Lower Body', focus: 'Glutes · Quads · Hamstrings', exercises: ['Leg Press', 'RDL', 'Split Squat', 'Calf Raise'] },
  4: { title: 'Conditioning', focus: 'Engine · Core', exercises: ['Bike Intervals', 'Pallof Press', 'Farmer Carry', 'Reverse Crunch'] },
  5: { title: 'Optional Mix', focus: 'Weak Points · Pump', exercises: ['Goblet Squat', 'Machine Press', 'Row', 'Laterals'] },
};
/* ===================== Component ===================== */
export default function IronPathApp() {
  const [day, setDay] = useState<Day>(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [performance, setPerformance] = useState<Record<string, Performance>>({});

  /* ===================== Timer ===================== */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(t => t <= 1 ? (setRunning(false), 0) : t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const workout = workouts[day];
  return (
    <div style={{ minHeight: '100vh', background: brand.bg, color: brand.text }}>
      
      {/* HERO */}
      <div
        style={{
          padding: '40px 24px 32px',
          background: 'linear-gradient(180deg,#101015 0%,#0b0b0d 100%)',
          borderBottom: `1px solid ${brand.divider}`,
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 34, letterSpacing: 1 }}>{workout.title}</h1>
          <div style={{ color: brand.muted, marginTop: 4 }}>{workout.focus}</div>
        </div>
      </div>
      {/* DAY PILLS */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5].map(d => (
            <button
              key={d}
              onClick={() => setDay(d as Day)}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                background: d === day ? brand.accent : '#1c1c22',
                color: d === day ? '#fff' : brand.text,
                border: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>
      {/* WORKOUT CARD */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <div style={{ background: brand.card, borderRadius: 24, padding: 24 }}>
          {workout.exercises.map(e => (
            <div
              key={e}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 70px 70px',
                alignItems: 'center',
                gap: 12,
                padding: '14px 0',
                borderBottom: `1px solid ${brand.divider}`,
              }}
            >
              {/* MEDIA ICON */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                🏋️
              </div>


              {/* NAME */}
              <div style={{ fontSize: 16 }}>{e}</div>


              {/* KG */}
              <input
                type="number"
                placeholder="kg"
                inputMode="numeric"
                value={performance[e]?.weight ?? ''}
                onChange={ev =>
                  setPerformance(p => ({ ...p, [e]: { ...p[e], weight: Number(ev.target.value) } }))
                }
                style={{
                  background: '#0f0f13',
                  border: '1px solid #2a2a32',
                  borderRadius: 12,
                  color: '#fff',
                  textAlign: 'center',
                  padding: '8px 6px',
                }}
              />


              {/* REPS */}
              <input
                type="number"
                placeholder="reps"
                inputMode="numeric"
                value={performance[e]?.reps ?? ''}
                onChange={ev =>
                  setPerformance(p => ({ ...p, [e]: { ...p[e], reps: Number(ev.target.value) } }))
                }
                style={{
                  background: '#0f0f13',
                  border: '1px solid #2a2a32',
                  borderRadius: 12,
                  color: '#fff',
                  textAlign: 'center',
                  padding: '8px 6px',
                }}
              />
            </div>
          ))}
        </div>

        {/* TIMER CARD */}
        <div
          style={{
            background: brand.card,
            borderRadius: 24,
            padding: 24,
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, letterSpacing: 2 }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12 }}>
            <button onClick={() => setRunning(v => !v)} style={{ padding: '10px 18px' }}>
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => setTimer(90)} style={{ padding: '10px 18px' }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}