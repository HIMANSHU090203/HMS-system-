/**
 * Script to fix all audit log calls by adding hospitalId
 * Run with: npx ts-node fix-all-audit-logs.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const controllersDir = join(__dirname, 'src/controllers');
const files = [
  'consultationController.ts',
  'admissionController.ts',
  'dailyRoundController.ts',
  'vitalSignController.ts',
  'nursingShiftController.ts',
  'dischargeSummaryController.ts',
  'inpatientBillController.ts',
  'labTestController.ts',
  'medicineController.ts',
  'userController.ts',
  'bedController.ts',
  'wardController.ts',
];

function fixAuditLogs(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Add import if not present
  if (!content.includes("import { logAudit }")) {
    // Find the last import statement
    const importMatch = content.match(/(import .+ from ['"].+['"];?\n)+/);
    if (importMatch) {
      const lastImport = importMatch[0].split('\n').filter(l => l.trim()).pop();
      const insertPos = content.indexOf(lastImport!) + lastImport!.length;
      content = content.slice(0, insertPos) + 
        "\nimport { logAudit } from '../utils/auditLogger';" + 
        content.slice(insertPos);
    } else {
      // Add after first line
      const firstLineEnd = content.indexOf('\n');
      content = content.slice(0, firstLineEnd + 1) + 
        "import { logAudit } from '../utils/auditLogger';\n" + 
        content.slice(firstLineEnd + 1);
    }
  }

  // Replace prisma.auditLog.create patterns
  // Pattern: await prisma.auditLog.create({ data: { ... } })
  content = content.replace(
    /await prisma\.auditLog\.create\(\s*{\s*data:\s*{([^}]+(?:\{[^}]*\}[^}]*)*)}\s*}\s*\)/gs,
    (match, dataContent) => {
      // Extract fields from data object
      const userIdMatch = dataContent.match(/userId:\s*([^,}\n]+)/);
      const actionMatch = dataContent.match(/action:\s*([^,}\n]+)/);
      const tableNameMatch = dataContent.match(/tableName:\s*([^,}\n]+)/);
      const recordIdMatch = dataContent.match(/recordId:\s*([^,}\n]+)/);
      const oldValueMatch = dataContent.match(/oldValue:\s*([^,}\n]+)/);
      const newValueMatch = dataContent.match(/newValue:\s*([^,}\n]+)/);

      const userId = userIdMatch ? userIdMatch[1].trim() : '';
      const action = actionMatch ? actionMatch[1].trim() : '';
      const tableName = tableNameMatch ? tableNameMatch[1].trim() : '';
      const recordId = recordIdMatch ? recordIdMatch[1].trim() : '';
      const oldValue = oldValueMatch ? oldValueMatch[1].trim() : undefined;
      const newValue = newValueMatch ? newValueMatch[1].trim() : undefined;

      let result = `await logAudit({\n        userId: ${userId},\n        action: ${action},\n        tableName: ${tableName},\n        recordId: ${recordId}`;
      if (oldValue) result += `,\n        oldValue: ${oldValue}`;
      if (newValue) result += `,\n        newValue: ${newValue}`;
      result += ',\n      })';
      return result;
    }
  );

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

let fixed = 0;
for (const file of files) {
  const filePath = join(controllersDir, file);
  try {
    if (fixAuditLogs(filePath)) {
      console.log(`✅ Fixed: ${file}`);
      fixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error);
  }
}

console.log(`\n✅ Fixed ${fixed} files`);



























