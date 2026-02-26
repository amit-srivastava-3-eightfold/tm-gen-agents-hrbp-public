/**
 * Configures git to use GITHUB_TOKEN for HTTPS clones when running in CI (e.g. Vercel).
 * Required because npm resolves github:user/repo to SSH, which fails without SSH keys.
 */
if (process.env.GITHUB_TOKEN) {
  const { execSync } = require('child_process');
  const token = process.env.GITHUB_TOKEN;
  const url = `https://x-access-token:${token}@github.com/`;
  execSync(`git config --global url."${url}".insteadOf "https://github.com/"`, {
    stdio: 'inherit',
  });
}
