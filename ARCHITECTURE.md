# Opticks Audio — Architecture

> Single source of truth for the design and engineering of the Opticks Audio
> plugin catalogue. This document precedes the code: every decision here is
> committed before implementation. It is updated **before** the code, never
> after.

**Project**: Opticks Audio
**Website**: https://opticksaudio.com
**Status**: Architecture frozen. Implementation pending in a clean session.
**Document version**: 1.0
**Last updated**: 2026-05-22

---

## 0. Why this document exists

The studios this catalogue aims to compete with (Universal Audio, FabFilter,
Soundtoys, iZotope, Valhalla) share one habit that smaller plugin shops skip:
**they freeze the architecture before they freeze the DSP**. A reverb that
sounds great in a prototype but ships with inconsistent parameter ranges,
unreliable preset state or a fragile build pipeline never reaches the quality
bar of the brands above.

This file is the architecture contract. It covers:

- Naming, branding, identifiers (the **rebrand** from Opticks → Opticks).
- The monorepo layout and module responsibilities.
- Coding standards and DSP quality gates.
- The three products (Reflexion, Refraction, Inflexion) and their build order.
- Release engineering: signing, notarisation, installers, distribution.
- The order in which everything is built.

Read end-to-end before writing any code.

---

## 1. Brand identity

| Field                          | Value                                               |
|--------------------------------|-----------------------------------------------------|
| Company name                   | **Opticks Audio**                                   |
| Website                        | `https://opticksaudio.com`                          |
| Support email                  | `support@opticksaudio.com`                          |
| Bundle ID prefix               | `com.opticksaudio`                                  |
| JUCE manufacturer code         | `Opau` (4 chars, ≥1 uppercase, JUCE requirement)    |
| C++ root namespace             | `opticks`                                           |
| Library prefix (filesystem)    | `opticks-*`                                         |
| Plugin install folder (macOS)  | `~/Library/Audio/Plug-Ins/{VST3,Components}/Opticks/` |

### 1.1 Rebrand checklist (Opticks → Opticks)

Every occurrence below must be migrated when implementation begins. Nothing
in the existing repo references the new brand yet.

| Where                                             | Old                                  | New                                                  |
|---------------------------------------------------|--------------------------------------|------------------------------------------------------|
| `CMakeLists.txt` `project()`                      | `OpticksAudio`                        | `OpticksAudio`                                       |
| `cmake/OpticksPlugin.cmake` filename               | `OpticksPlugin.cmake`                 | `OpticksPlugin.cmake`                                |
| `cmake/OpticksPlugin.cmake` `NG_COMPANY_NAME`      | `Opticks Audio`                       | `Opticks Audio`                                      |
| `cmake/OpticksPlugin.cmake` `NG_COMPANY_WEBSITE`   | `https://opticksaudio.com`            | `https://opticksaudio.com`                           |
| `cmake/OpticksPlugin.cmake` `NG_COMPANY_EMAIL`     | `support@opticksaudio.com`            | `support@opticksaudio.com`                           |
| `cmake/OpticksPlugin.cmake` `NG_BUNDLE_PREFIX`     | `com.opticksaudio`                    | `com.opticksaudio`                                   |
| `cmake/OpticksPlugin.cmake` `NG_MANUFACTURER_CODE` | `Ngau`                               | `Opau`                                               |
| CMake variable prefix                             | `NG_*`                               | `OPTICKS_*`                                          |
| CMake function                                    | `ng_add_plugin`, `ng_set_warnings`   | `opticks_add_plugin`, `opticks_set_warnings`         |
| C++ namespace root                                | `ng::`                               | `opticks::`                                          |
| C++ subnamespaces                                 | `ng::dsp`, `ng::ui`                  | `opticks::dsp`, `opticks::ui`, `opticks::plugin`     |
| Header include root                               | `<ng/dsp/...>`, `<ng/ui/...>`        | `<opticks/dsp/...>`, `<opticks/ui/...>`              |
| Library targets                                   | `ng-dsp-core`, `ng-ui-kit`           | `opticks-dsp-core`, `opticks-ui-kit`, ...            |
| Repo root README                                  | `Opticks Audio`                       | `Opticks Audio`                                      |
| `opticks-audio-web` project name                         | `opticks-audio-web`                         | `opticks-web`                                        |
| `opticks-audio-web` package.json `name`                  | n/a (check)                          | `opticks-web`                                        |
| Web metadata, OG tags, footer                     | Opticks Audio                         | Opticks Audio                                        |
| Web copy "Opticks Collection"                      | already says "Opticks Collection" ✓  | keep (already aligned)                               |
| `.github/workflows` references                    | Opticks                               | Opticks                                              |
| CHANGELOG.md                                      | Opticks Audio                         | Opticks Audio + entry "0.2.0: Rebrand to Opticks"    |

### 1.2 What does **not** change

- Plugin **PLUGIN_CODE** strings (the 4-char per-plugin IDs JUCE bakes into
  hosts). If a DAW session has referenced a plugin by code, changing the
  code breaks the reference. We have not shipped any plugin to any DAW
  outside the dev machine, so this is theoretically safe to change — but
  the **discipline** is to freeze plugin codes at first ship and never
  change them afterwards. Therefore:
  - MotionFX keeps `Mfx1` (already shipped to dev DAW).
  - Reflexion will be `Rfx1`. Refraction `Rfr1`. Inflexion `Ifx1`. Frozen
    from the moment they enter `main`.

