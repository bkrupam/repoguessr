/**
 * Framework maps split by language family.
 * Scoped to avoid cross-language false positives (e.g. Go's "gin" in a JS package.json).
 */

const JS_TS_FRAMEWORKS: Record<string, string> = {
  next: "Next.js",
  "next.js": "Next.js",
  react: "React",
  "react-dom": "React",
  vue: "Vue",
  "@angular/core": "Angular",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  astro: "Astro",
  "@remix-run/react": "Remix",
  nuxt: "Nuxt",
  gatsby: "Gatsby",
  express: "Express",
  fastify: "Fastify",
  koa: "Koa",
  "@nestjs/core": "NestJS",
  hono: "Hono",
  "solid-js": "SolidJS",
  "@tanstack/react-query": "React Query",
};

const PYTHON_FRAMEWORKS: Record<string, string> = {
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  tornado: "Tornado",
  starlette: "Starlette",
  pyramid: "Pyramid",
  sanic: "Sanic",
};

const RUBY_FRAMEWORKS: Record<string, string> = {
  rails: "Rails",
  sinatra: "Sinatra",
  hanami: "Hanami",
};

const GO_FRAMEWORKS: Record<string, string> = {
  "github.com/gin-gonic/gin": "Gin",
  "github.com/labstack/echo": "Echo",
  "github.com/gofiber/fiber": "Fiber",
  "github.com/go-chi/chi": "Chi",
  "github.com/gorilla/mux": "Gorilla Mux",
};

const RUST_FRAMEWORKS: Record<string, string> = {
  actix: "Actix",
  axum: "Axum",
  rocket: "Rocket",
  warp: "Warp",
};

const JAVA_FRAMEWORKS: Record<string, string> = {
  "org.springframework": "Spring",
  "io.quarkus": "Quarkus",
  "io.micronaut": "Micronaut",
};

const CSHARP_FRAMEWORKS: Record<string, string> = {
  "microsoft.aspnetcore": "ASP.NET Core",
  blazor: "Blazor",
};

/** Full flat map — used only for building the datalist */
export const FRAMEWORK_MAP: Record<string, string> = {
  ...JS_TS_FRAMEWORKS,
  ...PYTHON_FRAMEWORKS,
  ...RUBY_FRAMEWORKS,
  ...GO_FRAMEWORKS,
  ...RUST_FRAMEWORKS,
  ...JAVA_FRAMEWORKS,
  ...CSHARP_FRAMEWORKS,
};

/** Unique canonical labels for the autocomplete datalist */
export const FRAMEWORK_LABELS: string[] = Array.from(
  new Set(Object.values(FRAMEWORK_MAP))
).sort();

// ─── Detection functions ──────────────────────────────────────────────────────

/**
 * JS/TS only — match against package.json dependency names.
 * Uses the scoped JS_TS_FRAMEWORKS map to avoid false positives.
 */
export function detectFrameworkFromDeps(deps: string[]): string | null {
  for (const dep of deps) {
    const lower = dep.toLowerCase();
    if (JS_TS_FRAMEWORKS[lower]) return JS_TS_FRAMEWORKS[lower];
  }
  return null;
}

/**
 * Non-JS languages — strict scan of first 5 import lines only.
 * Uses the language-specific map to avoid cross-language false positives.
 */
export function detectFrameworkFromTopImports(lines: string[]): string | null {
  const importLines = lines
    .slice(0, 8)
    .filter((l) => /^\s*(import |from |use |#include |require )/.test(l))
    .join("\n")
    .toLowerCase();

  if (!importLines) return null;

  // Check all non-JS maps
  const nonJsMaps = [
    PYTHON_FRAMEWORKS,
    RUBY_FRAMEWORKS,
    GO_FRAMEWORKS,
    RUST_FRAMEWORKS,
    JAVA_FRAMEWORKS,
    CSHARP_FRAMEWORKS,
  ];

  for (const map of nonJsMaps) {
    for (const [key, label] of Object.entries(map)) {
      if (importLines.includes(key.toLowerCase())) return label;
    }
  }
  return null;
}
