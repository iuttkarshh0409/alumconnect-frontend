# 🚀 Student Dashboard: High-Velocity Career Launchpad
## (UI Architecture: `StudentDashboard.js`)

The **Student Dashboard** is the primary engine for student professional growth. It is designed to bridge the gap between academic learning and industry entry through data-dense, actionable interfaces.

---

### 🏛️ 1. Alumni Pro-Tip Console
*   **What it is**: A rotating wisdom carousel providing real-time professional advice.
*   **Implementation**: 
    *   **Blended Sourcing**: Combines a static local array (`PRO_TIPS`) with dynamic community wisdom fetched from the `/api/student/wisdom` endpoint.
    *   **High-Five Interaction**: Students can "High-Five" tips via the `handleHighFive` function, which triggers a POST request to `/api/wisdom/{tipId}/high-five`, incrementing the community applause count.
*   **Purpose**: To provide continuous micro-mentorship without requiring a direct session.

### 📊 2. Mission Tracker (Goal Engine)
*   **Logic**: 
    *   **Target**: Default objective set to **5 Locked Sessions** (`MENTOR_GOAL = 5`).
    *   **Calculation**: `progressPercent = (acceptedCount / MENTOR_GOAL) * 100`.
*   **Functional Goal**: Incentivizes outreach by showing a visual gradient progress bar that fills as alumni accept mentorship requests.
*   **Impact**: Transforms professional networking from a vague task into a measurable mission.

### 🏆 3. Achievement Shelf
*   **What it is**: A gamified rewards system for platform engagement.
*   **Why it's Important**: 
    *   **Psychological Reward**: Uses badges like **Outreach Ninja** (5+ requests) and **Master Connector** (3+ accepted sessions) to reinforce positive professional behaviors.
    *   **Engagement**: Encourages students to explore features (like Dark Mode with the **Dark Knight** badge) and stay active.

### 📊 4. Tactical Activity Console (Metrics)
Provides an instant snapshot of the student's outreach telemetry:
*   **⏳ Active Requests (Clock Icon)**: Displays the `pendingCount`. This represents requests currently awaiting an alumni response.
*   **🤝 Meetings (TrendingUp Icon)**: Displays the `acceptedCount`. This represents successfully scheduled sessions or referral locks.
*   **🌍 Network (Users Icon)**: Displays the `verified_alumni_count`. This shows the total scale of the verified professional community accessible to the student.

### 🛰️ 5. Campus Pulse (Leaderboard)
*   **What it is**: A department-wise leaderboard (`leaderboard` state) sourced from `/api/analytics/programs/count`.
*   **Why it's there**: It helps students visualize the "Power Departments" in the network, showing where alumni activity is most concentrated.

### 🚀 6. New Outreach Center
*   **Function**: The "New Outreach" button triggers a high-priority navigation to the **Alumni Directory** (`/directory`).
*   **Purpose**: Directs the student to the discovery hub where they can apply filters to find their next mentor.

### 📝 7. Request Log (Withdraw Logic)
*   **Withdraw Request**: Located within the `MentorshipRequestCard`, the "Withdraw Request" button (Red Trash Icon) allows students to cancel a `pending` request.
*   **Logic**: Triggers a DELETE request to `/api/mentorship/requests/`.
*   **Purpose**: Essential for "slot management"—if a student realizes they reached out to the wrong person, they can retract the request to keep their outreach queue efficient.

### 📦 8. Growth Kit (Resource Library)
*   **What it is**: A curated sidebar of professional high-fidelity guides (e.g., Placement Wiki, Referral Email Templates).
*   **Importance**: Provides the foundational "how-to" knowledge. Having templates like **"Email Like a Pro"** directly in the dashboard reduces the student's anxiety when reaching out to senior alumni.

---
> **Design Philosophy**: Uses **Energetic Blues** and **Amber Accents** to symbolize growth, while the **Dark Mode** support ensures accessibility during late-night prep sessions.