- The DSP-level public API of `opticks::dsp::DCBlocker`, `OnePole`, etc.
  Their semantics are kept; only the namespace changes.

### 1.3 Visual identity (UI)

- Primary palette inherited from the landing page: deep charcoal canvas,
  warm pearl text, **one** signature accent per plugin (Reflexion uses the
  teal/cyan family; Refraction uses violet/magenta; Inflexion uses amber).
- Typography: a serif display face for headlines + a humanist sans for UI
  + a geometric mono for parameter readouts. Final selection is licensed
  per the brand kit (e.g. Söhne + Tiempos + IBM Plex Mono, or Inter +
  Fraunces + JetBrains Mono as a free-tier fallback). The font files are
  embedded into the binary via `juce_add_binary_data` so the UI renders
  identically on every machine.
- Surface treatment: **flat-modern primary, skeumorphic-refined accents**.
  Knobs are vector circles with a subtle inner gradient and a precise LED
  indicator arc. Panels have a 1px hairline border at 8% white plus a
  4px-radius inner shadow at 30% black to give depth without "plastic".
  No raster textures, no fake screws. The accent glow from the landing
  page is reproduced on the active control as a 16-24px soft halo.
- Default plugin window size: 960×600 logical px. Resizable in 25%
  increments from 75% to 200%. Aspect ratio locked.
- Frame budget: 60 fps continuous on the editor. OpenGL renderer used
  optionally where it accelerates `juce::Path` fills (visualisers).

---

## 2. Repository layout

```
opticks-audio/                          (repo renamed from opticks-audio)
├─ ARCHITECTURE.md                      ← this document
├─ CHANGELOG.md
├─ README.md
├─ LICENSE                              (proprietary; see §10)
├─ CMakeLists.txt
├─ CMakePresets.json
├─ .clang-format
├─ .clang-tidy
├─ .editorconfig
├─ .gitattributes
├─ .gitignore
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                         (build + tests on macOS + Windows)
│     ├─ pluginval.yml                  (strictness 10 on PR)
│     └─ release.yml                    (signed pkg/exe on tag push)
├─ cmake/
│  ├─ CompilerWarnings.cmake
│  ├─ OpticksPlugin.cmake               (factory macro, renamed)
│  ├─ OpticksSigning.cmake              (codesign / notarytool / signtool)
│  ├─ OpticksInstaller.cmake            (productbuild + Inno Setup driver)
│  ├─ OpticksPluginVal.cmake            (downloads + runs pluginval in CI)
│  └─ FindClang.cmake                   (for clang-tidy in CI)
├─ libs/
│  ├─ opticks-dsp-core/                 (was ng-dsp-core)
│  ├─ opticks-ui-kit/                   (was ng-ui-kit)
│  ├─ opticks-plugin-framework/         (NEW)
│  └─ opticks-licensing/                (NEW, deferred until pre-release)
├─ plugins/
│  ├─ MotionFX/                         (existing; updated to new namespace)
│  ├─ Reflexion/                        (NEW — product 1)
│  ├─ Refraction/                       (NEW — product 2)
│  └─ Inflexion/                        (NEW — product 3)
├─ shared/
│  ├─ branding/                         (logos, palette tokens, fonts)
│  └─ ir-bank/                          (impulse responses, factory subset)
├─ tools/
│  ├─ ir-baker/                         (CLI: bakes WAV IRs into binary blobs)
│  ├─ preset-validator/                 (CLI: loads + validates .opreset)
│  └─ pluginval-runner/                 (driver script for CI)
├─ release/
│  ├─ macos/
│  │  ├─ Distribution.xml
│  │  ├─ build-pkg.sh
│  │  └─ entitlements.plist
│  └─ windows/
│     ├─ Reflexion.iss                  (Inno Setup script per plugin)
│     ├─ Refraction.iss
│     ├─ Inflexion.iss
│     └─ build-installer.ps1
└─ docs/
   ├─ DSP_NOTES.md                      (per-product DSP design)
   ├─ UI_GUIDELINES.md
   ├─ PRESET_FORMAT.md
   ├─ RELEASE.md                        (step-by-step release runbook)
   └─ THIRD_PARTY.md                    (JUCE, Catch2, fonts, IRs licences)
```

### 2.1 Module responsibilities

Each library has **one** responsibility. Cross-cutting concerns are factored
up, never duplicated.

| Library                       | Depends on              | Responsibility                                                                 |
|-------------------------------|-------------------------|--------------------------------------------------------------------------------|
| `opticks-dsp-core`            | (std only)              | Pure C++ DSP primitives. No JUCE, no UI, no allocation in hot path.            |
| `opticks-ui-kit`              | `juce_graphics`, `juce_gui_basics` | Look-and-feel, widgets, components, animation. Brand visual identity.          |
| `opticks-plugin-framework`    | `opticks-dsp-core`, `opticks-ui-kit`, `juce_audio_processors` | Base classes and helpers every Opticks plugin reuses. APVTS, presets, undo, A/B. |
| `opticks-licensing`           | `juce_core`, `juce_cryptography` | Activation, machine ID, offline grace period, trial mode. Deferred to v0.4.    |
| `plugins/<Product>/`          | All three libs above    | Product-specific DSP, UI assembly, preset bank, marketing strings.             |

