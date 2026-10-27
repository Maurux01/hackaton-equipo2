const productos = [
  {
    id: 1,
    nombre: "FUGU – Pez globo",
    descripcion:
      "El fugu contiene una toxina letal en algunos de sus órganos (hígado, ovarios…), y si no se le extraen estas partes con sumo cuidado, la persona que lo ingiere puede morir",
    precio: 90000,
    imagen:
      "https://www.muyjapones.com/wp-content/uploads/2023/02/Fugu-en-sashimi.jpg",
  },
  {
    id: 2,
    nombre: "BASASHI",
    descripcion:
      "Es el sashimi de carne de caballo. Se sirve muy frío y dependiendo de su maduración, su color oscila de rosa a rojo oscuro.",
    precio: 55000,
    imagen:
      "https://www.muyjapones.com/wp-content/uploads/2023/01/BASASHI-2.jpg",
  },
  {
    id: 3,
    nombre: "TOFUYO",
    descripcion:
      "Es un tofu fermentado que se prepara añadiéndole dos tipos de koji y awamori (bebida alcohólica típica de Okinawa)",
    precio: 60000,
    imagen: "https://www.muyjapones.com/wp-content/uploads/2023/02/Tofuyo.jpg",
  },
  {
    id: 4,
    nombre: "INAGO NO TSUKUDANI",
    descripcion:
      "Es un plato que se prepara con saltamontes, que se cocinan a fuego lento con salsa de soja y mirin. ",
    precio: 30000,
    imagen:
      "https://www.muyjapones.com/wp-content/uploads/2023/02/INAGO-NO-TSUKUDANI-2.jpg",
  },
];
//localStorage
const CLAVE_CARRITO = "platos_carrito";
const CLAVE_FAVORITOS = "platos_favorito"



// Espera a que el DOM esté listo antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector("#menu");
  const carritoLista = document.querySelector("#carrito ul");
  let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
  let favoritos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];
  let vistaActual = "todo";


  const contadorFavs = document.querySelector("#contador-favoritos");
  if (contadorFavs) {
    contadorFavs.textContent = favoritos.length;
  }

  function formatearPrecio(precio) {
    return "$" + precio.toLocaleString("es-CO");
  }

  // Funciones de localStorage
  function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  }

  function guardarFavoritos() {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  }

  function mostrarCarta() {
    let html = "";
    for (const producto of productos) {
      if (vistaActual === "favoritos" && !favoritos.includes(producto.id)) {
        continue;
      }
      const esFavorito = favoritos.includes(producto.id);
      html += `
              <li class="producto">
                  <h3>${producto.nombre}</h3>
                  <div class="imagen-producto"><img src="${producto.imagen}"></div>
                  <p>${producto.descripcion}</p>
                  <span class="precio">${formatearPrecio(producto.precio)}</span>
                  <div class="acciones">
                    <button class="btn-agregar" data-id="${producto.id}"> Agregar</button>
                    <button class="btn-favorito" data-id="${producto.id}" aria-label="${esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}">
                      ${esFavorito ? "♥️" : "♡"}
                    </button>
                  </div>
              </li>`;
    }
    if (html === "" && vistaActual === "favoritos") {
      html = `<li class="vacio text-white fs-3 py-4 text-center w-100">No tienes productos favoritos todavía.</li>`;
    }
    menu.innerHTML = html;
  }

  function agregarAlCarrito(id) {
    const existe = carrito.find((item) => item.id === id);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ id, cantidad: 1 });
    }
    guardarCarrito();
    renderizarCarrito();
  }

  function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index === -1) {
      favoritos.push(id);
    } else {
      favoritos.splice(index, 1);
    }
    guardarFavoritos();
    if (contadorFavs) {
      contadorFavs.textContent = favoritos.length;
    }
    mostrarCarta();
  }

  // Delegación de eventos: un solo listener en el contenedor #menu
  menu.addEventListener("click", (e) => {
    const btnAgregar = e.target.closest(".btn-agregar");
    if (btnAgregar) {
      const id = parseInt(btnAgregar.dataset.id);
      agregarAlCarrito(id);
      return;
    }

    const btnFavorito = e.target.closest(".btn-favorito");
    if (btnFavorito) {
      const id = parseInt(btnFavorito.dataset.id);
      toggleFavorito(id);
      return;
    }
  });

  // Botones de vista: toda la carta / favoritos
  document.querySelector("#ver-todo").addEventListener("click", () => {
    vistaActual = "todo";
    document.querySelector("#ver-todo").classList.add("activa");
    document.querySelector("#ver-favoritos").classList.remove("activa");
    mostrarCarta();
  });

  document.querySelector("#ver-favoritos").addEventListener("click", () => {
    vistaActual = "favoritos";
    document.querySelector("#ver-favoritos").classList.add("activa");
    document.querySelector("#ver-todo").classList.remove("activa");
    mostrarCarta();
  });

  function quitarDelCarrito(id) {
    const existe = carrito.find((item) => item.id === id);
    if (!existe) return;

    if (existe.cantidad > 1) {
      existe.cantidad--;
    } else {
      carrito = carrito.filter((item) => item.id !== id);
    }
    guardarCarrito();
    renderizarCarrito();
  }

  function renderizarCarrito() {
    carritoLista.innerHTML = "";

    for (const item of carrito) {
      const producto = productos.find((p) => p.id === item.id);
      if (!producto) continue;

      const li = document.createElement("li");
      const subtotal = producto.precio * item.cantidad;
      li.innerHTML = `
              <span>${producto.nombre} - ${formatearPrecio(producto.precio)} x ${item.cantidad} = ${formatearPrecio(subtotal)}</span>
              <button class="btn-quitar" data-id="${item.id}">Quitar</button>
          `;
      carritoLista.appendChild(li);
    }

    const total = carrito.reduce((acc, item) => {
      const producto = productos.find((p) => p.id === item.id);
      return acc + (producto ? producto.precio * item.cantidad : 0);
    }, 0);

    const totalLi = document.createElement("li");
    totalLi.style.fontWeight = "bold";
    totalLi.textContent = `Total: ${formatearPrecio(total)}`;
    carritoLista.appendChild(totalLi);
  }

  // Delegación de eventos en el carrito para quitar ítems
  carritoLista.addEventListener("click", (e) => {
    const btnQuitar = e.target.closest(".btn-quitar");
    if (btnQuitar) {
      const id = parseInt(btnQuitar.dataset.id);
      quitarDelCarrito(id);
    }
  });

  // Inicializar: mostrar la carta y el carrito al cargar la página
  mostrarCarta();
  renderizarCarrito();
});



