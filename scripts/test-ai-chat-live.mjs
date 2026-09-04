import { execSync } from "child_process";

async function testLiveAiChat() {
  const password = execSync(
    'ssh -i ~/.ssh/hrms_vps_chatgpt root@200.234.34.130 "grep ^BOOTSTRAP_PASSWORD= /opt/vc-hrms/.env | cut -d= -f2-"',
    { encoding: "utf-8" }
  ).trim();

  // 1. Login to get access token & tenant context
  const loginRes = await fetch("https://api-hrms.vcorganics.com/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantSlug: "vc-organics",
      identifier: "owner@vcorganics.com",
      password,
      deviceFingerprint: "cli-smoke-tester"
    })
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const tenantId = loginData.user?.tenantId || loginData.user?.memberships?.[0]?.tenantId;
  console.log("Logged in successfully. User email:", loginData.user?.email);

  // 2. Call /ai/chat
  const t0 = Date.now();
  const chatRes = await fetch("https://api-hrms.vcorganics.com/api/v1/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      prompt: "What are our official company working hours and attendance policies?",
      contextType: "GENERAL"
    })
  });

  const durationMs = Date.now() - t0;
  console.log("Chat response HTTP status:", chatRes.status, `(${durationMs}ms)`);

  if (!chatRes.ok) {
    console.error("Chat request failed:", await chatRes.text());
    process.exit(1);
  }

  const chatData = await chatRes.json();
  console.log("\n--- AI Response Received ---");
  console.log("Role:", chatData.role);
  console.log("Model Used:", chatData.modelUsed || "Ollama Gateway");
  console.log("Content Preview:", chatData.content?.substring(0, 300));
  console.log("Tokens Used:", chatData.tokensUsed);
  console.log("Conversation ID:", chatData.conversationId);
  console.log("Sources:", chatData.sources?.length || 0);
  console.log("----------------------------\n");
}

testLiveAiChat().catch(console.error);
