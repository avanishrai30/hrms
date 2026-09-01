export function tenantCacheKey(tenantId: string, module: string, key: string): string {
  return `tenant:${tenantId}:${module}:${key}`;
}

export function tenantObjectKey(tenantId: string, category: string, entityId: string, fileId: string): string {
  return `tenants/${tenantId}/${category}/${entityId}/${fileId}`;
}

export function assertTenantScopedPath(tenantId: string, objectKey: string): void {
  if (!objectKey.startsWith(`tenants/${tenantId}/`)) {
    throw new Error("Object key is outside the active tenant scope.");
  }
}

