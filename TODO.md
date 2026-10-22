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

- [ ] Add inclusive random-integer generation.
- [ ] Add array shuffling.
- [ ] Add unique ID generation.
- [ ] Add question validation.
- [ ] Define difficulty rules for every operation.

### 12. Implement Addition Questions

- [ ] Generate two operands.
- [ ] Apply the selected difficulty rules.
- [ ] Calculate the correct answer.
- [ ] Generate the display text.
- [ ] Return a valid `Question` object.
- [ ] Test minimum and maximum operand ranges.
- [ ] Test maximum-result restrictions.

### 13. Implement Subtraction Questions

- [ ] Generate two operands.
- [ ] Prevent negative answers for the initial lower difficulty levels.
- [ ] Apply the selected difficulty rules.
- [ ] Calculate the correct answer.
- [ ] Generate the display text.
- [ ] Return a valid `Question` object.
- [ ] Test that the first operand is not smaller than the second where required.

### 14. Implement Multiplication Questions

- [ ] Generate two factors.
- [ ] Apply the selected difficulty rules.
- [ ] Calculate the correct product.
- [ ] Generate the display text.
- [ ] Return a valid `Question` object.
- [ ] Test factor ranges for every difficulty level.

### 15. Implement Division Questions

- [ ] Generate a nonzero divisor.
- [ ] Generate a whole-number quotient.
- [ ] Calculate the dividend from the divisor and quotient.
- [ ] Apply the selected difficulty rules.
- [ ] Generate the display text.
- [ ] Return a valid `Question` object.
- [ ] Test that division by zero is impossible.
- [ ] Test that all answers are whole numbers.

### 16. Create the Main Question Generator

- [ ] Accept an operation and difficulty level.
- [ ] Call the correct operation-specific generator.
- [ ] Randomly select an operation when multiple operations are enabled.
- [ ] Validate the generated question.
- [ ] Handle unexpected generation failures.
- [ ] Add unit tests for all operations and difficulty levels.

## Phase 5: Answer Choices

### 17. Build the Distractor Generator

- [ ] Generate three plausible incorrect answers.
- [ ] Use nearby values and common arithmetic mistakes.
- [ ] Add operation-specific distractor strategies.
- [ ] Prevent duplicate distractors.
- [ ] Prevent the correct answer from appearing as a distractor.

### 18. Build Final Choice Lists

- [ ] Combine the correct answer and distractors.
- [ ] Ensure exactly four choices.
- [ ] Shuffle the choices.
- [ ] Ensure all choices are unique.
- [ ] Test that the correct answer appears exactly once.

## Phase 6: Interactive Question Card

### 19. Build the Card Front

- [ ] Display the question.
- [ ] Display four answer choices.
- [ ] Allow one answer to be selected.
- [ ] Show selected state clearly.
- [ ] Add a control to reveal/flip the card.

### 20. Build the Card Back

- [ ] Display the correct answer.
- [ ] Display the selected answer.
- [ ] Add **I Got It Right**.
- [ ] Add **I Got It Wrong**.
- [ ] Support optional explanation content.

### 21. Add Card Interaction

- [ ] Track selected answer.
- [ ] Flip between front and back.
- [ ] Respect animation settings.
- [ ] Prevent accidental duplicate result submission.
- [ ] Add component tests.

## Phase 7: Practice Session Flow

### 22. Create Session State

- [ ] Create a new session from the setup configuration.
- [ ] Generate the first question.
- [ ] Track current question.
- [ ] Track attempts.
- [ ] Track correct and incorrect totals.

### 23. Record Attempts

- [ ] Save selected answer.
- [ ] Save self-reported correct/incorrect status.
- [ ] Save operation and difficulty.
- [ ] Save question source.
- [ ] Save timestamp and session ID.

### 24. Add Session Progress

- [ ] Display attempted count.
- [ ] Display progress for fixed-length sessions.
- [ ] Support continuous-practice display.
- [ ] Update progress after each completed question.

### 25. Advance Questions

- [ ] Generate the next question after a result is recorded.
- [ ] Reset card state between questions.
- [ ] Preserve session totals.
- [ ] Support mixed-operation sessions.

### 26. Verify Regular Session Flow

- [ ] Test a fixed-length session.
- [ ] Test mixed operations.
- [ ] Test continuous practice.
- [ ] Test correct/incorrect totals.
- [ ] Test progress updates.

## Phase 8: Session Completion and Summary

### 32. Detect Session Completion

- [ ] Detect when a fixed-length session reaches its target.
- [ ] Stop generating questions after completion.
- [ ] Save completion time.
- [ ] Navigate to the summary page.

