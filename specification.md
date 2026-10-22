# Math Practice App — Software Specification

## 1. Purpose

Math Practice is a browser-based learning application for children ages 7–12. It helps students practice addition, subtraction, multiplication, and division with interactive question cards, configurable practice sessions, progress tracking, mistake review, and statistics.

The initial release is designed to work entirely in the browser. It does not require a user account or backend server. Practice data and settings are stored locally in the browser.

## 2. Target Users

- Primary users: children ages 7–12.
- Secondary users: parents, teachers, or guardians who may review progress.
- The interface should be friendly, encouraging, simple to understand, and usable on desktops, tablets, and phones.

## 3. Technology

The reference implementation uses:

- React
- TypeScript
- Vite
- React Router
- Vitest
- React Testing Library
- Browser `localStorage`

Equivalent technologies may be used if the assignment allows them, but the application behavior in this specification should remain the same.

## 4. Core Navigation

The application should provide the following main views:

- Home
- Practice Setup
- Practice Session
- Session Summary
- Statistics
- Settings

Primary routes in the reference implementation include:

- `/`
- `/practice/setup`
- `/practice/session`
- `/practice/summary`
- `/statistics`
- `/settings`

Unknown routes should fail gracefully or redirect to a safe page.

## 5. Home Page

The Home page should:

- Clearly identify the application as Math Practice.
- Present a child-friendly design.
- Provide easy access to:
  - Start Practice
  - Statistics
  - Settings
- Provide navigation to the major application views.
- Work on desktop, tablet, and mobile screen sizes.

## 6. Practice Setup

Before a regular practice session, the student should be able to configure:

### 6.1 Operations

Support:

- Addition
- Subtraction
- Multiplication
- Division

Users may select one or multiple operations.

The application should also support selecting all operations for mixed practice.

At least one operation must be selected before a regular practice session can begin.

### 6.2 Difficulty

Support four levels:

1. Beginner
2. Easy
3. Intermediate
4. Advanced

Each difficulty level should change the numeric ranges or complexity used by the question generators.

### 6.3 Session Length

Support:

- 5 questions
- 10 questions
- 20 questions
- Continuous practice

The default session length is 10 questions unless changed in Settings.

### 6.4 Practice Mode

Support:

- Regular practice
- Mistake review

Mistake review should only be available when active mistake patterns exist.

## 7. Question Model

A generated question should contain enough information to represent:

- Unique question ID
- Operation
- First operand
- Second operand
- Display text
- Correct answer
- Four answer choices
- Difficulty level
- Source:
  - regular
  - mistake-review
- Optional mistake-pattern ID when generated for mistake review

## 8. Question Generation

### 8.1 General Requirements

Question generation must:

- Respect the selected operation.
- Respect the selected difficulty level.
- Produce a correct mathematical answer.
- Produce readable display text.
- Generate four unique answer choices.
- Include exactly one correct choice.
- Avoid invalid mathematical situations.
- Validate generated questions.
- Retry generation if an invalid question is produced.
- Fall back safely if repeated generation attempts fail.

When multiple operations are enabled, the application should choose among them for mixed practice.

### 8.2 Addition

Addition questions should:

- Generate two operands.
- Use ranges appropriate to the selected difficulty.
- Respect maximum-result restrictions where applicable.
- Calculate the sum correctly.

### 8.3 Subtraction

Subtraction questions should:

- Generate two operands.
- Avoid negative answers in the lower difficulty levels.
- Allow more advanced behavior only where the difficulty rules permit it.
- Calculate the difference correctly.

### 8.4 Multiplication

Multiplication questions should:

- Generate two factors.
- Use factor ranges appropriate to the difficulty level.
- Progress from simpler facts to one-digit by two-digit and two-digit by two-digit style problems at higher levels where appropriate.
- Calculate the product correctly.

### 8.5 Division

Division questions should:

- Never divide by zero.
- Produce whole-number answers for the initial version.
- Generate a nonzero divisor and whole-number quotient, then derive the dividend.
- Respect difficulty-specific ranges and dividend limits.
- Calculate the quotient correctly.

## 9. Answer Choice Generation

Each question should display four choices:

- One correct answer.
- Three plausible incorrect answers.
- No duplicate choices.

Distractors should be mathematically reasonable rather than random extreme values.

Examples of useful distractor strategies include:

- Off-by-one or nearby values.
- Common arithmetic mistakes.
- Operation-specific mistakes.
- Values near the correct result.

Choices should be shuffled so the correct answer is not always in the same position.

## 10. Interactive Question Card

### 10.1 Front of Card

The front should show:

- The math question.
- Four answer choices.
- A clearly visible selected state.
- A control to reveal or flip the card.

