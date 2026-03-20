# Development Principles

## Core Philosophy

- **Focus and solve your own problems** - You are user zero. Build for yourself first.
- **Be unique and original** - In the AI era, differentiation is your only moat.
- **Break the rules** - Convention is the enemy of breakthrough products.
- **Success is a mix of skill, timing, & luck** - Ship fast to maximize timing windows and create more at-bats for luck.

## Market Strategy

- **Start with a micro niche** - Target 100 obsessed users, not 10,000 casual ones.
- **Plan micro-to-multi-niche expansion** - Dominate one niche completely before expanding to adjacent markets.
- **Share your ideas freely** - Execution beats secrecy. Open sharing builds community and accelerates feedback loops.

## Building Approach

- **Start small. Don't think big.** - Ship one killer feature, not ten mediocre ones. Launch in days, not weeks.
- **Your enemy is perfection, BUT the first prototype must function really well** - Ugly is acceptable. Broken is not. Polish the core action ruthlessly.
- **Old World (Human Developer) = months to MVP. New World (AI-Assisted) = days to MVP** - Use time saved for user research and distribution, not more features. Speed is table stakes now — everyone ships fast. The edge is what you do with the time you save.

## AI-First Development

Leverage these tools in every project:

1. **Machine Learning** - Personalization from day one
2. **Agent Workflows** - Automate user tasks end-to-end
3. **Agent-to-Agent Workflows** - Build autonomous multi-agent systems
4. **SDKs** - Let users extend your product
5. **Newest AI Tools** - Stay on the bleeding edge, rebuild when better tools emerge

## UI Tooling

Feature-first, always. Don't reach for UI tools until the core feature works end-to-end.
Ugly is acceptable. Broken is not. Polish the core action after it functions.

**Role split:**

| Tool | Job | When to use |
|------|-----|-------------|
| Copilot (VSCode) | Feature logic, state, API wiring, anything needing codebase context | All the time |
| v0.dev | Visual UI component generation — outputs Next.js + Tailwind natively, GitHub sync to branch | Once the feature works and you need a specific component to look right |
| 21st.dev | Browse before building agentic/pipeline UI — streaming indicators, status cards, checkpoint layouts | Before building pipeline screens from scratch |
| Stitch (Google) | Design exploration / visual direction — post-prototype only | Once you have something working to react against |

**Rules:**
- Don't reach for v0/Stitch until the feature works against real data
- Use v0 surgically: one problem, one component, import it, wire it in VSCode
- Time saved by AI dev speed → distribution, not UI polish. Post the launch log first.
- v0 imports are zero-friction — same stack. Stitch output format varies — may need translation.

## Distribution

- **Distribution is the moat, not dev speed.** See `strategy.md` for the full operational playbook — Reddit, pSEO, X, launch timeline, and domain strategy.
- **Build log is distribution** - Every `/log` post is content that can be cross-posted to dev.to, shared on Reddit, and linked from X. The build log IS the content marketing strategy.
- **Show, don't just tell in log posts** - Every post that ships a visible feature must include a screenshot or screen recording (GIF). Drop the file in `public/log/[slug]-demo.gif` and reference it with `![demo](/log/slug-demo.gif)`. Cover images go in `public/log/covers/` — generate them with `node scripts/gen-cover.mjs --slug <slug>`. Callout boxes use `<div class="callout">key insight</div>`. Diagrams use fenced ` ```mermaid ``` ` blocks.

## User Experience

- **Onboard to value in <2 minutes** - Every second to the "aha moment" matters. Remove all friction.
- **Create emotional connection** - Success metric: "They miss it when it's gone."
- **Gamify strategically** - Use competition, streaks, and points to drive early engagement. Transition to intrinsic motivation as users go deep, giving them "this is special and different" feeling.
- **People love competition** - Build competitive elements into core mechanics.

## Data & Evolution

- **Data Flywheel Hack** - Every user interaction trains your AI. Your product gets smarter daily without manual effort. This compounds exponentially.
- **Data collection for app evolution** - Instrument everything from day one. Build analytics before features.
- **Truth in data and numbers** - Watch what users DO, not just what they SAY. Combine qualitative interviews with quantitative metrics.
- **Lots of experimentation** - A/B test aggressively. Kill what doesn't work. Double down on what does.
- **Look for user feedback** - But filter for power users. Loud ≠ right.
