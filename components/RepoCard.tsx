"use client";

import { useEffect, useState } from "react";

interface RepoCardProps {
  repoName: string;
  repoUrl: string;
  description: string;
}

interface RepoMeta {
  stars: number | null;
  language: string | null;
  description: string;
}

export default function RepoCard({ repoName, repoUrl, description }: RepoCardProps) {
  const [meta, setMeta] = useState<RepoMeta | null>(null);

  useEffect(() => {
    const cacheKey = `repoguessr_repo_${repoName}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setMeta(JSON.parse(cached));
        return;
      }
    } catch {}

    fetch(`/api/repo?repo=${encodeURIComponent(repoName)}`)
      .then((r) => r.json())
      .then((data: RepoMeta) => {
        setMeta(data);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
      })
      .catch(() => {});
  }, [repoName]);

  const desc = meta?.description || description;

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#050505] border border-[#1a1a1a] rounded-lg p-6 hover:border-[#9A9A9A] transition-colors"
    >
      <p className="body-type text-white">{repoName}</p>
      {desc && (
        <p className="body-type text-[#9A9A9A] mt-2 line-clamp-2">{desc}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        {meta?.stars != null && (
          <span className="label border border-[#1a1a1a] px-2 py-1 text-[#9A9A9A]">
            {meta.stars.toLocaleString()} STARS
          </span>
        )}
        {meta?.language && (
          <span className="label border border-[#1a1a1a] px-2 py-1 text-[#9A9A9A]">
            {meta.language.toUpperCase()}
          </span>
        )}
      </div>
    </a>
  );
}
