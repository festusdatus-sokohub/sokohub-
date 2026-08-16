// ======================================================
// SOKOHUB - MAIN SCRIPT
// Firebase Version
// ======================================================


// ======================================================
// START BUTTON
// ======================================================

const startBtn = document.getElementById("startBtn");

if (startBtn) {

    startBtn.addEventListener("click", function () {

        window.location.href = "login.html";

    });

}


// ======================================================
// FIREBASE IMPORT HELPER
// ======================================================

async function getFirebase() {

    const firebase = await import("./firebase.js");

    const firestore = await import(
        "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
    );

    const authModule = await import(
        "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
    );

    return {

        db: firebase.db,
        auth: firebase.auth,

        collection: firestore.collection,
        addDoc: firestore.addDoc,
        getDocs: firestore.getDocs,
        getDoc: firestore.getDoc,
        doc: firestore.doc,
        updateDoc: firestore.updateDoc,
        deleteDoc: firestore.deleteDoc,
        query: firestore.query,
        where: firestore.where,
        serverTimestamp: firestore.serverTimestamp,

        onAuthStateChanged:
            authModule.onAuthStateChanged

    };

}


// ======================================================
// GLOBAL PRODUCTS
// ======================================================

let allProducts = [];


// ======================================================
// SAVE PRODUCT
// ======================================================

async function saveProduct() {

    try {

        const {
            db,
            auth,
            collection,
            addDoc,
            serverTimestamp
        } = await getFirebase();


        const inputs =
            document.querySelectorAll("input");


        const name =
            inputs[0]?.value.trim();

        const price =
            Number(inputs[1]?.value);

        const quantity =
            Number(inputs[2]?.value);

        const location =
            inputs[3]?.value.trim();


        const select =
            document.querySelector("select");


        const category =
            select?.value;


        // --------------------------
        // CHECK LOGIN
        // --------------------------

        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "Tafadhali login kwanza kabla ya kuongeza bidhaa."
            );

            return;

        }


        // --------------------------
        // VALIDATION
        // --------------------------

        if (
            !name ||
            !price ||
            !quantity ||
            !location ||
            !category ||
            category === "Aina ya bidhaa"
        ) {

            alert(
                "Jaza taarifa zote za bidhaa."
            );

            return;

        }


        // --------------------------
        // SAVE FIRESTORE
        // --------------------------

        await addDoc(
            collection(db, "products"),
            {

                name: name,

                price: price,

                quantity: quantity,

                location: location,

                category:
                    category.toLowerCase(),

                sellerId: user.uid,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Bidhaa imehifadhiwa Firebase! ✅"
        );


        // --------------------------
        // CLEAR FORM
        // --------------------------

        inputs.forEach(function (input) {

            input.value = "";

        });


        if (select) {

            select.selectedIndex = 0;

        }


    } catch (error) {

        console.error(error);

        alert(
            "Bidhaa haijahifadhiwa: " +
            error.message
        );

    }

}


window.saveProduct = saveProduct;


// ======================================================
// LOAD PRODUCTS FROM FIRESTORE
// ======================================================

