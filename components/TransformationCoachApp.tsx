'use client';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════
   IRONPATH — 12-Week Transformation
   Personalised for: Male 46 | 105kg | 5'11"
   Phases: Foundation → Building → Peak
═══════════════════════════════════════════════════ */

/* ─── Types ─── */
type Phase = 1 | 2 | 3;
type DayKey = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun';
type LogEntry = { date: string; week: number; day: DayKey; exercise: string; weight: number; reps: number; sets: number };

/* ─── 12-Week Program ─── */
const PHASES: Record<Phase, { name: string; weeks: string; tagline: string; color: string; glow: string; nutrition: { kcal: number; protein: number; carbs: number; fats: number; deficit: string }; cardio: string }> = {
  1: { name: 'Foundation', weeks: 'Weeks 1–4', tagline: 'Build habits. Lock form. Prime the engine.', color: '#3B82F6', glow: 'rgba(59,130,246,0.35)', nutrition: { kcal: 2200, protein: 190, carbs: 220, fats: 60, deficit: '~500 kcal/day' }, cardio: 'LISS 25–30 min elliptical/rower × 3/wk' },
  2: { name: 'Building', weeks: 'Weeks 5–8', tagline: 'Progressive overload. Tighten nutrition. Build momentum.', color: '#10B981', glow: 'rgba(16,185,129,0.35)', nutrition: { kcal: 2050, protein: 200, carbs: 185, fats: 57, deficit: '~650 kcal/day' }, cardio: 'HIIT 2×/wk + LISS 2×/wk' },
  3: { name: 'Peak', weeks: 'Weeks 9–12', tagline: 'Max volume. Nutrition dialled. Final push.', color: '#EF4444', glow: 'rgba(239,68,68,0.35)', nutrition: { kcal: 1900, protein: 210, carbs: 155, fats: 53, deficit: '~800 kcal/day' }, cardio: 'Tabata 20 min + Zone 2 × 2/wk' },
};

type Exercise = { name: string; sets: string; reps: string; rest: string; note?: string; icon: string };
type DayPlan = { title: string; type: 'push'|'pull'|'lower'|'cardio'|'full'|'recovery'|'rest'; focus: string; duration: string; exercises: Exercise[] };

