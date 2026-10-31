// Generates seamless, royalty-free sleep loops as 16-bit mono WAV files.
// Run with: npm run sounds
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 22050;
const DUR = 10;
const N = SR * DUR;
const FADE = Math.floor(SR * 0.3);
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/sounds');

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;
const zeros = (n = N) => new Float32Array(n);

function white(n, rng) {
  const x = zeros(n);
  for (let i = 0; i < n; i++) x[i] = rng() * 2 - 1;
  return x;
}

function pink(n, rng) {
  const x = zeros(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = rng() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.2;
    b6 = w * 0.115926;
  }
  return x;
}

function brown(n, rng) {
  const x = zeros(n);
  let s = 0;
  for (let i = 0; i < n; i++) {
    s = (s + 0.02 * (rng() * 2 - 1)) / 1.02;
    x[i] = s * 3.5;
  }
  return x;
}

const coef = (fc) => 1 - Math.exp((-TAU * fc) / SR);

function lowpass(x, fc) {
  const a = coef(fc);
  const y = zeros(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    s += a * (x[i] - s);
    y[i] = s;
  }
  return y;
}

function highpass(x, fc) {
  const l = lowpass(x, fc);
  const y = zeros(x.length);
  for (let i = 0; i < x.length; i++) y[i] = x[i] - l[i];
  return y;
}

const bandpass = (x, lo, hi) => highpass(lowpass(lowpass(x, hi), hi), lo);

function mix(parts) {
  const len = parts[0][0].length;
  const y = zeros(len);
  for (const [sig, gain] of parts) {
    for (let i = 0; i < len; i++) y[i] += sig[i] * gain;
  }
  return y;
}

// Equal-power crossfade of the tail into the head so noise beds loop with no click.
function loopify(x) {
  const out = zeros(N);
  for (let i = 0; i < N; i++) out[i] = x[i];
  for (let i = 0; i < FADE; i++) {
    const t = (i / FADE) * (Math.PI / 2);
    out[i] = x[i] * Math.sin(t) + x[N + i] * Math.cos(t);
  }
  return out;
}

const noiseBed = (fn, rng) => loopify(fn(N + FADE, rng));

// Filters a loop-length buffer circularly so filter state carries across the loop point.
function circular(x, filter) {
  const ext = zeros(N * 2);
  ext.set(x, 0);
  ext.set(x, N);
  return filter(ext).slice(N);
}
const lowpassC = (x, fc) => circular(x, (e) => lowpass(e, fc));
const highpassC = (x, fc) => circular(x, (e) => highpass(e, fc));
const bandpassC = (x, lo, hi) => circular(x, (e) => bandpass(e, lo, hi));

function addWrapped(buf, start, sig, gain = 1) {
  const s = ((Math.floor(start) % N) + N) % N;
  for (let k = 0; k < sig.length; k++) buf[(s + k) % N] += sig[k] * gain;
}

function writeWav(name, x, targetRms) {
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += x[i] * x[i];
  const gain = targetRms / Math.sqrt(sum / x.length);
  const buf = Buffer.alloc(44 + N * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + N * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(Math.tanh(x[i] * gain) * 32000), 44 + i * 2);
  }
  writeFileSync(path.join(OUT, `${name}.wav`), buf);
  console.log(`  ${name}.wav`);
}

const sounds = {};

sounds.hush = () => {
  const rng = makeRng(11);
  return [lowpassC(noiseBed(white, rng), 9000), 0.13];
};

sounds.pink = () => {
  const rng = makeRng(12);
  return [lowpassC(noiseBed(pink, rng), 9000), 0.14];
};

sounds.brown = () => {
  const rng = makeRng(13);
  const deep = highpassC(noiseBed(brown, rng), 30);
  const body = lowpassC(noiseBed(pink, rng), 1800);
  return [mix([[deep, 1], [body, 0.35]]), 0.15];
};

sounds.balanced = () => {
  const rng = makeRng(14);
  // Mid-focused, even spectrum.
  return [
    mix([
      [bandpassC(noiseBed(white, rng), 200, 6000), 0.55],
      [lowpassC(noiseBed(pink, rng), 4500), 0.55],
    ]),
    0.13,
  ];
};

