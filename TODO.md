# Math Practice App — TODO

> Work through the phases in order. After implementing a phase, test it, fix any problems, and only then check off the completed items.

## Phase 1: Project Setup

### 1. Create the React Project

- [x] Create a new React project using Vite.
- [x] Configure TypeScript.
- [x] Install project dependencies.
- [x] Confirm that the development server runs.
- [x] Remove the default Vite demonstration content.
- [x] Create the initial application folder structure.

### 2. Configure Development Tools

- [x] Configure ESLint.
- [x] Configure Prettier.
- [x] Add scripts for linting and formatting.
- [x] Install Vitest.
- [x] Install React Testing Library.
- [x] Create one basic component test.
- [x] Confirm that tests run successfully.

### 3. Define Shared TypeScript Types

- [x] Create the `MathOperation` type.
- [x] Create the `DifficultyLevel` type.
- [x] Create the `Question` interface.
- [x] Create the `PracticeAttempt` interface.
- [x] Create the `PracticeSession` interface.
- [x] Create the `MistakePattern` interface.
- [x] Create the statistics interfaces.
- [x] Create the application settings interface.

## Phase 2: Basic Interface

### 4. Create Shared Layout

- [x] Create the application shell/layout.
- [x] Create a reusable page container.
- [x] Create the application header/title.
- [x] Create reusable buttons and shared UI styles.
- [x] Create a child-friendly visual theme.

### 5. Add Navigation and Routing

- [x] Install/configure React Router.
- [x] Add routes for Home, Practice Setup, Practice Session, Session Summary, Statistics, and Settings.
- [x] Add main navigation.
- [x] Handle unknown routes safely.

### 6. Build the Home Page

- [x] Add Start Practice.
- [x] Add View Statistics.
- [x] Add Settings.
- [x] Wire Home page actions to the correct routes.
- [x] Make the interface attractive for children ages 7–12.

## Phase 3: Practice Setup

### 7. Build the Operation Selector

- [x] Add Addition.
- [x] Add Subtraction.
- [x] Add Multiplication.
- [x] Add Division.
- [x] Support selecting multiple operations.
- [x] Add Select All Operations.
- [x] Show selected state clearly.

### 8. Build the Difficulty Selector

- [x] Add Beginner.
- [x] Add Easy.
- [x] Add Intermediate.
- [x] Add Advanced.
- [x] Allow only one difficulty at a time.
- [x] Add short descriptions for each level.

### 9. Build the Session-Length Selector

- [x] Add 5 questions.
- [x] Add 10 questions.
- [x] Add 20 questions.
- [x] Add Continuous Practice.
- [x] Use 10 questions as the initial default.

### 10. Build the Practice Setup Page

- [x] Add the operation selector.
- [x] Add the difficulty selector.
- [x] Add the session-length selector.
- [x] Add a **Start Session** button.
- [x] Disable the button when no operation is selected.
- [x] Display a validation message when necessary.
- [x] Pass the selected configuration to the practice session.

## Phase 4: Question Generation

### 11. Create Question-Generation Utilities

- [x] Add inclusive random-integer generation.
- [x] Add array shuffling.
- [x] Add unique ID generation.
- [x] Add question validation.
- [x] Define difficulty rules for every operation.

### 12. Implement Addition Questions

- [x] Generate two operands.
- [x] Apply the selected difficulty rules.
- [x] Calculate the correct answer.
- [x] Generate the display text.
- [x] Return a valid `Question` object.
- [x] Test minimum and maximum operand ranges.
- [x] Test maximum-result restrictions.

### 13. Implement Subtraction Questions

- [x] Generate two operands.
- [x] Prevent negative answers for the initial lower difficulty levels.
- [x] Apply the selected difficulty rules.
- [x] Calculate the correct answer.
- [x] Generate the display text.
- [x] Return a valid `Question` object.
- [x] Test that the first operand is not smaller than the second where required.

### 14. Implement Multiplication Questions

- [x] Generate two factors.
- [x] Apply the selected difficulty rules.
- [x] Calculate the correct product.
- [x] Generate the display text.
- [x] Return a valid `Question` object.
- [x] Test factor ranges for every difficulty level.

### 15. Implement Division Questions

- [x] Generate a nonzero divisor.
- [x] Generate a whole-number quotient.
- [x] Calculate the dividend from the divisor and quotient.
- [x] Apply the selected difficulty rules.
- [x] Generate the display text.
- [x] Return a valid `Question` object.
- [x] Test that division by zero is impossible.
- [x] Test that all answers are whole numbers.

