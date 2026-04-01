import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOsC1fEJdzrK0MXhfC5BP7S1A8A0-pq6k",
  authDomain: "tarjeterotjd.firebaseapp.com",
  projectId: "tarjeterotjd",
  storageBucket: "tarjeterotjd.firebasestorage.app",
  messagingSenderId: "528216617303",
  appId: "1:528216617303:web:c96fd8e8e4003339c38e12",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const chips = document.querySelectorAll(".chip[data-category]");

const btnKmTop = document.getElementById("btnKmTop");
const btnKmBottom = document.getElementById("btnKmBottom");
const btnSubirTarjeta = document.getElementById("btnSubirTarjeta");
const btnDescargarApp = document.getElementById("btnDescargarApp");
const btnAppStore = document.getElementById("btnAppStore");
const btnMas = document.getElementById("btnMas");
const btnGrid = document.getElementById("btnGrid");

const moreCategoriesMenu = document.getElementById("moreCategoriesMenu");
const moreCategoryItems = document.querySelectorAll(".more-category-item");

const btnAvisoTop = document.getElementById("btnAvisoTop");
const btnPoliticasTop = document.getElementById("btnPoliticasTop");
const btnAvisoFooter = document.getElementById("btnAvisoFooter");
const btnPoliticasFooter = document.getElementById("btnPoliticasFooter");
const btnDeslindeFooter = document.getElementById("btnDeslindeFooter");

const privacyModal = document.getElementById("privacyModal");
const policiesModal = document.getElementById("policiesModal");
const disclaimerModal = document.getElementById("disclaimerModal");

let allBusinessCards = [];
let currentCategory = "todos";

function safeText(value) {
  return value == null ? "" : String(value);
}

function normalizeText(value) {
  return safeText(value).toLowerCase().trim();
}

function getCategorySlug(card) {
  const raw = normalizeText(card.categoria || card.category || "");

  if (raw.includes("medic")) return "medicos";
  if (raw.includes("segur")) return "seguros";
  if (raw.includes("taller")) return "talleres";
  if (raw.includes("panader")) return "panaderias";
  if (raw.includes("restaurant") || raw.includes("comida")) return "restaurantes";

  if (raw.includes("refaccion")) return "refaccionarias";
  if (raw.includes("electric")) return "electricistas";
  if (raw.includes("abogad")) return "abogados";
  if (raw.includes("radiador")) return "radiadores";
  if (raw.includes("hojalat") || raw.includes("pintura")) return "hojalateria";
  if (raw.includes("llanta")) return "llantas";
  if (raw.includes("grua")) return "gruas";
  if (raw.includes("autolav")) return "autolavados";
  if (raw.includes("mecanic")) return "mecanicos";
  if (raw.includes("ropa") || raw.includes("accesorio")) return "ropa";
  if (raw.includes("podolog")) return "podologos";

  return "otros";
}

