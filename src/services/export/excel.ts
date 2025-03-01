// src/services/export/excel.ts
import ExcelJS from 'exceljs';
import { Board } from '../../types/board.types';

export const exportToExcel = async (board: Board): Promise<void> => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ThinkTank';
  workbook.lastModifiedBy = 'ThinkTank Export Service';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add Summary worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Add title with merged cells
  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'Retrospective Board Summary';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  // Add summary information
  summarySheet.getCell('A3').value = 'Title';
  summarySheet.getCell('B3').value = board.title || 'Retrospective Board';
  
  summarySheet.getCell('A4').value = 'Export Date';
  summarySheet.getCell('B4').value = new Date().toLocaleDateString();
  
  if (board.createdAt) {
    summarySheet.getCell('A5').value = 'Created Date';
    summarySheet.getCell('B5').value = board.createdAt.toDate().toLocaleDateString();
  }
  
  summarySheet.getCell('A6').value = 'Total Sections';
  summarySheet.getCell('B6').value = board.sections.length;
  
  summarySheet.getCell('A7').value = 'Total Notes';
  summarySheet.getCell('B7').value = board.sections.reduce(
    (count, section) => count + (section.notes?.length || 0), 0
  );
  
  // Add styling
  ['A3', 'A4', 'A5', 'A6', 'A7'].forEach(cell => {
    summarySheet.getCell(cell).font = { bold: true };
  });
  
  // Auto size columns
  summarySheet.columns.forEach(column => {
    column.width = 20;
  });
  
  // For each section, create a worksheet
  board.sections.forEach((section, index) => {
    // Excel sheet name limit and invalid char handling
    let sheetName = section.title.slice(0, 31).replace(/[[\]*?/\\:]/g, '_');
    if (!sheetName || sheetName.trim() === '') {
      sheetName = `Section ${index + 1}`;
    }
    
    const sectionSheet = workbook.addWorksheet(sheetName);
    
    // Add section title
    sectionSheet.mergeCells('A1:D1');
    const sectionTitleCell = sectionSheet.getCell('A1');
    sectionTitleCell.value = section.title;
    sectionTitleCell.font = { size: 14, bold: true };
    sectionTitleCell.alignment = { horizontal: 'center' };
    
    // Add header row
    const headerRow = sectionSheet.addRow(['Note', 'Created', 'Votes']);
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4285F4' }  // Google blue
      };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
    });
    
    // Add notes
    const notes = section.notes || [];
    if (notes.length === 0) {
      sectionSheet.addRow(['No notes in this section', '', '', '']);
    } else {
      notes.forEach(note => {
        sectionSheet.addRow([
          note.content,
          note.createdAt.toDate().toLocaleString(),
          note.votes || 0
        ]);
      });
    }
    
    // Set column widths
    sectionSheet.getColumn(1).width = 50;  // Note content
    sectionSheet.getColumn(3).width = 20;  // Created date
    sectionSheet.getColumn(4).width = 10;  // Votes
  });
  
  // Generate filename
  const fileName = `${(board.title || 'Retrospective_Board').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Write file and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link and trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};