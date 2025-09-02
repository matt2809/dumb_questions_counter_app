# 🚀 IdioQ Production Deployment Guide

This guide explains how to containerize and deploy your IdioQ app to production using Docker.

## 📋 Prerequisites

- Docker installed on your development machine
- Docker Hub account
- Convex project deployed to production
- Server with Docker installed (for production deployment)

## 🏗️ Building the Docker Image

### 1. Update Docker Configuration

First, edit the `deploy.sh` script and update the `DOCKER_USERNAME` variable with your Docker Hub username:

```bash
DOCKER_USERNAME="your-actual-dockerhub-username"
```

### 2. Build and Push to Docker Hub

```bash
# Make the script executable
chmod +x deploy.sh

# Build and push (defaults to 'latest' tag)
./deploy.sh

# Or specify a version
./deploy.sh v1.0.0
```

This will:
- Build the Docker image
- Tag it with your version
- Push it to Docker Hub

## 🐳 Running in Production

### Option 1: Docker Run (Simple)

```bash
# Pull the image
docker pull your-username/idioq:latest

# Run the container
docker run -d \
  --name idioq-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  your-username/idioq:latest
```

### Option 2: Docker Compose (Recommended)

1. Create a `.env.production` file based on `env.example` and update the Convex URL
2. Run with docker-compose:

```bash
docker-compose up -d
```

## ⚙️ Environment Configuration

Create a `.env.production` file with your production settings:

```bash
# Convex Production URL
VITE_CONVEX_URL=https://your-production-convex-deployment.convex.cloud

# App Configuration
NODE_ENV=production
PORT=3000
```

## 🔧 Production Considerations

### 1. Convex Configuration
- Deploy your Convex functions to production
- Update the `VITE_CONVEX_URL` in your environment file
- Ensure your Convex deployment is accessible from your production server

### 2. Security
- The app runs as a non-root user inside the container
- Expose only port 3000
- Use environment variables for sensitive configuration

### 3. Monitoring
- Health checks are configured in docker-compose
- Container will restart automatically on failure
- Monitor logs: `docker logs idioq-app`

## 📱 Accessing Your App

Once deployed, your app will be available at:
- **Local**: http://localhost:3000
- **Production**: http://your-server-ip:3000

## 🚀 Scaling and Load Balancing

For production use, consider:
- Using a reverse proxy (nginx, traefik)
- Setting up SSL/TLS certificates
- Load balancing across multiple instances
- Using Docker Swarm or Kubernetes for orchestration

## 🔄 Updating the App

To update your production deployment:

```bash
# Pull the latest image
docker pull your-username/idioq:latest

# Restart the container
docker restart idioq-app

# Or recreate with docker-compose
docker-compose pull
docker-compose up -d
```

## 📊 Monitoring and Logs

```bash
# View logs
docker logs -f idioq-app

# Check container status
docker ps

# Monitor resource usage
docker stats idioq-app
```

## 🆘 Troubleshooting

### Common Issues:

1. **Port already in use**: Change the port mapping in docker-compose.yml
2. **Environment variables not loading**: Ensure `.env.production` exists and is readable
3. **Convex connection issues**: Verify your production Convex URL is correct
4. **Permission errors**: Ensure Docker has proper permissions on your server

### Debug Commands:

```bash
# Enter the container
docker exec -it idioq-app sh

# Check environment variables
docker exec idioq-app env

# Test the app from inside the container
docker exec idioq-app wget -qO- http://localhost:3000
```

## 🎯 Next Steps

After successful deployment:
1. Set up a domain name and SSL certificates
2. Configure monitoring and alerting
3. Set up automated backups
4. Implement CI/CD pipeline for automated deployments

---

**Happy Deploying! 🎉**

