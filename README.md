# Computer Club System 3

## Prerequisites
- Git - https://git-scm.com/downloads
- NodeJS >= 20.11.0 - https://nodejs.org/
- NPM >= 10.2.4 (this will be automatically installed with NodeJS)
- Kubernetes cluster - Look at `Kubernetes cluster installation` in this document

## Downloading sources
Sources are required to be able to build applications and create images. Sources must be downloaded on the computer, where the Kubernetes cluster will run (the "server" computer):
- Create a folder for the CCS3 application (ex. `C:\ccs3-app`)
- Open command prompt and navigate to this folder
- Clone the Git repositories:
```bash
git clone https://github.com/computerclubsystem/ccs3-backend.git
```
```bash
git clone https://github.com/computerclubsystem/ccs3-windows-apps.git
``` 
```bash
git clone https://github.com/computerclubsystem/ccs3-operator.git
```
- Three folders will be created - `ccs3-backend`, `ccs3-windows-apps` and `ccs3-operator`


## Kubernetes cluster installation
You can use existing Kubernetes cluster or install one on Windows 11 computer. The Kubernetes cluster installation and usage in this document are based on Windows 11 computer, `Rancher Desktop`, `WSL 2`, and `containerd`. Most of the operations on the server require administrative rights:
- Use Windows 11 22H2 or newer and log in as administrator user
- Open command prompt and install wsl:
```bash
wsl --install --no-distribution
```
- Update to the latest WSL version:
```bash
wsl --update
```
- Restart Windows.
- Install `Rancher Desktop` from https://rancherdesktop.io/
- Open Rancher Desktop and press the  `Preferences` button to open the preferences window and make the following changes:
  - `Application - Behavior tab - Automatically start at login`
  - `Container Engine - containerd`
  - `Kubernetes` - Select the most recent stable Kubernetes version and press `Apply` button
- Create Kubernetes namespace for CCS3 - open command prompt and run:
```bash
kubectl create namespace ccs3
```
- Switch to the CCS3 namespace:
```bash
kubectl config set-context --current --namespace=ccs3
```
- Configure your Windows user to log in automatically - https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon
- Configure your Windows to never sleep / hibernate / power off etc.
- Restart Windows and make sure it auto logs in and Rancher Desktop opens automatically
- Open command prompt and make sure Kubernetes namespace is `ccs3`:
```bash
kubectl get all
```
  - Since we still didn't create anything in this Kubernetes namespace, the result should be `No resources found in ccs3 namespace.`

## Certificates
CCS3 uses secure communication which requires certificates files to be created for every system component. Certificates require passwords - use strong passwords and keep them in a safe place.

Certificate files creation in this document is based on Linux `openssl`. 

### Create CA certificate which will be used later for signing other certificates
It is better to create and keep all the certificates on another machine. If you have another machine with Windows, you can enable WSL 2 and install Ubuntu distribution:
- Open commamd prompt and install wsl:
```bash
wsl --install
```
- This will install Ubuntu distribution by default
- Update to the latest WSL version:
```bash
wsl --update
```
- Restart Windows.
- Open command prompt and navigate to the folder `certificates` where the file `create-cert-signed-by-ca.sh` is located
- Run the Ubuntu WSL distribution:
```bash 
wsl
```
- Install `openssl`:
```bash
sudo apt-get install openssl
```
- Create "ccs3-ca.key" CA certificate key file:
```bash
openssl genrsa -des3 -out ccs3-ca.key 2048
```
- Provide a strong password when asked. Keep the password in secure place
- Create "ccs3-ca.crt" CA certificate crt file:
```bash
openssl req -x509 -new -nodes -key ccs3-ca.key -sha256 -days 3650 -out ccs3-ca.crt
```
- Provide the password for "ccs3-ca.key" created in the previous step
- OpenSSL will ask a couple of questions. Provide values similar to these:
  - `Country Name (2 letter code) [AU]:` - `BG`
  - `State or Province Name (full name) [Some-State]:` - `Varna` (or your town)
  - `Locality Name (eg, city):` - `Varna` (or your town)
  - `Organization Name (eg, company) [Internet Widgits Pty Ltd]:` - `CCS3` (or the name of your organization)
  - `Organizational Unit Name (eg, section) []:` - `Development` (or any other organizational unit name)
  - `Common Name (e.g. server FQDN or YOUR name) []:` - `CCS3 Certificate Authority` (or any other descriptive name)
  - `Email Address []:` - you can provide email address or leave it blank by just pressing ENTER
