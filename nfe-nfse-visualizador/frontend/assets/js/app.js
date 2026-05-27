// Local: http://localhost:8080 | Producao: configure no deploy (nao versionar URL privada)
const API_BASE_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
  const xmlInput = document.getElementById("xmlInput");
  const btnPickXml = document.getElementById("btnPickXml");
  const xmlFileName = document.getElementById("xmlFileName");
  const btnDanfe = document.getElementById("btnDanfe");
  const btnDanfse = document.getElementById("btnDanfse");
  const statusEl = document.getElementById("status");
  const pdfFrame = document.getElementById("pdfFrame");

  if (!xmlInput || !btnDanfe || !btnDanfse || !statusEl || !pdfFrame) {
    console.error("Frontend incompleto: verifique se index.html e assets/js/app.js sao da mesma versao.");
    return;
  }

  if (btnPickXml) {
    btnPickXml.addEventListener("click", () => xmlInput.click());
  }

  xmlInput.addEventListener("change", () => {
    const file = xmlInput.files && xmlInput.files.length > 0 ? xmlInput.files[0] : null;
    if (xmlFileName) {
      xmlFileName.textContent = file ? file.name : "Nenhum arquivo selecionado";
    }
    setStatus(file ? `Arquivo selecionado: ${file.name}` : "Nenhum arquivo selecionado.", false);
  });

  btnDanfe.addEventListener("click", () => sendXml("danfe"));
  btnDanfse.addEventListener("click", () => sendXml("danfse"));

  setStatus("Pronto para carregar XML.", false);

  async function sendXml(documentType) {
    const file = xmlInput.files && xmlInput.files.length > 0 ? xmlInput.files[0] : null;
    if (!file) {
      setStatus("Selecione um XML antes de gerar o documento.", true);
      xmlInput.click();
      return;
    }

    const endpoint = documentType === "danfe" ? "/v1/danfe" : "/v1/danfse";
    const url = `${API_BASE_URL}${endpoint}`;
    const form = new FormData();
    form.append("xml", file);

    toggleLoading(true);
    setStatus(`Gerando ${documentType.toUpperCase()}...`, false);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: form
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Falha HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      pdfFrame.src = objectUrl;
      setStatus(`${documentType.toUpperCase()} gerado com sucesso.`, false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar XML.";
      setStatus(errorMessage, true);
    } finally {
      toggleLoading(false);
    }
  }

  function toggleLoading(loading) {
    btnDanfe.disabled = loading;
    btnDanfse.disabled = loading;
    if (btnPickXml) {
      btnPickXml.disabled = loading;
    }
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.remove("error", "success");
    statusEl.classList.add(isError ? "error" : "success");
  }
});
