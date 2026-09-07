# Sistema de Contas a Pagar e Receber

Aplicação para controle financeiro de uma pequena empresa: o que há para pagar, para receber, e o que já foi liquidado. Back-end em Laravel (API) + PostgreSQL, front-end em React (SPA separada consumindo a API), tudo orquestrado via Docker.

## Stack

- **Back-end:** Laravel 11 (PHP 8.4), PostgreSQL 16
- **Front-end:** React + Vite, consumindo a API via token (Laravel Sanctum)
- **Fila/Jobs:** worker dedicado (`queue:work`) + agendador (`schedule:work`), ambos em containers próprios
- **E-mail:** Mailpit (captura os e-mails localmente, sem precisar de caixa de entrada real)
- **Infraestrutura:** Docker Compose (6 serviços: `db`, `app`, `queue`, `scheduler`, `mailpit`, `frontend`)

## Como rodar

Pré-requisito: Docker Desktop instalado e rodando.

```bash
git clone <url-do-repositorio>
cd devconnection

# Sobe todos os containers
docker-compose up -d --build

# Instala as dependências do PHP (primeira vez, ou depois de mudar o composer.json)
docker-compose run --rm app composer install

# Roda as migrations (cria todas as tabelas)
docker-compose exec app php artisan migrate
```

Endereços:
- **Front-end:** http://localhost:5173
- **API:** http://localhost:8000/api
- **Caixa de e-mails (Mailpit):** http://localhost:8025

## Usuário de demonstração

> ⚠️ **Preencher antes de entregar:** email e senha de um usuário real já cadastrado no banco, com pelo menos um contato e um lançamento de exemplo.

```
Email: ___________________
Senha: ___________________
```

Alternativa: crie um usuário novo em `POST /api/register` (ou pela tela de login/registro do front) e cadastre os dados de exemplo na hora.

## Como provocar na hora o que o sistema faria sozinho

O disparo automático de avisos roda todo dia sozinho (`Schedule::command(...)->daily()`, processado pelo container `scheduler`). Para forçar sem esperar:

```bash
docker-compose exec app php artisan entries:check-due-dates
```

Isso varre a base, dispara os Jobs de aviso (próximo do vencimento / vencido) para a fila, e o container `queue` processa em segundos. Confira o resultado em http://localhost:8025.

O fechamento de período (`POST /api/relatorio/fechamento`) já é assíncrono por natureza: a resposta volta imediatamente (`202`), e o processamento (gerar CSV + enviar e-mail) acontece em background, também visível no Mailpit.

## Decisões e por quês

- **Isolamento de dados:** filtro explícito por `user_id` em cada consulta (via relação, ex.: `$request->user()->contacts()`), em vez de um Global Scope automático do Eloquent. Menos "mágico", mas fica visível no código exatamente onde a proteção acontece — mais fácil de auditar e defender.
- **Status (aberta/atrasada/quitada) não é uma coluna:** é calculado na hora (`accessor` no Model, comparando `paid_at` e `due_date` com a data atual). Uma coluna fixa ficaria desatualizada com o tempo, a menos que algo a atualizasse constantemente — risco real de estado inconsistente.
- **Valores monetários em `decimal(12,2)`, nunca `float`:** evita erro de arredondamento binário em cálculos financeiros.
- **Regra de negócio no Model, não no Controller:** regras que são "verdade sobre o dado, independente de quem pede" (ex.: `Entry::liquidar()` recusa pagar duas vezes) moram no Model. Regras que dependem de "quem está pedindo, agora" (ex.: checagem de dono do recurso) moram no Controller.
- **Avisos automáticos via Job por lançamento, não um Job único gigante:** se um envio falhar, só aquele Job específico é reprocessado — os demais continuam normalmente. Trava contra duplicidade em duas camadas: colunas `due_soon_notified_at`/`overdue_notified_at` checadas dentro do próprio `handle()` do Job, mais um filtro no nível da consulta que dispara os Jobs.
- **Cada lançamento recebe no máximo 2 avisos na vida (não é lembrete recorrente):** um ao entrar na janela de "próximo do vencimento", outro ao vencer. Decisão deliberada para não gerar spam ao usuário; interpretação alternativa (lembrete diário enquanto vencido) é factível trocando a condição do filtro.
- **Fechamento de período como recurso próprio (`period_closures`), com status (`pendente`/`processando`/`concluido`/`falhou`):** permite responder `202` imediatamente e o usuário consultar o andamento depois. Trava contra duplicidade em duas camadas: `unique` composto no banco (`user_id` + período) e verificação no Controller antes de disparar um novo Job.
- **Exclusão bloqueada em dois casos:** contato com lançamentos vinculados, e lançamento já liquidado. Nos dois casos, apagar apagaria rastro financeiro real — a API responde `422` com mensagem explicando o motivo.
- **`vendor/` e `node_modules/` isolados em volumes Docker nomeados**, não no bind mount da pasta do projeto: acesso a milhares de arquivos pequenos através da ponte Windows↔Linux do Docker Desktop é significativamente mais lento que num volume nativo — impacto direto no tempo de resposta da aplicação.
- **Docker Compose escrito à mão, em vez de Laravel Sail:** menos automático, mas cada peça do ambiente (Dockerfile, variáveis, serviços) é compreendida e documentável, não abstraída por uma configuração pronta.

## O que ficou de fora (por tempo)

- Testes automatizados
- Deploy publicado
- Juros e multa sobre valor em atraso
- Liquidação parcial
- Categorias de despesa/receita
- Integração contínua

## Erros e obstáculos ao longo do desenvolvimento

