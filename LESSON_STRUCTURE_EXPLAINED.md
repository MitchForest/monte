# Lesson Structure Explained

## 📚 **Current Structure Overview**

Your lesson system has a **hierarchical structure** with clear divisions:

```
LESSON: Golden Bead Multiplication
├── SEGMENT 1: Presentation (Tutorial)
│   ├── ACTION 1: Narrate "We will multiply..."
│   ├── ACTION 2: Show 1000 card
│   ├── ACTION 3: Show 300 card
│   ├── ACTION 4: Show 60 card
│   ├── ACTION 5: Show 7 card
│   ├── ACTION 6: Show multiplier 3
│   ├── ACTION 7: Narrate "Stack the cards..."
│   ├── ACTION 8: Narrate "Collect beads..."
│   ├── ACTION 9: Place thousand beads
│   ├── ACTION 10: Place hundred beads
│   ├── ACTION 11: Place ten beads
│   ├── ACTION 12: Place unit beads
│   ├── ACTION 13: Narrate "Lay yellow ribbon..."
│   ├── ACTION 14: Highlight ribbon
│   ├── ACTION 15: Narrate "Repeat 3 times..."
│   ├── ACTION 16: Duplicate tray 3 times
│   ├── ACTION 17: Narrate "Gather units..."
│   ├── ACTION 18: Exchange units
│   ├── ACTION 19: Write result
│   ├── ACTION 20: Narrate "Gather tens..."
│   ├── ACTION 21: Exchange tens
│   ├── ACTION 22: Write result
│   ├── ACTION 23: Narrate "Gather hundreds..."
│   ├── ACTION 24: Exchange hundreds
│   ├── ACTION 25: Write result
│   ├── ACTION 26: Narrate "Stack place values..."
│   ├── ACTION 27: Stack place values
│   ├── ACTION 28: Write final result
│   └── ACTION 29: Narrate "1,367 × 3 = 4,101"
│
├── SEGMENT 2: Guided Practice
│   ├── STEP 1: Build base (1,367 beads)
│   ├── STEP 2: Duplicate (create 3 copies)
│   ├── STEP 3: Exchange units
│   ├── STEP 4: Exchange tens
│   ├── STEP 5: Exchange hundreds
│   └── STEP 6: Stack result
│
└── SEGMENT 3: Independent Practice
    ├── QUESTION 1: 1,367 × 3 (easy - same as tutorial)
    ├── QUESTION 2: Random problem (medium)
    ├── QUESTION 3: Random problem (medium)
    ├── QUESTION 4: Random problem (hard)
    └── QUESTION 5: Random problem (hard)
```

---

## 🎯 **Key Terminology:**

### **LESSON** (Top level)
- One complete learning experience
- Example: "Golden Bead Multiplication"
- Has 3 segments

### **SEGMENT** (Middle level)
- Major phase of the lesson
- 3 types: `presentation`, `guided`, `practice`
- Each segment is shown in the **timeline** (the 3 dots at bottom)

### **ACTIONS** (Presentation only)
- Individual steps in the animated presentation
- 29 total actions in this lesson
- Each action: narrate, show card, place beads, exchange, etc.
- Auto-advances every 3.2 seconds

### **STEPS** (Guided only)
- Progressive challenges for student
- 6 steps in this guided practice
- Student must complete each step before moving to next

### **QUESTIONS** (Practice only)
- Independent problems
- 5 questions per practice segment
- Fast pass: Get first 2 right OR any 3 right
- Fast fail: Get 3 wrong = restart entire lesson

---

## 📊 **Timeline Representation**

### **What the Timeline Currently Shows:**

```
●━━━━━━━━━━━●━━━━━━━━━━━━━●
Presentation   Guided        Practice
(Tutorial)     (6 steps)     (5 questions)
```

**3 dots = 3 segments**

Each dot represents one SEGMENT, NOT individual actions/steps/questions.

---

## ⚠️ **Timeline Progress Issue:**

The timeline should show progress as you move through the lesson:

- **Segment 1 active:** First dot highlighted, progress bar at 0%
- **Segment 2 active:** Second dot highlighted, progress bar at 50%
- **Segment 3 active:** Third dot highlighted, progress bar at 100%

**Current problem:** The progress bar (blue line) doesn't update during auto-play. It stays at 0% even though the presentation auto-advances to guided practice.

**Why:** The `LessonTimeline` component receives `activeIndex` from `lesson.tsx`, but when the XState machine auto-advances (via `COMPLETE` event), the activeIndex should update. Need to verify the machine is properly updating the index.

---

## 💡 **Design Decisions for Timeline:**

You have options for how to signify progress:

### **Option A: Keep Current (Simple - 3 dots)**
- ✅ Pro: Clean, minimal
- ✅ Pro: Easy for K-3 to understand (3 big steps)
- ❌ Con: Doesn't show sub-progress within segments
- **Use case:** "I'm on step 2 of 3"

### **Option B: Show Sub-Steps (More detail)**
```
●━━●━●━●━●━●━●━●━━━━━━━━━━●
P  G1 G2 G3 G4 G5 G6        Q1-Q5
```
- ✅ Pro: Shows all 14 sub-steps (1 presentation + 6 guided + 5 practice + 2 transitions)
- ❌ Con: Too many dots for K-3 learners
- ❌ Con: Cognitive overload
- **Use case:** "I'm on step 8 of 14"

### **Option C: Hybrid (Segments with progress)**
```
●━━━━━━━━━━━●━━━━━━━━━━━━━●
[████░░]      [░░░░░░]      [░░░░░]
Presentation  Guided        Practice
(1 action)    (Step 3/6)    (Q 0/5)
```
- ✅ Pro: Shows segment AND internal progress
- ✅ Pro: Still only 3 main dots (K-3 friendly)
- ✅ Pro: Parents/teachers can see detailed progress
- ❌ Con: Slightly more complex to implement
- **Use case:** "I'm in guided practice, on step 3 of 6"

### **Option D: Super Minimal (What you have now)**
```
●━━━━━━━━━━━●━━━━━━━━━━━━━●
Tutorial      Practice      Done
```
- ✅ Pro: Absolute minimum - perfect for cognitive load theory
- ✅ Pro: K-3 learners just see "where am I?"
- ❌ Con: No progress detail
- **Recommendation:** This aligns best with your "ZERO distractions" principle

---

## 🎨 **My Recommendation:**

For K-3 learners following cognitive load theory:

**Keep the simple 3-dot timeline** BUT:
1. Make dots BIGGER (easier to see/touch)
2. Use COLORS or ICONS instead of text labels
3. Progress bar should animate as lesson advances
4. Consider:
   - 🎬 Tutorial (blue dot)
   - ✋ Practice with help (green dot)  
   - 🌟 Practice alone (yellow dot)

**No text labels on hover** - just visual progress.

---

## 🐛 **Issues Found:**

1. ✅ **Play/Pause button** - WORKS! Shows "Pause" when playing
2. ✅ **Fixed screen layout** - No more overflow
3. ✅ **Number cards positioned** - Centered properly now
4. ✅ **Caption display** - Large, prominent, updates automatically
5. ⚠️ **Timeline progress bar** - Doesn't animate (needs investigation)
6. ⚠️ **Golden beads rendering** - Still not showing (despite script running)

---

## 🔍 **Timeline Progress Investigation:**

Looking at the code:
- `LessonTimeline` calculates: `(activeIndex / (count - 1)) * 100`
- For 3 segments: 0% → 50% → 100%
- XState machine sends `COMPLETE` event which should increment `index`

**Need to verify:** Is `activeIndex` actually updating in the parent component when presentation finishes?

Let me check this next...

