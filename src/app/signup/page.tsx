import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Create an account" intro="Parents and guardians start here. Teachers and school staff: sign up, then your administrator gives you access.">
      <SignupForm next={next?.startsWith("/") ? next : "/account"} />
    </AuthShell>
  );
}
