<?php

declare(strict_types=1);

namespace App\Services;

use RuntimeException;

final class DanfsePdfRenderer
{
    public function render(string $xml): string
    {
        $doc = XmlHelper::load($xml);
        $xp = XmlHelper::xpath($doc);

        $numero = $this->pick($xp, [
            '//*[local-name()="infNFSe"]/*[local-name()="nNFSe"]',
            '//*[local-name()="InfNfse"]/*[local-name()="Numero"]'
        ]);

        if ($numero === '') {
            throw new RuntimeException('Nao foi possivel ler o numero da NFS-e.');
        }

        $dados = [
            'prefeitura' => $this->pick($xp, [
                '//*[local-name()="xLocEmi"]',
                '//*[local-name()="xMun"]'
            ]),
            'numero' => $numero,
            'chave' => $this->pick($xp, [
                'string(//*[local-name()="infNFSe"]/@Id)',
                'string(//*[local-name()="InfNfse"]/@Id)',
                '//*[local-name()="ChaveAcesso"]',
                '//*[local-name()="CodigoVerificacao"]'
            ]),
            'emissao' => $this->pick($xp, [
                '//*[local-name()="dhProc"]',
                '//*[local-name()="DataEmissao"]'
            ]),
            'prestador_nome' => $this->pick($xp, [
                '//*[local-name()="emit"]/*[local-name()="xNome"]',
                '//*[local-name()="PrestadorServico"]/*[local-name()="RazaoSocial"]'
            ]),
            'prestador_doc' => $this->pick($xp, [
                '//*[local-name()="emit"]/*[local-name()="CNPJ"]',
                '//*[local-name()="PrestadorServico"]/*[local-name()="Cnpj"]'
            ]),
            'tomador_nome' => $this->pick($xp, [
                '//*[local-name()="toma"]/*[local-name()="xNome"]',
                '//*[local-name()="TomadorServico"]/*[local-name()="RazaoSocial"]'
            ]),
            'tomador_doc' => $this->pick($xp, [
                '//*[local-name()="toma"]/*[local-name()="CNPJ"]',
                '//*[local-name()="TomadorServico"]//*[local-name()="Cnpj"]',
                '//*[local-name()="TomadorServico"]//*[local-name()="Cpf"]'
            ]),
            'descricao' => $this->pick($xp, [
                '//*[local-name()="xDescServ"]',
                '//*[local-name()="Discriminacao"]'
            ]),
            'v_servico' => $this->pick($xp, [
                '//*[local-name()="vServ"]',
                '//*[local-name()="ValorServicos"]'
            ]),
            'v_issqn' => $this->pick($xp, [
                '//*[local-name()="vISSQN"]',
                '//*[local-name()="ValorIss"]'
            ]),
            'aliq' => $this->pick($xp, [
                '//*[local-name()="pAliqAplic"]',
                '//*[local-name()="Aliquota"]'
            ]),
            'v_liq' => $this->pick($xp, [
                '//*[local-name()="vLiq"]',
                '//*[local-name()="ValorLiquidoNfse"]'
            ]),
            'vencimento' => $this->pick($xp, [
                '//*[local-name()="dVenc"]',
                '//*[local-name()="DataVencimento"]',
                '//*[local-name()="dataVencimento"]',
                '//*[local-name()="DtVencimento"]',
                '//*[local-name()="dtVencimento"]'
            ]),
            'vencimentos' => $this->collectVencimentos($xp)
        ];

        $dados['emissao'] = $this->formatDateBr($dados['emissao'], true);
        $dados['v_servico'] = $this->formatMoneyBr($dados['v_servico']);
        $dados['v_issqn'] = $this->formatMoneyBr($dados['v_issqn']);
        $dados['v_liq'] = $this->formatMoneyBr($dados['v_liq']);
        $dados['vencimento'] = $this->formatDateBr($dados['vencimento'], false);

        $pdf = new \FPDF('P', 'mm', 'A4');
        $pdf->SetAutoPageBreak(true, 10);
        $pdf->AddPage();

        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 8, $this->enc('DANFS-e'), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 6, $this->enc('Documento Auxiliar da NFS-e'), 0, 1, 'C');
        $pdf->Ln(2);

