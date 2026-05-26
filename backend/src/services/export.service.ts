import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class ExportService {
  /**
   * Generates a CSV formatted string from a list of post documents
   */
  public generateCSV(posts: any[]): string {
    const headers = [
      'Post ID',
      'Platform',
      'Author Handle',
      'Original Content',
      'Language',
      'Category',
      'Sentiment Label',
      'Sentiment Score',
      'Likes',
      'Comments',
      'Shares',
      'Country',
      'Timestamp'
    ];

    const rows = posts.map(post => {
      return [
        post.postId || '',
        post.platform || '',
        post.author?.handle || '',
        // Replace newlines and escape quotes for CSV compatibility
        `"${(post.originalContent || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        post.language || 'en',
        post.category || '',
        post.sentiment?.label || '',
        post.sentiment?.score || 0,
        post.engagement?.likes || 0,
        post.engagement?.comments || 0,
        post.engagement?.shares || 0,
        post.country || 'Global',
        post.timestamp ? new Date(post.timestamp).toISOString() : ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Generates a highly stylized executive PDF report and pipes it directly to the Express HTTP response
   */
  public generatePDF(posts: any[], filtersUsed: Record<string, any>, res: Response): void {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set response headers for PDF stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=passport-scraping-executive-report.pdf');

    doc.pipe(res);

    // 1. Header (Banner accent in deep indigo)
    doc
      .rect(0, 0, 595.28, 80)
      .fill('#1e1b4b'); // deep indigo background

    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('PASSPORT ANALYTICS SYSTEM', 40, 20);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#a5b4fc')
      .text('Social Media Monitoring & Sentiment Intelligence Executive Report', 40, 48);

    doc.moveDown(4);

    // 2. Report Overview Table
    doc
      .fillColor('#1f2937')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Report Overview', 40, 100);

    // Draw card borders
    doc
      .rect(40, 120, 515, 60)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#4b5563')
      .text('Report Date:', 50, 130)
      .font('Helvetica')
      .text(new Date().toLocaleString(), 130, 130);

    doc
      .font('Helvetica-Bold')
      .text('Records Processed:', 50, 145)
      .font('Helvetica')
      .text(posts.length.toString(), 160, 145);

    doc
      .font('Helvetica-Bold')
      .text('Active Filters:', 50, 160)
      .font('Helvetica')
      .text(JSON.stringify(filtersUsed).slice(0, 75) + (JSON.stringify(filtersUsed).length > 75 ? '...' : ''), 130, 160);

    // Quick Stats Overview (Calculations)
    let positives = 0;
    let negatives = 0;
    let neutrals = 0;
    posts.forEach(p => {
      if (p.sentiment?.label === 'positive') positives++;
      else if (p.sentiment?.label === 'negative') negatives++;
      else neutrals++;
    });

    doc
      .font('Helvetica-Bold')
      .text('Sentiment Ratio:', 320, 130)
      .font('Helvetica')
      .text(`Pos: ${positives} | Neg: ${negatives} | Neu: ${neutrals}`, 410, 130);

    doc.moveDown(5);

    // 3. Document details table header
    doc
      .fillColor('#1f2937')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Detailed Mentions Ingested (Last 24 Hours)', 40, 200);

    let yPosition = 225;

    // Draw Table Headers
    doc
      .rect(40, yPosition, 515, 20)
      .fill('#f3f4f6');

    doc
      .fillColor('#374151')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Platform', 45, yPosition + 6)
      .text('User / Author', 110, yPosition + 6)
      .text('Category', 220, yPosition + 6)
      .text('Sentiment', 310, yPosition + 6)
      .text('Content Summary', 380, yPosition + 6);

    yPosition += 20;

    // Draw rows (limits to top 15 posts in PDF for readability, else points to full CSV)
    const displayPosts = posts.slice(0, 15);

    doc.font('Helvetica').fontSize(8).fillColor('#1f2937');

    displayPosts.forEach((post, index) => {
      // Background shading for alternating rows
      if (index % 2 === 0) {
        doc
          .rect(40, yPosition, 515, 25)
          .fill('#f9fafb');
      }

      // Border separation line
      doc
        .moveTo(40, yPosition + 25)
        .lineTo(555, yPosition + 25)
        .strokeColor('#f3f4f6')
        .stroke();

      // Platform badge coloring helper
      let platformColor = '#4b5563';
      if (post.platform === 'twitter') platformColor = '#1d9bf0';
      else if (post.platform === 'reddit') platformColor = '#ff4500';
      else if (post.platform === 'youtube') platformColor = '#ff0000';

      doc
        .fillColor(platformColor)
        .font('Helvetica-Bold')
        .text((post.platform || '').toUpperCase(), 45, yPosition + 8);

      doc
        .fillColor('#1f2937')
        .font('Helvetica')
        .text(post.author?.handle || post.author?.username || 'user', 110, yPosition + 8, { width: 100, ellipsis: true });

      doc
        .text(post.category || 'General', 220, yPosition + 8, { width: 80, ellipsis: true });

      // Sentiment label styling
      let sentColor = '#6b7280';
      if (post.sentiment?.label === 'positive') sentColor = '#10b981';
      else if (post.sentiment?.label === 'negative') sentColor = '#ef4444';

      doc
        .fillColor(sentColor)
        .font('Helvetica-Bold')
        .text((post.sentiment?.label || 'neutral').toUpperCase(), 310, yPosition + 8);

      doc
        .fillColor('#374151')
        .font('Helvetica')
        // Truncate original content slightly for PDF grid
        .text(
          (post.summary || post.originalContent || '').substring(0, 45) + '...',
          380,
          yPosition + 8,
          { width: 170, ellipsis: true }
        );

      yPosition += 25;

      // Handle page break
      if (yPosition > 740) {
        doc.addPage();
        yPosition = 40;
      }
    });

    if (posts.length > 15) {
      doc
        .moveDown(2)
        .fillColor('#6b7280')
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(`* Showing first 15 of ${posts.length} entries. Please use CSV export for full details.`, 40, yPosition + 20);
    }

    doc.end();
  }
}

export default new ExportService();
