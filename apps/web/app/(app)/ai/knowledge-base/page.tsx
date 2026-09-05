import { redirect } from "next/navigation";

export default function AiKnowledgeBasePage() {
  redirect("/admin/business-context?tab=knowledge");
}