### 33. Build the Session Summary Page

- [ ] Display attempted questions.
- [ ] Display correct answers.
- [ ] Display incorrect answers.
- [ ] Display accuracy.
- [ ] Display session configuration/details.
- [ ] Display mistake-review question count when applicable.

### 34. Add Summary Actions

- [ ] Add **Practice Again**.
- [ ] Add **Practice Mistakes**.
- [ ] Add **Change Settings**.
- [ ] Add **View Statistics**.
- [ ] Add **Return Home**.
- [ ] Disable Practice Mistakes when no mistakes are available.

## Phase 9: Local Data Persistence

### 35. Create the Storage Layer

- [ ] Create safe localStorage read/write helpers.
- [ ] Handle JSON parse errors.
- [ ] Handle unavailable localStorage.
- [ ] Handle storage quota errors.
- [ ] Define storage keys.

### 36. Validate Stored Data

- [ ] Validate settings.
- [ ] Validate sessions.
- [ ] Validate attempts.
- [ ] Sanitize invalid values.
- [ ] Fall back to safe defaults.

### 37. Add Storage Versioning

- [ ] Add a schema/storage version.
- [ ] Add a migration mechanism.
- [ ] Preserve unrelated valid data during migration.

### 38. Persist Settings and History

- [ ] Save settings.
- [ ] Save attempts.
- [ ] Save completed sessions.
- [ ] Reload stored data at application startup.

### 39. Add Storage Limits

- [ ] Limit raw stored sessions.
- [ ] Limit raw stored attempts.
- [ ] Verify persistence after refresh/restart.

## Phase 10: Statistics

### 40. Calculate Overall Statistics

- [ ] Calculate attempted.
- [ ] Calculate correct.
- [ ] Calculate incorrect.
- [ ] Calculate accuracy.
- [ ] Handle zero attempts.

### 41. Calculate Statistics by Operation

- [ ] Addition.
- [ ] Subtraction.
- [ ] Multiplication.
- [ ] Division.

### 42. Calculate Statistics by Difficulty

- [ ] Beginner.
- [ ] Easy.
- [ ] Intermediate.
- [ ] Advanced.

### 43. Build the Statistics Overview

- [ ] Display overall attempted.
- [ ] Display correct.
- [ ] Display incorrect.
- [ ] Display accuracy.
- [ ] Add an empty state.

### 44. Build Operation Statistics

- [ ] Display a section/card for every operation.
- [ ] Display attempted/correct/incorrect/accuracy.
- [ ] Make cards responsive.

### 45. Build Difficulty Statistics

- [ ] Display a section/card for every difficulty.
- [ ] Use readable labels.

### 46. Add Recent Sessions

- [ ] Show recent sessions newest first.
- [ ] Display date.
- [ ] Display operations.
- [ ] Display difficulty.
- [ ] Display totals and accuracy.

### 47. Add Reset Statistics

- [ ] Add a reset action.
- [ ] Ask for confirmation.
- [ ] Clear practice history/statistics.
- [ ] Keep application settings unchanged.

## Phase 11: Settings

### 48. Create the Settings Page

- [ ] Add a sound-effects setting.
- [ ] Add a card-animation setting.
- [ ] Add a show-explanations setting.
- [ ] Add a feedback-messages setting.
- [ ] Add a mastery-threshold setting.
- [ ] Add a default session-length setting.
- [ ] Add a default difficulty setting.
- [ ] Add default operation settings.
- [ ] Save settings automatically or through a save button.

### 49. Apply Default Practice Settings

- [ ] Load default operations on the setup page.
- [ ] Load the default difficulty.
- [ ] Load the default session length.
- [ ] Allow defaults to be changed for an individual session without overwriting saved defaults.

### 50. Add Clear-All-Data Functionality

- [ ] Add a **Clear All Application Data** button.
- [ ] Show a strong confirmation warning.
- [ ] Clear settings, sessions, attempts, statistics, mistake patterns, and active-session data.
- [ ] Restore application defaults.
- [ ] Return the user to the home page.

## Phase 12: Mistake Tracking

### 51. Record Mistake Patterns

- [ ] Create a mistake pattern after an incorrect regular-practice answer.
- [ ] Store operation, operands, answer, and difficulty.
- [ ] Track incorrect count.
- [ ] Track last incorrect date.
- [ ] Avoid duplicate patterns for the same fact.

### 52. Update Existing Patterns

- [ ] Increment incorrect count after repeated misses.
- [ ] Reset mastery progress after a new mistake when appropriate.
- [ ] Reactivate a mastered pattern after it is missed again.