### 16. Create the Main Question Generator

- [x] Accept an operation and difficulty level.
- [x] Call the correct operation-specific generator.
- [x] Randomly select an operation when multiple operations are enabled.
- [x] Validate the generated question.
- [x] Handle unexpected generation failures.
- [x] Add unit tests for all operations and difficulty levels.

## Phase 5: Answer Choices

### 17. Build the Distractor Generator

- [x] Generate three plausible incorrect answers.
- [x] Use nearby values and common arithmetic mistakes.
- [x] Add operation-specific distractor strategies.
- [x] Prevent duplicate distractors.
- [x] Prevent the correct answer from appearing as a distractor.

### 18. Build Final Choice Lists

- [x] Combine the correct answer and distractors.
- [x] Ensure exactly four choices.
- [x] Shuffle the choices.
- [x] Ensure all choices are unique.
- [x] Test that the correct answer appears exactly once.

## Phase 6: Interactive Question Card

### 19. Build the Card Front

- [x] Display the question.
- [x] Display four answer choices.
- [x] Allow one answer to be selected.
- [x] Show selected state clearly.
- [x] Add a control to reveal/flip the card.

### 20. Build the Card Back

- [x] Display the correct answer.
- [x] Display the selected answer.
- [x] Add **I Got It Right**.
- [x] Add **I Got It Wrong**.
- [x] Support optional explanation content.

### 21. Add Card Interaction

- [x] Track selected answer.
- [x] Flip between front and back.
- [x] Respect animation settings.
- [x] Prevent accidental duplicate result submission.
- [x] Add component tests.

## Phase 7: Practice Session Flow

### 22. Create Session State

- [x] Create a new session from the setup configuration.
- [x] Generate the first question.
- [x] Track current question.
- [x] Track attempts.
- [x] Track correct and incorrect totals.

### 23. Record Attempts

- [x] Save selected answer.
- [x] Save self-reported correct/incorrect status.
- [x] Save operation and difficulty.
- [x] Save question source.
- [x] Save timestamp and session ID.

### 24. Add Session Progress

- [x] Display attempted count.
- [x] Display progress for fixed-length sessions.
- [x] Support continuous-practice display.
- [x] Update progress after each completed question.

### 25. Advance Questions

- [x] Generate the next question after a result is recorded.
- [x] Reset card state between questions.
- [x] Preserve session totals.
- [x] Support mixed-operation sessions.

### 26. Verify Regular Session Flow

- [x] Test a fixed-length session.
- [x] Test mixed operations.
- [x] Test continuous practice.
- [x] Test correct/incorrect totals.
- [x] Test progress updates.

## Phase 8: Session Completion and Summary

### 32. Detect Session Completion

- [x] Detect when a fixed-length session reaches its target.
- [x] Stop generating questions after completion.
- [x] Save completion time.
- [x] Navigate to the summary page.

### 33. Build the Session Summary Page

- [x] Display attempted questions.
- [x] Display correct answers.
- [x] Display incorrect answers.
- [x] Display accuracy.
- [x] Display session configuration/details.
- [x] Display mistake-review question count when applicable.

### 34. Add Summary Actions

- [x] Add **Practice Again**.
- [x] Add **Practice Mistakes**.
- [x] Add **Change Settings**.
- [x] Add **View Statistics**.
- [x] Add **Return Home**.
- [x] Disable Practice Mistakes when no mistakes are available.

## Phase 9: Local Data Persistence

### 35. Create the Storage Layer

- [x] Create safe localStorage read/write helpers.
- [x] Handle JSON parse errors.
- [x] Handle unavailable localStorage.
- [x] Handle storage quota errors.
- [x] Define storage keys.

### 36. Validate Stored Data

- [x] Validate settings.
- [x] Validate sessions.
- [x] Validate attempts.
- [x] Sanitize invalid values.
- [x] Fall back to safe defaults.

### 37. Add Storage Versioning

- [x] Add a schema/storage version.
- [x] Add a migration mechanism.
- [x] Preserve unrelated valid data during migration.

### 38. Persist Settings and History

- [x] Save settings.
- [x] Save attempts.
- [x] Save completed sessions.
- [x] Reload stored data at application startup.

### 39. Add Storage Limits

- [x] Limit raw stored sessions.
- [x] Limit raw stored attempts.
- [x] Verify persistence after refresh/restart.

## Phase 10: Statistics

### 40. Calculate Overall Statistics

