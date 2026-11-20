const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const generatedDir = path.join(backendDir, 'node_modules', '.prisma', 'client');

function normalizeSchema(schema) {
  return schema.replace(/\s+/g, '');
}

function isCurrentClient(sourceSchema, generatedSchema, installedVersion, generatedVersion, hasEngine) {
  return hasEngine && installedVersion === generatedVersion &&
    normalizeSchema(sourceSchema) === normalizeSchema(generatedSchema);
}

function needsGeneration() {
  try {
    const sourceSchema = readFileSync(path.join(backendDir, 'prisma', 'schema.prisma'), 'utf8');
    const generatedSchema = readFileSync(path.join(generatedDir, 'schema.prisma'), 'utf8');
    const installedVersion = require(path.join(backendDir, 'node_modules', '@prisma', 'client', 'package.json')).version;
    const generatedVersion = require(path.join(generatedDir, 'package.json')).version;
    const hasEngine = readdirSync(generatedDir).some((name) =>
      /^(?:lib)?query_engine-.+\.node$/.test(name),
    );

    return !isCurrentClient(sourceSchema, generatedSchema, installedVersion, generatedVersion, hasEngine);
  } catch {
    return true;
  }
}

function main() {
  if (!needsGeneration()) {
    process.stdout.write('Prisma Client já corresponde ao schema atual.\n');
    return;
  }

  const prismaCli = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
  if (!existsSync(prismaCli)) {
    throw new Error('Prisma CLI não instalado. Execute npm ci no backend.');
  }

  const result = spawnSync(process.execPath, [prismaCli, 'generate'], {
    cwd: backendDir,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('Falha ao gerar Prisma Client. Encerre o backend local se o engine estiver em uso.');
  }
}

if (require.main === module) main();

module.exports = { isCurrentClient, needsGeneration };
