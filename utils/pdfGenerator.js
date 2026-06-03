/**
 * PDF generation utility — browser-only (html2canvas + jsPDF loaded dynamically).
 * Call generateVoucherPDF() only from client components / event handlers.
 */

/**
 * Captures the DOM element identified by `elementId` and saves it as a
 * multi-page A4 PDF. Handles long documents by slicing the canvas across pages.
 *
 * @param {string} elementId   id attribute of the element to capture
 * @param {string} filename    output filename (default: Arise-Bhutan-Voucher.pdf)
 */
export async function generateVoucherPDF(
  elementId,
  filename = 'Arise-Bhutan-Voucher.pdf'
) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const el = document.getElementById(elementId)
  if (!el) throw new Error(`Element #${elementId} not found`)

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (_doc, clone) => {
      clone.style.width = '1100px'
      clone.style.boxShadow = 'none'
    },
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.93)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = pdf.internal.pageSize.getWidth()   // 210 mm
  const pageH = pdf.internal.pageSize.getHeight()  // 297 mm
  const imgW = pageW
  const imgH = (canvas.height / canvas.width) * imgW

  // First page
  pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH)

  // Additional pages if the voucher is taller than one A4 sheet
  let remaining = imgH - pageH
  let yShift = -pageH
  while (remaining > 1) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, yShift, imgW, imgH)
    yShift -= pageH
    remaining -= pageH
  }

  pdf.save(filename)
}

/**
 * Pure pricing calculator — no browser APIs, safe to call anywhere.
 *
 * @param {object} pricing
 * @param {number} pricing.pricePerPerson
 * @param {number} pricing.pax
 * @param {number} pricing.sdfPerPersonPerNight
 * @param {number} pricing.nights
 * @param {number} [pricing.serviceFeePerPax=150]
 * @param {number} [pricing.gstRate=0.05]
 * @param {number} [pricing.inrRate=83.5]
 * @returns {{ packageTotal, sdfTotal, serviceTotal, subtotal, gst, totalUSD, totalINR }}
 */
export function computePricing(pricing) {
  const {
    pricePerPerson,
    pax,
    sdfPerPersonPerNight,
    nights,
    serviceFeePerPax = 150,
    gstRate = 0.05,
    inrRate = 83.5,
  } = pricing

  const packageTotal  = pricePerPerson * pax
  const sdfTotal      = sdfPerPersonPerNight * nights * pax
  const serviceTotal  = serviceFeePerPax * pax
  const subtotal      = packageTotal + sdfTotal + serviceTotal
  const gst           = parseFloat((subtotal * gstRate).toFixed(2))
  const totalUSD      = parseFloat((subtotal + gst).toFixed(2))
  const totalINR      = Math.round(totalUSD * inrRate)

  return { packageTotal, sdfTotal, serviceTotal, subtotal, gst, totalUSD, totalINR }
}
