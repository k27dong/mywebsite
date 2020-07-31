docker build --no-cache -f .kube/Dockerfile.flask.deploy -t gcr.io/${PROJECT_ID}/mywebsite-flask .
docker build --no-cache -f .kube/Dockerfile.nginx.deploy -t gcr.io/${PROJECT_ID}/mywebsite-nginx .
docker push gcr.io/${PROJECT_ID}/mywebsite-flask
docker push gcr.io/${PROJECT_ID}/mywebsite-nginx
cd .kube/
gcloud builds submit --project=${PROJECT_ID} --config cloudbuild.yaml
cd ../
kubectl rollout restart deployment/flask
kubectl rollout restart deployment/ui