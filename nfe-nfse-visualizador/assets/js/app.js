const fileInput = document.getElementById("xmlFile");
const printButton = document.getElementById("printButton");
const statusEl = document.getElementById("status");
const paperEl = document.getElementById("paper");
const danfeTemplate = document.getElementById("danfeTemplate");
const danfseTemplate = document.getElementById("danfseTemplate");

if (fileInput) fileInput.addEventListener("change", handleFileUpload);
if (printButton) printButton.addEventListener("click", () => window.print());

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => processXml(reader.result);
  reader.onerror = () => setStatus("Erro ao ler o arquivo XML.", true);
  reader.readAsText(file, "utf-8");
}

function processXml(xmlText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    if (xmlDoc.querySelector("parsererror")) throw new Error("XML invalido ou mal formatado.");

    const isNfe = !!firstByPath(xmlDoc, ["NFe", "infNFe"]) || !!firstByName(xmlDoc, "infNFe");
    const isNfse = !!firstByName(xmlDoc, "InfNfse") || !!firstByName(xmlDoc, "CompNfse");

    if (isNfe) return renderDanfe(xmlDoc);
    if (isNfse) return renderDanfse(xmlDoc);
    throw new Error("Tipo de XML nao reconhecido para DANFE/DANFS-e.");
  } catch (error) {
    hideDocs();
    console.error("Erro ao processar XML:", error);
    setStatus(error.message || "Falha ao processar XML.", true);
  }
}

function renderDanfe(xmlDoc) {
  hideDocs();
  paperEl.classList.remove("hidden");
  danfeTemplate.classList.remove("hidden");

  setText("danfeEmitenteNome", q(xmlDoc, ["emit", "xNome"]));
  setText("danfeEmitenteEndereco", fullAddress(xmlDoc, ["emit", "enderEmit"]));
  setText("danfeEmitenteCnpj", q(xmlDoc, ["emit", "CNPJ"]));
  setText("danfeEmitenteIe", q(xmlDoc, ["emit", "IE"]));
  setText("danfeNumero", q(xmlDoc, ["ide", "nNF"]));
  setText("danfeSerie", q(xmlDoc, ["ide", "serie"]));
  setText("danfeChave", danfeChave(xmlDoc));
  setText("danfeNatOp", q(xmlDoc, ["ide", "natOp"]));
  setText("danfeProtocolo", q(xmlDoc, ["protNFe", "infProt", "nProt"]));
  setText("danfeEmissao", formatDateTime(q(xmlDoc, ["ide", "dhEmi"])));

  setText("danfeDestNome", q(xmlDoc, ["dest", "xNome"]));
  setText("danfeDestDoc", q(xmlDoc, ["dest", "CNPJ"]) || q(xmlDoc, ["dest", "CPF"]));
  setText("danfeDestEndereco", fullAddress(xmlDoc, ["dest", "enderDest"]));
  setText("danfeDestCidadeUf", `${q(xmlDoc, ["dest", "enderDest", "xMun"])} / ${q(xmlDoc, ["dest", "enderDest", "UF"])}`);

  setText("danfeBcIcms", money(q(xmlDoc, ["ICMSTot", "vBC"])));
  setText("danfeVlrIcms", money(q(xmlDoc, ["ICMSTot", "vICMS"])));
  setText("danfeVlrProd", money(q(xmlDoc, ["ICMSTot", "vProd"])));
  setText("danfeVlrNota", money(q(xmlDoc, ["ICMSTot", "vNF"])));
  setText("danfeVlrFrete", money(q(xmlDoc, ["ICMSTot", "vFrete"])));
  setText("danfeVlrSeguro", money(q(xmlDoc, ["ICMSTot", "vSeg"])));
  setText("danfeVlrDesc", money(q(xmlDoc, ["ICMSTot", "vDesc"])));
  setText("danfeVlrIpi", money(q(xmlDoc, ["ICMSTot", "vIPI"])));

  fillDanfeItems(xmlDoc);
  fillDanfeTransport(xmlDoc);
  fillDanfeBilling(xmlDoc);
  fillDanfeAdditionalInfo(xmlDoc);
  setStatus("DANFE carregado e pronto para impressao.", false);
}

