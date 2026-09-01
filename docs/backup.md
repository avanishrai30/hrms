# Automated Backup & Recovery Policy — VC Organics HRMS

## 1. Automated PostgreSQL Daily Snapshots

Automated cron script `/opt/vc-hrms/scripts/db-backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/hrms"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Execute pg_dump from container
docker compose exec -T postgres pg_dump -U hrms_admin -d vc_hrms_prod | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Retain 30 days of daily backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/vc-hrms/scripts/db-backup.sh >> /var/log/hrms-backup.log 2>&1
```

---

## 2. Point-in-Time Database Restore

```bash
# Decompress and stream SQL into the running PostgreSQL container
gunzip -c /var/backups/hrms/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U hrms_admin -d vc_hrms_prod
```
