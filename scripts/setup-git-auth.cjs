/**
 * Configures git to use GITHUB_TOKEN for HTTPS clones when running in CI (e.g. Vercel).
 * Required because package-lock.json caches git+ssh:// URLs and npm uses them during install.
 */
if (process.env.GITHUB_TOKEN) {
  const { execSync } = require('child_process');
  const token = process.env.GITHUB_TOKEN;
  const url = `https://x-access-token:${token}@github.com/`;
  // Rewrite SSH URLs (from package-lock resolved) to HTTPS with token
  execSync(`git config --global url."${url}".insteadOf "ssh://git@github.com/"`, {
    stdio: 'inherit',
  });
  // Rewrite plain HTTPS URLs to include token
  execSync(`git config --global url."${url}".insteadOf "https://github.com/"`, {
    stdio: 'inherit',
  });
}
