/* 临时调试脚本：启动 vite dev 并捕获 SSR 错误堆栈 */
import { createServer } from 'vite'

const server = await createServer({
  server: { port: 3999 },
  logLevel: 'info',
})
await server.listen()

try {
  const res = await fetch('http://localhost:3999/')
  const text = await res.text()
  const fs = await import('node:fs')
  fs.writeFileSync(
    'debug-out.txt',
    `STATUS ${res.status}\nBODY_START\n${text.slice(0, 6000)}\nBODY_END\n`,
  )
} catch (e) {
  const fs = await import('node:fs')
  fs.writeFileSync('debug-out.txt', `SSR_ERROR\n${(e as Error).stack ?? String(e)}\n`)
}

await server.close()
process.exit(0)
