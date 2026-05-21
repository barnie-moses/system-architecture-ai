import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signInPath, signUpPath } from "@/lib/auth-routes";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthPageShell
      description="Start with a prompt, collaborate on the graph, and keep every generated artifact tied to the project workspace."
      title="Move from idea to system design faster."
    >
      <SignUp
        appearance={clerkAppearance}
        path={signUpPath}
        routing="path"
        signInUrl={signInPath}
      />
    </AuthPageShell>
  );
}
