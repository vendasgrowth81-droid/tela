# Configurar domínio customizado na Netlify

Depois de fazer o deploy pelo GitHub, você pode usar seu próprio domínio:

## Passos

1. **No Netlify:** Site settings → Domain management → Add custom domain
2. **Digite seu domínio** (ex: `meusite.com.br` ou `encomenda.meusite.com.br`)
3. **Configure o DNS** no seu provedor de domínio:
   - Tipo: `A` ou `CNAME`
   - Valor: o Netlify vai mostrar (ex: `75.2.60.5` para A ou `xxx.netlify.app` para CNAME)
4. **Aguarde propagação** (alguns minutos até 24h)

## Subdomínios

Se você quiser usar o mesmo nome para não confundir:
- Domínio principal: `meusite.com.br` → site principal
- Subdomínio: `encomenda.meusite.com.br` → este site de rastreamento

Ambos podem apontar para o mesmo deploy na Netlify (ou deploys diferentes).

**Importante:** Os links internos (`/.netlify/functions/api`, `app/index.html`) funcionam automaticamente com qualquer domínio. Não precisa mudar nada no código!