**Iron rule**: a product never reaches around the framework into JUCE for
something the framework should provide. If a product needs JUCE thing X and
two products will need it, X moves into the framework before the second
product touches it.

---

## 3. `opticks-dsp-core` — DSP primitives

Framework-agnostic. Header-mostly. C++20. `double` internally, `float` at the
I/O boundary. No allocations in `process*()`. Every primitive has a
deterministic Catch2 unit test.

### 3.1 Final include tree

```
include/opticks/dsp/
├─ Constants.h                  kPi, kTwoPi, kSqrt2, kInvSqrt2, kEpsilon
├─ DCBlocker.h                  ✓ (kept, namespace renamed)
├─ DenormalGuard.h              ✓ (kept, namespace renamed)
├─ OnePole.h                    ✓ (kept, namespace renamed)
├─ ParameterSmoother.h          ✓ (kept, namespace renamed)
├─ OpticksDspCore.h             umbrella header (was NgDspCore.h)
│
├─ filters/
│  ├─ StateVariable.h           Chamberlin ZDF SVF (LP/HP/BP/BR/Allpass outs)
│  ├─ AllPass.h                 1st & 2nd order all-pass (group delay tools)
│  ├─ Biquad.h                  TDF-II biquad with RBJ cookbook helpers
│  ├─ LinkwitzRiley.h           LR4 crossover (cascaded 2nd-order Butterworth)
│  └─ ParametricEQ.h            multi-band parametric (peak/shelf/HP/LP)
│
├─ delays/
│  ├─ DelayLine.h               fixed-length, Lagrange 3rd-order frac interp
│  ├─ ModulatedDelay.h          DelayLine + internal LFO + smoothing
│  └─ AllPassDelay.h            Schroeder all-pass (for diffusion networks)
│
├─ reverb/
│  ├─ HadamardMixer.h           lossless N×N orthogonal mixer (N power of 2)
│  ├─ FDNReverb.h               8×8 Feedback Delay Network, householder option
│  ├─ EarlyReflections.h        tap-delay bank + per-tap filter + panner
│  └─ Diffuser.h                cascaded all-pass diffuser
│
├─ convolution/
│  ├─ FFT.h                     thin wrapper on juce::dsp::FFT
│  ├─ UniformPartitioned.h      uniform partitioned convolution, low latency
│  └─ ImpulseResponse.h         IR loader: WAV → normalised float buffer
│
├─ modulation/
│  ├─ LFO.h                     sine/tri/saw/square, anti-aliased where needed
│  ├─ EnvelopeFollower.h        peak + RMS, attack/release in ms
│  └─ Drift.h                   filtered random walk (analog-style instability)
│
├─ oversampling/
│  └─ Polyphase.h               2×/4×/8× IIR polyphase up/down sampler
│
├─ dynamics/
│  ├─ Compressor.h              feed-forward, soft-knee, external sidechain
│  └─ Limiter.h                 lookahead brickwall, ISR-aware
│
└─ utility/
   ├─ RmsLevel.h                sliding-window RMS
   ├─ PeakLevel.h               peak detector w/ IEC-style ballistics
   ├─ CircularBuffer.h          POD ring buffer, no virtuals
   └─ Crossfade.h               equal-power crossfade (bypass etc.)
```

### 3.2 Quality gates

- **No allocation** in any method that may be called from the audio
  callback. All buffers preallocated in `prepare(sampleRate, blockSize)`.
- **No virtual calls in hot loops**. Templates over polymorphism for
  per-sample primitives.
- **Denormal-safe**: callers wrap their `processBlock` in a
  `opticks::dsp::ScopedNoDenormals`. Primitives still guard against
  pathological denormals where cheap (`x + 1.0e-30` traps).
- **Numeric stability**: internal state in `double`. Inputs/outputs may
  be `float` (template parameter). One-pole / biquad coefficients
  derived from cutoff in Hz, never from "raw" coefficient knobs.
- **Headroom**: no clipping inside primitives. Saturation is opt-in
  via a dedicated `Saturator` (added when Inflexion lands; not in v0.2).
- **Unit tests** (Catch2, all in `tests/`):
  - Impulse response of each filter type at a known cutoff matches a
    reference truth within 0.1 dB.
  - DC gain of low-pass = 1.0, of high-pass = 0.0.
  - One-pole smoother reaches 63% in `tau` ms ±2%.
  - Hadamard matrix is orthogonal (`H · Hᵀ = N·I`).
  - FDN total energy bounded for a stable feedback gain.
  - DC blocker removes a 0.5 DC offset to < -60 dB in 200 ms.
  - Convolution against a unit impulse returns the IR identically.

### 3.3 ABI / source compatibility

`opticks-dsp-core` is a **static library**. Headers are public; private
includes live in `src/` if any. Bumping a primitive's API requires a
minor version bump and a CHANGELOG entry.

