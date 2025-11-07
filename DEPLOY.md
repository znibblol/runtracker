# Deployment-guide för Runtracker

Denna guide beskriver hur du deployar Runtracker-appen i Docker på din lokala server.

## Förutsättningar

- Docker och Docker Compose installerat på servern
- Åtkomst till servern via SSH eller direkt

## Snabbstart med Docker Compose

### 1. Kopiera projektet till servern

```bash
# Om du har git på servern
git clone <repository-url> /path/to/runtracker

# Eller kopiera filerna med scp
scp -r /path/to/local/runtracker user@server:/path/to/runtracker
```

### 2. Bygg och starta containern

```bash
cd /path/to/runtracker

# Bygg och starta i bakgrunden
docker-compose up -d --build
```

### 3. Öppna appen

Appen körs nu på port 3001:
- Från samma maskin: `http://localhost:3001`
- Från andra enheter i nätverket: `http://<server-ip>:3001`

## Manuell Docker-användning (utan Compose)

Om du föredrar att köra Docker direkt:

```bash
# Bygg imagen
docker build -t runtracker .

# Skapa volumes för persistent data
mkdir -p uploads data

# Kör containern
docker run -d \
  --name runtracker \
  -p 3001:3001 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  runtracker
```

## Hantera containern

```bash
# Visa status
docker-compose ps

# Visa loggar
docker-compose logs -f

# Stoppa containern
docker-compose down

# Starta om
docker-compose restart

# Uppdatera efter kodändringar
docker-compose up -d --build
```

## Persistent data

Data lagras i två mappar som mappas utanför containern:

- `./uploads/` - Uppladdade bilder
- `./data/` - SQLite-databas (runtracker.db)

Dessa mappar behålls även när containern tas bort, så din data är säker.

## Backup

För att backa upp din data:

```bash
# Skapa backup-mapp
mkdir -p backups/$(date +%Y%m%d)

# Kopiera data
cp -r uploads/ backups/$(date +%Y%m%d)/
cp -r data/ backups/$(date +%Y%m%d)/
```

## Ändra port

Om du vill köra appen på en annan port, ändra i `docker-compose.yml`:

```yaml
ports:
  - "8080:3001"  # Ändra från 3001 till önskad port
```

## Felsökning

### Containern startar inte

```bash
# Kontrollera loggar
docker-compose logs

# Kontrollera att porten inte används
netstat -tuln | grep 3001
```

### Kan inte komma åt appen från andra enheter

- Kontrollera att serverns firewall tillåter port 3001
- Verifiera att containern körs: `docker-compose ps`
- Kontrollera serverns IP-adress: `ip addr` eller `hostname -I`

### Uppladdningar fungerar inte

```bash
# Kontrollera att uploads-mappen har rätt rättigheter
chmod 755 uploads
```

## Produktionstips

### Använd omvänd proxy (Nginx/Traefik)

För produktion rekommenderas en omvänd proxy med HTTPS:

```nginx
server {
    listen 80;
    server_name runtracker.local;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Automatisk start vid omstart

Docker Compose-konfigurationen inkluderar `restart: unless-stopped`, vilket gör att containern startar automatiskt efter en omstart av servern.

### Uppdateringar

```bash
# Hämta senaste koden
git pull

# Bygg om och starta om
docker-compose up -d --build
```

## Säkerhet

- Appen kör på port 3001 som standard - överväg att bara exponera den inom ditt lokala nätverk
- Databas och uploads lagras lokalt - säkerställ regelbundna backups
- Överväg att lägga till autentisering om appen ska vara tillgänglig utanför hemmanätverket
