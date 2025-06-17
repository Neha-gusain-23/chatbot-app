import jsPDF from 'jspdf';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function exportChatToPDF(messages: ChatMessage[], username: string) {
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text('Chat Export', 20, 20);
  
  // Set subtitle
  doc.setFontSize(12);
  doc.text(`User: ${username}`, 20, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 50);
  
  // Add separator
  doc.line(20, 60, 190, 60);
  
  let yPosition = 80;
  const lineHeight = 8;
  const maxWidth = 170;
  
  messages.forEach((message) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Message header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    const sender = message.sender === 'user' ? 'You' : 'AI Assistant';
    doc.text(`${sender} (${message.timestamp})`, 20, yPosition);
    yPosition += lineHeight;
    
    // Message text
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    // Split text into lines that fit the page width
    const words = message.text.split(' ');
    let line = '';
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && line !== '') {
        doc.text(line, 20, yPosition);
        yPosition += lineHeight;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    
    // Add the last line
    if (line) {
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    }
    
    // Add space between messages
    yPosition += lineHeight / 2;
  });
  
  // Save the PDF
  const filename = `chat_export_${username}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
} 