const PROGRAM: Record<Phase, Record<DayKey, DayPlan>> = {
  1: {
    mon: { title: 'Upper Push', type: 'push', focus: 'Chest · Shoulders · Triceps', duration: '55 min', exercises: [
      { name: 'DB Incline Press (neutral grip)', sets: '3', reps: '12–15', rest: '75s', note: 'Elbows 45° — protects shoulder', icon: '🏋️' },
      { name: 'Cable Chest Fly (low-to-high)', sets: '3', reps: '12–15', rest: '60s', note: 'Constant tension', icon: '🔗' },
      { name: 'DB Lateral Raise', sets: '3', reps: '15', rest: '60s', note: '3 sec eccentric', icon: '💪' },
      { name: 'Cable Face Pull', sets: '3', reps: '15', rest: '60s', note: 'Shoulder health — mandatory', icon: '🎯' },
      { name: 'Overhead Rope Tricep Ext', sets: '3', reps: '12–15', rest: '60s', icon: '🔗' },
      { name: 'Plank', sets: '3', reps: '40s hold', rest: '45s', icon: '🧱' },
    ]},
    tue: { title: 'Lower Body + Core', type: 'lower', focus: 'Quads · Hamstrings · Glutes', duration: '55 min', exercises: [
      { name: 'Goblet Squat', sets: '3', reps: '15', rest: '75s', note: 'Heels elevated if needed', icon: '🏋️' },
      { name: 'Romanian Deadlift (DB)', sets: '3', reps: '12', rest: '75s', note: 'Hinge at hip, soft knees', icon: '⬇️' },
      { name: 'Leg Press', sets: '3', reps: '15', rest: '75s', note: 'Full ROM — no quarter reps', icon: '🦵' },
      { name: 'Walking Lunges (DB)', sets: '3', reps: '12 ea', rest: '60s', icon: '🚶' },
      { name: 'Seated Leg Curl', sets: '3', reps: '12–15', rest: '60s', note: '3 sec down', icon: '🦵' },
      { name: 'Hip Thrust (BW/DB)', sets: '3', reps: '15', rest: '60s', note: 'Drive through heels', icon: '⬆️' },
      { name: 'Ab Wheel Rollout', sets: '3', reps: '8–12', rest: '60s', icon: '⭕' },
    ]},
    wed: { title: 'Cardio + Mobility', type: 'cardio', focus: 'Heart · Recovery', duration: '40 min', exercises: [
      { name: 'Elliptical LISS', sets: '1', reps: '30 min', rest: '—', note: '60–65% max HR — fat oxidation zone', icon: '🫀' },
      { name: 'Hip Flexor Stretch', sets: '1', reps: '60s ea', rest: '—', icon: '🧘' },
      { name: 'Thoracic Rotation', sets: '1', reps: '10 ea', rest: '—', icon: '🔄' },
      { name: 'Ankle Circles (supination fix)', sets: '1', reps: '20 ea', rest: '—', note: 'Corrects foot strike pattern', icon: '🦶' },
      { name: 'Shoulder Cross-Body Stretch', sets: '1', reps: '60s ea', rest: '—', note: 'Left shoulder focus', icon: '💪' },
      { name: 'Foam Roll: Quads/IT/Glutes', sets: '1', reps: '60s ea', rest: '—', icon: '🟤' },
    ]},
    thu: { title: 'Upper Pull', type: 'pull', focus: 'Back · Biceps · Rear Delts', duration: '55 min', exercises: [
      { name: 'Lat Pulldown (wide grip)', sets: '3', reps: '12', rest: '75s', note: 'Full stretch at top', icon: '⬇️' },
      { name: 'Seated Cable Row (neutral)', sets: '3', reps: '12', rest: '75s', note: 'Squeeze shoulder blades', icon: '🔗' },
      { name: 'DB Single-Arm Row', sets: '3', reps: '12 ea', rest: '60s', icon: '💪' },
      { name: 'Reverse Pec Deck (Rear Delt)', sets: '3', reps: '15', rest: '60s', note: 'Safe for left shoulder', icon: '🎯' },
      { name: 'EZ Bar Bicep Curl', sets: '3', reps: '12', rest: '60s', icon: '💪' },
      { name: 'Hammer Curls', sets: '3', reps: '12', rest: '60s', icon: '🔨' },
      { name: 'Dead Hang', sets: '3', reps: '30s', rest: '60s', note: 'Shoulder decompression', icon: '🤲' },
    ]},
    fri: { title: 'Full Body Metabolic', type: 'full', focus: 'Compound · Core · Burn', duration: '55 min', exercises: [
      { name: 'Giant Set A1: Goblet Squat', sets: '4', reps: '15', rest: 'No rest → A2', icon: '🏋️' },
      { name: 'Giant Set A2: DB Chest Press', sets: '4', reps: '12', rest: 'No rest → A3', icon: '💪' },
      { name: 'Giant Set A3: Plank', sets: '4', reps: '30s', rest: '90s', icon: '🧱' },
      { name: 'Giant Set B1: RDL (DB)', sets: '3', reps: '12', rest: 'No rest → B2', icon: '⬇️' },
      { name: 'Giant Set B2: Lat Pulldown', sets: '3', reps: '12', rest: 'No rest → B3', icon: '🔗' },
      { name: 'Giant Set B3: Mountain Climbers', sets: '3', reps: '30s', rest: '90s', icon: '🏔️' },
    ]},
    sat: { title: 'Active Recovery', type: 'recovery', focus: 'Walk · Stretch · Reset', duration: '30 min', exercises: [
      { name: 'Brisk Walk (outdoors)', sets: '1', reps: '20–30 min', rest: '—', note: 'Gentle cardio — do not skip', icon: '🚶' },
      { name: 'Full Body Stretch Circuit', sets: '1', reps: '10 min', rest: '—', icon: '🧘' },
      { name: 'Foam Roll Full Body', sets: '1', reps: '5 min', rest: '—', icon: '🟤' },
    ]},
    sun: { title: 'Rest Day', type: 'rest', focus: 'Sleep · Recovery', duration: '8+ hrs sleep', exercises: [
      { name: 'Sleep 8+ hours', sets: '—', reps: '—', rest: '—', note: 'Non-negotiable. Growth happens here.', icon: '🌙' },
      { name: 'Hydration: 3.5L water', sets: '—', reps: '—', rest: '—', icon: '💧' },
      { name: 'Mobility (optional 10 min)', sets: '1', reps: '10 min', rest: '—', icon: '🧘' },
    ]},
  },
  2: {
    mon: { title: 'Upper Push — Strength', type: 'push', focus: 'Chest · Shoulders · Triceps', duration: '60 min', exercises: [
      { name: 'DB Incline Press (neutral)', sets: '4', reps: '8–12', rest: '75s', note: '+2kg vs Phase 1 max', icon: '🏋️' },
      { name: 'DB Flat Bench Press (neutral)', sets: '3', reps: '10–12', rest: '75s', note: 'New — builds chest mass', icon: '💪' },
      { name: 'Cable Chest Fly', sets: '3', reps: '12–15', rest: '60s', note: '+5% weight each week', icon: '🔗' },
      { name: 'DB Arnold Press (seated)', sets: '3', reps: '12', rest: '60s', note: 'Shoulder-safe overhead', icon: '⬆️' },
      { name: 'Lateral Raise (3s eccentric)', sets: '4', reps: '15', rest: '60s', icon: '💪' },
      { name: 'Cable Face Pull', sets: '3', reps: '15', rest: '60s', note: 'Every push session — always', icon: '🎯' },
      { name: 'Tricep Dips (bench/bar)', sets: '3', reps: '10–15', rest: '60s', icon: '⬇️' },
      { name: 'Plank to Shoulder Tap', sets: '3', reps: '20 taps', rest: '45s', icon: '🧱' },
    ]},
    tue: { title: 'Lower Body — Hypertrophy', type: 'lower', focus: 'Quads · Hamstrings · Glutes', duration: '60 min', exercises: [
      { name: 'Barbell Back Squat (or Hack)', sets: '4', reps: '8–12', rest: '90s', note: 'Add 5kg weekly — start light', icon: '🏋️' },
      { name: 'Romanian Deadlift (barbell)', sets: '4', reps: '10–12', rest: '90s', note: 'Progress from DB to bar', icon: '⬇️' },
      { name: 'Leg Press (drop set final)', sets: '3', reps: '15–20', rest: '75s', note: 'Drop set last set', icon: '🦵' },
      { name: 'Bulgarian Split Squat (DB)', sets: '3', reps: '10–12 ea', rest: '60s', note: 'Single-leg strength focus', icon: '🚶' },
      { name: 'Seated Leg Curl (3s eccentric)', sets: '4', reps: '10–15', rest: '60s', icon: '🦵' },
      { name: 'Cable Pull-Through (glutes)', sets: '3', reps: '15', rest: '60s', note: 'Activates posterior chain', icon: '🔗' },
      { name: 'Hanging Knee Raise', sets: '3', reps: '12–15', rest: '45s', note: 'Decompresses spine', icon: '🤲' },
    ]},
    wed: { title: 'HIIT Cardio', type: 'cardio', focus: 'Fat Burn · EPOC', duration: '40 min', exercises: [
      { name: 'Elliptical Warm-Up', sets: '1', reps: '5 min', rest: '—', note: 'Easy pace to prime', icon: '🫀' },
      { name: 'Intervals: 20s max / 40s easy', sets: '10', reps: '× 10 rounds', rest: '—', note: 'Wk 5. Progress to 30/30 by Wk 8', icon: '⚡' },
      { name: 'Steady State Finish', sets: '1', reps: '10 min', rest: '—', note: '65% max HR — fat oxidation', icon: '🏃' },
      { name: 'Ankle + Foot Mobility', sets: '1', reps: '5 min', rest: '—', note: 'Supination correction protocol', icon: '🦶' },
    ]},
    thu: { title: 'Upper Pull — Strength', type: 'pull', focus: 'Back · Biceps · Rear Delts', duration: '60 min', exercises: [
      { name: 'Weighted Pulldown / Assisted PU', sets: '4', reps: '8–12', rest: '75s', note: 'Progress toward unassisted pull-ups', icon: '⬇️' },
      { name: 'Barbell Bent-Over Row (UH)', sets: '4', reps: '8–10', rest: '90s', note: 'Foundation pulling strength', icon: '🏋️' },
      { name: 'DB Single-Arm Row (heavier)', sets: '3', reps: '10–12 ea', rest: '60s', note: '+2.5kg vs Phase 1', icon: '💪' },
      { name: 'Cable Row (wide neutral bar)', sets: '3', reps: '12', rest: '60s', note: 'Scapular retraction focus', icon: '🔗' },
      { name: 'Reverse Pec Deck', sets: '3', reps: '15', rest: '60s', note: 'Rear delt health', icon: '🎯' },
      { name: 'EZ Bar Curl (heavier)', sets: '4', reps: '8–12', rest: '60s', icon: '💪' },
      { name: 'Incline DB Curl', sets: '3', reps: '12', rest: '60s', note: 'Peak contraction emphasis', icon: '🔨' },
      { name: 'Dead Hang', sets: '3', reps: '45s', rest: '60s', icon: '🤲' },
    ]},
    fri: { title: 'Full Body Power', type: 'full', focus: 'Compound · Power · Metabolic', duration: '60 min', exercises: [
      { name: 'Superset A1: DB Squat Press', sets: '4', reps: '10', rest: 'No rest → A2', icon: '🏋️' },
      { name: 'Superset A2: Renegade Row', sets: '4', reps: '8 ea', rest: '90s', icon: '💪' },
      { name: 'Superset B1: RDL to Row', sets: '3', reps: '10', rest: 'No rest → B2', icon: '⬇️' },
      { name: 'Superset B2: Push-Up Variations', sets: '3', reps: '12–15', rest: '90s', icon: '⬆️' },
      { name: 'Metabolic Finisher (10 min AMRAP)', sets: '1', reps: 'Max rounds', rest: '—', note: '10 goblet squats + 10 push-ups + 10 rows', icon: '🔥' },
    ]},
    sat: { title: 'Zone 2 Cardio', type: 'cardio', focus: 'Aerobic Base · Fat Burn', duration: '45 min', exercises: [
      { name: 'Elliptical/Rower (Zone 2)', sets: '1', reps: '35 min', rest: '—', note: '65% max HR — steady fat burn', icon: '🫀' },
      { name: 'Full Body Mobility Circuit', sets: '1', reps: '10 min', rest: '—', icon: '🧘' },
    ]},
    sun: { title: 'Rest Day', type: 'rest', focus: 'Sleep · Recovery', duration: '8+ hrs sleep', exercises: [
      { name: 'Sleep 8+ hours', sets: '—', reps: '—', rest: '—', note: 'Sleep = testosterone + muscle = results', icon: '🌙' },
      { name: 'Meal prep for the week', sets: '—', reps: '—', rest: '—', note: 'Prep protein sources — compliance insurance', icon: '🍳' },
    ]},
  },
  3: {
    mon: { title: 'Upper Push — Max Effort', type: 'push', focus: 'Chest · Shoulders · Triceps', duration: '65 min', exercises: [
      { name: 'DB Incline Press + Drop Set', sets: '4', reps: '8–10 + drop', rest: '75s', note: 'Drop set: -20% weight to failure', icon: '🏋️' },
      { name: 'DB Flat Press (neutral)', sets: '4', reps: '8–10', rest: '75s', note: 'Rest-pause on final set', icon: '💪' },
      { name: 'Cable Chest Fly (max tension)', sets: '3', reps: '12–15', rest: '60s', icon: '🔗' },
      { name: 'DB Arnold Press', sets: '4', reps: '10–12', rest: '60s', note: 'Heaviest so far', icon: '⬆️' },
      { name: 'Lateral Raise + Rest-Pause', sets: '4', reps: '15 + RP', rest: '45s', icon: '💪' },
      { name: 'Cable Face Pull', sets: '3', reps: '15', rest: '60s', note: 'Every session — no exceptions', icon: '🎯' },
      { name: 'Tricep Superset: Dips + Pushdown', sets: '3', reps: '10–12 ea', rest: '75s', note: 'Back-to-back no rest', icon: '⬇️' },
    ]},
    tue: { title: 'Lower Body — Max Volume', type: 'lower', focus: 'Quads · Hamstrings · Glutes', duration: '65 min', exercises: [
      { name: 'Barbell Squat (heaviest)', sets: '5', reps: '6–10', rest: '120s', note: 'Target bodyweight on bar (105kg)', icon: '🏋️' },
      { name: 'Romanian Deadlift (heavy)', sets: '4', reps: '8–10', rest: '90s', icon: '⬇️' },
      { name: 'Leg Press (drop set × 2)', sets: '4', reps: '15 + 2 drops', rest: '90s', note: 'Two drop sets on final set', icon: '🦵' },
      { name: 'Bulgarian Split Squat (heavier)', sets: '3', reps: '8–10 ea', rest: '75s', icon: '🚶' },
      { name: 'Leg Curl Superset: Seated + Lying', sets: '3', reps: '12 + 12', rest: '75s', icon: '🦵' },
      { name: 'Hanging Leg Raise', sets: '3', reps: '15', rest: '45s', icon: '🤲' },
      { name: 'Plank Variations (3-way)', sets: '3', reps: '30s ea', rest: '30s', icon: '🧱' },
    ]},
    wed: { title: 'Tabata + Zone 2', type: 'cardio', focus: 'Peak Fat Burn · EPOC', duration: '50 min', exercises: [
      { name: 'Warm-Up (rower easy)', sets: '1', reps: '5 min', rest: '—', icon: '🫀' },
      { name: 'Tabata: 20s all-out / 10s rest', sets: '8', reps: '4 min blocks × 5', rest: '60s between blocks', note: '20 min total — highest fat-burn protocol', icon: '⚡' },
      { name: 'Zone 2 Elliptical (65% HR)', sets: '1', reps: '25 min', rest: '—', note: 'Maximises post-HIIT fat oxidation', icon: '🏃' },
    ]},
    thu: { title: 'Upper Pull — Max Effort', type: 'pull', focus: 'Back · Biceps · Rear Delts', duration: '65 min', exercises: [
      { name: 'Pull-Ups (weighted if able)', sets: '5', reps: '5–8', rest: '90s', note: 'Target: 5 unassisted reps by Wk 10', icon: '⬆️' },
      { name: 'Barbell Row (heavy)', sets: '4', reps: '6–8', rest: '90s', icon: '🏋️' },
      { name: 'Mechanical Drop Set: Pulldown', sets: '3', reps: 'Wide→Close→Straight', rest: '90s', note: 'Change grip when fatigued, no rack', icon: '⬇️' },
      { name: 'DB Row (rest-pause)', sets: '3', reps: '10 + RP ea', rest: '75s', icon: '💪' },
      { name: 'Reverse Pec Deck (heavy)', sets: '3', reps: '12–15', rest: '60s', icon: '🎯' },
      { name: 'EZ Bar Curl (heavy) + Hammer Drop', sets: '4', reps: '8 + drop', rest: '60s', icon: '🔨' },
      { name: 'Dead Hang', sets: '3', reps: '45–60s', rest: '60s', note: 'Shoulder decompression always', icon: '🤲' },
    ]},
    fri: { title: 'Full Body Power Circuit', type: 'full', focus: 'Power · Metabolic · Peak', duration: '65 min', exercises: [
      { name: 'Superset: Squat Press + Row', sets: '5', reps: '10 ea', rest: '90s', note: 'Heaviest yet — push the load', icon: '🏋️' },
      { name: 'Superset: RDL + Pull-Up', sets: '4', reps: '8 + 5–8', rest: '90s', icon: '⬇️' },
      { name: 'Finisher AMRAP 10 min', sets: '1', reps: 'Max rounds', rest: '—', note: '10 goblet squats + 10 push-ups + 10 rows. Record & beat it.', icon: '🔥' },
      { name: 'Core Superset: Hanging Raise + Plank', sets: '3', reps: '15 + 45s', rest: '45s', icon: '🧱' },
    ]},
    sat: { title: 'Zone 2 Only', type: 'cardio', focus: 'Active Recovery · Fat Burn', duration: '45 min', exercises: [
      { name: 'Elliptical/Bike Zone 2', sets: '1', reps: '45 min', rest: '—', note: '65% max HR — no more than this today', icon: '🫀' },
    ]},
    sun: { title: 'Rest / Deload (Wk 12)', type: 'rest', focus: 'Recovery · Adaptation', duration: '8+ hrs sleep', exercises: [
      { name: 'Sleep 9 hours (Deload Week)', sets: '—', reps: '—', rest: '—', note: 'Week 12: deload week — primary driver of peak adaptation', icon: '🌙' },
      { name: 'Strategic carb refeed today', sets: '—', reps: '—', rest: '—', note: '+100g carbs — glycogen restoration', icon: '🍚' },
    ]},
  },
};

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'MON' },
  { key: 'tue', label: 'Tuesday', short: 'TUE' },
  { key: 'wed', label: 'Wednesday', short: 'WED' },
  { key: 'thu', label: 'Thursday', short: 'THU' },
  { key: 'fri', label: 'Friday', short: 'FRI' },
  { key: 'sat', label: 'Saturday', short: 'SAT' },
  { key: 'sun', label: 'Sunday', short: 'SUN' },
];

