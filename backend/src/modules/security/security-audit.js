import { execFile } from 'node:child_process';
import { access, mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const backendRoot = fileURLToPath(new URL('../../../', import.meta.url));
const auditFile = path.join(backendRoot, '.cache/security-audit.json');
let running = null;

export async function readDependencyAudit() {
  try {
    const report = JSON.parse(await readFile(auditFile, 'utf8'));
    return { ...report, stale: Date.now() - new Date(report.checkedAt).getTime() > 25 * 60 * 60 * 1000 };
  } catch {
    return { checkedAt: null, stale: true, projects: [], message: 'Paketlar auditi hali bajarilmagan. npm run security:audit buyrug‘ini ishga tushiring.' };
  }
}

async function auditProjects() {
  const projects = [];
  const npmCli = process.env.npm_execpath;
  for (const name of ['backend', 'admin', 'frontend']) {
    const directory = name === 'backend' ? backendRoot : path.resolve(backendRoot, '..', name);
    try { await access(path.join(directory, 'package-lock.json')); } catch {
      projects.push({ name, available: false, message: 'Ushbu serverda loyiha lock fayli mavjud emas.' });
      continue;
    }
    let output;
    try {
      if (!npmCli) throw new Error('npm cli unavailable');
      const result = await execute(process.execPath, [npmCli, 'audit', '--omit=dev', '--json', '--ignore-scripts'],
        { cwd: directory, timeout: 45000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
      output = result.stdout;
    } catch (error) { output = error.stdout; }
    try {
      const report = JSON.parse(output);
      if (!report.metadata?.vulnerabilities || report.error) throw new Error('unavailable');
      projects.push({ name, available: true, counts: report.metadata.vulnerabilities,
        findings: Object.entries(report.vulnerabilities || {}).map(([dependency, item]) => ({
          name: dependency, severity: item.severity, direct: Boolean(item.isDirect),
          fixAvailable: Boolean(item.fixAvailable), fixRequiresMajor: Boolean(item.fixAvailable?.isSemVerMajor), range: item.range
        })).sort((a, b) => ['critical', 'high', 'moderate', 'low', 'info'].indexOf(a.severity) -
          ['critical', 'high', 'moderate', 'low', 'info'].indexOf(b.severity)).slice(0, 100) });
    } catch {
      projects.push({ name, available: false, message: 'npm audit natijasi olinmadi. Registry ulanishi va npm orqali ishga tushirilishini tekshiring.' });
    }
  }
  const result = { checkedAt: new Date().toISOString(), projects };
  await mkdir(path.dirname(auditFile), { recursive: true });
  const temporary = `${auditFile}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(result, null, 2));
  await rename(temporary, auditFile);
  return result;
}

export function runDependencyAudit() {
  if (!running) running = auditProjects().finally(() => { running = null; });
  return running;
}
