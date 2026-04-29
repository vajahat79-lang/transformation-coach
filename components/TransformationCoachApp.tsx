'use client';

import { useEffect, useMemo, useState } from 'react';

/* ---------------- Types ---------------- */
type Day = 1 | 2 | 3 | 4 | 5;

type Workout = {
  title: string;
  focus: string;
  exercises: string[];
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

/* ---------------- Helpers ---------------- */
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const todayISO = () => new Date().toISOString().slice(0, 10);

function computeReadinessScore(r: Readiness): number {
  const score = ((10 - r.pain) + r.energy + r.sleep) / 3;
  return Math.round(score * 10) / 10;
}

function readinessAdvice(score: number): string {
  if (score >= 7.5) return 'Push as planned';
  if (score >= 5.5) return 'Train, keep 1–2 RIR';
  return 'Reduce volume or skip optional work';
}

/* ---------------- Component ---------------- */
export default function TransformationCoachAppV4() {
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

  const [history, setHistory] = useState<SessionLog[]>([]);

  /* ---------------- Workouts ---------------- */
  const workouts = useMemo(
    () =>
      ({
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
          focus: 'Glutes / Quads / Hams',
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
      } as const),
    []
  );

  const workout: Workout = workouts[day];
  const readinessScore = computeReadinessScore(readiness);

  /* ---------------- Timer ---------------- */
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

  /* ---------------- Persistence ---------------- */
  const STORAGE_KEY = 'tc_v4_gym_mode';

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.day) setDay(d.day);
      if (d.notes) setNotes(d.notes);
      if (d.readiness) setReadiness(d.readiness);
      if (d.history) setHistory(d.history);
      if (d.gymMode) setGymMode(d.gymMode);
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
    setHistory((h) =>
      [entry, ...h.filter((x) => x.date !== entry.date)].slice(0, 30)
    );
  }

  /* ---------------- Styles ---------------- */
  const bg = gymMode ? '#0e0e0e' : '#ffffff';
  const fg = gymMode ? '#f5f5f5' : '#111111';
  const card = gymMode ? '#1c1c1c' : '#f5f5f5';

  /* ---------------- UI ---------------- */
  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg }}>
      <div style={{ padding: 20, maxWidth: 760, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: gymMode ? 30 : 24 }}>
            Transformation Coach
          </h1>
          <button onClick={() => setGymMode((v) => !v)}>
            {gymMode ? 'Normal Mode' : 'Gym Mode'}
          </button>
        </header>

        {/* Day selector */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
          {([1, 2, 3, 4, 5] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              style={{
                padding: gymMode ? '14px 18px' : '8px 12px',
                fontSize: gymMode ? 18 : 14,
                background: day === d ? '#3b82f6' : card,
                color: day === d ? '#fff' : fg,
                borderRadius: 10,
              }}
            >
              Day {d}
            </button>
          ))}
        </div>

        {/* Readiness */}
        <div style={{ background: card, padding: 16, borderRadius: 14 }}>
          <strong>Readiness: {readinessScore} / 10</strong>
          <div style={{ marginTop: 4 }}>
            {readinessAdvice(readinessScore)}
          </div>
        </div>

        {/* Workout */}
        <div style={{ background: card, padding: 20, borderRadius: 16, marginTop: 16 }}>
          <h2 style={{ fontSize: gymMode ? 26 : 20 }}>{workout.title}</h2>
          <p style={{ opacity: 0.7 }}>{workout.focus}</p>
          <ul style={{ fontSize: gymMode ? 20 : 14 }}>
            {workout.exercises.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>

        {/* Timer */}
        <div
          style={{
            background: card,
            padding: 20,
            borderRadius: 16,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: gymMode ? 48 : 32 }}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:
            {String(timer % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button onClick={() => setRunning((v) => !v)}>
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setTimer(90);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 16 }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Short notes…"
            style={{ width: '100%', height: 80 }}
          />
          <button onClick={saveSession} style={{ marginTop: 8 }}>
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}