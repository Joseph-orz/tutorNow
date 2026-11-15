import { Suspense } from 'react';
import TutorProfileClient from './TutorProfileClient';

export default function TutorProfilePage() {
  return (
    <Suspense fallback={null}>
      <TutorProfileClient />
    </Suspense>
  );
}
