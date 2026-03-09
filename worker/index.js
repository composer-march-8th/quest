const ALLOWED_ORIGIN = 'https://composer-march-8th.github.io'

function buildCorsHeaders(origin) {
  if (origin !== ALLOWED_ORIGIN) return null
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function jsonResponse(data, status = 200, corsHeaders = undefined) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(corsHeaders || {}),
    },
  })
}

function getCertificates(env) {
  try {
    return JSON.parse(env.CERTIFICATES_JSON || '{}')
  } catch {
    return {}
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const requestOrigin = request.headers.get('Origin') || ''
    const corsHeaders = buildCorsHeaders(requestOrigin)

    if (request.method === 'OPTIONS') {
      if (!corsHeaders) {
        return new Response('Forbidden origin', { status: 403 })
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders)
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400, corsHeaders)
    }

    const userId = String(payload.userId || '').trim().toLowerCase()
    if (!userId.startsWith('@') || userId.length < 2) {
      return jsonResponse({ error: 'Invalid userId format' }, 400, corsHeaders)
    }

    const certificates = getCertificates(env)
    const promoCode = certificates[userId]

    if (url.pathname === '/validate') {
      return jsonResponse({ allowed: Boolean(promoCode) }, 200, corsHeaders)
    }

    if (url.pathname === '/certificate') {
      if (!promoCode) {
        return jsonResponse({ error: 'User is not allowed' }, 403, corsHeaders)
      }
      return jsonResponse({ promoCode }, 200, corsHeaders)
    }

    return jsonResponse({ error: 'Not found' }, 404, corsHeaders)
  },
}
