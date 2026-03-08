# 🏛️ Alumni Dashboard: The Expert Authority Console
## Component ID: `AlumniDashboard.js`

The **Alumni Dashboard** is a high-fidelity "Command Center" for the professional cohort. It is designed to empower alumni to manage their community impact, mentor the next generation of students, and control their professional visibility with surgical precision.

---

### 🏛️ 1. Expert Persona (Profile Mastery Dialog)
*   **What it is**: A comprehensive identity management system.
*   **Deep Detail**:
    *   **Persona Layers**: Alumni can update their **Company**, **Job Title**, **LinkedIn URL**, **Expertise (Skills)**, and **Professional Legacy (Bio)**.
    *   **The Logic**: Uses a local `profileUpdate` state to track changes before committing them via `PUT /api/alumni/{id}`. 
    *   **Photo Sync**: Features a dedicated `handlePhotoUpload` flow that processes images as Base64 for rapid profile updates.
*   **Visual Logic**: Hosted in a custom `Dialog` with a midnight-gradient header and animated blur effects, signaling that this is the Alumnus's "Master Identity."

### 📈 2. Influence Meter (The Impact Score)
*   **What it is**: A tiered gamification system measuring global contribution.
*   **The Math**: 
    *   `Impact Score = (Accepted Sessions * 5) + (High-Fives Received * 2) + Pending Requests`.
    *   **Goal**: The system sets a current level-up target (`IMPACT_LEVEL_GOAL = 50`).
*   **The Progression**: Alumni move through tiers like **Level 4: Master** toward the prestigious **Campus Legend** status.
*   **Visual Aesthetics**: Uses a `motion.div` progress bar with a secondary "Shadow Glow" (`shadow-[0_0_15px_rgba(249,115,22,0.5)]`) to emphasize the weight of the alumnus's impact.

### 📡 3. Real-Time Status Console (Signal Control)
Two critical toggles that control the alumnus's presence in the **Alumni Directory**:
*   **⚡ Mentorship Live Now**: 
    *   **Tactical Action**: Triggers `handleToggleLive`. When active, it places a pulsing blue halo around the alumnus's avatar globally, signaling they are ready for immediate contact.
*   **🔥 Hiring Referral (Open to Refer)**:
    *   **Tactical Action**: Triggers `handleToggleRefer`. Marks the alumnus as "Accepting resumes," adding a flame icon and priority badge to their directory card.
*   **Visual Feedback**: Both switches use high-contrast emerald and blue colors when active to provide clear confirmation of current "signal" strength.

### 📅 4. Weekly Office Hours (The Availability Circuit)
*   **What it is**: An interactive 7-day grid for setting recurring mentorship availability.
*   **The Logic**: A simple boolean array `availability` representing Sunday to Saturday. Tapping a day toggles the "On-Air" status for that period.
*   **Purpose**: Allows alumni to manage expectations without manual calendar syncing, ensuring students only reach out when the expert is mentally available.

### 🛰️ 5. Talent Radar 2.0 (AI Match Scanning)
*   **What it is**: A circular radar visualization identifying "High-Potential" students.
*   **Deep Detail**:
    *   **The Matching Logic**: Fetches data from `/api/alumni/talent-radar`. It identifies students from the alumnus's same department whose expertise (skills) match the alumnus's professional domain.
    *   **The Visualization**: Students are rendered as "Blips" on a motion-rotating radar. Each blip displays a **Match Score %** on hover.
    *   **Action (Initiate Scout)**: A "High-Recon" button that refreshes the radar with the latest student profiles from campus.

### 💡 6. Wisdom Engine (Global Broadcast)
*   **What it is**: A tactical interface for sharing professional "Pro-Tips."
*   **Deep Detail**:
    *   **The Interface**: A 100-character constrained text area for "1-sentence wisdom."
    *   **The Impact**: Tips posted here are broadcasted directly to the **Student Dashboard** carousel.
    *   **Engagement Tracking**: Tracks "High-Fives" (Community Applause) from students, which feeds back into the Alumnus's Influence Meter.

### 📧 7. Expert Inbox (The Priority Stream)
*   **What it is**: A vertical feed of incoming mentorship and referral inquiries.
*   **Surgical Sorting**:
    *   **Priority Logic**: Automatically flags requests as "Priority" (Red Badge) if they contain high-intent keywords like "Interview," "FAANG," or detailed descriptions.
    *   **Action Flow**: Alumni can **Accept** (revealing their secure email to the student) or **Reject** (archiving the request) with a single click.
*   **Zen Mode**: A high-fidelity "Zero-State" graphic that appears when all requests have been processed, rewarding the alumnus with a visual "breather."

### 🏅 8. Expert Hall of Fame (Achievements)
*   **What it is**: A row of "Authority Badges" acknowledging milestones.
    *   **Platform Pioneer**: For those who joined in the first batch.
    *   **Verified Expert**: For those who have completed the security screening.
    *   **Lead Impact**: Unlocked after 5+ successful mentorship sessions.
*   **Goal**: To build long-term retention by acknowledging the expert's legacy in the network.

---
> **Architecture Summary**: The Alumni Dashboard is built on the principle of **"Powerful Contribution."** By providing high-fidelity tracking of impact and AI-driven student matching, we ensure that every minute an Alumnus spends on the platform is high-yield and professionally satisfying.
