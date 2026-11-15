import { Suspense } from 'react';
import RequestDetailClient from './RequestDetailClient';

export default function TutoringRequestDetailPage() {
  return (
    <Suspense fallback={null}>
      <RequestDetailClient />
    </Suspense>
  );
}