O processo teve bastante fricção de ambiente (Windows + Docker + PHP, tudo novo para mim), resolvida investigando logs a cada passo em vez de tentar corrigir no escuro:

- **Arquivos criados com Byte Order Mark (BOM)** pelo PowerShell (`-Encoding utf8`) quebravam o parser YAML do `docker-compose`, sempre no primeiro caractere do arquivo — corrigido criando os arquivos pelo editor de texto em vez do terminal.
- **Incompatibilidade de versão do PHP:** a imagem base do `Dockerfile` pedia PHP 8.3, mas o Laravel instalado (via imagem oficial do Composer) exigia 8.4 — containers em loop de restart até alinhar a versão.
- **`.env` ainda apontando para SQLite** (o padrão de uma instalação nova do Laravel) mesmo com o PostgreSQL já configurado no Docker Compose — a conexão nunca tinha sido trocada de fato.
- **Trait `HasApiTokens` do Sanctum não conectada ao Model `User`:** o pacote foi instalado, mas o Model precisa declarar o trait manualmente — sem isso, `createToken()` não existe.
- **Rotas fora do grupo de middleware `auth:sanctum`** (coladas depois da chave de fechamento) ficavam sem proteção nenhuma — erro só perceptível porque `$request->user()` chegava `null` dentro do Controller, e não como um `401` esperado.
- **Container do Mailpit sem a porta publicada**, por ter subido uma vez em estado de conflito de porta e ficado "preso" nessa configuração mesmo depois do conflito se resolver — corrigido recriando o container específico (`docker-compose rm -sf` + `up`).
- **Processos de longa duração (`queue:work`, `schedule:work`) não recarregam `.env` nem código PHP sozinhos:** diferente do `php artisan serve` (que reprocessa a cada requisição), esses processos carregam tudo uma vez na inicialização — qualquer mudança em Jobs, Mailables ou configuração de e-mail exige `docker-compose restart queue scheduler`.
- **Performance do PHP dentro do Docker no Windows:** leitura de `vendor/` através do bind mount era lenta o bastante para deixar o login com ~5s de latência, mesmo com OPcache ativo — resolvido isolando `vendor/` (e depois `node_modules/`) em volumes Docker nomeados.
- **`ParseError` por função duplicada:** ao atualizar o `ReportController`, uma edição por engano colou o método novo *dentro* do método antigo, em vez de substituí-lo — PHP não aceita função aninhada nesse contexto. Percebido pela mensagem de erro apontando a linha exata, corrigido reescrevendo o arquivo inteiro.

## Uso de IA

Todo o projeto foi desenvolvido em par com o Claude (Anthropic), que propôs a arquitetura (modelagem, padrão Job/Queue para resiliência, separação Model/Controller, estratégia de idempotência) e guiou a implementação passo a passo — eu nunca tinha trabalhado com PHP, Laravel ou Docker antes deste teste.

**O que funcionou bem:** o desenho geral de resiliência (um Job por lançamento em vez de um processo monolítico, trava de duplicidade em camadas, o padrão `202 Accepted` + consulta de status para o fechamento assíncrono) foi proposto de forma sólida e implementado sem retrabalho estrutural. A depuração dirigida por logs (sempre buscar a mensagem de erro real antes de tentar qualquer correção) foi consistente do início ao fim.

**Onde precisou de correção:** a modelagem inicial das foreign keys usava `cascadeOnDelete()` em `entries.contact_id` — o que apagaria lançamentos automaticamente junto com o contato, incluindo histórico já liquidado. Percebi esse risco ao testar a exclusão de um contato com lançamento vinculado, e pedi a correção: a exclusão em cascata foi trocada por um bloqueio explícito (`422`) tanto para contatos com lançamentos quanto para lançamentos já pagos. Também aconteceram duas colisões de edição (um método duplicado por engano dentro de outro, e um import duplicado) ao aplicar manualmente trechos de código sugeridos — resolvidas reescrevendo o arquivo inteiro em vez de tentar corrigir a edição parcial.

## Próximos passos (o que eu faria com mais tempo)

- **Reverter uma liquidação feita por engano:** hoje, uma vez liquidado, não há como desfazer pela API. Um endpoint `POST /entries/{id}/reverter-liquidacao` que limpa `paid_at`/`paid_amount` resolveria o caso simples — mas fica sujeito à mesma pergunta de auditoria do item abaixo.
- **Estornos de verdade:** em vez de apagar ou reverter um valor pago silenciosamente, um sistema financeiro sério deveria registrar o estorno como um evento novo (um contra-lançamento), preservando o histórico de que "algo foi pago e depois estornado" — em vez de fazer parecer que nunca foi pago.
- **Juros e multa sobre valor em atraso:** calcular um acréscimo sobre `amount` proporcional aos dias de atraso, provavelmente como mais um campo calculado no Model (mesma filosofia do `status`), configurável por taxa.
- **Dashboard de verdade, não tabelas cruas:** o front-end atual prioriza deliberadamente função sobre forma (o enunciado não avalia capricho visual). Com mais tempo, a Visão do Período viraria gráficos (evolução de a pagar/receber ao longo do tempo, proporção quitado vs. vencido) em vez de números soltos em cards.
- **Cobranças recorrentes:** o enunciado coloca "recorrência" explicitamente fora do escopo, e por isso não implementei — mas é uma extensão natural do modelo atual. Daria pra representar como um `Contact` associado a uma regra de recorrência (valor, dia do mês, quantidade de parcelas ou indefinido), com um Job agendado (reaproveitando o padrão de `scheduler` já existente) gerando o `Entry` do mês seguinte automaticamente, em vez de duplicar manualmente o lançamento todo período.