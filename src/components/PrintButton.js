"use client";

export default function PrintButton() {
  return (
    <button type="button" className="ec-print" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}