sounds.bright = () => {
  const rng = makeRng(15);
  // Airier / higher.
  return [
    mix([
      [bandpassC(noiseBed(white, rng), 1200, 9000), 0.85],
      [highpassC(noiseBed(pink, rng), 800), 0.35],
    ]),
    0.11,
  ];
};

sounds.dark = () => {
  const rng = makeRng(16);
  // Low, muffled.
  const deep = highpassC(noiseBed(brown, rng), 25);
  const body = lowpassC(noiseBed(pink, rng), 900);
  return [mix([[deep, 1], [body, 0.45]]), 0.15];
};

sounds.ocean = () => {
  const rng = makeRng(42);
  // Longer, smoother swell than beach.
  const raw = pink(N + FADE, rng);
  const shaped = zeros(N + FADE);
  let s = 0;
  for (let i = 0; i < N + FADE; i++) {
    const env = 0.7 * swell(8, i) + 0.3 * swell(16, i + SR);
    s += coef(180 + 2800 * env) * (raw[i] - s);
    shaped[i] = s * (0.15 + 0.85 * env);
  }
  const foamSrc = highpass(white(N + FADE, rng), 2800);
  const foam = zeros(N + FADE);
  for (let i = 0; i < N + FADE; i++) {
    const env = swell(8, i + SR * 0.5);
    foam[i] = foamSrc[i] * Math.pow(env, 2.5) * 0.18;
  }
  return [loopify(mix([[shaped, 1], [foam, 1]])), 0.13];
};

function heartBeat() {
  const len = Math.floor(SR * 0.55);
  const y = zeros(len);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const lub = Math.sin(TAU * 58 * t) * Math.exp(-t / 0.05) * (1 - Math.exp(-t / 0.004));
    const t2 = t - 0.27;
    const dub = t2 > 0 ? Math.sin(TAU * 48 * t2) * Math.exp(-t2 / 0.045) * (1 - Math.exp(-t2 / 0.004)) * 0.7 : 0;
    y[k] = lub + dub;
  }
  return lowpass(y, 160);
}

sounds.heartbeat = () => {
  const x = zeros();
  const beat = heartBeat();
  const period = N / 12;
  for (let b = 0; b < 12; b++) addWrapped(x, b * period, beat, 1);
  const hum = lowpassC(noiseBed(brown, makeRng(21)), 140);
  return [mix([[x, 1], [hum, 0.12]]), 0.12];
};

sounds.womb = () => {
  const rng = makeRng(22);
  const whoosh = lowpassC(noiseBed(pink, rng), 520);
  const period = N / 12;
  for (let i = 0; i < N; i++) {
    const phase = (i % period) / period;
    whoosh[i] *= 0.75 + 0.45 * Math.exp(-Math.pow((phase - 0.12) / 0.09, 2));
  }
  const beat = heartBeat();
  const hb = zeros();
  for (let b = 0; b < 12; b++) addWrapped(hb, b * period, beat, 1);
  return [mix([[whoosh, 1], [hb, 0.55]]), 0.14];
};

sounds.rain = () => {
  const rng = makeRng(31);
  const bed = mix([
    [bandpassC(noiseBed(white, rng), 700, 7000), 0.5],
    [lowpassC(noiseBed(pink, rng), 2500), 0.7],
  ]);
  const drops = zeros();
  for (let e = 0; e < 1100; e++) {
    const len = Math.floor(SR * (0.006 + rng() * 0.014));
    const f = 2200 + rng() * 3000;
    const sig = zeros(len);
    for (let k = 0; k < len; k++) sig[k] = Math.sin((TAU * f * k) / SR) * Math.exp(-k / (len * 0.28));
    addWrapped(drops, rng() * N, sig, 0.08 + rng() * 0.3);
  }
  return [mix([[bed, 1], [drops, 0.55]]), 0.13];
};

function swell(period, i) {
  const p = ((i / SR) % period) / period;
  const skew = Math.pow(p, 0.72);
  return Math.pow(Math.sin(Math.PI * skew), 2);
}