---

## 4. `opticks-ui-kit` — visual identity & widgets

Header-only where possible (templated by host context), with `.cpp` for
the `LookAndFeel` and animation classes (state).

### 4.1 Final include tree

```
include/opticks/ui/
├─ Theme.h                      colour tokens, semantic palette per plugin
├─ Typography.h                 type scale, font registration
├─ OpticksLookAndFeel.h         JUCE LookAndFeel_V4 subclass
│
├─ widgets/
│  ├─ Knob.h                    rotary, LED indicator, sub-label, drag scale
│  ├─ Slider.h                  vertical / horizontal, tick marks
│  ├─ Button.h                  toggle, momentary, segmented
│  ├─ Meter.h                   peak + RMS, IEC PPM ballistics, hold dots
│  ├─ XYPad.h                   interactive XY, draggable handle
│  ├─ Spectrum.h                FFT spectrum analyser, animated
│  ├─ DecayGraph.h              reverb-tail/IR visualiser (Reflexion)
│  └─ TextBox.h                 inline numeric entry (right-click → set)
│
├─ components/
│  ├─ PresetBar.h               browse / save / A-B / prev-next / tags
│  ├─ BypassButton.h            with crossfade visual
│  ├─ UndoRedoBar.h
│  ├─ ABCompare.h
│  ├─ ResizeCorner.h            triangle grip, snaps to 25% increments
│  ├─ Tooltip.h                 hover help: description + range + unit
│  └─ HelpPanel.h               first-run overlay
│
└─ animation/
   ├─ Easing.h                  cubic, quartic, elastic, spring
   └─ Animator.h                timeline animator, calls onTick at 60Hz
```

### 4.2 LookAndFeel rules

- Knobs: 100% vector, drawn from `juce::Path`. No images.
- Anti-aliasing: always on. Hairlines clamped to ≥ 0.75 device px.
- Shadows: inner-soft on raised panels, outer-soft on active controls.
- Animation: 60 fps continuous on visible meters; static controls
  repaint only on change.
- Tooltips: 250 ms delay, fade in 120 ms, never overlap the control,
  always include the parameter description **and** current value+unit.
- Right-click on any parameter:
  - Copy value
  - Paste value
  - Set to default
  - MIDI learn (if host supports)
- Double-click on any parameter: reset to default.
- Drag: linear. `Shift` = fine (10×). `Ctrl/Cmd` = coarse (0.1×).
- Scroll wheel: same step as drag fine.

### 4.3 Accessibility

- Every widget exposes a JUCE accessibility handler (label, role, value).
- Minimum hit-target 24×24 logical px.
- Contrast ratio for body text ≥ 4.5:1 against background.
- Colour-blind safe: meter clipping uses both colour change **and** a
  triangle icon, never colour alone.

### 4.4 Font handling

Fonts are embedded as binary data targets. The free-tier fallback set is
checked into `shared/branding/fonts/`. The licensed set (if any) is
fetched in CI from a private bucket and never committed. The runtime
selects based on `OPTICKS_LICENSED_FONTS` CMake option.

---

## 5. `opticks-plugin-framework` — the shared plugin chassis

This is the new library that did not exist before. It captures the 70%
of code that is identical across the three plugins.

### 5.1 Final include tree

```
include/opticks/plugin/
├─ Parameter.h                  descriptor: id, range, skew, default, unit, tooltip
├─ ParameterRegistry.h          builds the APVTS once from a vector<Parameter>
├─ ParameterAutomation.h        host-automation helpers
├─ OpticksProcessor.h           juce::AudioProcessor base, ready-made
├─ OpticksEditor.h              juce::AudioProcessorEditor base
├─ PresetManager.h              .opreset I/O (JSON + base64 binary state)
├─ PresetBrowser.h              non-UI model: list, search, tag, favourite
├─ StateManager.h               versioned schema migrations
└─ UndoStack.h                  parameter-level history
```

### 5.2 `Parameter` descriptor

```cpp
namespace opticks::plugin {

struct Parameter {
    juce::String   id;                  // stable APVTS id, never reused
    juce::String   label;               // human-readable name
    juce::String   unit;                // "Hz", "dB", "%", "s", ""
    float          minValue;
    float          maxValue;
    float          defaultValue;
    float          skew = 1.0f;         // 1.0 = linear, <1 biases towards min
    bool           isDiscrete = false;
    juce::StringArray choices;          // populated iff discrete
    juce::String   tooltip;             // long description
    juce::String   group;               // section, e.g. "Tone" / "Space"
};

} // namespace opticks::plugin
```

A product declares its parameters as a single `std::vector<Parameter>` in
`params/Parameters.cpp`. `ParameterRegistry::build(apvts, params)` builds
the APVTS layout from that vector. **No parameter is ever constructed
directly with `AudioParameterFloat`** outside the registry — that is the
mechanism that keeps tooltips, units and groups consistent.

### 5.3 `OpticksProcessor` base