- Two files will be created with names `ccs3-ca.crt` and `ccs3-ca.key` - copy them in a safe place

### Create service certificate signed by CA certificate
Applications in the CCS3 will need certificates to act as services. These are services running on the back-end as well as services that will run on Windows computers for the customers.

#### Create certificates for `CCS3 Client App Windows Service`
The `CCS3 Client App Windows Service` needs 2 certificates. One for authenticating itself as a client to the back-end services (mainly the `PC-CONNECTOR` service) and another one for authenticating itself as a service for the `CCS3 Client App`.

- Creating `CCS3 Client App Windows Service` certificate for authenticating as client to the back-end
  - Open command prompt and navigate to the folder where the `ccs3-ca.crt` and `ccs3-ca.key` files are
  - Start WSL:
```bash
wsl
```
  - Create certificate - change the `PC-1` occurrences with the name of the computer to which the certificate is created:
```bash
sh create-cert-signed-by-ca.sh PC-1 PC-1 ccs3-ca.crt ccs3-ca.key /C=BG/ST=Varna/O=CCS3/OU=Development/CN=PC-1 'clientAuth'
```
- Creating `CCS3 Client App Windows Service` certificate for authenticating as service to the `CCS3 Client App` - keep the `localhost` but change the `PC-1` to point to the name of the computer
```bash
sh create-cert-signed-by-ca.sh localhost localhost-PC-1 ccs3-ca.crt ccs3-ca.key /C=BG/ST=Varna/O=CCS3/OU=Development/CN=localhost 'serverAuth'
```
- Two set of files will be created with names `PC-1` and `localhost-PC-1`. Some of them must be installed on the customer computer
  - Copy `ccs3-ca.crt`, `PC-1.pfx` and `localhost-PC-1.pfx` files to USB stick and put it in the customer computer and open the USB (you can also copy the 3 files to customer computer hard disk, but this is less secure)
  - Right click on `ccs3-ca.crt` and select `Install certificate`
  - Select `Local Machine` and click "Next"
  - Select `Place all certificates in the following store` and browse to `Trusted Root Certification Authorities`
  - Press "OK", "Next" and "Finish"
  - Right click on `PC-1.pfx` and select `Install PFX`
  - Select `Local Machine` and click "Next" and "Next" again
  - Provide the "Export Password" password for `PC-1` certificate and click "Next"
  - Select `Place all certificates in the following store` and browse to `Personal`
  - Press "OK", "Next" and "Finish"
  - Do the same with `localhost-PC-1.pfx` as `PC-1.pfx`
  - Delete the certificate files from the customer computer

## Install
```bash
npm install
```

## Build
To build everything with single command:
```bash
npm run build
```

Building individual apps require certain order - first build the dependencies and then the applications that depend on them. This is the order:
```bash
npm run libs/types:install-deps
npm run libs/types:build
npm run libs/websocket-server:install-deps
npm run libs/websocket-server:build
npm run libs/redis-client:install-deps
npm run libs/redis-client:build
npm run apps/state-manager:install-deps
npm run apps/state-manager:build
npm run apps/pc-connector:install-deps
npm run apps/pc-connector:build
npm run apps/operator-connector:install-deps
npm run apps/operator-connector:build
```
The results can be found in the `dist` folder in the corresponding app (like `state-manager/dist` for the `state-manager` app).