### 53. Persist Mistake Patterns

- [ ] Save patterns to localStorage.
- [ ] Validate loaded mistake patterns.
- [ ] Load active mistake patterns when needed.
- [ ] Add tests for creation, update, and persistence.

## Phase 13: Similar Question Generation

### 54. Define Similarity Rules

- [ ] Keep the same operation.
- [ ] Stay near the original difficulty.
- [ ] Vary operands while preserving the practiced concept.
- [ ] Keep all generated questions valid.

### 55. Generate Similar Questions

- [ ] Generate from a saved mistake pattern.
- [ ] Attach the source mistake-pattern ID.
- [ ] Tag the question as `mistake-review`.
- [ ] Avoid endlessly repeating the exact same question.

### 56. Validate Similar Questions

- [ ] Reuse standard question validation.
- [ ] Provide a safe fallback when generation fails.
- [ ] Add unit tests.

### 57. Prepare Review Integration

- [ ] Make similar-question generation callable from a review session.
- [ ] Preserve mastery-tracking information.

## Phase 14: Mistake Review Mode

### 58. Add Review Mode to Practice Setup

- [ ] Add a regular-practice option.
- [ ] Add a mistake-review option.
- [ ] Disable mistake review when no active mistakes exist.
- [ ] Explain why review is unavailable when appropriate.
- [ ] Hide operation/difficulty selectors in mistake-review mode when the review patterns determine them.

### 59. Prioritize Mistake Patterns

- [ ] Prioritize patterns with higher incorrect counts.
- [ ] Consider how recently the pattern was missed.
- [ ] Consider lower mastery progress.
- [ ] Add a tiebreaker for equally ranked patterns.

### 60. Build Mistake Review Sessions

- [ ] Select active mistake patterns.
- [ ] Generate similar questions from prioritized patterns.
- [ ] Tag review questions correctly.
- [ ] Support normal session tracking and summary behavior.

### 61. Track Similar-Question Results

- [ ] Increment similar-correct count after a correct review result.
- [ ] Reset mastery progress after an incorrect review result.
- [ ] Update incorrect count when appropriate.
- [ ] Persist pattern updates.

### 62. Apply Mastery Rules

- [ ] Use the configured mastery threshold.
- [ ] Mark a pattern mastered when the threshold is reached.
- [ ] Exclude mastered patterns from active review.
- [ ] Reactivate a mastered pattern if it is missed again.

## Phase 15: Advanced Statistics

### 63. Add Mistake Statistics

- [ ] Display active mistake patterns.
- [ ] Display mastered mistake patterns.
- [ ] Display number of similar questions practiced.
- [ ] Display correct mistake-review answers.

### 64. Add Frequently Missed Areas

- [ ] Calculate the most missed operation.
- [ ] Support ties.
- [ ] Display most missed number facts.
- [ ] Sort facts by incorrect count.
- [ ] Add a useful empty state.

### 65. Add Mistake Details

- [ ] Add Active and Mastered views/tabs.
- [ ] Display the missed fact.
- [ ] Display incorrect count.
- [ ] Display mastery progress.
- [ ] Display the last incorrect date.
- [ ] Allow mastered patterns to be viewed separately.

## Phase 16: Accessibility

### 66. Improve Keyboard Navigation

- [ ] Ensure every control is reachable with the keyboard.
- [ ] Support Enter/Space on buttons.
- [ ] Add optional 1–4 answer shortcuts.
- [ ] Ignore shortcuts when typing in editable controls.
- [ ] Add visible focus styles.

### 67. Improve Screen-Reader Support

- [ ] Add meaningful ARIA labels.
- [ ] Add live announcements for question changes.
- [ ] Announce answer selection and revealed answers.
- [ ] Make progress accessible.
- [ ] Use semantic heading structure.

### 68. Support Reduced Motion

- [ ] Detect `prefers-reduced-motion`.
- [ ] Disable card animation when appropriate.
- [ ] Keep state changes understandable without animation.

### 69. Improve Visual Accessibility

- [ ] Do not communicate state by color alone.
- [ ] Add text/icons to selected/result states.
- [ ] Use readable contrast.
- [ ] Use relative typography.
- [ ] Verify browser zoom.

## Phase 17: Responsive Design and Polish

### 70. Optimize for Tablets

- [ ] Use large touch targets.
- [ ] Center and constrain practice cards.
- [ ] Ensure navigation is easy to tap.
- [ ] Verify landscape/tablet layouts.

### 71. Optimize for Phones

