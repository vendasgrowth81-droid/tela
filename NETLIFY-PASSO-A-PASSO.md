# Deploy na Netlify com tudo funcionando

Siga estes passos para subir o site na Netlify **com a API funcionando** (consulta de CPF e imagem).

---

## Passo 1: Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login.
2. Clique em **New repository**.
3. Nome sugerido: `rastreamento-encomenda` (ou outro).
4. Deixe **público** e **não** marque "Add a README".
5. Clique em **Create repository**.

---

## Passo 2: Enviar o projeto para o GitHub

No PowerShell, na pasta do projeto:

```powershell
cd "c:\Os meus Sites\TelaNova"

# Inicializar Git (se ainda não tiver)
git init

# Adicionar tudo (o .gitignore já evita hts-cache e lixo)
git add .
git commit -m "Site encomenda + Netlify Function para API"

# Trocar pela URL do SEU repositório (ex: https://github.com/SEU-USUARIO/rastreamento-encomenda.git)
git remote add origin https://github.com/SEU-USUARIO/rastreamento-encomenda.git
git branch -M main
git push -u origin main
```

Substitua `SEU-USUARIO/rastreamento-encomenda` pela URL que o GitHub mostrar no repositório vazio (ex: `https://github.com/joao/rastreamento-encomenda.git`).

---

## Passo 3: Conectar o repositório na Netlify

1. Acesse [app.netlify.com](https://app.netlify.com) e faça login.
2. Clique em **Add new site** → **Import an existing project**.
3. Escolha **GitHub** e autorize o Netlify se pedir.
4. Selecione o repositório que você criou (ex: `rastreamento-encomenda`).
5. **Configuração do build:**
   - **Branch to deploy:** `main`
   - **Build command:** deixe em branco (ou escreva: `echo "No build"`).
   - **Publish directory:** `rastreamentotributario.online/encomenda`
6. Clique em **Deploy site**.

O `netlify.toml` na raiz já define essa pasta e a pasta das functions; o Netlify usa essa config.

---

## Passo 4: Conferir se está tudo certo

Depois do deploy:

1. Abra a URL do site (ex: `https://nome-aleatorio-123.netlify.app`).
2. Você deve ver a **página do formulário de CPF** (Parte 1).
3. Digite um CPF (ex: `19517490739`) e clique em **Consultar**.
4. Deve abrir a **segunda página** com os dados e o botão **Efetuar Pagamento**.
5. Ao clicar em **Efetuar Pagamento**, deve ir para o checkout com CPF e nome na URL.

Se a consulta de CPF der erro de rede ou “Erro ao consultar”, a function pode não ter sido publicada: confira em **Site configuration** → **Functions** se aparece a function `api`.

---

## Resumo

| Item | Valor |
|------|--------|
| Deploy | Pelo **GitHub** (não use só “drag and drop”) |
| Publish directory | `rastreamentotributario.online/encomenda` |
| API | Funciona via **Netlify Function** (`netlify/functions/api.js`) |

Assim tudo fica funcionando dentro da Netlify: site estático + API de CPF/imagem.