sounds.beach = () => {
  const rng = makeRng(41);
  const raw = pink(N + FADE, rng);
  const shaped = zeros(N + FADE);
  let s = 0;
  for (let i = 0; i < N + FADE; i++) {
    const env = 0.65 * swell(5, i) + 0.35 * swell(10, i);
    s += coef(260 + 3600 * env) * (raw[i] - s);
    shaped[i] = s * (0.12 + 0.88 * env);
  }
  const foamSrc = highpass(white(N + FADE, rng), 3200);
  const foam = zeros(N + FADE);
  for (let i = 0; i < N + FADE; i++) {
    const env = swell(5, i + SR * 0.4);
    foam[i] = foamSrc[i] * Math.pow(env, 3) * 0.25;
  }
  return [loopify(mix([[shaped, 1], [foam, 1]])), 0.14];
};

sounds.crickets = () => {
  const rng = makeRng(51);
  const x = zeros();
  const voices = 7;
  for (let v = 0; v < voices; v++) {
    const fc = 4200 + rng() * 1000;
    const period = 0.55 + rng() * 0.5;
    const pulses = 3 + Math.floor(rng() * 2);
    const gain = 0.35 + rng() * 0.65;
    let t = rng() * period;
    while (t < DUR) {
      for (let p = 0; p < pulses; p++) {
        const len = Math.floor(SR * 0.024);
        const sig = zeros(len);
        for (let k = 0; k < len; k++) {
          sig[k] = Math.sin((TAU * fc * k) / SR) * Math.pow(Math.sin((Math.PI * k) / len), 2);
        }
        addWrapped(x, (t + p * 0.048) * SR, sig, gain * (0.9 + rng() * 0.2));
      }
      t += period * (0.9 + rng() * 0.2);
    }
  }
  const night = lowpassC(noiseBed(pink, rng), 1400);
  return [mix([[lowpassC(x, 7000), 1], [night, 0.25]]), 0.06];
};

sounds.cicadas = () => {
  const rng = makeRng(61);
  const x = zeros();
  const voices = [
    { fc: 5400, rate: 96, period: 5, phase: 0.0, gain: 1 },
    { fc: 5800, rate: 104, period: 10, phase: 0.35, gain: 0.8 },
    { fc: 5000, rate: 88, period: 5, phase: 0.6, gain: 0.7 },
    { fc: 6200, rate: 112, period: 10, phase: 0.85, gain: 0.55 },
  ];
  for (const v of voices) {
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      const env = Math.pow(Math.sin(Math.PI * (((t / v.period + v.phase) % 1))), 2);
      const am = 0.5 + 0.5 * Math.sin(TAU * v.rate * t);
      x[i] += Math.sin(TAU * v.fc * t) * am * am * env * v.gain;
    }
  }
  const bed = lowpassC(noiseBed(pink, rng), 1200);
  return [mix([[lowpassC(x, 7000), 1], [bed, 0.2]]), 0.07];
};

function chirp(f0, f1, dur) {
  const len = Math.floor(SR * dur);
  const sig = zeros(len);
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const u = k / len;
    ph += (TAU * (f0 + (f1 - f0) * u)) / SR;
    sig[k] = Math.sin(ph) * Math.pow(Math.sin(Math.PI * u), 2);
  }
  return sig;
}

sounds.jungle = () => {
  const rng = makeRng(71);
  const bed = mix([
    [lowpassC(noiseBed(pink, rng), 1300), 1],
    [bandpassC(noiseBed(white, rng), 3000, 5200), 0.05],
  ]);
  const events = zeros();
  for (let c = 0; c < 16; c++) {
    let t = rng() * DUR;
    const notes = 1 + Math.floor(rng() * 4);
    const f0 = 1700 + rng() * 1500;
    const ratio = 0.65 + rng() * 0.9;
    const gain = 0.12 + rng() * 0.25;
    for (let n = 0; n < notes; n++) {
      addWrapped(events, t * SR, chirp(f0, f0 * ratio, 0.09 + rng() * 0.16), gain);
      t += 0.18 + rng() * 0.12;
    }
  }
  for (let c = 0; c < 4; c++) {
    const t0 = rng() * DUR;
    for (let p = 0; p < 6; p++) {
      const len = Math.floor(SR * 0.022);
      const sig = zeros(len);
      for (let k = 0; k < len; k++) sig[k] = Math.sin((TAU * 1050 * k) / SR) * Math.pow(Math.sin((Math.PI * k) / len), 2);
      addWrapped(events, (t0 + p * 0.065) * SR, sig, 0.14);
    }
  }
  for (let d = 0; d < 9; d++) addWrapped(events, rng() * N, chirp(650, 1250, 0.05), 0.09 + rng() * 0.1);
  const insects = zeros();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const am = 0.5 + 0.5 * Math.sin(TAU * 40 * t);
    const env = 0.55 + 0.45 * Math.sin(TAU * 0.2 * t);
    insects[i] = Math.sin(TAU * 3600 * t) * am * env;
  }
  return [mix([[bed, 1], [events, 1], [lowpassC(insects, 6000), 0.035]]), 0.1];
};

