---
name: turbo-build-graph
description: Generates a styled SVG dependency graph of the Turborepo build pipeline. Use when the user asks to visualize dependencies, generate a build graph, or update the pipeline diagram.
---

# Turbo Build Graph

Creates a dark-mode-friendly SVG visualization of Turborepo task dependencies.

## Workflow

### 1. Generate Raw Graph

```bash
npx turbo run build --graph=graph.svg
```

Creates an SVG visualization of the build task dependencies.

### 2. Clean Up Labels

```bash
sed -i '' 's/\[root\] //g; s/#build//g; s/___ROOT___/ZeroStarter/g' graph.svg
```

- Remove `[root] ` prefix from package names
- Remove `#build` suffix from task labels
- Replace internal `___ROOT___` placeholder with project name

### 3. Style for Dark Mode / Transparency

```bash
# Transparent background
sed -i '' 's/fill="white"/fill="none"/g; s/fill="#ffffff"/fill="none"/g; s/fill="#fff"/fill="none"/g' graph.svg

# GitHub blue (#1f6feb) for nodes and text
sed -i '' 's/fill="black"/fill="#1f6feb"/g' graph.svg
sed -i '' 's/stroke="[^"]*"/stroke="#1f6feb"/g; s/stroke:[^;]*;/stroke:#1f6feb;/g' graph.svg
sed -i '' 's/<text\([^>]*\)>/<text\1 fill="#1f6feb">/g' graph.svg

# Remove arrowhead strokes (cleaner look)
sed -i '' 's/stroke="#1f6feb" points="-4,4/stroke="none" points="-4,4/g' graph.svg
```

### 4. Move to Assets

```bash
mkdir -p .github/assets
mv graph.svg .github/assets/graph-build.svg
```

Output: `.github/assets/graph-build.svg`

## Usage in README

```markdown
![Build Graph](.github/assets/graph-build.svg)
```

## Notes

- Run from repository root
- Requires `turbo` (installed via workspace dependencies)
- macOS `sed -i ''` syntax; on Linux use `sed -i` (no empty string)
