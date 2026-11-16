import { business } from '@config/business';
import { packages, type Package } from '@config/packages';
import { hero } from '@config/media';

/**
 * JSON-LD structured data, generated from the central config.
 * Deliberately omits anything unverified: no street address (service-area
 * business), no opening hours, no aggregate ratings.
 */

const site = business.website;
const id = (fragment: string) => `${site}/#${fragment}`;

const offerFor = (pkg: Package) => {
  const service = {
    '@type': 'Service',
    name: pkg.name,
    serviceType: pkg.category === 'Weddings' ? 'Wedding DJ and MC services' : 'Event DJ services',
    description: pkg.description,
  };

  const unitPrice = {
    '@type': 'UnitPriceSpecification',
    price: pkg.price.amount,
    priceCurrency: 'USD',
    ...(pkg.price.per === 'hour' && { unitCode: 'HUR' }),
    ...(pkg.price.per && { unitText: pkg.price.per }),
  };

  const fee = pkg.additionalFee && {
    '@type': 'PriceSpecification',
    name: pkg.additionalFee.label,
    price: pkg.additionalFee.amount,
    priceCurrency: 'USD',
  };

  return {
    '@type': 'Offer',
    name: pkg.name,
    description: `${pkg.duration}. ${pkg.description}`,
    priceCurrency: 'USD',
    ...(pkg.price.per ? {} : { price: pkg.price.amount }),
    priceSpecification: fee ? [unitPrice, fee] : unitPrice,
    itemOffered: service,
    url: `${site}/#packages`,
  };
};

export function buildStructuredData() {
  const areaServed = [
    ...business.location.cities.map((city) => ({
      '@type': 'City',
      name: `${city}, ${business.location.stateCode}`,
    })),
    { '@type': 'State', name: business.location.state },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: `${site}/`,
        name: business.brand,
        inLanguage: 'en-US',
        publisher: { '@id': id('business') },
      },
      {
        '@type': ['EntertainmentBusiness', 'ProfessionalService'],
        '@id': id('business'),
        name: business.brand,
        legalName: business.legalName,
        alternateName: ['DJ Pazo', 'PAZO', business.legalName],
        description: business.shortDescription,
        url: `${site}/`,
        email: business.contact.email,
        telephone: business.contact.phoneE164,
        image: `${site}${hero.poster}`,
        address: {
          '@type': 'PostalAddress',
          addressRegion: business.location.stateCode,
          addressCountry: business.location.country,
        },
        areaServed,
        knowsLanguage: ['en', 'es'],
        paymentAccepted: business.facts.paymentMethods.join(', '),
        currenciesAccepted: 'USD',
        sameAs: business.socials.map((social) => social.url),
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Bookings',
          email: business.contact.email,
          telephone: business.contact.phoneE164,
          availableLanguage: ['English', 'Spanish'],
          areaServed: business.location.state,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'DJ PAZO packages',
          itemListElement: packages.map(offerFor),
        },
        makesOffer: business.services.map((service) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: `DJ for ${service.toLowerCase()}` },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': id('webpage'),
        url: `${site}/`,
        isPartOf: { '@id': id('website') },
        about: { '@id': id('business') },
        inLanguage: 'en-US',
      },
    ],
  };
}
