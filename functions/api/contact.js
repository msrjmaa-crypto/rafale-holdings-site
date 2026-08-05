// Cloudflare Pages Function — POST /api/contact
// お問い合わせフォームの内容を Resend 経由で info@rafale-hd.jp へ送信する。
// RESEND_API_KEY は Cloudflare の Secret（環境変数）から読み込む（コードに秘密情報を持たない）。

const RECIPIENT = 'info@rafale-hd.jp';
const SENDER = 'Rafale Holdings <website@contact.rafale-hd.jp>';
const SUBJECT = '【Rafale Holdings】Webサイトからお問い合わせ';

const LIMITS = { name: 100, company: 100, email: 254, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 制御文字（改行・タブを除く）を除去し、前後空白を落として上限文字数で切り詰める。
function clean(value, max) {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code < 32 && ch !== '\n' && ch !== '\t') continue; // 制御文字を除去
    if (code === 127) continue; // DEL
    out += ch;
  }
  return out.trim().slice(0, max);
}

export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;

  // 不正な Content-Type を拒否（JSON のみ受付）。
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  if (!data || typeof data !== 'object') {
    return json(400, { ok: false, error: 'invalid_body' });
  }

  // ハニーポット：ボットが埋めた場合は送信せず、成功のように応答して検知を悟らせない。
  if (typeof data.hp_url === 'string' && data.hp_url.trim() !== '') {
    return json(200, { ok: true });
  }

  const name = clean(data.name, LIMITS.name);
  const company = clean(data.company, LIMITS.company);
  const email = clean(data.email, LIMITS.email);
  const message = clean(data.message, LIMITS.message);

  const invalid = [];
  if (!name) invalid.push('name');
  if (!email || !EMAIL_RE.test(email)) invalid.push('email');
  if (!message) invalid.push('message');
  if (invalid.length) {
    return json(422, { ok: false, error: 'validation', fields: invalid });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    // 設定漏れ。詳細はクライアントに返さずログのみ。
    console.error('RESEND_API_KEY is not configured');
    return json(500, { ok: false, error: 'server_error' });
  }

  const companyLine = company || '（未入力）';
  const text =
    'お名前：' + name + '\n' +
    '会社名：' + companyLine + '\n' +
    'メールアドレス：' + email + '\n' +
    'お問い合わせ内容：\n' + message + '\n';

  const html =
    '<div style="font-family:sans-serif;line-height:1.7">' +
    '<p><strong>お名前：</strong>' + escapeHtml(name) + '</p>' +
    '<p><strong>会社名：</strong>' + escapeHtml(companyLine) + '</p>' +
    '<p><strong>メールアドレス：</strong>' + escapeHtml(email) + '</p>' +
    '<p><strong>お問い合わせ内容：</strong><br>' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>' +
    '</div>';

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: [RECIPIENT],
        reply_to: email,
        subject: SUBJECT,
        text: text,
        html: html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.error('Resend API error', resp.status, detail);
      return json(502, { ok: false, error: 'send_failed' });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('Resend request failed', err && err.message);
    return json(502, { ok: false, error: 'send_failed' });
  }
}
