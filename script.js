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

const btnAvisoTop = document.getElementById("btnAvisoTop");
const btnPoliticasTop = document.getElementById("btnPoliticasTop");
const btnAvisoFooter = document.getElementById("btnAvisoFooter");
const btnPoliticasFooter = document.getElementById("btnPoliticasFooter");
const btnDeslindeFooter = document.getElementById("btnDeslindeFooter");

const privacyModal = document.getElementById("privacyModal");
const policiesModal = document.getElementById("policiesModal");
const disclaimerModal = document.getElementById("disclaimerModal");

// ===============================
// CONTACTO TARJETERO
// ===============================
const TARJETERO_WHATSAPP = "5215512345678"; // CAMBIA ESTE NÚMERO
const TARJETERO_EMAIL = "ventas@tarjeterodigitaltjd.com"; // CAMBIA ESTE CORREO

let allBusinessCards = [];
let currentCategory = "todos";

// categorías fijas que ya tienes en la parte principal
const BASE_CATEGORY_DEFS = [
  {
    slug: "medicos",
    match: ["medico", "medicos", "doctor", "doctores", "clinica", "clinicas", "hospital", "hospitales", "dentista", "dentistas", "odontologia", "odontologo"],
  },
  {
    slug: "seguros",
    match: ["seguro", "seguros", "aseguradora", "aseguradoras", "aseguranza"],
  },
  {
    slug: "talleres",
    match: ["taller", "talleres"],
  },
  {
    slug: "panaderias",
    match: ["panaderia", "panaderias", "pan", "pasteleria", "pastelerias"],
  },
  {
    slug: "restaurantes",
    match: ["restaurante", "restaurantes", "comida", "taqueria", "taquerias", "cafeteria", "cafeterias"],
  },
];

const MORE_CATEGORY_COLORS = [
  { bg: "#5e60ff", color: "#fff" },
  { bg: "#00bcd4", color: "#fff" },
  { bg: "#ff4fa7", color: "#fff" },
  { bg: "#7c4dff", color: "#fff" },
  { bg: "#ff7a59", color: "#fff" },
  { bg: "#3f51b5", color: "#fff" },
  { bg: "#00c853", color: "#fff" },
  { bg: "#00a8ff", color: "#fff" },
  { bg: "#8e44ad", color: "#fff" },
  { bg: "#ff3f9d", color: "#fff" },
  { bg: "#43bfff", color: "#fff" },
  { bg: "#ef5350", color: "#fff" },
];

// ===============================
// HELPERS
// ===============================
function safeText(value) {
  return value == null ? "" : String(value);
}

