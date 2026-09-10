import { spawn, execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const php = process.env.PHP_BIN || 'php'
const dir = mkdtempSync(path.join(tmpdir(), 'anfas-estimate-preview-'))
const password = randomBytes(12).toString('base64url')
const hash = execFileSync(php, ['-r', `echo password_hash('${password}', PASSWORD_DEFAULT);`], {
  encoding: 'utf8',
})
const config = path.join(dir, 'config.php')
writeFileSync(
  config,
  `<?php return ['username'=>'admin','password_hash'=>'${hash}','session_version'=>'${randomBytes(32).toString('hex')}','rate_limit_path'=>'${dir.replaceAll('\\', '/')}', 'allow_local_http'=>true];`,
)
const port = process.env.PORT || '4178'
const server = spawn(php, ['-S', `127.0.0.1:${port}`, 'scripts/estimate-dev-router.php'], {
  env: { ...process.env, ANFAS_ESTIMATE_CONFIG: config },
  stdio: 'inherit',
  windowsHide: true,
})
console.log(
  `Local preview: http://127.0.0.1:${port}/internal/estimate\nLogin: admin\nTemporary password: ${password}`,
)
function close() {
  server.kill()
}
process.on('SIGINT', close)
process.on('SIGTERM', close)
server.on('exit', (code) => {
  rmSync(dir, { recursive: true, force: true })
  process.exit(code || 0)
})
