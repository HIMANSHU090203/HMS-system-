import * as XLSX from 'xlsx';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export interface ParsedMedicine {
  name: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  therapeuticClass?: string;
  atcCode?: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  expiryDate?: Date;
}

export class FileParserService {
  static async parseExcel(filePath: string): Promise<ParsedMedicine[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map((row: any) => ({
      name: row['Medicine Name'] || row['Name'] || row['medicine_name'] || '',
      genericName: row['Generic Name'] || row['Generic'] || row['generic_name'] || '',
      manufacturer: row['Manufacturer'] || row['Company'] || row['manufacturer'] || '',
      category: row['Category'] || row['Type'] || row['category'] || 'General',
      therapeuticClass: row['Therapeutic Class'] || row['Therapeutic'] || row['therapeutic_class'] || '',
      atcCode: row['ATC Code'] || row['ATC'] || row['atc_code'] || '',
      price: parseFloat(row['Price'] || row['Cost'] || row['price'] || '0'),
      stockQuantity: parseInt(row['Quantity'] || row['Stock'] || row['stock_quantity'] || '0'),
      lowStockThreshold: parseInt(row['Low Stock Threshold'] || row['Threshold'] || row['low_stock_threshold'] || '10'),
      expiryDate: row['Expiry Date'] || row['expiry_date'] ? new Date(row['Expiry Date'] || row['expiry_date']) : undefined
    }));
  }

  static async parsePDF(filePath: string): Promise<ParsedMedicine[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await (pdfParse as any)(dataBuffer);
    
    const medicines: ParsedMedicine[] = [];
    const lines = data.text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
    
    // Try to detect table structure
    // Look for header row patterns
    let headerRowIndex = -1;
    const headerPatterns = [
      /medicine.*name/i,
      /generic.*name/i,
      /manufacturer/i,
      /category/i,
      /price/i,
      /quantity|stock/i
    ];
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const headerMatches = headerPatterns.filter(pattern => pattern.test(lines[i]));
      if (headerMatches.length >= 3) {
        headerRowIndex = i;
        break;
      }
    }
    
