# Production Deployment Guide — VC Organics HRMS

## 1. Prerequisites (KVM VPS / Ubuntu 22.04 / 24.04 LTS)

- **Minimum Hardware Specs**: 4 vCPUs, 8 GB RAM, 100 GB NVMe SSD
- **Software Dependencies**: Docker Engine 24+, Docker Compose V2, Git

```bash
# Install Docker and Compose
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
```

---

## 2. Clone & Environment Setup

```bash
git clone https://github.com/avanishrai30/hrms.git /opt/vc-hrms
cd /opt/vc-hrms
cp production.env.example .env
nano .env # Set production passwords and API keys
```

---

## 3. SSL Certificate Setup (Let's Encrypt)

```bash
mkdir -p certbot/conf certbot/www
# Obtain certificate using certbot standalone or dockerized certbot
docker run -it --rm --name certbot \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d hrms.vcorganics.com --agree-tos --email admin@vcorganics.com
```

---

## 4. Launching the Multi-Container Cluster

```bash
# Build images and start all 5 services in detached mode
docker compose up --build -d

# Verify container health
docker compose ps
```

---

## 5. Database Migrations & Seeds

```bash
# Run Prisma migrations inside the API container
docker compose exec api npx prisma migrate deploy
```
