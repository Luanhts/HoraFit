const { spawnSync } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const composeFile = path.resolve(
  backendDir,
  '..',
  'docker-compose.integration.yml',
);
const project = `horafit-integration-${randomUUID().slice(0, 8)}`;
const composeArgs = ['compose', '-p', project, '-f', composeFile];
const password = randomBytes(24).toString('hex');
const composeEnv = { ...process.env, HORAFIT_TEST_DB_PASSWORD: password };

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: backendDir,
    encoding: 'utf8',
    stdio: 'inherit',
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} terminou com código ${result.status ?? 'desconhecido'}.`,
    );
  }

  return result;
}

try {
  run('docker', [...composeArgs, 'up', '-d', '--wait'], { env: composeEnv });

  const portResult = run(
    'docker',
    [...composeArgs, 'port', 'db-integration', '5432'],
    {
      env: composeEnv,
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  );
  const portMatch = /^127\.0\.0\.1:(\d+)\s*$/.exec(portResult.stdout);
  if (!portMatch) {
    throw new Error(
      'O banco de teste não publicou uma porta local em 127.0.0.1.',
    );
  }

  const databaseUrl =
    `postgresql://horafit_test:${password}@127.0.0.1:${portMatch[1]}` +
    '/horafit_integration_test';
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    TEST_DATABASE_URL: databaseUrl,
    HORAFIT_INTEGRATION_DB: '1',
  };

  run(
    process.execPath,
    [
      path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
    ],
    { env },
  );
  run(
    process.execPath,
    [
      path.join(backendDir, 'node_modules', 'jest', 'bin', 'jest.js'),
      '--config',
      path.join(__dirname, 'jest-postgres.json'),
      '--runInBand',
    ],
    { env },
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  const cleanup = spawnSync('docker', [...composeArgs, 'down', '--volumes'], {
    cwd: backendDir,
    env: composeEnv,
    stdio: 'inherit',
  });
  if (cleanup.status !== 0) process.exitCode = 1;
}
