/**
 * Vercel / CI: package-lock resolves ef-design-system as git+ssh://… — Vercel has no SSH key.
 * - With GITHUB_TOKEN: rewrite GitHub URLs to HTTPS with token (private or rate limits).
 * - Without token (e.g. public repo): rewrite SSH → plain https://github.com/ so clone works.
 */
const { execSync } = require('child_process')

const isCI = process.env.CI === 'true' || process.env.VERCEL === '1'

function runGitConfig(args) {
  execSync(`git config --global ${args}`, { stdio: 'inherit' })
}

if (process.env.GITHUB_TOKEN) {
  const token = process.env.GITHUB_TOKEN
  const url = `https://x-access-token:${token}@github.com/`
  runGitConfig(`url."${url}".insteadOf "ssh://git@github.com/"`)
  runGitConfig(`url."${url}".insteadOf "https://github.com/"`)
} else if (isCI) {
  try {
    runGitConfig('url."https://github.com/".insteadOf "ssh://git@github.com/"')
  } catch {
    console.warn('[setup-git-auth] git config failed; npm may not resolve git+ssh dependencies.')
  }
}