function formatStars(card) {
  const n =
    Number(card.promedioCalificacion) ||
    Number(card.rating) ||
    Number(card.calificacion) ||
    0;

  const rounded = Math.max(0, Math.min(5, Math.round(n)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function getCardImage(card) {
  return (
    card.imagenFrontal ||
    card.imagen ||
    card.logo ||
    card.image ||
    "logotjd.png"
  );
}

function getDisplayName(card) {
  return (
    safeText(card.nombre) ||
    safeText(card.businessName) ||
    safeText(card.title) ||
    "Negocio"
  );
}

function getPhone(card) {
  return (
    safeText(card.telefono) ||
    safeText(card.phone) ||
    safeText(card.whatsapp) ||
    ""
  );
}

function getWhatsapp(card) {
  return (
    safeText(card.whatsapp) ||
    safeText(card.whatsappNumber) ||
    safeText(card.telefono) ||
    ""
  );
}

function getAddress(card) {
  return safeText(card.direccion) || safeText(card.address) || "";
}

function getWebsite(card) {
  return safeText(card.web) || safeText(card.sitioWeb) || "";
}

function getSchedule(card) {
  return safeText(card.horarios) || safeText(card.horario) || "";
}

function getOfferText(card) {
  return safeText(card.ofertas || card.promoTexto || "");
}

function hasTrustSeal(card) {
  return card.planActivo === true;
}

function getVideoUrl(card) {
  if (card.videoPublicidadAutorizado === true && safeText(card.videoPublicidadUrl)) {
    return safeText(card.videoPublicidadUrl);
  }
  return "";
}

function getSearchBlob(card) {
  return [
    card.nombre,
    card.businessName,
    card.categoria,
    card.category,
    card.direccion,
    card.address,
    card.telefono,
    card.phone,
    card.whatsapp,
    card.web,
    card.sitioWeb,
    card.ofertas,
    card.promoTexto,
    card.inventarioKeywords,
    card.serviciosKeywords,
  ]
    .map((v) => normalizeText(v))
    .join(" ");
}

function escapeHtml(text) {
  return safeText(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(text) {
  return safeText(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function openMaps(address) {
  const encoded = encodeURIComponent(address || "");
  if (!encoded) {
    alert("Esta tarjeta no tiene dirección.");
    return;
  }
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
}

function openPhone(phone) {
  const clean = safeText(phone).replace(/[^\d+]/g, "");
  if (!clean) {
    alert("Esta tarjeta no tiene teléfono.");
    return;
  }
  window.open(`tel:${clean}`, "_self");
}

function openWhatsapp(phone, name) {
  const clean = safeText(phone).replace(/\D/g, "");
  if (!clean) {
    alert("Esta tarjeta no tiene WhatsApp.");
    return;
  }
  const msg = encodeURIComponent(`Hola, vi tu tarjeta en TJD y me interesa tu negocio: ${name}`);
  window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
}

function openWebsite(url) {
  const raw = safeText(url).trim();
  if (!raw) {
    alert("Esta tarjeta no tiene sitio web.");
    return;
  }
  const finalUrl =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  window.open(finalUrl, "_blank");
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

function renderCards(cards) {
  cardsContainer.innerHTML = "";

  if (!cards.length) {
    cardsContainer.innerHTML = `
      <div class="business-card" style="padding:24px;">
        <h3 style="font-size:1.4rem; margin-bottom:8px;">Sin resultados</h3>
        <p style="color:#6b6480;">No encontré tarjetas con esa búsqueda.</p>
      </div>
    `;
    return;
  }

  cards.forEach((card) => {
    const name = getDisplayName(card);
    const categorySlug = getCategorySlug(card);
    const image = getCardImage(card);
    const address = getAddress(card);
    const phone = getPhone(card);
    const whatsapp = getWhatsapp(card);
    const website = getWebsite(card);
    const schedule = getSchedule(card);
    const stars = formatStars(card);
    const offerText = getOfferText(card);
    const trustSeal = hasTrustSeal(card);
    const videoUrl = getVideoUrl(card);

    const mediaHtml = videoUrl
      ? `
        <div class="banner-art" style="padding:0; overflow:hidden; min-height:260px;">
          <video
            src="${escapeAttr(videoUrl)}"
            controls
            muted
            playsinline
            preload="metadata"
            style="width:100%; height:100%; object-fit:cover; display:block; background:#000;"
          ></video>
        </div>
      `
      : `
        <div class="banner-art" style="padding:0; overflow:hidden; min-height:260px;">
          <img
            src="${escapeAttr(image)}"
            alt="${escapeAttr(name)}"
            style="width:100%; height:100%; object-fit:cover; display:block;"
            onerror="this.src='logotjd.png';"
          />
        </div>
      `;

    const article = document.createElement("article");
    article.className = "business-card promo-card";
    article.dataset.category = categorySlug;

    article.innerHTML = `
      ${mediaHtml}

      <div class="promo-info">
        <h3>${escapeHtml(name)}</h3>

        ${
          trustSeal
            ? `
          <div class="detail-line" style="color:#2e9d57; font-weight:800;">
            <i class="fa-solid fa-shield-heart"></i>
            <span>Sello de confianza</span>
          </div>
        `
            : ""
        }

        ${
          address
            ? `
          <div class="detail-line">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(address)}</span>
          </div>
        `
            : ""
        }

        ${
          schedule
            ? `
          <div class="detail-line">
            <i class="fa-regular fa-clock"></i>
            <span>${escapeHtml(schedule)}</span>
          </div>
        `
            : ""
        }

        ${
          whatsapp
            ? `
          <div class="detail-line whatsapp-line">
            <i class="fa-brands fa-whatsapp"></i>
            <span>${escapeHtml(whatsapp)}</span>
          </div>
        `
            : ""
        }

        ${
          offerText
            ? `
          <div class="detail-line" style="color:#7a3cff; font-weight:700;">
            <i class="fa-solid fa-tag"></i>
            <span>Oferta: ${escapeHtml(offerText)}</span>
          </div>
        `
            : ""
        }

        <div class="promo-footer">
          <div class="footer-actions">
            <button class="footer-chip js-ubicacion" type="button">
              <i class="fa-solid fa-location-dot"></i>
              Ubicación
            </button>

            <button class="footer-chip footer-chip-green js-telefono" type="button">
              <i class="fa-solid fa-phone"></i>
              Teléfono
            </button>

            <button class="footer-chip js-whatsapp" type="button">
              <i class="fa-brands fa-whatsapp"></i>
              WhatsApp
            </button>

            <button class="footer-chip js-web" type="button">
              <i class="fa-solid fa-globe"></i>
              Web
            </button>
          </div>

          <div class="footer-stars gold">${stars}</div>
        </div>
      </div>
    `;

    article.querySelector(".js-ubicacion")?.addEventListener("click", () => openMaps(address));
    article.querySelector(".js-telefono")?.addEventListener("click", () => openPhone(phone));
    article.querySelector(".js-whatsapp")?.addEventListener("click", () => openWhatsapp(whatsapp, name));
    article.querySelector(".js-web")?.addEventListener("click", () => openWebsite(website));

    cardsContainer.appendChild(article);
  });
}

function applyFilters() {
  const searchTerm = normalizeText(searchInput?.value);

  let filtered = [...allBusinessCards];

  if (currentCategory !== "todos") {
    filtered = filtered.filter((card) => getCategorySlug(card) === currentCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter((card) => getSearchBlob(card).includes(searchTerm));
  }

  filtered.sort((a, b) => {
    const aDestacado = a.destacado === true ? 1 : 0;
    const bDestacado = b.destacado === true ? 1 : 0;

    if (aDestacado !== bDestacado) return bDestacado - aDestacado;

    const aOrden = Number(a.destacadoOrden || 9999);
    const bOrden = Number(b.destacadoOrden || 9999);

    if (aOrden !== bOrden) return aOrden - bOrden;

    return 0;
  });

  renderCards(filtered);
}

function loadBusinessCards() {
  try {
    onSnapshot(collection(db, "cards"), (snapshot) => {
      const rows = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const isBusiness =
          data?.tab === "business" ||
          data?.type === "business";

        if (isBusiness) {
          rows.push({
            id: docSnap.id,
            ...data,
          });
        }
      });

      allBusinessCards = rows;
      applyFilters();
    });
  } catch (error) {
    console.error("Error cargando cards:", error);
    cardsContainer.innerHTML = `
      <div class="business-card" style="padding:24px;">
        <h3 style="font-size:1.4rem; margin-bottom:8px;">Error al cargar</h3>
        <p style="color:#6b6480;">No se pudieron leer las tarjetas desde Firebase.</p>
      </div>
    `;
  }
}

searchInput?.addEventListener("keyup", applyFilters);
searchBtn?.addEventListener("click", applyFilters);

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentCategory = chip.dataset.category || "todos";
    moreCategoriesMenu?.classList.remove("show");
    applyFilters();
  });
});

moreCategoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selectedCategory = item.dataset.category || "otros";
    chips.forEach((c) => c.classList.remove("active"));
    currentCategory = selectedCategory;
    moreCategoriesMenu?.classList.remove("show");
    applyFilters();
  });
});