The student selects an answer before revealing the back.

### 10.2 Back of Card

The back should show:

- The correct answer.
- The student's selected answer.
- Optional explanation when the Show Explanations setting is enabled.
- Controls:
  - I Got It Right
  - I Got It Wrong

The application records the student's self-reported result.

### 10.3 Card Behavior

- Card flip animation may be enabled or disabled.
- Reduced-motion preferences must be respected.
- When animation is disabled, the content must still change clearly.
- The application may provide sound feedback when sound effects are enabled.

## 11. Practice Session Behavior

A practice session should record:

- Session ID
- Start time
- Completion time
- Selected operations
- Difficulty
- Session length
- Attempted count
- Correct count
- Incorrect count

Each practice attempt should record:

- Attempt ID
- Question ID
- Operation
- Operands
- Correct answer
- Selected answer
- Self-reported correct/incorrect result
- Difficulty
- Source
- Timestamp
- Session ID

During practice:

- Display session progress.
- Generate the next question after the previous question is completed.
- Update totals after each attempt.
- Fixed-length sessions automatically finish at the selected length.
- Continuous sessions continue until the user chooses to end them.

## 12. Session Summary

At the end of a session, display:

- Questions attempted
- Correct answers
- Incorrect answers
- Accuracy
- Number of mistake-review questions completed, when applicable
- Practice mode
- Operations
- Difficulty
- Session length

Provide actions for:

- Practice Again
- Practice Mistakes
- Change Settings / Practice Setup
- View Statistics
- Return Home

Practice Mistakes should only be enabled when mistakes are available.

## 13. Data Persistence

The application should store relevant data in browser local storage.

Persist:

- Settings
- Completed sessions
- Practice attempts
- Mistake patterns
- Archived/aggregate statistics when needed
- Active-session snapshot

Stored data should survive:

- Page refreshes
- Browser restart

The storage layer should:

- Safely parse stored JSON.
- Validate stored values.
- Recover from invalid data.
- Handle unavailable storage or storage quota problems.
- Avoid wiping unrelated valid categories when one stored category is corrupted.

## 14. Settings

The Settings page should support:

### Preferences

- Sound effects
- Card animation
- Show explanations
- Encouraging feedback messages
- Mistake mastery threshold

### Default Practice Settings

- Default operations
- Default difficulty
- Default session length

Settings should persist automatically or through a clearly defined save action.

Practice Setup should load the saved defaults. Changes made for one session should not automatically overwrite the saved defaults unless the user intentionally changes Settings.

### Clear All Application Data

Provide a Clear All Application Data action that:

- Displays a strong confirmation warning.
- Clears settings, sessions, attempts, mistake patterns, statistics, and any active-session snapshot.
- Restores application defaults.
- Returns the user to a safe starting page.

## 15. Mistake Tracking

When the student reports a regular-practice question as incorrect:

- Create or update a mistake pattern.
- Track:
  - Operation
  - Operands / fact
  - Correct answer
  - Difficulty
  - Incorrect count
  - Similar correct count
  - Last incorrect date/time
  - Mastered status

Repeated mistakes on the same fact should update the existing pattern rather than create unnecessary duplicates.

A new mistake on a previously mastered pattern should reactivate that pattern.

## 16. Similar Question Generation

For active mistake patterns, generate similar questions that:

- Use the same operation.
- Stay near the original difficulty.
- Vary operands enough to provide useful additional practice.
- Remain valid under normal question-generation rules.
- Do not simply repeat one identical question forever.

## 17. Mistake Review Mode

Mistake review should:

- Prioritize active mistake patterns.
- Give higher priority to patterns that:
  - Have been missed more often.
  - Were missed more recently.
  - Have less mastery progress.
- Generate similar questions from selected patterns.
- Tag review questions as `mistake-review`.
- Track progress against the originating mistake pattern.

For a similar review question:

- Correct result increments similar-correct progress.
- Incorrect result resets or reduces mastery progress as defined by the implementation and records the continued difficulty.

A mistake is mastered when the required number of correct similar answers reaches the configured mastery threshold.

Default mastery threshold: 3.

Mastered mistakes should normally be excluded from active review.

## 18. Statistics

### 18.1 Overall Statistics

Display:

- Total attempted
- Total correct
- Total incorrect
- Overall accuracy

Handle zero attempts safely.

### 18.2 Statistics by Operation

Track and display statistics for:

- Addition
- Subtraction
- Multiplication
- Division

### 18.3 Statistics by Difficulty

Track and display statistics for levels 1–4.

### 18.4 Recent Sessions

Display recent sessions newest first, including useful details such as:

- Date
- Operations
- Difficulty
- Attempted
- Correct
- Incorrect
- Accuracy

