[5:53 p.m., 31/3/2026] As Click Mexico: * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

:root {
  --bg: #f5f3fb;
  --dark: #231338;
  --dark-2: #31154e;
  --purple: #6b2fe4;
  --pink: #ff3f9d;
  --yellow: #ffd63e;
  --blue: #35d8ff;
  --card-radius: 26px;
  --shadow: 0 10px 28px rgba(31, 18, 63, 0.12);
}

body {
  background: var(--bg);
  color: #241b45;
}

.app {
  min-height: 100vh;
}

/* HERO */
.hero {
  position: relative;
  overflow: hidden;
  padding: 24px 18px 30px;
  background:
    radial-gradient(circle at left top, rgba(66, 201, 255, 0.35), transparent 28%),
    radial-gradient(circle at right top, rgba(255, 37, 146, 0.33), transparent 30%),
    linear-gradient(135deg, #2f1570 0%, #6f1aa8 36%, #ff369e 100%);
}

.hero-overlay {
  p…
[5:54 p.m., 31/3/2026] As Click Mexico: const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const cards = document.querySelectorAll(".business-card");
const chips = document.querySelectorAll(".chip[data-category]");

function applySearchAndCategory() {
  const text = searchInput.value.trim().toLowerCase();
  const activeChip = document.querySelector(".chip.active");
  const category = activeChip ? activeChip.dataset.category : "todos";

  cards.forEach((card) => {
    const cardText = card.innerText.toLowerCase();
    const cardCategory = card.dataset.category || "";
    const matchText = cardText.includes(text);
    const matchCategory = category === "todos" || cardCategory === category;

    card.style.display = matchText && matchCategory ? "block" : "none";
  });
}

searchInput.addEventListener("keyup", applySearchAndCategory);
searchBtn.addEventListener("click", applySearchAndCategory);

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    applySearchAndCategory();
  });
});

document.getElementById("btnKmTop").addEventListener("click", () => {
  alert("Próximamente búsqueda por kilómetros.");
});

document.getElementById("btnKmBottom").addEventListener("click", () => {
  alert("Próximamente búsqueda por kilómetros.");
});

document.getElementById("btnSubirTarjeta").addEventListener("click", () => {
  alert("Aquí después conectamos el formulario para subir tarjetas.");
});

document.getElementById("btnDescargarApp").addEventListener("click", () => {
  alert("Aquí pondremos el enlace de descarga Android.");
});

document.getElementById("btnAppStore").addEventListener("click", () => {
  alert("Aquí pondremos el enlace de App Store.");
});

document.getElementById("btnMas").addEventListener("click", () => {
  alert("Aquí después abrimos más categorías.");
});

document.getElementById("btnGrid").addEventListener("click", () => {
  alert("Aquí después abrimos el menú de categorías.");
});
