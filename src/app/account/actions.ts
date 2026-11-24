"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateName(formData: FormData) {
  const name = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !name) return;
  await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
  revalidatePath("/account");
}
