let contadorPaginas = 1;

    /* ------------------------- Funções principais ------------------------- */
    function execCmd(cmd, val = null) {
      document.execCommand(cmd, false, val);
    }

    function adicionarPagina() {
      contadorPaginas++;
      const pagesContainer = document.getElementById("pagesContainer");

      const sheet = document.createElement("div");
      sheet.className = "sheet";

      const page = document.createElement("div");
      page.className = "page";
      page.contentEditable = "true";
      page.spellcheck = true;
      page.setAttribute("oninput", "verificarOverflow(this)");
      page.innerHTML = "<p></p>";

      sheet.appendChild(page);
      pagesContainer.appendChild(sheet);

      atualizarBotaoAdicionar();
      page.focus();
      page.scrollIntoView({ behavior: "smooth" });
    }

    function atualizarBotaoAdicionar() {
      document.querySelectorAll(".btn-adicionar, .btn-excluir").forEach(btn => btn.remove());

      const todasSheets = document.querySelectorAll("#pagesContainer .sheet");
      todasSheets.forEach((sheet) => {
        if (todasSheets.length > 1) {
          const btnExcluir = document.createElement("button");
          btnExcluir.className = "btn-excluir";
          btnExcluir.textContent = "🗑️";
          btnExcluir.onclick = () => {
            if (confirm("Deseja realmente excluir esta página?")) {
              sheet.remove();
              atualizarBotaoAdicionar();
            }
          };
          sheet.appendChild(btnExcluir);
        }
      });

      const ultimaSheet = document.querySelector("#pagesContainer .sheet:last-child");
      if (ultimaSheet) {
        const btnAdd = document.createElement("button");
        btnAdd.className = "btn-adicionar";
        btnAdd.textContent = "+ Página";
        btnAdd.onclick = adicionarPagina;
        ultimaSheet.appendChild(btnAdd);
      }
    }

    function verificarOverflow(pagina) {
      while (pagina.scrollHeight > pagina.clientHeight) {
        const novaPagina = adicionarPagina();
        while (pagina.scrollHeight > pagina.clientHeight) {
          let ultimo = pagina.lastChild;
          if (!ultimo) break;
          novaPagina.insertBefore(ultimo, novaPagina.firstChild);
        }
        pagina = novaPagina;
      }
      atualizarBotaoAdicionar();
    }

    window.addEventListener("DOMContentLoaded", atualizarBotaoAdicionar);

    /* ---------------------------- Menus ---------------------------- */
    function showMenu(type) {
      const container = document.getElementById("menuContent");
      const menus = {
        arquivo: `
          <div class="card bg-dark text-light"><div class="card-header">📁 Arquivo</div>
            <div class="card-body">
              <button class="btn btn-primary btn-sm" onclick="abrirArquivo()">Abrir</button>
              <button class="btn btn-success btn-sm" onclick="salvarArquivo()">Salvar como TXT</button>
              <button class="btn btn-danger btn-sm" onclick="salvarComoPDF()">Salvar como PDF</button>
            </div>
          </div>`,
        editar: `
          <div class="card bg-dark text-light"><div class="card-header">✏️ Editar</div>
            <div class="card-body">
              <button class="btn btn-danger btn-sm" onclick="limparPagina()">Limpar</button>
              <button class="btn btn-warning btn-sm" onclick="alterarFonte()">Fonte</button>
              <button class="btn btn-info btn-sm" onclick="alterarTamanhoFonte()">Tamanho</button>
            </div>
          </div>`,
        inserir: `
          <div class="card bg-dark text-light"><div class="card-header">➕ Inserir</div>
            <div class="card-body">
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('upload').click()">Imagem/Vídeo</button>
              <button class="btn btn-danger btn-sm" onclick="inserirVideo()">Vídeo YouTube</button>
            </div>
          </div>`,
        layout: `
          <div class="card bg-dark text-light"><div class="card-header">📐 Layout</div>
            <div class="card-body">
              <button class="btn btn-outline-light btn-sm" onclick="margensLargas()">Margens largas</button>
              <button class="btn btn-outline-light btn-sm" onclick="margensEstreitas()">Margens estreitas</button>
              <button class="btn btn-outline-light btn-sm" onclick="fundoColorido()">Fundo colorido</button>
            </div>
          </div>`,
        revisao: `
          <div class="card bg-dark text-light"><div class="card-header">🔎 Revisão</div>
            <div class="card-body">
              <button class="btn btn-warning btn-sm" onclick="corrigirTexto()">Verificar ortografia</button>
            </div>
          </div>`
      };
      container.innerHTML = menus[type] || "";
    }

    /* ---------------------------- Arquivo ---------------------------- */
    function abrirArquivo() {
      const input = document.createElement("input");
      input.type = "file"; input.accept=".txt,.docx,.pdf";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => document.querySelector(".page").innerText = ev.target.result;
          reader.readAsText(file);
        }
      };
      input.click();
    }

    function salvarArquivo() {
      const blob = new Blob([document.querySelector(".page").innerText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "documento.txt";
      link.click();
    }

    function salvarComoPDF() {
      const nomeArquivo = prompt("Digite o nome do arquivo:", "documento");
      if (!nomeArquivo) return;

      const paginas = document.querySelectorAll(".page");
      const cloneContainer = document.createElement("div");

      paginas.forEach(pagina => {
        const clone = pagina.cloneNode(true);
        clone.querySelectorAll(".btn-adicionar, .btn-excluir").forEach(btn => btn.remove());
        Object.assign(clone.style, { border: "none", boxShadow: "none", margin: "0", width: "100%", height: "auto" });
        cloneContainer.appendChild(clone);
      });

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${nomeArquivo}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
      };

      html2pdf().set(opt).from(cloneContainer).save();
    }

    /* ---------------------------- Editar ---------------------------- */
    function limparPagina() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.innerHTML = "<p></p>";
    }

    function alterarFonte() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.style.fontFamily = prompt("Fonte (ex: Arial)");
    }

    function alterarTamanhoFonte() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.style.fontSize = prompt("Tamanho (ex: 18px)");
    }

    /* ---------------------------- Inserir ---------------------------- */
    function inserirVideo() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      const url = prompt("Cole a URL do vídeo YouTube");
      if (url) {
        const iframe = document.createElement("iframe");
        iframe.src = url.replace("watch?v=", "embed/");
        iframe.width = "400"; iframe.height = "250";
        pg.appendChild(iframe);
      }
    }

    function inserirMidia(event) {
      const file = event.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const ultimaPagina = document.querySelector(".page:last-of-type");
        const div = document.createElement("div");
        div.classList.add("media");
        if (file.type.startsWith("image/")) {
          div.innerHTML = `<img src="${e.target.result}" alt="imagem">`;
        } else if (file.type.startsWith("video/")) {
          div.innerHTML = `<video src="${e.target.result}" controls></video>`;
        }
        ultimaPagina.appendChild(div);
        ativarInteracao(div);
      };
      reader.readAsDataURL(file);
    }

    function ativarInteracao(el) {
      let selecionado, offsetX, offsetY;
      el.addEventListener("mousedown", (e) => {
        if (!e.target.closest("video")) {
          selecionado = el;
          offsetX = e.clientX - el.offsetLeft;
          offsetY = e.clientY - el.offsetTop;
          el.classList.add("active");
        }
      });
      document.addEventListener("mousemove", (e) => {
        if (selecionado) {
          selecionado.style.left = e.clientX - offsetX + "px";
          selecionado.style.top = e.clientY - offsetY + "px";
        }
      });
      document.addEventListener("mouseup", () => {
        if (selecionado) {
          selecionado.classList.remove("active");
          selecionado = null;
        }
      });
    }

    /* ---------------------------- Layout ---------------------------- */
    function margensLargas() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.style.padding = "100px";
    }
    function margensEstreitas() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.style.padding = "20px";
    }
    function fundoColorido() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      pg.style.background = "#f4f4f8";
    }

    /* ---------------------------- Revisão ---------------------------- */
    function corrigirTexto() {
      const pg = document.activeElement.closest(".page") || document.querySelector(".page");
      const text = pg.innerText;
      const palavrasErradas = ["teh", "reciver", "adress", "envoriment"];
      let html = text.split(" ").map(w => palavrasErradas.includes(w.toLowerCase()) ? `<mark class='error'>${w}</mark>` : w).join(" ");
      pg.innerHTML = html;
      alert("As palavras incorretas foram destacadas.");
    }