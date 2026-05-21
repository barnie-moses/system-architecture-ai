import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { editorPath, signInPath } from "@/lib/auth-routes";

export default async function Home() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    redirect(editorPath);
  }

  redirect(signInPath);
}
