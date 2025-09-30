<?php
header('Content-Type: application/json');

$frontend = getenv('FRONTEND_URL') ?: '*';

header("Access-Control-Allow-Origin: $frontend");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    echo '';
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function respond($data = null, $status = 200)
{
    http_response_code($status);
    echo json_encode([
        'success' => $status >= 200 && $status < 300,
        'data' => $status >= 200 && $status < 300 ? $data : null,
        'error' => $status >= 400 ? (isset($data['error']) ? $data['error'] : 'Erro') : null,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($uri === '/health') {
    respond(['status' => 'ok', 'time' => date(DATE_ATOM)]);
}

respond(['error' => 'Not Found'], 404);
