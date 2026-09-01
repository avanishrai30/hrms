"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface VaultDocument {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
  isVerified: boolean;
  uploadedAt: string;
  verifiedAt?: string;
  expiryDate?: string;
}

export default function EssDocumentsPage() {
  const [docs, setDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("PAN");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        setLoading(true);
        const res = await apiRequest<VaultDocument[]>("/documents");
        setDocs(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      await apiRequest("/documents", {
        method: "POST",
        body: JSON.stringify({
          title,
          documentType,
          fileName: fileName || `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          mimeType: "application/pdf",
          metadata: { uploadedVia: "ESS_VAULT" }
        })
      });
      setShowUploadModal(false);
      setTitle("");
      setFileName("");
      const res = await apiRequest<VaultDocument[]>("/documents");
      setDocs(res || []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Document Vault</h1>
          <p className="text-sm text-muted-foreground">
            Secure multi-tenant repository for verified government IDs, offer letters, and qualifications.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Button onClick={() => setShowUploadModal(true)}>+ Upload Document</Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
      ) : docs.length === 0 ? (
        <Panel className="p-8 text-center text-muted-foreground">
          No documents uploaded yet. Add your KYC or tax documents here.
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Panel key={doc.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-primary">{doc.documentType.replace(/_/g, " ")}</span>
                <Badge tone={doc.isVerified ? "success" : "warning"}>
                  {doc.isVerified ? "Verified" : "Pending Verification"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{doc.title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{doc.fileName}</p>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between items-center">
                <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                <button
                  onClick={() => alert(`Downloading ${doc.fileName}...`)}
                  className="text-primary hover:underline font-medium"
                >
                  Download
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Upload to Document Vault</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                >
                  <option value="PAN">PAN Card</option>
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="CERTIFICATE">Educational / Professional Certificate</option>
                  <option value="CUSTOM">Other Document</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Aadhaar Card Copy"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">File Name / Reference</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. aadhaar_front_back.pdf"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
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
