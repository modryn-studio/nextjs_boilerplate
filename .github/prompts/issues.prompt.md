---
name: issues
description: 'Syncs docs/issues.md from GitHub — fetches all open and closed issues via MCP and rewrites the local snapshot. Run before planning sessions or after a batch of issue changes.'
agent: agent
---

Sync `docs/issues.md` with the current issues on GitHub. Fetch live, overwrite local. Do not guess or use cached knowledge — pull from GitHub directly.

---

## Step 1: Read the repo identity

Read `copilot-instructions.md` (or `.github/copilot-instructions.md`) to get the GitHub repo owner and name. If not found there, check `package.json` for a `repository` field.

---

## Step 2: Fetch issues

Use `mcp_github_list_issues` (or equivalent GitHub MCP tool) twice:

- First call: `state: "open"`, `per_page: 100`, sorted by number ascending
- Second call: `state: "closed"`, `per_page: 100`, sorted by number ascending
- Fetch page 2 of either if the first page returns exactly 100

For open issues collect: number, title, labels, created date, body.
For closed issues collect: number, title only.

---

## Step 3: Overwrite docs/issues.md

Write the file using this exact format:

```
# Issues

_Last updated: [Today's date] — [N] open_

---

## [#[number] — [title]](https://github.com/[owner]/[repo]/issues/[number])

**Labels:** [comma-separated label names, or "none"] | **Opened:** [Month D, YYYY]

1–2 sentence summary: what it is and the key dependency or blocker if there is one.

---

## Closed

- [#[number] — [title]](https://github.com/[owner]/[repo]/issues/[number])
```

Rules:

- Open issues: sort by number ascending, one `---` divider between entries (not after the last)
- Open issue summary: distill from the body — what it is + key dependency/blocker only. 1–2 sentences. No full body verbatim.
- If an open issue has no body, write: _(no description)_
- Closed issues: title-linked list under `## Closed`, sorted by number ascending. No body, no labels, no date.
- If there are no closed issues, write: `_None yet._` under `## Closed`
- Update the count in the `_Last updated_` line to match open issues only

---

## Step 4: Report

Print one line: `docs/issues.md updated — [N] open, [M] closed.`

If the GitHub MCP tools are unavailable, stop and tell Luke: "GitHub MCP not available — reload VS Code to activate the server, then run /issues again."
