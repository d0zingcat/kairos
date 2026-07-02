# Kairos Product Roadmap

Last updated: 2026-03-11
Owner: Product / Design / Engineering

## Purpose

This document organizes Kairos's current product direction into an executable roadmap, helping keep future requirement discussions, iteration planning, and PR scoping aligned.

Kairos already has a solid foundation:

- Records for four media types: Books, Music, Movies/TV, Games
- GitHub-style activity heatmap
- Cmd+K Quick Entry
- Multi-user support with privacy controls
- Public Plaza
- Goodreads import
- Docker deployment and migration pipeline

The next phase should not spread effort evenly across more features, but prioritize strengthening the core loop:

`Faster Recording → Stronger Feedback → More Willingness to Keep Coming Back`

## Product Vision

Kairos should not remain just a "tracking tool" — it should gradually become a "personal cultural life timeline."

A more mature Kairos should help users:

- Record their cultural consumption activities with minimal friction
- Feel immediate feedback and progress after each entry
- Build long-term habits through reviews, goals, and milestones
- Discover interesting people and content through Plaza
- Express their taste through public profiles and shared content

## Current Assessment

### Existing Strengths

- The main pipeline — recording, editing, importing, public display — is already covered
- Multi-user isolation and public/private toggle are in place
- Dashboard, heatmap, and Plaza provide clear entry points for deeper product features
- Multiple external data sources are integrated, providing a solid base for metadata enrichment

### Current Gaps

- Recording capabilities are complete, but the main entry point isn't unified enough; Quick Entry hasn't fully become a high-frequency core action
- After recording, users get "data stored" but not a strong enough "instant reward"
- The Dashboard currently reads more like an archive page than a personal homepage worth revisiting
- Plaza has taken shape but is still more display-oriented than a "browsable, discoverable" content space
- Retention hooks are insufficient — goals, reviews, streaks, and milestone systems are not yet complete

## Strategic Priorities

## P0: Strengthen the Core Loop

Goal: Make Kairos faster, more rewarding, and easier to form habits around.

### 1. Unified Quick Add Experience

Make Cmd+K and Quick Entry truly primary entry points.

Scope:

- Unify the creation flow for all four media types
- Support intelligent media type recognition after title input
- Prioritize showing the most recently used media types and data sources
- Complete metadata search and enrichment before entering the full editor
- Support status, rating, date, and short notes — all in one pass

Value:

- Reduce the operational cost of the user's most common action
- Upgrade Quick Entry from "convenience feature" to "core habit entry point"
- Lay the groundwork for mobile, lightweight input, and automated collection

### 2. Immediate Post-Recording Feedback

Every successful recording should instantly make the user feel "progress was made."

Scope:

- Show milestone, streak, or phase-progress feedback after a successful save
- New entries link to and refresh Dashboard summary cards
- Strengthen the heatmap's sense of instant feedback
- Prioritize lightweight weekly/monthly achievement prompts

Examples:

- "This is the 3rd movie you've finished this week"
- "You've recorded 5 days in a row"
- "You've read over 1,200 pages this month"

Value:

- Embed emotional reward directly into the recording action
- Increase the psychological motivation to open the product again

### 3. Complete Media Status Lifecycle

The current recording model needs to evolve from "single record" to "lifecycle record."

Proposed unified statuses:

- `wishlist`
- `in_progress`
- `completed`
- `dropped`

Future extensions:

- `revisiting`
- `rewatching`
- `rereading`

Value:

- Users can record the journey, not just the outcome
- Dashboard, filtering, stats, reviews, and recommendations all gain higher information density

## P1: Make the Dashboard a Homepage Worth Returning To

Goal: Bring users back not just to record, but to see the trajectory of their own life.

### 1. Weekly / Monthly Review Cards

Answer two questions: What happened recently? What does it tell you?

Scope:

- Completed count this week / this month
- Average rating, active days
- Most active media type in the period
- A one-sentence natural-language summary

Example copy direction:

- "This month you gravitated most toward books"
- "Your highest-rated media this week was music"

Value:

- Increase the revisit value of the Dashboard
- Provide templates for annual reviews and sharing capabilities to come

### 2. Goal System

Turn "wanting to persist" into "visible progress."

Scope:

- Set monthly goals by media type
- Display progress bars, completion status, remaining headroom
- Optionally add deadline reminders or progress nudges
- Link with review cards for display

Examples:

- "Read 2 books this month"
- "Watch 8 movies this month"
- "Play 10 hours of games this month"

### 3. Time-Dimensional Browsing

Let users look back at their cultural life chronologically.

Scope:

- Support toggling between week / month / year views
- Improve the history archive experience
- Lay groundwork for annual summaries, share cards, and personal profiles

Value:

- Make Kairos more of a "memory product" than just a "recording tool"

## P2: Evulate the Plaza from a Display Page to a Discovery Page

Goal: Upgrade the Plaza from a public activity list to a lightweight discovery layer.

### 1. Plaza Feed Ranking Upgrade

This is the highest-value Plaza capability to invest in.

Current assessment:

- `src/lib/plaza-feed.ts` is currently lightweight and well-suited to gradually take on feed display and ranking logic

Scope:

- Introduce lightweight quality signals on top of reverse-chronological order
- Boost visibility for high-rated content, fresh entries, and media diversity
- Can later introduce interest similarity or preference overlap
- Stop treating pure reverse-chronology as the long-term default strategy

First-version recommended ranking factors:

- Time decay
- Rating weight
- Fresh-entry boost
- Rarity / diversity bonus
- Future engagement signals (likes, saves, want-to-watch/read/play/listen)

Value:

- The Plaza shifts from "what did someone make public?" to "what's worth browsing right now"
- Increases browsing depth without introducing heavy social moderation costs

### 2. Richer Activity Cards

