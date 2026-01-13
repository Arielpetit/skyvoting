import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUserName(email: string | undefined | null, fullName: string | undefined | null): string {
  if (fullName && fullName !== "User" && fullName !== "Anonymous User") return fullName;
  if (!email) return fullName || "User";

  const prefix = email.split('@')[0];
  return prefix
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export const generateVotingReportPDF = (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("SkyVoting - Election Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });

  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Summary", 14, 45);

  const summaryData = [
    ["Total Eligible Voters", data.totalEligible.toString()],
    ["Total Votes Cast", data.totalVotes.toString()],
    ["Absences", data.absences.length.toString()],
    ["Winner", data.winner ? `${data.winner.name} (${data.winner.count} votes, ${data.winner.percentage.toFixed(1)}%)` : "N/A"]
  ];

  (doc as any).autoTable({
    startY: 50,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181] }
  });

  // Results Breakdown
  doc.text("2. Results Breakdown", 14, (doc as any).lastAutoTable.finalY + 15);

  const resultsData = data.votesPerList.map((l: any) => [
    l.name,
    l.count.toString(),
    `${l.percentage.toFixed(1)}%`
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Team Name", "Votes", "Percentage"]],
    body: resultsData,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181] }
  });

  // Voter List
  doc.addPage();
  doc.text("3. Voter List", 14, 20);

  const votersData = data.voters.map((v: any) => [
    v.full_name || "N/A",
    v.email,
    v.list_name,
    new Date(v.voted_at).toLocaleString()
  ]);

  (doc as any).autoTable({
    startY: 25,
    head: [["Name", "Email", "Voted For", "Time"]],
    body: votersData,
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181] }
  });

  // Absences
  doc.text("4. Absences", 14, (doc as any).lastAutoTable.finalY + 15);

  const absencesData = data.absences.map((a: any) => [
    a.full_name || "N/A",
    a.email
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Name", "Email"]],
    body: absencesData,
    theme: 'striped',
    headStyles: { fillColor: [244, 67, 54] }
  });

  doc.save(`SkyVoting_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
