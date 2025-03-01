// src/services/export/pdf.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Board } from '../../types/board.types';

export const exportToPdf = async (board: Board): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set title
  const title = board.title || 'Retrospective Board';
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  const date = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Generated on: ${date}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add metadata if available
  if (board.createdAt) {
    const createdDate = board.createdAt.toDate().toLocaleDateString();
    doc.text(`Created on: ${createdDate}`, pageWidth / 2, 40, { align: 'center' });
  }
  
  doc.line(20, 45, pageWidth - 20, 45);
  
  let yPos = 55;
  
  // Loop through each section
  board.sections.forEach((section) => {
    // Check if we need a new page (leaving a 20pt margin at bottom)
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add section title
    doc.setFontSize(16);
    doc.text(section.title, 20, yPos);
    yPos += 10;
    
    // Create table data for notes
    const notes = section.notes || [];
    
    if (notes.length === 0) {
      doc.setFontSize(12);
      doc.text('No notes in this section', 20, yPos);
      yPos += 15;
    } else {
      // Prepare table data
      const tableData = notes.map(note => {
        // Count upvotes
        const upvotes = note.votes ? note.votes.filter(vote => vote.type === 'up').length : 0;
        
        return [
          note.content,
          note.createdAt.toDate().toLocaleString(),
          upvotes.toString()
        ];
      });
      
      // Add table with notes
      autoTable(doc, {
        startY: yPos,
        head: [['Note', 'Created', 'Upvotes']],
        body: tableData,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: [99, 102, 241] }, // Indigo color
        alternateRowStyles: { fillColor: [240, 240, 240] },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 'auto' },
          2: { cellWidth: 40 },
          3: { cellWidth: 20 }
        },
      });
      
      // Get final Y position after table is added
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
  });
  
  // Add a footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `ThinkTank - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF - will trigger download
  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
};