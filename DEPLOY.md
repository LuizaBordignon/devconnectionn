# Deploy — Frontend na Vercel + Backend no Railway

Arquitetura: o frontend (React/Vite) é estático e vai pra Vercel. O backend
(Laravel + Postgres + queue + scheduler) precisa de processo persistente e
banco gerenciado, então vai pro Railway. Eles se comunicam por HTTP (a API
aceita qualquer origem liberada em `CORS_ALLOWED_ORIGINS`); a autenticação é
por Bearer token salvo no `localStorage`, não por cookie — então não tem
complicação de domínio/cookie entre os dois.

## 1. Backend no Railway

1. Crie um projeto novo no [railway.app](https://railway.app), "Deploy from GitHub repo", selecione este repositório.
2. No serviço criado (vai tentar buildar a raiz do repo — ajuste):
   - Settings → **Root Directory**: `backend`
   - Ele deve detectar `railway.json` e usar `Dockerfile.prod` automaticamente (builder = DOCKERFILE).
3. Adicione um banco: "New" → **Database** → **PostgreSQL** (fica no mesmo projeto).
4. No serviço do backend, aba **Variables**, adicione:
   ```
   APP_NAME=DevConnection
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=            # gere localmente: php artisan key:generate --show
   APP_URL=https://<gerado-pelo-railway>.up.railway.app

   DB_CONNECTION=pgsql
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_DATABASE=${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}

   SESSION_DRIVER=file
   CACHE_STORE=database
   QUEUE_CONNECTION=database

   CORS_ALLOWED_ORIGINS=https://<seu-projeto>.vercel.app
   CORS_ALLOW_VERCEL_PREVIEWS=true

   MAIL_MAILER=log   # troque por um provedor real (Resend, SES, Mailtrap...) quando for enviar e-mail de verdade
   ```
   (Os `${{Postgres.PG*}}` são referências automáticas do Railway ao serviço de Postgres — aparecem no autocomplete da aba Variables.)
5. Gere o `APP_KEY` localmente e cole o valor:
   ```
   cd backend && php artisan key:generate --show
   ```
6. Deploy. O `start.sh` roda `migrate --force` sozinho a cada subida do serviço web.
7. Confira em `https://<seu-backend>.up.railway.app/up` (health check padrão do Laravel) — deve retornar 200.

### Queue worker (jobs de e-mail / fechamento de período)

Sem isso, `ProcessPeriodClosureJob` e `SendEntryReminderJob` ficam parados na fila.

1. No mesmo projeto Railway: "New" → **Empty Service** → aponte pro mesmo repo/root `backend` (mesma imagem).
2. Settings → **Deploy** → Custom Start Command:
   ```
   php artisan queue:work --sleep=3 --tries=3 --max-time=3600
   ```
3. Copie as mesmas Variables do serviço web (ou use "Reference" nas variáveis compartilhadas do projeto).

### Scheduler (`CheckEntryDueDates`, roda `->daily()`)

Mais barato usar o **Cron Schedule** nativo do Railway em vez de um serviço rodando 24h:

1. Crie mais um serviço (igual ao worker), Custom Start Command:
   ```
   php artisan schedule:run
   ```
2. Settings → **Cron Schedule**: `* * * * *` (o Laravel decide internamente se é hora de rodar cada tarefa agendada).

## 2. Frontend na Vercel

1. [vercel.com](https://vercel.com) → "Add New" → "Project" → importe o mesmo repositório.
2. **Root Directory**: `frontend` (a Vercel detecta Vite automaticamente: build `vite build`, output `dist`).
3. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL=https://<seu-backend>.up.railway.app/api
   ```
4. Deploy.
5. Volte no Railway e atualize `CORS_ALLOWED_ORIGINS` com a URL final que a Vercel deu (ex: `https://devconnection.vercel.app`) — sem isso o navegador bloqueia as chamadas por CORS.

## 3. Checklist pós-deploy

- [ ] `GET /up` no backend responde 200
- [ ] Login/registro funcionando do frontend deployado (checa CORS no console do navegador)
- [ ] Queue worker rodando (Railway → aba Logs do serviço worker)
- [ ] Cron do scheduler disparando 1x/dia (Railway → aba Logs do serviço scheduler)
- [ ] `MAIL_MAILER` trocado de `log` pra um provedor real, se os e-mails de lembrete importam em produção
