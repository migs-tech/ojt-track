# PHP API for Render (or any Docker host).
# Build context: the api/ folder.
FROM php:8.3-apache

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libpng-dev libjpeg62-turbo-dev libfreetype6-dev libzip-dev libicu-dev unzip ca-certificates \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" pdo_mysql gd zip intl \
 && a2enmod rewrite headers \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Production PHP settings
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-ojt.ini"
COPY docker/apache.conf /etc/apache2/conf-enabled/zz-ojt.conf

WORKDIR /var/www/html

# Dependencies first, so code changes don't reinstall them
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader

COPY api/ ./api/
# Settings come from environment variables on the server, never from a config.php file
RUN rm -f api/config.php \
 && mkdir -p api/uploads api/logs \
 && chown -R www-data:www-data api/uploads api/logs

# Render sets $PORT; Apache reads it at startup
ENV PORT=10000
RUN sed -ri 's/^Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf \
 && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf

EXPOSE 10000