sounds.cars = () => {
  const rng = makeRng(81);
  const road = mix([
    [lowpassC(noiseBed(pink, rng), 650), 1],
    [lowpassC(noiseBed(brown, rng), 220), 0.4],
  ]);
  const x = zeros();
  const passes = [
    { tp: 1.6, sigma: 1.0, gain: 0.8, f0: 92 },
    { tp: 4.4, sigma: 1.2, gain: 1.0, f0: 78 },
    { tp: 6.2, sigma: 0.8, gain: 0.55, f0: 110 },
    { tp: 8.6, sigma: 1.1, gain: 0.85, f0: 85 },
  ];
  for (const pass of passes) {
    const span = pass.sigma * 3.4;
    const startT = pass.tp - span;
    const len = Math.floor(span * 2 * SR);
    const tire = bandpass(white(len, rng), 380, 2400);
    const sig = zeros(len);
    let ph = 0;
    for (let k = 0; k < len; k++) {
      const t = startT + k / SR;
      const d = (t - pass.tp) / pass.sigma;
      const env = Math.exp(-d * d);
      const f = pass.f0 * (1 + 0.08 * Math.tanh(-d * 1.6));
      ph += (TAU * f) / SR;
      const engine = Math.sin(ph) + 0.6 * Math.sin(2 * ph) + 0.35 * Math.sin(3 * ph) + 0.2 * Math.sin(4 * ph);
      sig[k] = (engine * 0.22 + tire[k] * 0.55) * Math.pow(env, 1.2);
    }
    addWrapped(x, startT * SR, lowpass(sig, 3200), pass.gain);
  }
  return [mix([[road, 1], [x, 0.9]]), 0.1];
};

sounds.boat = () => {
  const rng = makeRng(82);
  // Soft hull rumble + gentle water slap (comfort travel sound).
  const hull = mix([
    [lowpassC(noiseBed(brown, rng), 280), 1],
    [lowpassC(noiseBed(pink, rng), 700), 0.45],
  ]);
  const engine = zeros();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const am = 0.85 + 0.15 * Math.sin(TAU * 0.15 * t);
    engine[i] =
      (Math.sin(TAU * 48 * t) + 0.55 * Math.sin(TAU * 96 * t) + 0.25 * Math.sin(TAU * 144 * t)) * am;
  }
  const water = zeros();
  for (let e = 0; e < 900; e++) {
    const len = Math.floor(SR * (0.02 + rng() * 0.05));
    const f = 500 + rng() * 1400;
    const sig = zeros(len);
    for (let k = 0; k < len; k++) {
      sig[k] = Math.sin((TAU * f * k) / SR) * Math.exp(-k / (len * 0.35)) * (0.5 + 0.5 * rng());
    }
    addWrapped(water, rng() * N, bandpass(sig, 300, 3000), 0.08 + rng() * 0.2);
  }
  // Slow rolling sway in the mid band.
  const sway = zeros();
  for (let i = 0; i < N; i++) {
    const env = 0.55 + 0.45 * Math.sin(TAU * (i / SR) / 6);
    sway[i] = hull[i] * env;
  }
  return [mix([[sway, 1], [engine, 0.07], [water, 0.35]]), 0.11];
};