const TYPE_COLORS: Record<string, string> = {
  push: '#3B82F6', pull: '#8B5CF6', lower: '#10B981', cardio: '#F59E0B',
  full: '#EF4444', recovery: '#14B8A6', rest: '#6B7280',
};

const MILESTONES: { week: number; items: string[] }[] = [
  { week: 1, items: ['Baseline weight + measurements logged', 'All exercises performed with good form', 'Track every meal in MyFitnessPal', '3.5L water per day established'] },
  { week: 2, items: ['Waist ≤ baseline measurement', 'All sessions completed as written', 'Sleep averaging 7.5h/night', 'Left shoulder pain: 0/10'] },
  { week: 3, items: ['Weight: −0.5 to −1 kg from start', 'Load increase in 2+ exercises', '5/5 training days hit', 'Mobility routine daily'] },
  { week: 4, items: ['Waist −1 to −2 cm', 'Weight −1.5 to −2 kg', 'End-of-phase progress photos', 'All Phase 1 workouts completed'] },
  { week: 5, items: ['New baseline measurements taken', 'HIIT cardio completed without quitting', 'Goblet squat +5kg vs Week 1', 'Alcohol max 1 drink'] },
  { week: 6, items: ['Weight target −3 to −4 kg from start', 'DB Incline Press +5kg vs Week 1', 'Meal prep Sunday — 100% compliance', 'Energy levels consistently high'] },
  { week: 7, items: ['Waist −3 to −4 cm from baseline', 'First unassisted pull-up (or −20kg assist)', 'Zero alcohol this week', 'HIIT 30/30 protocol completed'] },
  { week: 8, items: ['Weight −5 to −6 kg from start', 'Phase 2 photos vs Phase 1', 'Sleep averaging 7.5h/night', 'Barbell squat form locked in'] },
  { week: 9, items: ['Visual definition beginning to appear', 'Barbell squat at bodyweight (105kg)', '5 unassisted pull-ups', 'Zero alcohol this week'] },
  { week: 10, items: ['Waist −5 to −6 cm from baseline', 'Nutrition compliance 95%', 'All Phase 3 lifts at personal best', 'Finisher AMRAP: beat Week 9 score'] },
  { week: 11, items: ['Weight −8 to −10 kg target', 'Personal records in all major lifts', 'Maintain all habits — final push', 'Progress photos — visible transformation'] },
  { week: 12, items: ['Final measurements + photos', 'All Phase 3 PRs documented', 'Deload week completed (40% load)', 'Day 91 maintenance plan ready'] },
];

