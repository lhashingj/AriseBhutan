import { Suspense } from 'react';
import FlightSchedule from '@/components/FlightSchedule';

export const metadata = {
  title: 'Drukair & Bhutan Airlines Flight Schedule | Arise Bhutan',
  description: 'Search real Druk Air and Bhutan Airlines flight times to and from Paro International Airport to plan your journey to Bhutan.',
};

export default function FlightSchedulePage() {
  return (
    <main>
      <Suspense fallback={null}>
        <FlightSchedule />
      </Suspense>
    </main>
  );
}
