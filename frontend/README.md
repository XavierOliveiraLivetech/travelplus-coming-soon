# Travel Plus — Coming Soon

Frontend estático (Next.js `output: "export"`) preparado para [GitHub Pages](https://pages.github.com/).

## Desenvolvimento

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Variáveis em `.env.local`:

- `NEXT_PUBLIC_API_URL` — URL pública da API Laravel (CORS tem de permitir o domínio do Pages)
- `NEXT_PUBLIC_BASE_PATH` — vazio em local; no Pages de projeto fica `/nome-do-repo`

## Build local

```bash
cd frontend
npm run build
npm start
```

O site estático fica em `frontend/out/`.

## GitHub Pages

O workflow [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml) faz build e deploy em push para `main`/`master`.

1. No repositório: **Settings → Pages → Source → GitHub Actions**
2. (Opcional) **Settings → Secrets and variables → Actions → Variables**: `NEXT_PUBLIC_API_URL` com a URL da API em produção
3. Ativar Pages e fazer push — o `basePath` é calculado automaticamente (`/` ou `/repo-name`)

Nota: o formulário precisa da API online; o Pages só serve o frontend.