async function loadProducts() {

    const list =
        document.getElementById("productList");


    if (!list) {

        return;

    }


    try {

        const {
            db,
            collection,
            getDocs
        } = await getFirebase();


        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        allProducts = [];


        snapshot.forEach(function (docSnap) {

            allProducts.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        displayProducts();


    } catch (error) {

        console.error(error);


        list.innerHTML = `

            <p>
                ❌ Bidhaa hazijaweza kupakiwa.
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


// ======================================================
// DISPLAY PRODUCTS
// ======================================================

function displayProducts() {

    const list =
        document.getElementById("productList");


    if (!list) {

        return;

    }


    list.innerHTML = "";


    if (allProducts.length === 0) {

        list.innerHTML =
            "<p>Hakuna bidhaa kwa sasa.</p>";

        return;

    }


    allProducts.forEach(function (product) {

        const price =
            Number(product.price) || 0;

        const quantity =
            Number(product.quantity) || 0;


        list.innerHTML += `

            <div class="product">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    💰 Bei:
                    TZS ${price.toLocaleString()}
                </p>

                <p>
                    📦 Stock:
                    ${quantity}
                </p>

                <p>
                    📍 ${product.location || ""}
                </p>

                <p>
                    🏷️ ${product.category || ""}
                </p>


                <<button onclick="addToCart(
    '${product.name}',
    '${product.price}',
    '${product.quantity}',
    '${product.sellerId}'
)">
    Nunua
</button>

            </div>

        `;

    });

}


// ======================================================
// START PRODUCTS
// ======================================================

loadProducts();


// ======================================================
// ADD TO CART
// ======================================================

function addToCartfunction addToCart(name, price, quantity, sellerId) {

    let cart =
        JSON.parse(localStorage.getItem("sokohubCart")) || [];

    cart.push({

        name: name,

        price: Number(price),

        quantity: Number(quantity) || 1,

        sellerId: sellerId

    });

    localStorage.setItem(
        "sokohubCart",
        JSON.stringify(cart)
    );

    alert("Bidhaa imeongezwa kwenye kikapu ✅");

    const product =
        allProducts.find(function (item) {

            return item.id === productId;

        });


    if (!product) {

        alert(
            "Bidhaa haijapatikana."
        );

        return;

    }


    const stock =
        Number(product.quantity) || 0;


    if (stock <= 0) {

        alert(
            "Samahani, bidhaa hii imekwisha."
        );

        return;

    }


    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    const existing =
        cart.find(function (item) {

            return item.id === productId;

        });


    if (existing) {

        if (
            existing.quantity >= stock
        ) {

            alert(
                "Umefikia kiwango cha stock kilichopo."
            );

            return;

        }


        existing.quantity++;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price),

            quantity: 1,

            sellerId:
                product.sellerId || "",

            location:
                product.location || "",

            category:
                product.category || ""

        });

    }


    localStorage.setItem(
        "sokohubCart",
        JSON.stringify(cart)
    );


    alert(
        product.name +
        " imeongezwa kwenye cart! 🛒"
    );

}


window.addToCart = addToCart;


// ======================================================
// DISPLAY CART
// ======================================================

function displayCart() {

    const cartBox =
        document.getElementById("cartItems");


    if (!cartBox) {

        return;

    }


    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    cartBox.innerHTML = "";


    let total = 0;


    if (cart.length === 0) {

        cartBox.innerHTML =
            "<p>🛒 Cart yako iko tupu.</p>";


        const totalElement =
            document.getElementById("total");


        if (totalElement) {

            totalElement.innerHTML =
                "Jumla: TZS 0";

        }

        return;

    }


    cart.forEach(function (item, index) {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const subtotal =
            price * quantity;


        total += subtotal;


        cartBox.innerHTML += `

            <div class="product">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    💰 TSh
                    ${price.toLocaleString()}
                </p>

                <p>
                    Quantity:
                </p>

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>


                <strong
                    style="margin:0 15px;"
                >
                    ${quantity}
                </strong>


                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>


                <p>
                    Subtotal:
                    <strong>
                        TSh
                        ${subtotal.toLocaleString()}
                    </strong>
                </p>


                <button
                    onclick="removeItem(${index})"
                >
                    🗑️ Ondoa
                </button>

                <hr>

            </div>

        `;

    });


    const totalElement =
        document.getElementById("total");


    if (totalElement) {

        totalElement.innerHTML =
            "Jumla: TZS " +
            total.toLocaleString();

    }

}


displayCart();


// ======================================================
// INCREASE QUANTITY
// ======================================================

function increaseQuantity(index) {

    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    if (!cart[index]) {

        return;

    }


    cart[index].quantity++;


    localStorage.setItem(
        "sokohubCart",
        JSON.stringify(cart)
    );


    displayCart();

}


window.increaseQuantity =
    increaseQuantity;


// ======================================================
// DECREASE QUANTITY
// ======================================================

function decreaseQuantity(index) {

    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    if (!cart[index]) {

        return;

    }


    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    localStorage.setItem(
        "sokohubCart",
        JSON.stringify(cart)
    );


    displayCart();

}


window.decreaseQuantity =
    decreaseQuantity;


// ======================================================
// REMOVE CART ITEM
// ======================================================

function removeItem(index) {

    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    cart.splice(index, 1);


    localStorage.setItem(
        "sokohubCart",
        JSON.stringify(cart)
    );


    displayCart();

}


window.removeItem =
    removeItem;


// ======================================================
// CHECKOUT
// ======================================================

function checkout() {

    let cart =
        JSON.parse(
            localStorage.getItem("sokohubCart")
        ) || [];


    if (cart.length === 0) {

        alert(
            "Kikapu hakina bidhaa."
        );

        return;

    }


    window.location.href =
        "checkout.html";

}


window.checkout = checkout;


// ======================================================
// SELLER ORDERS
// ======================================================

async function sellerOrders() {

    const box =
        document.getElementById("sellerOrders");


    if (!box) {

        return;

    }


    box.innerHTML =
        "<p>Inapakia oda... ⏳</p>";


    try {

        const {
            auth,
            db,
            collection,
            getDocs
        } = await getFirebase();


        const user =
            auth.currentUser;


        if (!user) {

            box.innerHTML =
                "<p>Tafadhali login kwanza.</p>";

            return;

        }


        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        box.innerHTML = "";


        let foundOrders = 0;


        snapshot.forEach(function (docSnap) {

            const order =
                docSnap.data();


            if (!order.items) {

                return;

            }


            // Angalia kama kuna bidhaa
            // ya seller huyu

            const sellerItems =
                order.items.filter(function (item) {

                    return (
                        item.sellerId === user.uid
                    );

                });


            if (
                sellerItems.length === 0
            ) {

                return;

            }


            foundOrders++;


            let itemsHTML = "";


            sellerItems.forEach(function (item) {

                const subtotal =
                    Number(item.price) *
                    Number(item.quantity);


                itemsHTML += `

                    <p>
                        🛒 ${item.name}
                        × ${item.quantity}
                    </p>

                    <p>
                        TSh
                        ${subtotal.toLocaleString()}
                    </p>

                `;

            });


            box.innerHTML += `

                <div class="product">

                    <h3>
                        📦 Oda #${docSnap.id}
                    </h3>

                    ${itemsHTML}

                    <hr>

                    <p>
                        📍
                        ${order.deliveryLocation || ""}
                    </p>

                    <p>
                        📞
                        ${order.phone || ""}
                    </p>

                    <p>
                        💳
                        ${order.paymentMethod || ""}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${order.status || "pending"}
                        </strong>
                    </p>


                    ${
                        order.status === "pending"

                        ?

                        `

                        <button
                            onclick="acceptOrder('${docSnap.id}')"
                        >
                            ✅ Kubali Oda
                        </button>


                        <button
                            onclick="rejectOrder('${docSnap.id}')"
                        >
                            ❌ Kataa Oda
                        </button>

                        `

                        :

                        ""

                    }

                </div>

            `;

        });


        if (foundOrders === 0) {

            box.innerHTML =
                "<p>Hakuna oda mpya za bidhaa zako.</p>";

        }


    } catch (error) {

        console.error(error);


        box.innerHTML = `

            <p>
                ❌ Oda hazijapakiwa.
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


// ======================================================
// ACCEPT ORDER
// ======================================================

async function acceptOrder(orderId) {

    try {

        const {
            db,
            doc,
            updateDoc
        } = await getFirebase();


        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                status: "confirmed"

            }

        );


        alert(
            "Oda imekubaliwa! ✅"
        );


        location.reload();


    } catch (error) {

        console.error(error);


        alert(
            "Oda haijakubaliwa: " +
            error.message
        );

    }

}


window.acceptOrder =
    acceptOrder;


// ======================================================
// REJECT ORDER
// ======================================================

async function rejectOrder(orderId) {

    const confirmReject =
        confirm(
            "Una uhakika unataka kukataa oda hii?"
        );


    if (!confirmReject) {

        return;

    }


    try {

        const {
            db,
            doc,
            updateDoc
        } = await getFirebase();


        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                status: "rejected"

            }

        );


        alert(
            "Oda imekataliwa."
        );


        location.reload();


    } catch (error) {

        console.error(error);


        alert(
            "Oda haijakataliwa: " +
            error.message
        );

    }

}


