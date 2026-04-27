<?php

declare(strict_types=1);

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMXPath;
use RuntimeException;

final class XmlHelper
{
    public static function load(string $xml): DOMDocument
    {
        $doc = new DOMDocument();
        $ok = @$doc->loadXML($xml);
        if (!$ok) {
            throw new RuntimeException('XML invalido.');
        }
        return $doc;
    }

    public static function xpath(DOMDocument $doc): DOMXPath
    {
        return new DOMXPath($doc);
    }

    public static function first(DOMXPath $xpath, string $query, ?DOMElement $context = null): ?DOMElement
    {
        $nodes = $xpath->query($query, $context);
        if ($nodes === false || $nodes->length === 0) {
            return null;
        }
        $node = $nodes->item(0);
        return $node instanceof DOMElement ? $node : null;
    }

    public static function text(DOMXPath $xpath, string $query, ?DOMElement $context = null): string
    {
        $el = self::first($xpath, $query, $context);
        return $el ? trim($el->textContent) : '';
    }
}