Scope:

- Support a short review or one-sentence impression
- Display mood, type, or recommendation-intent labels
- More clearly explain "why this entry is worth others seeing"

### 3. Start with Light Interactions — Don't Rush to Comments

Recommended priority:

- Likes
- Saves
- "I also want to watch / listen / play / read"

Why comments are deferred:

- Higher moderation cost
- Notifications, review, and abuse handling add more complexity
- The return at the current stage may not outweigh light interactions

## P3: Import & Share as Growth Channels

Goal: Make it easier for users to enter Kairos, and easier to take Kairos out into the world.

### 1. Expand Import Sources

Goodreads has proven the import pipeline's value; the next step is replicating it for other high-value sources.

Candidate sources:

- Douban
- Letterboxd
- Spotify liked content or charts
- Steam library or play history
- Bilibili favorites or watch history

### 2. Enhance Sharing Capabilities

Scope:

- Monthly review cards
- Annual summary posters
- Single-entry share images
- Featured modules on public profiles

### 3. Improve Public Profiles

Scope:

- Recent activity and recent favorites
- Yearly Top picks
- Taste tags and preference summaries
- Layout design that reads more like a personal cultural card

## P4: Engineering Quality & Sustainable Evolution

Goal: Ensure engineering quality doesn't become the bottleneck as product capabilities grow.

### 1. Clean Up Logging

- Replace remaining `console.*` calls with `createLogger`
- Unify namespaces for Dashboard, Plaza, and import pipelines

### 2. Add High-Value Tests

Priority coverage:

- Server actions
- Plaza feed ranking logic
- Import parsers
- Dashboard aggregation and review logic

### 3. Conduct an Access & Privacy Review

- Audit all public and multi-user queries to ensure they strictly filter by `userId`
- Focus on Plaza and public profile access paths
- Verify privacy settings are consistent across Dashboard, Plaza, and public profiles

### 4. Performance & Query Optimization

- Optimize Dashboard aggregation queries
- Introduce caching strategies for Plaza feed and high-cost queries
- Optimize image loading and media card performance

## Recommended Iteration Sequence

## Iteration 1: Recording Experience

Core goal: Reduce recording cost and increase post-recording reward.

Deliverables:

- Unified Quick Add upgrade
- Unified media status lifecycle
- Metadata enrichment and default optimization
- Milestone feedback after save

Success signals:

- Average recording time decreases
- Share of entries created via Cmd+K increases
- Per-user repeat recording frequency within a week increases

## Iteration 2: Personal Value

Core goal: Bring users back to "look at themselves."

Deliverables:

- Dashboard weekly / monthly review cards
- Monthly goal system
- Heatmap and stats card联动 enhancement
- Week / month / year time browsing

Success signals:

- Dashboard revisit frequency increases
- Weekly retention increases
- Monthly goal creation and completion rates increase

## Iteration 3: Social Discovery

Core goal: Upgrade the Plaza from "viewable" to "worth browsing."

Deliverables:

- Plaza feed ranking
- Richer activity cards
- Light interactions and saves
- Public profile enhancement

Success signals:

- Plaza browsing depth increases
- Click-through rate from Plaza to personal profiles increases
- Plaza-triggered saves / "want to" actions increase

## Current Highest-Priority Bets

If you could only focus on one major feature next, prioritize one of the following two directions.

### Option A: Dashboard Monthly Recap

Best for: Improving retention and personal value perception.

Why:

- Directly enhances the value of the current Dashboard and heatmap
- Helps existing users feel more quickly "why I keep using this"
- Prerequisite for goal systems, annual reviews, and sharing capabilities

### Option B: Plaza Feed Ranking Upgrade

Best for: Differentiating the product and strengthening the discovery experience.

Why:

- Turns the Plaza from a public list into a truly distinctive capability
- Provides a foundation for future light-social and discovery mechanisms
- Naturally aligns with the current evolution direction of `src/lib/plaza-feed.ts`

Combined recommendation:

- If near-term differentiation is the priority, do Plaza feed ranking
- If near-term retention is the priority, do Dashboard monthly recap

Given the current product structure, Plaza feed ranking is the more distinctive next step.

## PR-Ready Task Breakdown

### `feat/plaza-feed-ranking`

- Define an explainable, tunable feed scoring model
- Introduce time decay and quality weighting
- Add unit tests and sample data for ranking logic

### `feat/dashboard-monthly-recap`

- Add Dashboard monthly recap cards
- Display completed count, active days, average rating, Top categories
- Reserve structure for future Chinese and English copy expansion

### `feat/unified-quick-add`

- Consolidate all four media types into a unified quick-entry flow
- Complete search, selection, status, rating, and date in a single interaction
- Prioritize recent-usage behavior for default recommendations

### `feat/media-status-flow`

- Add unified lifecycle statuses across all media types
- Update filtering, stats, and card display accordingly
- Verify backward compatibility with existing records

### `chore/logging-cleanup`

- Replace remaining `console.*` calls
- Migrate relevant modules to `createLogger`

## Recommended Product Metrics

### Core Usage

- Records per user per week (WAU)
- Share of entries completed via Quick Entry
- Weekly active users

### Retention & Habits

- 7-day / 30-day revisit rate
- Average active days per user per month
- Streak participation rate

### Review Value

- Dashboard review card views per user
- Goal creation rate
- Goal completion rate

### Plaza Health

- Plaza visits per user
- Likes / saves / "want to" actions originating from Plaza
- Click-through rate from Plaza cards to public profiles

## Maintenance Recommendations

- When a major direction moves from "planned" to "in progress," update this roadmap accordingly
- Keep this document product-facing; put implementation details in issues, PRs, or technical design docs
- Re-evaluate priority and investment ratio after the first review system or Plaza ranking system ships
