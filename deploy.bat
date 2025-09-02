@echo off
REM IdioQ Docker Deployment Script for Windows
REM Usage: deploy.bat [version]

setlocal enabledelayedexpansion

REM Configuration
set DOCKER_USERNAME=automtt
set IMAGE_NAME=idioq
set VERSION=%1
if "%VERSION%"=="" set VERSION=latest

echo 🚀 Building IdioQ Docker image...

REM Build the Docker image (force fresh build)
docker build --no-cache -t %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% .
docker tag %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% %DOCKER_USERNAME%/%IMAGE_NAME%:latest

echo ✅ Image built successfully!
echo 📦 Pushing to Docker Hub...

REM Push to Docker Hub
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:latest

echo 🎉 Successfully pushed %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% to Docker Hub!
echo.
echo To run on another server:
echo docker pull %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
echo docker run -d -p 3000:3000 --env-file .env.production %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
echo.
echo Or use docker-compose:
echo docker-compose up -d

pause
