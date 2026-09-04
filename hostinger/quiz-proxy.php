<?php
/**
 * Reverse proxy Hostinger → Vercel.
 * .htaccess manda só /diagnostico* para cá.
 * Nunca use esta origem (Hostinger) como PDF_INTERNAL_BASE_URL.
 */

$originFile = __DIR__ . '/quiz-origin.php';
$vercelOrigin = is_file($originFile)
    ? (string) require $originFile
    : (getenv('CAMBEL_VERCEL_ORIGIN') ?: 'https://SEU-PROJETO.vercel.app');
$vercelOrigin = rtrim($vercelOrigin, '/');

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?? '/';
$query = parse_url($uri, PHP_URL_QUERY);
$target = $vercelOrigin . $path;
if ($query) {
    $target .= '?' . $query;
}

$hopByHop = [
    'host' => true,
    'connection' => true,
    'keep-alive' => true,
    'proxy-authenticate' => true,
    'proxy-authorization' => true,
    'te' => true,
    'trailer' => true,
    'transfer-encoding' => true,
    'upgrade' => true,
    'content-length' => true,
    'expect' => true,
];

$headers = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') !== 0 || $value === '') {
        continue;
    }
    $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
    if (isset($hopByHop[strtolower($name)])) {
        continue;
    }
    $headers[] = $name . ': ' . $value;
}
if (!empty($_SERVER['CONTENT_TYPE'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}

$publicHost = $_SERVER['HTTP_HOST'] ?? '';
$headers[] = 'X-Forwarded-Host: ' . $publicHost;
$headers[] = 'X-Forwarded-Proto: https';
$headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$headers[] = 'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 300,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Proxy do diagnóstico indisponível.';
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerText = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

$vercelHost = parse_url($vercelOrigin, PHP_URL_HOST) ?: '';

http_response_code($status);
foreach (explode("\r\n", $headerText) as $line) {
    if ($line === '' || stripos($line, 'HTTP/') === 0) {
        continue;
    }
    $colon = strpos($line, ':');
    if ($colon === false) {
        continue;
    }
    $name = strtolower(trim(substr($line, 0, $colon)));
    $value = ltrim(substr($line, $colon + 1));
    if (isset($hopByHop[$name]) || $name === 'content-length') {
        continue;
    }
    if ($name === 'location' && $vercelHost !== '' && $publicHost !== '') {
        $value = str_replace('://' . $vercelHost, '://' . $publicHost, $value);
    }
    header($name === 'set-cookie' ? $line : ($name . ': ' . $value), false);
}
echo $body;
