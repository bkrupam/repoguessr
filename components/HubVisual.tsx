interface HubVisualProps {
  variant: "daily" | "practice";
}

/** Daily: snippet lines reveal + typing a guess (mirrors in-game flow). */
function DailyCodeVisual() {
  return (
    <div className="hub-code-block hub-code-block--daily" aria-hidden>
      <div className="hub-code-row">
        <span className="hub-ln">1</span>
        <span className="hub-ch hub-daily-line hub-daily-line-1">import type {"{ Snippet }"}</span>
      </div>
      <div className="hub-code-row">
        <span className="hub-ln">2</span>
        <span className="hub-ch hub-daily-line hub-daily-line-2">from &quot;./github&quot;;</span>
      </div>
      <div className="hub-code-row">
        <span className="hub-ln">3</span>
        <span className="hub-ch hub-daily-line hub-daily-line-3 hub-ch-muted">
          {"// reveal lines to guess…"}
        </span>
      </div>
      <div className="hub-code-row">
        <span className="hub-ln">4</span>
        <span className="hub-ch hub-daily-type">guess(language)</span>
        <span className="hub-cursor" />
      </div>
    </div>
  );
}

function PracticeSnippet({
  id,
  lines,
}: {
  id: string;
  lines: { n: number; code: string; muted?: boolean }[];
}) {
  return (
    <div className={`hub-snippet hub-snippet--${id}`}>
      {lines.map((line) => (
        <div key={line.n} className="hub-code-row">
          <span className="hub-ln">{line.n}</span>
          <span className={`hub-ch ${line.muted ? "hub-ch-muted" : ""}`}>{line.code}</span>
        </div>
      ))}
    </div>
  );
}

/** Practice: cycles Python → Rust → TypeScript → Go snippets. */
function PracticeCodeVisual() {
  return (
    <div className="hub-code-block hub-code-block--practice" aria-hidden>
      <div className="hub-practice-stack">
        <PracticeSnippet
          id="py"
          lines={[
            { n: 1, code: "def guess_snippet():" },
            { n: 2, code: "    return language" },
          ]}
        />
        <PracticeSnippet
          id="rs"
          lines={[
            { n: 1, code: "fn main() {" },
            { n: 2, code: '    println!("ok");' },
            { n: 3, code: "}" },
          ]}
        />
        <PracticeSnippet
          id="ts"
          lines={[
            { n: 1, code: "export async function run()" },
            { n: 2, code: "  : Promise<void>" },
          ]}
        />
        <PracticeSnippet
          id="go"
          lines={[
            { n: 1, code: "package main" },
            { n: 2, code: "func Guess() string" },
          ]}
        />
      </div>
      <div className="hub-reveal-bar" />
    </div>
  );
}

export default function HubVisual({ variant }: HubVisualProps) {
  return (
    <div className="hub-visual-wrap">
      {variant === "daily" ? <DailyCodeVisual /> : <PracticeCodeVisual />}
    </div>
  );
}