- [x] Calculate attempted.
- [x] Calculate correct.
- [x] Calculate incorrect.
- [x] Calculate accuracy.
- [x] Handle zero attempts.

### 41. Calculate Statistics by Operation

- [x] Addition.
- [x] Subtraction.
- [x] Multiplication.
- [x] Division.

### 42. Calculate Statistics by Difficulty

- [x] Beginner.
- [x] Easy.
- [x] Intermediate.
- [x] Advanced.

### 43. Build the Statistics Overview

- [x] Display overall attempted.
- [x] Display correct.
- [x] Display incorrect.
- [x] Display accuracy.
- [x] Add an empty state.

### 44. Build Operation Statistics

- [x] Display a section/card for every operation.
- [x] Display attempted/correct/incorrect/accuracy.
- [x] Make cards responsive.

### 45. Build Difficulty Statistics

- [x] Display a section/card for every difficulty.
- [x] Use readable labels.

### 46. Add Recent Sessions

- [x] Show recent sessions newest first.
- [x] Display date.
- [x] Display operations.
- [x] Display difficulty.
- [x] Display totals and accuracy.

### 47. Add Reset Statistics

- [x] Add a reset action.
- [x] Ask for confirmation.
- [x] Clear practice history/statistics.
- [x] Keep application settings unchanged.

## Phase 11: Settings

### 48. Create the Settings Page

- [x] Add a sound-effects setting.
- [x] Add a card-animation setting.
- [x] Add a show-explanations setting.
- [x] Add a feedback-messages setting.
- [x] Add a mastery-threshold setting.
- [x] Add a default session-length setting.
- [x] Add a default difficulty setting.
- [x] Add default operation settings.
- [x] Save settings automatically or through a save button.

### 49. Apply Default Practice Settings

- [x] Load default operations on the setup page.
- [x] Load the default difficulty.
- [x] Load the default session length.
- [x] Allow defaults to be changed for an individual session without overwriting saved defaults.

### 50. Add Clear-All-Data Functionality

- [x] Add a **Clear All Application Data** button.
- [x] Show a strong confirmation warning.
- [x] Clear settings, sessions, attempts, statistics, mistake patterns, and active-session data.
- [x] Restore application defaults.
- [x] Return the user to the home page.

## Phase 12: Mistake Tracking

### 51. Record Mistake Patterns

- [x] Create a mistake pattern after an incorrect regular-practice answer.
- [x] Store operation, operands, answer, and difficulty.
- [x] Track incorrect count.
- [x] Track last incorrect date.
- [x] Avoid duplicate patterns for the same fact.

### 52. Update Existing Patterns

- [x] Increment incorrect count after repeated misses.
- [x] Reset mastery progress after a new mistake when appropriate.
- [x] Reactivate a mastered pattern after it is missed again.

### 53. Persist Mistake Patterns

- [x] Save patterns to localStorage.
- [x] Validate loaded mistake patterns.
- [x] Load active mistake patterns when needed.
- [x] Add tests for creation, update, and persistence.

## Phase 13: Similar Question Generation

### 54. Define Similarity Rules

- [x] Keep the same operation.
- [x] Stay near the original difficulty.
- [x] Vary operands while preserving the practiced concept.
- [x] Keep all generated questions valid.

### 55. Generate Similar Questions

- [x] Generate from a saved mistake pattern.
- [x] Attach the source mistake-pattern ID.
- [x] Tag the question as `mistake-review`.
- [x] Avoid endlessly repeating the exact same question.

### 56. Validate Similar Questions

- [x] Reuse standard question validation.
- [x] Provide a safe fallback when generation fails.
- [x] Add unit tests.

### 57. Prepare Review Integration

- [x] Make similar-question generation callable from a review session.
- [x] Preserve mastery-tracking information.

## Phase 14: Mistake Review Mode

### 58. Add Review Mode to Practice Setup

- [x] Add a regular-practice option.
- [x] Add a mistake-review option.
- [x] Disable mistake review when no active mistakes exist.
- [x] Explain why review is unavailable when appropriate.
- [x] Hide operation/difficulty selectors in mistake-review mode when the review patterns determine them.

### 59. Prioritize Mistake Patterns

- [x] Prioritize patterns with higher incorrect counts.
- [x] Consider how recently the pattern was missed.
- [x] Consider lower mastery progress.
- [x] Add a tiebreaker for equally ranked patterns.

### 60. Build Mistake Review Sessions

- [x] Select active mistake patterns.
- [x] Generate similar questions from prioritized patterns.
- [x] Tag review questions correctly.
- [x] Support normal session tracking and summary behavior.

