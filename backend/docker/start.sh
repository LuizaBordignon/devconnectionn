#!/bin/sh
# Start command do serviço "web" no Railway (definido no Dockerfile.prod).
# Os serviços de queue worker e scheduler devem sobrescrever o start command
# no próprio Railway (ver DEPLOY.md) em vez de usar este script.
set -e

if [ -z "$APP_KEY" ]; then
  echo "AVISO: APP_KEY não definida. Gere uma com 'php artisan key:generate --show' e configure no Railway."
fi

php artisan config:cache
php artisan route:cache
php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
