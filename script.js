// Buscador simple

const input = document.querySelector(".search input")
const cards = document.querySelectorAll(".card")

input.addEventListener("keyup", function() {

const texto = input.value.toLowerCase()

cards.forEach(card => {

const contenido = card.innerText.toLowerCase()

if(contenido.includes(texto)) {
card.style.display = "flex"
} else {
card.style.display = "none"
}

})

})


// Botón Buscar por km (placeholder)

const botonKm = document.querySelector(".km")

botonKm.addEventListener("click", () => {
alert("Próximamente búsqueda por distancia")
})
