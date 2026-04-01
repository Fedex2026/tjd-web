import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
apiKey: "AIzaSyAOsC1fEJdzrK0MXhfC5BP7S1A8A0-pq6k",
authDomain: "tarjeterotjd.firebaseapp.com",
projectId: "tarjeterotjd",
storageBucket: "tarjeterotjd.firebasestorage.app",
messagingSenderId: "528216617303",
appId: "1:528216617303:web:c96fd8e8e4003339c38e12"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const container = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");


let negocios = [];


async function cargarNegocios(){

const querySnapshot = await getDocs(collection(db,"cards"));

negocios = [];

querySnapshot.forEach(doc => {
negocios.push({
id: doc.id,
...doc.data()
});
});

renderNegocios(negocios);

}


function renderNegocios(lista){

container.innerHTML = "";

lista.forEach(data => {

const card = document.createElement("div");

card.className = "business-card";

card.innerHTML = `

<div class="card">

<div class="card-logo">
${data.logo ? <img src="${data.logo}" /> : "TJD"}
</div>

<div class="card-info">

<h3>
${data.businessName || data.nombre || "Negocio"}
</h3>

<p>
${data.address || data.direccion || ""}
</p>

<p>
${data.phone || data.telefono || ""}
</p>

</div>

</div>

`;

container.appendChild(card);

});

}



searchInput.addEventListener("keyup", ()=>{

const texto = searchInput.value.toLowerCase();

const filtrados = negocios.filter(n =>

(n.businessName || "").toLowerCase().includes(texto) ||
(n.nombre || "").toLowerCase().includes(texto) ||
(n.categoria || "").toLowerCase().includes(texto)

);

renderNegocios(filtrados);

});


cargarNegocios();
