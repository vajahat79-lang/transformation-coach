'use client';

import { useEffect, useMemo, useState } from 'react';

/* ===================== Types ===================== */
type Day = 1 | 2 | 3 | 4 | 5;

type Workout = {
  readonly title: string;
  readonly focus: string;
  readonly exercises: readonly string[];
};

type Readiness = {
  pain: number;
  energy: number;
  sleep: number;
};

type SessionLog = {
  date: string;
  day: Day;
  readiness: Readiness;
  notes: string;
};

/* ===================== Helpers ===================== */
const todayISO = () => new Date().toISOString().slice(0, 10);

function computeReadinessScore(r: Readiness): number {
  return Math.round((((10 - r.pain) + r.energy + r.sleep) / 3) * 10) / 10;
}

function readinessAdvice(score: number): string {
  if (score >= 7.5) return '✅ Push as planned';
  if (score >= 5.5) return '⚠️ Train, keep 1–2 reps in reserve';
  return '🧠 Reduce volume or skip optional work';
}

/* ===================== Component ===================== */
export default function TransformationCoachApp() {
  const [day, setDay] = useState<Day>(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [gymMode, setGymMode] = useState(false);

  const [readiness, setReadiness] = useState<Readiness>({
    pain: 2,
    energy: 7,
    sleep: 7,
  });

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<SessionLog[]>([]);

  /* ===================== Workouts ===================== */
  const workouts = useMemo(
    () => ({
      1: {
        title: 'Upper Push',
        focus: 'Chest / Shoulders / Triceps',
        exercises: [
          'DB Bench — 4 × 8–10',
          'Incline Press — 3 × 10–12',
          'Landmine Press — 3 × 8',
          'Pushdown — 3 × 12–15',
        ],
      },
      2: {
        title: 'Upper Pull',
        focus: 'Back / Rear Delts / Biceps',
        exercises: [
          'Row — 4 × 8–10',
          'Pulldown — 4 × 10–12',
          'Face Pull — 3 × 15',
          'Hammer Curl — 3 × 10–12',
        ],
      },
      3: {
        title: 'Lower Body',
        focus: 'Glutes / Quads / Hamstrings',
        exercises: [
          'Leg Press — 4 × 8–10',
          'RDL — 3 × 8',
          'Split Squat — 3 × 10 / leg',
          'Calf Raise — 4 × 12–15',
        ],
      },
      4: {
        title: 'Conditioning',
        focus: 'Engine + Core',
        exercises: [
          'Bike Intervals — 8 × 20s',
          'Pallof Press — 3 × 12',
          'Farmer Carry — 4 × 30 m',
          'Reverse Crunch — 3 × 15',
        ],
      },
      5: {
        title: 'Optional Mix',
        focus: 'Light volume / weak points',
        exercises: [
          'Goblet Squat — 3 × 12',
          'Machine Press — 3 × 12',
          'Row — 3 × 12',
          'Laterals — 3 × 15',
        ],
      },
    }),
    []
  );

  const workout: Workout = workouts[day];
  const readinessScore = computeReadinessScore(readiness);

  /* ===================== Timer ===================== */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function resetTimer() {
    if (readinessScore < 5.5) setTimer(120);
    else if (readinessScore >= 7.5) setTimer(75);
    else setTimer(90);
  }

  /* ===================== Persistence ===================== */
  const STORAGE_KEY = 'tc_v5_state';

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.day) setDay(d.day);
      if (d.notes) setNotes(d.notes);
      if (d.readiness) setReadiness(d.readiness);
      if (d.history) setHistory(d.history);
      if (d.gymMode !== undefined) setGymMode(d.gymMode);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ day, notes, readiness, history, gymMode })
    );
  }, [day, notes, readiness, history, gymMode]);

  function saveSession() {
    const entry: SessionLog = {
      date: todayISO(),
      day,
      readiness,
      notes,
    };
    setHistory((h) => [entry, ...h.filter((x) => x.date !== entry.date)].slice(0, 30));
    setCompleted({});
  }

  /* ===================== Auto Gym Mode ===================== */
  useEffect(() => {
    if (window.innerWidth < 768) setGymMode(true);
  }, []);

  /* ===================== Styles ===================== */
  const bg = gymMode ? '#0b0b0d' : '#ffffff';
  const card = gymMode ? '#1a1a1f' : '#f4f4f5';
  const fg = gymMode ? '#f8fafc' : '#111';

  /* ===================== UI ===================== */
  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg }}>
      <div style={{ padding: 20, maxWidth: 820, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Transformation Coach</h1>
          <button onClick={() => setGymMode((v) => !v)}>
            {gymMode ? 'Normal Mode' : 'Gym Mode'}
          </button>
        </header>

        <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDay(d as Day);
                setCompleted({});
                resetTimer();
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: day === d ? '#3b82f6' : card,
                color: day === d ? '#fff' : fg,
              }}
            >
              Day {d}
            </button>
          ))}
        </div>

        <div style={{ background: card, padding: 16, borderRadius: 16 }}>
          <strong>Readiness: {readinessScore}/10</strong>
          <div>{readinessAdvice(readinessScore)}</div>
        </div>

        <div style={{ background: card, padding: 20, borderRadius: 20, marginTop: 16 }}>
          <h2>{workout.title}</h2>
          <p>{workout.focus}</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {workout.exercises.map((e) => (
              <li
                key={e}
                onClick={() =>
                  setCompleted((c) => ({ ...c, [e]: !c[e] }))
                }
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: completed[e] ? '#22c55e' : 'transparent',
                  marginBottom: 6,
                  cursor: 'pointer',
                }}
              >
                {completed[e] ? '✅ ' : ''}
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: card,
            padding: 20,
            borderRadius: 20,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40 }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:
            {String(timer % 60).padStart(2, '0')}
          </div>
          <button onClick={() => setRunning((v) => !v)}>
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes…"
          style={{ width: '100%', marginTop: 16, height: 90 }}
        />
        <button onClick={saveSession} style={{ marginTop: 8 }}>
          Save Session
        </button>
      </div>
    </div>
  );
}