"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  readTime: string;
}

export default function CompanyNewsPage() {
  const [news] = useState<NewsArticle[]>([
    {
      id: "1",
      title: "VC Organics Achieves Record Annual Growth in Q3 2026",
      category: "BUSINESS_MILESTONE",
      summary: "Our supply chain efficiency and digital HR automation reached landmark milestones this quarter.",
      publishedAt: "30 Aug 2026",
      readTime: "3 min read"
    },
    {
      id: "2",
      title: "Annual Wellness & Innovation Hackathon Announced",
      category: "EVENTS",
      summary: "Join us for 48 hours of collaborative problem-solving, prizes, and company-wide pitch sessions.",
      publishedAt: "25 Aug 2026",
      readTime: "2 min read"
    },
    {
      id: "3",
      title: "New Corporate Health & Insurance Policy Upgrades",
      category: "BENEFITS",
      summary: "Enhanced OPD coverage, mental health support, and dependent parental insurance terms now live.",
      publishedAt: "15 Aug 2026",
      readTime: "4 min read"
    }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company News & Highlights</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with enterprise milestones, product launches, culture events, and executive newsletters.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/communications" as Route}>
            <Button variant="secondary">Back to Broadcasts</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <Panel key={item.id} className="space-y-4">
            <div className="flex justify-between items-start">
              <Badge tone="neutral">{item.category.replace(/_/g, " ")}</Badge>
              <span className="text-xs text-muted-foreground">{item.readTime}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{item.summary}</p>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between">
              <span>{item.publishedAt}</span>
              <span className="text-primary font-medium cursor-pointer hover:underline">Read Full Story →</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
