"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { EmployeeDocumentView } from "@vc-wms/shared-types";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<EmployeeDocumentView | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeDocumentView>(`/documents/${resolvedParams.id}`);
        setDoc(res);
      } catch (err: unknown) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load document"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [resolvedParams.id]);

  async function handleVerify(status: boolean) {
    setVerifying(true);
    try {
      const updated = await apiRequest<EmployeeDocumentView>(`/documents/${resolvedParams.id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified: status, remarks: "Verified by administrator in document vault" })
      });
      setDoc((prev) => (prev ? { ...prev, isVerified: updated.isVerified } : null));
      setStatusMsg({ type: "success", text: `Document marked as ${status ? "Verified" : "Unverified"}` });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update verification status"
      });
    } finally {
      setVerifying(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await apiRequest(`/documents/${resolvedParams.id}`, { method: "DELETE" });
      router.push("/documents" as Route);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete document"
      });
    }
  }

  if (loading && !doc) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-28 bg-muted animate-pulse rounded-panel" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">{doc?.title}</h1>
          <p className="text-sm text-zinc-500">Document ID: {doc?.id}</p>
        </div>
        <Link href={"/documents" as Route}>
          <Button variant="secondary">← Back to Vault</Button>
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-control text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-700"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <Panel className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-control bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              📄
            </div>
            <div>
              <h3 className="font-semibold text-zinc-950 text-lg">{doc?.fileName}</h3>
              <p className="text-xs text-zinc-500">
                Uploaded on {doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
              </p>
            </div>
          </div>
          <Badge tone={doc?.isVerified ? "success" : "neutral"}>
            {doc?.isVerified ? "Verified Document" : "Verification Pending"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          <div className="space-y-3 sm:pr-4">
            <div className="flex justify-between">
              <span className="text-zinc-500">Document Type</span>
              <span className="font-semibold text-zinc-900">{doc?.documentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">File Size</span>
              <span>{((doc?.fileSize ?? 0) / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">MIME Format</span>
              <span>{doc?.mimeType}</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex justify-between">
              <span className="text-zinc-500">Expiry Date</span>
              <span className={doc?.isExpiringSoon ? "text-rose-600 font-semibold" : ""}>
                {doc?.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "No Expiry"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Verified By</span>
              <span>{doc?.verifiedByName || "Unverified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Verification Date</span>
              <span>{doc?.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : "--"}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            {doc?.downloadUrl && (
              <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary">⬇️ Download File</Button>
              </a>
            )}
            <Button variant="secondary" onClick={() => handleVerify(!doc?.isVerified)} disabled={verifying}>
              {doc?.isVerified ? "Mark Unverified" : "✓ Mark as Verified"}
            </Button>
          </div>

          <Button variant="danger" onClick={handleDelete}>
            🗑️ Delete Document
          </Button>
        </div>
      </Panel>
    </div>
  );
}
