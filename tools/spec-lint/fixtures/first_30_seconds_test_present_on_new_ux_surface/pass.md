# UX Fixture

## 1.4 First-30-Seconds Test

### 1.4.1 Required Sub-Section in Every New Surface Spec

Every UI surface authored in this specification MUST include a "First 30 Seconds" sub-section.

1. **What the user sees on the screen**
2. **What they understand without training**
3. **What they do next**
4. **What is hidden and why**

Cross-references to Master Spec §3.13 (Principle 9) and Appendix M (Surface/Engine Mapping) are mandatory in the sub-section.

### 1.4.3 CI-Gate Note

The CI gate `first_30_seconds_test_present_on_new_ux_surface` asserts a new `### N.N.N` component spec, new `#### {Surface Name}` sub-section, and new `## N.N` chapter sub-section contain four required bullets and the mandatory cross-references to Master Spec §3.13 and Appendix M.

### 1.4.4 Retro-Documentation of v7.1.0 Surfaces

Buyer Maya onboarding — "What Are You Evaluating?" Intake
Defense View
Compressed pipeline progress bar (PipelineSurface)
Seller Maya magic-link Hero Moment landing

Each of the four sub-sections follows the §1.4.1 four-bullet structure and cites Master Spec §3.13.

### 4.2.13 Defense View

#### First 30 Seconds (per §1.4)

1. **What the user sees.** A simple recommendation page.
2. **What they understand without training.** "This is the meeting brief."
3. **What they do next.** Reads the recommendation.
4. **What is hidden, and why.** Defense View (§13.11, closed Phase 14.5), Selection Report, Selection Record, Selection Report SHA-256 content hash, and the AIOperation row in the Architecture block stay in the engine.

Cross-references: Master Spec §3.13; Master Spec Appendix M; `UX_Design_of_Sourcera.md` §1.4.

#### Seller Magic-Link Hero Moment Landing — Phase 14.8 Polish (2026-04-27)

##### First 30 Seconds — Screen 1, Magic-Link Landing Page (per §1.4)

1. **What the user sees.** A buyer invitation and one action.
2. **What they understand without training.** "The buyer wants me to bid."
3. **What they do next.** Clicks the action.
4. **What is hidden, and why.** Seller Maya Surface Abstraction — Capability Declarations auto-publish, Seller Maya Surface Abstraction — KB governance silent engine + weekly notification, Seller Maya Surface Abstraction — Match Score three-label compression, and the AIOperation row in the Architecture block stay in the engine.

Cross-references: Master Spec §3.13; Master Spec Appendix M; `UX_Design_of_Sourcera.md` §1.4.

#### "What Are You Evaluating?" Intake (Phase 14.7 — 2026-04-27)

##### First 30 Seconds — Screen 1, Intake (per §1.4)

1. **What the user sees.** A category picker.
2. **What they understand without training.** "I pick what I am buying."
3. **What they do next.** Clicks a category.
4. **What is hidden, and why.** "What Are You Evaluating?" Intake, Per-Vertical Eval Starters, Workspace pre-population materializer, and `EvalStarter` / `EvalVertical` rows stay in the engine.

Cross-references: Master Spec §3.13; Master Spec Appendix M; `UX_Design_of_Sourcera.md` §1.4.

### 5.2.19 PipelineSurface

#### First 30 Seconds (per §1.4)

1. **What the user sees.** A four-step progress bar.
2. **What they understand without training.** "I know where I am."
3. **What they do next.** Advances when ready.
4. **What is hidden, and why.** Pipeline Surface Compression, `pipeline_stage_id` integer (0–15), and per-phase rows in the Sourcera Method block stay in the engine.

Cross-references: Master Spec §3.13; Master Spec Appendix M; `UX_Design_of_Sourcera.md` §1.4.
