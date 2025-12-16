/**
 * Final script to fix all remaining audit log calls
 * Replaces prisma.auditLog.create with logAudit helper
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const controllersDir = join(__dirname, 'src/controllers');
const files = [
  'admissionController.ts',
  'bedController.ts',
  'consultationController.ts',
  'dailyRoundController.ts',
  'dischargeSummaryController.ts',
  'inpatientBillController.ts',
  'labTestController.ts',
  'nursingShiftController.ts',
  'userController.ts',
  'vitalSignController.ts',
  'wardController.ts',
];

function fixFile(filePath: string): boolean {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Ensure logAudit is imported
  if (!content.includes("import { logAudit }")) {
    const importMatch = content.match(/(import .+ from ['"].+['"];?\n)+/);
    if (importMatch) {
      const lastImport = importMatch[0].split('\n').filter(l => l.trim()).pop();
      const insertPos = content.indexOf(lastImport!) + lastImport!.length;
      content = content.slice(0, insertPos) + 
        "\nimport { logAudit } from '../utils/auditLogger';" + 
        content.slice(insertPos);
    }
  }

  // Replace all prisma.auditLog.create patterns
  // Match: await prisma.auditLog.create({ data: { ... } })
  const pattern = /await prisma\.auditLog\.create\(\s*{\s*data:\s*{([^}]+(?:\{[^}]*\}[^}]*)*)}\s*}\s*\)/gs;
  
  content = content.replace(pattern, (match, dataContent) => {
    // Extract fields
    const userIdMatch = dataContent.match(/userId:\s*([^,}\n]+)/);
    const actionMatch = dataContent.match(/action:\s*([^,}\n]+)/);
    const tableNameMatch = dataContent.match(/tableName:\s*([^,}\n]+)/);
    const recordIdMatch = dataContent.match(/recordId:\s*([^,}\n]+)/);
    
    // Extract oldValue and newValue (may span multiple lines)
    const oldValueMatch = dataContent.match(/oldValue:\s*({[^}]*}|[^,}\n]+)/s);
    const newValueMatch = dataContent.match(/newValue:\s*({[^}]*}|[^,}\n]+)/s);

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
  });

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
    if (fixFile(filePath)) {
      console.log(`✅ Fixed: ${file}`);
      fixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error);
  }
}

console.log(`\n✅ Fixed ${fixed} files`);



























