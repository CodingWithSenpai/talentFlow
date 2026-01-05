import { readFileSync } from "node:fs"
import { Octokit } from "@octokit/rest"

const CHANGELOG_PATH = "CHANGELOG.md"

function extractEmailAndUsername(contributorLine: string): {
  email: string | null
  username: string | null
} {
  const content = contributorLine.replace(/^-\s+/, "").trim()

  // Match markdown link format: Name ([@username](url))
  const markdownLinkMatch = content.match(/\(\[@(\w+)\]\(https?:\/\/github\.com\/[\w-]+\/?\)\)/)
  if (markdownLinkMatch) {
    return { email: null, username: markdownLinkMatch[1] }
  }

  // Match email format: Name <email@domain.com>
  const emailMatch = content.match(/<([^>]+)>/)
  if (emailMatch) {
    const email = emailMatch[1]
    // If it's a GitHub noreply email, extract username directly
    const githubEmailMatch = email.match(/^(\d+\+)?(\w+)@users\.noreply\.github\.com$/)
    if (githubEmailMatch) {
      return { email: null, username: githubEmailMatch[2] }
    }
    // Regular email - return email to search commits
    return { email, username: null }
  }

  // Match direct @username format: Name @username
  const directMatch = content.match(/@(\w+)/)
  if (directMatch) {
    return { email: null, username: directMatch[1] }
  }

  return { email: null, username: null }
}

async function findUsernameByEmail(
  octokit: Octokit,
  email: string,
  repoOwner: string,
  repoName: string,
): Promise<string | null> {
  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: repoOwner,
      repo: repoName,
      author: email,
      per_page: 1,
    })

    return commits[0]?.author?.login ?? null
  } catch {
    return null
  }
}

async function getFullNameByUsername(octokit: Octokit, username: string): Promise<string | null> {
  try {
    const { data: user } = await octokit.rest.users.getByUsername({ username })
    return user.name
  } catch {
    return null
  }
}

async function processChangelog() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error("GITHUB_TOKEN environment variable is required")
    process.exit(1)
  }

  const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || "nrjdalal"
  const repoName = process.env.GITHUB_REPOSITORY_NAME || "zerostarter"

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

  // Process each contributor entry
  const formattedContributors = await Promise.all(
    contributorEntries.map(async (entry) => {
      // Extract name from entry
      const nameMatch = entry.match(/^-\s+(.+?)(?:\s+[@<]|$)/)
      const fallbackName = nameMatch ? nameMatch[1].trim() : ""

      // Extract email or username from entry
      const { email, username: extractedUsername } = extractEmailAndUsername(entry)

      // Get username: use extracted username or search by email
      let username = extractedUsername
      if (!username && email) {
        username = await findUsernameByEmail(octokit, email, repoOwner, repoName)
      }

      // If we have a username, get full name from GitHub
      if (username) {
        const fullName = await getFullNameByUsername(octokit, username)
        return `- ${fullName || fallbackName} @${username}`
      }

      // If we can't find a username, return the original entry
      return entry
    }),
  )

  formattedContributors.forEach((contributor) => {
    console.log(contributor)
  })
}

processChangelog()
