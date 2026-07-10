// =============================================================================
// ascii-fish-school.js — Boids-based ASCII fish school background animation
// =============================================================================
// Renders 80-120 ASCII fish across 2-5 schools on a full-screen canvas behind
// page content (z-index: 0, pointer-events: none). Simulation runs at a fixed
//   20Hz timestep; rendering targets 60fps for smooth motion.
//
// Key parameters (tunable):
//   PHYSICS_HZ       20       Fixed simulation timestep (Hz)
//   RENDER_FPS       40       Target render frame rate
//   MAX_FRAME_TIME   0.25s    Clamp to prevent spiral-of-death on tab switch
//   MAX_SPEED        80       px/s — top boid velocity (relaxed pace)
//   MAX_FORCE        150      px/s² — max steering acceleration (smooth)
//   SEPARATION_R     25px     Avoid-neighbor radius (separation)
//   ALIGNMENT_R      60px     Match-velocity radius (alignment)
//   COHESION_R       55px     Move-toward-center radius (cohesion)
//   BOUNDARY_MARGIN  50px     Push-back distance from canvas edge
//   SEPARATION_W     2.0
//   ALIGNMENT_W      1.8      Stronger → visible directional schools
//   COHESION_W       1.2
//   BOUNDARY_W       3.0      Firmer edge push-back
//   DRIFT_W          0.5      More purposeful school-target drift
//   FISH_COLOR       rgba(240,240,240,0.75)  softened on #111
//   FONT             '16px monospace'        larger for visibility
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

  // Respect user's motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- Tunable constants ------------------------------------------------
  const PHYSICS_HZ       = 20;
  const DT               = 1 / PHYSICS_HZ;         // 0.05 s per physics step
  const MAX_FRAME_TIME   = 0.25;                   // seconds
  const RENDER_FPS       = 60;
  const RENDER_INTERVAL  = 1000 / RENDER_FPS;      // ms between renders

  const SEPARATION_R     = 70;    // px — personal space radius
  const ALIGNMENT_R      = 60;    // px — wider catch radius for school coherence
  const COHESION_R       = 55;    // px — slightly wider to pull loose fish back
  const BOUNDARY_MARGIN  = 50;    // px

  const SEPARATION_W     = 8.0;   // strong personal space
  const ALIGNMENT_W      = 1.8;   // stronger directional matching → visible schools
  const COHESION_W       = 1.2;   // slightly stronger grouping pull
  const BOUNDARY_W       = 3.0;   // firmer edge push-back (no escapees)
  const DRIFT_W          = 0.5;   // more purposeful school-target drift

  const MAX_SPEED        = 80;    // px/s — relaxed, natural pace
  const MAX_FORCE        = 150;   // px/s² — smoother, less jerky steering

  const MOUSE_RADIUS      = 180;   // px — repulsion range from cursor
  const MOUSE_PANIC_R     = 60;    // px — close range: direct velocity redirect
  const MOUSE_WEIGHT      = 6.0;   // avoidance steering force

  const FISH_COLOR       = 'rgba(240,240,240,0.75)';  // softened for #111 bg harmony
  const FONT             = '16px monospace';           // larger for visibility
  const MIN_FISH_GAP     = 20;    // px

const SHARK_REPULSION_R = 250;   // px — avoidance zone
  const SHARK_PANIC_R     = 120;   // px — panic zone: up to 10× speed scatter
