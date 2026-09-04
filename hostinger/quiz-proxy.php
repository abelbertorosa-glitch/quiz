<?php
/**
 * Reverse proxy Hostinger → Vercel.
 * Copiar para public_html/quiz-proxy.php e apontar /diagnostico* para cá.
 *
 * Nunca use esta origem como PDF_INTERNAL_BASE_URL.
 */
$vercelOrigin = getenv('CAMBEL_VERCEL_ORIGIN') ?: 'https://SEU-PROJETO.vercel.app';

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?? '/';
$query = parse_url($uri, PHP_URL_QUERY);

$target = rtrim($vercelOrigin, '/') . $path;
if ($query) {
    $target .= '?' . $query;
}

$ch = curl_init($target);
$headers = [];
foreach (['Accept', 'Accept-Language', 'Content-Type', 'User-Agent'] as $h) {
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $h));
    if (!empty($_SERVER[$key])) {
        $headers[] = $h . ': ' . $_SERVER[$key];
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HEADER => true,
    CURLOPT_TIMEOUT => 60,
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
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerText = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

http_response_code($status);
foreach (explode("\r\n", $headerText) as $line) {
    if (stripos($line, 'HTTP/') === 0) continue;
    if (stripos($line, 'Transfer-Encoding:') === 0) continue;
    if (stripos($line, 'Content-Length:') === 0) continue;
    if ($line !== '') header($line, false);
}
echo $body;
