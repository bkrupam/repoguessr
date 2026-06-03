import { Octokit } from "@octokit/rest";
import {
  detectFrameworkFromDeps,
  detectFrameworkFromTopImports,
} from "./frameworks";

export interface Snippet {
  lines: string[];
  language: string;
  repoName: string;
  repoUrl: string;
  repoDescription: string;
  framework: string | null;
}

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Ruby",
  "Java",
  "C++",
  "C#",
];

// Map each language to the extensions we'll accept for that language.
// This prevents picking a .go file from a TypeScript repo, etc.
const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  JavaScript: [".js", ".jsx"],
  TypeScript: [".ts", ".tsx"],
  Python: [".py"],
  Rust: [".rs"],
  Go: [".go"],
  Ruby: [".rb"],
  Java: [".java"],
  "C++": [".cpp", ".cc", ".cxx", ".hpp"],
  "C#": [".cs"],
};

const SKIP_PATH_PATTERN =
  /test|spec|\.config\.|\.min\.|generated|vendor|dist\b|build\b|__pycache__|\.d\.ts$/i;

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: token });
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hasLanguageExtension(path: string, language: string): boolean {
  const exts = LANGUAGE_EXTENSIONS[language] ?? [];
  return exts.some((ext) => path.endsWith(ext));
}

function shouldSkipPath(path: string): boolean {
  return SKIP_PATH_PATTERN.test(path);
}

function isMinified(lines: string[]): boolean {
  if (lines.length === 0) return false;
  const avgLen = lines.reduce((s, l) => s + l.length, 0) / lines.length;
  return avgLen > 200;
}

// Per-language comment syntax. Note: for C-family languages `#` is a
// preprocessor directive (#include/#define) — a useful tell — NOT a comment,
// so we only treat `#` as a line comment for Python and Ruby.
function commentSyntax(language: string): {
  line: string[];
  blockOpen: string[];
  blockClose: string[];
} {
  switch (language) {
    case "Python":
      return { line: ["#"], blockOpen: ['"""', "'''"], blockClose: ['"""', "'''"] };
    case "Ruby":
      return { line: ["#"], blockOpen: ["=begin"], blockClose: ["=end"] };
    default:
      // JS, TS, Go, Rust, Java, C++, C#
      return { line: ["//"], blockOpen: ["/*"], blockClose: ["*/"] };
  }
}

/**
 * Strip a leading run of blank lines and comments (license headers,
 * copyright banners, module docstrings) so the snippet starts on real code.
 */
function stripLeadingComments(lines: string[], language: string): string[] {
  const { line, blockOpen, blockClose } = commentSyntax(language);
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Blank line
    if (trimmed === "") {
      i++;
      continue;
    }

    // Single-line comment
    if (line.some((p) => trimmed.startsWith(p))) {
      i++;
      continue;
    }

    // Block comment — only when the line STARTS with an opener
    const opener = blockOpen.find((p) => trimmed.startsWith(p));
    if (opener) {
      const closer = blockClose[blockOpen.indexOf(opener)];
      // One-line block comment (e.g. `""" doc """` or `/* x */`)?
      const rest = trimmed.slice(opener.length);
      if (rest.includes(closer)) {
        i++;
        continue;
      }
      // Multi-line: consume until the closing token
      i++;
      while (i < lines.length && !lines[i].includes(closer)) i++;
      if (i < lines.length) i++; // move past the closing line
      continue;
    }

    // First line of real code
    break;
  }

  return lines.slice(i);
}

