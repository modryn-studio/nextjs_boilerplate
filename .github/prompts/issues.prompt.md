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

## Step 3: Update docs/issues.md

**First: check if the file already exists.** Read `docs/issues.md` before writing anything.

- **If the file does not exist:** write it from scratch using the format below.
- **If the file already exists:** update it — do not rewrite from scratch. Follow the merge rules below.

### File format

```
# Issues

_Last updated: [Today's date] — [N] open_

---

## [Manually-added sections, if any — preserve exactly]

---

## [#[number] — [title]](https://github.com/[owner]/[repo]/issues/[number])

**Labels:** [comma-separated label names, or "none"] | **Opened:** [Month D, YYYY]

1–2 sentence summary: what it is and the key dependency or blocker if there is one.

---

## Closed

- [#[number] — [title]](https://github.com/[owner]/[repo]/issues/[number])
```

### Merge rules (when file already exists)

1. **Preserve manually-added sections.** Any section that does not correspond to a GitHub issue number (e.g. an E2E checklist, a planning block, a session tracker) must be kept exactly as-is. These sections appear before the first numbered issue entry.
2. **Preserve session annotations.** If an issue entry has lines below the opening 1–2 sentence summary (e.g. "Update (Session 008...)", "Resolved by design...", "Closed [date]..."), keep those lines. Append, never replace them.
3. **Preserve inline markers.** If an issue heading has a `✅` suffix or an inline `| **Closed:** [date]` annotation, keep it. These are manual editorial marks, not generated content.
4. **Add new issues** that exist on GitHub but are not yet in the file. Insert in number-ascending order.
5. **Update the `_Last updated_` line** date and open count. Keep any session note in parentheses if one was already there — replace only the date and count.
6. **Update the `## Closed` list** with any newly closed issues from GitHub. Do not remove entries already in the closed list.
7. **Do not change** the body summary of an issue that already has a manually-written summary unless the GitHub body has substantively changed in a way the local version doesn't reflect.

### Rules (both first-run and merge)

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