## Debug
Debugging is configured for VSCode in `.vscode/launch.json` file. To debug the app, first build it (preferrably in `watch` mode) and then select the appropriate VSCode launch configuration. Applications have dependencies (like `apps/state-manager` depends on `libs/redis-client`) so these dependencies should also be build. To ensure a change in any component (application or library) will be reflected in the debugged application, execute these in their own terminals in the following order (you can skip some of them if you don't expect to make changes to like `npm run libs/redis-client:build-watch` and `npm run libs/websocket-server:build-watch` - these are pretty static and if there is some change, you can run one-time non-watch `...:build` version):

```bash
npm run libs/types:build-watch
npm run libs/redis-client:build-watch
npm run libs/websocket-server:build-watch
npm run apps/state-manager:build-watch
npm run apps/pc-connector:build-watch
npm run apps/operator-connector:build-watch
```

After a source code change of any of them, the debugging session must be restarted.

## NPM workspaces
The code uses NPM workspaces so most of the `npm` commands must specify the workspace (by adding `-w` or `--workspace`) like:
```bash
npm -w apps/state-manager install ...
```

## Dependencies
The dependencies specified in the individual project's `package.json` files are installed in `node_modules` in the root folder. Individual apps/libs should not have `node_modules`. Since `node_modules` is shared among all the projects, try to use same dependencies with their exact versions - e.g. `"typescript": "5.3.3"`, not `"typescript": "^5.3.3"`.

## Add new app
- Create folder `apps/<new-app-name>`
- Create folder `apps/<new-app-name>/src` which will be used to put the application files
- Create `apps/<new-app-name>/index.mts` which will be used to only export all public types (like `export * from './src/.....mjs`)
- Create `apps/<new-app-name>/package.json` specifying the `"name": "@computerclubsystem/<new-app-name>"`. Sample `package.json`:
```json
{
    "name": "@computerclubsystem/<new-app-name>",
    "version": "1.0.0",
    "description": "",
    "author": "",
    "type": "module",
    "scripts": {
        "build": "tsc --project tsconfig.json --sourceMap",
        "build:watch": "tsc --project tsconfig.json --sourceMap --watch",
        "tsc": "tsc"
    },
    "license": "ISC",
    "dependencies": {
        "<name-from-package.json-of-some-lib-like-@computerclubsystem/redis-client>": "*"
    },
    "devDependencies": {
        "@types/node": "20.11.5",
        "typescript": "5.3.3"
    }
}
```
- From the root folder install the new app dependencies:
```bash
npm -w apps/<new-app-name> install
```
- Make sure its folder is created in `node_modules/@computerclubsystem`
- Initialize TypeScript:
```bash
npm -w apps/<new-app-name> tsc -- --init
```
- The folder strucutre should look like this:
```
apps/
  <new-app-name>/
    src/
      index.mts (app startup file)
      <other app source files here>
  index.mts
  package.json
  tsconfig.json
```
- Change the `apps/<new-app-name>/tsconfig.json` to include the correct configuration like:
```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "baseUrl": "./",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true 
    }
}
```
- Add build scripts in the root `package.json`:
```json
"scripts": {
    "build:apps/<new-app-name>": "npm --workspace apps/<new-app-name> run build",
    "build:apps/<new-app-name>:watch": "npm --workspace apps/<new-app-name> run build:watch"
}
```

## Add new library
- Create folder `libs\<new-lib-name>`
- Create folder `libs\<new-lib-name>\src`
- Create file `libs\<new-lib-name>\index.mts` which will be used to only export all public types from `./src...` (like `export * from './src/.....mjs`)
- Create file `libs\<new-lib-name>\package.json` specifying the `"name": "@computerclubsystem/<new-lib-name>"`. Sample `package.json`:
```json
{
    "name": "@computerclubsystem/<new-lib-name>",
    "version": "1.0.0",
    "description": "",
    "type": "module",
    "types": "dist/*/**.d.ts",
    "exports": {
        ".": "./dist/index.mjs"
    },
    "scripts": {
        "build": "tsc --project tsconfig.json --sourceMap",
        "build:watch": "tsc --project tsconfig.json --sourceMap --watch",
        "tsc": "tsc"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        "redis": "4.6.12"
    },
    "devDependencies": {
        "typescript": "5.3.3"
    }
}
```
- From the project root folder install the new lib dependencies:
```bash
npm -w libs/<new-lib-name> install
```
- Make sure its folder is created in `node_modules/@computerclubsystem`
- Initialize TypeScript:
```bash
npm -w libs/<new-lib-name> run tsc -- --init
```
- The folder strucutre should look like this:
```
libs/
  <new-lib-name>/
    src/
      <lib source files here>
  index.mts
  package.json
  tsconfig.json
```
- Change the `libs/<new-lib-name>/tsconfig.json` to include the correct configuration like:
```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "baseUrl": "./",
        "outDir": "./dist",
        "declaration": true,
        "declarationMap": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true 
    }
}
```
- Add build scripts in the root `package.json`:
```json
"scripts": {
    "build:libs/<new-lib-name>": "npm --workspace libs/<new-lib-name> run build",
    "build:libs/<new-lib-name>:watch": "npm --workspace libs/<new-lib-name> run build:watch"
}
```
- Build the new library by running:
```bash
npm run build:libs/<new-lib-name>
```
- Add the library as dependency to the app that needs it in `dependencies` in the app's `package.json`:
```json
    "dependencies": {
        "@computerclubsystem/<new-lib-name>": "*"
    },
```
- Install the new dependency in the app that uses the new library:
```bash
npm -w app/<app-name> install
```
- Use the library in the app:
```typescript
import { ... } from '@computerclubsystem/<new-lib-name>'
```

## Build docker images
DevOps related files are in `devops` folder. Each dockerfile has a comment in the beginning showing a sample command line that builds the image. The `package.json` file has npm scripts for building images if Docker Desktop is used or Rancher Desktop is used with `containerd` (`nerdctl`) like:
```bash
npm run apps/state-manager:build-image-docker
```
or
```bash
npm run apps/state-manager:build-image-racnher-nerdctl
```

Building `state-manager` manually would look like this for Docker Desktop:
```bash
docker build -t ccs3/state-manager:latest -f Dockerfile.state-manager ../apps/state-manager
```

Building `state-manager` manually would look like this for Rancher Desktop with `containerd` (`nerdctl`):
```bash
nerdctl -n k8s.io build -t ccs3/state-manager:latest -f Dockerfile.state-manager ../apps/state-manager
```

Building all the images for Docker Desktop:
```bash
npm run build-images-docker
```

Building all the images for Rancher Desktop with `containerd` (`nerdctl`):
```bash
npm run build-images-rancher-nerdctl
```

## Kubernetes
Before executing Kubernetes commands using `kubectl`, create namespaces for dev and staging environments:
```bash
kubectl create namespace ccs3-dev-namespace
kubectl create namespace ccs3-staging-namespace
```
Then switch to the appropriate Kubernetes namespace with:

### Development namespace
```bash
kubectl config set-context --current --namespace=ccs3-dev-namespace
```

For development environment, apply the file `devops/ccs3-dev.yaml` - this one exposes Redis through LoadBalancer service so it is available for local development and apps debugged locally will be able to access Redis which runs inside Kubernetes cluster:
```bash
kubectl apply -f ./devops/ccs3-dev.yaml
```

### Staging namespace
```bash
kubectl config set-context --current --namespace=ccs3-staging-namespace
```

For prod environment, apply the file `devops/ccs3-staging.yaml`:
```bash
kubectl apply -f ./devops/ccs3-staging.yaml
```

## Certificates
Look at `certificates/README.md`