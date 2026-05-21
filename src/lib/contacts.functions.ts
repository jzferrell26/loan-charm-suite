import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONTACT_TYPES } from "./domain";

const NullableString = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : String(v)),
  z.string().nullable(),
);

const ContactInput = z.object({
  first_name: NullableString.optional(),
  last_name: NullableString.optional(),
  contact_type: z.enum(CONTACT_TYPES).nullable().optional(),
  company_name: NullableString.optional(),
  email: NullableString.optional(),
  phone: NullableString.optional(),
  address: NullableString.optional(),
});

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contacts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ContactInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contacts").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), patch: ContactInput }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contacts")
      .update(data.patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
