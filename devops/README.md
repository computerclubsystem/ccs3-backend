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
- `pc-connector-certs` - this is a secret containing the two .crt and .key files for the pc-connector service to operate. Create certificate files as described in `certificates/README.md` and provide them as secret in the Kubernetes `ccs3` namespace:
```bash
kubectl create secret generic pc-connector-certs --from-file=ccs3-pc-connector.crt --from-file=ccs3-pc-connector.key
```
- `redis-host` - this one is needed by the applications running inside the cluster to reach the message broker. It should be the name of the Valkey service defined in the Kubernetes .yaml file (`ccs3-valkey-service`) or if you have external message broker compatible with Valkey, provide it here:
```bash
kubectl create secret generic redis-host --from-literal=host=ccs3-valkey-service
```
- `storage-connection-string` - this one is needed by `state-manager` to connect to the database. Sample Postgre connection string using database with name `ccs3` - the database must already exist and also the user must have access to it:
```bash
kubectl create secret generic storage-connection-string --from-literal=conn-string="postgresql://<ip-address-or-host>:5432/ccs3?user=<your-postgre-user>&password=<your-password>&connect_timeout=10&application_name=state-manager"
```
- `state-manager-storage-provider-database-migration-scripts-directory` - path to the `database-migrations` folder that contains database migration scripts - by default `dist/postgre-storage/database-migrations`
```bash
kubectl create secret generic state-manager-storage-provider-database-migration-scripts-directory --from-literal=path="dist/postgre-storage/database-migrations"
```

## Ports
The following are the default ports used by the system (defined in Kubernetes .yaml file):
- 6379 - internal - for connecting applications running inside the cluster with Valkey. Can be set with environment variable `CCS3_REDIS_PORT`
- 65500 - external - static-files-service - redirects to port 443 inside the container
- 65501 - external - pc-connector is listening at this port - redirects to 65501 inside the container