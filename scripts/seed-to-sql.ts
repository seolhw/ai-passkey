import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { librarySeed, seed } from '../src/db/seed-data'

// 将种子数据生成为 SQL，供 D1 初始化：pnpm db:d1:seed
// 固定主键 + INSERT OR IGNORE，保证重复执行幂等
function sqlStr(value: string | undefined | null) {
  if (value === undefined || value === null) return 'NULL'
  return `'${value.replaceAll("'", "''")}'`
}

function sqlInt(value: number | boolean) {
  return Number(value)
}

const lines: string[] = ['-- 种子数据（由 scripts/seed-to-sql.ts 自动生成，勿手改）']

let companyId = 0
for (const c of seed) {
  companyId += 1
  lines.push(
    `INSERT OR IGNORE INTO companies (id, name, intro, website, created_at) VALUES (${companyId}, ${sqlStr(c.name)}, ${sqlStr(c.intro)}, ${sqlStr(c.website)}, unixepoch());`,
  )
  let jobId = companyId * 100
  for (const j of c.jobs) {
    jobId += 1
    lines.push(
      `INSERT OR IGNORE INTO jobs (id, company_id, title, jd, salary, location, source, created_at) VALUES (${jobId}, ${companyId}, ${sqlStr(j.title)}, ${sqlStr(j.jd)}, ${sqlStr(j.salary)}, ${sqlStr(j.location)}, 'seed', unixepoch());`,
    )
  }
}

librarySeed.forEach((item, i) => {
  lines.push(
    `INSERT OR IGNORE INTO resume_library (id, title, industry, tags, content, featured, created_at) VALUES (${i + 1}, ${sqlStr(item.title)}, ${sqlStr(item.industry)}, ${sqlStr(item.tags)}, ${sqlStr(item.content)}, ${sqlInt(item.featured)}, unixepoch());`,
  )
})

const target = join(import.meta.dirname, '../drizzle/seed.sql')
writeFileSync(target, `${lines.join('\n')}\n`, 'utf-8')
console.log(`种子 SQL 已生成：${target}`)