/* ─── Styles ─── */
const S = {
  bg: '#080A0E',
  card: '#10131A',
  cardBorder: '#1E2130',
  surface: '#161927',
  text: '#F0F4FF',
  muted: '#7B8DB0',
  faint: '#2A2F42',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body, html { background: ${S.bg}; color: ${S.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input { -webkit-appearance: none; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.6 } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 0 0 transparent } 50% { box-shadow: 0 0 20px 4px var(--glow) } }
  .fade-up { animation: fadeUp .3s ease-out both }
  .pulse { animation: pulse 1.5s ease-in-out infinite }
`;

/* ─── Graph ─── */
function MiniGraph({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const W = 300, H = 80, pad = 8;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" points={pts}/>
      <circle cx={last[0]} cy={last[1]} r="4" fill={color}/>
      <text x={last[0]} y={parseFloat(last[1]) - 8} textAnchor="middle" fill={color} fontSize="11" fontFamily="DM Sans" fontWeight="600">{data[data.length - 1]}kg</text>
    </svg>
  );
}

/* ─── Main App ─── */
export default function IronPathApp() {
  const [view, setView] = useState<'home'|'workout'|'nutrition'|'progress'|'milestones'>('home');
  const [phase, setPhase] = useState<Phase>(1);
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState<DayKey>('mon');
  const [timer, setTimer] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [log, setLog] = useState<Record<string, { weight: string; reps: string; done: boolean }>>({});
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [bodyWeight, setBodyWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [measurements, setMeasurements] = useState<{ week: number; weight: number; waist: number; date: string }[]>([]);
  const [savedSessions, setSavedSessions] = useState<{ date: string; phase: Phase; week: number; day: DayKey }[]>([]);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  const phaseData = PHASES[phase];
  const dayPlan = PROGRAM[phase][day];
  const phaseColor = phaseData.color;

  /* Timer */
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimer(t => { if (t <= 1) { setTimerRunning(false); return 90; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const todaysDoneCount = dayPlan.exercises.filter(e => log[e.name]?.done).length;
  const completion = Math.round((todaysDoneCount / dayPlan.exercises.length) * 100);

  function saveSession() {
    const date = new Date().toISOString().split('T')[0];
    const entries: LogEntry[] = Object.entries(log)
      .filter(([, v]) => v.done && v.weight)
      .map(([exercise, v]) => ({ date, week, day, exercise, weight: parseFloat(v.weight) || 0, reps: parseInt(v.reps) || 0, sets: 3, phase }));
    if (entries.length) setHistory(h => [...entries, ...h]);
    setSavedSessions(s => [{ date, phase, week, day }, ...s.slice(0, 19)]);
    setLog({});
  }

  function logMeasurement() {
    const w = parseFloat(bodyWeight), wa = parseFloat(waist);
    if (!w) return;
    setMeasurements(m => [{ week, weight: w, waist: wa || 0, date: new Date().toISOString().split('T')[0] }, ...m]);
    setBodyWeight(''); setWaist('');
  }

  /* Graph data */
  const weightHistory = measurements.slice().reverse().map(m => m.weight);
  const waistHistory = measurements.slice().reverse().filter(m => m.waist > 0).map(m => m.waist);

  /* Exercise PRs */
  const exercisePRs = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach(e => { if (!map[e.exercise] || e.weight > map[e.exercise]) map[e.exercise] = e.weight; });
    return map;
  }, [history]);

  const currentMilestone = MILESTONES.find(m => m.week === week) || MILESTONES[0];

  /* ── VIEWS ── */

  const HomeView = () => (
    <div className="fade-up" style={{ padding: '0 20px 100px' }}>
      {/* Phase hero */}
      <div style={{ background: `linear-gradient(135deg, ${phaseColor}22, #0f1220)`, border: `1px solid ${phaseColor}33`, borderRadius: 20, padding: '24px 20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: phaseColor, opacity: 0.06 }}/>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: phaseColor, marginBottom: 6, textTransform: 'uppercase' }}>Phase {phase} · {phaseData.weeks}</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>{phaseData.name}</div>
        <div style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>{phaseData.tagline}</div>
        {/* Phase selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {([1,2,3] as Phase[]).map(p => (
            <button key={p} onClick={() => setPhase(p)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `1px solid ${p === phase ? PHASES[p].color : S.faint}`,
                background: p === phase ? `${PHASES[p].color}22` : 'transparent', color: p === phase ? PHASES[p].color : S.muted,
                fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans', cursor: 'pointer', transition: 'all .2s' }}>
              P{p} · {PHASES[p].name.slice(0,5)}
            </button>
          ))}
        </div>
      </div>

      {/* Week selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: S.muted, marginBottom: 10, textTransform: 'uppercase' }}>Current Week</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {Array.from({length: 4}, (_,i) => { const w = (phase - 1) * 4 + i + 1; return (
            <button key={w} onClick={() => setWeek(w)} style={{ minWidth: 52, padding: '8px 4px', borderRadius: 12, border: `1px solid ${w === week ? phaseColor : S.faint}`,
              background: w === week ? `${phaseColor}22` : 'transparent', color: w === week ? phaseColor : S.muted,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', whiteSpace: 'nowrap' }}>
              Wk {w}
            </button>
          );})}
        </div>
      </div>

      {/* Day grid */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: S.muted, marginBottom: 10, textTransform: 'uppercase' }}>Select Day</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {DAYS.map(d => {
            const dp = PROGRAM[phase][d.key];
            const tc = TYPE_COLORS[dp.type];
            return (
              <button key={d.key} onClick={() => { setDay(d.key); setView('workout'); }}
                style={{ padding: '10px 6px', borderRadius: 12, border: `1px solid ${d.key === day ? tc : S.faint}`,
                  background: d.key === day ? `${tc}18` : S.card, cursor: 'pointer', transition: 'all .2s', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: tc, marginBottom: 3 }}>{d.short}</div>
                <div style={{ fontSize: 10, color: S.muted, lineHeight: 1.2 }}>{dp.title.split(' ').slice(0,2).join(' ')}</div>
              </button>
            );
          })}
          <button onClick={() => { setDay('sun'); setView('workout'); }}
            style={{ padding: '10px 6px', borderRadius: 12, border: `1px solid ${'sun' === day ? TYPE_COLORS['rest'] : S.faint}`,
              background: 'sun' === day ? `${TYPE_COLORS['rest']}18` : S.card, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: TYPE_COLORS['rest'], marginBottom: 3 }}>SUN</div>
            <div style={{ fontSize: 10, color: S.muted, lineHeight: 1.2 }}>Rest</div>
          </button>
        </div>
      </div>

      {/* Today's card */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 16 }}
        onClick={() => setView('workout')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: TYPE_COLORS[dayPlan.type], fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{DAYS.find(d=>d.key===day)?.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>{dayPlan.title}</div>
            <div style={{ fontSize: 13, color: S.muted, marginTop: 2 }}>{dayPlan.focus}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: S.muted }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: phaseColor }}>{dayPlan.duration}</div>
          </div>
        </div>
        {/* Progress ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: S.faint, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: phaseColor, borderRadius: 4, transition: 'width .5s ease' }}/>
          </div>
          <div style={{ fontSize: 12, color: phaseColor, fontWeight: 600, minWidth: 36 }}>{completion}%</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: S.muted }}>{todaysDoneCount}/{dayPlan.exercises.length} exercises logged</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Sessions Saved', value: savedSessions.length },
          { label: 'Exercises Logged', value: history.length },
          { label: 'PRs Tracked', value: Object.keys(exercisePRs).length },
          { label: 'Weeks Tracked', value: [...new Set(measurements.map(m => m.week))].length },
        ].map(s => (
          <div key={s.label} style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", color: phaseColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Weight entry */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: S.text }}>Log Today's Measurements</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 6 }}>Body Weight (kg)</div>
            <input type="number" inputMode="decimal" placeholder="105.0" value={bodyWeight}
              onChange={e => setBodyWeight(e.target.value)}
              style={{ width: '100%', background: S.surface, border: `1px solid ${S.faint}`, borderRadius: 12, color: S.text, padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 6 }}>Waist (cm)</div>
            <input type="number" inputMode="decimal" placeholder="100.0" value={waist}
              onChange={e => setWaist(e.target.value)}
              style={{ width: '100%', background: S.surface, border: `1px solid ${S.faint}`, borderRadius: 12, color: S.text, padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans' }}/>
          </div>
        </div>
        <button onClick={logMeasurement}
          style={{ width: '100%', padding: '12px', borderRadius: 14, background: phaseColor, border: 'none',
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer' }}>
          Save Measurement
        </button>
        {measurements.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: S.muted }}>
            Last: {measurements[0].weight}kg · Waist {measurements[0].waist}cm · Week {measurements[0].week}
          </div>
        )}
      </div>
    </div>
  );

  const WorkoutView = () => (
    <div className="fade-up" style={{ padding: '0 20px 120px' }}>
      {/* Day header */}
      <div style={{ background: `linear-gradient(135deg, ${TYPE_COLORS[dayPlan.type]}18, transparent)`, border: `1px solid ${TYPE_COLORS[dayPlan.type]}30`, borderRadius: 20, padding: '20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: TYPE_COLORS[dayPlan.type], fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              {DAYS.find(d=>d.key===day)?.label} · Week {week}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>{dayPlan.title}</div>
            <div style={{ fontSize: 13, color: S.muted }}>{dayPlan.focus}</div>
          </div>
          <div style={{ background: `${TYPE_COLORS[dayPlan.type]}22`, borderRadius: 12, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: S.muted }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TYPE_COLORS[dayPlan.type] }}>{dayPlan.duration}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 4, background: S.faint, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${completion}%`, height: '100%', background: TYPE_COLORS[dayPlan.type], borderRadius: 4, transition: 'width .4s ease' }}/>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {DAYS.map(d => {
          const tc = TYPE_COLORS[PROGRAM[phase][d.key].type];
          return (
            <button key={d.key} onClick={() => { setDay(d.key); setLog({}); }}
              style={{ minWidth: 50, padding: '8px 6px', borderRadius: 12, border: `1px solid ${d.key === day ? tc : S.faint}`,
                background: d.key === day ? `${tc}22` : 'transparent', color: d.key === day ? tc : S.muted,
                fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer', letterSpacing: 1 }}>
              {d.short}
            </button>
          );
        })}
      </div>

      {/* Exercises */}
      {dayPlan.exercises.map((ex, i) => {
        const entry = log[ex.name] || { weight: '', reps: '', done: false };
        const isExpanded = expandedEx === ex.name;
        const pr = exercisePRs[ex.name];
        return (
          <div key={ex.name} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, background: S.card, border: `1px solid ${entry.done ? `${phaseColor}44` : S.cardBorder}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10, transition: 'border-color .2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setExpandedEx(isExpanded ? null : ex.name)}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: entry.done ? `${phaseColor}22` : S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, transition: 'background .2s' }}>
                {entry.done ? '✓' : ex.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: entry.done ? phaseColor : S.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: S.muted }}>{ex.sets} sets · {ex.reps} reps · {ex.rest} rest</div>
              </div>
              {pr && <div style={{ fontSize: 11, color: phaseColor, fontWeight: 700, flexShrink: 0 }}>PR {pr}kg</div>}
              <div style={{ fontSize: 16, color: S.muted, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${S.faint}` }}>
                {ex.note && <div style={{ fontSize: 12, color: phaseColor, marginBottom: 12, padding: '8px 12px', background: `${phaseColor}12`, borderRadius: 10 }}>💡 {ex.note}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: S.muted, marginBottom: 6 }}>Weight (kg)</div>
                    <input type="number" inputMode="decimal" placeholder={pr ? `${pr}` : 'kg'}
                      value={entry.weight}
                      onChange={e => setLog(l => ({ ...l, [ex.name]: { ...entry, weight: e.target.value } }))}
                      style={{ width: '100%', background: S.surface, border: `1px solid ${S.faint}`, borderRadius: 12, color: S.text, padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: S.muted, marginBottom: 6 }}>Reps</div>
                    <input type="number" inputMode="numeric" placeholder="12"
                      value={entry.reps}
                      onChange={e => setLog(l => ({ ...l, [ex.name]: { ...entry, reps: e.target.value } }))}
                      style={{ width: '100%', background: S.surface, border: `1px solid ${S.faint}`, borderRadius: 12, color: S.text, padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans' }}/>
                  </div>
                </div>
                <button onClick={() => { setLog(l => ({ ...l, [ex.name]: { ...entry, done: !entry.done } })); setExpandedEx(null); }}
                  style={{ width: '100%', padding: '11px', borderRadius: 13, border: `1px solid ${phaseColor}`, background: entry.done ? `${phaseColor}22` : phaseColor,
                    color: entry.done ? phaseColor : '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer', transition: 'all .2s' }}>
                  {entry.done ? 'Mark Incomplete' : '✓ Mark Complete'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Timer card */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '20px', marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: S.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Rest Timer</div>
        <div style={{ fontSize: 56, fontFamily: "'Bebas Neue', cursive", letterSpacing: 4, color: timerRunning ? phaseColor : S.text, transition: 'color .3s' }} className={timerRunning ? 'pulse' : ''}>
          {String(Math.floor(timer / 60)).padStart(2,'0')}:{String(timer % 60).padStart(2,'0')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {[60,90,120].map(t => (
            <button key={t} onClick={() => { setTimer(t); setTimerRunning(false); }}
              style={{ padding: '7px 16px', borderRadius: 10, border: `1px solid ${S.faint}`, background: timer === t ? S.surface : 'transparent',
                color: S.muted, fontSize: 13, fontFamily: 'DM Sans', cursor: 'pointer' }}>{t}s</button>
          ))}
          <button onClick={() => setTimerRunning(v => !v)}
            style={{ padding: '7px 20px', borderRadius: 10, border: 'none', background: phaseColor, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer' }}>
            {timerRunning ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>

      {/* Save button */}
      <button onClick={saveSession}
        style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: `linear-gradient(135deg, ${phaseColor}, ${phaseColor}BB)`,
          color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, cursor: 'pointer',
          boxShadow: `0 8px 24px ${phaseColor}44` }}>
        SAVE SESSION
      </button>
    </div>
  );

  const NutritionView = () => (
    <div className="fade-up" style={{ padding: '0 20px 100px' }}>
      {/* Macro cards */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: S.muted, marginBottom: 12, textTransform: 'uppercase' }}>Phase {phase} Targets · {phaseData.weeks}</div>
        <div style={{ background: `linear-gradient(135deg, ${phaseColor}20, ${phaseColor}08)`, border: `1px solid ${phaseColor}30`, borderRadius: 20, padding: '20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 38, fontFamily: "'Bebas Neue', cursive", color: phaseColor, letterSpacing: 2 }}>{phaseData.nutrition.kcal}</div>
              <div style={{ fontSize: 12, color: S.muted }}>Daily Calories · {phaseData.nutrition.deficit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: S.muted }}>Weekly loss target</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: phaseColor }}>{phase === 1 ? '0.4–0.6 kg' : phase === 2 ? '0.5–0.7 kg' : '0.6–0.8 kg'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Protein', value: phaseData.nutrition.protein, unit: 'g', color: '#3B82F6', pct: '35–44%' },
              { label: 'Carbs', value: phaseData.nutrition.carbs, unit: 'g', color: '#10B981', pct: '33–40%' },
              { label: 'Fats', value: phaseData.nutrition.fats, unit: 'g', color: '#F59E0B', pct: '25%' },
            ].map(m => (
              <div key={m.label} style={{ background: `${m.color}14`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: m.color, letterSpacing: 1 }}>{m.value}</div>
                <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.unit}</div>
                <div style={{ fontSize: 11, color: S.muted }}>{m.label}</div>
                <div style={{ fontSize: 10, color: S.muted }}>{m.pct}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal plan */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Daily Meal Structure</div>
        {[
          { time: '6–7am', meal: 'Pre-Workout', items: '2 eggs + oats 60g + banana OR protein shake + apple', kcal: '~350 kcal', emoji: '🌅' },
          { time: '9–10am', meal: 'Post-Workout', items: 'Protein shake 40g + rice cakes + peanut butter', kcal: '~350 kcal', emoji: '⚡' },
          { time: '12–1pm', meal: 'Lunch', items: '200g lean protein + 150g brown rice/sweet potato + vegetables', kcal: '~600 kcal', emoji: '🥗' },
          { time: '3–4pm', meal: 'Snack', items: 'Greek yoghurt 200g + handful nuts + berries', kcal: '~300 kcal', emoji: '🍇' },
          { time: '7–8pm', meal: 'Dinner', items: '200g lean protein + roasted veg (no starchy carbs P2–3) + salad', kcal: '~450 kcal', emoji: '🍽️' },
        ].map((m, i) => (
          <div key={m.meal} style={{ display: 'flex', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < 4 ? `1px solid ${S.faint}` : 'none' }}>
            <div style={{ fontSize: 24 }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.meal}</div>
                <div style={{ fontSize: 12, color: phaseColor, fontWeight: 600 }}>{m.kcal}</div>
              </div>
              <div style={{ fontSize: 11, color: S.muted }}>{m.time}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, lineHeight: 1.5 }}>{m.items}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplements */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Daily Supplements</div>
        {[
          { name: 'Creatine Monohydrate', dose: '5g/day, every day', note: 'Best studied supplement for strength', emoji: '⚡' },
          { name: 'Omega-3 Fish Oil', dose: '2–3g EPA/DHA', note: 'Directly reduces visceral fat tissue', emoji: '🐟' },
          { name: 'Vitamin D3', dose: '2,000 IU', note: 'Testosterone and immune support', emoji: '☀️' },
          { name: 'Magnesium Glycinate', dose: '400mg before bed', note: 'Improves sleep quality — critical', emoji: '🌙' },
          { name: 'Green Tea (2–3 cups)', dose: 'Daily', note: 'Raises fat oxidation 4–8%', emoji: '🍵' },
        ].map(s => (
          <div key={s.name} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name} · <span style={{ color: phaseColor }}>{s.dose}</span></div>
              <div style={{ fontSize: 12, color: S.muted }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cardio */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Phase {phase} Cardio Protocol</div>
        <div style={{ fontSize: 13, color: '#F59E0B', padding: '10px 14px', background: '#F59E0B18', borderRadius: 12, marginBottom: 12 }}>
          📍 {phaseData.cardio}
        </div>
        <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7 }}>
          {phase === 1 && 'LISS (Low Intensity Steady State) burns fat without spiking cortisol or compromising recovery. Elliptical is primary — zero impact, corrects supination, high calorie burn.'}
          {phase === 2 && 'HIIT (High Intensity Interval Training) elevates metabolism for 24–36 hours post-session via EPOC. This is the most powerful cardio tool for visceral fat elimination.'}
          {phase === 3 && 'Tabata maximises EPOC effect. Zone 2 following HIIT maximises post-exercise fat oxidation. This combination is the peak fat-burning protocol.'}
        </div>
      </div>
    </div>
  );

  const ProgressView = () => (
    <div className="fade-up" style={{ padding: '0 20px 100px' }}>
      {/* Body weight graph */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Body Weight</div>
        {weightHistory.length >= 2 ? (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: S.muted }}>Start</div>
                <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: S.text }}>{weightHistory[0]}kg</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: S.muted }}>Current</div>
                <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: phaseColor }}>{weightHistory[weightHistory.length-1]}kg</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: S.muted }}>Lost</div>
                <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: '#10B981' }}>-{(weightHistory[0] - weightHistory[weightHistory.length-1]).toFixed(1)}kg</div>
              </div>
            </div>
            <MiniGraph data={weightHistory} color={phaseColor}/>
          </>
        ) : (
          <div style={{ fontSize: 13, color: S.muted, padding: '20px 0', textAlign: 'center' }}>Log 2+ measurements on Home screen to see your graph</div>
        )}
      </div>

      {/* Waist graph */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Waist Circumference</div>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 10 }}>Primary visceral fat indicator</div>
        {waistHistory.length >= 2 ? (
          <MiniGraph data={waistHistory} color="#10B981"/>
        ) : (
          <div style={{ fontSize: 13, color: S.muted, padding: '16px 0', textAlign: 'center' }}>Log waist measurements on Home screen</div>
        )}
      </div>

      {/* Exercise PRs */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Personal Records</div>
        {Object.keys(exercisePRs).length === 0 ? (
          <div style={{ fontSize: 13, color: S.muted, textAlign: 'center', padding: '16px 0' }}>Complete workout sessions to track your PRs</div>
        ) : (
          Object.entries(exercisePRs).map(([ex, w]) => (
            <div key={ex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${S.faint}` }}>
              <div style={{ fontSize: 13, color: S.text, flex: 1 }}>{ex}</div>
              <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', cursive", color: phaseColor }}>{w}kg</div>
            </div>
          ))
        )}
      </div>

      {/* History */}
      <div style={{ background: S.card, border: `1px solid ${S.cardBorder}`, borderRadius: 20, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Session History</div>
        {savedSessions.length === 0 ? (
          <div style={{ fontSize: 13, color: S.muted, textAlign: 'center', padding: '16px 0' }}>No sessions saved yet</div>
        ) : (
          savedSessions.slice(0, 8).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < savedSessions.length - 1 ? `1px solid ${S.faint}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{PROGRAM[s.phase][s.day].title}</div>
                <div style={{ fontSize: 11, color: S.muted }}>Phase {s.phase} · Week {s.week} · {s.date}</div>
              </div>
              <div style={{ fontSize: 11, color: PHASES[s.phase].color, fontWeight: 700, background: `${PHASES[s.phase].color}18`, padding: '4px 10px', borderRadius: 8 }}>
                P{s.phase}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const MilestonesView = () => (
    <div className="fade-up" style={{ padding: '0 20px 100px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: S.muted, marginBottom: 16, textTransform: 'uppercase' }}>12-Week Milestones & Checkpoints</div>
      {MILESTONES.map((m, i) => {
        const ph: Phase = m.week <= 4 ? 1 : m.week <= 8 ? 2 : 3;
        const pc = PHASES[ph].color;
        const isPast = m.week < week;
        const isCurrent = m.week === week;
        return (
          <div key={m.week} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, display: 'flex', gap: 14, marginBottom: 12 }}>
            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: isPast ? pc : isCurrent ? pc : S.faint,
                border: `2px solid ${isPast || isCurrent ? pc : S.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPast && <span style={{ fontSize: 10, color: '#fff' }}>✓</span>}
                {isCurrent && <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>●</span>}
              </div>
              {i < MILESTONES.length - 1 && <div style={{ width: 1, flex: 1, background: isPast ? `${pc}66` : S.faint, marginTop: 4 }}/>}
            </div>
            {/* Content */}
            <div style={{ flex: 1, background: isCurrent ? `${pc}10` : S.card, border: `1px solid ${isCurrent ? `${pc}44` : S.cardBorder}`, borderRadius: 16, padding: '14px 16px', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isCurrent ? pc : S.text }}>Week {m.week}</div>
                <div style={{ fontSize: 11, color: pc, fontWeight: 600, background: `${pc}18`, padding: '3px 10px', borderRadius: 8 }}>
                  {PHASES[ph].name}
                </div>
              </div>
              {m.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: isPast ? pc : S.muted, flexShrink: 0 }}>{isPast ? '✓' : '○'}</span>
                  <span style={{ fontSize: 12, color: isPast ? S.text : isCurrent ? S.text : S.muted, lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const NAV = [
    { key: 'home', icon: '⊞', label: 'Home' },
    { key: 'workout', icon: '◈', label: 'Workout' },
    { key: 'nutrition', icon: '◎', label: 'Fuel' },
    { key: 'progress', icon: '△', label: 'Progress' },
    { key: 'milestones', icon: '◇', label: 'Plan' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <style>{css}</style>

      {/* Status bar spacer */}
      <div style={{ height: 8 }}/>

      {/* Header */}
      <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 26, fontFamily: "'Bebas Neue', cursive", letterSpacing: 4, color: S.text, lineHeight: 1 }}>IRONPATH</div>
          <div style={{ fontSize: 11, color: phaseColor, fontWeight: 600, letterSpacing: 2 }}>90-DAY TRANSFORMATION</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: S.muted }}>Current</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: phaseColor }}>Wk {week} · P{phase}</div>
        </div>
      </div>

      {/* Phase accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${phaseColor}, transparent)`, margin: '0 20px 20px' }}/>

      {/* Content */}
      {view === 'home' && <HomeView />}
      {view === 'workout' && <WorkoutView />}
      {view === 'nutrition' && <NutritionView />}
      {view === 'progress' && <ProgressView />}
      {view === 'milestones' && <MilestonesView />}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430,
        background: `${S.bg}EE`, borderTop: `1px solid ${S.cardBorder}`, backdropFilter: 'blur(20px)',
        padding: '10px 0 16px', display: 'flex', justifyContent: 'space-around', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setView(n.key as any)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent',
              cursor: 'pointer', padding: '4px 12px', borderRadius: 12, transition: 'all .2s' }}>
            <span style={{ fontSize: 20, opacity: view === n.key ? 1 : 0.4, filter: view === n.key ? 'none' : 'grayscale(1)', transition: 'all .2s' }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'DM Sans', color: view === n.key ? phaseColor : S.muted, letterSpacing: 0.5 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}