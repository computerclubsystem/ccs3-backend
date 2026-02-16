# Computer Club System 3

Software for managing computer club

# Requirements
Use dedicated computer for server with:
- CPU with virtualization support switched on in the BIOS
- 8GB RAM
- Windows 11 (or Windows Server 2022) fully updated with WSL2 support.
- 10GB disk space - may require more space if the database gets large

## Prerequisites
- Git - https://git-scm.com/downloads
- NodeJS >= 22 - https://nodejs.org/
- NPM >= 10.2.4 (this will be automatically installed with NodeJS)
- Kubernetes cluster - Look at `Kubernetes cluster installation` in this document

## Downloading sources
Sources are required to be able to build applications and create images. Sources must be downloaded on the computer, where the Kubernetes cluster will run (the "server" computer):
- Create a folder for the CCS3 application (like `C:\ccs3-app`)
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
```bash
git clone https://github.com/computerclubsystem/qrcode-signin.git
```
- Four folders will be created - `ccs3-backend`, `ccs3-windows-apps`, `ccs3-operator` and `qrcode-signin`


## Kubernetes cluster installation
The Kubernetes cluster installation and usage in this document are based on Windows 11 computer, `Rancher Desktop`, `WSL 2`, and `dockerd`. Most of the operations on the server require administrative rights:
- Log in to the server computer as administrator user
- Open command prompt as administrator and install wsl:
```bash
wsl --install --no-distribution
```
- Update to the latest WSL version:
```bash
wsl --update
```
- Restart Windows.
- Install `Rancher Desktop` with `dockerd` engine runtime. Download it from https://rancherdesktop.io/ (tested with version 1.20.1 - you can install another version from here - `https://github.com/rancher-sandbox/rancher-desktop/releases`)
- Open Rancher Desktop and press the `Preferences` button to open the preferences window and make the following changes:
  - `Application - Behavior tab - Automatically start at login`
  - `Container Engine - dockerd`
  - `Kubernetes` - Select the most recent stable Kubernetes version and press `Apply` button
- Configure your Windows user to log in automatically - `https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon`
- Configure your Windows to never sleep / hibernate / power off etc.
- Restart Windows and make sure it auto logs in and Rancher Desktop opens automatically

## Certificates
CCS3 uses secure communication which requires certificates files to be created for every system component. Certificates require passwords - use strong passwords and keep them in a safe place.

Certificate files creation in this document is based on Linux `openssl`. 

### Create CA certificate which will be used later for signing other certificates (look at `certificates/README.md`)
It is better to create and keep all the certificates on another machine. If you have another machine with Windows, you can enable WSL 2 and install Ubuntu distribution:
- Open command prompt and install wsl:
```bash
wsl --install
```
- Update to the latest WSL version:
```bash
wsl --update
```
- Install Ubuntu distribution (you can check if it is already installed with `wsl -l`). Select the most recent Ubuntu version from the list:
```bash
wsl --list --online
wsl --install -d Ubuntu-24.04
```
- Restart Windows.
- Open command prompt and navigate to the folder `certificates` where the file `create-cert-signed-by-ca.sh` is located
- Run the Ubuntu WSL distribution:
```bash 
wsl -d Ubuntu-24.04
```
- Install `openssl` (if it is already installed, no changes will be made):
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
The `CCS3 Client App Windows Service` needs 2 certificates. One for authenticating itself as a client to the back-end services (mainly the `pc-connector` service) and another one for authenticating itself as a service for the `CCS3 Client App`.

- Creating `CCS3 Client App Windows Service` certificate for authenticating as client to the back-end
  - Open command prompt and navigate to the folder where the `ccs3-ca.crt` and `ccs3-ca.key` files are
  - Start WSL:
```bash
wsl -d Ubuntu-24.04
```
  - Create certificate - change the `PC-1` occurrences with the name of the computer to which the certificate is created. Also change the values of `C=` (country), `ST=` (state), `O=` (organization), `OU=` (organizational unit), `CN=` (common name - this must be the same as the computer name):
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
- To build everything with single command:
```bash
npm run build
```

- Building individual apps require certain order - first build the dependencies and then the applications that depend on them. This is the order:
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
npm run apps/wrcode-signin:install-deps
npm run apps/wrcode-signin:build
```
The results can be found in the `dist` folder in the corresponding app (like `state-manager/dist` for the `state-manager` app).

## Debug
Debugging is configured for VSCode in `.vscode/launch.json` file. To debug the app, first build it (preferrably in `watch` mode) and then select the appropriate VSCode launch configuration.

If you find that while debugging you see your new soucrce code changes but at runtime the old code is executed (this can happen if you switch from one of the build approaches to the other or if some tsconfig.json file is changed) - stop all builds and delete the `dist` folder of all the projects in `apps` and `libs`. Switching between builds (`npm run watch-all` and `npm run libs/types:build-watch` etc.) requires deleting the output folders to avoid reusing previously built files.

There are two ways to build and watch the projects for changes so they can be easily built:
- Using TypeScript reference projects:
  - `npm run watch-operator` - sufficient if only `operator-connector` or `state-manager` are about to be changed.   Builds and watches for changes the following projects:
  - ./libs/types
  - ./apps/state-manager
  - ./apps/operator-connector
  - `npm run watch-operator-and-pc` - sufficient if only `operator-connector`, `state-manager` or `pc-connector`   are about to be changed. Builds and watches for changes the following projects:
  - ./libs/types
  - ./apps/state-manager
  - ./apps/operator-connector
  - ./apps/pc-connector
  - `npm run watch-all` - builds and watch all the projects

- Using build for individual projects
Applications have dependencies (like `apps/state-manager` depends on `libs/redis-client`) so these dependencies should also be build. To ensure a change in any component (application or library) will be reflected in the debugged application, execute these in their own terminals in the following order (you can skip some of them if you don't expect to make changes to like `npm run libs/redis-client:build-watch` and `npm run libs/websocket-server:build-watch` - these are pretty static and if there is some change, you can run one-time non-watch `...:build` version):

```bash
npm run libs/types:build-watch
npm run libs/redis-client:build-watch
npm run libs/websocket-server:build-watch
npm run apps/state-manager:build-watch
npm run apps/pc-connector:build-watch
npm run apps/operator-connector:build-watch
npm run apps/qrcode-signin:build-watch
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
        "@types/node": "22.13.1",
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
npm -w apps/<new-app-name> run tsc -- --init
```
- The folder strucutre should look like this:
```
apps/
  <new-app-name>/
    src/
      index.mts (app startup file)
      <other app source files here>
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
Set the version with
```bash
npm run update-version -- <major.minor.revision>
```

DevOps related files are in `devops` folder. Each dockerfile has a comment in the beginning showing a sample command line that builds the image. The `package.json` file has npm scripts for building images if Docker Desktop is used or Rancher Desktop is used with `dockerd` container engine like:
```bash
npm run apps/state-manager:build-image-docker
```

Building `state-manager` manually would look like this:
```bash
docker buildx build -t ccs3/state-manager:latest -f Dockerfile.state-manager ../apps/state-manager
```

Building all the images:
```bash
npm run build-images-docker
```

## Kubernetes
Look at `devops/README.md`

## Certificates
Look at `certificates/README.md`