Provides:
- A pre-built `juce::AudioProcessorValueTreeState apvts`.
- `prepareToPlay` wraps subclass `prepareEngine(sampleRate, blockSize)`.
- `processBlock` wraps a `ScopedNoDenormals`, an automatic dry buffer
  copy, the subclass's `renderEngine(buffer)`, and a smoothed master
  dry/wet crossfade.
- `getStateInformation` / `setStateInformation` delegate to
  `StateManager` which writes a versioned XML.
- Automatic latency reporting via `setLatencySamples()` exposed to the
  subclass.
- Bypass crossfade (click-free).

A product subclass implements only:
- `prepareEngine(double sampleRate, int blockSize)`
- `renderEngine(juce::AudioBuffer<float>&)`
- `getParameterLayout()` — returns the `std::vector<Parameter>`.

### 5.4 `.opreset` format

```json
{
  "format": "opreset",
  "schema": 1,
  "plugin": "Reflexion",
  "pluginVersion": "1.0.0",
  "name": "Cathedral",
  "author": "Opticks Audio",
  "tags": ["hall", "long", "ambient"],
  "favourite": false,
  "created": "2026-05-22T18:00:00Z",
  "parameters": {
    "size":     0.82,
    "decay":    0.74,
    "damping":  0.35,
    "predelay": 0.12,
    "mix":      0.30,
    ...
  },
  "extra": "<base64 binary state for non-parameter data>"
}
```

- `schema` is incremented on every breaking change. `StateManager`
  knows every schema and migrates forward.
- Factory presets live in `plugins/<Product>/resources/presets/` and
  are baked into the binary. User presets live in
  `~/Library/Application Support/Opticks Audio/<Product>/Presets/`
  (and the Windows equivalent).

### 5.5 Undo / Redo

History stack at the parameter level. Each parameter change pushes a
`{paramId, oldValue, newValue, timestamp}` record. Continuous drags
coalesce into a single record when the user releases the mouse. Max
depth 256. Cleared on preset load. Bound to `Ctrl/Cmd+Z` and
`Ctrl/Cmd+Shift+Z` inside the editor (only when the editor has focus —
never when the DAW transport is focussed).

### 5.6 A/B compare

Two parameter snapshots, `slotA` and `slotB`, plus an active flag.
Switching A↔B is instantaneous and not undoable (intentionally — it is
already a comparison tool). `Copy A→B` and `Copy B→A` available from
the preset bar.

---

## 6. The three products

### 6.1 Reflexion (product 1) — spatial / convolution + algorithmic reverb

**One-line pitch**: a reverb that lets sound bend through space like
light through glass. Convolution-grounded for realism, fed through a
custom FDN tail for endless decay and modulation.

**Signal chain**:

```
in ─► pre-EQ ─► early reflections (tap delay + filter + pan)
                    │
                    ▼
            convolution stage (uniform partitioned, low-latency)
                    │
                    ▼
            FDN diffuse tail (8×8 Hadamard, modulated)
                    │
                    ▼
                post-EQ ─► width / mid-side ─► dry/wet ─► out
```

**Parameters** (UI groups in **bold**):

| Group       | Param         | Range / unit            | Notes                                  |
|-------------|---------------|-------------------------|----------------------------------------|
| **Space**   | Size          | 0.0 – 1.0               | Scales delay-line lengths              |
|             | Decay         | 0.1 – 30.0 s            | RT60 target                            |
|             | Pre-delay     | 0 – 500 ms              | Sync-to-tempo option                   |
|             | Diffusion     | 0.0 – 1.0               | Density of all-pass diffuser           |
|             | Modulation    | 0.0 – 1.0               | Tail chorus depth                      |
| **IR**      | IR select     | discrete (40+ IRs)      | Halls, plates, springs, custom         |
|             | IR mix        | 0.0 – 1.0               | Convolution vs FDN balance             |
|             | Reverse IR    | toggle                  |                                        |
| **Tone**    | Lo cut        | 20 Hz – 2 kHz           | Pre-reverb HPF                         |
|             | Hi cut        | 1 kHz – 20 kHz          | Pre-reverb LPF                         |
|             | Damping       | 0.0 – 1.0               | HF decay in tail                       |
|             | Lo damp       | 0.0 – 1.0               | LF decay in tail                       |
| **Output**  | Width         | 0.0 – 2.0               | Mid-side widener on wet                |
|             | Mix           | 0.0 – 100 %             | Smoothed, equal-power                  |
|             | Gain          | -24 – +24 dB            | Output trim                            |

**Quality references** (what we listen against during tuning):

- Valhalla VintageVerb (algorithmic character)
- FabFilter Pro-R (clarity and parameter feel)
- Universal Audio Lexicon 224 (vintage hall density)
- EastWest Spaces (convolution realism)

**Plugin code**: `Rfx1`. Frozen.
**Bundle ID**: `com.opticksaudio.Reflexion`.
**Default window**: 1040 × 640.

### 6.2 Refraction (product 2) — modulation lab

A unified modulation processor that fuses chorus, flanger, phaser and
ensemble through an all-pass network with continuous morphing between
modes. Built on the same chassis as Reflexion in a fraction of the
time.

**Plugin code**: `Rfr1`. Frozen.
**Bundle ID**: `com.opticksaudio.Refraction`.

### 6.3 Inflexion (product 3) — saturation & dynamics

