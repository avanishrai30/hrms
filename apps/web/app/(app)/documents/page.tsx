"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { EmployeeDocumentView, EssDocumentType } from "@vc-wms/shared-types";

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<EmployeeDocumentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<EssDocumentType>("PAN");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileBase64, setUploadFileBase64] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");

  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      const res = await apiRequest<EmployeeDocumentView[]>("/documents");
      setDocuments(res);
      saveOfflineData("documents_list", res);
    } catch (err: unknown) {
      const cached = getOfflineData<EmployeeDocumentView[]>("documents_list");
      if (cached) {
        setDocuments(cached);
      } else {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load documents"
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1] || "";
      setUploadFileBase64(base64String);
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFileName) {
      setStatusMsg({ type: "error", text: "Please select a file to upload" });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    try {
      await apiRequest<EmployeeDocumentView>("/documents", {
        method: "POST",
        body: JSON.stringify({
          documentType: uploadType,
          title: uploadTitle || uploadFileName,
          fileName: uploadFileName,
          fileBase64: uploadFileBase64,
          mimeType: "application/pdf",
          expiryDate: uploadExpiry || undefined
        })
      });

      setStatusMsg({ type: "success", text: "Document uploaded to vault successfully!" });
      setShowUploadModal(false);
      setUploadTitle("");
      setUploadFileName("");
      setUploadFileBase64("");
      setUploadExpiry("");
      loadDocuments();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload document"
      });
    } finally {
      setUploading(false);
    }
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesType = filterType === "ALL" || doc.documentType === filterType;
    const matchesSearch =
      !search ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Document Vault</h1>
          <p className="text-sm text-zinc-500">
            Secure vault for statutory KYC IDs, joining letters, tax forms, and certificates
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          ➕ Upload Document
        </Button>
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

      {/* Filters Bar */}
      <Panel className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search by title or filename..."
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            "ALL",
            "PAN",
            "AADHAAR",
            "PASSPORT",
            "OFFER_LETTER",
            "PAYSLIP",
            "TAX_DOCUMENT",
            "CERTIFICATE"
          ].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                filterType === type
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-zinc-700 hover:bg-muted"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </Panel>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Panel key={doc.id} className="p-6 space-y-4 hover:border-primary/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-control bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    📄
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 text-sm">{doc.title}</h4>
                    <p className="text-xs text-zinc-500">{doc.fileName}</p>
                  </div>
                </div>
                <Badge tone={doc.isVerified ? "success" : "neutral"}>
                  {doc.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 border-t border-border/50 pt-3">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-semibold text-zinc-900">{doc.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size</span>
                  <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                </div>
                {doc.expiryDate && (
                  <div className="flex justify-between">
                    <span>Expiry</span>
                    <span className={doc.isExpiringSoon ? "text-rose-600 font-semibold" : ""}>
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/40">
                <Link href={`/documents/${doc.id}` as Route}>
                  <Button variant="secondary" className="text-xs">
                    View Details
                  </Button>
                </Link>
                {doc.downloadUrl && (
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Download File ↗
                  </a>
                )}
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="p-12 text-center space-y-3">
          <span className="text-4xl">📁</span>
          <h3 className="text-base font-semibold text-zinc-900">No Documents in Vault</h3>
          <p className="text-sm text-zinc-500">Upload your KYC records, certificates, and compliance docs.</p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            Upload Document Now
          </Button>
        </Panel>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Panel className="max-w-lg w-full p-6 space-y-6 bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-zinc-900">Upload Document to Vault</h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Document Category</label>
                <select
                  value={uploadType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUploadType(e.target.value as EssDocumentType)}
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[
                    "PAN",
                    "AADHAAR",
                    "PASSPORT",
                    "DRIVING_LICENSE",
                    "OFFER_LETTER",
                    "APPOINTMENT_LETTER",
                    "PAYSLIP",
                    "TAX_DOCUMENT",
                    "CERTIFICATE",
                    "CUSTOM"
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Document Display Title</label>
                <Input
                  value={uploadTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadTitle(e.target.value)}
                  placeholder="e.g. My PAN Card"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Select File (PDF / Image)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelected}
                  className="w-full text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-control file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Document Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={uploadExpiry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadExpiry(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
