'use client';

import { useEffect, useMemo, useState } from 'react';

/* =========================================================
   IRONPATH — Adaptive Strength Coaching (V6)
   Single‑file implementation with:
   - Brand colours + logo placeholder
   - Weight & reps logging
   - Progress charts (minimal inline SVG)
   - Fatigue analysis + auto deload detection
   - 12‑week periodised program engine
   - PWA‑safe, SSR‑safe client component
   ========================================================= */
/* ===================== Types ===================== */
type Day = 1 | 2 | 3 | 4 | 5;


type Workout = {
  readonly title: string;
  readonly focus: string;
  readonly exercises: readonly string[];
};

type Readiness = {
  pain: number;   // 0–10 (lower is better)
  energy: number; // 0–10
  sleep: number;  // 0–10
};

type Performance = { weight?: number; reps?: number };


type SessionLog = {
  date: string; // YYYY‑MM‑DD
  day: Day;
  readiness: Readiness;
  notes: string;
  performance: Record<string, Performance>;
};

type Phase = {
  name: 'Accumulation' | 'Intensification' | 'Deload';
  weeks: number;
  volume: number;
  intensity: number;
};


/* ===================== Brand ===================== */
const brand = {
  bg: '#0B0B0D',
  panel: '#17171C',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#F8FAFC',
  muted: '#9CA3AF',
};


/* ===================== Helpers ===================== */
const todayISO = () => new Date().toISOString().slice(0, 10);


function computeReadinessScore(r: Readiness): number {
  return Math.round((((10 - r.pain) + r.energy + r.sleep) / 3) * 10) / 10;
}


function readinessAdvice(score: number): string {
  if (score >= 7.5) return 'Push as planned';
  if (score >= 5.5) return 'Train, keep 1–2 RIR';
  return 'Reduce volume or prioritise recovery';
}

function fatigueIndex(history: SessionLog[]): number {
  const recent = history.slice(0, 7);
  if (recent.length < 3) return 0;
  const avg = recent.reduce((s, h) => s + computeReadinessScore(h.readiness), 0) / recent.length;
  return Math.round((7.5 - avg) * 10) / 10;
}


function shouldDeload(history: SessionLog[]): boolean {
  const fatigue = fatigueIndex(history);
  const lowStreak = history.slice(0, 3).every(h => computeReadinessScore(h.readiness) < 5.5);
  return fatigue >= 3 || lowStreak;
}


/* ===================== Program ===================== */
const program: Phase[] = [
  { name: 'Accumulation', weeks: 4, volume: 1.0, intensity: 0.9 },
  { name: 'Intensification', weeks: 4, volume: 0.8, intensity: 1.05 },
  { name: 'Accumulation', weeks: 3, volume: 1.0, intensity: 1.0 },
  { name: 'Deload', weeks: 1, volume: 0.6, intensity: 0.85 },
];


function currentPhase(startDate: string): Phase {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const weeksElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
  let acc = 0;
  for (const p of program) {
    acc += p.weeks;
    if (weeksElapsed < acc) return p;
  }
  return program[program.length - 1];
}


/* ===================== Charts (simple SVG) ===================== */
function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.weight));
  const min = Math.min(...data.map(d => d.weight));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = 100 - ((d.weight - min) / (max - min || 1)) * 100;
    return `${x},${y}`;
  }).join(' ');


  return (
    <svg width={320} height={120} style={{ marginTop: 8 }}>
      <polyline
        fill="none"
        stroke={brand.accent}
        strokeWidth="3"
        points={points}
      />
    </svg>
  );
}


