---
timestamp: 'Tue Oct 21 2025 16:01:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_160152.4a0e40da.md]]'
content_id: a406d90b7dcdf515d95358fecdf77e32868e49a73e7464d646a1b6a728147224
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@std/assert": "jsr:@std/assert@^1.0.15",
        "@utils/": "./src/utils/"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    }
}

```
