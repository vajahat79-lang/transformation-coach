'use client';

import { useEffect, useMemo, useState } from 'react';

/* =========================================================
   IRONPATH — Adaptive Strength Coaching (V6 · Polished UI)
   Full polish pass:
   ✅ Structured exercise rows (grid)
   ✅ Tight spacing + mobile‑first layout
   ✅ Clear Deload logic (no empty‑history false positive)
   ✅ Visual hierarchy + gym‑grade feel (Strong / Hevy‑like)
   ========================================================= */


/* ===================== Types ===================== */
type Day = 1 | 2 | 3 | 4 | 5;

type Workout = {
  readonly title: string;
  readonly focus: string;
  readonly exercises: readonly string[];
};

type Readiness = { pain: number; energy: number; sleep: number };
type Performance = { weight?: number; reps?: number };


type SessionLog = {
  date: string;
  day: Day;
  readiness: Readiness;
  notes: string;
  performance: Record<string, Performance>;
};

/* ===================== Brand ===================== */
const brand = {
  bg: '#0B0B0D',
  card: '#17171C',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  text: '#F8FAFC',
  muted: '#9CA3AF',
};

/* ===================== Helpers ===================== */
const todayISO = () => new Date().toISOString().slice(0, 10);

function readinessScore(r: Readiness) {
  return Math.round((((10 - r.pain) + r.energy + r.sleep) / 3) * 10) / 10;
}


function fatigueIndex(history: SessionLog[]) {
  if (history.length < 3) return 0;
  const recent = history.slice(0, 7);
  const avg = recent.reduce((s, h) => s + readinessScore(h.readiness), 0) / recent.length;
  return Math.round((7.5 - avg) * 10) / 10;
}

function shouldDeload(history: SessionLog[]) {
  if (history.length < 3) return false;
  const fatigue = fatigueIndex(history);
  const lowStreak = history.slice(0, 3).every(h => readinessScore(h.readiness) < 5.5);
  return fatigue >= 3 || lowStreak;
}


/* ===================== Component ===================== */
export default function IronPathApp() {
  const [day, setDay] = useState<Day>(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [gymMode, setGymMode] = useState(true);


  const [readiness] = useState<Readiness>({ pain: 2, energy: 7, sleep: 7 });
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [performance, setPerformance] = useState<Record<string, Performance>>({});
  const [history, setHistory] = useState<SessionLog[]>([]);

  /* ===================== Data ===================== */
  const workouts: Record<Day, Workout> = {
    1: { title: 'Upper Push', focus: 'Chest · Shoulders · Triceps', exercises: ['DB Bench', 'Incline Press', 'Landmine Press', 'Pushdown'] },
    2: { title: 'Upper Pull', focus: 'Back · Rear Delts · Biceps', exercises: ['Row', 'Pulldown', 'Face Pull', 'Hammer Curl'] },
    3: { title: 'Lower Body', focus: 'Glutes · Quads · Hamstrings', exercises: ['Leg Press', 'RDL', 'Split Squat', 'Calf Raise'] },
    4: { title: 'Conditioning', focus: 'Engine · Core', exercises: ['Bike Intervals', 'Pallof Press', 'Farmer Carry', 'Reverse Crunch'] },
    5: { title: 'Optional Mix', focus: 'Weak Points · Pump', exercises: ['Goblet Squat', 'Machine Press', 'Row', 'Laterals'] },
  };
  const workout = workouts[day];
  const fatigue = fatigueIndex(history);
  const deload = shouldDeload(history);


  /* ===================== Timer ===================== */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimer(t => t <= 1 ? (setRunning(false), 0) : t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function resetTimer() {
    setTimer(deload ? 120 : 90);
  }

  function saveSession() {
    setHistory(h => [
      { date: todayISO(), day, readiness, notes, performance },
      ...h,
    ].slice(0, 30));
    setCompleted({});
    setPerformance({});
  }

  /* ===================== UI ===================== */
  return (
    <div style={{ minHeight: '100vh', background: brand.bg, color: brand.text }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: 20 }}>


        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ letterSpacing: 1 }}>IRONPATH</h1>
          <button onClick={() => setGymMode(v => !v)} style={{ opacity: 0.8 }}>
            Gym Mode
          </button>
        </header>

        {/* Status */}
        <div style={{ fontSize: 14, color: brand.muted }}>
          Fatigue: {fatigue}
          {deload && <span style={{ color: brand.warning }}> · DELOAD ACTIVE</span>}
        </div>

        {/* Day Selector */}
        <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
          {(Object.keys(workouts) as unknown as Day[]).map(d => (
            <button
              key={d}
              onClick={() => { setDay(d); resetTimer(); }}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: d === day ? brand.accent : brand.card,
                color: d === day ? '#fff' : brand.text,
                fontWeight: d === day ? 600 : 400,
              }}
            >
              Day {d}
            </button>
          ))}
        </div>

        {/* Workout Card */}
        <div style={{ background: brand.card, borderRadius: 18, padding: 20 }}>
          <h2>{workout.title}</h2>
          <div style={{ color: brand.muted, marginBottom: 16 }}>{workout.focus}</div>


          {/* Exercise Rows */}
          {workout.exercises.map(e => (
            <div
              key={e}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: `1px solid #222`,
              }}
            >
              <div
                onClick={() => setCompleted(c => ({ ...c, [e]: !c[e] }))}
                style={{ cursor: 'pointer', fontWeight: completed[e] ? 600 : 400 }}
              >
                {completed[e] ? '✅ ' : ''}{e}
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder="kg"
                value={performance[e]?.weight ?? ''}
                onChange={ev =>
                  setPerformance(p => ({ ...p, [e]: { ...p[e], weight: Number(ev.target.value) } }))
                }
                style={{ width: '100%' }}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="reps"
                value={performance[e]?.reps ?? ''}
                onChange={ev =>
                  setPerformance(p => ({ ...p, [e]: { ...p[e], reps: Number(ev.target.value) } }))
                }
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>

        {/* Timer */}
        <div style={{ background: brand.card, borderRadius: 18, padding: 20, marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setRunning(v => !v)}>{running ? 'Pause' : 'Start'}</button>
            <button onClick={resetTimer}>Reset</button>
          </div>
        </div>

        {/* Notes */}
        <textarea
          placeholder="Session notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ width: '100%', marginTop: 16, height: 90 }}
        />
        <button onClick={saveSession} style={{ marginTop: 8, width: '100%' }}>
          Save Session
        </button>
      </div>
    </div>
  );
}