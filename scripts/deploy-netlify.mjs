/**
 * Fase 9 — deploy de produção no Netlify a partir desta máquina (Windows).
 * Uso: npm run deploy:netlify
 *
 * Três cuidados que um `netlify deploy --build` simples não tem:
 *  1. Afasta o `.env` local durante o build — o Nuxt lia-o e metia valores de
 *     desenvolvimento no build de produção (NODE_ENV, GEOLITE2_DB_PATH…). As
 *     variáveis de produção vêm do painel do Netlify. É sempre reposto.
 *  2. Troca as junctions/symlinks que o Nitro cria em node_modules quando há
 *     duas versões do mesmo pacote (vue-router 4 do Nuxt e 5 do @nuxtjs/i18n)
 *     por cópias reais: em Windows ficam com caminhos absolutos C:\…, e na
 *     função do Netlify (Linux) davam "Cannot find package 'vue-router'" →
 *     502 em todas as páginas (1.º deploy, 2026-09-30).
 *  3. Publica com `--no-build` — esta versão do CLI refaz o build por omissão,
 *     o que desfazia os pontos 1 e 2 — depois de apagar o zip que o build já
 *     tinha gerado com as ligações partidas (.netlify/functions).
 *
 * Num build no próprio Netlify (repositório ligado, Linux) nada disto é
 * preciso.
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, readdirSync, realpathSync, renameSync, rmSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FUNCTIONS_DIR = '.netlify/functions-internal'
// Zip gerado pelo `netlify build` ANTES de as ligações serem trocadas — com
// ele o deploy reenviava as ligações partidas. Apagado para o deploy voltar a
// empacotar a função a partir da pasta já corrigida.
const BUNDLED_DIR = '.netlify/functions'
const heldEnv = join(tmpdir(), `financeflow-dotenv-${Date.now()}`)
let envMoved = false

function run(args) {
  const res = spawnSync('npx', ['netlify', ...args], { stdio: 'inherit', shell: true })
  if (res.status !== 0) throw new Error(`netlify ${args[0]} falhou (código ${res.status})`)
}

function restoreEnv() {
  if (envMoved && existsSync(heldEnv)) {
    renameSync(heldEnv, '.env')
    envMoved = false
    console.log('.env reposto')
  }
}

function findLinks(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = lstatSync(path)
    if (stat.isSymbolicLink()) found.push(path)
    else if (stat.isDirectory()) findLinks(path, found)
  }
  return found
}

function materializeLinks() {
  const links = findLinks(FUNCTIONS_DIR)
  for (const link of links) {
    const target = realpathSync(link)
    unlinkSync(link) // remove só a ligação, nunca o destino
    cpSync(target, link, { recursive: true, dereference: true })
    console.log(`ligação substituída por cópia: ${link}`)
  }
  if (findLinks(FUNCTIONS_DIR).length) throw new Error('ainda há ligações na função — deploy cancelado')
}

process.on('SIGINT', () => {
  restoreEnv()
  process.exit(130)
})

try {
  if (existsSync('.env')) {
    renameSync('.env', heldEnv)
    envMoved = true
    console.log(`.env afastado durante o build (${heldEnv})`)
  }
  run(['build', '--context', 'production'])
  restoreEnv()
  materializeLinks()
  rmSync(BUNDLED_DIR, { recursive: true, force: true })
  run(['deploy', '--prod', '--no-build', '--dir', 'dist', '--functions', FUNCTIONS_DIR])
} finally {
  restoreEnv()
}
