# Production Observability & Monitoring Guide — VC Organics HRMS

## 1. Health Check Endpoints

- **API Liveness & Readiness**: `GET https://hrms.vcorganics.com/api/health`
- **Database & Cache Health**: `GET https://hrms.vcorganics.com/api/health/db`

---

## 2. Docker Logs & Real-Time Telemetry

```bash
# View API service streaming logs
docker compose logs -f api

# View Nginx access & security logs
docker compose logs -f nginx

# View Postgres queries
docker compose logs -f postgres
```

---

## 3. Metrics & Alert Thresholds

| Metric | Normal Range | Alert Threshold | Action |
| :--- | :--- | :--- | :--- |
| **API Response Time** | < 120ms | > 500ms | Scale Node instances / Check Slow Queries |
| **Postgres CPU** | < 35% | > 80% | Inspect active lock queries & connection pools |
| **Redis Memory** | < 500 MB | > 2 GB | Trigger Redis key eviction |
| **Failed Logins** | < 5 / hr | > 25 / hr | IP rate-limiting & SecOps audit |
