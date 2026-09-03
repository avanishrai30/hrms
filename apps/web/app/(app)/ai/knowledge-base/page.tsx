"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { AiKnowledgeChunkView, AiKnowledgeDocumentView } from "@vc-wms/shared-types";
import { AiNavBar } from "../components/ai-nav-bar";

export default function AiKnowledgeBasePage() {
  const [documents, setDocuments] = useState<AiKnowledgeDocumentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AiKnowledgeChunkView[]>([]);
  const [searching, setSearching] = useState(false);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("POLICY");
  const [newContent, setNewContent] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      const data = await apiRequest<AiKnowledgeDocumentView[]>("/ai/knowledge");
      setDocuments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load policy documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const results = await apiRequest<AiKnowledgeChunkView[]>("/ai/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery, topK: 4 })
      });
      setSearchResults(results);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setUploading(true);
      await apiRequest("/ai/knowledge/upload", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent
        })
      });
      setShowUploadModal(false);
      setNewTitle("");
      setNewContent("");
      await loadDocuments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this policy document?")) return;
    try {
      await apiRequest(`/ai/knowledge/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <AiNavBar />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Link href={"/ai" as Route} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              ← Back to Copilot
            </Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            Company Knowledge Base & Policy RAG
          </h1>
          <p className="text-sm text-neutral-500">
            Repository of verified HR policies, handbooks, and compliance rules indexed for Copilot semantic search.
          </p>
        </div>

        <Button onClick={() => setShowUploadModal(true)} variant="primary">
          + Add Policy Document
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Semantic Search Tester */}
      <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            🔍 RAG Semantic Search Explorer
          </h3>
          <p className="text-xs text-neutral-500">
            Test how the AI retrieves relevant policy chunks for employee inquiries.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="e.g. What happens if I take leave during notice period?"
            className="flex-1 bg-white dark:bg-neutral-900 text-sm"
          />
          <Button type="submit" variant="primary" disabled={searching || !searchQuery.trim()}>
            {searching ? "Searching..." : "Test Search"}
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Top Relevant Semantic Chunks ({searchResults.length}):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {chunk.documentTitle}
                    </span>
                    <Badge tone="success">Match Score: {chunk.similarityScore}</Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {chunk.content}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {chunk.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Document Library Table */}
      <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Indexed Policy Documents ({documents.length})
          </h3>
        </div>

        {loading ? (
          <div className="h-40 bg-neutral-100 dark:bg-neutral-800/40 rounded-xl animate-pulse" />
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-sm">
            No policy documents uploaded yet. Upload company handbooks or leave policies to enable RAG.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {documents.map((doc) => (
              <div key={doc.id} className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      {doc.title}
                    </span>
                    <Badge tone="neutral">{doc.category}</Badge>
                    <span className="text-xs text-neutral-400 font-mono">
                      {doc.chunkCount ?? 1} Chunks
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1 max-w-2xl">
                    {doc.content}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => void handleDelete(doc.id)}
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Panel className="max-w-2xl w-full p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Upload New Policy / Knowledge Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <Field label="Document Title">
                <Input
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  placeholder="e.g. Maternity & Parental Leave Policy 2026"
                  required
                />
              </Field>

              <Field label="Policy Category">
                <select
                  value={newCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                >
                  <option value="POLICY">General Policy</option>
                  <option value="LEAVE">Leave & Attendance</option>
                  <option value="COMPLIANCE">Statutory Compliance</option>
                  <option value="BENEFITS">Compensation & Benefits</option>
                  <option value="CODE_OF_CONDUCT">Code of Conduct</option>
                  <option value="CUSTOM">Custom Manual</option>
                </select>
              </Field>

              <Field label="Document Text / Policy Content (Markdown Supported)">
                <textarea
                  value={newContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                  rows={8}
                  placeholder="Paste complete policy clauses, eligibility criteria, and guidelines here..."
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-sans"
                  required
                />
              </Field>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={uploading}>
                  {uploading ? "Chunking & Indexing..." : "Upload & Vectorize"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