/* ===================== Component ===================== */
export default function IronPathApp() {
  const [day, setDay] = useState<Day>(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [gymMode, setGymMode] = useState(false);


  const [readiness, setReadiness] = useState<Readiness>({ pain: 2, energy: 7, sleep: 7 });
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [performance, setPerformance] = useState<Record<string, Performance>>({});
  const [history, setHistory] = useState<SessionLog[]>([]);

  const programStart = useMemo(() => history.at(-1)?.date ?? todayISO(), [history]);
  const phase = currentPhase(programStart);


  /* ===================== Workouts ===================== */
  const workouts: Record<Day, Workout> = useMemo(() => ({
    1: { title: 'Upper Push', focus: 'Chest / Shoulders / Triceps', exercises: [
      'DB Bench', 'Incline Press', 'Landmine Press', 'Pushdown',
    ]},
    2: { title: 'Upper Pull', focus: 'Back / Rear Delts / Biceps', exercises: [
      'Row', 'Pulldown', 'Face Pull', 'Hammer Curl',
    ]},
    3: { title: 'Lower Body', focus: 'Glutes / Quads / Hamstrings', exercises: [
      'Leg Press', 'RDL', 'Split Squat', 'Calf Raise',
    ]},
    4: { title: 'Conditioning', focus: 'Engine + Core', exercises: [
      'Bike Intervals', 'Pallof Press', 'Farmer Carry', 'Reverse Crunch',
    ]},
    5: { title: 'Optional Mix', focus: 'Light volume / weak points', exercises: [
      'Goblet Squat', 'Machine Press', 'Row', 'Laterals',
    ]},
  }), []);


  const workout = workouts[day];
  const readinessScore = computeReadinessScore(readiness);
  const fatigue = fatigueIndex(history);
  const deloadActive = shouldDeload(history) || phase.name === 'Deload';
  /* ===================== Timer ===================== */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(t => t <= 1 ? (setRunning(false), 0) : t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  function resetTimer() {
    setTimer(deloadActive ? 120 : readinessScore >= 7.5 ? 75 : 90);
  }

  /* ===================== Persistence ===================== */
  const STORAGE_KEY = 'ironpath_v6';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      setHistory(d.history ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ history }));
  }, [history]);
  function saveSession() {
    const entry: SessionLog = {
      date: todayISO(),
      day,
      readiness,
      notes,
      performance,
    };
    setHistory(h => [entry, ...h.filter(x => x.date !== entry.date)].slice(0, 90));
    setCompleted({});
    setPerformance({});
  }

  /* ===================== Auto Gym Mode ===================== */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setGymMode(true);
  }, []);

  /* ===================== UI ===================== */
  return (
    <div style={{ minHeight: '100vh', background: brand.bg, color: brand.text }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>IRONPATH</h1>
          <button onClick={() => setGymMode(v => !v)}>Gym Mode</button>
        </header>

        <div style={{ marginTop: 12, color: brand.muted }}>
          Phase: {phase.name} · Fatigue: {fatigue}
          {deloadActive && <span style={{ color: brand.warning }}> · DELOAD ACTIVE</span>}
        </div>


        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[1,2,3,4,5].map(d => (
            <button key={d} onClick={() => { setDay(d as Day); resetTimer(); }}>
              Day {d}
            </button>
          ))}
        </div>

        <div style={{ background: brand.panel, padding: 20, borderRadius: 16, marginTop: 16 }}>
          <h2>{workout.title}</h2>
          <div>{workout.focus}</div>
          {workout.exercises.map(e => (
            <div key={e} style={{ marginTop: 12 }}>
              <div onClick={() => setCompleted(c => ({ ...c, [e]: !c[e] }))}>
                {completed[e] ? '✅ ' : ''}{e}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input type="number" placeholder="kg" inputMode="numeric"
                  value={performance[e]?.weight ?? ''}
                  onChange={ev => setPerformance(p => ({ ...p, [e]: { ...p[e], weight: Number(ev.target.value) } }))}
                />
                <input type="number" placeholder="reps" inputMode="numeric"
                  value={performance[e]?.reps ?? ''}
                  onChange={ev => setPerformance(p => ({ ...p, [e]: { ...p[e], reps: Number(ev.target.value) } }))}
                />
              </div>
              <WeightChart
                data={history
                  .filter(h => h.performance?.[e]?.weight)
                  .map(h => ({ date: h.date, weight: h.performance[e].weight! }))}
              />
            </div>
          ))}
        </div>

        <div style={{ background: brand.panel, padding: 20, borderRadius: 16, marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
          </div>
          <button onClick={() => setRunning(v => !v)}>{running ? 'Pause' : 'Start'}</button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <textarea
          placeholder="Session notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ width: '100%', height: 90, marginTop: 16 }}
        />
        <button onClick={saveSession} style={{ marginTop: 8 }}>Save Session</button>
      </div>
    </div>
  );
}