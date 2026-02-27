// WebComponent <inventory-app> - Control de inventario "Café Cueva"
class InventoryApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.products = []; // { name, category, stock }
        this.lowStockThreshold = 5; // Alerta si stock < 5
    }

    connectedCallback() {
        this.#render();
        this.#setupEventListeners();
    }

    #render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Comic Neue', 'Segoe UI', cursive;
                }
                .cave-card {
                    background: #fef7e9;
                    border-radius: 70px 70px 30px 30px;
                    padding: 2rem 2.5rem;
                    border: 5px solid #916e41;
                    box-shadow: 0 25px 0 #5d3e1f, 0 30px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                .cave-card::after {
                    content: "🪨🪨🪨";
                    position: absolute;
                    bottom: -5px;
                    left: 20px;
                    font-size: 2.2rem;
                    opacity: 0.3;
                    pointer-events: none;
                }
                h2 {
                    color: #482c14;
                    font-size: 2.2rem;
                    margin: 0 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    border-bottom: 4px dotted #bb8f5a;
                    padding-bottom: 0.5rem;
                }
                h2::before {
                    content: "☕";
                    font-size: 2.5rem;
                }
                .form-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr 0.8fr auto;
                    gap: 1rem;
                    align-items: end;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }
                .field label {
                    font-weight: bold;
                    color: #6d4b2b;
                    font-size: 1rem;
                    margin-left: 0.5rem;
                }
                input, select, button {
                    padding: 0.9rem 1.2rem;
                    border-radius: 50px;
                    border: 3px solid #cfa776;
                    font-size: 1rem;
                    background: #fffcf5;
                    transition: 0.2s;
                    font-family: inherit;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #d48d4b;
                    box-shadow: 0 0 0 5px #ffe7c4;
                }
                button {
                    background: #d48d4b;
                    color: white;
                    font-weight: bold;
                    border: none;
                    border-bottom: 6px solid #8b5a2e;
                    cursor: pointer;
                    transform: translateY(0);
                    font-size: 1.2rem;
                    padding: 0.9rem 2rem;
                    align-self: end;
                }
                button:hover {
                    background: #e5a25d;
                    border-bottom-width: 3px;
                    transform: translateY(3px);
                }
                button:active {
                    transform: translateY(6px);
                    border-bottom-width: 1px;
                }
                .alert-box {
                    background: #ffe3d6;
                    border-left: 15px solid #d9534f;
                    border-radius: 60px;
                    padding: 1rem 2rem;
                    margin: 2rem 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 8px 0 #b34e4a;
                }
                .alert-box span {
                    font-size: 2.5rem;
                }
                #lowStockList {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.8rem;
                }
                .low-stock-item {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 0.5rem 1.5rem;
                    border-radius: 40px;
                    font-weight: bold;
                    border: 2px solid #f5c6cb;
                }
                .inventory-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 2rem 0 1rem;
                }
                .inventory-title h3 {
                    font-size: 1.8rem;
                    color: #3a2a18;
                    margin: 0;
                }
                .total-badge {
                    background: #a9907a;
                    color: white;
                    padding: 0.3rem 1.2rem;
                    border-radius: 40px;
                    font-weight: bold;
                }
                #productList {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }
                .product-item {
                    background: #f7ede1;
                    border-radius: 100px;
                    padding: 0.8rem 1rem 0.8rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 3px solid #e0c5a7;
                    box-shadow: 0 5px 0 #aa855b;
                    transition: 0.15s;
                    animation: popIn 0.2s ease-out;
                }
                .product-item.low {
                    background: #ffd8d8;
                    border-color: #f0a0a0;
                    box-shadow: 0 5px 0 #b16d6d;
                }
                .product-item:hover {
                    transform: translateX(8px) translateY(-2px);
                    box-shadow: 0 8px 0 #aa855b;
                }
                .product-info {
                    display: flex;
                    gap: 2rem;
                    align-items: baseline;
                }
                .product-name {
                    font-weight: 700;
                    font-size: 1.3rem;
                    color: #362812;
                }
                .product-category {
                    background: #b8a387;
                    color: white;
                    padding: 0.2rem 1rem;
                    border-radius: 30px;
                    font-size: 0.9rem;
                }
                .product-stock {
                    font-weight: bold;
                    background: #dcd0c1;
                    padding: 0.3rem 1rem;
                    border-radius: 40px;
                }
                .delete-btn {
                    background: #d4b48b;
                    border: none;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #4f3a23;
                    cursor: pointer;
                    transition: 0.1s;
                    border-bottom: 4px solid #7b623e;
                }
                .delete-btn:hover {
                    background: #f3acac;
                    color: #a10000;
                    transform: rotate(90deg) scale(1.1);
                    border-bottom-color: #9e4c4c;
                }
                #message {
                    border-radius: 50px;
                    padding: 0.7rem 1.8rem;
                    margin: 1rem 0 0;
                    text-align: center;
                    font-weight: bold;
                    background: #eedbbc;
                    border: 2px solid #b0854b;
                }
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.8); }
                    80% { transform: scale(1.02); }
                    100% { opacity: 1; transform: scale(1); }
                }
            </style>
            <div class="cave-card">
                <h2>Registrar insumo</h2>
                <form id="inventory-form" class="form-group">
                    <div class="field">
                        <label>🧃 Producto</label>
                        <input type="text" id="product-name" placeholder="Ej: Café molido" required>
                    </div>
                    <div class="field">
                        <label>📦 Categoría</label>
                        <select id="product-category" required>
                            <option value="" disabled selected>— Elige —</option>
                            <option value="Café">☕ Café</option>
                            <option value="Leche">🥛 Leche</option>
                            <option value="Azúcar">🍬 Azúcar</option>
                            <option value="Otro">🍩 Otro</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>📊 Stock</label>
                        <input type="number" id="product-stock" placeholder="Cantidad" min="1" step="1" required>
                    </div>
                    <button type="submit">➕ Agregar</button>
                </form>

                <!-- Alerta de stock bajo -->
                <div class="alert-box" id="lowStockAlert">
                    <span>⚠️</span>
                    <div>
                        <strong style="font-size:1.3rem;">¡Stock bajo!</strong>
                        <ul id="lowStockList"></ul>
                    </div>
                </div>

                <!-- Lista de inventario -->
                <div class="inventory-title">
                    <h3>📋 Inventario actual</h3>
                    <span class="total-badge" id="totalCount">0 productos</span>
                </div>
                <ul id="productList"></ul>

                <div id="message"></div>
            </div>
        `;
    }

    #setupEventListeners() {
        const form = this.shadowRoot.getElementById('inventory-form');
        form.addEventListener('submit', this.#handleSubmit.bind(this));
    }

    #handleSubmit(e) {
        e.preventDefault();
        const nameInput = this.shadowRoot.getElementById('product-name');
        const categorySelect = this.shadowRoot.getElementById('product-category');
        const stockInput = this.shadowRoot.getElementById('product-stock');

        const name = nameInput.value.trim();
        const category = categorySelect.value;
        const stock = parseInt(stockInput.value, 10);

        // Validaciones
        if (!name) {
            this.#showMessage('❌ El nombre del producto es obligatorio', 'error');
            return;
        }
        if (!category) {
            this.#showMessage('❌ Debes seleccionar una categoría', 'error');
            return;
        }
        if (isNaN(stock) || stock <= 0) {
            this.#showMessage('❌ El stock debe ser un número positivo', 'error');
            return;
        }

        // Agregar producto
        this.products.push({ name, category, stock });
        this.#updateUI();
        this.#showMessage(`✅ ${name} agregado con stock ${stock}`, 'success');
        e.target.reset(); // limpia campos
    }

    #showMessage(text, type) {
        const msgDiv = this.shadowRoot.getElementById('message');
        msgDiv.textContent = text;
        msgDiv.style.background = type === 'error' ? '#f8d7da' : '#d4edda';
        msgDiv.style.color = type === 'error' ? '#721c24' : '#155724';
        msgDiv.style.borderColor = type === 'error' ? '#f5c6cb' : '#c3e6cb';
        setTimeout(() => {
            msgDiv.textContent = '';
            msgDiv.style.background = '';
            msgDiv.style.color = '';
        }, 2500);
    }

    #updateUI() {
        this.#updateProductList();
        this.#updateLowStockAlert();
        this.#updateTotalCount();
    }

    #updateProductList() {
        const list = this.shadowRoot.getElementById('productList');
        list.innerHTML = '';
        this.products.forEach((prod, index) => {
            const li = document.createElement('li');
            li.className = `product-item ${prod.stock < this.lowStockThreshold ? 'low' : ''}`;
            li.innerHTML = `
                <div class="product-info">
                    <span class="product-name">${prod.name}</span>
                    <span class="product-category">${prod.category}</span>
                    <span class="product-stock">📦 ${prod.stock}</span>
                </div>
                <button class="delete-btn" data-index="${index}" title="Eliminar">✕</button>
            `;
            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.#deleteProduct(index);
            });
            list.appendChild(li);
        });
    }

    #deleteProduct(index) {
        const removed = this.products[index];
        this.products.splice(index, 1);
        this.#updateUI();
        this.#showMessage(`🗑️ ${removed.name} eliminado del inventario`, 'success');
    }

    #updateLowStockAlert() {
        const lowStockItems = this.products.filter(p => p.stock < this.lowStockThreshold);
        const alertBox = this.shadowRoot.getElementById('lowStockAlert');
        const lowStockList = this.shadowRoot.getElementById('lowStockList');
        lowStockList.innerHTML = '';

        if (lowStockItems.length === 0) {
            alertBox.style.display = 'none';
            return;
        }
        alertBox.style.display = 'flex';
        lowStockItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'low-stock-item';
            li.textContent = `${item.name} (${item.stock})`;
            lowStockList.appendChild(li);
        });
    }

    #updateTotalCount() {
        const totalSpan = this.shadowRoot.getElementById('totalCount');
        totalSpan.textContent = `${this.products.length} productos`;
    }
}

// Registrar el WebComponent
customElements.define('inventory-app', InventoryApp);