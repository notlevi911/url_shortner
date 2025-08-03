#!/bin/bash

echo "🚀 Deploying URL Shortener to Kubernetes!"
echo "=========================================="

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install it first."
    exit 1
fi

echo "📋 Step 1: Create namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "📋 Step 2: Create secrets from environment variables..."
# Create secrets from environment variables (set these in your shell)
kubectl create secret generic oauth-secrets \
  --from-literal=GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-966653426429-jrlo4022aepn878ic4kfecokm44lv3s3.apps.googleusercontent.com}" \
  --from-literal=GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-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}" \
  --namespace=url-shortener \
  --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "📋 Step 3: Apply Kubernetes manifests..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

echo ""
echo "⏳ Step 4: Wait for deployment..."
kubectl wait --for=condition=ready pod -l app=mongodb -n url-shortener --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend -n url-shortener --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n url-shortener --timeout=300s

echo ""
echo "🌐 Step 5: Get external IPs..."
FRONTEND_IP=$(kubectl get svc frontend-service -n url-shortener -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
BACKEND_IP=$(kubectl get svc backend-service -n url-shortener -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://$FRONTEND_IP"
echo "   Backend API: http://$BACKEND_IP"
echo ""
echo "🔧 Useful commands:"
echo "   kubectl get pods -n url-shortener"
echo "   kubectl get svc -n url-shortener"
echo "   kubectl logs -n url-shortener deployment/frontend"
echo "   kubectl logs -n url-shortener deployment/backend" 