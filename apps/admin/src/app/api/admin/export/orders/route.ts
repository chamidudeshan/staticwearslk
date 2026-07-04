import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/require-admin';
import { getAllOrders } from '@static-wears/order-service';
import type { Order } from '@static-wears/shared';

// ── Palette ────────────────────────────────────────────────
const C = {
  brand:     'FFE26B35',
  headerBg:  'FF1A1A2E',
  white:     'FFFFFFFF',
  lightGray: 'FFF5F5F5',
  midGray:   'FFE0E0E0',
  textGray:  'FF555555',
  pending:   'FFF59E0B',
  confirmed: 'FF22C55E',
  processing:'FF3B82F6',
  shipped:   'FF8B5CF6',
  delivered: 'FF16A34A',
  cancelled: 'FFEF4444',
} as const;

const STATUS_META: Record<string, { color: string; tab: string; label: string }> = {
  pending:    { color: C.pending,    tab: 'F59E0B', label: 'PENDING'    },
  confirmed:  { color: C.confirmed,  tab: '22C55E', label: 'CONFIRMED'  },
  processing: { color: C.processing, tab: '3B82F6', label: 'PROCESSING' },
  shipped:    { color: C.shipped,    tab: '8B5CF6', label: 'SHIPPED'    },
  delivered:  { color: C.delivered,  tab: '16A34A', label: 'DELIVERED'  },
  cancelled:  { color: C.cancelled,  tab: 'EF4444', label: 'CANCELLED'  },
};

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const ORDER_COLS   = [14, 13, 8, 24, 16, 34, 8, 16, 14, 26];

// ── Helpers ────────────────────────────────────────────────
function applyHeaderCell(c: ExcelJS.Cell, text: string) {
  c.value = text;
  c.font  = { bold: true, color: { argb: C.white }, size: 10, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  c.border = {
    bottom: { style: 'medium', color: { argb: C.brand } },
    right:  { style: 'thin',   color: { argb: 'FF2A2A3E' } },
  };
  c.alignment = { vertical: 'middle', horizontal: 'center' };
}

function applyDataCell(c: ExcelJS.Cell, rowIdx: number) {
  c.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: rowIdx % 2 === 0 ? C.white : C.lightGray },
  };
  c.border = {
    bottom: { style: 'hair', color: { argb: C.midGray } },
    right:  { style: 'hair', color: { argb: C.midGray } },
  };
  c.alignment = { vertical: 'middle' };
  c.font = { name: 'Calibri', size: 10 };
}

function titleBanner(ws: ExcelJS.Worksheet, text: string, cols: number) {
  ws.mergeCells(1, 1, 1, cols);
  const c = ws.getCell(1, 1);
  c.value = text;
  c.font  = { bold: true, size: 16, color: { argb: C.white }, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.brand } };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 38;
}

function metaBanner(ws: ExcelJS.Worksheet, text: string, cols: number, row: number) {
  ws.mergeCells(row, 1, row, cols);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font  = { italic: true, color: { argb: C.textGray }, size: 9, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightGray } };
  ws.getRow(row).height = 18;
}

