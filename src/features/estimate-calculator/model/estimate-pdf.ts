import { jsPDF } from 'jspdf'
import { autoTable, type RowInput } from 'jspdf-autotable'

import type { SelectedEstimateSectionWithZones } from '@/entities/estimate'
import { company } from '@/shared/config/company'
import regularUrl from '@/assets/fonts/estimate-regular.ttf?url'
import semiboldUrl from '@/assets/fonts/estimate-semibold.ttf?url'
import { documentFilename, type EstimateDocumentDetails } from './estimate-document'

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 20 })
    .format(value)
    .replaceAll('\u00a0', ' ')

async function fontData(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Не удалось загрузить шрифт PDF')
  const bytes = new Uint8Array(await response.arrayBuffer())
  let result = ''
  for (let i = 0; i < bytes.length; i += 8192)
    result += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(result)
}

async function brandMark(): Promise<{ data: string; ratio: number }> {
  const logo = new Image()
  logo.src = `${import.meta.env.BASE_URL}images/anfas-logo-official.svg`
  await logo.decode()
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = Math.ceil((canvas.width * logo.naturalHeight) / logo.naturalWidth)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Не удалось подготовить логотип')
  context.drawImage(logo, 0, 0, canvas.width, canvas.height)
  return { data: canvas.toDataURL('image/png'), ratio: logo.naturalWidth / logo.naturalHeight }
}

