---
name: git-commit
description: Detects changes and creates well-formed commits with conventional commit messages. Use when the user asks to commit, save changes, or create a commit.
---

# Git Commit

Creates atomic commits with conventional message format.

## Workflow

### 1. Inspect Changes

```bash
git status
git diff --staged
git diff
```

- MUST: Review both staged and unstaged changes before proceeding
- If files are already staged AND unstaged changes exist, ask user which to include

### 2. Stage Changes

```bash
git add <files>
```

- Stage related changes together—one logical unit per commit
- NEVER: Stage unrelated changes in a single commit

### 3. Commit

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<body>
EOF
)"
```

### 4. Push (Optional)

```bash
git push
```

- MUST: Ask user for explicit confirmation before pushing
- Default behavior: Stage and commit only—do NOT push automatically
- Only push if user explicitly confirms or requests it
- If user declines or doesn't respond, skip the push step

#### Message Format

- **Type**: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `style`, `ci`
- **Scope**: Optional `(area)` after type—package, component, or feature name
- **Subject**: Imperative mood, lowercase, no period, ≤80 chars
- **Body**: Optional; explain "why" not "what"; wrap at 80 chars

#### Examples

```
feat(auth): add OAuth provider support
feat(ui): add dark mode toggle to settings
fix(api): prevent duplicate webhook delivery
fix(db): handle connection timeout gracefully
refactor(web): extract auth middleware into separate module
docs(readme): update installation steps
chore(deps): bump dependencies to latest versions
```

### Edge Cases

- Empty staging area → inform user, do not commit
- Only whitespace/formatting changes → use `style:` prefix
- Breaking changes → append `!` after type (e.g., `feat!: remove deprecated API`)
