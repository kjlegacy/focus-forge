# Focus Forge: Design & Technical Blueprint

**Project Overview:** A gamified productivity web app (PWA) designed for ADHD focus management. Users "forge" weapons by completing uninterrupted focus timers. Designed to feel like a native iPhone app, hosted on Vercel, with all data saved locally on the device.

---

## 0. Project Metadata
* **GitHub Repo:** `https://github.com/kjlegacy/focus-forge.git`
* **Git Setup Commands (Completed):**
  `git remote add origin https://github.com/kjlegacy/focus-forge.git`
  `git branch -M main`
  `git push -u origin main`

## 1. Tech Stack & Infrastructure
* **Frontend Framework:** React (initialized via Vite for speed).
* **Styling:** Tailwind CSS (Focus on neon glows, `#000` pitch-black backgrounds, and utility classes).
* **Animations:** Framer Motion (for spring-physics UI interactions) and `canvas-confetti` (configured for red/yellow anvil sparks).
* **Icons/Graphics:** Inline SVGs (Lucide Icons or similar) that accept dynamic hex codes for color.
* **Data Storage:** Native `localStorage` (No external database, zero-login).
* **Hosting:** Vercel (Hobby tier).

---

## 2. UI / UX & Aesthetics
**Important:** Refer to the `design_documents/` folder in the root directory for reference images of the exact visual vibe.
* **Theme:** "Antigravity Neon." Pitch black backgrounds (`#000`), minimal text, with high-contrast, glowing neon accents.
* **Navigation:** A fixed 4-tab bottom navigation bar:
    1.  🔨 **The Forge:** Home screen, timer, "Ignite" button.
    2.  ⚔️ **The Armory:** Grid inventory of collected weapons.
    3.  🧙‍♂️ **Character:** XP Bar and stats.
    4.  🛒 **Merchant:** (Planned for v2 - skip for MVP).

---

## 3. Core Gameplay Loop
1.  **Start:** User selects duration (e.g., 25 mins) and taps "Ignite Forge".
2.  **The Rule:** Phone must be placed face-up on a desk and left entirely alone.
3.  **Success:** Timer ends, phone vibrates (Haptic API), weapon is crafted and saved to Armory.
4.  **Failure:** User cancels timer or moves phone excessively. Weapon shatters. 0 XP.

---

## 4. Mobile-Specific Engineering Traps (CRITICAL)
* **The "Sleeping iPhone" Trap:** iOS suspends background JavaScript. **Never use `setInterval` for the main countdown.** Always calculate remaining time by comparing `Date.now()` against a saved `endTime` timestamp in `localStorage`.
* **The Apple Permission Wall:** Device motion cannot be accessed secretly. The app requires a one-time onboarding screen with a physical button tap to trigger the iOS `DeviceMotionEvent.requestPermission()` prompt.
* **The "Untouched" Sensor:** Use the `DeviceMotion` API. Allow a 5-second grace period after starting. If moved, flash a red warning. If untouched for the full duration, award the "Flawless" modifier.

---

## 5. The Rarity & Loot System
Rarity is determined by session length and motion sensor data. SVGs will dynamically take these hex colors:
* **Poor:** `#9d9d9d` (Gray) - Cancelled early.
* **Common:** `#ffffff` (White) - Finished, but phone was moved.
* **Uncommon:** `#1eff00` (Green) - Standard finish, 1-2 movements.
* **Rare:** `#0070dd` (Blue) - Flawless (0 movements), standard time.
* **Epic:** `#a335ee` (Purple) - Flawless, long duration (45+ mins).
* **Legendary:** `#ff8000` (Orange) - Flawless, max duration (60+ mins).

Saved data structure per weapon in `localStorage` should look like:
`{ id, weaponType, rarity, color, taskName, durationMins, date, flawless }`

---

## 6. Iterative MVP Roadmap (Step-by-Step)
*This project must be built in micro-steps to accommodate fast AI models.*
* **Step 1:** Initialize Vite + React + Tailwind + Git.
* **Step 2:** Build the basic layout (Black background, Bottom Nav skeleton).
* **Step 3:** Build the Timestamp-based Timer logic (no motion sensing yet).
* **Step 4:** Build the UI for the Forge (Start button, timer display).
* **Step 5:** Implement the iOS Motion Permission onboarding and sensor logic.
* **Step 6:** Build the Loot generation logic (calculate rarity, save to `localStorage`).
* **Step 7:** Build the Armory UI to display the `localStorage` inventory.