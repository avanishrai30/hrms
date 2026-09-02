"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  AlertCircle,
  X,
  Send
} from "lucide-react";
import {
  useEmployeeDocuments,
  useUploadDocumentMutation,
  useDeleteDocumentMutation
} from "../../../lib/queries/use-ess-queries";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const DOCUMENT_CATEGORIES = [
  { value: "ALL", label: "All Documents" },
  { value: "IDENTITY", label: "Identity & KYC" },
  { value: "ACADEMIC", label: "Academic & Degrees" },
  { value: "EXPERIENCE", label: "Experience & Relieving" },
  { value: "TAX", label: "Tax & Compliance" },
  { value: "COMPANY_POLICY", label: "Company Policies" },
  { value: "PAYROLL", label: "Payroll & Compensation" }
];

export default function EmployeeDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [category, setCategory] = useState("IDENTITY");
  const [documentType] = useState("GENERAL_DOCUMENT");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: documents = [], isLoading, isError, refetch } = useEmployeeDocuments();
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) {
      setFormError("Please provide both a document name and file URL / cloud path.");
      return;
    }

    try {
      setFormError(null);
      await uploadMutation.mutateAsync({
        category,
        documentType,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim()
      });
      setIsUploadOpen(false);
      setFileName("");
      setFileUrl("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to upload document.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  const filteredDocs =
    selectedCategory === "ALL" ? documents : documents.filter((d) => d.category === selectedCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Vault</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Store, view, and manage verified employee credentials, identity proofs, and tax forms.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DOCUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-raised border border-border-subtle text-foreground-secondary hover:bg-surface-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Document Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
        </div>
      ) : isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Documents vault unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/30 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-panel bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{doc.fileName}</h3>
                    <p className="text-[10px] text-foreground-muted font-mono">{doc.category}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-pill bg-success/20 text-success text-[9px] font-bold shrink-0">
                  {doc.status || "VERIFIED"}
                </span>
              </div>

              <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[10px] text-foreground-muted font-mono">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                </span>

                <div className="flex items-center gap-2">
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-control hover:bg-surface-muted text-foreground-secondary transition"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-control hover:bg-danger/10 text-danger transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No documents in this category</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Upload a document to store it securely.</p>
        </div>
      )}

      {/* 4. Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Upload Employee Document</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DOCUMENT_CATEGORIES.filter((c) => c.value !== "ALL").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Document Name / Title</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Passport Copy or Degree Certificate"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">File URL / Storage Path</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="e.g. /uploads/docs/aadhaar_card.pdf"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted text-xs font-semibold text-foreground-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? "Uploading..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
