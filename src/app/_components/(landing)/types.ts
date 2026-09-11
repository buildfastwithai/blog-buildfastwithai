export interface Post {
    id: number;
    slug?: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    imageUrl: string;
}

export type Category = 'All' | 'Design' | 'Development' | 'AI' | 'Productivity' | 'Startups' | string;
