"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Field, Input, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";
import { isOnline, queueOfflineAction } from "../../../../lib/offline-storage";

export default function NewExpensePage() {
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0");
  const [ocrText, setOcrText] = useState("");
  const [message, setMessage] = useState("");
  const [ocrPreview, setOcrPreview] = useState<unknown>(null);
  const createClaim = useMutation({ mutationFn: financeApi.createExpense, onSuccess: () => setMessage("Draft claim saved.") });
  const runOcr = useMutation({ mutationFn: financeApi.ocrReceipt, onSuccess: setOcrPreview });
  const payload = {
    employeeId,
    title,
    currency: "INR",
    items: [{
      category: "TRAVEL",
      description: title || "Expense item",
      amount: Number(amount || 0),
      taxAmount: 0,
      currency: "INR",
      expenseDate: new Date().toISOString(),
      receipts: []
    }]
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">New expense claim</h1>
        <p className="mt-1 text-sm text-zinc-600">Capture claim details, line items, GST, mileage, and receipt metadata.</p>
      </header>
      <Panel>
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Claim title"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Client visit expenses" /></Field>
            <Field label="Employee ID"><Input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} /></Field>
            <Field label="Amount"><Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" /></Field>
            <Field label="Receipt OCR text"><Input value={ocrText} onChange={(event) => setOcrText(event.target.value)} placeholder="Merchant: ... Total: INR ..." /></Field>
          </div>
          {ocrPreview ? <pre className="max-h-56 overflow-auto rounded-control bg-muted p-3 text-xs text-zinc-700">{JSON.stringify(ocrPreview, null, 2)}</pre> : null}
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => runOcr.mutate({ fileName: "receipt.png", fileType: "PNG", sourceText: ocrText })}>OCR preview</Button>
            <Button variant="secondary" type="button" onClick={() => {
              queueOfflineAction("/finance/expenses", "POST", payload);
              setMessage("Draft queued offline.");
            }}>Save offline draft</Button>
            <Button type="button" disabled={createClaim.isPending} onClick={() => {
              if (isOnline()) createClaim.mutate(payload);
              else {
                queueOfflineAction("/finance/expenses", "POST", payload);
                setMessage("Draft queued offline.");
              }
            }}>Save draft</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