- [ ] Stack answer choices when necessary.
- [ ] Prevent horizontal scrolling.
- [ ] Simplify navigation for small screens.
- [ ] Verify common phone widths.

### 72. Improve Statistics Layout

- [ ] Reflow metric cards on small screens.
- [ ] Prevent labels from overlapping.
- [ ] Make recent-session rows/cards responsive.

### 73. Add Child-Friendly Feedback

- [ ] Create positive feedback messages.
- [ ] Create supportive incorrect-answer messages.
- [ ] Avoid shaming language.
- [ ] Show feedback after the student self-reports.
- [ ] Allow feedback to be disabled in Settings.

## Phase 18: Session Recovery and Navigation Safety

### 74. Persist an Active Session

- [ ] Save the active session.
- [ ] Save the current question.
- [ ] Save attempts.
- [ ] Save selected answer and card state.
- [ ] Restore an active session after refresh.
- [ ] Clear the active-session snapshot after completion.

### 75. Protect Against Accidental Navigation

- [ ] Warn before navigating away from an active session.
- [ ] Provide **Keep Practicing** and **End Session** choices.
- [ ] Register a browser unload warning while practice is active.
- [ ] Disable warnings after the session ends.

## Phase 19: Error Handling

### 76. Handle Invalid Stored Data

- [ ] Validate each storage category independently at startup.
- [ ] Recover invalid settings.
- [ ] Recover invalid sessions.
- [ ] Recover invalid attempts.
- [ ] Recover invalid mistake patterns.
- [ ] Recover invalid active-session data.
- [ ] Reset only the affected category.
- [ ] Show a friendly recovery warning.

### 77. Handle Question-Generation Failures

- [ ] Validate every generated result.
- [ ] Retry failed generation.
- [ ] Limit retries.
- [ ] Provide known-good fallback questions.
- [ ] Log useful development diagnostics without exposing them to users.

### 78. Add User-Friendly Error Messages

- [ ] Add a reusable error panel.
- [ ] Handle missing session state.
- [ ] Handle missing summary state.
- [ ] Handle unavailable mistake review.
- [ ] Avoid stack traces in user-facing messages.
- [ ] Always provide a safe path back to Practice Setup or Home.

## Phase 20: Testing

### 79. Complete Unit Tests

- [ ] Test all question generators.
- [ ] Test difficulty boundaries.
- [ ] Test distractor generation.
- [ ] Test answer uniqueness.
- [ ] Test statistics calculations.
- [ ] Test mistake pattern behavior.
- [ ] Test similar-question generation.
- [ ] Test mastery rules.
- [ ] Test storage serialization and validation.

### 80. Complete Component Tests

- [ ] Test operation selection.
- [ ] Test difficulty selection.
- [ ] Test answer selection.
- [ ] Test card flipping.
- [ ] Test right and wrong buttons.
- [ ] Test progress updates.
- [ ] Test session completion.
- [ ] Test statistics display.
- [ ] Test confirmation dialogs.

### 81. Complete Integration Tests

- [ ] Test a full addition session.
- [ ] Test a mixed-operation session.
- [ ] Test continuous practice.
- [ ] Test an incorrect answer creating a mistake pattern.
- [ ] Test mistake-review generation.
- [ ] Test mastery completion.
- [ ] Test persistence after a browser refresh.
- [ ] Test resetting statistics.

### 82. Complete Accessibility Testing

- [ ] Complete a session using only the keyboard.
- [ ] Test with screen-reader-friendly labels/tools.
- [ ] Test reduced-motion mode.
- [ ] Test browser zoom.
- [ ] Run an automated accessibility checker.
- [ ] Manually review reported issues.

## Phase 21: Performance and Data Management

### 83. Optimize React Rendering

- [ ] Memoize expensive statistics calculations.
- [ ] Avoid unnecessary global/context updates.
- [ ] Avoid generating questions unnecessarily during render.
- [ ] Verify practice interactions stay responsive.

### 84. Manage Large Practice Histories

- [ ] Define a maximum raw-attempt history.
- [ ] Trim older attempts when the limit is exceeded.
- [ ] Preserve older totals through archived aggregate statistics.
- [ ] Measure local-storage usage.
- [ ] Limit the number of recent sessions displayed.
- [ ] Add large-history tests.

### 85. Improve Loading Performance

- [ ] Lazy-load large secondary pages where appropriate.
- [ ] Add a loading fallback.
- [ ] Review bundle size.
- [ ] Remove unused assets/dependencies.
- [ ] Optimize web-font loading.
- [ ] Add a build-size or equivalent verification command.

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
