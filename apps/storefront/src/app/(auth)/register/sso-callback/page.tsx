'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SSOCallbackInner() {
  const params = useSearchParams();

  let redirectTo = '/cart';
  const raw = params.get('redirect_url');
  if (raw) {
    try {
      redirectTo = new URL(raw).pathname;
    } catch {
      redirectTo = raw;
    }
  }

  return (
    <AuthenticateWithRedirectCallback
      afterSignInUrl={redirectTo}
      afterSignUpUrl={redirectTo}
    />
  );
}

export default function RegisterSSOCallback() {
  return (
    <Suspense>
      <SSOCallbackInner />
    </Suspense>
  );
}