function sanitize(raw: string, language: string): string[] {
  // Strip UTF-8 BOM if present
  let lines = raw.replace(/^﻿/, "").split("\n");

  // Drop shebang
  if (lines[0]?.startsWith("#!")) lines = lines.slice(1);

  // Strip leading comment/license block so we start on code
  lines = stripLeadingComments(lines, language);

  // Drop leading import/require block if > 3 contiguous lines
  const importPattern =
    /^\s*(import |from .+ import|require\(|#include|use |using )/;
  let importEnd = 0;
  for (let i = 0; i < lines.length; i++) {
    if (importPattern.test(lines[i]) || lines[i].trim() === "") {
      if (importPattern.test(lines[i])) importEnd = i + 1;
    } else {
      break;
    }
  }
  if (importEnd > 3) lines = lines.slice(importEnd);

  // A class/function doc-comment may sit between imports and code — strip again
  lines = stripLeadingComments(lines, language);

  // Trim trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  // Cap at 40 lines
  return lines.slice(0, 40);
}

async function fetchFrameworkFromPackageJson(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "package.json",
      ref: branch,
    });
    if ("content" in data) {
      const json = JSON.parse(Buffer.from(data.content, "base64").toString());
      const allDeps = [
        ...Object.keys(json.dependencies ?? {}),
        ...Object.keys(json.devDependencies ?? {}),
      ];
      return detectFrameworkFromDeps(allDeps);
    }
  } catch {
    // No package.json — not a JS/TS repo or package.json not at root
  }
  return null;
}

export async function fetchRandomSnippet(
  languageFilter?: string
): Promise<Snippet> {
  const octokit = getOctokit();
  const language =
    languageFilter && LANGUAGES.includes(languageFilter)
      ? languageFilter
      : randomItem(LANGUAGES);

  // Search for repos with >100 stars in this language
  const searchRes = await octokit.rest.search.repos({
    q: `language:${language} stars:>100`,
    sort: "updated",
    order: "desc",
    per_page: 100,
  });

  const repos = searchRes.data.items;
  if (repos.length === 0) throw new Error(`No repos found for ${language}`);

  // Try up to 5 repos before giving up
  for (let repoAttempt = 0; repoAttempt < 5; repoAttempt++) {
    const repo = randomItem(repos);
    const owner = repo.owner!.login;
    const repoName = repo.name;
    const branch = repo.default_branch ?? "main";

    let treeItems: { path?: string; size?: number; type?: string }[] = [];
    try {
      const treeRes = await octokit.rest.git.getTree({
        owner,
        repo: repoName,
        tree_sha: branch,
        recursive: "1",
      });
      treeItems = treeRes.data.tree;
    } catch {
      continue;
    }

    // Filter to candidate files — only extensions matching the searched language
    const candidates = treeItems.filter(
      (item) =>
        item.type === "blob" &&
        item.path &&
        hasLanguageExtension(item.path, language) &&
        !shouldSkipPath(item.path) &&
        (item.size ?? 0) < 20_000
    );

    if (candidates.length === 0) continue;

    // Try up to 3 files from this repo
    for (let fileAttempt = 0; fileAttempt < 3; fileAttempt++) {
      const file = randomItem(candidates);
      if (!file.path) continue;

      let rawContent: string;
      try {
        const contentRes = await octokit.rest.repos.getContent({
          owner,
          repo: repoName,
          path: file.path,
          ref: branch,
        });
        if (!("content" in contentRes.data)) continue;
        rawContent = Buffer.from(contentRes.data.content, "base64").toString();
      } catch {
        continue;
      }

      const lines = sanitize(rawContent, language);

      // Reject if too short or minified
      if (lines.length < 15) continue;
      if (isMinified(lines)) continue;

      // Framework detection — strict only:
      // JS/TS: must come from package.json deps (strong signal)
      // Others: must have an explicit top-level import in the first 5 lines
      const isJsTs = language === "JavaScript" || language === "TypeScript";
      let framework: string | null = null;
      if (isJsTs) {
        framework = await fetchFrameworkFromPackageJson(octokit, owner, repoName, branch);
      } else {
        framework = detectFrameworkFromTopImports(lines);
      }

      return {
        lines,
        language,
        repoName: `${owner}/${repoName}`,
        repoUrl: repo.html_url,
        repoDescription: repo.description ?? "",
        framework,
      };
    }
  }

  throw new Error("Could not find a suitable snippet after retries");
}
