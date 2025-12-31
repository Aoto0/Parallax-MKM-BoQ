# Deployment Guide - Parallax MKM BoQ Generator

## Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager
- OpenAI API key (optional, works in demo mode without it)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aoto0/Parallax-MKM-BoQ.git
   cd Parallax-MKM-BoQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   AI_API_KEY=your_openai_api_key_here
   AI_MODEL=gpt-4-vision-preview
   MAX_FILE_SIZE=10485760
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser to: http://localhost:3000

## Production Deployment

### Option 1: Traditional Server (Linux/Ubuntu)

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and setup**
   ```bash
   git clone https://github.com/Aoto0/Parallax-MKM-BoQ.git
   cd Parallax-MKM-BoQ
   npm install --production
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

4. **Run with PM2 (process manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name boq-generator
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx reverse proxy** (optional)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  boq-generator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AI_API_KEY=${AI_API_KEY}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku create boq-generator
heroku config:set AI_API_KEY=your_key_here
git push heroku main
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel
vercel
```

#### AWS EC2
1. Launch EC2 instance (Ubuntu 22.04)
2. Follow traditional server setup
3. Configure security groups (port 80/443)
4. Setup SSL with Let's Encrypt

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `AI_API_KEY` | OpenAI API key | - | No (demo mode) |
| `AI_API_ENDPOINT` | AI API endpoint | OpenAI | No |
| `AI_MODEL` | AI model name | gpt-4-vision-preview | No |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 10485760 | No |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | image/jpeg,image/png,application/pdf | No |

## Rate Limiting

The application includes built-in rate limiting:
- Upload endpoint: 10 requests per 15 minutes per IP
- API endpoints: 100 requests per 15 minutes per IP

These can be adjusted in `server.js`.

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Logs (PM2)
```bash
pm2 logs boq-generator
```

### Disk Usage
Monitor the `uploads/` directory for disk space usage.

## Backup

Important files to backup:
- `.env` - Configuration
- `uploads/` - Uploaded building plans
- `config/boqPrompt.json` - Custom AI prompts

## Security Considerations

1. **API Key Protection**: Never commit `.env` to version control
2. **HTTPS**: Use SSL/TLS in production (Let's Encrypt)
3. **File Uploads**: Monitor uploads directory size
4. **Rate Limiting**: Adjust based on your needs
5. **Regular Updates**: Keep dependencies updated (`npm audit`)

## Troubleshooting

### Server won't start
- Check if port 3000 is available: `lsof -i :3000`
- Verify Node.js version: `node --version`
- Check logs: `pm2 logs` or `npm start`

### Upload fails
- Check file size limits in `.env`
- Verify uploads directory permissions
- Check available disk space

### AI not working
- Verify AI_API_KEY is set correctly
- Check API quota/credits
- Review server logs for errors
- Test with demo mode (remove API key)

## Maintenance

### Update dependencies
```bash
npm update
npm audit fix
```

### Clear old uploads
```bash
find uploads/ -type f -mtime +30 -delete
```

### Restart service
```bash
pm2 restart boq-generator
```

## Support

For issues, please open a GitHub issue or contact support.
