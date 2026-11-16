import type { APIRoute } from 'astro';
import { site } from '@lib/ai-content';

/**
 * All crawlers, including search engines and AI crawlers (GPTBot,
 * ClaudeBot, PerplexityBot, Google-Extended, ...), are allowed. This matches
 * the previous site's policy. To block a specific bot, add e.g.:
 *   User-agent: GPTBot
 *   Disallow: /
 */
export const GET: APIRoute = () =>
  new Response(
    `# DJ PAZO crawler guidance
User-agent: *
Allow: /

# AI-readable summaries
# ${site}/llms.txt
# ${site}/llms-full.txt
# ${site}/agents.md

Sitemap: ${site}/sitemap.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
