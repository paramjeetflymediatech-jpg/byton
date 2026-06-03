import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/lib/db/models';

/**
 * POST /api/admin/sync/apc-credentials
 *
 * Fetches APC credentials from the live WordPress site via the custom
 * byton/v1/apc-credentials REST endpoint, then saves them to the
 * Supabase settings table so APCService can use them.
 *
 * Requires the WordPress snippet in wordpress-snippets/apc-credentials-endpoint.php
 * to be added to the WordPress site first.
 */
export async function POST(_req: NextRequest) {
  try {
    const siteUrl        = process.env.WC_SITE_URL?.replace(/\/$/, '') || '';
    const consumerKey    = process.env.WC_CONSUMER_KEY    || '';
    const consumerSecret = process.env.WC_CONSUMER_SECRET || '';

    if (!siteUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'WooCommerce credentials not configured in .env' },
        { status: 400 }
      );
    }

    // Pass consumer key and secret as query parameters to bypass Basic Auth interception on the host
    // Also append a cache-buster to prevent LiteSpeed/CDN caches from returning stale values
    const targetUrl = `${siteUrl}/wp-json/byton/v1/apc-credentials?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&cb=${Date.now()}`;

    const res = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return NextResponse.json(
        {
          error: 'The APC credentials endpoint was not found on WordPress. Please add the snippet from wordpress-snippets/apc-credentials-endpoint.php to your WordPress site (via functions.php or the Code Snippets plugin).',
        },
        { status: 404 }
      );
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `WordPress responded with ${res.status}: ${body.substring(0, 200)}` },
        { status: 502 }
      );
    }

    const creds = await res.json();

    // Save each credential into Supabase settings table
    const saved: string[] = [];
    const skipped: string[] = [];

    const mappings: Array<{ wpKey: keyof typeof creds; settingKey: string; label: string }> = [
      { wpKey: 'username',       settingKey: 'apc_username',       label: 'Username' },
      { wpKey: 'password',       settingKey: 'apc_password',       label: 'Password' },
      { wpKey: 'account_number', settingKey: 'apc_account_number', label: 'Account Number' },
      { wpKey: 'api_key',        settingKey: 'apc_api_key',        label: 'API Key' },
    ];

    for (const { wpKey, settingKey, label } of mappings) {
      const value = creds[wpKey];
      if (value && String(value).trim() !== '') {
        await Setting.upsert({ key: settingKey, value: String(value).trim() });
        saved.push(label);
      } else {
        skipped.push(label);
      }
    }

    return NextResponse.json({
      success: true,
      saved,
      skipped,
      message: `APC credentials synced from WordPress. Saved: ${saved.join(', ') || 'none'}. Empty/missing: ${skipped.join(', ') || 'none'}.`,
      raw: {
        username:       creds.username       ? '✓ found' : '✗ empty',
        password:       creds.password       ? '✓ found' : '✗ empty',
        account_number: creds.account_number ? '✓ found' : '✗ empty',
        api_key:        creds.api_key        ? '✓ found' : '✗ empty',
      },
    });
  } catch (error: any) {
    console.error('APC credential sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch APC credentials from WordPress.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/apc-credentials
 * Returns currently stored APC credentials from Supabase (masked for security).
 */
export async function GET(_req: NextRequest) {
  try {
    const [userSetting, passSetting, accountSetting, apiKeySetting] = await Promise.all([
      Setting.findByPk('apc_username'),
      Setting.findByPk('apc_password'),
      Setting.findByPk('apc_account_number'),
      Setting.findByPk('apc_api_key'),
    ]);

    const mask = (val: string | undefined) =>
      val && val.length > 4 ? val.substring(0, 2) + '****' + val.slice(-2) : (val ? '****' : null);

    return NextResponse.json({
      success: true,
      credentials: {
        apc_username:       userSetting?.value    || null,
        apc_password:       mask(passSetting?.value),
        apc_account_number: accountSetting?.value || null,
        apc_api_key:        mask(apiKeySetting?.value),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
