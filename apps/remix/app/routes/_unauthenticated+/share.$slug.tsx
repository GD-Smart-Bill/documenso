import { redirect } from 'react-router';

import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

import type { Route } from './+types/share.$slug';

export function meta({ params: { slug } }: Route.MetaArgs) {
  return [
    { title: 'Smartsign - Share' },
    { description: 'I just signed a document in style with Smartsign!' },
    {
      property: 'og:title',
      content: 'Smartsign - Join the open source signing revolution',
    },
    {
      property: 'og:description',
      content: 'I just signed with Smartsign!',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/share/${slug}/opengraph`,
    },
    {
      name: 'twitter:site',
      content: '@documenso',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/share/${slug}/opengraph`,
    },
    {
      name: 'twitter:description',
      content: 'I just signed with Smartsign!',
    },
  ];
}

export const loader = ({ request }: Route.LoaderArgs) => {
  const userAgent = request.headers.get('User-Agent') ?? '';

  if (/bot|facebookexternalhit|WhatsApp|google|bing|duckduckbot|MetaInspector/i.test(userAgent)) {
    return null;
  }

  // Is hardcoded because this whole meta is hardcoded anyway for Smartsign.
  throw redirect('https://smartbill.co.il');
};

export default function SharePage() {
  return <div></div>;
}
