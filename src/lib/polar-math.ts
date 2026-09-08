/**
 * Mesin kalkulasi koordinat polar & kartesius presisi untuk kanvas jam melingkar.
 * Sistem jam 24 jam: 0 derajat berada tepat di atas (arah jam 12 / 00:00).
 */

export interface Point {
  x: number;
  y: number;
}

export interface PolarCoord {
  radius: number;
  angleInDegrees: number; // 0° - 360° (0° = 00:00 midnight at top)
}

/**
 * Mengonversi titik (x, y) menjadi radius dan sudut derajat melingkar [0, 360).
 */
export function cartesianToPolar(cx: number, cy: number, x: number, y: number): PolarCoord {
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.hypot(dx, dy);

  // Math.atan2 menghasilkan sudut dari sumbu X positif [-PI, PI]
  const angleRad = Math.atan2(dy, dx);
  let angleDeg = (angleRad * 180) / Math.PI;

  // Rotasi sistem: geser +90 derajat agar 0 derajat berada di atas (jam 12)
  let clockDeg = (angleDeg + 90) % 360;
  if (clockDeg < 0) {
    clockDeg += 360;
  }

  return { radius, angleInDegrees: clockDeg };
}

/**
 * Mengonversi sudut derajat (0° di atas, searah jarum jam) & radius kembali ke titik (x, y).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): Point {
  // Geser -90 derajat untuk kembali ke sistem trigonometri standar
  const rad = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * Menghitung selisih sudut searah jarum jam dari startAngle ke endAngle.
 */
export function getClockwiseAngleDelta(startAngle: number, endAngle: number): number {
  let delta = endAngle - startAngle;
  while (delta < 0) delta += 360;
  while (delta > 360) delta -= 360;
  return delta;
}
