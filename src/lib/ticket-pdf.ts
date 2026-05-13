import { jsPDF } from "jspdf";
import type { Booking, User } from "@/lib/auth";

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function downloadBookingPdf(booking: Booking, user: User): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFillColor(18, 138, 167);
  doc.rect(0, 0, 595, 88, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TripWave e-Ticket", 40, 54);

  doc.setTextColor(34, 34, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 120;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", 190, y);
    y += 22;
  };

  row("Booking Code", booking.bookingCode || booking.id);
  row("Service", booking.type.toUpperCase());
  row("Title", booking.title);
  row("Traveler", user.fullName);
  row("Email", user.email);
  row("Amount Paid", `${booking.currency} ${booking.amount.toLocaleString("en-IN")}`);
  row("Payment Method", (booking.paymentMethod || "-").toUpperCase());
  row("Transaction", booking.transactionId || "-");
  row("Booked On", formatDate(booking.createdAt));
  row("Paid On", formatDate(booking.paidAt));

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(40, y, 555, y);
  y += 26;

  doc.setFont("helvetica", "bold");
  doc.text("Travel Details", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");

  Object.entries(booking.details).slice(0, 14).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 190, y);
    y += 18;
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
  });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("This is a computer-generated ticket. Please carry a valid ID proof during travel/check-in.", 40, 810);

  const code = booking.bookingCode || booking.id;
  doc.save(`tripwave-ticket-${code}.pdf`);
}
