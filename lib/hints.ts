/** Generic hints keyed by language — never reveal the answer directly. */

const LANGUAGE_HINTS: Record<string, string[]> = {
  JavaScript: [
    "Runs in browsers and Node.js without compilation.",
    "Created in the 1990s; standardized as ECMAScript.",
    "Dynamically typed with prototypal inheritance.",
  ],
  TypeScript: [
    "A superset that compiles to another web language.",
    "Adds static types on top of a popular scripting language.",
    "Created by Microsoft in the 2010s.",
  ],
  Python: [
    "Uses indentation for block structure.",
    "Interpreted language popular in data science and web.",
    "Created in the late 1980s by Guido van Rossum.",
  ],
  Rust: [
    "Memory-safe systems language without a garbage collector.",
    "Uses ownership and borrowing instead of GC.",
    "Created by Mozilla in the 2010s.",
  ],
  Go: [
    "Designed at Google for concurrent networked services.",
    "Compiled language with goroutines built in.",
    "Created in the late 2000s.",
  ],
  Ruby: [
    "Dynamic language focused on developer happiness.",
    "Popular for Rails web applications.",
    "Created in the mid-1990s in Japan.",
  ],
  Java: [
    "Runs on the JVM; write once, run anywhere.",
    "Strongly typed, object-oriented enterprise staple.",
    "Created by Sun Microsystems in the 1990s.",
  ],
  "C++": [
    "Extension of C with classes and templates.",
    "Compiled systems language common in game engines.",
    "Standardized in the 1980s–90s.",
  ],
  "C#": [
    "Microsoft's primary .NET language.",
    "Similar syntax to Java; runs on CLR.",
    "Created in the early 2000s.",
  ],
};

const GENERIC_HINTS = [
  "This snippet comes from a real open-source repository.",
  "Look at imports and syntax patterns for clues.",
  "Consider whether the code is compiled or interpreted.",
];

export function getHintForLanguage(language: string, usedIndices: number[]): string {
  const pool = LANGUAGE_HINTS[language] ?? GENERIC_HINTS;
  const available = pool.map((_, i) => i).filter((i) => !usedIndices.includes(i));
  const idx =
    available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * pool.length);
  return pool[idx];
}
