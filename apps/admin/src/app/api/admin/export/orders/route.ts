import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/require-admin';
import { getAllOrders } from '@static-wears/order-service';

const BRAND   = 'E26B35' as const; // orange
const HEADER  = '1A1A2E' as const; // dark navy
const ALT_ROW = 'F5F5F5' as const;
const WHITE   = 'FFFFFF' as const;
const GREEN   = '22C55E' as const;
const AMBER   = 'F59E0B' as const;
const RED     = 'EF4444' as const;
const BLUE    = '3B82F6' as const;
const VIOLET  = '8B5CF6' as const;

const STATUS_COLOR: Record<string, string> = {
  pending: AMBER, confirmed: GREEN, processing: BLUE,
  shipped: VIOLET, delivered: GREEN, cancelled: RED,
};

function cell(ws: ExcelJS.Worksheet, row: number, col: number): ExcelJS.Cell {
  return ws.getCell(row, col);
}

function styleHeader(c: ExcelJS.Cell, text: string) {
  c.value = text;
  c.font = { bold: true, color: { argb: `FF${WHITE}` }, size: 10, name: 'Calibri' };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER}` } };
  c.border = {
    bottom: { style: 'medium', color: { argb: `FF${BRAND}` } },
    right: { style: 'thin', color: { argb: 'FF2A2A3E' } },
  };
  c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
}

function styleData(c: ExcelJS.Cell, rowIdx: number) {
  c.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: rowIdx % 2 === 0 ? `FF${WHITE}` : `FF${ALT_ROW}` },
  };
  c.border = {
    bottom: { style: 'hair', color: { argb: 'FFE5E5E5' } },
    right: { style: 'hair', color: { argb: 'FFE5E5E5' } },
  };
  c.alignment = { vertical: 'middle' };
  c.font = { name: 'Calibri', size: 10 };
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await getAllOrders();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Static Wears Admin';
  wb.created = new Date();

  // ── SHEET 1: Summary ──────────────────────────────────────────
  const ws1 = wb.addWorksheet('Orders Summary', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  // Title banner
  ws1.mergeCells('A1:J1');
  const title = ws1.getCell('A1');
  title.value = 'STATIC WEARS — ORDERS EXPORT';
  title.font = { bold: true, size: 16, color: { argb: `FF${WHITE}` }, name: 'Calibri' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND}` } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(1).height = 36;

  // Meta row
  ws1.mergeCells('A2:E2');
  ws1.mergeCells('F2:J2');
  const metaLeft = ws1.getCell('A2');
  metaLeft.value = `Exported: ${new Date().toLocaleString('en-GB')}`;
  metaLeft.font = { italic: true, color: { argb: 'FF666666' }, size: 9 };
  metaLeft.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  const metaRight = ws1.getCell('F2');
  const totalRev = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0);
  metaRight.value = `Total Orders: ${orders.length}   |   Revenue: LKR ${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  metaRight.font = { bold: true, color: { argb: `FF${BRAND}` }, size: 9 };
  metaRight.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  metaRight.alignment = { horizontal: 'right' };
  ws1.getRow(2).height = 20;

  // Blank spacer
  ws1.getRow(3).height = 4;

  // Headers
  const summaryHeaders = [
    'Order ID', 'Date', 'Time', 'Customer Name', 'Phone',
    'Shipping Address', 'Items', 'Total (LKR)', 'Status', 'Notes',
  ];
  summaryHeaders.forEach((h, i) => styleHeader(cell(ws1, 4, i + 1), h));
  ws1.getRow(4).height = 24;

  // Data
  orders.forEach((order, idx) => {
    const r = 5 + idx;
    const row = ws1.getRow(r);
    row.height = 20;

    const vals = [
      '#' + order.id.slice(0, 8).toUpperCase(),
      new Date(order.created_at),
      new Date(order.created_at),
      order.shipping_name,
      order.shipping_phone,
      order.shipping_addr,
      order.items?.length ?? 0,
      order.total_amount,
      order.status.toUpperCase(),
      order.notes ?? '',
    ];

    vals.forEach((v, ci) => {
      const c = cell(ws1, r, ci + 1);
      c.value = v;
      styleData(c, idx);

      if (ci === 1) { c.numFmt = 'DD/MM/YYYY'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
      if (ci === 2) { c.numFmt = 'HH:MM'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
      if (ci === 7) {
        c.numFmt = '"LKR "#,##0.00';
        c.font = { bold: true, color: { argb: `FF${BRAND}` }, size: 10, name: 'Calibri' };
      }
      if (ci === 8) {
        const col = STATUS_COLOR[order.status] ?? '888888';
        c.font = { bold: true, color: { argb: `FF${col}` }, size: 9, name: 'Calibri' };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  ws1.columns = [
    { width: 14 }, { width: 13 }, { width: 8 }, { width: 22 },
    { width: 16 }, { width: 32 }, { width: 8 }, { width: 16 },
    { width: 13 }, { width: 24 },
  ];

  // ── SHEET 2: Order Items ──────────────────────────────────────
  const ws2 = wb.addWorksheet('Order Items', {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  ws2.mergeCells('A1:I1');
  const t2 = ws2.getCell('A1');
  t2.value = 'STATIC WEARS — ORDER LINE ITEMS';
  t2.font = { bold: true, size: 16, color: { argb: `FF${WHITE}` }, name: 'Calibri' };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER}` } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 36;

  ws2.mergeCells('A2:I2');
  const m2 = ws2.getCell('A2');
  m2.value = `Exported: ${new Date().toLocaleString('en-GB')}`;
  m2.font = { italic: true, color: { argb: 'FF666666' }, size: 9 };
  m2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  ws2.getRow(2).height = 18;
  ws2.getRow(3).height = 4;

  const itemHeaders = [
    'Order ID', 'Date', 'Customer', 'Product', 'Variant',
    'Qty', 'Unit Price (LKR)', 'Subtotal (LKR)', 'Order Status',
  ];
  itemHeaders.forEach((h, i) => styleHeader(cell(ws2, 4, i + 1), h));
  ws2.getRow(4).height = 24;

  let itemRow = 5;
  let itemIdx = 0;
  orders.forEach((order) => {
    (order.items ?? []).forEach((item) => {
      const r = itemRow++;
      const vals = [
        '#' + order.id.slice(0, 8).toUpperCase(),
        new Date(order.created_at),
        order.shipping_name,
        item.product_name,
        item.variant_desc ?? '—',
        item.quantity,
        item.unit_price,
        item.subtotal,
        order.status.toUpperCase(),
      ];
      vals.forEach((v, ci) => {
        const c = cell(ws2, r, ci + 1);
        c.value = v;
        styleData(c, itemIdx);
        if (ci === 1) { c.numFmt = 'DD/MM/YYYY'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
        if (ci === 5) c.alignment = { horizontal: 'center', vertical: 'middle' };
        if (ci === 6 || ci === 7) {
          c.numFmt = '"LKR "#,##0.00';
          if (ci === 7) c.font = { bold: true, color: { argb: `FF${BRAND}` }, size: 10, name: 'Calibri' };
        }
        if (ci === 8) {
          const col = STATUS_COLOR[order.status] ?? '888888';
          c.font = { bold: true, color: { argb: `FF${col}` }, size: 9, name: 'Calibri' };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      itemIdx++;
    });
  });

  ws2.columns = [
    { width: 14 }, { width: 13 }, { width: 22 }, { width: 28 },
    { width: 18 }, { width: 6 }, { width: 18 }, { width: 18 }, { width: 13 },
  ];

  // Stream
  const buf = await wb.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="staticwears-orders-${date}.xlsx"`,
    },
  });
}