export async function createEstimatePdf(
  sections: readonly SelectedEstimateSectionWithZones[],
  details: EstimateDocumentDetails,
): Promise<jsPDF> {
  const [regular, semibold, logo] = await Promise.all([
    fontData(regularUrl),
    fontData(semiboldUrl),
    brandMark(),
  ])
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.addFileToVFS('Montserrat-Regular.ttf', regular)
  doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal')
  doc.addFileToVFS('Montserrat-Semibold.ttf', semibold)
  doc.addFont('Montserrat-Semibold.ttf', 'Montserrat', 'bold')
  doc.setProperties({ title: `Смета ${details.number} | Анфас`, author: company.name })
  doc.setFont('Montserrat', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(22, 23, 19)
  doc.addImage(logo.data, 'PNG', 14, 12, 70, 70 / logo.ratio)
  doc.setFont('Montserrat', 'normal')
  doc.setFontSize(8)
  doc.text([company.phone, company.email], 196, 15, { align: 'right' })
  doc.setDrawColor(182, 143, 82)
  doc.line(14, 25, 196, 25)
  doc.setFont('Montserrat', 'bold')
  doc.setFontSize(15)
  doc.text('Смета на ремонтные работы', 14, 34)
  const date = details.date.split('-').reverse().join('.')
  const info = [
    `№ ${details.number || 'б/н'}  ·  ${date}`,
    details.customer && `Заказчик: ${details.customer}`,
    details.object && `Объект: ${details.object}`,
    details.estimator && `Составил: ${details.estimator}`,
  ].filter(Boolean) as string[]
  autoTable(doc, {
    startY: 39,
    margin: { left: 14, right: 14, bottom: 20 },
    body: info.map((text) => [text]),
    theme: 'plain',
    styles: { font: 'Montserrat', fontSize: 9, cellPadding: 1.5, textColor: [22, 23, 19] },
  })
  let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  const body: RowInput[] = []
  let count = 0
  for (const section of sections) {
    body.push([
      {
        content: section.sectionTitle,
        colSpan: 7,
        styles: { fillColor: [22, 23, 19], textColor: [255, 255, 255], fontStyle: 'bold' },
      },
    ])
    for (const zone of section.zones) {
      body.push([
        {
          content: zone.zoneTitle,
          colSpan: 7,
          styles: { fillColor: [240, 236, 230], fontStyle: 'bold' },
        },
      ])
      for (const item of zone.items) {
        const line = item.line
        body.push([
          ++count,
          line.title,
          line.unit,
          money(line.quantity),
          money(line.unitPrice),
          money(line.coefficient),
          money(item.lineTotal),
        ])
      }
    }
    body.push([
      { content: `Итого: ${section.sectionTitle}`, colSpan: 6, styles: { fontStyle: 'bold' } },
      { content: money(section.subtotalRub), styles: { fontStyle: 'bold', halign: 'right' } },
    ])
  }
  body.push([
    {
      content: 'ИТОГО ЗА РАБОТЫ, РУБ.',
      colSpan: 6,
      styles: { fontStyle: 'bold', fillColor: [231, 219, 198] },
    },
    {
      content: money(sections.reduce((sum, s) => sum + s.subtotalRub, 0)),
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [231, 219, 198] },
    },
  ])
  autoTable(doc, {
    startY: y,
    margin: { top: 17, left: 14, right: 14, bottom: 20 },
    head: [['№', 'Наименование работ', 'Ед.', 'Объём', 'Цена, ₽', 'Коэф.', 'Сумма, ₽']],
    body,
    theme: 'grid',
    rowPageBreak: 'avoid',
    styles: {
      font: 'Montserrat',
      fontSize: 8,
      cellPadding: 2,
      lineColor: [218, 216, 210],
      lineWidth: 0.15,
      overflow: 'linebreak',
      textColor: [22, 23, 19],
    },
    headStyles: { fillColor: [240, 236, 230], textColor: [22, 23, 19], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 9 },
      1: { cellWidth: 69 },
      2: { cellWidth: 19 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 23, halign: 'right' },
      5: { cellWidth: 15, halign: 'right' },
      6: { cellWidth: 29, halign: 'right' },
    },
    didDrawCell(data) {
      if (data.section !== 'body' || !data.cursor || data.column.index + data.cell.colSpan !== 7)
        return
      const nextRows = data.table.body.slice(data.row.index + 1)
      const isHeading = (row: typeof data.row) => row.cells[0]?.colSpan === 7
      let height = 0
      let index = 0
      while (nextRows[index] && isHeading(nextRows[index])) height += nextRows[index++].height
      if (!nextRows[index] || nextRows[index].cells[0]?.colSpan === 6) return
      const hasHeading = index > 0
      height += nextRows[index++].height
      let hasTotal = false
      while (nextRows[index]?.cells[0]?.colSpan === 6) {
        hasTotal = true
        height += nextRows[index++].height
      }
      if (!hasHeading && !hasTotal) return
      // Let AutoTable perform the page break and repeat column headers. Keep
      // headings with their first work and totals with their last work.
      const pageHeight = doc.internal.pageSize.getHeight()
      const freshPageSpace = pageHeight - 17 - 20 - data.table.getHeadHeight(data.table.columns)
      if (height <= freshPageSpace && data.cursor.y + data.row.height + height > pageHeight - 20) {
        data.cursor.y = pageHeight
      }
    },
  })
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  autoTable(doc, {
    startY: y,
    margin: { top: 17, left: 14, right: 14, bottom: 20 },
    theme: 'plain',
    body: [
      ['Стоимость материалов не включена.'],
      ...(details.note.trim() ? [[details.note.trim()]] : []),
    ],
    styles: { font: 'Montserrat', fontSize: 8, cellPadding: 1.5, textColor: [70, 70, 65] },
  })
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFont('Montserrat', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(90, 90, 85)
    doc.text(`Анфас · Смета ${details.number.slice(0, 25) || 'б/н'} · ${date}`, 14, 288)
    doc.text(`${page} / ${pages}`, 196, 288, { align: 'right' })
  }
  return doc
}

export async function downloadEstimatePdf(
  sections: readonly SelectedEstimateSectionWithZones[],
  details: EstimateDocumentDetails,
): Promise<void> {
  const doc = await createEstimatePdf(sections, details)
  doc.save(documentFilename(details, 'pdf'))
}
