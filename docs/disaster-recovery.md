# Disaster Recovery & Business Continuity Plan — VC Organics HRMS

## 1. Recovery Objectives

- **Recovery Time Objective (RTO)**: < 30 Minutes
- **Recovery Point Objective (RPO)**: < 24 Hours (Daily snapshot backup)

---

## 2. Failover Procedures

1. **Spin up standby KVM VPS instance** (or cloud server).
2. **Clone codebase**: `git clone https://github.com/avanishrai30/hrms.git /opt/vc-hrms`
3. **Restore latest encrypted off-site PostgreSQL dump**.
4. **Deploy production cluster**: `docker compose up --build -d`
5. **Update DNS A-Records** on Cloudflare / Route53 pointing `hrms.vcorganics.com` to the new VPS IP.
6. **Execute health validation tests**.
