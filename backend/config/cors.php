<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Publicado explicitamente (em vez de depender do default do pacote)
    | para que a origem do frontend em produção (Vercel) possa ser
    | controlada via variável de ambiente, sem precisar mexer em código.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Lista separada por vírgula em CORS_ALLOWED_ORIGINS, ex:
    // CORS_ALLOWED_ORIGINS=https://meu-app.vercel.app,https://meu-app-git-main.vercel.app
    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'))
    )),

    'allowed_origins_patterns' => array_filter([
        // permite qualquer preview deploy da Vercel (*.vercel.app) quando habilitado
        env('CORS_ALLOW_VERCEL_PREVIEWS', false) ? '#^https://.*\.vercel\.app$#' : null,
    ]),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false porque a autenticação é via Bearer token (localStorage), não cookie
    'supports_credentials' => false,

];
