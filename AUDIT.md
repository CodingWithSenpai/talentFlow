# Security Audit

These are the current fixes/overrides for the security audit, to be removed once the dependencies are updated:

```json
// posthog-js pulls preact@10.28.2 which has security vulnerabilities
"overrides": {
  "preact": ">=10.28.2"
},
```
