# Visualizador Fiscal - DANFE / DANFS-e

Aplicacao web para gerar e visualizar DANFE (NF-e) e DANFS-e a partir de XML, com frontend estatico e API PHP desacoplada.

> Projeto pensado para resolver um problema real de operacao fiscal: transformar XML em PDF de forma rapida, simples e com deploy de baixo custo.

---

## Visao de Produto

Este projeto entrega uma interface objetiva para equipes administrativas e fiscais:

- upload de XML em poucos cliques
- geracao de DANFE e DANFS-e em PDF
- preview no navegador sem depender de desktop local
- arquitetura separada entre frontend e backend para facilitar manutencao e escala

---

## Demo em Producao

- Frontend: [Gerador DANFE / DANFS-e](https://cornflowerblue-goldfinch-949602.hostingersite.com/)
- API: `https://api3.auctusconsultoria.com.br`

---

## Stack de Tecnologia (e por que foi escolhida)

### Frontend

- **HTML5 + CSS3 + JavaScript (Vanilla)**
  - motivo: carregamento rapido, baixa complexidade, sem dependencia de build
  - impacto: deploy simples em hospedagem compartilhada e manutencao direta

### Backend

- **PHP 8.1+**
  - motivo: ecossistema maduro para integracoes fiscais e alto custo-beneficio de infraestrutura
  - impacto: API leve e facil de hospedar em VPS comum

- **Composer**
  - motivo: gerenciamento padronizado de dependencias e autoload PSR-4

- **nfephp-org/sped-da**
  - motivo: biblioteca consolidada para renderizacao de DANFE

- **setasign/fpdf**
  - motivo: controle total de layout no DANFS-e customizado

### Infraestrutura

- **Hostinger (frontend estatico)**
  - motivo: entrega simples, economica e confiavel para camada web

- **VPS Linux (API PHP)**
  - motivo: isolamento da logica fiscal, controle de dominio e escalabilidade futura

---

## Arquitetura

```text
Usuario (navegador)
   |
   | upload XML + acao (DANFE/DANFS-e)
   v
Frontend estatico (Hostinger)
   |
   | HTTP POST multipart/form-data
   v
API PHP (VPS)
   |-- /v1/danfe  -> biblioteca fiscal (sped-da)
   |-- /v1/danfse -> renderer customizado (FPDF)
   v
PDF retornado para preview/download
```

---

## Estrutura do Projeto

```text
nfe-nfse-visualizador/
  frontend/
    index.html
    assets/
      css/styles.css
      js/app.js
  backend/
    composer.json
    public/index.php
    src/
      Handlers/
        DanfeHandler.php
        DanfseHandler.php
      Services/
        DanfsePdfRenderer.php
        XmlHelper.php
  Exemplos/
```

---

## Funcionalidades Entregues

- Geracao de DANFE via endpoint dedicado
- Geracao de DANFS-e com renderer proprio
- Exibicao de status no frontend (sucesso/erro)
- Preview de PDF em `iframe`
- Tratamento de XML invalido ou ausente
- Melhorias de UX no frontend (layout moderno e fluxo de upload)
- Tratamento de vencimentos no DANFS-e
- Tratamento de duplicatas no DANFE via informacoes complementares

---

## Como Rodar Localmente

## 1) Backend

Pre-requisitos:
- PHP 8.1+
- Composer

Comandos:

```bash
cd backend
composer install
php -S localhost:8080 -t public
```

API local:
- `http://localhost:8080/v1/danfe`
- `http://localhost:8080/v1/danfse`

## 2) Frontend

Opcao simples: servir a pasta `frontend` com qualquer servidor estatico (ou abrir o `index.html` em ambiente compativel com CORS da API).

Se quiser testar local apontando para backend local, ajuste a constante `API_BASE_URL` em `frontend/assets/js/app.js`.

---

## Publicacao

## Frontend (Hostinger)

1. Subir conteudo de `frontend/` no `public_html`.
2. Confirmar HTTPS ativo.
3. Limpar cache e validar tela.

## Backend (VPS)

1. Publicar conteudo de `backend/` em ex.: `/var/www/danfe-api`.
2. Instalar dependencias:

```bash
cd /var/www/danfe-api
composer install --no-dev --optimize-autoloader
```

3. Configurar virtual host com document root em `/var/www/danfe-api/public`.
4. Reiniciar servico web (`apache2` ou `nginx + php-fpm`).
5. Validar endpoints com POST multipart (`xml`).

---

## Diferenciais Tecnicos (visao de recrutador)

- **Visao de produto + execucao:** sistema resolvendo dor real de negocio, nao apenas exercicio tecnico.
- **Arquitetura pragmatica:** separacao frontend/backend com deploy em provedores diferentes.
- **Capacidade de integracao fiscal:** consumo e transformacao de XML com regras de dominio.
- **Manutencao orientada a impacto:** melhorias incrementais em UX, robustez e exibicao de dados criticos.
- **Ownership de ponta a ponta:** desenvolvimento, ajuste de layout, correcoes de regra e publicacao.

---

## Proximos Passos (Roadmap)

- Configuracao de ambiente por variavel (`API_BASE_URL`, CORS por dominio)
- Testes automatizados de endpoints
- Observabilidade basica (logs estruturados e monitoramento de erro)
- Autenticacao da API para uso privado
- Padronizacao visual dos PDFs por municipio (NFS-e)

---

## Autor

Desenvolvido por **Jefferson** com foco em simplicidade operacional, estabilidade e evolucao continua.

Se voce e recrutador(a), este projeto demonstra:
- capacidade de entregar software funcional em producao
- entendimento de arquitetura web realista
- foco em resultado de negocio com qualidade tecnica
