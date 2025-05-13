import { spawnSync } from 'node:child_process';
import * as process from 'node:process';
import * as console from 'node:console';

const newVersion = process.argv[2];
if (!newVersion) {
    console.warn('Provide new version as first parameter. Example: node update-version.mjs 3.1.1');
    process.exit(1);
}
const workspaces = [
    'libs/types',
    'libs/redis-client',
    'libs/websocket-server',
    'apps/pc-connector',
    'apps/operator-connector',
    'apps/qrcode-signin',
    'apps/state-manager',
];

function execNpm(args) {
    const command = `npm`;
    console.log(`Executing ${command} ${args.join(' ')}`);
    const buffer = spawnSync(command, args, { shell: true });
    console.log(buffer.output.toString());
}

// The version of the root package.json
execNpm(['version', newVersion, '--no-git-tag-version', '--force']);

// Version of all the workspaces
for (const workspace of workspaces) {
    const args = [
        '--workspace',
        workspace,
        'version',
        newVersion,
    ];
    execNpm(args);
}
