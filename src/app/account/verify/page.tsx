import { VerifyClient } from "./verify-client";

export const metadata = { title: "Enter your code" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <VerifyClient next={next?.startsWith("/") ? next : "/admin"} />;
}