window.rejectOrder =
    rejectOrder;


// ======================================================
// START SELLER ORDERS
// ======================================================

sellerOrders();


// ======================================================
// RIDER ORDERS
// ======================================================

async function riderOrders() {

    const box =
        document.getElementById("riderOrders");


    if (!box) {

        return;

    }


    box.innerHTML =
        "<p>Inapakia delivery... ⏳</p>";


    try {

        const {
            db,
            collection,
            getDocs
        } = await getFirebase();


        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        box.innerHTML = "";


        let found = 0;


        snapshot.forEach(function (docSnap) {

            const order =
                docSnap.data();


            if (
                order.status !==
                "confirmed"
            ) {

                return;

            }


            found++;


            box.innerHTML += `

                <div class="product">

                    <h3>
                        📦 Oda #${docSnap.id}
                    </h3>

                    <p>
                        📍
                        ${order.deliveryLocation || ""}
                    </p>

                    <p>
                        📞
                        ${order.phone || ""}
                    </p>

                    <p>
                        Status:
                        ${order.status}
                    </p>


                    <button
                        onclick="takeDelivery('${docSnap.id}')"
                    >
                        🚴 Chukua Oda
                    </button>

                </div>

            `;

        });


        if (found === 0) {

            box.innerHTML =
                "<p>Hakuna delivery tayari kwa sasa.</p>";

        }


    } catch (error) {

        console.error(error);


        box.innerHTML = `

            <p>
                ❌ Delivery hazijapakiwa.
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


riderOrders();


// ======================================================
// TAKE DELIVERY
// ======================================================

async function takeDelivery(orderId) {

    try {

        const {
            db,
            doc,
            updateDoc
        } = await getFirebase();


        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                status: "on_the_way"

            }

        );


        alert(
            "Delivery imeanza! 🚴"
        );


        location.reload();


    } catch (error) {

        console.error(error);


        alert(
            "Delivery haijaanza: " +
            error.message
        );

    }

}


window.takeDelivery =
    takeDelivery;


// ======================================================
// GET LOCATION
// ======================================================

function getLocation() {

    const output =
        document.getElementById("location");


    if (!output) {

        return;

    }


    if (
        navigator.geolocation
    ) {

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const userLocation = {

                    latitude:
                        latitude,

                    longitude:
                        longitude

                };


                localStorage.setItem(

                    "userLocation",

                    JSON.stringify(
                        userLocation
                    )

                );


                output.innerHTML =

                    "Latitude: " +
                    latitude +

                    "<br>" +

                    "Longitude: " +
                    longitude;

            },

            function (error) {

                output.innerHTML =
                    "Imeshindikana kupata location.";

                console.error(error);

            }

        );

    } else {

        output.innerHTML =
            "GPS haipatikani.";

    }

}


window.getLocation =
    getLocation;


// ======================================================
// LOAD MAP
// ======================================================

function loadMap() {

    const mapElement =
        document.getElementById("map");


    if (!mapElement) {

        return;

    }


    const locationData =

        JSON.parse(

            localStorage.getItem(
                "userLocation"
            )

        );


    if (!locationData) {

        return;

    }


    const lat =
        locationData.latitude;

    const lng =
        locationData.longitude;


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet haijapakiwa."
        );

        return;

    }


    const map =
        L.map("map").setView(
            [lat, lng],
            15
        );


    L.tileLayer(

        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(map);


    L.marker(
        [lat, lng]
    )
        .addTo(map)
        .bindPopup(
            "Upo hapa"
        )
        .openPopup();

}


loadMap();


// ======================================================
// TRACK ORDER
// ======================================================

async function trackOrder() {

    const box =
        document.getElementById(
            "trackingBox"
        );


    if (!box) {

        return;

    }


    box.innerHTML =
        "<p>Inapakia tracking... ⏳</p>";


    try {

        const {
            auth,
            db,
            collection,
            query,
            where,
            getDocs
        } = await getFirebase();


        const user =
            auth.currentUser;


        if (!user) {

            box.innerHTML =
                "<p>Tafadhali login kwanza.</p>";

            return;

        }


        const ordersQuery =
            query(

                collection(
                    db,
                    "orders"
                ),

                where(
                    "customerId",
                    "==",
                    user.uid
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        if (snapshot.empty) {

            box.innerHTML =
                "<p>Hakuna oda ya kufuatilia.</p>";

            return;

        }


        // Oda ya mwisho

        let latestOrder = null;


        snapshot.forEach(function (docSnap) {

            latestOrder = {

                id: docSnap.id,

                ...docSnap.data()

            };

        });


        const status =
            latestOrder.status;


        box.innerHTML = `

            <h3>
                📦 Oda #${latestOrder.id}
            </h3>

            <p>
                Status:
                <strong>
                    ${status}
                </strong>
            </p>

            <hr>

            <p>
                🟡 Imepokelewa
            </p>

            <p>
                ${
                    status === "confirmed" ||
                    status === "on_the_way" ||
                    status === "delivered"

                    ? "🟢"

                    : "⚪"
                }

                Inaandaliwa
            </p>

            <p>
                ${
                    status === "on_the_way" ||
                    status === "delivered"

                    ? "🟢"

                    : "⚪"
                }

                🚴 Inapelekwa
            </p>

            <p>
                ${
                    status === "delivered"

                    ? "🟢"

                    : "⚪"
                }

                Imewasilishwa
            </p>

        `;


    } catch (error) {

        console.error(error);


        box.innerHTML = `

            <p>
                ❌ Tracking haijapatikana.
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


trackOrder();


// ======================================================
// LOGOUT
// ======================================================

async function logoutUser() {

    try {

        const {
            auth
        } = await getFirebase();


        const {
            signOut
        } = await import(
            "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
        );


        await signOut(auth);


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(error);


        alert(
            "Imeshindikana kutoka: " +
            error.message
        );

    }

}


window.logoutUser =
    logoutUser;