sounds.train = () => {
  const rng = makeRng(83);
  // Distant rail hum with a soft click-clack rhythm.
  const bed = mix([
    [lowpassC(noiseBed(pink, rng), 900), 1],
    [lowpassC(noiseBed(brown, rng), 250), 0.55],
  ]);
  const motor = zeros();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const am = 0.8 + 0.2 * Math.sin(TAU * 0.25 * t);
    motor[i] = (Math.sin(TAU * 62 * t) + 0.45 * Math.sin(TAU * 124 * t)) * am;
  }
  const clicks = zeros();
  const spacing = Math.floor(SR * 0.42); // ~2.4 Hz wheel rhythm
  for (let i = 0; i < N; i += spacing) {
    const len = Math.floor(SR * 0.03);
    const sig = zeros(len);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      sig[k] =
        (Math.sin(TAU * 900 * t) + 0.4 * Math.sin(TAU * 1800 * t)) *
        Math.exp(-k / (SR * 0.012));
    }
    // Soft second clack a beat later (two-axle feel).
    addWrapped(clicks, i, sig, 0.55);
    addWrapped(clicks, i + Math.floor(SR * 0.07), sig, 0.35);
  }
  // Occasional distant doppler whoosh.
  const whoosh = zeros();
  for (const tp of [2.5, 7.2]) {
    const sigma = 1.1;
    const span = sigma * 3;
    const startT = tp - span;
    const len = Math.floor(span * 2 * SR);
    const noise = bandpass(white(len, rng), 200, 2200);
    const sig = zeros(len);
    let ph = 0;
    for (let k = 0; k < len; k++) {
      const t = startT + k / SR;
      const d = (t - tp) / sigma;
      const env = Math.exp(-d * d);
      const f = 70 * (1 + 0.12 * Math.tanh(-d));
      ph += (TAU * f) / SR;
      sig[k] = (Math.sin(ph) * 0.25 + noise[k] * 0.5) * Math.pow(env, 1.1);
    }
    addWrapped(whoosh, startT * SR, lowpass(sig, 1800), 0.7);
  }
  return [mix([[bed, 1], [motor, 0.06], [clicks, 0.22], [whoosh, 0.45]]), 0.1];
};

sounds.fan = () => {
  const rng = makeRng(91);
  const bed = mix([
    [lowpassC(noiseBed(pink, rng), 2600), 1],
    [lowpassC(noiseBed(brown, rng), 300), 0.5],
  ]);
  const hum = zeros();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const am = 0.8 + 0.2 * Math.sin(TAU * 0.4 * t);
    hum[i] = (Math.sin(TAU * 120 * t) + 0.5 * Math.sin(TAU * 240 * t)) * am;
  }
  return [mix([[bed, 1], [hum, 0.08]]), 0.12];
};

sounds.stream = () => {
  const rng = makeRng(101);
  const bed = mix([
    [lowpassC(noiseBed(pink, rng), 3200), 0.7],
    [bandpassC(noiseBed(white, rng), 1500, 6000), 0.18],
  ]);
  const bubbles = zeros();
  for (let b = 0; b < 1500; b++) {
    const f0 = 380 + rng() * 1200;
    addWrapped(bubbles, rng() * N, chirp(f0, f0 * (1.3 + rng() * 0.9), 0.015 + rng() * 0.03), 0.05 + rng() * 0.2);
  }
  return [mix([[bed, 1], [bubbles, 0.8]]), 0.12];
};

sounds.lullaby = () => {
  const [E, G, A, C6, D, C] = [659.25, 783.99, 880, 1046.5, 587.33, 523.25];
  const melody = [E, G, A, G, E, D, C, D, E, G, A, C6, A, G, E, D, E, D, C, 0];
  const x = zeros();
  const beat = 0.5;
  melody.forEach((f, idx) => {
    if (!f) return;
    const len = Math.floor(SR * 2.2);
    const sig = zeros(len);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      const attack = 1 - Math.exp(-t / 0.003);
      sig[k] =
        attack *
        (Math.sin(TAU * f * t) * Math.exp(-t / 0.75) +
          0.32 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / 0.3) +
          0.12 * Math.sin(TAU * f * 4 * t) * Math.exp(-t / 0.12));
    }
    addWrapped(x, idx * beat * SR, sig, 1);
  });
  const pad = zeros();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    pad[i] = (Math.sin(TAU * 130 * t) + 0.5 * Math.sin(TAU * 195 * t)) * (0.6 + 0.4 * Math.sin(TAU * 0.2 * t));
  }
  return [mix([[x, 1], [pad, 0.1]]), 0.08];
};

mkdirSync(OUT, { recursive: true });
console.log('Generating sleep loops...');
for (const [name, build] of Object.entries(sounds)) {
  const [signal, rms] = build();
  writeWav(name, signal, rms);
}
console.log('Done.');
