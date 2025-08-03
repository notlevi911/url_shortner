#!/bin/bash

echo "🚀 Deploying to Google Cloud Platform (Free Tier)!"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Please authenticate with gcloud first:"
    echo "   gcloud auth login"
    exit 1
fi

# Set variables
PROJECT_ID=$(gcloud config get-value project)
CLUSTER_NAME="url-shortener-cluster"
ZONE="us-central1-a"

echo "📋 Project ID: $PROJECT_ID"
echo "📋 Cluster Name: $CLUSTER_NAME"
echo "📋 Zone: $ZONE"

echo ""
echo "💰 Google Cloud Free Tier:"
echo "   ✅ $300 credit for new users"
echo "   ✅ GKE cluster: Free tier available"
echo "   ✅ Container Registry: Free tier"
echo "   ✅ Estimated cost: $0-50/month (with free tier)"
echo ""

echo "🔧 Step 1: Enable required APIs..."
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com

echo ""
echo "🐳 Step 2: Create GKE cluster (Free tier compatible)..."
gcloud container clusters create $CLUSTER_NAME \
  --zone=$ZONE \
  --num-nodes=1 \
  --machine-type=e2-micro \
  --disk-size=10 \
  --enable-autoscaling \
  --min-nodes=0 \
  --max-nodes=3

echo ""
echo "🔑 Step 3: Get cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE

echo ""
echo "📦 Step 4: Build and push Docker images..."
docker build -t gcr.io/$PROJECT_ID/my_saas-backend:latest ./backend
docker build -t gcr.io/$PROJECT_ID/my_saas-frontend:latest ./frontend

docker push gcr.io/$PROJECT_ID/my_saas-backend:latest
docker push gcr.io/$PROJECT_ID/my_saas-frontend:latest

echo ""
echo "📝 Step 5: Create Kubernetes secrets from environment variables..."
kubectl create secret generic oauth-secrets \
  --from-literal=GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-966653426429-jrlo4022aepn878ic4kfecokm44lv3s3.apps.googleusercontent.com}" \
  --from-literal=GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-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}" \
  --namespace=url-shortener

echo ""
echo "📋 Step 6: Apply Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

echo ""
echo "⏳ Step 7: Wait for deployment..."
kubectl wait --for=condition=ready pod -l app=mongodb -n url-shortener --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend -n url-shortener --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n url-shortener --timeout=300s

echo ""
echo "🌐 Step 8: Get external IPs..."
FRONTEND_IP=$(kubectl get svc frontend-service -n url-shortener -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
BACKEND_IP=$(kubectl get svc backend-service -n url-shortener -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://$FRONTEND_IP"
echo "   Backend API: http://$BACKEND_IP"
echo ""
echo "💰 Cost Information:"
echo "   ✅ Free tier: $300 credit for new users"
echo "   ✅ GKE cluster: ~$20-50/month (after free tier)"
echo "   ✅ Container Registry: Free tier available"
echo "   ✅ Estimated total: $0-50/month"
echo ""
echo "💡 Next steps:"
echo "   1. Set up a domain name"
echo "   2. Configure SSL certificates"
echo "   3. Update BASE_URL and VITE_API_BASE_URL with your domain"
echo "   4. Set up monitoring"
echo ""
echo "🔧 Useful commands:"
echo "   kubectl get pods -n url-shortener"
echo "   kubectl get svc -n url-shortener"
echo "   kubectl logs -n url-shortener deployment/frontend"
echo "   kubectl logs -n url-shortener deployment/backend"
echo ""
echo "💸 To minimize costs:"
echo "   - Use smaller machine types (e2-micro)"
echo "   - Set min-nodes=0 for auto-scaling"
echo "   - Monitor usage in Google Cloud Console" 