// Dummy feed data for the Live Social Feed Preview page.
// Each platform has 6+ posts so the feed feels infinite-scrollable.

export type Platform = "instagram" | "linkedin" | "x" | "facebook" | "youtube";

export interface DummyAuthor {
  name: string;
  handle: string;
  avatarSeed: string; // used with dicebear for stable avatars
  verified?: boolean;
  title?: string; // LinkedIn
  subscribers?: string; // YouTube
}

export interface DummyPost {
  id: string;
  author: DummyAuthor;
  text: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  // YouTube specific
  videoTitle?: string;
  duration?: string;
  views?: string;
  postedAgo: string;
  likes: number;
  comments: number;
  shares?: number;
  retweets?: number;
}

const img = (seed: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

const baseAuthors: DummyAuthor[] = [
  { name: "Maya Chen", handle: "mayacreates", avatarSeed: "maya", verified: true, title: "Creative Director at Lumen Studio", subscribers: "412K" },
  { name: "Devon Park", handle: "devonbuilds", avatarSeed: "devon", title: "Senior Engineer · Stripe", subscribers: "88K" },
  { name: "Aïsha Konaté", handle: "aishak", avatarSeed: "aisha", verified: true, title: "Product Lead · Notion", subscribers: "1.2M" },
  { name: "Lukas Weber", handle: "lukas.w", avatarSeed: "lukas", title: "Founder · Northwind", subscribers: "23K" },
  { name: "Priya Raman", handle: "priyaraman", avatarSeed: "priya", verified: true, title: "Designer · Figma", subscribers: "560K" },
  { name: "Jordan Reeves", handle: "jordanr", avatarSeed: "jordan", title: "Marketing · Shopify", subscribers: "144K" },
];

export const DUMMY_FEED: Record<Platform, DummyPost[]> = {
  instagram: [
    { id: "ig1", author: baseAuthors[0], text: "Golden hour in Lisbon never disappoints 🌅 #travel #lisbon #goldenhour", mediaType: "image", mediaUrl: img("ig1", 800, 1000), postedAgo: "2h", likes: 4821, comments: 132 },
    { id: "ig2", author: baseAuthors[2], text: "New drop: minimalist ceramics 🤍 link in bio", mediaType: "image", mediaUrl: img("ig2", 800, 800), postedAgo: "5h", likes: 12048, comments: 488 },
    { id: "ig3", author: baseAuthors[4], text: "Studio reset Sunday 🧹✨ what's your routine?", mediaType: "image", mediaUrl: img("ig3", 800, 1000), postedAgo: "1d", likes: 980, comments: 64 },
    { id: "ig4", author: baseAuthors[1], text: "POV: shipping at 2am 💻🌙 #devlife", mediaType: "image", mediaUrl: img("ig4", 800, 800), postedAgo: "1d", likes: 2310, comments: 91 },
    { id: "ig5", author: baseAuthors[5], text: "Morning espresso & a clean desk = unstoppable", mediaType: "image", mediaUrl: img("ig5", 800, 1000), postedAgo: "2d", likes: 5602, comments: 210 },
    { id: "ig6", author: baseAuthors[3], text: "Trail run done. Time for pancakes 🥞", mediaType: "image", mediaUrl: img("ig6", 800, 800), postedAgo: "3d", likes: 1740, comments: 53 },
  ],
  linkedin: [
    { id: "li1", author: baseAuthors[2], text: "After 3 years building Notion's mobile app, here are 5 lessons I wish I knew on day one:\n\n1. Ship the smallest thing that solves the problem.\n2. Your roadmap is a hypothesis, not a contract.\n3. Hire for taste, train for craft.\n4. Latency is a feature.\n5. The best PMs are great editors.\n\nWhich would you add?", postedAgo: "4h", likes: 1248, comments: 96, shares: 38 },
    { id: "li2", author: baseAuthors[1], text: "We just open-sourced our internal feature flag system. 🚀\n\nIt powers 200M+ evaluations a day at Stripe. Built in Go, < 5ms p99.\n\nLink in the comments 👇", mediaType: "image", mediaUrl: img("li2", 1200, 628), postedAgo: "8h", likes: 4520, comments: 312, shares: 188 },
    { id: "li3", author: baseAuthors[5], text: "Hot take: most 'growth' problems are actually onboarding problems in disguise.", postedAgo: "1d", likes: 612, comments: 84, shares: 12 },
    { id: "li4", author: baseAuthors[0], text: "Excited to share that I've joined Lumen Studio as Creative Director! Couldn't be more thrilled to work with this team. ✨", mediaType: "image", mediaUrl: img("li4", 1200, 628), postedAgo: "2d", likes: 8910, comments: 540, shares: 46 },
    { id: "li5", author: baseAuthors[3], text: "We raised $4M to reinvent supply chain visibility. Hiring eng + design across the stack. DMs open.", postedAgo: "3d", likes: 2103, comments: 198, shares: 64 },
    { id: "li6", author: baseAuthors[4], text: "A short thread on design systems that don't slow teams down ↓", postedAgo: "4d", likes: 489, comments: 41, shares: 9 },
  ],
  x: [
    { id: "x1", author: baseAuthors[1], text: "the best debugging tool is a good night's sleep", postedAgo: "1h", likes: 4821, comments: 132, retweets: 612 },
    { id: "x2", author: baseAuthors[2], text: "shipped a thing today. it's small. it's mine. it's enough.", postedAgo: "3h", likes: 12048, comments: 488, retweets: 2104 },
    { id: "x3", author: baseAuthors[4], text: "redesigning our onboarding from scratch. screenshots soon 👀", mediaType: "image", mediaUrl: img("x3", 1200, 800), postedAgo: "5h", likes: 980, comments: 64, retweets: 41 },
    { id: "x4", author: baseAuthors[0], text: "hot take: emojis in commit messages are good actually 🚢", postedAgo: "8h", likes: 2310, comments: 91, retweets: 188 },
    { id: "x5", author: baseAuthors[5], text: "marketing is just storytelling with a budget", postedAgo: "1d", likes: 5602, comments: 210, retweets: 901 },
    { id: "x6", author: baseAuthors[3], text: "we hit $1M ARR this morning. wild.", postedAgo: "2d", likes: 18420, comments: 612, retweets: 1402 },
  ],
  facebook: [
    { id: "fb1", author: baseAuthors[3], text: "Family hike at Mt. Tabor today — couldn't ask for better weather! 🌲", mediaType: "image", mediaUrl: img("fb1", 1200, 800), postedAgo: "2h", likes: 312, comments: 48, shares: 6 },
    { id: "fb2", author: baseAuthors[5], text: "Throwback to last summer's road trip. Anyone else missing the open road?", mediaType: "image", mediaUrl: img("fb2", 1200, 800), postedAgo: "6h", likes: 188, comments: 22, shares: 3 },
    { id: "fb3", author: baseAuthors[0], text: "Just finished reading 'A Gentleman in Moscow' — what should I read next?", postedAgo: "1d", likes: 64, comments: 31, shares: 1 },
    { id: "fb4", author: baseAuthors[2], text: "Grateful for friends, good food, and long Sundays. ❤️", mediaType: "image", mediaUrl: img("fb4", 1200, 1200), postedAgo: "2d", likes: 421, comments: 58, shares: 2 },
    { id: "fb5", author: baseAuthors[4], text: "Garage sale this Saturday 8am — vintage furniture, books, tools. Come say hi!", postedAgo: "3d", likes: 47, comments: 12, shares: 14 },
    { id: "fb6", author: baseAuthors[1], text: "Our daughter's first piano recital was today. Proud dad moment. 🎹", mediaType: "image", mediaUrl: img("fb6", 1200, 800), postedAgo: "4d", likes: 612, comments: 92, shares: 4 },
  ],
  youtube: [
    { id: "yt1", author: baseAuthors[0], videoTitle: "I redesigned Instagram in 7 days — here's what happened", text: "", mediaUrl: img("yt1", 1280, 720), duration: "12:48", views: "248K", postedAgo: "2 days ago", likes: 18420, comments: 1240 },
    { id: "yt2", author: baseAuthors[1], videoTitle: "Building a SaaS in public — Episode 14: First $10K MRR", text: "", mediaUrl: img("yt2", 1280, 720), duration: "21:03", views: "92K", postedAgo: "5 days ago", likes: 7210, comments: 612 },
    { id: "yt3", author: baseAuthors[2], videoTitle: "Why every product team should ship on Fridays", text: "", mediaUrl: img("yt3", 1280, 720), duration: "8:21", views: "1.2M", postedAgo: "1 week ago", likes: 88410, comments: 4280 },
    { id: "yt4", author: baseAuthors[4], videoTitle: "Figma tips I wish I knew earlier (2026 edition)", text: "", mediaUrl: img("yt4", 1280, 720), duration: "16:47", views: "412K", postedAgo: "2 weeks ago", likes: 32140, comments: 1810 },
    { id: "yt5", author: baseAuthors[3], videoTitle: "We grew from 0 to 1,000 users in 30 days — full breakdown", text: "", mediaUrl: img("yt5", 1280, 720), duration: "18:12", views: "182K", postedAgo: "3 weeks ago", likes: 14280, comments: 980 },
    { id: "yt6", author: baseAuthors[5], videoTitle: "The marketing playbook every early-stage founder needs", text: "", mediaUrl: img("yt6", 1280, 720), duration: "24:55", views: "76K", postedAgo: "1 month ago", likes: 5410, comments: 312 },
  ],
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  youtube: "YouTube",
};

export { avatar };
