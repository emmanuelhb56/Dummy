"use server"

export async function getChatwootConfig() {
  return {
    websiteToken: process.env.CHATWOOT_WEBSITE_TOKEN,
    baseUrl: "https://app.chatwoot.com",
  }
}
