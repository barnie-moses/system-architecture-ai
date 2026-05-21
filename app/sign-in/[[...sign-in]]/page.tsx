import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signInPath, signUpPath } from "@/lib/auth-routes";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthPageShell
      description="Describe a system in plain English and map it into a shared architecture canvas your team can refine together."
      title="Design architecture at the speed of thought."
    >
      <SignIn
        appearance={clerkAppearance}
        path={signInPath}
        routing="path"
        signUpUrl={signUpPath}
      />
    </AuthPageShell>
  );
}
