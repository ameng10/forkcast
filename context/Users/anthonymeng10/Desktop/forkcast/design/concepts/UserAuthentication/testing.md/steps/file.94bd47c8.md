---
timestamp: 'Fri Nov 07 2025 11:07:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_110740.17841089.md]]'
content_id: 94bd47c8578cd18a50b5337cc009572157077d5c746f66496e0b0757c702aa6c
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@std/assert": "jsr:@std/assert@^1.0.15",
        "@utils/": "./src/utils/",
        "@concepts": "./src/concepts/concepts.ts",
        "@test-concepts": "./src/concepts/test_concepts.ts",
        "@engine": "./src/engine/mod.ts",
        "@syncs": "./src/syncs/syncs.ts",
    "mongodb": "npm:mongodb@6.10.0",
    "google-generative-ai": "npm:@google/generative-ai@^0.11.1"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api",
        "start": "deno run --allow-net --allow-write --allow-read --allow-sys --allow-env src/main.ts",
        "import": "deno run --allow-read --allow-write --allow-env src/utils/generate_imports.ts",
        "build": "deno run import"
    },
    "lint": {
        "rules": {
            "exclude": [
                "no-import-prefix",
                "no-unversioned-import"
            ]
        }
    }
}

```
