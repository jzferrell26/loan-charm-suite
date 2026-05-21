/**
 * Provision a Supabase Auth user (admin API — bypasses public signup password rules).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/provision-user.mjs
 *
 * Optional:
 *   PROVISION_EMAIL=jonathan@cuantico.us
 *   PROVISION_PASSWORD='password123!'
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path = ".env") {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // .env optional if vars are set in shell
  }
}

loadEnvFile();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.PROVISION_EMAIL || "jonathan@cuantico.us";
const password = process.env.PROVISION_PASSWORD || "password123!";

if (!url) {
  console.error("Missing SUPABASE_URL");
  process.exit(1);
}
if (!serviceRole) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Get it from Supabase Dashboard → Project Settings → API → service_role (secret).\n" +
      "Then run:\n" +
      "  SUPABASE_SERVICE_ROLE_KEY='your-key' node scripts/provision-user.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (found) {
  const { data, error } = await supabase.auth.admin.updateUserById(found.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("User exists but password update failed:", error.message);
    process.exit(1);
  }
  console.log("Updated existing user:", data.user.email, "(id:", data.user.id + ")");
  process.exit(0);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Create failed:", error.message);
  process.exit(1);
}

console.log("Created user:", data.user.email, "(id:", data.user.id + ")");
