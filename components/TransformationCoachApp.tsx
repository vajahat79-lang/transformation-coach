'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function TransformationCoachApp() {
  const [day, setDay] = useState(1);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');

  // timer logic
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const workouts = useMemo(
    () => ({
      1: {
        title: 'Upper Push',
        exercises: [
          'Neutral‑Grip DB Bench – 4 x 8–10',
          'Incline Machine Press – 3 x 10–12',
          'Landmine Press – 3 x 8',
          'Triceps Pushdown – 3 x 12–15',
        ],
      },
      2: {
        title: 'Upper Pull',
        exercises: [
          'Chest‑Supported Row – 4 x 8–10',
          'Neutral‑Grip Pulldown – 4 x 10',
          'Face Pull – 3 x 15',
          'Hammer Curl – 3 x 12',
        ],
      },
      3: {
        title: 'Lower Body',
        exercises: [
          'Leg Press – 4 x 10',
          'Romanian Deadlift – 3 x 8',
          'Split Squat – 3 x 10 / leg',
          'Calf Raise – 4 x 12',
        ],
      },
    }),
    []
  );

  const workout = workouts[day];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>90‑Day Transformation Coach</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Phone‑friendly training log with a built‑in rest timer.
      </p>

      <div style={{ marginBottom: 24 }}>
        <strong>Workout day:</strong>{' '}
        {[1, 2, 3].map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            style={{
              marginLeft: 8,
              padding: '6px 12px',
              borderRadius: 8,
              border: day === d ? '2px solid black' : '1px solid #ccc',
              background: day === d ? '#f0f0f0' : '#fff',
            }}
          >
            Day {d}
          </button>
        ))}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 22 }}>{workout.title}</h2>
        <ul>
          {workout.exercises.map((e) => (
            <li key={e} style={{ margin: '6px 0' }}>
              {e}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>Rest Timer</h3>
        <div style={{ fontSize: 36, margin: '12px 0' }}>
          {Math.floor(timer / 60)
            .toString()
            .padStart(2, '0')}
          :
          {(timer % 60).toString().padStart(2, '0')}
        </div>
        <button onClick={() => setRunning((v) => !v)} style={{ marginRight: 8 }}>
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

      <div style={{ marginTop: 32 }}>
        <h3>Session Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did today feel? Pain? Energy?"
          style={{ width: '100%', height: 100, borderRadius: 8, padding: 8 }}
        />
      </div>
    </div>
  );
}