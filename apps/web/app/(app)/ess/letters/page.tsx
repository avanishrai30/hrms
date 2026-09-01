"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface EmployeeLetterItem {
  id: string;
  letterType: string;
  title: string;
  renderedContent: string;
  status: string;
  issuedAt?: string;
  createdAt: string;
}

export default function EssLettersPage() {
  const [letters, setLetters] = useState<EmployeeLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<EmployeeLetterItem | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [letterType, setLetterType] = useState("EMPLOYMENT_CONFIRMATION");
  const [customNotes, setCustomNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadLetters() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeLetterItem[]>("/letters");
        setLetters(res || []);
        if (res && res.length > 0) setSelectedLetter(res[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLetters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const newLetter = await apiRequest<EmployeeLetterItem>("/letters/generate", {
        method: "POST",
        body: JSON.stringify({ letterType, customNotes })
      });
      setShowGenerateModal(false);
      setLetters((prev) => [newLetter, ...prev]);
      setSelectedLetter(newLetter);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to generate letter");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Letter Generator & Vault</h1>
          <p className="text-sm text-muted-foreground">
            Generate and download digitally verified employment, salary, experience, and address proof letters.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Button onClick={() => setShowGenerateModal(true)}>+ Generate New Letter</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground">Issued Letters ({letters.length})</h3>
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading letters...</div>
          ) : letters.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No letters generated yet. Click above to create one.
            </div>
          ) : (
            <div className="space-y-2">
              {letters.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLetter(l)}
                  className={`w-full text-left p-3 rounded border text-sm transition-all ${
                    selectedLetter?.id === l.id
                      ? "border-primary bg-primary/5 font-semibold"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-primary font-bold">{l.letterType.replace(/_/g, " ")}</span>
                    <Badge tone="success">{l.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-2 space-y-4">
          {selectedLetter ? (
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedLetter.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Generated on {new Date(selectedLetter.createdAt).toLocaleString()} • Digitally Signed
                  </p>
                </div>
                <Button onClick={() => window.print()} variant="secondary">
                  🖨️ Print / Download PDF
                </Button>
              </div>
              <div className="mt-6 p-6 bg-muted/20 border border-border rounded whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {selectedLetter.renderedContent}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Select a letter from the left panel to preview its contents.
            </div>
          )}
        </Panel>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Generate Official HR Letter</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Letter Type</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                >
                  <option value="EMPLOYMENT_CONFIRMATION">Employment Confirmation Letter</option>
                  <option value="SALARY_CERTIFICATE">Salary & Compensation Certificate</option>
                  <option value="EXPERIENCE_LETTER">Experience & Service Certificate</option>
                  <option value="PROMOTION_LETTER">Promotion & Appraisal Letter</option>
                  <option value="ADDRESS_PROOF">Address Proof Verification</option>
                  <option value="INTERNSHIP_LETTER">Internship Completion Certificate</option>
                  <option value="RELIEVING_LETTER">Relieving & Clearance Certificate</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Purpose / Custom Notes (Optional)</label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. For HDFC Bank Home Loan Application"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating ? "Generating..." : "Generate Letter"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
