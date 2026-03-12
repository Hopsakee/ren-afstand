

# Running Workout Distance Calculator

A single-purpose calculator that translates structured running workouts into total estimated distance.

## How It Works

You input your workout segments (from your training app screenshot) into a structured form, and the app instantly calculates the total distance you'll run.

## Features

### Segment Input Form
- **Segment name** (optional): e.g., "Warm-up", "Workout", "Cool-down"
- **Duration**: minutes and/or seconds
- **Pace range**: min pace and max pace (min:sec /km format) — the app averages them automatically
- **Repetitions**: for interval segments (e.g., 7x)
- **Multiple phases per segment**: for complex intervals like "7x (15s fast + 10s recovery)", you can add sub-phases with different paces

### Live Calculation
- Each segment shows its calculated distance as you type
- A large, always-visible **total distance** at the top updates in real-time
- No "Calculate" button needed — it's instant

### Segment List
- Added segments appear in a clean list below the form
- Each shows name, structure summary, and calculated distance
- Delete individual segments or reset all

### Design
- Clean, instrument-like UI with Manrope font
- Marigold yellow accent color on cool neutral background
- Large 56px tap targets for mobile use
- Sticky bottom action bar with "Add Segment" and "Reset"
- Smooth animations when adding/removing segments

### Example Flow (from your image)
1. Add "Warm-up": 11 min, pace 9:14–5:42 → calculates ~1.47 km
2. Add "Workout": 7x, phase 1: 15s at 5:31–5:12, phase 2: 10s at 6:28–5:42 → calculates distance
3. Add remaining segments...
4. See total at top: e.g., **~6.2 km**

