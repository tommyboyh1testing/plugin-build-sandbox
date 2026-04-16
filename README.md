# plugin-build-sandbox

Sandbox repo reproducing a GitHub Actions `pull_request_target` + expression-injection
pattern in a plugin-registry build pipeline. The workflow parses a fork-controlled
`plugin.yaml`, emits its fields as job outputs, and interpolates those outputs back
into `run:` scripts via `${{ }}` — classic expression injection.

Used to verify the exploit primitive on GitHub-hosted runners before responsible
disclosure to the upstream vendor. Do not use this code in production.