### 18.5 Mistake Statistics

Display information such as:

- Active mistake patterns
- Mastered mistake patterns
- Similar questions practiced
- Correct mistake-review answers
- Most frequently missed operations
- Most frequently missed number facts
- Mastery progress
- Last incorrect date

Allow active and mastered mistakes to be viewed separately.

### 18.6 Reset Statistics

Provide a Reset Statistics action with confirmation.

Resetting statistics/history should not unintentionally remove unrelated settings.

## 19. Accessibility

The application should support:

- Keyboard navigation.
- Visible keyboard focus.
- Native button activation using Enter/Space.
- Keyboard shortcuts for answer choices where appropriate.
- Screen-reader-friendly labels.
- Live announcements for meaningful practice-state changes.
- Semantic headings.
- Accessible progress indicators.
- Reduced-motion support.
- Layouts that remain usable with browser zoom and larger text.
- Results that are not communicated by color alone.

## 20. Responsive Design

The application must work well on:

- Desktop
- Tablet
- Phone

Requirements include:

- Large touch targets.
- No horizontal scrolling during normal use.
- Question cards constrained to readable widths.
- Answer choices that stack appropriately on smaller screens.
- Navigation that remains usable at small widths.
- Statistics cards and recent-session layouts that reflow cleanly.

## 21. Encouraging Feedback

Feedback should be child-friendly and supportive.

- Avoid shaming language.
- Provide positive messages after correct responses.
- Provide encouraging messages after incorrect responses.
- Allow feedback messages to be disabled in Settings.

## 22. Session Recovery and Navigation Safety

While a practice session is active:

- Save enough state to restore:
  - Current session
  - Current question
  - Attempts
  - Selected answer
  - Card flip state
- Restore the active session after refresh when possible.
- Clear the active snapshot when the session finishes.

Protect against accidental navigation:

- Warn before leaving an active session through application navigation.
- Use a browser unload warning where supported.
- Stop warnings after the session has ended.

## 23. Error Handling

The application should recover safely from:

- Invalid local-storage data.
- Question-generation failures.
- Missing or invalid practice-session state.
- Missing summary state.
- Storage failures.

Errors shown to users should:

- Use plain, friendly language.
- Avoid stack traces.
- Provide a safe route back to Practice Setup or Home.

## 24. Performance and Data Management

The application should avoid unnecessary React re-renders and repeated calculations.

For large histories:

- Limit the amount of recent raw history displayed.
- Cap stored attempts where appropriate.
- Preserve older totals through aggregate statistics if raw records are trimmed.
- Provide storage usage measurement or equivalent diagnostics where helpful.

For loading performance:

- Lazy-load larger secondary pages where appropriate.
- Keep the production bundle reasonable.
- Avoid unused assets and dependencies.

## 25. Privacy

The initial application should:

- Request no personal information.
- Require no account.
- Keep practice data on the user's device in local storage.
- Include no advertising.
- Include no third-party analytics or behavioral tracking.
- Explain that clearing browser/site data removes saved progress.
- Provide a visible privacy explanation.

## 26. Testing Requirements

The project should include:

### Unit Tests

Test:

- Question generators
- Difficulty boundaries
- Distractor generation
- Answer uniqueness
- Statistics
- Mistake patterns
- Similar-question generation
- Mastery
- Storage serialization and validation

### Component Tests

Test:

- Operation selection
- Difficulty selection
- Answer selection
- Card flip
- Right/wrong controls
- Progress updates
- Session completion
- Statistics display
- Confirmation dialogs

### Integration Tests

Test:

- Full single-operation session
- Mixed-operation session
- Continuous practice
- Mistake creation
- Mistake review
- Mastery completion
- Persistence after refresh
- Statistics reset

### Accessibility Tests

Test:

- Keyboard-only workflow
- Screen-reader labels
- Reduced motion
- Browser zoom / responsive behavior
- Automated accessibility checks

## 27. Deployment

The production application must:

- Be publicly accessible.
- Build successfully.
- Work without a local development server.
- Support direct navigation and page refreshes on application routes.
- Preserve local data after reload.
- Work at phone and tablet widths.
- Produce no normal-use runtime errors.

Netlify is an acceptable deployment platform.

## 28. Definition of Done

The application is complete when:

- All four operations work.
- Difficulty levels work.
- Four unique answer choices are generated.
- Practice sessions work from setup through summary.
- Mistakes are tracked and reviewable.
- Similar practice and mastery work.
- Statistics are accurate.
- Settings persist.
- Relevant data survives refresh.
- Active sessions can recover safely.
- Accessibility and responsive behavior are verified.
- Tests, linting, and production build pass.
- The deployed application works from its public URL.
