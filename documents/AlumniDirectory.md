# 🛡️ Alumni Directory: The Discovery & Analytics Command Center
## Component ID: `AlumniDirectory.js`

The **Alumni Directory** is the "Professional Reconnaissance Center" of AlumConnect. It is the most technically complex UI in the ecosystem, designed to transform a static database into a living, breathing community of experts.

---

### 🏛️ 1. Sidebar Command Console: The Network Power Index (NPI)
*   **What it is**: A data-dense personal authority tracker for the user.
*   **Deep Detail**:
    *   **📈 Gravitas Leveling**: Features a hero score (**742**) and a "LVL 84" rank badge. These are designed to show the student's relative "gravity" in the network as they complete their profile and book sessions.
    *   **📊 Triple-Track Progress**: 
        *   **Profile Sync**: Measures how complete the student's profile is for mentor matching.
        *   **Network Reach**: Tracks how many different domains/companies the user has reached.
        *   **Influence Hub**: Tracks the "kudos" and responses received.
    *   **🛰️ Tactical Recon Indicator**: A pulsing emerald beacon at the bottom of the card signals that the platform is actively scanning for matches.
*   **Visual Aesthetics**: Uses a deep midnight gradient (`from-[#002147] to-[#003366]`) with high-fidelity blur-filters (`blur-[60px]`) for a premium aeronautical look.

### 📡 2. Discovery Hub: The Universal Search Logic
*   **What it is**: The primary filter interface for finding mentors.
*   **Deep Detail**:
    *   **🔍 Universal Search Bar**: A "High-Focus" input that allows students to type anything from names to job titles. It uses a `searchTerm` state to filter results in real-time.
    *   **🏗️ Multi-Mode Selectors**: Three strategic dropdowns (Job Domain, Target Company, and Graduation Year). 
    *   **The Filter Logic**: The `fetchAlumni` function uses `URLSearchParams` to pass these filters to the backend, ensuring that only the most relevant "Pioneers" are returned to the screen.
*   **Tactical Action**: The "Clear Selection" button triggers the `clearFilters` function, performing a surgical reset of all parameters to restore the full community view.

### 📊 3. Expert Heatmap Bar: Community Telemetry
*   **What it is**: A top-level row of metrics providing an "instant snapshot" of the network.
*   **Component Telemetry**:
    *   **Activity (Active Mentors)**: A count of how many alumni are currently online, signaling "high availability."
    *   **Compass (Top Domain)**: Dynamically calculates the most prevalent industry among the visible alumni.
    *   **Cpu (Hot Skill)**: Highlights the technical skill currently trending in the results.
    *   **Handshake (Open Refers)**: Tracks how many alumni have explicitly marked themselves as "Open to Refer."
*   **Purpose**: It allows a student to understand the "industry gravity" of the current community before sending a request.

### 🌟 4. Priority Network Track: The VIP Gallery
*   **What it is**: A horizontal gallery showcasing high-momentum alumni.
*   **Deep Detail**:
    *   **Curation Logic**: This track is populated from the `featuredAlumni` state, which prioritizes alumni who are `is_live` or `open_to_refer`.
    *   **Engagement Signals**: Each card features a **"High Respondent"** badge, signaling to the student that this connection has a high probability of answering.
*   **Visual Logic**: Wrapped in `motion.div` for smooth hover-scaling and `whileHover: { y: -5 }` to imply "elevation."

### 🛡️ 5. Verified Talents: The Dossier Feed
The main result engine. Each card is a "Professional Dossier" with three layers of intelligence:

*   **🛰️ Layer 1: Status Halos**:
    *   **Live (Blue Halo)**: If `alum.is_live` is true, the avatar is surrounded by a blue pulsing glow, signaling immediate availability.
    *   **Match (Rose Halo)**: If the student and alumni share the same department, a rose-amber halo appears, signaling a "Community Match."
*   **🔖 Layer 2: Multi-Action Utility Dock**:
    *   **Save (Bookmark)**: Allows students to build a "Shortlist" for later outreach.
    *   **Kudos (Heart)**: A micro-endorsement to acknowledge an alumnus' profile or career milestones.
    *   **Referral (Send)**: A "High-Intent" trigger that initiates a referral request flow.
*   **📜 Layer 3: Wisdom Fragments**:
    *   The `latest_wisdom` quote block elevates the card from a resume to a "conversation starter" by displaying a short, personal professional insight from the Alumnus.

### 🌍 6. Worldwide Pulse: Global Cluster Ticker
*   **What it is**: A location-based analytics widget.
*   **Deep Detail**:
    *   **The Logic**: Dynamically counts occurrences of cities/countries from the alumni data and sorts them to show where the network's "Main Clusters" are located.
    *   **Purpose**: Encourages students to look beyond local opportunities and visualize their career at a global scale.

---
> **Architecture Summary**: The Directory is built on **"High-Trust Glassmorphism."** By using status halos and real-time telemetry, we remove the "coldness" of a member list and replace it with a living map of human expertise.
