---
name: "UX Patterns"
description: "Client-side UX patterns for forms and textarea behavior"
applyTo: "**/*.tsx"
---
# UX Patterns

## Multi-Step Form Draft Persistence

Any form with 2+ steps where the user types meaningful free-text input MUST persist the primary field to `sessionStorage`. Mobile users accidentally navigate away constantly — losing their input loses the sale.

**Pattern:**

```ts
const KEY = 'yourapp_fieldname';

const [text, setText] = useState(() => {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(KEY) ?? '';
});

// Save on every change
useEffect(() => {
  sessionStorage.setItem(KEY, text);
}, [text]);

// Clear on successful submit
function handleSubmit() {
  sessionStorage.removeItem(KEY);
  // ... rest of submit logic
}
```

Rules:
- Use a namespaced key: `appname_fieldname` (e.g., `songforme_freeform`)
- Always guard with `typeof window === 'undefined'` — server render will throw otherwise
- Clear on successful submit — stale draft on a fresh visit is confusing
- Only persist fields with real user effort (not selects, toggles, or auto-populated values)

## Textarea Auto-Grow

Any textarea where the user writes more than one line MUST auto-grow. Fixed-height textareas that overflow with a scroll are friction.

```ts
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  const el = textareaRef.current;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}, [value]);
```

```tsx
<textarea
  ref={textareaRef}
  className="min-h-30 resize-none overflow-hidden ..."
  value={value}
  onChange={e => setValue(e.target.value)}
/>
```

Rules:
- Set `min-h-*` for the floor — collapse to one line looks broken
- Always add `resize-none` and `overflow-hidden` — the JS handles growth
- Reset `height = 'auto'` before measuring `scrollHeight` or shrinking won't work
