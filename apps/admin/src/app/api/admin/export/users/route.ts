import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/require-admin';
import { clerkClient } from '@clerk/nextjs/server';

const BRAND  = 'E26B35';
const HEADER = '1A1A2E';
const WHITE  = 'FFFFFF';
const ALT    = 'F5F5F5';
const GREEN  = '22C55E';
const ORANGE = 'E26B35';

function styleHeader(c: ExcelJS.Cell, text: string) {
  c.value = text;
  c.font = { bold: true, color: { argb: `FF${WHITE}` }, size: 10, name: 'Calibri' };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER}` } };
  c.border = {
    bottom: { style: 'medium', color: { argb: `FF${BRAND}` } },
    right: { style: 'thin', color: { argb: 'FF2A2A3E' } },
  };
  c.alignment = { vertical: 'middle', horizontal: 'center' };
}

function styleData(c: ExcelJS.Cell, idx: number) {
  c.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: idx % 2 === 0 ? `FF${WHITE}` : `FF${ALT}` },
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

  const client = await clerkClient();
  const { data: clerkUsers, totalCount } = await client.users.getUserList({ limit: 500, orderBy: '-created_at' });

  const adminIds = (process.env.ADMIN_USER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  const users = clerkUsers.map((u) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unknown',
    email: u.emailAddresses[0]?.emailAddress ?? '',
    phone: u.phoneNumbers[0]?.phoneNumber ?? '',
    role: adminIds.includes(u.id) || u.publicMetadata?.role === 'admin' ? 'Admin' : 'Customer',
    joined: new Date(u.createdAt),
    lastActive: new Date(u.lastSignInAt ?? u.createdAt),
  }));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Static Wears Admin';
  wb.created = new Date();

  const ws = wb.addWorksheet('Customers', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  // Title
  ws.mergeCells('A1:G1');
  const title = ws.getCell('A1');
  title.value = 'STATIC WEARS — CUSTOMER EXPORT';
  title.font = { bold: true, size: 16, color: { argb: `FF${WHITE}` }, name: 'Calibri' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND}` } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // Meta
  ws.mergeCells('A2:D2');
  ws.mergeCells('E2:G2');
  const metaL = ws.getCell('A2');
  metaL.value = `Exported: ${new Date().toLocaleString('en-GB')}`;
  metaL.font = { italic: true, color: { argb: 'FF666666' }, size: 9 };
  metaL.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  const metaR = ws.getCell('E2');
  const admins = users.filter((u) => u.role === 'Admin').length;
  metaR.value = `Total: ${totalCount}   |   Admins: ${admins}   |   Customers: ${totalCount - admins}`;
  metaR.font = { bold: true, color: { argb: `FF${BRAND}` }, size: 9 };
  metaR.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  metaR.alignment = { horizontal: 'right' };
  ws.getRow(2).height = 20;
  ws.getRow(3).height = 4;

  // Headers
  const headers = ['#', 'Full Name', 'Email Address', 'Phone', 'Role', 'Member Since', 'Last Active'];
  headers.forEach((h, i) => styleHeader(ws.getCell(4, i + 1), h));
  ws.getRow(4).height = 24;

  // Data
  users.forEach((user, idx) => {
    const r = 5 + idx;
    const row = ws.getRow(r);
    row.height = 20;

    const vals = [idx + 1, user.name, user.email, user.phone, user.role, user.joined, user.lastActive];
    vals.forEach((v, ci) => {
      const c = ws.getCell(r, ci + 1);
      c.value = v;
      styleData(c, idx);

      if (ci === 0) { c.font = { bold: true, color: { argb: 'FF999999' }, size: 9 }; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
      if (ci === 1) c.font = { bold: true, name: 'Calibri', size: 10 };
      if (ci === 4) {
        const isAdmin = user.role === 'Admin';
        c.font = { bold: true, color: { argb: isAdmin ? `FF${ORANGE}` : `FF${GREEN}` }, size: 9, name: 'Calibri' };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      if (ci === 5 || ci === 6) {
        c.numFmt = 'DD/MM/YYYY';
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  ws.columns = [
    { width: 6 }, { width: 24 }, { width: 30 },
    { width: 16 }, { width: 12 }, { width: 15 }, { width: 15 },
  ];

  // Sheet 2: Admin list
  const ws2 = wb.addWorksheet('Admin Users');
  ws2.mergeCells('A1:E1');
  const at = ws2.getCell('A1');
  at.value = 'ADMIN USERS';
  at.font = { bold: true, size: 14, color: { argb: `FF${WHITE}` }, name: 'Calibri' };
  at.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND}` } };
  at.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 30;

  ['Name', 'Email', 'Phone', 'Role', 'Member Since'].forEach((h, i) => styleHeader(ws2.getCell(2, i + 1), h));
  ws2.getRow(2).height = 22;

  users.filter((u) => u.role === 'Admin').forEach((user, idx) => {
    const r = 3 + idx;
    [user.name, user.email, user.phone, user.role, user.joined].forEach((v, ci) => {
      const c = ws2.getCell(r, ci + 1);
      c.value = v;
      styleData(c, idx);
      if (ci === 4) { c.numFmt = 'DD/MM/YYYY'; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
    });
    ws2.getRow(r).height = 20;
  });

  ws2.columns = [{ width: 24 }, { width: 30 }, { width: 16 }, { width: 12 }, { width: 15 }];

  const buf = await wb.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="staticwears-customers-${date}.xlsx"`,
    },
  });
}
