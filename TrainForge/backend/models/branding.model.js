const { query } = require('../utils/db');

async function getBrandingBySlug(slug) {
  const rows = await query(
    `SELECT
        t.id AS tenant_id,
        t.type,
        t.name,
        t.slug,
        t.status,
        tb.display_name,
        tb.studio_name,
        tb.primary_color,
        tb.secondary_color,
        tb.logo_path,
        tb.profile_photo_path,
        tb.banner_path,
        tb.bio_text,
        tb.instagram_url,
        tb.whatsapp_url,
        tb.website_url
     FROM tenants t
     LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
     WHERE t.slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

async function getLandingBySlug(slug) {
  const rows = await query(
    `SELECT
        lp.id,
        lp.page_type,
        lp.path,
        lp.is_published,
        t.id AS tenant_id,
        t.slug,
        t.name,
        tb.display_name,
        tb.studio_name,
        tb.primary_color,
        tb.secondary_color,
        tb.bio_text,
        tb.instagram_url,
        tb.whatsapp_url
     FROM tenants t
     JOIN tenant_landing_pages lp ON lp.tenant_id = t.id
     LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
     WHERE t.slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

async function upsertBranding(tenantId, payload) {
  await query(
    `INSERT INTO tenant_branding (
        tenant_id, display_name, studio_name, primary_color, secondary_color, logo_path,
        profile_photo_path, banner_path, bio_text, instagram_url, whatsapp_url, website_url, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       display_name = VALUES(display_name),
       studio_name = VALUES(studio_name),
       primary_color = VALUES(primary_color),
       secondary_color = VALUES(secondary_color),
       logo_path = VALUES(logo_path),
       profile_photo_path = VALUES(profile_photo_path),
       banner_path = VALUES(banner_path),
       bio_text = VALUES(bio_text),
       instagram_url = VALUES(instagram_url),
       whatsapp_url = VALUES(whatsapp_url),
       website_url = VALUES(website_url),
       updated_at = NOW()`,
    [
      tenantId,
      payload.display_name,
      payload.studio_name || null,
      payload.primary_color || '#2563eb',
      payload.secondary_color || null,
      payload.logo_path || null,
      payload.profile_photo_path || null,
      payload.banner_path || null,
      payload.bio_text || null,
      payload.instagram_url || null,
      payload.whatsapp_url || null,
      payload.website_url || null
    ]
  );

  const rows = await query(
    `SELECT *
     FROM tenant_branding
     WHERE tenant_id = ?
     LIMIT 1`,
    [tenantId]
  );

  return rows[0] || null;
}

module.exports = {
  getBrandingBySlug,
  getLandingBySlug,
  upsertBranding
};
