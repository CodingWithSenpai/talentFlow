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
  const lines = content.split("\n")

  // Find all Contributors sections
  const contributorSections: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "### ❤️ Contributors") {
      contributorSections.push(i)
    }
  }

  if (contributorSections.length === 0) {
    console.log("No Contributors section found")
    return
  }

  // Collect all emails from contributor bullet points
  const emails = new Set<string>()
  const emailToLineIndex = new Map<string, number[]>()

  for (const sectionStart of contributorSections) {
    // Process lines until we hit the next section (## or ###)
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i]

      // Stop at next section
      if (line.startsWith("##")) {
        break
      }

      // Process bullet points
      if (line.trim().startsWith("-")) {
        const emailMatch = line.match(EMAIL_REGEX)
        if (emailMatch) {
          const email = emailMatch[1]
          emails.add(email)
          const existing = emailToLineIndex.get(email) || []
          existing.push(i)
          emailToLineIndex.set(email, existing)
        }
      }
    }
  }

  // Create Octokit instance once
  const token = process.env.GITHUB_TOKEN
  const octokit = new Octokit({
    auth: token,
    userAgent: "https://github.com/nrjdalal/zerostarter",
  })

  // Fetch user info for each unique email
  const emailToUserInfo = new Map<string, { username: string | null; name: string | null }>()
  for (const email of emails) {
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

  // Replace emails in contributor lines
  const updatedLines = [...lines]
  for (const [email, userInfo] of emailToUserInfo) {
    const lineIndices = emailToLineIndex.get(email) || []

    for (const lineIndex of lineIndices) {
      let line = updatedLines[lineIndex]

      if (userInfo.username) {
        // Replace everything from bullet point to <email> with Name @username
        const displayName = userInfo.name || userInfo.username
        // Match: "- " (optional) + any text + "<email>" and replace with "- " + displayName + " @username"
        const bulletMatch = line.match(/^(-\s*)/)
        const bullet = bulletMatch ? bulletMatch[1] : ""
        line = line.replace(/^(-\s*)?.*<[^>]+>/, `${bullet}${displayName} @${userInfo.username}`)
        updatedLines[lineIndex] = line
      } else {
        // Remove the line if no username found
        updatedLines[lineIndex] = ""
      }
    }
  }

  // Remove empty lines (removed contributor entries)
  const finalContent = updatedLines.filter((line) => line !== "").join("\n")

  writeFileSync(CHANGELOG_PATH, finalContent, "utf-8")
  console.log("Changelog updated successfully!")
}

processChangelog().catch(console.error)