Waveshaper bank with pre- and post-EQ, parallel compression, harmonic
shaping. Adds the `Saturator` primitive to `opticks-dsp-core` (the
only primitive deferred from v0.2 → v0.4).

**Plugin code**: `Ifx1`. Frozen.
**Bundle ID**: `com.opticksaudio.Inflexion`.

---

## 7. Build system

### 7.1 CMake topology

- `CMakeLists.txt` at the root pulls JUCE 8.0.4 and Catch2 v3.7.1 via
  `FetchContent` with pinned tags. No system JUCE.
- Each library and each plugin is its own `add_subdirectory` from root.
- Cross-platform: macOS arm64+x86_64 universal binary in release;
  arm64-only in dev for faster iteration. Windows x64 only.
- `CMakePresets.json` ships three presets: `mac-dev`, `mac`, `windows`.

### 7.2 New CMake helpers

`cmake/OpticksSigning.cmake`:

```cmake
# Configurable via env vars or -D flags, never hard-coded:
#   OPTICKS_APPLE_DEV_ID_APPLICATION="Developer ID Application: …"
#   OPTICKS_APPLE_DEV_ID_INSTALLER="Developer ID Installer: …"
#   OPTICKS_APPLE_NOTARY_PROFILE="opticks-notary"  (xcrun notarytool stored creds)
#   OPTICKS_WIN_SIGNTOOL_CERT_THUMBPRINT="…"
#   OPTICKS_WIN_SIGNTOOL_TS_URL="http://timestamp.digicert.com"
#
# Functions:
#   opticks_codesign_bundle(<target>)
#   opticks_codesign_dylib(<path>)
#   opticks_notarize_pkg(<pkg-path>)
#   opticks_signtool_exe(<path>)
```

`cmake/OpticksInstaller.cmake`:
- `opticks_make_macos_pkg(<plugin-target>)` — uses `pkgbuild` per
  component (VST3 + AU + Standalone), wraps in a single
  `productbuild`, signs with Developer ID Installer, then submits
  to `notarytool` and staples.
- `opticks_make_windows_installer(<plugin-target>)` — generates an
  Inno Setup `.iss` from a template, runs `iscc`, then `signtool`.

`cmake/OpticksPluginVal.cmake`:
- Downloads pluginval at a pinned version into `build/_tools/`.
- `opticks_add_pluginval_test(<plugin-target>)` runs strictness 10
  as a CTest test on macOS + Windows in CI.

### 7.3 Quality gates that block a release

A tag-triggered `release.yml` workflow only produces installers when:

1. `cmake --build` succeeds on macOS + Windows in Release.
2. `ctest` passes (all `opticks-dsp-core` unit tests).
3. `pluginval --strictness-level 10` passes for **every** plugin on
   **every** OS for **every** format (VST3 + AU on mac, VST3 on win).
4. `clang-tidy` shows no new errors against the baseline.
5. `clang-format --dry-run --Werror` passes (style is enforced).
6. macOS bundles are signed with `Developer ID Application` and
   notarised; the `.pkg` is signed with `Developer ID Installer`,
   notarised, stapled, and `spctl -a -t install` passes.
7. Windows `.exe` is signed with the EV/OV cert, timestamped, and
   `signtool verify /pa /v` passes.
8. `CHANGELOG.md` has an entry matching the tag (a script grep).

If any gate fails, no installer is uploaded.

---

## 8. CI / CD

Three GitHub Actions workflows:

- **`ci.yml`** — runs on every push and PR. Builds Debug on
  macOS-14 (arm64) and Windows-2022. Runs `ctest`. Fast lane (<10 min).
- **`pluginval.yml`** — runs on every PR. Builds Release. Runs
  `pluginval --strictness-level 10` against all plugins. Slow lane
  (~25 min).
- **`release.yml`** — runs on tag `v*.*.*`. Builds Release. Runs all
  quality gates from §7.3. Produces:
    - `Reflexion-1.0.0-mac.pkg`, `.dmg` for distribution
    - `Reflexion-1.0.0-win.exe`
    - `SHA256SUMS.txt`, signed
    - Attaches all artefacts to the GitHub release page.

Secrets stored in GitHub Actions encrypted secrets:
- `APPLE_DEV_ID_APPLICATION_P12` (base64), `APPLE_DEV_ID_APPLICATION_PWD`
- `APPLE_DEV_ID_INSTALLER_P12`, `APPLE_DEV_ID_INSTALLER_PWD`
- `APPLE_NOTARY_APPLE_ID`, `APPLE_NOTARY_PWD` (app-specific), `APPLE_TEAM_ID`
- `WINDOWS_SIGNTOOL_CERT_P12`, `WINDOWS_SIGNTOOL_PWD`

Each is imported into a temporary keychain (mac) or cert store (win)
at the start of the job and discarded at the end.

---

## 9. Distribution

### 9.1 Hosting

Installers (`.pkg`, `.exe`) are signed objects of 30–80 MB each. They
**do not** belong in the Next.js bundle. Recommended pipeline:

