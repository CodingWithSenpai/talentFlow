import { readFileSync } from "node:fs"
import { Octokit } from "@octokit/rest"

const CHANGELOG_PATH = "CHANGELOG.md"

function extractUsername(contributorLine: string): string | null {
  // Remove the "- " prefix
  const content = contributorLine.replace(/^-\s+/, "").trim()

  // Match markdown link format: Name ([@username](url))
  const markdownLinkMatch = content.match(/\(\[@(\w+)\]\(https?:\/\/github\.com\/[\w-]+\/?\)\)/)
  if (markdownLinkMatch) {
    return markdownLinkMatch[1]
  }

  // Match direct @username format: Name @username
  const directMatch = content.match(/@(\w+)/)
  if (directMatch) {
    return directMatch[1]
  }

  // Match email format: Name <email@domain.com>
  // Try to extract username from GitHub email domain
  const emailMatch = content.match(/<([^>]+)>/)
  if (emailMatch) {
    const email = emailMatch[1]
    // If it's a GitHub noreply email, extract username
    const githubEmailMatch = email.match(/^(\d+\+)?(\w+)@users\.noreply\.github\.com$/)
    if (githubEmailMatch) {
      return githubEmailMatch[2]
    }
    // Try to extract from regular email (username part before @)
    const emailUsername = email.split("@")[0]
    // This is a fallback - might not always be correct
    return emailUsername
  }

  return null
}

async function processChangelog() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error("GITHUB_TOKEN environment variable is required")
    process.exit(1)
  }

  const octokit = new Octokit({ auth: token })

  const content = readFileSync(CHANGELOG_PATH, "utf-8")
  const lines = content.split("\n")

  const firstContributorSection = lines.findIndex((line) => line.trim() === "### ❤️ Contributors")

  if (firstContributorSection === -1) {
    console.log("No contributors section found")
    return
  }

  const sectionLines = lines.slice(firstContributorSection + 1)
  const nextSectionIndex = sectionLines.findIndex((line) => line.trim().startsWith("##"))
  const contributorLines =
    nextSectionIndex === -1 ? sectionLines : sectionLines.slice(0, nextSectionIndex)

  const contributorEntries = contributorLines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))

  // Fetch user info from GitHub and format
  const formattedContributors = await Promise.all(
    contributorEntries.map(async (entry) => {
      const username = extractUsername(entry)
      if (!username) {
        // If we can't extract username, return the original entry
        return entry
      }

      try {
        const { data: user } = await octokit.rest.users.getByUsername({ username })
        const fullName = user.name || user.login
        return `- ${fullName} @${username}`
      } catch {
        // If user not found, try to extract name from original entry
        const nameMatch = entry.match(/^-\s+(.+?)(?:\s+[@<]|$)/)
        const name = nameMatch ? nameMatch[1].trim() : username
        return `- ${name} @${username}`
      }
    }),
  )

  console.log(formattedContributors.join("\n"))
}

async function main() {
  await processChangelog()
}

main()