function normalizeText(value) {
  return safeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

function titleCaseCategory(text) {
  const raw = safeText(text).trim();
  if (!raw) return "";
  return raw
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ===============================
// CATEGORÍAS REALES
// ===============================
function getRawCategory(card) {
  return safeText(card.categoria || card.category || "").trim();
}

function getNormalizedCategory(card) {
  return normalizeText(getRawCategory(card));
}

function getBaseCategorySlugFromNormalized(normalizedCategory) {
  if (!normalizedCategory) return null;

  for (const def of BASE_CATEGORY_DEFS) {
    for (const word of def.match) {
      if (normalizedCategory.includes(word)) {
        return def.slug;
      }
    }
  }

  return null;
}

function getCardFilterKey(card) {
  const normalizedCategory = getNormalizedCategory(card);
  const baseSlug = getBaseCategorySlugFromNormalized(normalizedCategory);

  if (baseSlug) return baseSlug;
  if (normalizedCategory) return real:${normalizedCategory};
  return "real:otros";
}

function getRealExtraCategories(cards) {
  const extrasMap = new Map();

  cards.forEach((card) => {
    const raw = getRawCategory(card);
    const normalized = normalizeText(raw);
    if (!normalized) return;

    const baseSlug = getBaseCategorySlugFromNormalized(normalized);
    if (baseSlug) return;

    if (!extrasMap.has(normalized)) {
      extrasMap.set(normalized, raw);
    }
  });

  return Array.from(extrasMap.entries())
    .map(([normalized, raw]) => ({
      normalized,
      label: titleCaseCategory(raw || normalized),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function renderMoreCategories(cards) {
  if (!moreCategoriesMenu) return;

  const extraCategories = getRealExtraCategories(cards);

  if (!extraCategories.length) {
    moreCategoriesMenu.innerHTML = `
      <div style="padding:12px 14px; color:#6f6985; font-weight:600;">
        No hay más categorías registradas.
      </div>
    `;
    return;
  }

  moreCategoriesMenu.innerHTML = `
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      ${extraCategories
        .map((item, index) => {
          const color = MORE_CATEGORY_COLORS[index % MORE_CATEGORY_COLORS.length];
          return `
            <button
              type="button"
              class="more-category-real-item"
              data-category="real:${escapeAttr(item.normalized)}"
              style="
                border:none;
                border-radius:14px;
                padding:12px 16px;
                font-size:1rem;
                font-weight:800;
                cursor:pointer;
                background:${color.bg};
                color:${color.color};
                box-shadow:0 8px 18px rgba(57,36,93,0.10);
              "
            >
              ${escapeHtml(item.label)}
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  moreCategoriesMenu.querySelectorAll(".more-category-real-item").forEach((button) => {
    button.addEventListener("click", () => {
      chips.forEach((chip) => chip.classList.remove("active"));
      currentCategory = button.dataset.category || "todos";
      moreCategoriesMenu.classList.remove("show");
      applyFilters();
    });
  });
}

// ===============================
// DATOS TARJETA
// ===============================
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
  return safeText(card.ofertas || card.promoTexto || card.promocion || "");
}

function hasTrustSeal(card) {
  return card.planActivo === true || card.selloConfianza === true;
}

function isFeatured(card) {
  return card.destacado === true || card.publicidadLocal === true;
}

function getFeaturedOrder(card) {
  return Number(card.destacadoOrden || card.privilegioOrden || card.posicionPrivilegio || 9999);
}

function getVideoUrl(card) {
  return (
    safeText(card.videoPublicidadUrl) ||
    safeText(card.videoUrl) ||
    safeText(card.videoPromoUrl) ||
    ""
  );
}

function isVideoAuthorized(card) {
  return (
    card.videoPublicidadAutorizado === true ||
    card.videoAutorizado === true ||
    card.videoApproved === true
  );
}

function getRatingNumber(card) {
  const n =
    Number(card.promedioCalificacion) ||
    Number(card.rating) ||
    Number(card.calificacion) ||
    Number(card.estrellas) ||
    0;

  return Math.max(0, Math.min(5, n));
}

function formatStars(card) {
  const rounded = Math.round(getRatingNumber(card));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function getComments(card) {
  if (Array.isArray(card.comentarios) && card.comentarios.length) {
    return card.comentarios
      .map((c) => {
        if (typeof c === "string") return c;
        return safeText(c?.comentario || c?.texto || c?.text);
      })
      .filter(Boolean)
      .slice(0, 3);
  }

  if (Array.isArray(card.comments) && card.comments.length) {
    return card.comments
      .map((c) => {
        if (typeof c === "string") return c;
        return safeText(c?.comentario || c?.texto || c?.text);
      })
      .filter(Boolean)
      .slice(0, 3);
  }

  if (card.calificacion && typeof card.calificacion === "object") {
    const singleComment = safeText(card.calificacion.comentario);
    return singleComment ? [singleComment] : [];
  }

  return [];
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
    card.promocion,
    card.inventarioKeywords,
    card.serviciosKeywords,
    card.descripcion,
    card.tipoServicio,
    card.subcategoria,
    card.subCategory,
  ]
    .map((v) => normalizeText(v))
    .join(" ");
}

// ===============================
// ACCIONES
// ===============================
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

// ===============================
// MODALES LEGALES
// ===============================
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

// ===============================
// RENDER TARJETAS
// ===============================
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
    const image = getCardImage(card);
    const name = getDisplayName(card);
    const address = getAddress(card);
    const phone = getPhone(card);
    const whatsapp = getWhatsapp(card);
    const website = getWebsite(card);
    const schedule = getSchedule(card);
    const offerText = getOfferText(card);
    const trustSeal = hasTrustSeal(card);
    const featured = isFeatured(card);
    const featuredOrder = getFeaturedOrder(card);
    const stars = formatStars(card);
    const ratingValue = getRatingNumber(card);
    const comments = getComments(card);
    const rawCategory = getRawCategory(card);

    const videoUrl = getVideoUrl(card);
    const showVideo = Boolean(videoUrl && isVideoAuthorized(card));

    const mediaHtml = showVideo
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
    article.dataset.category = getCardFilterKey(card);

    article.innerHTML = `
      ${mediaHtml}

      <div class="promo-info">
        <h3>${escapeHtml(name)}</h3>

        ${
          rawCategory
            ? `
          <div class="detail-line">
            <i class="fa-solid fa-layer-group"></i>
            <span>${escapeHtml(rawCategory)}</span>
          </div>
        `
            : ""
        }

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
          featured
            ? `
          <div class="detail-line" style="color:#b36b00; font-weight:800;">
            <i class="fa-solid fa-crown"></i>
            <span>Posición privilegiada${featuredOrder !== 9999 ? ` #${featuredOrder}` : ""}</span>
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

        <div class="detail-line">
          <i class="fa-solid fa-star"></i>
          <span>Calificación: ${escapeHtml(stars)} (${ratingValue.toFixed(1)})</span>
        </div>

        ${
          comments.length
            ? `
          <div class="detail-line" style="align-items:flex-start;">
            <i class="fa-regular fa-comment-dots"></i>
            <div>
              ${comments
                .map((comment) => `<div style="margin-bottom:6px;">• ${escapeHtml(comment)}</div>`)
                .join("")}
            </div>
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

// ===============================
// FILTROS
// ===============================
function applyFilters() {
  const searchTerm = normalizeText(searchInput?.value);
  let filtered = [...allBusinessCards];

  if (currentCategory !== "todos") {
    filtered = filtered.filter((card) => {
      const key = getCardFilterKey(card);
      return key === currentCategory;
    });
  }

  if (searchTerm) {
    filtered = filtered.filter((card) => getSearchBlob(card).includes(searchTerm));
  }

  filtered.sort((a, b) => {
    const aDestacado = isFeatured(a) ? 1 : 0;
    const bDestacado = isFeatured(b) ? 1 : 0;

    if (aDestacado !== bDestacado) return bDestacado - aDestacado;

    const aOrden = getFeaturedOrder(a);
    const bOrden = getFeaturedOrder(b);

    if (aOrden !== bOrden) return aOrden - bOrden;

    return 0;
  });

  renderCards(filtered);
}

// ===============================
// FIREBASE TIEMPO REAL
// ===============================
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
      renderMoreCategories(rows);
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

// ===============================
// SUBIR TARJETA
// ===============================
btnSubirTarjeta?.addEventListener("click", () => {
  const opcion = confirm(
    "¿Deseas enviar tu información por WhatsApp?\n\nAceptar = WhatsApp\nCancelar = Correo"
  );

  if (opcion) {
    const mensaje = encodeURIComponent(
      "Hola, quiero subir mi tarjeta de negocio al Tarjetero Digital TJD.\n\n" +
      "Nombre del negocio:\n" +
      "Categoría:\n" +
      "Teléfono:\n" +
      "Dirección:\n" +
      "Horario:\n" +
      "Sitio Web:\n" +
      "Descripción:"
    );

    window.open(`https://wa.me/${TARJETERO_WHATSAPP}?text=${mensaje}`, "_blank");
  } else {
    window.location.href =
      `mailto:${TARJETERO_EMAIL}?subject=Subir Tarjeta Tarjetero Digital TJD&body=` +
      `Hola,%20quiero%20subir%20mi%20tarjeta%20de%20negocio.%0A%0A` +
      `Nombre%20del%20negocio:%0A` +
      `Categoría:%0A` +
      `Teléfono:%0A` +
      `Dirección:%0A` +
      `Horario:%0A` +
      `Sitio%20Web:%0A` +
      `Descripción:`;
  }
});

// ===============================
// EVENTOS
// ===============================
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

btnDescargarApp?.addEventListener("click", () => {
  window.open("https://TU-ENLACE-ANDROID-AQUI.com", "_blank");
});

btnAppStore?.addEventListener("click", () => {
  window.open("https://TU-ENLACE-IOS-AQUI.com", "_blank");
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

// ===============================
// EXPONER FUNCIONES
// ===============================
window.openMaps = openMaps;
window.openPhone = openPhone;
window.openWhatsapp = openWhatsapp;
window.openWebsite = openWebsite;

// ===============================
// INIT
// ===============================
loadBusinessCards();
