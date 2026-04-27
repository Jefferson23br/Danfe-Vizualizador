<?php

declare(strict_types=1);

use App\Handlers\DanfeHandler;
use App\Handlers\DanfseHandler;

require_once __DIR__ . '/../vendor/autoload.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondText(405, 'Metodo nao permitido.');
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

try {
    $xml = extractXmlFromRequest();

    if ($path === '/v1/danfe') {
        $pdf = (new DanfeHandler())->handle($xml);
        respondPdf($pdf, 'danfe.pdf');
    }

    if ($path === '/v1/danfse') {
        $pdf = (new DanfseHandler())->handle($xml);
        respondPdf($pdf, 'danfse.pdf');
    }

    respondText(404, 'Rota nao encontrada.');
} catch (Throwable $exception) {
    respondText(400, $exception->getMessage());
}

function extractXmlFromRequest(): string
{
    if (!isset($_FILES['xml']) || ($_FILES['xml']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Arquivo XML nao enviado.');
    }

    $tmp = $_FILES['xml']['tmp_name'] ?? '';
    if ($tmp === '' || !file_exists($tmp) || !is_readable($tmp)) {
        throw new RuntimeException('Upload invalido.');
    }

    $xml = file_get_contents($tmp);
    if ($xml === false || trim($xml) === '') {
        throw new RuntimeException('Nao foi possivel ler o XML.');
    }

    return $xml;
}

function respondPdf(string $pdfBinary, string $filename): void
{
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $filename . '"');
    echo $pdfBinary;
    exit;
}

function respondText(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: text/plain; charset=utf-8');
    echo $message;
    exit;
}