### 61. Track Similar-Question Results

- [x] Increment similar-correct count after a correct review result.
- [x] Reset mastery progress after an incorrect review result.
- [x] Update incorrect count when appropriate.
- [x] Persist pattern updates.

### 62. Apply Mastery Rules

- [x] Use the configured mastery threshold.
- [x] Mark a pattern mastered when the threshold is reached.
- [x] Exclude mastered patterns from active review.
- [x] Reactivate a mastered pattern if it is missed again.

## Phase 15: Advanced Statistics

### 63. Add Mistake Statistics

- [x] Display active mistake patterns.
- [x] Display mastered mistake patterns.
- [x] Display number of similar questions practiced.
- [x] Display correct mistake-review answers.

### 64. Add Frequently Missed Areas

- [x] Calculate the most missed operation.
- [x] Support ties.
- [x] Display most missed number facts.
- [x] Sort facts by incorrect count.
- [x] Add a useful empty state.

### 65. Add Mistake Details

- [x] Add Active and Mastered views/tabs.
- [x] Display the missed fact.
- [x] Display incorrect count.
- [x] Display mastery progress.
- [x] Display the last incorrect date.
- [x] Allow mastered patterns to be viewed separately.

## Phase 16: Accessibility

### 66. Improve Keyboard Navigation

- [x] Ensure every control is reachable with the keyboard.
- [x] Support Enter/Space on buttons.
- [x] Add optional 1–4 answer shortcuts.
- [x] Ignore shortcuts when typing in editable controls.
- [x] Add visible focus styles.

### 67. Improve Screen-Reader Support

- [x] Add meaningful ARIA labels.
- [x] Add live announcements for question changes.
- [x] Announce answer selection and revealed answers.
- [x] Make progress accessible.
- [x] Use semantic heading structure.

### 68. Support Reduced Motion

- [x] Detect `prefers-reduced-motion`.
- [x] Disable card animation when appropriate.
- [x] Keep state changes understandable without animation.

### 69. Improve Visual Accessibility

- [x] Do not communicate state by color alone.
- [x] Add text/icons to selected/result states.
- [x] Use readable contrast.
- [x] Use relative typography.
- [x] Verify browser zoom.

## Phase 17: Responsive Design and Polish

### 70. Optimize for Tablets

- [x] Use large touch targets.
- [x] Center and constrain practice cards.
- [x] Ensure navigation is easy to tap.
- [x] Verify landscape/tablet layouts.

### 71. Optimize for Phones

- [x] Stack answer choices when necessary.
- [x] Prevent horizontal scrolling.
- [x] Simplify navigation for small screens.
- [x] Verify common phone widths.

### 72. Improve Statistics Layout

- [x] Reflow metric cards on small screens.
- [x] Prevent labels from overlapping.
- [x] Make recent-session rows/cards responsive.

### 73. Add Child-Friendly Feedback

- [x] Create positive feedback messages.
- [x] Create supportive incorrect-answer messages.
- [x] Avoid shaming language.
- [x] Show feedback after the student self-reports.
- [x] Allow feedback to be disabled in Settings.

## Phase 18: Session Recovery and Navigation Safety

### 74. Persist an Active Session

- [x] Save the active session.
- [x] Save the current question.
- [x] Save attempts.
- [x] Save selected answer and card state.
- [x] Restore an active session after refresh.
- [x] Clear the active-session snapshot after completion.

### 75. Protect Against Accidental Navigation

- [x] Warn before navigating away from an active session.
- [x] Provide **Keep Practicing** and **End Session** choices.
- [x] Register a browser unload warning while practice is active.
- [x] Disable warnings after the session ends.

## Phase 19: Error Handling

### 76. Handle Invalid Stored Data

- [x] Validate each storage category independently at startup.
- [x] Recover invalid settings.
- [x] Recover invalid sessions.
- [x] Recover invalid attempts.
- [x] Recover invalid mistake patterns.
- [x] Recover invalid active-session data.
- [x] Reset only the affected category.
- [x] Show a friendly recovery warning.

### 77. Handle Question-Generation Failures

- [x] Validate every generated result.
- [x] Retry failed generation.
- [x] Limit retries.
- [x] Provide known-good fallback questions.
- [x] Log useful development diagnostics without exposing them to users.

### 78. Add User-Friendly Error Messages

- [x] Add a reusable error panel.
- [x] Handle missing session state.
- [x] Handle missing summary state.
- [x] Handle unavailable mistake review.
- [x] Avoid stack traces in user-facing messages.
- [x] Always provide a safe path back to Practice Setup or Home.

