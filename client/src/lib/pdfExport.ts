import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * PDF EXPORT UTILITIES
 * 
 * Generate professional PDF reports for:
 * - Weekly progress summaries
 * - Monthly transformation reports
 * - Health/stress/identity data exports
 */

export interface ProgressData {
  userName: string;
  reportPeriod: string;
  healthLogs?: any[];
  stressSessions?: any[];
  identitySnapshots?: any[];
  achievements?: any[];
  milestones?: any[];
}

export function generateProgressReport(data: ProgressData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('Purposeful Live Coaching', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Progress Report', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.userName} • ${data.reportPeriod}`, 20, 37);
  
  let yPos = 50;

  // Health Summary
  if (data.healthLogs && data.healthLogs.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Health Tracking', 20, yPos);
    yPos += 10;

    const healthData = data.healthLogs.map((log: any) => [
      new Date(log.date).toLocaleDateString(),
      `${log.movement}/10`,
      `${log.nutrition}/10`,
      `${log.sleep}/10`,
      `${log.hydration}/10`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Movement', 'Nutrition', 'Sleep', 'Hydration']],
      body: healthData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Stress Relief Summary
  if (data.stressSessions && data.stressSessions.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Stress Relief Sessions', 20, yPos);
    yPos += 10;

    const stressData = data.stressSessions.map((session: any) => [
      new Date(session.startedAt).toLocaleDateString(),
      session.type,
      `${session.duration}min`,
      session.completed ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Type', 'Duration', 'Completed']],
      body: stressData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Achievements Unlocked', 20, yPos);
    yPos += 10;

    const achievementData = data.achievements.map((achievement: any) => [
      achievement.title,
      achievement.description,
      `+${achievement.points} pts`,
      new Date(achievement.earnedAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Achievement', 'Description', 'Points', 'Date']],
      body: achievementData,
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Milestones
  if (data.milestones && data.milestones.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Milestones', 20, yPos);
    yPos += 10;

    const milestoneData = data.milestones.map((milestone: any) => [
      milestone.title,
      milestone.status,
      new Date(milestone.targetDate).toLocaleDateString(),
      milestone.completedAt ? new Date(milestone.completedAt).toLocaleDateString() : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Milestone', 'Status', 'Target Date', 'Completed']],
      body: milestoneData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} • Generated ${new Date().toLocaleDateString()}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadProgressReport(data: ProgressData) {
  const doc = generateProgressReport(data);
  const filename = `progress-report-${data.reportPeriod.replace(/\s/g, '-')}.pdf`;
  doc.save(filename);
}
