import { readFileSync } from "node:fs"
// import { Octokit } from "@octokit/rest"

const CHANGELOG_PATH = "CHANGELOG.md"

async function processChangelog() {
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

  const contributors = contributorLines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))

  console.log(contributors)
}

async function main() {
  await processChangelog()
}

main()