const SHARK_REPULSION_W = 25.0;  // avoidance steering force

  // ---- Curious fish constants ----
  const CURIOUS_IDLE_TIME = 2500;    // ms — mouse must be idle this long
  const CURIOUS_COUNT = 6;           // max curious fish
  const CURIOUS_APPROACH_R = 60;     // px — approach radius constant
  let curiousBoids = [];             // references to curious boid objects

  // ---- Mouse avoidance state ----
  const mouse = { x: -1000, y: -1000, active: false, lastMove: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    mouse.lastMove = performance.now();
  });

  document.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // ---- Canvas setup -----------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;z-index:0;pointer-events:none;width:100vw;height:100vh;top:0;left:0;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // reset before re-scaling
    ctx.scale(dpr, dpr);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const getW = () => window.innerWidth;
  const getH = () => window.innerHeight;

  // ---- Boid class -------------------------------------------------------
  class Boid {
    constructor(x, y) {
      this.x  = x;
      this.y  = y;
      this.vx = (Math.random() - 0.5) * 60;
      this.vy = (Math.random() - 0.5) * 60;
      this.ax = 0;
      this.ay = 0;
      this.alive = true;
      this.curious = false;
      this.speed  = 0.3 + Math.random() * 1.2; // 0.3–1.5: some fish are slow/dumb
      this.color = `rgba(240,240,240,${0.55 + Math.random() * 0.4})`;
    }
  }

  // ---- School class -----------------------------------------------------
  class School {
    constructor(boids, targetX, targetY) {
      this.boids             = boids;
      this.count             = boids.length;
      this.targetX           = targetX;
      this.targetY           = targetY;
    }
  }

  // ---- Fish character & rendering ---------------------------------------
  // Multi-character ASCII fish rotated to match velocity direction
  const FISH_CHAR = '><>';
  const SHARK_CHAR = '<///))><';
  const SHARK_FONT = '22px sans-serif';
  let fishHalfWidth = 7; // default, measured after font set
  let sharkHalfWidth = 12; // default, measured after font set

  function renderFish(boid) {
    ctx.fillStyle = boid.curious && boid._curiousColor ? boid._curiousColor : boid.color;
    const angle = Math.atan2(boid.vy, boid.vx);
    ctx.save();
    ctx.translate(Math.round(boid.x), Math.round(boid.y));
    ctx.rotate(angle);
    ctx.fillText(FISH_CHAR, -fishHalfWidth, 5);
    ctx.restore();
  }

  function renderShark(shark) {
    const angle = Math.atan2(shark.vy, shark.vx) + Math.PI;
    ctx.save();
    ctx.translate(Math.round(shark.x), Math.round(shark.y));
    ctx.rotate(angle);
    // Draw character-by-character with tight spacing
    let xOff = -sharkHalfWidth;
    for (const ch of SHARK_CHAR) {
      ctx.fillText(ch, xOff, 5);
      xOff += ctx.measureText(ch).width * 0.65; // 65% advance for tight spacing
    }
    ctx.restore();
  }

  // ---- Initialise schools & boids ---------------------------------------
  const numSchools = 2 + Math.floor(Math.random() * 4);     // 2–5
  const totalBoids = 80 + Math.floor(Math.random() * 41);   // 80–120

  // Distribute boids roughly evenly, each school 8–30
  const boidCounts = [];
  let remaining = totalBoids;
  for (let i = 0; i < numSchools; i++) {
    if (i === numSchools - 1) {
      boidCounts.push(remaining);
    } else {
      const min = Math.max(8, Math.floor(remaining / (numSchools - i)));
      const max = Math.min(60, remaining - (numSchools - i - 1) * 8);
      const count = min + Math.floor(Math.random() * (max - min + 1));
      boidCounts.push(count);
      remaining -= count;
    }
  }

  const schools = [];
  for (const count of boidCounts) {
    const boids = [];
    for (let i = 0; i < count; i++) {
      boids.push(new Boid(Math.random() * getW(), Math.random() * getH()));
    }
    const tx = Math.random() * getW();
    const ty = Math.random() * getH();
    schools.push(new School(boids, tx, ty));
  }

  // ---- Shark (predator) ------------------------------------------------
  const shark = {
    x: Math.random() * getW(),
    y: Math.random() * getH(),
    vx: (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 40,
    targetX: Math.random() * getW(),
    targetY: Math.random() * getH(),
    mode: 'cruise',        // 'cruise' | 'hunt'
    huntTarget: null,       // reference to a boid
    modeTimer: 0,           // countdown until mode switch
    huntCooldown: 0,        // prevent immediate re-hunt
    trail: [],              // ghost positions during hunt
    huntElapsed: 0,         // ms — time in current hunt, for speed ramp
    decelTimer: 0,          // ms — deceleration blend timer after hunt
  };

  // ---- Death animation state ------------------------------------------
  const deadBoids = [];     // { boid, x, y, life, particles[] }

  // ---- Scatter event state ---------------------------------------------
  const SCATTER_INTERVAL = 15000;  // min 15s between scatters
  let nextScatter = performance.now() + 20000 + Math.random() * 15000; // 20–35s

  // ---- Physics update (fixed timestep) ----------------------------------
  function updatePhysics(dt) {
    const w = getW();
    const h = getH();

    for (const school of schools) {
      for (const boid of school.boids) {
        if (!boid.alive) continue;
        // Reset acceleration each step
        boid.ax = 0;
        boid.ay = 0;

        let sepX = 0, sepY = 0, sepN = 0;
        let aliVx = 0, aliVy = 0, aliN = 0;
        let cohX = 0, cohY = 0, cohN = 0;

        if (!boid.curious) {
        // --- Accumulate steering from school-mates -----------------------
        for (const other of school.boids) {
          if (other === boid) continue;

          const dx = boid.x - other.x;
          const dy = boid.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Separation: steer away from close neighbours (quadratic-ish falloff)
          if (dist < SEPARATION_R && dist > 0) {
            const w = (SEPARATION_R - dist) / SEPARATION_R; // 1 at 0px → 0 at margin
            sepX += (dx / dist) * w * w;    // squared = much stronger when close
            sepY += (dy / dist) * w * w;
            sepN++;
          }

          // Alignment: match average velocity of neighbours
          if (dist < ALIGNMENT_R) {
            aliVx += other.vx;
            aliVy += other.vy;
            aliN++;
          }

          // Cohesion: move toward average position of neighbours
          if (dist < COHESION_R) {
            cohX += other.x;
            cohY += other.y;
            cohN++;
          }
        }

        // --- Apply separation --------------------------------------------
        if (sepN > 0) {
          boid.ax += (sepX / sepN) * SEPARATION_W;
          boid.ay += (sepY / sepN) * SEPARATION_W;
        }

        // --- Apply alignment ---------------------------------------------
        if (aliN > 0) {
          boid.ax += (aliVx / aliN - boid.vx) * ALIGNMENT_W;
          boid.ay += (aliVy / aliN - boid.vy) * ALIGNMENT_W;
        }

        // --- Apply cohesion ----------------------------------------------
        if (cohN > 0) {
          boid.ax += (cohX / cohN - boid.x) * COHESION_W;
          boid.ay += (cohY / cohN - boid.y) * COHESION_W;
        }

        // --- School centre drift -----------------------------------------
        boid.ax += (school.targetX - boid.x) * DRIFT_W;
        boid.ay += (school.targetY - boid.y) * DRIFT_W;
        } else {
        // --- Curious fish: two-phase (approach → linger) ----------------
        if (mouse.active) {
          const mx = mouse.x - boid.x;
          const my = mouse.y - boid.y;
          const mdist = Math.sqrt(mx * mx + my * my);
          const nx = mx / mdist, ny = my / mdist;

          // Transition to linger when close enough
          if (mdist < 60 && !boid._lingering) boid._lingering = true;

          if (!boid._lingering) {
            // --- APPROACH phase: dart or cruise toward mouse ---
            if (boid._approachMode === 'dart') {
              boid.vx = nx * MAX_SPEED * 0.85;
              boid.vy = ny * MAX_SPEED * 0.85;
            } else {
              boid.vx = nx * MAX_SPEED * (mdist > 200 ? 0.6 : mdist > 100 ? 0.45 : 0.3);
              boid.vy = ny * MAX_SPEED * (mdist > 200 ? 0.6 : mdist > 100 ? 0.45 : 0.3);
            }
          } else {
            // --- LINGER phase: orbit or hover near mouse ---
            if (boid._lingerMode === 'orbit') {
              const targetR = 65;
              const tx = -ny, ty = nx; // perpendicular
              const orbitSpeed = MAX_SPEED * 0.55;
              boid.vx = tx * orbitSpeed;
              boid.vy = ty * orbitSpeed;
              // Radial correction
              if (mdist < targetR - 10) {
                boid.vx -= nx * 15; boid.vy -= ny * 15;
              } else if (mdist > targetR + 10) {
                boid.vx += nx * 15; boid.vy += ny * 15;
              }
            } else {
              // Hover: drift gently near mouse
              if (mdist > 70) {
                const sp = mdist > 200 ? 0.5 : 0.3;
                boid.vx = nx * MAX_SPEED * sp;
                boid.vy = ny * MAX_SPEED * sp;
              } else {
                boid.vx *= 0.96; boid.vy *= 0.96;
                boid.vx += (Math.random() - 0.5) * 15;
                boid.vy += (Math.random() - 0.5) * 15;
              }
            }
          }
        }
        }

        // --- Boundary force (linear falloff from margin) -----------------
        if (boid.x < BOUNDARY_MARGIN) {
          boid.ax += BOUNDARY_W * (BOUNDARY_MARGIN - boid.x) / BOUNDARY_MARGIN;
        }
        if (boid.x > w - BOUNDARY_MARGIN) {
          boid.ax -= BOUNDARY_W * (boid.x - (w - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN;
        }
        if (boid.y < BOUNDARY_MARGIN) {
          boid.ay += BOUNDARY_W * (BOUNDARY_MARGIN - boid.y) / BOUNDARY_MARGIN;
        }
        if (boid.y > h - BOUNDARY_MARGIN) {
          boid.ay -= BOUNDARY_W * (boid.y - (h - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN;
        }

        // --- Mouse avoidance (disabled when idle — fish pass through) -----
        if (mouse.active && !boid.curious && (performance.now() - mouse.lastMove) < CURIOUS_IDLE_TIME) {
          const dx = boid.x - mouse.x;
          const dy = boid.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_PANIC_R && dist > 0) {
            // Panic: instant redirect away from cursor
            const t = 1 - dist / MOUSE_PANIC_R;
            boid.vx = (dx / dist) * MAX_SPEED * boid.speed * (0.5 + t * 0.5);
            boid.vy = (dy / dist) * MAX_SPEED * boid.speed * (0.5 + t * 0.5);
          } else if (dist < MOUSE_RADIUS && dist > 0) {
            // Avoidance: quadratic steering
            const t = 1 - dist / MOUSE_RADIUS;
            const force = MOUSE_WEIGHT * t * t;
            boid.ax += (dx / dist) * force;
            boid.ay += (dy / dist) * force;
          }
        }

        // --- Shark avoidance (two-zone: panic + avoidance) ----------------
        {
          const dx = boid.x - shark.x;
          const dy = boid.y - shark.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // --- Death detection: shark in hunt mode & close enough ---
          if (shark.mode === 'hunt' && dist < 45) {
            boid.alive = false;
            const particleChars = ['*', '.', '~', '+'];
            const count = 3 + Math.floor(Math.random() * 2); // 3–4
            const particles = [];
            for (let k = 0; k < count; k++) {
              particles.push({
                x: boid.x,
                y: boid.y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                char: particleChars[k],
              });
            }
            deadBoids.push({ boid, x: boid.x, y: boid.y, life: 2, particles });
            continue; // skip rest of physics for this now-dead boid
          }

          if (dist < SHARK_PANIC_R && dist > 0) {
            // Panic zone: instant scatter — speed scales with proximity
            const t = 1 - dist / SHARK_PANIC_R; // 1 at 0, 0 at margin
            const escapeSpeed = MAX_SPEED * (1.0 + t * 9) * boid.speed; // dumb fish slower
            boid.vx = (dx / dist) * escapeSpeed;
            boid.vy = (dy / dist) * escapeSpeed;
            // Curious fish flee the shark
            if (boid.curious && dist < SHARK_PANIC_R) {
              boid.curious = false;
              boid._curiousColor = null;
              boid._curiousEnd = null;
              boid._lingering = false;
              curiousBoids = curiousBoids.filter(cb => cb !== boid);
            }
          } else if (dist < SHARK_REPULSION_R && dist > 0) {
            // Avoidance zone: gradual steering
            const t = 1 - dist / SHARK_REPULSION_R;
            const force = SHARK_REPULSION_W * t * t;
            boid.ax += (dx / dist) * force;
            boid.ay += (dy / dist) * force;
          }
        }

        // --- Clamp acceleration ------------------------------------------
        const aMag = Math.sqrt(boid.ax * boid.ax + boid.ay * boid.ay);
        if (aMag > MAX_FORCE) {
          boid.ax = (boid.ax / aMag) * MAX_FORCE;
          boid.ay = (boid.ay / aMag) * MAX_FORCE;
        }

        // --- Integrate velocity (Euler) ----------------------------------
        boid.vx += boid.ax * dt;
        boid.vy += boid.ay * dt;

        // --- Clamp velocity ----------------------------------------------
        const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
        if (speed > MAX_SPEED) {
          boid.vx = (boid.vx / speed) * MAX_SPEED;
          boid.vy = (boid.vy / speed) * MAX_SPEED;
        }

        // --- Integrate position ------------------------------------------
        boid.x += boid.vx * dt;
        boid.y += boid.vy * dt;
      }
    }

    // --- Collision resolution (hard push apart) ------------------------
    // Direct position-based — prevents visual overlap that steering
    // separation misses in dense schools (80-120 fish).
    const allBoids = [];
    for (const s of schools) {
      for (const b of s.boids) allBoids.push(b);
    }
    for (let i = 0; i < allBoids.length; i++) {
      for (let j = i + 1; j < allBoids.length; j++) {
        const a = allBoids[i], b = allBoids[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_FISH_GAP && dist > 0) {
          const overlap = MIN_FISH_GAP - dist;
          const nx = dx / dist, ny = dy / dist;
          a.x += nx * overlap / 2;
          a.y += ny * overlap / 2;
          b.x -= nx * overlap / 2;
          b.y -= ny * overlap / 2;
        }
      }
    }

    // --- Dead boid lifecycle (particles, respawn) -----------------------
    for (let i = deadBoids.length - 1; i >= 0; i--) {
      const d = deadBoids[i];
      d.life -= dt;
      if (d.life <= 0) {
        // Respawn at random screen edge
        d.boid.alive = true;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: d.boid.x = Math.random() * w; d.boid.y = -20; break;
          case 1: d.boid.x = Math.random() * w; d.boid.y = h + 20; break;
          case 2: d.boid.x = -20; d.boid.y = Math.random() * h; break;
          case 3: d.boid.x = w + 20; d.boid.y = Math.random() * h; break;
        }
        deadBoids.splice(i, 1);
      } else {
        // Update debris particles
        for (const p of d.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 30 * dt; // subtle gravity
        }
      }
    }

    // --- Shark physics (mode-based: cruise / hunt) --------------------
    if (shark.mode === 'hunt' && shark.huntTarget) {
      // Hunt mode: aggressive dash toward target fish
      const steerX = (shark.huntTarget.x - shark.x) * 1.0;
      const steerY = (shark.huntTarget.y - shark.y) * 1.0;
      shark.vx += steerX * dt;
      shark.vy += steerY * dt;
    } else {
      // Cruise mode: slow wandering toward waypoint
      shark.vx += (shark.targetX - shark.x) * 0.15 * dt;
      shark.vy += (shark.targetY - shark.y) * 0.15 * dt;
    }

    // Boundary avoidance
    if (shark.x < BOUNDARY_MARGIN) {
      shark.vx += BOUNDARY_W * (BOUNDARY_MARGIN - shark.x) / BOUNDARY_MARGIN * dt;
    }
    if (shark.x > w - BOUNDARY_MARGIN) {
      shark.vx -= BOUNDARY_W * (shark.x - (w - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN * dt;
    }
    if (shark.y < BOUNDARY_MARGIN) {
      shark.vy += BOUNDARY_W * (BOUNDARY_MARGIN - shark.y) / BOUNDARY_MARGIN * dt;
    }
    if (shark.y > h - BOUNDARY_MARGIN) {
      shark.vy -= BOUNDARY_W * (shark.y - (h - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN * dt;
    }

    // Mouse avoidance (weaker than regular fish)
    if (mouse.active) {
      const dx = shark.x - mouse.x;
      const dy = shark.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = 1.5 * (1 - dist / MOUSE_RADIUS);
        shark.vx += (dx / dist) * force * dt;
        shark.vy += (dy / dist) * force * dt;
      }
    }

    // Hunt elapsed timer (accumulate in ms for ramp formula)
    if (shark.mode === 'hunt') {
      shark.huntElapsed += dt * 1000;
    } else {
      shark.huntElapsed = 0;
    }

    // Speed clamp: ramp from 0.5× → 1.5× over 3 s during hunt; decel 1.5→0.5 over 2s after
    const sharkSpeed = Math.sqrt(shark.vx * shark.vx + shark.vy * shark.vy);
    const sharkMax = shark.mode === 'hunt'
      ? MAX_SPEED * (0.5 + Math.min(shark.huntElapsed / 3000, 1) * 1.0)
      : (() => {
          const blend = Math.min(shark.decelTimer / 2000, 1);
          if (shark.decelTimer > 0) shark.decelTimer -= dt * 1000;
          return MAX_SPEED * (0.5 + 1.0 * blend); // 1.5→0.5 over 2s
        })();
    if (sharkSpeed > sharkMax) {
      shark.vx = (shark.vx / sharkSpeed) * sharkMax;
      shark.vy = (shark.vy / sharkSpeed) * sharkMax;
    }

    // Integrate position
    shark.x += shark.vx * dt;
    shark.y += shark.vy * dt;
  }

  // ---- School target refresh (called once per frame before physics) -----
  function updateSchoolTargets(now) {
    const w = getW();
    const h = getH();
    for (const school of schools) {
      if (now >= school._nextTarget) {
        school.targetX    = Math.random() * w;
        school.targetY    = Math.random() * h;
        school._nextTarget = now + 5000 + Math.random() * 5000;  // 5–10 s
      }
    }

    // --- Scatter event: random stampede ---
    if (now >= nextScatter) {
      for (const school of schools) {
        for (const boid of school.boids) {
          if (!boid.alive) continue;
          boid.vx += (Math.random() - 0.5) * 200 * boid.speed;
          boid.vy += (Math.random() - 0.5) * 200 * boid.speed;
        }
      }
      nextScatter = now + 20000 + Math.random() * 20000; // 20–40 s
    }

    // --- Curious fish management -----------------------------------------
    const mouseIdleTime = now - mouse.lastMove;

    // Mouse moved — instant panic scatter for all curious fish, then release
    if (!mouse.active || mouseIdleTime < 500) {
      for (const b of curiousBoids) {
        if (b.alive) {
          const dx = b.x - mouse.x, dy = b.y - mouse.y;
          const d = Math.sqrt(dx*dx + dy*dy) || 1;
          b.vx = (dx/d) * MAX_SPEED * 1.5;
          b.vy = (dy/d) * MAX_SPEED * 1.5;
        }
        b.curious = false; b._curiousColor = null;
        b._curiousMode = null; b._curiousEnd = null;
        b._lingering = false;
      }
      curiousBoids = [];
    }

    // Pick new curious fish — when enough idle time and slots available
    if (mouse.active && mouseIdleTime > CURIOUS_IDLE_TIME) {
      // Expire fish past their time limit
      for (let i = curiousBoids.length - 1; i >= 0; i--) {
        const b = curiousBoids[i];
        if (now >= b._curiousEnd) {
          b.curious = false; b._curiousColor = null;
          b._curiousMode = null; b._curiousEnd = null;
          b._lingering = false;
          curiousBoids.splice(i, 1);
        }
      }

      // Fill slots: pick random alive non-curious fish
      while (curiousBoids.length < CURIOUS_COUNT) {
        const candidates = [];
        for (const s of schools) {
          for (const b of s.boids) {
            if (b.alive && !b.curious) candidates.push(b);
          }
        }
        if (candidates.length === 0) break;
        const b = candidates[Math.floor(Math.random() * candidates.length)];
        b.curious = true;
        b.vx *= 0.3; b.vy *= 0.3; // shed school velocity
        b._curiousEnd = now + 10000 + Math.random() * 20000; // 10–30s
        b._approachMode = Math.random() < 0.4 ? 'dart' : 'cruise';
        b._lingerMode = Math.random() < 0.5 ? 'orbit' : 'hover';
        b._lingering = false;
        b._curiousColor = 'rgba(255,220,150,0.9)';
        curiousBoids.push(b);
      }
    }
  }

  // ---- Shark AI (mode switching + waypoint refresh) --------------------
  function updateSharkAI(now) {
    const w = getW(), h = getH();

    // Mode switching logic
    if (now >= shark.modeTimer) {
      if (shark.mode === 'cruise' && shark.huntCooldown <= 0) {
        // Switch to hunt: pick a random ALIVE fish to chase
        const allBoids = [];
        for (const s of schools) allBoids.push(...s.boids);
        const aliveBoids = allBoids.filter(b => b.alive);
        if (aliveBoids.length > 0) {
          shark.huntTarget = aliveBoids[Math.floor(Math.random() * aliveBoids.length)];
          shark.mode = 'hunt';
          shark.modeTimer = now + 4000 + Math.random() * 4000; // hunt 4-8s
        }
      } else if (shark.mode === 'hunt') {
        // Check if shark is close to target — extend hunt if near
        if (shark.huntTarget) {
          const dx = shark.x - shark.huntTarget.x;
          const dy = shark.y - shark.huntTarget.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            // Extend: still chasing, give more time
            shark.modeTimer = now + 1500 + Math.random() * 1500;
            return;
          }
        }
        // End hunt, start cooldown
        shark.mode = 'cruise';
        shark.decelTimer = 2000;
        shark.huntTarget = null;
      shark.huntCooldown = 8000 + Math.random() * 7000; // 8-15s cooldown
      shark.modeTimer = now + 4000 + Math.random() * 6000; // cruise 4-10s before next check
      }
    }

    // Hunt cooldown timer
    if (shark.huntCooldown > 0) {
      shark.huntCooldown -= (now - (shark._lastFrame || now));
    }

    // Check if hunt target is gone (fish died or out of bounds)
    if (shark.mode === 'hunt' && (!shark.huntTarget || !shark.huntTarget.alive || !shark.huntTarget.x)) {
      shark.mode = 'cruise';
      shark.decelTimer = 2000;
      shark.huntTarget = null;
      shark.huntCooldown = 2000;
    }

    // Cruise mode: refresh waypoint periodically
    if (shark.mode === 'cruise' && now >= shark._nextTarget) {
      shark.targetX = Math.random() * w;
      shark.targetY = Math.random() * h;
      shark._nextTarget = now + 4000 + Math.random() * 6000; // 4-10s
    }

    shark._lastFrame = now;
  }
  // End updateSharkAI

  // ---- Render -----------------------------------------------------------
  function render() {
    const w = getW(), h = getH();
    ctx.clearRect(0, 0, w, h);
    ctx.font      = FONT;
    ctx.fillStyle = FISH_COLOR;
    // Measure once per render in case font metrics aren't ready at init
    fishHalfWidth = ctx.measureText(FISH_CHAR).width / 2;

    // --- Render alive fish (skip dead ones) ---
    for (const school of schools) {
      for (const boid of school.boids) {
        if (!boid.alive) continue;
        renderFish(boid);
      }
    }

    // --- Render dead fish debris ---
    ctx.font = FONT;
    for (const d of deadBoids) {
      const alpha = Math.max(0, d.life / 2);
      ctx.fillStyle = `rgba(200,200,200,${alpha})`;
      for (const p of d.particles) {
        ctx.fillText(p.char, Math.round(p.x), Math.round(p.y));
      }
    }

    // --- Measure shark dimensions ---
    ctx.font = SHARK_FONT;
    sharkHalfWidth = 0;
    for (const ch of SHARK_CHAR) {
      sharkHalfWidth += ctx.measureText(ch).width * 0.65;
    }
    sharkHalfWidth /= 2;

    // --- Shark hunt trail ---
    if (shark.mode === 'hunt') {
      shark.trail.push({ x: shark.x, y: shark.y, vx: shark.vx, vy: shark.vy });
      if (shark.trail.length > 12) shark.trail.shift();
      for (let i = 0; i < shark.trail.length; i++) {
        const alpha = 0.05 + (i / shark.trail.length) * 0.35;
        ctx.fillStyle = `rgba(255,100,100,${alpha})`;
        const t = shark.trail[i];
        const angle = Math.atan2(t.vy, t.vx) + Math.PI;
        ctx.save();
        ctx.translate(Math.round(t.x), Math.round(t.y));
        ctx.rotate(angle);
        let xOff = -sharkHalfWidth;
        for (const ch of SHARK_CHAR) {
          ctx.fillText(ch, xOff, 5);
          xOff += ctx.measureText(ch).width * 0.65;
        }
        ctx.restore();
      }
    } else {
      shark.trail = [];
    }

    // Render shark on top — bold sans-serif, larger, tight spacing
    ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
    renderShark(shark);
    ctx.font = FONT;  // restore monospace for next frame
  }

  // ---- Main rAF loop (fixed-timestep accumulator) -----------------------
  let accumulator    = 0;
  let lastTime       = performance.now();
  let lastRenderTime = 0;

  // Prime the first-target timers so they fire 3–8 s after start
  const t0 = performance.now();
  for (const school of schools) {
    school._nextTarget = t0 + 5000 + Math.random() * 5000;
  }
  shark._nextTarget = t0 + 4000 + Math.random() * 6000;
  shark.modeTimer = t0 + 5000 + Math.random() * 8000;  // first mode switch after 5-13s

  function loop(now) {
    let frameTime = (now - lastTime) / 1000;   // seconds
    lastTime = now;

    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
    accumulator += frameTime;

    // Spin physics at fixed DT until accumulator is consumed
    while (accumulator >= DT) {
      updateSchoolTargets(now);
      updateSharkAI(now);
      updatePhysics(DT);
      accumulator -= DT;
    }

    // Throttle rendering to target fps
    if (now - lastRenderTime >= RENDER_INTERVAL) {
      render();
      lastRenderTime = now;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

});
