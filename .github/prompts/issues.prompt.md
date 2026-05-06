---
name: issues
description: "Syncs docs/issues.md from GitHub — fetches all open issues via MCP and rewrites the local snapshot. Run before planning sessions or after a batch of issue changes."
agent: agent
---

Sync `docs/issues.md` with the current open issues on GitHub. Fetch live, overwrite local. Do not guess or use cached knowledge — pull from GitHub directly.

---

## Step 1: Read the repo identity

Read `copilot-instructions.md` (or `.github/copilot-instructions.md`) to get the GitHub repo owner and name. If not found there, check `package.json` for a `repository` field.

Expected format: `owner: modryn-studio`, `repo: [current project repo name]`.

---

## Step 2: Fetch all open issues

Use `mcp_github_list_issues` (or equivalent GitHub MCP tool) with:
- `state: "open"`
- `per_page: 100`
- Fetch page 2 if the first page returns exactly 100

For each issue, collect:
- Number
- Title
- Labels (names only)
- Created date (format: Month D, YYYY — e.g. "May 4, 2026")
- Body (full text)

---

## Step 3: Overwrite docs/issues.md

Write the file using this exact format — no deviations:

```
# Open Issues

_Last updated: [Today's date] — [N] issues open_

---

## [#[number] — [title]](https://github.com/[owner]/[repo]/issues/[number])

**Labels:** [comma-separated label names, or "none"]
**Opened:** [Month D, YYYY]

[Full issue body, verbatim. Preserve line breaks. Do not summarize.]

---

## [#[number] — ...]
```

Rules:
- Sort by issue number ascending
- Every open issue gets a full entry — do not truncate or summarize the body
- Preserve all markdown in the body (bold, lists, code blocks, links)
- The `---` divider goes between issues, not after the last one
- If an issue has no body, write: _(no description)_
- Update the count in the `_Last updated_` line to match the actual number of issues fetched

---

## Step 4: Report

Print one line: `docs/issues.md updated — [N] open issues synced from GitHub.`

If the GitHub MCP tools are unavailable, stop and tell Luke: "GitHub MCP not available — reload VS Code to activate the server, then run /issues again."
