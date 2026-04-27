# Projeto: Visualizador de NF-e e NFS-e por XML

Este projeto foi organizado para ficar **100% dentro de uma pasta unica**, facilitando:

- publicacao em hospedagem simples (como Hostinger);
- integracao em outro sistema via botao/widget;
- manutencao isolada.

## Estrutura

```text
nfe-nfse-visualizador/
  index.html
  assets/
    css/styles.css
    js/app.js
  embed/
    visualizador-widget.js
  README.md
```

## Como publicar na Hostinger

1. Envie o conteudo da pasta `nfe-nfse-visualizador` para o `public_html` (ou subpasta desejada).
2. Exemplo de URL final:
   - `https://seudominio.com.br/nfe-nfse-visualizador/`
3. Abra esta URL e teste upload de XML NF-e e NFS-e.

## Como integrar no outro projeto (botao)

No sistema principal, adicione o script abaixo antes do `</body>`:

```html
<script>
  window.NF_VISUALIZADOR_URL = "https://seudominio.com.br/nfe-nfse-visualizador/";
</script>
<script src="https://seudominio.com.br/nfe-nfse-visualizador/embed/visualizador-widget.js"></script>
```

Isso cria um botao fixo "Visualizar NF-e/NFS-e", abrindo um modal com o visualizador.

## Observacoes tecnicas

- O parser faz deteccao basica de XML de NF-e/NFS-e.
- Alguns layouts municipais de NFS-e variam bastante; conforme seus XMLs reais, podemos ajustar mapeamentos.
- Este projeto e estatico (HTML/CSS/JS), sem dependencia de backend.
