---
name: generate-build-graph
description: Generates a `.svg` graph of the build process.
---

## Workflow

### Generate Graph

```bash
npx turbo run build --graph=graph.svg
sed -i '' 's/\[root\] //g; s/#build//g; s/___ROOT___/ZeroStarter/g' graph.svg
sed -i '' 's/fill="white"/fill="none"/g; s/fill="#ffffff"/fill="none"/g; s/fill="#fff"/fill="none"/g' graph.svg
sed -i '' 's/fill="black"/fill="#1f6feb"/g' graph.svg
sed -i '' 's/stroke="[^"]*"/stroke="#1f6feb"/g; s/stroke:[^;]*;/stroke:#1f6feb;/g' graph.svg
sed -i '' 's/<text\([^>]*\)>/<text\1 fill="#1f6feb">/g' graph.svg
sed -i '' 's/stroke="#1f6feb" points="-4,4/stroke="none" points="-4,4/g' graph.svg
mkdir -p .github/assets
mv graph.svg .github/assets/graph-build.svg
```
