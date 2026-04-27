<?php

declare(strict_types=1);

namespace App\Handlers;

use DOMDocument;
use DOMXPath;
use NFePHP\DA\NFe\Danfe;
use RuntimeException;
use Throwable;

final class DanfeHandler
{
    public function handle(string $xml): string
    {
        if (stripos($xml, '<NFe') === false && stripos($xml, '<nfeProc') === false) {
            throw new RuntimeException('XML nao parece ser NF-e.');
        }

        try {
            $xml = $this->injectDuplicatasIntoAdditionalInfo($xml);
            $danfe = new Danfe($xml);
            $pdf = $danfe->render();

            if (!is_string($pdf) || $pdf === '') {
                throw new RuntimeException('Biblioteca retornou PDF vazio.');
            }

            return $pdf;
        } catch (Throwable $e) {
            throw new RuntimeException('Falha ao gerar DANFE: ' . $e->getMessage());
        }
    }

    private function injectDuplicatasIntoAdditionalInfo(string $xml): string
    {
        $doc = new DOMDocument();
        $ok = @$doc->loadXML($xml);
        if (!$ok) {
            return $xml;
        }

        $xp = new DOMXPath($doc);
        $dups = $xp->query('//*[local-name()="dup"]');
        if ($dups === false || $dups->length === 0) {
            return $xml;
        }

        $itens = [];
        foreach ($dups as $dup) {
            $nDup = trim((string) $xp->evaluate('string(./*[local-name()="nDup"])', $dup));
            $dVenc = trim((string) $xp->evaluate('string(./*[local-name()="dVenc"])', $dup));
            $vDup = trim((string) $xp->evaluate('string(./*[local-name()="vDup"])', $dup));

            $partes = [];
            if ($nDup !== '') {
                $partes[] = 'Parcela ' . $nDup;
            }
            if ($dVenc !== '') {
                $partes[] = 'Venc: ' . $this->formatDateBr($dVenc);
            }
            if ($vDup !== '') {
                $partes[] = 'Valor: ' . $this->formatMoneyBr($vDup);
            }

            if ($partes !== []) {
                $itens[] = implode(' | ', $partes);
            }
        }

        if ($itens === []) {
            return $xml;
        }

        $textoDuplicatas = 'DUPLICATAS: ' . implode(' ; ', $itens);

        $infAdic = $xp->query('//*[local-name()="infAdic"]')->item(0);
        if (!$infAdic) {
            return $xml;
        }

        $infCpl = $xp->query('./*[local-name()="infCpl"]', $infAdic)->item(0);
        if (!$infCpl) {
            $infCpl = $doc->createElement('infCpl', $textoDuplicatas);
            $infAdic->appendChild($infCpl);
            return $doc->saveXML() ?: $xml;
        }

        $atual = trim($infCpl->textContent);
        if (str_contains($atual, 'DUPLICATAS:')) {
            return $xml;
        }

        $novoTexto = $atual === '' ? $textoDuplicatas : ($atual . ' | ' . $textoDuplicatas);
        while ($infCpl->firstChild) {
            $infCpl->removeChild($infCpl->firstChild);
        }
        $infCpl->appendChild($doc->createTextNode($novoTexto));

        return $doc->saveXML() ?: $xml;
    }

    private function formatDateBr(string $value): string
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m) === 1) {
            return $m[3] . '/' . $m[2] . '/' . $m[1];
        }
        return $value;
    }

    private function formatMoneyBr(string $value): string
    {
        $normalized = trim(str_replace(['R$', ' '], '', $value));
        if (str_contains($normalized, ',') && str_contains($normalized, '.')) {
            $normalized = str_replace('.', '', $normalized);
            $normalized = str_replace(',', '.', $normalized);
        } elseif (str_contains($normalized, ',')) {
            $normalized = str_replace(',', '.', $normalized);
        }

        if (!is_numeric($normalized)) {
            return $value;
        }

        return 'R$ ' . number_format((float) $normalized, 2, ',', '.');
    }
}
