(function () {
  const hostUrl = window.NF_VISUALIZADOR_URL || "https://SEU-DOMINIO.com.br/nfe-nfse-visualizador/";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Visualizar NF-e/NFS-e";
  button.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:999999;background:#1f6feb;color:#fff;border:none;padding:12px 16px;border-radius:8px;cursor:pointer;font-family:Arial,sans-serif;font-weight:600;";

  const overlay = document.createElement("div");
  overlay.style.cssText =
    "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:999998;";

  const modal = document.createElement("div");
  modal.style.cssText =
    "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(1100px,95vw);height:min(760px,92vh);background:#fff;border-radius:10px;overflow:hidden;";

  const iframe = document.createElement("iframe");
  iframe.src = hostUrl;
  iframe.style.cssText = "width:100%;height:100%;border:0;";
  iframe.title = "Visualizador de Notas Fiscais";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Fechar";
  close.style.cssText =
    "position:absolute;top:10px;right:12px;z-index:2;background:#b42318;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;";

  close.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.style.display = "none";
    }
  });

  button.addEventListener("click", () => {
    overlay.style.display = "block";
  });

  modal.appendChild(close);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(button);
  document.body.appendChild(overlay);
})();
