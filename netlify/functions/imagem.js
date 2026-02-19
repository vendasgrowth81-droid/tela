/**
 * Proxy de imagem: busca imagem de URL externa e serve no seu domínio.
 * Resolve bloqueio por Referer / hotlink no servidor original.
 */

function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.includes('rastreamentotributario');
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const url = event.queryStringParameters?.url;
  if (!url) {
    return { statusCode: 400, body: 'URL não informada' };
  }

  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return { statusCode: 400, body: 'URL inválida' };
  }

  if (!isAllowedUrl(decoded)) {
    return { statusCode: 403, body: 'Origem não permitida' };
  }

  try {
    const res = await fetch(decoded, {
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; NetlifyImageProxy/1.0)',
        'Referer': 'https://rastreamentotributario.online/'
      }
    });

    if (!res.ok) {
      return { statusCode: res.status, body: `Erro ao buscar imagem: ${res.status}` };
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300'
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('imagem proxy error:', err);
    return {
      statusCode: 502,
      body: 'Erro ao carregar imagem'
    };
  }
};