function writeOrderSheet(wb: ExcelJS.Workbook, status: string, orders: Order[]) {
  const meta  = STATUS_META[status];
  const label = meta?.label ?? status.toUpperCase();

  const ws = wb.addWorksheet(label, {
    views:     [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { fitToPage: true, orientation: 'landscape' },
    properties: { tabColor: { argb: `FF${meta?.tab ?? '888888'}` } },
  });

  titleBanner(ws, `STATIC WEARS — ${label} ORDERS`, 10);
  metaBanner(ws, `Exported: ${new Date().toLocaleString('en-GB')}   |   ${orders.length} order(s)`, 10, 2);
  ws.getRow(3).height = 4;

  const headers = [
    'Order ID', 'Date', 'Time', 'Customer Name', 'Phone',
    'Shipping Address', 'Items', 'Total (LKR)', 'Status', 'Notes',
  ];
  headers.forEach((h, i) => applyHeaderCell(ws.getCell(4, i + 1), h));
  ws.getRow(4).height = 24;

  orders.forEach((order, idx) => {
    const r   = 5 + idx;
    const row = ws.getRow(r);
    row.height = 20;

    const vals: unknown[] = [
      '#' + order.id.slice(0, 8).toUpperCase(),
      new Date(order.created_at),
      new Date(order.created_at),
      order.shipping_name ?? '—',
      order.shipping_phone ?? '—',
      order.shipping_addr ?? '—',
      order.items?.length ?? 0,
      order.total_amount,
      label,
      order.notes ?? '',
    ];

    vals.forEach((v, ci) => {
      const c = ws.getCell(r, ci + 1);
      c.value = v as ExcelJS.CellValue;
      applyDataCell(c, idx);

      if (ci === 1) { c.numFmt = 'DD/MM/YYYY'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
      if (ci === 2) { c.numFmt = 'HH:MM';      c.alignment = { horizontal: 'center', vertical: 'middle' }; }
      if (ci === 6)  c.alignment = { horizontal: 'center', vertical: 'middle' };
      if (ci === 7) {
        c.numFmt = '"LKR "#,##0.00';
        c.font   = { bold: true, color: { argb: C.brand }, size: 10, name: 'Calibri' };
      }
      if (ci === 8) {
        c.font      = { bold: true, color: { argb: meta?.color ?? C.brand }, size: 9, name: 'Calibri' };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Total row
  if (orders.length > 0) {
    const totalRow = 5 + orders.length;
    ws.getRow(totalRow).height = 22;
    ws.mergeCells(totalRow, 1, totalRow, 7);
    const labelCell = ws.getCell(totalRow, 1);
    labelCell.value = 'TOTAL';
    labelCell.font  = { bold: true, color: { argb: C.white }, size: 10, name: 'Calibri' };
    labelCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    labelCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const totalCell = ws.getCell(totalRow, 8);
    totalCell.value  = orders.reduce((s, o) => s + o.total_amount, 0);
    totalCell.numFmt = '"LKR "#,##0.00';
    totalCell.font   = { bold: true, color: { argb: C.brand }, size: 11, name: 'Calibri' };
    totalCell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    totalCell.alignment = { vertical: 'middle' };
    ws.mergeCells(totalRow, 9, totalRow, 10);
    ws.getCell(totalRow, 9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  }

  ws.columns = ORDER_COLS.map(w => ({ width: w }));
  return ws;
}

// ── Main handler ───────────────────────────────────────────
export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await getAllOrders();
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Static Wears Admin';
  wb.created  = new Date();

  // ── SHEET 1: Dashboard ──────────────────────────────────
  const dash = wb.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: 'FFE26B35' } },
  });

  titleBanner(dash, 'STATIC WEARS — ORDERS DASHBOARD', 6);
  metaBanner(dash, `Report generated: ${new Date().toLocaleString('en-GB')}`, 6, 2);
  dash.getRow(3).height = 6;

  // Section heading
  dash.mergeCells('A4:F4');
  const secHead = dash.getCell('A4');
  secHead.value = 'ORDER STATUS BREAKDOWN';
  secHead.font  = { bold: true, color: { argb: C.white }, size: 11, name: 'Calibri' };
  secHead.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  secHead.alignment = { horizontal: 'center', vertical: 'middle' };
  dash.getRow(4).height = 22;

  // Stats table headers
  const statHeaders = ['Status', 'Orders', 'Revenue (LKR)', '% of Orders', '% of Revenue', 'Avg Order (LKR)'];
  statHeaders.forEach((h, i) => applyHeaderCell(dash.getCell(5, i + 1), h));
  dash.getRow(5).height = 22;

  const totalRevenue   = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0);
  const totalAllOrders = orders.length;

  STATUS_ORDER.forEach((status, idx) => {
    const meta    = STATUS_META[status];
    const bucket  = orders.filter(o => o.status === status);
    const rev     = bucket.reduce((s, o) => s + o.total_amount, 0);
    const r       = 6 + idx;

    dash.getRow(r).height = 22;

    const statusCell = dash.getCell(r, 1);
    statusCell.value = meta.label;
    statusCell.font  = { bold: true, color: { argb: meta.color }, size: 10, name: 'Calibri' };
    statusCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.white : C.lightGray } };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    statusCell.border = { bottom: { style: 'hair', color: { argb: C.midGray } } };

    const rowData = [
      bucket.length,
      rev,
      totalAllOrders > 0 ? `${((bucket.length / totalAllOrders) * 100).toFixed(1)}%` : '0%',
      totalRevenue   > 0 ? `${((rev / totalRevenue) * 100).toFixed(1)}%` : '0%',
      bucket.length  > 0 ? rev / bucket.length : 0,
    ];

    rowData.forEach((v, ci) => {
      const c = dash.getCell(r, ci + 2);
      c.value = v as ExcelJS.CellValue;
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.white : C.lightGray } };
      c.font  = { name: 'Calibri', size: 10 };
      c.border = { bottom: { style: 'hair', color: { argb: C.midGray } } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      if (ci === 1 || ci === 4) c.numFmt = '"LKR "#,##0.00';
    });
  });

  // Total row
  const totalR = 6 + STATUS_ORDER.length;
  dash.getRow(totalR).height = 24;
  dash.mergeCells(totalR, 1, totalR, 1);
  const totLabel = dash.getCell(totalR, 1);
  totLabel.value = 'TOTAL';
  totLabel.font  = { bold: true, color: { argb: C.white }, size: 10, name: 'Calibri' };
  totLabel.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  totLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  const totCells = [
    orders.length,
    totalRevenue,
    '100%',
    '100%',
    orders.length > 0 ? totalRevenue / orders.length : 0,
  ];
  totCells.forEach((v, ci) => {
    const c = dash.getCell(totalR, ci + 2);
    c.value = v as ExcelJS.CellValue;
    c.font  = { bold: true, color: { argb: C.brand }, size: 10, name: 'Calibri' };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    if (ci === 1 || ci === 4) c.numFmt = '"LKR "#,##0.00';
  });

  dash.columns = [{ width: 16 }, { width: 12 }, { width: 20 }, { width: 14 }, { width: 14 }, { width: 20 }];

  // ── SHEETS 2-7: One per status ──────────────────────────
  STATUS_ORDER.forEach(status => {
    const bucket = orders.filter(o => o.status === status);
    writeOrderSheet(wb, status, bucket);
  });

  // ── SHEET 8: All Line Items ─────────────────────────────
  const wsItems = wb.addWorksheet('Line Items', {
    views:     [{ state: 'frozen', ySplit: 4 }],
    properties: { tabColor: { argb: 'FF64748B' } },
  });

  titleBanner(wsItems, 'STATIC WEARS — ALL ORDER LINE ITEMS', 9);
  metaBanner(wsItems, `Exported: ${new Date().toLocaleString('en-GB')}`, 9, 2);
  wsItems.getRow(3).height = 4;

  const itemHeaders = [
    'Order ID', 'Date', 'Customer', 'Product', 'Variant',
    'Qty', 'Unit Price (LKR)', 'Subtotal (LKR)', 'Status',
  ];
  itemHeaders.forEach((h, i) => applyHeaderCell(wsItems.getCell(4, i + 1), h));
  wsItems.getRow(4).height = 24;

  let itemRow = 5;
  let itemIdx = 0;

  // Sort by status order for readability
  const sortedOrders = [...orders].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  sortedOrders.forEach(order => {
    const meta = STATUS_META[order.status];
    (order.items ?? []).forEach(item => {
      const r = itemRow++;
      wsItems.getRow(r).height = 20;

      const vals: unknown[] = [
        '#' + order.id.slice(0, 8).toUpperCase(),
        new Date(order.created_at),
        order.shipping_name ?? '—',
        item.product_name,
        item.variant_desc ?? '—',
        item.quantity,
        item.unit_price,
        item.subtotal,
        meta?.label ?? order.status.toUpperCase(),
      ];

      vals.forEach((v, ci) => {
        const c = wsItems.getCell(r, ci + 1);
        c.value = v as ExcelJS.CellValue;
        applyDataCell(c, itemIdx);
        if (ci === 1) { c.numFmt = 'DD/MM/YYYY'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
        if (ci === 5) c.alignment = { horizontal: 'center', vertical: 'middle' };
        if (ci === 6) c.numFmt = '"LKR "#,##0.00';
        if (ci === 7) {
          c.numFmt = '"LKR "#,##0.00';
          c.font   = { bold: true, color: { argb: C.brand }, size: 10, name: 'Calibri' };
        }
        if (ci === 8) {
          c.font      = { bold: true, color: { argb: meta?.color ?? C.brand }, size: 9, name: 'Calibri' };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      itemIdx++;
    });
  });

  wsItems.columns = [
    { width: 14 }, { width: 13 }, { width: 22 }, { width: 28 },
    { width: 18 }, { width: 6 }, { width: 18 }, { width: 18 }, { width: 13 },
  ];

  // ── Output ──────────────────────────────────────────────
  const buf  = await wb.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="staticwears-orders-${date}.xlsx"`,
    },
  });
}