- Storage: **Cloudflare R2** (no egress fees, S3-compatible API).
- CDN in front: Cloudflare (already implicit with R2).
- Public URL pattern: `https://downloads.opticksaudio.com/<product>/<version>/<file>`.
- Web pulls a JSON manifest from `https://downloads.opticksaudio.com/manifest.json`
  to know the latest version per product. The Download buttons on the
  product page resolve to the right URL at runtime.
- `release.yml` uploads to R2 on a successful tag build, then writes
  the manifest atomically.

### 9.2 What the web does

In `opticks-web` (renamed from `opticks-audio-web`):

- `src/app/plugins/[slug]/page.tsx` already has `<DownloadButtons />`.
  Its data source becomes the live manifest (server component, ISR
  every 5 minutes) rather than the hard-coded plugin object.
- A new server action `getDownloadUrl(plugin, platform)` returns a
  signed short-lived URL (15 min) if we want to gate downloads behind
  email capture later. For v1, public URLs are fine.

---

## 10. Licensing

### 10.1 JUCE

The repo currently has `JUCE_DISPLAY_SPLASH_SCREEN=0`, which is **only
legal under a JUCE commercial licence (Indie or Pro)**. The current
plan is to ship the free Personal tier with splash, so:

- `JUCE_DISPLAY_SPLASH_SCREEN` is set to `1` in every plugin
  `CMakeLists.txt` until a commercial JUCE licence is purchased.
- A clear `docs/THIRD_PARTY.md` entry documents the JUCE version, tag,
  licence tier in force, and the upgrade path.

### 10.2 Opticks Audio plugin licence

For v0.x (pre-public-beta), all plugins are free, **time-unlimited**,
no licensing system. This intentionally postpones building
`opticks-licensing` until product-market fit is established.

When `opticks-licensing` ships, the model is:

- **Perpetual licence + free LE/Lite tier** (FabFilter / Valhalla
  pattern). Purchase yields a licence key tied to a machine ID hash
  with 3-machine activations.
- Activation goes through a thin Cloudflare Workers endpoint backed by
  a Turso/Postgres table. Offline grace period: 30 days after last
  successful refresh. Machine ID is a hash of mac address + machine
  UUID, never a raw identifier, never sent in cleartext.
- The free Lite version locks IR selection, presets, and some
  parameters; otherwise identical engine. This is the funnel.

A `LICENSE` file in the repo states the commercial terms; the source
code is **proprietary** by default (a private monorepo). When/if any
library is opened (e.g. `opticks-dsp-core` under MIT), a per-library
`LICENSE` overrides.

### 10.3 IR licensing

Every impulse response shipped in `shared/ir-bank/` must have a
documented source and licence in `docs/THIRD_PARTY.md`. Spaces sampled
in-house go under our own copyright. Third-party CC0 / public-domain
IRs are listed with origin URL and SHA-256 hash.

---

## 11. Coding standards

- **C++ standard**: 20. `-Wall -Wextra -Wpedantic -Wshadow -Wconversion
  -Wfloat-conversion -Werror` on CI; warnings-as-errors gated by
  `opticks_set_warnings()`.
- **clang-format**: LLVM base, 4-space indent, 100-col limit, braces on
  next line for functions/classes, on same line for control flow.
  Enforced in CI.
- **clang-tidy**: `cppcoreguidelines-*`, `modernize-*`, `performance-*`,
  `readability-*` (selected checks). Baseline file committed.
- **Naming**:
  - Types `PascalCase` (`OpticksProcessor`, `DCBlocker`).
  - Functions and variables `camelCase`.
  - Namespaces lower-case (`opticks::dsp`).
  - Macros `OPTICKS_UPPER_SNAKE`.
  - File names match the primary type (`OpticksProcessor.h`).
- **Includes**: project headers `"opticks/..."` in quotes; system
  headers in `<...>`. Forward-declare in headers when possible.
- **No exceptions in the audio thread.** Errors there are unrecoverable
  by definition; design contracts so they can't happen.
- **No `std::shared_ptr` in DSP code.** Ownership is explicit; lifetime
  is bounded by the plugin instance.
- **One header per primary type.** No "Utils.h" garbage cans.
- **Doxygen-style file headers** on every public header (purpose + 1
  sentence rationale).

---

## 12. Versioning

- **Plugins** follow SemVer (`MAJOR.MINOR.PATCH`):
  - MAJOR: incompatible state changes (preset migration required).
  - MINOR: new parameters added (default values keep old behaviour).
  - PATCH: bug fixes, performance, no parameter changes.
- **Libraries** track their own SemVer in their CMakeLists. Plugins
  pin the library version they were tested against.
- **Preset schema** versioned separately (`schema: N` in `.opreset`).
  `StateManager` migrates forward; never backward.
- **Plugin code (4 chars)** is frozen at first ship. Never changed.

---

## 13. The build order

This is the implementation order when a clean session begins. No step
starts before the previous one is green.

### Phase 0 — Rebrand
1. Rename folder `opticks-audio` → `opticks-audio` (and `opticks-audio-web` → `opticks-web`).
2. Apply §1.1 checklist mechanically. All `NG_*` → `OPTICKS_*`, `ng::` → `opticks::`,
   include paths, library names, CMake function names, bundle prefix, manufacturer
   code, README, web copy.
