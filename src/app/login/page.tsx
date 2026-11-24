import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; confirmed?: string }> }) {
  const { next, confirmed } = await searchParams;
  return (
    <AuthShell title="Sign in" intro={confirmed ? "Your email is confirmed. Sign in to continue." : "Welcome back to HandiLearn."}>
      <LoginForm next={next?.startsWith("/") ? next : "/account"} />
    </AuthShell>
  );
}
