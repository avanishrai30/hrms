# Tenant AI Isolation

AIavro AI features must follow the same tenant-isolation standard as application APIs.

## Isolation Requirements

- Prompts are tagged with trusted server-side tenant and user context.
- Conversation history is tenant-scoped.
- RAG indexes use tenant namespaces or mandatory tenant metadata filters.
- AI memory is tenant-scoped.
- Cached AI outputs include tenant and permission context in cache keys.
- Audit logs include tenant ID, user ID, action, prompt category, and tool activity metadata.
- Retrieved tenant documents are treated as untrusted input for prompt-injection defense.

## Access Rules

- Employees can ask about their own authorized data.
- Managers can ask about team data only when permitted.
- HR and payroll users require explicit permissions for broader data.
- AI cannot bypass server-side authorization by natural language request.

## Citations

Policy answers must cite approved tenant documents. If no approved source is available, the assistant must say so rather than inventing citations.
