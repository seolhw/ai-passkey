import { config } from 'dotenv'
config({ path: ['.env.local', '.env'] })

import { db } from '../src/db/index'
import { companies, jobs, resumeLibrary } from '../src/db/schema'
import { librarySeed, seed } from '../src/db/seed-data'

// 本地种子数据：可通过 `pnpm db:seed` 执行
async function main() {
  for (const item of librarySeed) {
    const exists = await db.query.resumeLibrary.findFirst({
      where: (t, { eq }) => eq(t.title, item.title),
    })
    if (!exists) {
      await db
        .insert(resumeLibrary)
        .values({
          title: item.title,
          industry: item.industry,
          tags: item.tags,
          content: item.content,
          featured: item.featured,
        })
    }
  }

  for (const c of seed) {
    let company = await db.query.companies.findFirst({
      where: (t, { eq }) => eq(t.name, c.name),
    })
    if (!company) {
      const [created] = await db
        .insert(companies)
        .values({ name: c.name, intro: c.intro, website: c.website })
        .returning()
      company = created
    }
    for (const j of c.jobs) {
      const exists = await db.query.jobs.findFirst({
        where: (t, { and, eq }) =>
          and(eq(t.companyId, company.id), eq(t.title, j.title)),
      })
      if (!exists) {
        await db
          .insert(jobs)
          .values({ companyId: company.id, ...j, source: 'seed' })
      }
    }
  }
  console.log('种子数据写入完成')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
