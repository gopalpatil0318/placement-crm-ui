const { execSync } = require('child_process');
try {
    execSync('npx tsc -b', { encoding: 'utf8', cwd: 'd:\\placement-crm-tool\\placement-crm-ui' });
} catch (e) {
    require('fs').writeFileSync('d:\\placement-crm-tool\\placement-crm-ui\\tsc_errors_utf8.txt', e.stdout);
}
