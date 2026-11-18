import fs from "node:fs";

const env = {};
if (fs.existsSync(".env")) {
  fs.readFileSync(".env", "utf8").split("\n").forEach((l) => {
    const parts = l.trim().split("=");
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
}

const token = env.CLOUDFLARE_API_TOKEN;
const accountId = env.CLOUDFLARE_ACCOUNT_ID;

const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/plumbright/domains`, {
  headers: { Authorization: "Bearer " + token },
});
const data = await res.json();
console.log("Domains:", JSON.stringify(data.result?.map((d) => ({ name: d.name, status: d.status, verification: d.verification_data })), null, 2));

