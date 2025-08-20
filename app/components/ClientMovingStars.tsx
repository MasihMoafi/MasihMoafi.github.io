'use client';

import dynamic from 'next/dynamic';

// Dynamically import the MovingStars component with SSR turned off,
// ensuring it only ever runs in the browser.
const ClientMovingStars = dynamic(() => import('./MovingStars'), {
  ssr: false,
});

export default ClientMovingStars;