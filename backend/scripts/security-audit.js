import { runDependencyAudit } from '../src/modules/security/security-audit.js';

const report = await runDependencyAudit();
let failed = false;
for (const project of report.projects) {
  console.log(`${project.name}: ${project.available ? JSON.stringify(project.counts) : project.message}`);
  if (!project.available || project.counts.high > 0 || project.counts.critical > 0) failed = true;
}
process.exitCode = failed ? 1 : 0;
