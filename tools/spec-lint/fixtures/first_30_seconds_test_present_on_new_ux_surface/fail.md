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

1. **What the user sees.** A page that displays AIOperation details.
2. **What they understand without training.** "This is technical."
3. **What they do next.** Reads the output.

Cross-references: Master Spec §3.13.
