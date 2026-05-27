# Visualizador Fiscal — DANFE / DANFS-e

Aplicacao web full stack para **gerar, visualizar e validar DANFE (NF-e) e DANFS-e (NFS-e)** a partir de arquivos XML, com frontend estatico e API PHP desacoplada.

> Solucao desenvolvida para resolver uma dor real de operacao fiscal: transformar XML em PDF de forma rapida, acessivel pelo navegador e com deploy de baixo custo.

[![Demo](https://img.shields.io/badge/demo-online-success)](https://cornflowerblue-goldfinch-949602.hostingersite.com/)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![License](https://img.shields.io/badge/license-proprietaria-red)](#licenca)

---

## O problema e a solucao

Equipes administrativas e fiscais frequentemente precisam converter XML em PDF legivel (DANFE/DANFS-e) sem depender de software desktop, instalacao local ou fluxos manuais demorados.

Este projeto entrega:

- upload de XML em poucos cliques;
- geracao de PDF com preview imediato no navegador;
- arquitetura separada entre frontend e backend, facilitando manutencao e evolucao;
- tratamento de regras fiscais relevantes (duplicatas no DANFE, vencimentos no DANFS-e).

**Demo em producao:** [Visualizador Fiscal](https://cornflowerblue-goldfinch-949602.hostingersite.com/)

---

## Destaques para recrutadores

| Competencia | Evidencia no projeto |
|---|---|
| **Produto + engenharia** | Sistema funcional em producao, nao apenas exercicio academico |
| **Arquitetura web pragmatica** | Frontend estatico + API REST em infraestruturas distintas |
| **Dominio fiscal brasileiro** | Parsing de XML NF-e/NFS-e, renderizacao DANFE e DANFS-e customizado |
| **Ownership ponta a ponta** | Desenvolvimento, UX, regras de negocio, deploy e iteracao continua |
| **Codigo organizado** | Handlers, services e separacao clara de responsabilidades (PSR-4) |

---

## Stack tecnologica

### Frontend
- **HTML5, CSS3 e JavaScript (Vanilla)** — performance, simplicidade e deploy sem pipeline de build
- Interface responsiva com fluxo de upload, feedback de status e preview em `iframe`

### Backend
- **PHP 8.1+** com **Composer** e autoload PSR-4
- **nfephp-org/sped-da** — renderizacao de DANFE (NF-e)
- **setasign/fpdf** — layout customizado de DANFS-e (NFS-e)

### Infraestrutura
- Frontend estatico em **Hostinger**
- API PHP em **VPS Linux** (Apache/Nginx + PHP-FPM)

---

## Arquitetura

```text
Usuario (navegador)
        |
        |  upload XML + acao (DANFE / DANFS-e)
        v
Frontend estatico (Hostinger)
        |
        |  HTTP POST multipart/form-data
        v
API PHP (VPS)
   |-- POST /v1/danfe  -> NFePHP sped-da
   |-- POST /v1/danfse -> renderer customizado (FPDF)
        v
PDF retornado para preview / download
```

---

## Estrutura do repositorio

```text
nfe-nfse-visualizador/
├── frontend/                 # Interface principal
│   ├── index.html
│   └── assets/
│       ├── css/styles.css
│       └── js/app.js
├── backend/                  # API REST
│   ├── composer.json
│   ├── public/index.php
│   └── src/
│       ├── Handlers/         # DanfeHandler, DanfseHandler
│       └── Services/         # DanfsePdfRenderer, XmlHelper
├── embed/                    # Widget embedavel
└── Exemplos/                 # Pasta reservada (sem XMLs reais versionados)
```

---

## Funcionalidades implementadas

- Geracao de **DANFE** via endpoint dedicado (`/v1/danfe`)
- Geracao de **DANFS-e** com renderer proprio (`/v1/danfse`)
- Preview de PDF diretamente no navegador
- Tratamento de XML invalido ou ausente
- Injecao de **duplicatas** nas informacoes complementares do DANFE
- Exibicao de **vencimentos** no layout customizado do DANFS-e
- UX moderna: selecao de arquivo, estados de loading e mensagens de erro/sucesso

---

## Como executar localmente

### Pre-requisitos
- PHP 8.1+
- Composer

### 1) Backend

```bash
cd nfe-nfse-visualizador/backend
composer install
php -S localhost:8080 -t public
```

Endpoints locais:
- `http://localhost:8080/v1/danfe`
- `http://localhost:8080/v1/danfse`

### 2) Frontend

Sirva a pasta `nfe-nfse-visualizador/frontend` com qualquer servidor estatico.

Configure a URL da API em `frontend/assets/js/app.js`:

```javascript
const API_BASE_URL = "http://localhost:8080";
```

### 3) Teste

Envie um POST multipart com campo `xml` contendo um arquivo NF-e ou NFS-e valido.

---

## Decisoes tecnicas relevantes

**Por que Vanilla JS no frontend?**  
Reduz complexidade operacional, acelera deploy em hospedagem compartilhada e mantem o foco no fluxo principal.

**Por que PHP no backend?**  
Ecossistema maduro para integracoes fiscais no Brasil, excelente relacao custo/beneficio em VPS e integracao direta com bibliotecas como NFePHP.

**Por que renderer customizado para DANFS-e?**  
NFS-e possui variacoes por municipio; o renderer FPDF permite controle fino do layout e evolucao incremental por regras de negocio.

---

## Roadmap

- [ ] Configuracao de ambiente por variavel (`API_BASE_URL`, CORS por dominio)
- [ ] Testes automatizados dos endpoints
- [ ] Logs estruturados e monitoramento basico
- [ ] Autenticacao da API para uso privado
- [ ] Padronizacao visual de DANFS-e por municipio

---

## Seguranca e privacidade

- Nao versionar `.env`, certificados digitais (`.pfx`, `.pem`) ou XMLs/PDFs fiscais reais.
- A pasta `Exemplos/` esta preparada para uso local, com arquivos sensiveis ignorados pelo `.gitignore`.
- Em producao, recomenda-se restringir CORS, adicionar rate limiting e autenticacao na API.

---

## Licenca

Este projeto e **software proprietario**. Consulte o arquivo [LICENSE](LICENSE).

**Resumo:** e permitida apenas a visualizacao para avaliacao tecnica ou portifolio. E **proibida** a reproducao, redistribuicao, criacao de obras derivadas e **qualquer uso comercial** sem autorizacao escrita do autor.

Para licenciamento comercial ou parceria tecnica, entre em contato.

---

## Autor

**Jefferson**

Desenvolvedor com foco em solucoes web praticas, estabilidade operacional e entrega de valor em ambientes reais de negocio.

Se voce e recrutador(a), este repositorio demonstra capacidade de:
- entregar software funcional em producao;
- projetar arquitetura web desacoplada e sustentavel;
- aplicar conhecimento de dominio fiscal com qualidade tecnica.
