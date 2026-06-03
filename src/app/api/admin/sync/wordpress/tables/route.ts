import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

/**
 * GET /api/admin/sync/wordpress/tables
 * Diagnostic: lists all tables in the WordPress MySQL DB so we can find the real prefix.
 */
export async function GET(_req: NextRequest) {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '3306'),
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASS     || '',
      database: process.env.DB_NAME     || 'byton_horticulture',
    });

    const [rows] = await connection.execute<mysql.RowDataPacket[]>('SHOW TABLES');
    const tables = rows.map((r) => Object.values(r)[0] as string);

    // Try to auto-detect prefix by finding a table that ends with _posts
    const postsTable = tables.find((t) => t.endsWith('posts'));
    const prefix = postsTable ? postsTable.replace(/posts$/, '') : 'unknown';

    return NextResponse.json({ tables, detectedPrefix: prefix });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) { try { await connection.end(); } catch (_) {} }
  }
}
