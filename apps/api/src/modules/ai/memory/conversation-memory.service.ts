import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class ConversationMemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(
    tenantId: string,
    userId: string,
    conversationId?: string,
    contextType = "GENERAL"
  ) {
    if (conversationId) {
      const existing = await this.prisma.aiConversation.findFirst({
        where: { id: conversationId, tenantId, userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 30
          }
        }
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.aiConversation.create({
      data: {
        tenantId,
        userId,
        title: "New Conversation",
        contextType
      },
      include: {
        messages: true
      }
    });
  }

  async appendMessage(
    tenantId: string,
    conversationId: string,
    data: {
      role: "USER" | "ASSISTANT" | "SYSTEM";
      content: string;
      intent?: string | null;
      dataPayload?: Record<string, unknown> | null;
      tokensUsed?: number;
      modelUsed?: string | null;
    }
  ) {
    // If it's the first user message, update the conversation title intelligently
    if (data.role === "USER") {
      const titleCandidate = data.content.slice(0, 48).trim();
      await this.prisma.aiConversation.update({
        where: { id: conversationId },
        data: {
          title: titleCandidate || "HR Query",
          updatedAt: new Date()
        }
      });
    }

    return this.prisma.aiMessage.create({
      data: {
        tenantId,
        conversationId,
        role: data.role,
        content: data.content,
        intent: data.intent ?? null,
        dataPayload: (data.dataPayload ?? undefined) as Prisma.InputJsonValue | undefined,
        tokensUsed: data.tokensUsed ?? 0,
        modelUsed: data.modelUsed ?? null
      }
    });
  }

  async listConversations(tenantId: string, userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { tenantId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 50
    });
  }

  async getConversation(tenantId: string, userId: string, conversationId: string) {
    const conv = await this.prisma.aiConversation.findFirst({
      where: { id: conversationId, tenantId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
    if (!conv) {
      throw new NotFoundException("Conversation not found.");
    }
    return conv;
  }

  async deleteConversation(tenantId: string, userId: string, conversationId: string) {
    const existing = await this.prisma.aiConversation.findFirst({
      where: { id: conversationId, tenantId, userId }
    });
    if (!existing) {
      throw new NotFoundException("Conversation not found.");
    }

    await this.prisma.aiMessage.deleteMany({ where: { conversationId } });
    await this.prisma.aiConversation.delete({ where: { id: conversationId } });
    return { success: true, message: "Conversation deleted successfully." };
  }
}
