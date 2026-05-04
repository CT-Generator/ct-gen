## ADDED Requirements

### Requirement: On-screen rendering of generated conspiracy theory

The final page (page 5) SHALL render the generated conspiracy theory text on screen as the user's primary output. The rendering MUST stream tokens as they arrive from the language model and MUST include the standard fake-content disclaimer once generation completes.

#### Scenario: Streaming render
- **WHEN** the user reaches page 5 with a complete set of selections (news, culprit, motive)
- **THEN** the page issues a streaming chat completion to the configured model
- **AND** appends each chunk's content to a single rendered block as it arrives
- **AND** the final block ends with the disclaimer "Warning: This conspiracy story is FAKE and was generated with the Conspiracy Generator, an educational tool."

#### Scenario: Recreate button regenerates the theory
- **WHEN** the user clicks "Recreate your conspiracy theory" on page 5
- **THEN** the cached generation is cleared
- **AND** a fresh streaming completion is run with the same prompt
- **AND** the new result replaces the previous on-screen rendering

### Requirement: Twitter share button

The final page SHALL expose a Twitter (X) share button that pre-populates a tweet linking back to the deployed app and naming the user's selected news, culprit, and motive.

#### Scenario: User clicks share
- **WHEN** the user clicks the Twitter share button on page 5
- **THEN** the Twitter web intent opens with text containing the news name, culprit name, motive name, and the canonical app URL

### Requirement: Persistence of generated theory to Google Sheets

The system SHALL append a row to the configured `generated_ct` sheet exactly once per generation, capturing the inputs (news name, news summary, culprits, motive) and the full generated conspiracy theory.

#### Scenario: First render persists the row
- **WHEN** page 5 finishes its first generation in a session
- **THEN** a row is appended to the `generated_ct` sheet with the columns: news_name, news_summary, culprits_name, culprits_summary, motives_name, motives_summary, prompt, conspiracy_theory
- **AND** the session is marked as saved so subsequent reruns of page 5 do not double-write

#### Scenario: Recreate does not duplicate the row
- **WHEN** the user clicks "Recreate your conspiracy theory" after the initial save
- **THEN** no additional row is appended to the `generated_ct` sheet for the regenerated theory

### Requirement: Rating capture

The final page SHALL display rating controls and SHALL append the user's rating to the configured `ratings` sheet when submitted.

#### Scenario: User submits a rating
- **WHEN** the user interacts with the rating controls on page 5
- **THEN** a row is appended to the `ratings` sheet keyed to the generated conspiracy theory

### Requirement: No image or PDF download from page 5

The final page SHALL NOT offer the user any download of the generated conspiracy theory or selection panels as an image, PDF, or other binary format. The deployed environment cannot install `wkhtmltopdf`, so any code path that requires it MUST NOT exist.

#### Scenario: Page 5 renders without download buttons
- **WHEN** the user reaches page 5
- **THEN** no `st.download_button` widget is rendered for either the conspiracy theory or the selections panel
- **AND** the page does not import `imgkit` or invoke any HTML-to-image rendering

#### Scenario: System dependencies do not require wkhtmltopdf
- **WHEN** Streamlit Cloud builds the app from `main`
- **THEN** `packages.txt` either does not exist or does not list `wkhtmltopdf`
- **AND** `requirements.txt` does not list `imgkit`
