"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  FolderOpen,
  AlertCircle,
  X,
  Send,
  Download,
  ShieldCheck
} from "lucide-react";
import {
  useEmployeeDocuments,
  useUploadDocumentMutation,
  useDeleteDocumentMutation
} from "../../../lib/queries/use-ess-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { apiRequest } from "../../../lib/api";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const DOCUMENT_TYPES = [
  { value: "ALL", label: "All Documents" },
  { value: "PAN", label: "PAN Card" },
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "OFFER_LETTER", label: "Offer Letter" },
  { value: "APPOINTMENT_LETTER", label: "Appointment Letter" },
  { value: "PAYSLIP", label: "Payslip Reference" },
  { value: "TAX_DOCUMENT", label: "Tax & Form 16" },
  { value: "CERTIFICATE", label: "Academic / Professional Certificate" },
  { value: "CUSTOM", label: "Other Document" }
];

export default function EmployeeDocumentsPage() {
  const gate = usePermissionGate(["documents.view", "ess.read"]);

  const [selectedType, setSelectedType] = useState("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [documentType, setDocumentType] = useState("PAN");
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: documents = [], isLoading, isError, refetch } = useEmployeeDocuments(gate.isAuthorized);
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) {
      setFormError("Please provide both a document title and file name.");
      return;
    }

    try {
      setFormError(null);
      await uploadMutation.mutateAsync({
        documentType,
        title: title.trim(),
        fileName: fileName.trim(),
        mimeType: "application/pdf"
      });
      setIsRegisterOpen(false);
      setTitle("");
      setFileName("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to register document.");
    }
  };

  const handleDownload = async (docId: string, docName: string) => {
    try {
      setActionError(null);
      setDownloadingId(docId);
      const res = await apiRequest<{ downloadUrl: string; fileName?: string }>(`/documents/${docId}/download`);
      if (!res?.downloadUrl) {
        throw new Error("No download URL returned from secure storage.");
      }
      const a = document.createElement("a");
      a.href = res.downloadUrl;
      a.download = res.fileName || docName || "document.pdf";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to retrieve secure document download URL.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this document record?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Document Vault Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`documents.view`) to access the document vault.
          </p>
        </div>
      </div>
    );
  }

  const filteredDocs =
    selectedType === "ALL" ? documents : documents.filter((d) => d.documentType === selectedType);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Vault</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Employee documents, identity records, and compliance files.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Document</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DOCUMENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedType(t.value)}
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition ${
              selectedType === t.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-raised border border-border-subtle text-foreground-secondary hover:bg-surface-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. Document Cards Grid */}
      {isError ? (
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
                    <h3 className="text-xs font-bold text-foreground truncate">{doc.title || doc.fileName}</h3>
                    <p className="text-[10px] text-foreground-muted font-mono">{doc.documentType}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-pill bg-success/20 text-success text-[9px] font-bold shrink-0">
                  {doc.isVerified ? "VERIFIED" : "PENDING"}
                </span>
              </div>

              <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[10px] text-foreground-muted font-mono">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    disabled={downloadingId === doc.id}
                    className="p-1.5 rounded-control hover:bg-surface-muted text-foreground-secondary transition disabled:opacity-50"
                    title="Download Secure Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-control hover:bg-danger/10 text-danger transition"
                    title="Delete Document Record"
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
          <p className="text-xs font-bold text-foreground">No documents found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Register a new document record to track verification.</p>
        </div>
      )}

      {/* 4. Register Document Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Register Employee Document</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DOCUMENT_TYPES.filter((t) => t.value !== "ALL").map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aadhaar Card Front & Back or Master Degree"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">File Reference Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. aadhaar_card.pdf"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted text-xs font-semibold text-foreground-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? "Registering..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Record
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
