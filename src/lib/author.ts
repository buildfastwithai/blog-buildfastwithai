export interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar?: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    email?: string;
  };
}

export const PRIMARY_AUTHOR: Author = {
  name: "Satvik Paramkusam",
  slug: "satvik-paramkusam",
  role: "Founder, Build Fast with AI",
  bio: "Founder at Build Fast with AI. AI Engineer, educator, and researcher passionate about agentic AI workflows, LLM application architecture, and training the next generation of AI builders.",
  avatar: "/authors/satvik.png",
  socials: {
    linkedin: "https://www.linkedin.com/in/satvikparamkusham/",
    twitter: "https://x.com/buildfastwithai",
    github: "https://github.com/buildfastwithai",
    website: "https://www.buildfastwithai.com",
  },
};

const AUTHORS: Record<string, Author> = {
  "satvik-paramkusam": PRIMARY_AUTHOR,
  "satvik": PRIMARY_AUTHOR,
};

export function getAuthorBySlug(slug: string): Author | null {
  const normalized = slug.toLowerCase().trim();
  return AUTHORS[normalized] || PRIMARY_AUTHOR;
}
