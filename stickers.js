(() => {
  const API = "/api/stickers";
  const ROOT = "Sticker Nany/";

  const categories = [
    { folder: "Nany Hollywood", label: "Nany Hollywood" },
    { folder: "Nany animada", label: "Nany Animada" },
    { folder: "Nany brujita feminista", label: "Nany Brujita Feminista" },
    { folder: "Nany folklore mundial", label: "Nany folklore mundial" },
    { folder: "Nany frases", label: "Nany Frases" },
    { folder: "Nany gamer", label: "Nany Gamer" },
    { folder: "Nany por el mundo", label: "Nany por el Mundo" },
    { folder: "Nany sentimientos", label: "Nany Sentimientos" },
    { folder: "Nany tarot", label: "Nany Tarot" },
    { folder: "Nany tik toker", label: "Nany TikToker" }
  ];

  const cursor = document.getElementById("cursor");
  if (cursor) {
    window.addEventListener("pointermove", (event) => {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    });
  }

  const grid = document.getElementById("category-grid");
  const catalogModal = document.getElementById("catalog-modal");
  const catalogGrid = document.getElementById("catalog-grid");
  const catalogTitle = document.getElementById("catalog-title");
  const catalogStatus = document.getElementById("catalog-status");
  const catalogCount = document.getElementById("catalog-count");

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    }[char]));
  }

  function apiUrl(folder) {
    return API + "?folder=" + encodeURIComponent(ROOT + folder);
  }

  async function getStickers(folder) {
    const response = await fetch(apiUrl(folder), {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("API " + response.status);
    }

    const data = await response.json();

    const items = Array.isArray(data.stickers)
      ? data.stickers
      : [];

    return items
      .map((item) => ({
        name: item.name || "Sticker",
        url: item.url || ""
      }))
      .filter((item) => item.url);
  }

  function buildCategories() {
    if (!grid) return;

    grid.innerHTML = categories.map((category, index) => `
      <article
        class="category-card no-data"
        data-folder="${escapeHtml(category.folder)}"
        data-index="${index}"
        tabindex="0"
        role="button"
        aria-label="Abrir ${escapeHtml(category.label)}"
      >
        <div class="showcase">
          <span class="loading">Conectando colección…</span>
          <img alt="${escapeHtml(category.label)}">
        </div>
        <div class="cat-copy">
          <strong>${escapeHtml(category.label)}</strong>
          <span>EXPLORAR ›</span>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll(".category-card").forEach((card) => {
      const open = () => openCatalog(card.dataset.folder);

      card.addEventListener("click", open);

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  }

  function startShowcase(card, stickers) {
    const image = card.querySelector("img");
    const loading = card.querySelector(".loading");

    if (!stickers.length) {
      loading.textContent = "Sin stickers disponibles";
      return;
    }

    card.classList.remove("no-data");

    if (loading) {
      loading.remove();
    }

    let index = 0;

    function showNext() {
      const sticker = stickers[index % stickers.length];

      image.classList.remove("visible");

      setTimeout(() => {
        image.src = sticker.url;
        image.onload = () => image.classList.add("visible");
      }, 200);

      index++;
    }

    showNext();
    window.setInterval(showNext, 3300);
  }

  async function loadShowcases() {
    if (!grid) return;

    const cards = [...grid.querySelectorAll(".category-card")];

    await Promise.all(cards.map(async (card) => {
      try {
        const stickers = await getStickers(card.dataset.folder);
        startShowcase(card, stickers.slice(0, 10));
      } catch (error) {
        const loading = card.querySelector(".loading");
        if (loading) {
          loading.textContent = "Error al cargar los stickers";
        }
        console.error(error);
      }
    }));
  }

  function createViewer() {
    if (document.getElementById("nany-sticker-viewer")) {
      return document.getElementById("nany-sticker-viewer");
    }

    const viewer = document.createElement("div");
    viewer.id = "nany-sticker-viewer";
    viewer.className = "nany-sticker-viewer";
    viewer.setAttribute("aria-hidden", "true");

    viewer.innerHTML = `
      <div class="nany-viewer-backdrop" data-viewer-close></div>

      <div class="nany-viewer-panel" role="dialog" aria-modal="true">
        <button
          class="nany-viewer-close"
          type="button"
          aria-label="Cerrar"
          data-viewer-close
        >×</button>

        <div class="nany-viewer-stage">
          <div class="nany-checkerboard"></div>

          <span class="nany-viewer-loading">
            Cargando sticker…
          </span>

          <img
            id="nany-viewer-image"
            alt="Sticker Nany Witchdancer"
          >
        </div>

        <div class="nany-viewer-bottom">
          <div class="nany-viewer-name">
            <small>NANY WITCHDANCER</small>
            <strong id="nany-viewer-title">Sticker</strong>
          </div>

          <div class="nany-viewer-actions">
            <button
              class="nany-download-btn"
              type="button"
              id="nany-download-btn"
            >↓ DESCARGAR</button>

            <button
              class="nany-edit-btn"
              type="button"
              id="nany-edit-btn"
            >✦ EDITAR</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(viewer);
    return viewer;
  }

  function createPremiumModal() {
    if (document.getElementById("nany-premium-modal")) {
      return document.getElementById("nany-premium-modal");
    }

    const modal = document.createElement("div");
    modal.id = "nany-premium-modal";
    modal.className = "nany-premium-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="nany-premium-card">
        <div class="nany-premium-star">✦</div>
        <small>NANY WITCHDANCER</small>
        <h3>Editor Premium</h3>
        <p>
          Estamos preparando las herramientas para que puedas
          personalizar tus stickers y hacerlos completamente tuyos.
        </p>
        <button
          type="button"
          class="nany-premium-close"
          data-premium-close
        >ENTENDIDO</button>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function removeGreenBackground(canvas, context, width, height) {
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;

    function isChroma(index) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];

      const greenChroma =
        green > 80 &&
        green > red * 1.12 &&
        green > blue * 1.12;

      const magentaChroma =
        red > 100 &&
        blue > 90 &&
        green < Math.min(red, blue) * 0.78;

      return greenChroma || magentaChroma;
    }

    function addPixel(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) {
        return;
      }

      const position = y * width + x;

      if (visited[position]) {
        return;
      }

      visited[position] = 1;

      const index = position * 4;

      if (isChroma(index)) {
        queue[tail++] = position;
      }
    }

    // Start only from the four edges.
    for (let x = 0; x < width; x++) {
      addPixel(x, 0);
      addPixel(x, height - 1);
    }

    for (let y = 0; y < height; y++) {
      addPixel(0, y);
      addPixel(width - 1, y);
    }

    while (head < tail) {
      const position = queue[head++];
      const x = position % width;
      const y = Math.floor(position / width);
      const index = position * 4;

      pixels[index + 3] = 0;

      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }

    context.putImageData(imageData, 0, 0);
  }
  async function prepareImage(url) {
    const image = new Image();

    image.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });

    context.drawImage(image, 0, 0);

    try {
      removeGreenBackground(
        canvas,
        context,
        canvas.width,
        canvas.height
      );

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.warn("No se pudo aplicar transparencia:", error);
      return url;
    }
  }

  async function openViewer(sticker) {
    const viewer = createViewer();

    const image = viewer.querySelector("#nany-viewer-image");
    const title = viewer.querySelector("#nany-viewer-title");
    const loading = viewer.querySelector(".nany-viewer-loading");
    const download = viewer.querySelector("#nany-download-btn");

    title.textContent = sticker.name || "Sticker";

    loading.style.display = "block";
    image.style.opacity = "0";

    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    try {
      const prepared = await prepareImage(sticker.url);

      image.src = prepared;
      image.onload = () => {
        loading.style.display = "none";
        image.style.opacity = "1";
      };

      download.onclick = () => {
        const link = document.createElement("a");
        link.href = prepared;
        link.download = sticker.name || "nany-witchdancer-sticker.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
      };
    } catch (error) {
      console.error(error);

      image.src = sticker.url;
      loading.textContent = "No se pudo preparar la transparencia.";

      download.onclick = () => {
        const link = document.createElement("a");
        link.href = sticker.url;
        link.download = sticker.name || "sticker.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
      };
    }
  }

  function closeViewer() {
    const viewer = document.getElementById("nany-sticker-viewer");

    if (!viewer) return;

    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showPremium() {
    const modal = createPremiumModal();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closePremium() {
    const modal = document.getElementById("nany-premium-modal");

    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  async function openCatalog(folder) {
    const category = categories.find(
      (item) => item.folder === folder
    ) || { label: folder };

    if (!catalogModal || !catalogGrid) return;

    catalogTitle.textContent = category.label;
    catalogStatus.textContent = "Cargando la colección…";
    catalogCount.textContent = "…";

    catalogGrid.innerHTML =
      '<div class="catalog-item"><span>Cargando…</span></div>';

    catalogModal.classList.add("open");
    catalogModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    try {
      const stickers = await getStickers(folder);

      catalogStatus.textContent = stickers.length
        ? "Explora la colección y elige un sticker."
        : "No encontramos stickers en esta colección todavía.";

      catalogCount.textContent =
        stickers.length + " stickers";

      catalogGrid.innerHTML = stickers.map((sticker, index) => `
        <div class="catalog-item">
          <img
            src="${escapeHtml(sticker.url)}"
            alt="${escapeHtml(sticker.name || "Sticker " + (index + 1))}"
            loading="lazy"
          >
        </div>
      `).join("");

      catalogGrid.querySelectorAll(".catalog-item").forEach((item, index) => {
        item.addEventListener("click", () => {
          openViewer(stickers[index]);
        });
      });
    } catch (error) {
      console.error(error);

      catalogStatus.textContent =
        "No se pudo cargar la colección.";

      catalogCount.textContent = "Error";

      catalogGrid.innerHTML =
        '<div class="catalog-item"><span>Error al cargar los stickers</span></div>';
    }
  }

  function closeCatalog() {
    if (!catalogModal) return;

    catalogModal.classList.remove("open");
    catalogModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-viewer-close]")) {
      closeViewer();
    }

    if (event.target.matches("#nany-edit-btn")) {
      showPremium();
    }

    if (event.target.matches("[data-premium-close]")) {
      closePremium();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeViewer();
      closePremium();
      closeCatalog();
    }
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeCatalog);
  });

  const editorInfo = document.getElementById("open-editor-info");

  if (editorInfo) {
    editorInfo.addEventListener("click", showPremium);
  }

  buildCategories();
  loadShowcases();
})();