btnMas?.addEventListener("click", () => {
  moreCategoriesMenu?.classList.toggle("show");
});

btnGrid?.addEventListener("click", () => {
  moreCategoriesMenu?.classList.toggle("show");
});

btnKmTop?.addEventListener("click", () => {
  alert("La búsqueda por km la conectamos en el siguiente paso con ubicación real.");
});

btnKmBottom?.addEventListener("click", () => {
  alert("La búsqueda por km la conectamos en el siguiente paso con ubicación real.");
});

btnSubirTarjeta?.addEventListener("click", () => {
  alert("Aquí podemos mandar al formulario o a la app para subir tarjeta.");
});

btnDescargarApp?.addEventListener("click", () => {
  alert("Aquí ponemos el enlace real de descarga Android.");
});

btnAppStore?.addEventListener("click", () => {
  alert("Aquí ponemos el enlace real de App Store.");
});

btnAvisoTop?.addEventListener("click", () => openModal(privacyModal));
btnPoliticasTop?.addEventListener("click", () => openModal(policiesModal));
btnAvisoFooter?.addEventListener("click", () => openModal(privacyModal));
btnPoliticasFooter?.addEventListener("click", () => openModal(policiesModal));
btnDeslindeFooter?.addEventListener("click", () => openModal(disclaimerModal));

document.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", () => {
    const modalId = el.getAttribute("data-close");
    if (modalId) {
      closeModal(document.getElementById(modalId));
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(privacyModal);
    closeModal(policiesModal);
    closeModal(disclaimerModal);
  }
});

window.openMaps = openMaps;
window.openPhone = openPhone;
window.openWhatsapp = openWhatsapp;
window.openWebsite = openWebsite;

loadBusinessCards();