## Phase 20: Testing

### 79. Complete Unit Tests

- [x] Test all question generators.
- [x] Test difficulty boundaries.
- [x] Test distractor generation.
- [x] Test answer uniqueness.
- [x] Test statistics calculations.
- [x] Test mistake pattern behavior.
- [x] Test similar-question generation.
- [x] Test mastery rules.
- [x] Test storage serialization and validation.

### 80. Complete Component Tests

- [x] Test operation selection.
- [x] Test difficulty selection.
- [x] Test answer selection.
- [x] Test card flipping.
- [x] Test right and wrong buttons.
- [x] Test progress updates.
- [x] Test session completion.
- [x] Test statistics display.
- [x] Test confirmation dialogs.

### 81. Complete Integration Tests

- [x] Test a full addition session.
- [x] Test a mixed-operation session.
- [x] Test continuous practice.
- [x] Test an incorrect answer creating a mistake pattern.
- [x] Test mistake-review generation.
- [x] Test mastery completion.
- [x] Test persistence after a browser refresh.
- [x] Test resetting statistics.

### 82. Complete Accessibility Testing

- [x] Complete a session using only the keyboard.
- [x] Test with screen-reader-friendly labels/tools.
- [x] Test reduced-motion mode.
- [x] Test browser zoom.
- [x] Run an automated accessibility checker.
- [x] Manually review reported issues.

## Phase 21: Performance and Data Management

### 83. Optimize React Rendering

- [x] Memoize expensive statistics calculations.
- [x] Avoid unnecessary global/context updates.
- [x] Avoid generating questions unnecessarily during render.
- [x] Verify practice interactions stay responsive.

### 84. Manage Large Practice Histories

- [x] Define a maximum raw-attempt history.
- [x] Trim older attempts when the limit is exceeded.
- [x] Preserve older totals through archived aggregate statistics.
- [x] Measure local-storage usage.
- [x] Limit the number of recent sessions displayed.
- [x] Add large-history tests.

### 85. Improve Loading Performance

- [x] Lazy-load large secondary pages where appropriate.
- [x] Add a loading fallback.
- [x] Review bundle size.
- [x] Remove unused assets/dependencies.
- [x] Optimize web-font loading.
- [x] Add a build-size or equivalent verification command.

## Phase 22: Privacy, Release, and Deployment

### 86. Add Privacy Information

- [ ] Explain that no personal information is required.
- [ ] Explain that practice data stays in browser local storage.
- [ ] State that the app has no analytics/advertising tracking.
- [ ] State that the child-facing interface contains no advertisements.
- [ ] Explain that clearing browser data removes progress.
- [ ] Add a privacy document/page or Settings section.

### 87. Prepare Production Routing

- [ ] Configure SPA route fallback for Netlify.
- [ ] Verify direct route loads.
- [ ] Verify refresh on nested routes.

### 88. Add Release Verification

- [ ] Add a command that runs formatting checks, lint, tests, and production build.
- [ ] Verify production preview.
- [ ] Smoke-test main routes.
- [ ] Verify local-storage persistence in production mode.
- [ ] Check the console for runtime errors.

### 89. Document and Deploy

- [ ] Complete README setup instructions.
- [ ] Document deployment steps.
- [ ] Document browser/device testing.
- [ ] Test Chrome.
- [ ] Test Safari.
- [ ] Test Firefox.
- [ ] Test Edge.
- [ ] Test tablet width.
- [ ] Test phone width.
- [ ] Deploy to Netlify or another public hosting platform.
- [ ] Verify the public URL works after refresh and navigation.

## Final Verification

- [ ] All four arithmetic operations work.
- [ ] Difficulty levels work correctly.
- [ ] Answer choices are valid and unique.
- [ ] Practice sessions track results accurately.
- [ ] Fixed sessions end correctly.
- [ ] Continuous practice works.
- [ ] Session summary is accurate.
- [ ] Mistakes are persisted.
- [ ] Mistake review works.
- [ ] Mastery works.
- [ ] Statistics are accurate.
- [ ] Settings persist.
- [ ] Data survives refresh.
- [ ] Active sessions recover when appropriate.
- [ ] Accessibility checks pass.
- [ ] Responsive layout is usable.
- [ ] `npm run test` passes.
- [ ] `npm run lint` passes.
- [ ] Production build succeeds.
- [ ] README is complete.
- [ ] GitHub repository is up to date.
- [ ] Public deployment works.
