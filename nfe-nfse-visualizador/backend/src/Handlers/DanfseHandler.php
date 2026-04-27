<?php

declare(strict_types=1);

namespace App\Handlers;

use App\Services\DanfsePdfRenderer;
use RuntimeException;

final class DanfseHandler
{
    public function handle(string $xml): string
    {
        if (stripos($xml, 'NFSe') === false && stripos($xml, 'infNFSe') === false && stripos($xml, 'InfNfse') === false) {
            throw new RuntimeException('XML nao parece ser NFS-e.');
        }

        return (new DanfsePdfRenderer())->render($xml);
    }
}
