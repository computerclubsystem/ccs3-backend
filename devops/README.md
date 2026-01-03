# Kubernetes configuration

## Namespace
- Create Kubernetes namespace for CCS3:
```bash
kubectl create namespace ccs3
```
- Every time Kubernetes is started, you must switch to the `ccs3` namespace so every `kubectl` command executes in the `ccs3` namespace:
```bash
kubectl config set-context --current --namespace ccs3
```

## Secrets
The following secrets must be provided to the Kubernetes namespace `ccs3` created for the CCS3 cluster:
- `nginx-certs` - this is a secret containing the two .crt and .key files for the Nginx static files service to operate. Create certificate files as described in `certificates/README.md` and provide them as secret in the Kubernetes `ccs3` namespace:
```bash
kubectl create secret generic nginx-certs --from-file=ccs3-static-files-service.crt --from-file=ccs3-static-files-service.key
```
- `pc-connector-certs` - this is a secret containing the two .crt and one .key files for the pc-connector service to operate. These are the .crt and .key files of the pc-connector and the .crt file of the certificate issuer. Create certificate files as described in `certificates/README.md` and provide them as secret in the Kubernetes `ccs3` namespace:
```bash
kubectl create secret generic pc-connector-certs --from-file=ccs3-pc-connector.crt --from-file=ccs3-pc-connector.key  --from-file=ccs3-ca.crt
```
- `operator-connector-certs` - this is a secret containing the two .crt and one .key files for the operator-connector service to operate. These are the .crt and .key files of the operator-connector and the .crt file of the certificate issuer. Create certificate files as described in `certificates/README.md` and provide them as secret in the Kubernetes `ccs3` namespace:
```bash
kubectl create secret generic operator-connector-certs --from-file=ccs3-operator-connector.crt --from-file=ccs3-operator-connector.key --from-file=ccs3-ca.crt
```
- `qrcode-signin-certs` - this is a secret containing the two .crt and one .key files for the qrcode-signin service to operate. These are the .crt and .key files of the qrcode-signin and the .crt file of the certificate issuer. Create certificate files as described in `certificates/README.md` and provide them as secret in the Kubernetes `ccs3` namespace:
```bash
kubectl create secret generic qrcode-signin-certs --from-file=ccs3-qrcode-signin.crt --from-file=ccs3-qrcode-signin.key --from-file=ccs3-ca.crt
```
- `redis-host` - this one is needed by the applications running inside the cluster to reach the message broker. It should set the name of the Valkey service defined in the Kubernetes .yaml file (`ccs3-valkey-service`) to key `host` or if you have external message broker compatible with Valkey, provide it here:
```bash
kubectl create secret generic redis-host --from-literal=host=ccs3-valkey-service
```
- `storage-connection-string` - this one is needed by `state-manager` to connect to the database. The key is `conn-string`. Sample Postgre connection string using database with name `ccs3` - the database must already exist and also the user must have access to it:
```bash
kubectl create secret generic storage-connection-string --from-literal=conn-string="postgresql://<ip-address-or-host>:5432/ccs3?user=<your-postgre-user>&password=<your-password>&connect_timeout=10&application_name=state-manager"
```

## yaml files

ALl commands that use `.yaml` files must be executed from the project root folder.

### Development environment

For development environment, apply the file `ccs3-local-dev.yaml` - this one exposes Redis through LoadBalancer service so it is available for local development and apps debugged locally will be able to access Redis which runs inside Kubernetes cluster:
```bash
kubectl apply -f ccs3-local-dev.yaml
```

### Production environment

For production environment, apply the file `ccs3-prod.yaml`:
```bash
kubectl apply -f ccs3-prod.yaml
```

## Ports
The following are the default ports used by the system (defined in Kubernetes .yaml file):
- 6379 - internal - for connecting applications running inside the cluster with Valkey. Can be set with environment variable `CCS3_REDIS_PORT`
- 30500 - external - used by static-files-service - redirects to port 443 inside the container
- 30501 - external - used by pc-connector is listening at this port - same port inside the container
- 30502 - external - used by operator-connector - same port inside the container
- 30503 - external - used by qrcode-signin - same port inside the container

# Build docker images

## Update the version
- Navigate to the root of the project
- Update `version` field in all `package.json` files with
```bash
node scripts/update-version.mjs <new version like 3.1.7>
```
## Local development
- Make sure other images are already built with the new version (refer to the projects README files for information on how to build them)
  - `Ccs3ClientApp`
  - `Ccs3ClientAppWindowsService`
  - `Ccs3ClientAppBootstrapWindowsService`
  - `ccs3-operator`
- Local development usually only requires building of `static-files-service`. To make sure the most recent build is used by Kubernetes. See `README-static-files-service.md` for instructions on how to build it

## Operator connector
- Navigate to the project root folder
- Make sure the required image `computerclubsystem/operator-web-app-static-files:dev` is already build locally (refer to `ccs3-operator` project on how to build its image)
- Build `dev` tag
```bash
docker buildx build --no-cache -t computerclubsystem/operator-connector:dev -f devops/Dockerfile.operator-connector .
```