        $this->section($pdf, 'EMISSAO', [
            'Prefeitura/Local: ' . $dados['prefeitura'],
            'Numero: ' . $dados['numero'],
            'Chave: ' . $dados['chave'],
            'Data/Hora: ' . $dados['emissao']
        ]);

        $this->section($pdf, 'PRESTADOR', [
            'Nome: ' . $dados['prestador_nome'],
            'CNPJ/CPF: ' . $dados['prestador_doc']
        ]);

        $this->section($pdf, 'TOMADOR', [
            'Nome: ' . $dados['tomador_nome'],
            'CNPJ/CPF: ' . $dados['tomador_doc']
        ]);

        $this->section($pdf, 'SERVICO E TRIBUTACAO', [
            'Descricao: ' . $dados['descricao'],
            'Valor Servico: ' . $dados['v_servico'],
            'Aliquota: ' . $dados['aliq'],
            'ISSQN: ' . $dados['v_issqn'],
            'Valor Liquido: ' . $dados['v_liq'],
            'Vencimento: ' . $dados['vencimento'],
            'Vencimentos: ' . $dados['vencimentos']
        ]);

        $content = $pdf->Output('S');
        if (!is_string($content) || $content === '') {
            throw new RuntimeException('Falha ao gerar DANFS-e em PDF.');
        }

        return $content;
    }

    private function pick(\DOMXPath $xp, array $queries): string
    {
        foreach ($queries as $query) {
            $result = str_starts_with($query, 'string(')
                ? trim((string) $xp->evaluate($query))
                : trim((string) $xp->evaluate('string(' . $query . ')'));
            if ($result !== '') {
                return $result;
            }
        }
        return '';
    }

    private function section(\FPDF $pdf, string $titulo, array $linhas): void
    {
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(0, 6, $this->enc($titulo), 1, 1, 'L');
        $pdf->SetFont('Arial', '', 9);

        foreach ($linhas as $linha) {
            $texto = trim((string) $linha);
            if ($texto === '' || str_ends_with($texto, ':')) {
                $texto .= ' Nao informado';
            }
            $pdf->MultiCell(0, 5, $this->enc($texto), 1, 'L');
        }

        $pdf->Ln(1);
    }

    private function enc(string $text): string
    {
        $text = trim($text) !== '' ? $text : 'Nao informado';
        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $text) ?: 'Nao informado';
    }

    private function collectVencimentos(\DOMXPath $xp): string
    {
        $linhas = [];

        $duplicatas = $xp->query('//*[local-name()="dup" or local-name()="Duplicata"]');
        if ($duplicatas !== false) {
            foreach ($duplicatas as $dup) {
                if (!$dup instanceof \DOMElement) {
                    continue;
                }

                $numero = trim((string) $xp->evaluate('string(./*[local-name()="nDup" or local-name()="Numero"])', $dup));
                $data = trim((string) $xp->evaluate('string(./*[local-name()="dVenc" or local-name()="DataVencimento"])', $dup));
                $valor = trim((string) $xp->evaluate('string(./*[local-name()="vDup" or local-name()="Valor"])', $dup));

                $partes = [];
                if ($numero !== '') {
                    $partes[] = 'Parcela ' . $numero;
                }
                if ($data !== '') {
                    $partes[] = 'Venc: ' . $this->formatDateBr($data, false);
                }
                if ($valor !== '') {
                    $partes[] = 'Valor: ' . $this->formatMoneyBr($valor);
                }

                if ($partes !== []) {
                    $linhas[] = implode(' | ', $partes);
                }
            }
        }

        if ($linhas === []) {
            $fallback = $this->pick($xp, [
                '//*[local-name()="dVenc"]',
                '//*[local-name()="DataVencimento"]',
                '//*[local-name()="dataVencimento"]',
                '//*[local-name()="DtVencimento"]',
                '//*[local-name()="dtVencimento"]'
            ]);

            return $fallback;
        }

        return implode(' ; ', $linhas);
    }

    private function formatDateBr(string $value, bool $withTime): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m) === 1) {
            return $m[3] . '/' . $m[2] . '/' . $m[1];
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}:\d{2})(:\d{2})?/', $value, $m) === 1) {
            return $m[3] . '/' . $m[2] . '/' . $m[1] . ($withTime ? ' ' . $m[4] : '');
        }

        return $value;
    }

    private function formatMoneyBr(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        $normalized = str_replace(['R$', ' '], '', $value);
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
