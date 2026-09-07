FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip
    
    # Ativa o OPcache — guarda o PHP já "compilado" em memória, evita reprocessar
# os arquivos do framework a cada requisição (grande ganho de performance)
RUN docker-php-ext-install opcache

RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.validate_timestamps=1'; \
    echo 'opcache.revalidate_freq=60'; \
} > /usr/local/etc/php/conf.d/opcache-custom.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www