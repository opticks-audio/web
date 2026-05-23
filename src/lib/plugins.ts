export type PluginFeature = {
  title: string;
  body: string;
};

export type Plugin = {
  slug: "reflexion" | "refraction" | "inflexion";
  name: string;
  category: string;
  tagline: string;
  description: string;
  longDescription: string;
  physics: string;
  /** One-line technical claim shown on the home page card. */
  spec: string;
  accentFrom: string;
  accentTo: string;
  formats: string[];
  daws: string[];
  systemRequirements: {
    mac: string;
    windows: string;
  };
  status: "available" | "coming-soon" | "beta";
  version: string;
  /** Path under /public — e.g. "/screenshots/reflexion.png". */
  screenshot: string;
  /** Architectural highlights — bulleted on the product page. */
  features: PluginFeature[];
  downloads: {
    mac?: string;
    windows?: string;
  };
};

export const plugins: Plugin[] = [
  {
    slug: "reflexion",
    name: "REFLEXION",
    category: "Algorithmic Reverb",
    tagline: "Light reflecting between surfaces.",
    description:
      "A premium algorithmic reverb engineered around an 8-channel modulated FDN — the same architectural family as the most respected algorithmic engines in audio.",
    longDescription:
      "REFLEXION is built around an eight-channel modulated Feedback Delay Network with an orthogonal Hadamard mixing matrix — the same architectural family as Lexicon's 480, Bricasti's M7 and Valhalla's algorithmic engines. A four-stage nested all-pass diffuser handles onset, a twelve-tap stereo cluster places early reflections inside the modelled space, and per-line modulation smears the comb-filter resonances that haunt cheaper reverbs into a tail that breathes.",
    physics: "Light reflecting between surfaces",
    spec: "8-channel modulated FDN",
    accentFrom: "#7c3aed",
    accentTo: "#06b6d4",
    formats: ["VST3", "AU", "Standalone"],
    daws: [
      "Ableton Live",
      "Logic Pro",
      "Pro Tools",
      "FL Studio",
      "Cubase",
      "Studio One",
      "Reaper",
    ],
    systemRequirements: {
      mac: "macOS 10.13+ · Intel & Apple Silicon",
      windows: "Windows 10+ · 64-bit",
    },
    status: "beta",
    version: "0.1.0",
    screenshot: "/screenshots/reflexion.png",
    features: [
      {
        title: "8-channel modulated FDN",
        body: "Orthogonal Hadamard recirculation: maximally dense, never metallic. Per-line LFO modulation between 0.5–1.2 Hz smears comb resonances into life.",
      },
      {
        title: "Nested all-pass diffusion",
        body: "Four Gardner / Dattorro-style nested all-passes spread every transient into a cloud before it enters the late tail — the trick that makes vocals and drums feel expensive.",
      },
      {
        title: "Three room shapes",
        body: "Hall, Plate and Chamber early-reflection patterns sit on top of the same late engine, swapping the geometric character of the modelled space in one click.",
      },
      {
        title: "Studio-grade tone shaping",
        body: "Pre-delay 0–200 ms, low-cut 20–500 Hz, high-cut 2–20 kHz, low + high shelves, M/S width control. Everything you need to sit the reverb in any mix.",
      },
    ],
    downloads: {},
  },
  {
    slug: "refraction",
    name: "REFRACTION",
    category: "Tape-Style Spatial Delay",
    tagline: "Light bending through a prism.",
    description:
      "A tape-modelled spatial delay with wow, flutter, head bump and asymmetric saturation — each repeat genuinely darkens, the way real tape does.",
    longDescription:
      "REFRACTION models the complete signal path of a magnetic-tape echo: pre-emphasis head bump shelf, asymmetric tube-style soft clipper, age filter, worn-head resonance, and independent wow + flutter modulation with band-limited drift. Three independent tape heads tap a single delay line at musical intervals, then a continuous cross-feedback network blends between parallel and ping-pong stereo behaviour. Tape colour sits inside the feedback path, so each repeat truly darkens — exactly how a Roland RE-201 sounds after six passes.",
    physics: "Light bending through a prism",
    spec: "Authentic tape model · wow + flutter",
    accentFrom: "#06b6d4",
    accentTo: "#10b981",
    formats: ["VST3", "AU", "Standalone"],
    daws: [
      "Ableton Live",
      "Logic Pro",
      "Pro Tools",
      "FL Studio",
      "Cubase",
      "Studio One",
      "Reaper",
    ],
    systemRequirements: {
      mac: "macOS 10.13+ · Intel & Apple Silicon",
      windows: "Windows 10+ · 64-bit",
    },
    status: "beta",
    version: "0.1.0",
    screenshot: "/screenshots/refraction.png",
    features: [
      {
        title: "Authentic tape model",
        body: "Head-bump low-shelf at 100 Hz, asymmetric tube saturation (2nd-harmonic forward), age-dependent HF loss and worn-head resonance — modelled per tape pass, not just at the input.",
      },
      {
        title: "Wow + flutter + drift",
        body: "Independent wow (0.7 Hz, large depth), flutter (12 Hz, small depth) and a smoothed random drift. Subtle by default, beautifully chaotic at extremes.",
      },
      {
        title: "Three-head multi-tap",
        body: "Each tap has independent time (10–2000 ms), level and pan. Build classic slap, dub, dotted, or polyrhythmic patterns from a single delay line.",
      },
      {
        title: "Continuous ping-pong",
        body: "SPREAD knob smoothly morphs from parallel-channel feedback (0) to fully crossed ping-pong (1) — no abrupt mode switch.",
      },
    ],
    downloads: {},
  },
  {
    slug: "inflexion",
    name: "INFLEXION",
    category: "Dynamics · VCA / FET / OPTO",
    tagline: "The curvature of motion.",
    description:
      "A premium dynamics processor with three topology voicings, dual peak + RMS detection and 2× oversampled transformer saturation for true mastering-grade character.",
    longDescription:
      "INFLEXION is a feedforward compressor with three topology voicings (VCA / FET / OPTO), each with its own detector blend and ballistics. A quadratic soft-knee gain computer, programme-dependent release (FET mode) and a two-stage release approximation (OPTO mode) give every topology the response you expect from its hardware namesake. An optional 2× oversampled transformer saturation stage adds the iron weight of a Shadow Hills or API console path without the aliasing that ruins cheaper plug-ins at heavy drive.",
    physics: "Curvature of motion",
    spec: "VCA · FET · OPTO · transformer saturation",
    accentFrom: "#10b981",
    accentTo: "#f97316",
    formats: ["VST3", "AU", "Standalone"],
    daws: [
      "Ableton Live",
      "Logic Pro",
      "Pro Tools",
      "FL Studio",
      "Cubase",
      "Studio One",
      "Reaper",
    ],
    systemRequirements: {
      mac: "macOS 10.13+ · Intel & Apple Silicon",
      windows: "Windows 10+ · 64-bit",
    },
    status: "beta",
    version: "0.1.0",
    screenshot: "/screenshots/inflexion.png",
    features: [
      {
        title: "Three topology voicings",
        body: "VCA (clean, broadband), FET (1176-style, programme-dependent release), OPTO (LA-2A-style, level-dependent attack with two-stage release). Each is a re-voicing, not a colour preset.",
      },
      {
        title: "Dual peak + RMS detector",
        body: "Per-topology blend of peak and RMS detection (VCA 70/30, FET 90/10, OPTO 30/70) — matches the response character of the hardware each mode targets.",
      },
      {
        title: "Transformer saturation",
        body: "Optional 2× oversampled iron stage with asymmetric soft-clip and 80 Hz bass bump. Adds the low-mid weight of a console output transformer without folding aliasing back into the audible band.",
      },
      {
        title: "Sidechain HPF + parallel mix",
        body: "20–500 Hz sidechain HPF stops bass content from triggering pumping. Mix knob gives parallel compression from 0 % (dry) to 100 % (full GR).",
      },
    ],
    downloads: {},
  },
];

export const getPlugin = (slug: string) =>
  plugins.find((p) => p.slug === slug);
