import { SecurityClient } from "./security-client";

export const metadata = { title: "Two-factor sign-in" };

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ required?: string; next?: string }> }) {
  const { required, next } = await searchParams;
  return <SecurityClient required={!!required} next={next?.startsWith("/") ? next : null} />;
}
