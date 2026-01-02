import { readFileSync, writeFileSync } from "node:fs"
import { Octokit } from "@octokit/rest"

const CHANGELOG_PATH = "CHANGELOG.md"
const EMAIL_REGEX =
  /<((?!\.)(?!.*\.\.)([a-z0-9_'+\-.]*)[a-z0-9_'+.-]@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,})>/gi

async function searchCommits(
  octokit: Octokit,
  email: string,
): Promise<{ username: string | null; name: string | null }> {
  const { data } = await octokit.search.commits({
    q: `author-email:${email}`,
    sort: "author-date",
    per_page: 1,
  })

  if (data.total_count === 0) {
    return { username: null, name: null }
  }

  const username = data.items[0]?.author?.login ?? null
  if (!username) {
    return { username: null, name: null }
  }

  try {
    const { data: userData } = await octokit.users.getByUsername({ username })
    return { username, name: userData.name ?? null }
  } catch {
    return { username, name: null }
  }
}

async function getUserInfoFromEmail(
  octokit: Octokit,
  email: string,
): Promise<{ username: string | null; name: string | null }> {
  try {
    if (!(typeof email === "string" && email.includes("@"))) {
      return { username: null, name: null }
    }

    const { data } = await octokit.search.users({
      q: `${email} in:email`,
    })

    if (data.total_count === 0) {
      return await searchCommits(octokit, email)
    }

    const username = data.items[0]?.login ?? null
    if (!username) {
      return { username: null, name: null }
    }

    try {
      const { data: userData } = await octokit.users.getByUsername({ username })
      return { username, name: userData.name ?? null }
    } catch {
      return { username, name: null }
    }
  } catch {
    return { username: null, name: null }
  }
}

async function processChangelog() {
  const content = readFileSync(CHANGELOG_PATH, "utf-8")
  const emailToUserInfo = new Map<string, { username: string | null; name: string | null }>()

  const emails = new Set<string>()
  let match
  while ((match = EMAIL_REGEX.exec(content)) !== null) {
    emails.add(match[1])
  }

  const token = process.env.GITHUB_TOKEN
  const octokit = new Octokit({
    auth: token,
    userAgent: "https://github.com/nrjdalal/zerostarter",
  })

  for (const email of emails) {
    if (emailToUserInfo.has(email)) {
      continue
    }

    const userInfo = await getUserInfoFromEmail(octokit, email)
    emailToUserInfo.set(email, userInfo)
    if (userInfo.username) {
      const nameDisplay = userInfo.name
        ? `${userInfo.name} @${userInfo.username}`
        : `@${userInfo.username}`
      console.log(`Found ${nameDisplay} for ${email}`)
    } else {
      console.log(`No username found for ${email}`)
    }
  }

  let updatedContent = content
  for (const [email, userInfo] of emailToUserInfo) {
    if (userInfo.username) {
      // Format as "Name @username" if name exists, otherwise just "@username"
      const replacement = userInfo.name
        ? `${userInfo.name} @${userInfo.username}`
        : `@${userInfo.username}`
      updatedContent = updatedContent.replaceAll(`<${email}>`, replacement)
    } else {
      updatedContent = updatedContent
        .split("\n")
        .filter((line) => !line.includes(`<${email}>`))
        .join("\n")
    }
  }

  writeFileSync(CHANGELOG_PATH, updatedContent, "utf-8")
  console.log("Changelog updated successfully!")
}

processChangelog().catch(console.error)
