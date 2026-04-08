# Development Rules for Agents

When working on this repository, you **MUST** strictly adhere to the following rules to ensure consistent, documented, and planned development for the modern block-based rich text editor:

## 1. Documentation-Driven Development
- Before writing any code or proposing an architectural change, you must consult `PROJECT_BRIEF.md` and `ROADMAP.md` to ensure the work aligns with the current phase and overall vision.
- Do not skip ahead to advanced features (e.g., Media Handling or Collaborative Editing) if the Core Architecture (Phase 1) is incomplete.

## 2. Mandatory Progress Tracking
- Every time you successfully implement a feature, fix a bug, or complete a task outlined in the roadmap, you **MUST** update `PROGRESS.md`.
- Update the **Overall Project Completion** percentage if applicable.
- Update the relevant phase's completion percentage in the **Phases Progress** table.
- Add a new entry to the **Activity Log** using the specified format: `- **[Date]** - [Brief description] - (Phase X)`.

## 3. Step-by-Step Approval
- Do not attempt to complete multiple phases or complex, unrelated tasks in a single iteration.
- Propose changes in small, logical chunks and seek user feedback when completing a major milestone within a phase.

## 4. Quality and Architecture Standards
- All code must adhere to the principles defined in `PROJECT_BRIEF.md` (Zero External Dependencies where possible, Block-Based state, Model-View separation).
- Avoid relying on `document.execCommand` for new core features. All new formatting logic should be handled through the custom block model and renderer.