    // If header found, parse table structure
    if (headerRowIndex >= 0) {
      const headerLine = lines[headerRowIndex];
      // Detect column separators (tabs, multiple spaces, or pipes)
      const isTabSeparated = headerLine.includes('\t');
      const isPipeSeparated = headerLine.includes('|');
      
      // Extract column indices
      const columns = this.extractPDFColumns(headerLine, isTabSeparated, isPipeSeparated);
      
      // Parse data rows
      for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const medicine = this.parsePDFRow(lines[i], columns, isTabSeparated, isPipeSeparated);
        if (medicine && medicine.name) {
          medicines.push(medicine);
        }
      }
    } else {
      // Fallback: Try to parse as space-separated or comma-separated
      for (const line of lines) {
        // Skip lines that look like headers or are too short
        if (line.length < 10 || /^[^\w]/.test(line)) continue;
        
        // Try different separators
        let parts: string[] = [];
        if (line.includes('\t')) {
          parts = line.split('\t');
        } else if (line.includes('|')) {
          parts = line.split('|').map(p => p.trim());
        } else if (line.includes(',')) {
          parts = line.split(',').map(p => p.trim());
        } else {
          // Try to split by multiple spaces (table format)
          parts = line.split(/\s{2,}/).map(p => p.trim());
        }
        
        if (parts.length >= 3) {
          const medicine = this.parsePDFRowParts(parts);
          if (medicine && medicine.name) {
            medicines.push(medicine);
          }
        }
      }
    }
    
    return medicines;
  }
  
  private static extractPDFColumns(headerLine: string, isTabSeparated: boolean, isPipeSeparated: boolean): Map<string, number> {
    const columns = new Map<string, number>();
    let parts: string[] = [];
    
    if (isTabSeparated) {
      parts = headerLine.split('\t');
    } else if (isPipeSeparated) {
      parts = headerLine.split('|').map(p => p.trim());
    } else {
      parts = headerLine.split(/\s{2,}/).map(p => p.trim());
    }
    
    parts.forEach((part, index) => {
      const normalized = part.toLowerCase().trim();
      if (normalized.includes('medicine') || normalized.includes('name')) {
        columns.set('name', index);
      } else if (normalized.includes('generic')) {
        columns.set('genericName', index);
      } else if (normalized.includes('manufacturer') || normalized.includes('company')) {
        columns.set('manufacturer', index);
      } else if (normalized.includes('category') || normalized.includes('type')) {
        columns.set('category', index);
      } else if (normalized.includes('therapeutic') || normalized.includes('class')) {
        columns.set('therapeuticClass', index);
      } else if (normalized.includes('atc')) {
        columns.set('atcCode', index);
      } else if (normalized.includes('price') || normalized.includes('cost')) {
        columns.set('price', index);
      } else if (normalized.includes('quantity') || normalized.includes('stock')) {
        columns.set('stockQuantity', index);
      } else if (normalized.includes('threshold') || normalized.includes('low')) {
        columns.set('lowStockThreshold', index);
      } else if (normalized.includes('expiry') || normalized.includes('exp')) {
        columns.set('expiryDate', index);
      }
    });
    
    return columns;
  }
  
  private static parsePDFRow(row: string, columns: Map<string, number>, isTabSeparated: boolean, isPipeSeparated: boolean): ParsedMedicine | null {
    let parts: string[] = [];
    
    if (isTabSeparated) {
      parts = row.split('\t');
    } else if (isPipeSeparated) {
      parts = row.split('|').map(p => p.trim());
    } else {
      parts = row.split(/\s{2,}/).map(p => p.trim());
    }
    
    if (parts.length === 0) return null;
    
    return this.parsePDFRowParts(parts, columns);
  }
  
  private static parsePDFRowParts(parts: string[], columns?: Map<string, number>): ParsedMedicine | null {
    if (parts.length < 2) return null;
    
    // If columns map provided, use it
    if (columns && columns.size > 0) {
      const getValue = (key: string): string | undefined => {
        const index = columns.get(key);
        return index !== undefined && parts[index] ? parts[index].trim() : undefined;
      };
      
      const name = getValue('name') || parts[0];
      if (!name || name.length < 2) return null;
      
      return {
        name: name,
        genericName: getValue('genericName'),
        manufacturer: getValue('manufacturer'),
        category: getValue('category') || 'General',
        therapeuticClass: getValue('therapeuticClass'),
        atcCode: getValue('atcCode'),
        price: parseFloat(getValue('price') || parts.find(p => /^\d+\.?\d*$/.test(p)) || '0') || 0,
        stockQuantity: parseInt(getValue('stockQuantity') || parts.find(p => /^\d+$/.test(p)) || '0') || 0,
        lowStockThreshold: parseInt(getValue('lowStockThreshold') || '10') || 10,
        expiryDate: getValue('expiryDate') ? this.parseDate(getValue('expiryDate')!) : undefined
      };
    }
    
    // Fallback: assume first column is name, try to find numbers for price and quantity
    const name = parts[0];
    if (!name || name.length < 2) return null;
    
    // Find price (usually a decimal number)
    let price = 0;
    let stockQuantity = 0;
    for (let i = 1; i < parts.length; i++) {
      const num = parseFloat(parts[i]);
      if (!isNaN(num)) {
        if (num % 1 !== 0 && price === 0) {
          // Decimal number, likely price
          price = num;
        } else if (num % 1 === 0 && stockQuantity === 0) {
          // Integer, likely quantity
          stockQuantity = num;
        }
      }
    }
    
    return {
      name: name,
      genericName: parts.length > 1 && !/^\d/.test(parts[1]) ? parts[1] : undefined,
      manufacturer: parts.length > 2 && !/^\d/.test(parts[2]) ? parts[2] : undefined,
      category: 'General',
      price: price,
      stockQuantity: stockQuantity,
      lowStockThreshold: 10
    };
  }
  
  private static parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    
    // Try various date formats
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          return new Date(`${match[1]}-${match[2]}-${match[3]}`);
        } else if (format === formats[1]) {
          return new Date(`${match[3]}-${match[1]}-${match[2]}`);
        } else {
          return new Date(`${match[3]}-${match[2]}-${match[1]}`);
        }
      }
    }
    
    // Try direct Date parsing
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  static async parseWord(filePath: string): Promise<ParsedMedicine[]> {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    
    // Basic Word parsing - customize based on your document format
    const lines = text.split('\n');
    const medicines: ParsedMedicine[] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          medicines.push({
            name: parts[0],
            price: parseFloat(parts[1]) || 0,
            stockQuantity: parseInt(parts[2]) || 0,
            lowStockThreshold: 10,
            category: 'General'
          });
        }
      }
    }
    
    return medicines;
  }

  static async parseFile(filePath: string, fileType: string): Promise<ParsedMedicine[]> {
    switch (fileType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return this.parseExcel(filePath);
      case 'application/pdf':
        return this.parsePDF(filePath);
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseWord(filePath);
      default:
        throw new Error('Unsupported file type');
    }
  }
}
