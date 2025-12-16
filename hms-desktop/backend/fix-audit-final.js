const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src/controllers');
const files = [
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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Ensure logAudit is imported
  if (!content.includes("import { logAudit }")) {
    const importMatch = content.match(/(import .+ from ['"].+['"];?\n)+/);
    if (importMatch) {
      const lastImport = importMatch[0].split('\n').filter(l => l.trim()).pop();
      const insertPos = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertPos) + 
        "\nimport { logAudit } from '../utils/auditLogger';" + 
        content.slice(insertPos);
    }
  }

  // Replace prisma.auditLog.create({ data: { ... } }) with logAudit({ ... })
  // This regex matches the pattern and extracts the data object content
  content = content.replace(
    /await prisma\.auditLog\.create\(\s*{\s*data:\s*{([\s\S]*?)}\s*}\s*\)/g,
    (match, dataContent) => {
      // Remove leading/trailing whitespace from dataContent
      const cleanData = dataContent.trim();
      return `await logAudit({\n        ${cleanData}\n      })`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

let fixed = 0;
for (const file of files) {
  const filePath = path.join(controllersDir, file);
  try {
    if (fs.existsSync(filePath) && fixFile(filePath)) {
      console.log(`✅ Fixed: ${file}`);
      fixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log(`\n✅ Fixed ${fixed} files`);



