function fillDanfeItems(xmlDoc) {
  const tbody = document.getElementById("danfeItens");
  if (!tbody) {
    throw new Error("Nao foi encontrado o bloco de itens do DANFE na pagina.");
  }
  const dets = allByName(xmlDoc, "det");
  tbody.innerHTML = "";

  dets.forEach((det) => {
    const tr = document.createElement("tr");
    const values = [
      q(det, ["prod", "cProd"]),
      q(det, ["prod", "xProd"]),
      q(det, ["prod", "NCM"]),
      q(det, ["prod", "CFOP"]),
      q(det, ["prod", "uCom"]),
      q(det, ["prod", "qCom"]),
      money(q(det, ["prod", "vUnCom"])),
      money(q(det, ["prod", "vDesc"])),
      money(q(det, ["prod", "vProd"])),
      money(q(det, ["imposto", "ICMS", "ICMS00", "vBC"]) || q(det, ["imposto", "ICMS", "ICMS20", "vBC"])),
      money(q(det, ["imposto", "ICMS", "ICMS00", "vICMS"]) || q(det, ["imposto", "ICMS", "ICMS20", "vICMS"])),
      money(q(det, ["imposto", "IPI", "IPITrib", "vIPI"])),
      percent(q(det, ["imposto", "ICMS", "ICMS00", "pICMS"]) || q(det, ["imposto", "ICMS", "ICMS20", "pICMS"])),
      percent(q(det, ["imposto", "IPI", "IPITrib", "pIPI"]))
    ];
    values.forEach((val) => {
      const td = document.createElement("td");
      if (td) td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function fillDanfeTransport(xmlDoc) {
  setText("danfeTranspNome", q(xmlDoc, ["transp", "transporta", "xNome"]));
  setText("danfeTranspCnpj", q(xmlDoc, ["transp", "transporta", "CNPJ"]) || q(xmlDoc, ["transp", "transporta", "CPF"]));
  setText("danfeTranspIe", q(xmlDoc, ["transp", "transporta", "IE"]));
  setText("danfeTranspCidadeUf", `${q(xmlDoc, ["transp", "transporta", "xMun"])} / ${q(xmlDoc, ["transp", "transporta", "UF"])}`);
  setText("danfeTranspEndereco", q(xmlDoc, ["transp", "transporta", "xEnder"]));
  setText("danfeModFrete", decodeModFrete(q(xmlDoc, ["transp", "modFrete"])));
  setText("danfeQVol", q(xmlDoc, ["transp", "vol", "qVol"]));
  setText("danfeEsp", q(xmlDoc, ["transp", "vol", "esp"]));
  setText("danfePesoL", q(xmlDoc, ["transp", "vol", "pesoL"]));
  setText("danfePesoB", q(xmlDoc, ["transp", "vol", "pesoB"]));
}

function fillDanfeBilling(xmlDoc) {
  setText("danfeFatNum", q(xmlDoc, ["cobr", "fat", "nFat"]));
  setText("danfeFatOrig", money(q(xmlDoc, ["cobr", "fat", "vOrig"])));
  setText("danfeFatDesc", money(q(xmlDoc, ["cobr", "fat", "vDesc"])));
  setText("danfeFatLiq", money(q(xmlDoc, ["cobr", "fat", "vLiq"])));

  const tbody = document.getElementById("danfeDuplicatas");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dups = allByPath(xmlDoc, ["cobr", "dup"]);
  if (!dups.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "Sem duplicatas informadas.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  dups.forEach((dup) => {
    const tr = document.createElement("tr");
    [q(dup, ["nDup"]), formatDate(q(dup, ["dVenc"])), money(q(dup, ["vDup"]))].forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val || "Nao informado";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function fillDanfeAdditionalInfo(xmlDoc) {
  const obs = q(xmlDoc, ["infAdic", "infCpl"]);
  const obsCont = allByPath(xmlDoc, ["infAdic", "obsCont"])
    .map((node) => {
      const campo = node.getAttribute("xCampo") || "Obs";
      const texto = q(node, ["xTexto"]);
      return texto ? `${campo}: ${texto}` : "";
    })
    .filter(Boolean)
    .join(" | ");

  const full = [obs, obsCont].filter(Boolean).join(" | ");
  setText("danfeInfCpl", full);
}

function renderDanfse(xmlDoc) {
  hideDocs();
  paperEl.classList.remove("hidden");
  danfseTemplate.classList.remove("hidden");

  setText("danfsePrefeitura", q(xmlDoc, ["PrestadorServico", "Endereco", "Municipio"]) || q(xmlDoc, ["xMun"]));
  setText("danfseContato", `${q(xmlDoc, ["Telefone"])} ${q(xmlDoc, ["Email"])}`.trim());
  setText("danfseNumero", q(xmlDoc, ["InfNfse", "Numero"]));
  setText("danfseCompetencia", q(xmlDoc, ["Competencia"]) || q(xmlDoc, ["InfNfse", "Competencia"]));
  setText("danfseChave", q(xmlDoc, ["ChaveAcesso"]) || q(xmlDoc, ["InfNfse", "CodigoVerificacao"]));
  setText("danfseEmissao", q(xmlDoc, ["InfNfse", "DataEmissao"]));

  setText("danfsePrestadorNome", q(xmlDoc, ["PrestadorServico", "RazaoSocial"]));
  setText("danfsePrestadorCnpj", q(xmlDoc, ["PrestadorServico", "Cnpj"]));
  setText("danfsePrestadorEndereco", fullAddress(xmlDoc, ["PrestadorServico", "Endereco"]));
  setText("danfsePrestadorCidadeUf", `${q(xmlDoc, ["PrestadorServico", "Endereco", "Municipio"])} / ${q(xmlDoc, ["PrestadorServico", "Endereco", "Uf"])}`);

  setText("danfseTomadorNome", q(xmlDoc, ["TomadorServico", "RazaoSocial"]));
  setText("danfseTomadorDoc", q(xmlDoc, ["TomadorServico", "CpfCnpj", "Cnpj"]) || q(xmlDoc, ["TomadorServico", "CpfCnpj", "Cpf"]));
  setText("danfseTomadorEndereco", fullAddress(xmlDoc, ["TomadorServico", "Endereco"]));
  setText("danfseTomadorCidadeUf", `${q(xmlDoc, ["TomadorServico", "Endereco", "Municipio"])} / ${q(xmlDoc, ["TomadorServico", "Endereco", "Uf"])}`);

  setText("danfseDescricao", q(xmlDoc, ["Servico", "Discriminacao"]) || q(xmlDoc, ["DescricaoServico"]));
  setText("danfseVlrServico", money(q(xmlDoc, ["ValoresNfse", "ValorServicos"]) || q(xmlDoc, ["Servico", "Valores", "ValorServicos"])));
  setText("danfseBcIss", money(q(xmlDoc, ["ValoresNfse", "BaseCalculo"]) || q(xmlDoc, ["Servico", "Valores", "BaseCalculo"])));
  setText("danfseAliquota", percent(q(xmlDoc, ["ValoresNfse", "Aliquota"]) || q(xmlDoc, ["Servico", "Valores", "Aliquota"])));
  setText("danfseIssqn", money(q(xmlDoc, ["ValoresNfse", "ValorIss"]) || q(xmlDoc, ["Servico", "Valores", "ValorIss"])));
  setText("danfseVlrLiquido", money(q(xmlDoc, ["ValoresNfse", "ValorLiquidoNfse"]) || q(xmlDoc, ["Servico", "Valores", "ValorLiquidoNfse"])));

  setStatus("DANFS-e carregado e pronto para impressao.", false);
}

function hideDocs() {
  if (paperEl) paperEl.classList.add("hidden");
  if (danfeTemplate) danfeTemplate.classList.add("hidden");
  if (danfseTemplate) danfseTemplate.classList.add("hidden");
}

function q(base, path) {
  const node = firstByPath(base, path);
  return node ? (node.textContent || "").trim() : "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "Nao informado";
}

function fullAddress(xmlDoc, basePath) {
  const xLgr = q(xmlDoc, [...basePath, "xLgr"]) || q(xmlDoc, [...basePath, "Endereco"]);
  const nro = q(xmlDoc, [...basePath, "nro"]) || q(xmlDoc, [...basePath, "Numero"]);
  const xBairro = q(xmlDoc, [...basePath, "xBairro"]) || q(xmlDoc, [...basePath, "Bairro"]);
  const cep = q(xmlDoc, [...basePath, "CEP"]) || q(xmlDoc, [...basePath, "Cep"]);
  return [xLgr, nro, xBairro, cep].filter(Boolean).join(", ");
}

function money(value) {
  if (!value) return "Nao informado";
  const num = Number(value.replace(",", "."));
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function percent(value) {
  if (!value) return "Nao informado";
  const num = Number(value.replace(",", "."));
  if (Number.isNaN(num)) return `${value}%`;
  return `${num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}%`;
}

function formatDate(value) {
  if (!value) return "Nao informado";
  if (value.includes("T")) return formatDateTime(value);
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function decodeModFrete(code) {
  const map = {
    "0": "0 - Emitente",
    "1": "1 - Destinatario/Remetente",
    "2": "2 - Terceiros",
    "3": "3 - Proprio por conta remetente",
    "4": "4 - Proprio por conta destinatario",
    "9": "9 - Sem frete"
  };
  return map[code] || code || "Nao informado";
}

function danfeChave(xmlDoc) {
  const fromProt = q(xmlDoc, ["protNFe", "infProt", "chNFe"]);
  if (fromProt) return fromProt;

  const infNfe = firstByPath(xmlDoc, ["NFe", "infNFe"]) || firstByName(xmlDoc, "infNFe");
  const id = infNfe ? (infNfe.getAttribute("Id") || "") : "";
  if (id.startsWith("NFe")) return id.slice(3);
  return id || "Nao informado";
}

function allByName(root, name) {
  if (!root || !name) return [];
  const list = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode;
  while (current) {
    if ((current.localName || current.nodeName) === name) list.push(current);
    current = walker.nextNode();
  }
  return list;
}

function firstByName(root, name) {
  return allByName(root, name)[0] || null;
}

function firstChildByName(node, name) {
  if (!node || !node.children) return null;
  for (const child of node.children) {
    if ((child.localName || child.nodeName) === name) return child;
  }
  return null;
}

function firstByPath(root, path) {
  if (!Array.isArray(path) || path.length === 0) return null;
  let current = root;
  for (const step of path) {
    if (!current) return null;
    if (current.nodeType === Node.DOCUMENT_NODE) {
      current = firstByName(current, step);
    } else {
      current = firstChildByName(current, step);
    }
  }
  return current;
}

function allByPath(root, path) {
  if (!Array.isArray(path) || path.length === 0) return [];
  if (path.length === 1) return allByName(root, path[0]);

  const parentPath = path.slice(0, -1);
  const leaf = path[path.length - 1];
  const parent = firstByPath(root, parentPath);
  if (!parent) return [];
  return Array.from(parent.children || []).filter((child) => (child.localName || child.nodeName) === leaf);
}

function setStatus(message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  statusEl.classList.add(isError ? "error" : "success");
}