3. Reorganise existing `ng-dsp-core` headers into the new subfolders
   (`filters/`, `delays/`, …). Existing files (`DCBlocker.h`, `OnePole.h`,
   etc.) keep their content; only namespace and include paths change.
4. Set `JUCE_DISPLAY_SPLASH_SCREEN=1` in every plugin CMake.
5. **Gate**: `cmake --preset mac-dev && cmake --build build && ctest` all green.

### Phase 1 — Platform expansion
6. Implement the new `opticks-dsp-core` primitives in this order:
   filters → delays → modulation → oversampling → reverb → convolution →
   dynamics → utility. Each with unit tests before moving on.
7. Implement `opticks-ui-kit` Theme + Typography + LookAndFeel.
8. Implement `opticks-ui-kit` widgets (Knob, Slider, Button, Meter,
   XYPad, Spectrum, DecayGraph, TextBox).
9. Implement `opticks-ui-kit` components (PresetBar, BypassButton,
   UndoRedoBar, ABCompare, ResizeCorner, Tooltip).
10. Implement `opticks-ui-kit` animation (Easing, Animator).
11. Implement `opticks-plugin-framework` (Parameter, ParameterRegistry,
    OpticksProcessor, OpticksEditor, PresetManager, StateManager,
    UndoStack).
12. Migrate MotionFX onto `OpticksProcessor` + `OpticksEditor` to prove
    the framework works on an existing product. MotionFX continues to
    build and load in Ableton/Logic.
13. **Gate**: all unit tests + pluginval strictness 10 pass for MotionFX.

### Phase 2 — Reflexion
14. Create `plugins/Reflexion/` scaffold using `OpticksProcessor`.
15. Implement DSP in this order: pre-EQ → ER → convolution stage →
    FDN tail → post-EQ → width → master mix. Each step audible at
    each stage via a temporary debug toggle.
16. Implement the IR bank loader; ship 8 IRs as a starting set.
17. Implement the UI: panel layout → controls bound → IR visualiser →
    spatial XY pad → preset bar.
18. Author 40 factory presets across categories (Halls, Rooms, Plates,
    Springs, Cathedrals, Chambers, Ambient, Special).
19. **Gate**: pluginval strictness 10, CPU under 12% single-core on
    M-series at 96 kHz / 64 samples, no clicks on parameter automation,
    no clicks on bypass, latency reported correctly, state save/load
    round-trips bit-exact.

### Phase 3 — Release pipeline
20. Implement `cmake/OpticksSigning.cmake` and `OpticksInstaller.cmake`.
21. Implement `cmake/OpticksPluginVal.cmake`.
22. Author `.github/workflows/{ci,pluginval,release}.yml`.
23. Test the full release path with a Reflexion **release candidate**
    (`v1.0.0-rc1`) end-to-end: signed pkg, notarised, stapled, signed
    exe, uploaded to R2, manifest written, web shows new version.
24. **Gate**: `spctl -a -t install` succeeds on a clean macOS VM that
    has never seen the binary. SmartScreen on Windows shows the EV cert
    publisher.

### Phase 4 — Refraction
25. Same template as Reflexion; reuse 80% of platform.

### Phase 5 — Inflexion
26. Add `Saturator` primitive to `opticks-dsp-core` (was deferred).
27. Same template; reuse 85% of platform.

### Phase 6 — Licensing & monetisation
28. Implement `opticks-licensing`. Backed by Cloudflare Workers + Turso.
29. Move Reflexion / Refraction / Inflexion from "free" to
    "free Lite + paid Pro".
30. Storefront on `opticksaudio.com` (Stripe or LemonSqueezy).

---

## 14. What is intentionally **not** in scope

To keep the project shippable:

- **AAX / Pro Tools** support is deferred until after Phase 5. Requires
  Avid developer account + PACE/iLok. We document the path in
  `docs/RELEASE.md` but do not block on it.
- **CLAP** is deferred until JUCE's CLAP wrapper stabilises.
- **iOS / AUv3** is deferred indefinitely. The plugin chassis is
  designed not to make it harder later.
- **Cloud preset sync** is deferred until licensing exists.
- **Multi-user collaboration features** are out of scope. These are
  studio plugins, not DAW companions.

---

## 15. Open questions to confirm before Phase 0 starts

The following are not blockers but should be answered before the
rebrand commit lands. Each has a recommended default that ships if no
other answer is given.

| Question                                              | Default                                  |
|-------------------------------------------------------|------------------------------------------|
| Rename the git repo `opticks-audio` → `opticks-audio`? | **Yes** — done at first rebrand commit   |
| Rename `opticks-audio-web` → `opticks-web`?                  | **Yes** — same commit                    |
| Public release for MotionFX too, or keep it internal? | **Internal-only**, never shipped publicly |
| Free Lite tier for v1 Reflexion?                      | **No** — full version free in v0.x; gate on licensing release |
| Hosting CDN for downloads                              | **Cloudflare R2**                        |
| Email capture on download                              | **No** in v0.x, **Yes** at v1.0          |
| Telemetry (anonymous, opt-in)                         | **Opt-in**, off by default               |

---

*End of architecture document.*
