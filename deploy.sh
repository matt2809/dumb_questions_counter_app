#!/bin/bash

# IdioQ Docker Deployment Script
# Usage: ./deploy.sh [version]

set -e

# Configuration
DOCKER_USERNAME="automtt"
IMAGE_NAME="idioq"
VERSION=${1:-latest}

echo "🚀 Building IdioQ Docker image..."

# Build the Docker image
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$VERSION .
docker tag $DOCKER_USERNAME/$IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest

echo "✅ Image built successfully!"
echo "📦 Pushing to Docker Hub..."

# Push to Docker Hub
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest

echo "🎉 Successfully pushed $DOCKER_USERNAME/$IMAGE_NAME:$VERSION to Docker Hub!"
echo ""
echo "To run on another server:"
echo "docker pull $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo "docker run -d -p 3000:3000 --env-file .env.local $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo ""
echo "Or use docker-compose:"
echo "docker-compose up -d"
