/**
 * Shared Markdown building blocks for the AI-readable files
 * (/llms.txt, /llms-full.txt, /agents.md). Everything is derived from the
 * central config so these files can never disagree with the website.
 */
import { business } from '@config/business';
import { packages, describePrice, findPackage, pricingNote, type Package } from '@config/packages';
import { testimonials, attributionFor } from '@config/testimonials';
import { navigation } from '@config/content';

export const site = business.website;
export const buildDate = new Date().toISOString().slice(0, 10);

const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n');

export const identityBlock = () =>
  bullets([
    `Public brand: ${business.brand}`,
    `Legal business name: ${business.legalName}`,
    `Website: ${site}/`,
    `Email: ${business.contact.email}`,
    `Phone: ${business.contact.phoneE164} (${business.contact.phoneDisplay})`,
    ...business.socials.map((s) => `${s.label}: ${s.url}`),
    `Base: ${business.location.region} (${business.location.regionShort}), ${business.location.state}`,
    `Regular service cities: ${business.location.cities.join(', ')}, ${business.location.state}`,
    `Travel: ${business.location.travelPolicy}`,
    `Languages: ${business.facts.languages.join(' and ')}`,
    `Experience: ${business.facts.experienceLong}`,
  ]);

export const contactBlock = () =>
  bullets([
    `Website inquiry form: ${site}/#contact`,
    `Email: ${business.contact.email}`,
    `Phone: ${business.contact.phoneE164}`,
    `Instagram: ${business.socials[0].url}`,
    `Typical response time: ${business.contact.responseTime}`,
  ]);

export const servicesBlock = () => bullets(business.services);

export const genresLine = () => business.genres.join(', ');

const packageHeading = (pkg: Package) => `${pkg.name}: ${describePrice(pkg)}`;

/** Detailed package listing; `level` controls heading depth. */
export const packagesBlock = (level = '###') =>
  packages
    .map((pkg) => {
      const base = pkg.includesEverythingFrom && findPackage(pkg.includesEverythingFrom);
      return [
        `${level} ${packageHeading(pkg)}`,
        '',
        `- Coverage: ${pkg.duration}`,
        `- ${pkg.description}`,
        '',
        base ? `Includes everything in the ${base.name} package, plus:` : 'Includes:',
        bullets(pkg.inclusions),
      ].join('\n');
    })
    .join('\n\n');

export const packagesSummary = () => bullets(packages.map(packageHeading));

export const pricingDisclaimer = () =>
  `${pricingNote} Prices, package details, travel charges, deposits, and availability should be confirmed directly with ${business.brand} before booking.`;

export const testimonialsBlock = () =>
  testimonials
    .map((t) => {
      const attribution = attributionFor(t);
      return `> "${t.quote}"\n> — ${t.name}${attribution ? `, ${attribution}` : ''}`;
    })
    .join('\n\n');

export const sectionsBlock = () => bullets(navigation.map((item) => `[${item.label}](${site}/#${item.id})`));

export const markdownResponse = (body: string, type = 'text/plain') =>
  new Response(body.trim() + '\n', { headers: { 'Content-Type': `${type}; charset=utf-8` } });
