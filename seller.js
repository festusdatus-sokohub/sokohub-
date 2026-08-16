import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ======================================================
// SELLER DASHBOARD
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await loadSellerProfile(user.uid);
    await loadSellerProducts(user.uid);
    await loadSellerOrders(user.uid);

});


// ======================================================
// SELLER PROFILE
// ======================================================

async function loadSellerProfile(uid) {

    try {

        const userDoc = await getDoc(
            doc(db, "users", uid)
        );

        if (!userDoc.exists()) {

            document.getElementById("sellerName").textContent =
                "Haijulikani";

            document.getElementById("sellerPhone").textContent =
                "Haijulikani";

            return;
        }

        const userData = userDoc.data();

        document.getElementById("sellerName").textContent =
            userData.fullName || "Haijulikani";

        document.getElementById("sellerPhone").textContent =
            userData.phone || "Haijulikani";

    } catch (error) {

        console.error("Profile error:", error);

    }

}


// ======================================================
// LOAD SELLER PRODUCTS
// ======================================================

async function loadSellerProducts(uid) {

    const box =
        document.getElementById("sellerProducts");

    const count =
        document.getElementById("productCount");

    if (!box) return;

    box.innerHTML =
        "<p>Inapakia bidhaa... ⏳</p>";

    try {

        const productsQuery = query(
            collection(db, "products"),
            where("sellerId", "==", uid)
        );

        const snapshot =
            await getDocs(productsQuery);

        box.innerHTML = "";

        count.textContent =
            snapshot.size;


        if (snapshot.empty) {

            box.innerHTML = `
                <p>Hujawa na bidhaa yoyote.</p>

                <button onclick="location.href='add-product.html'">
                    ➕ Ongeza Bidhaa
                </button>
            `;

            return;
        }


        snapshot.forEach((productDoc) => {

            const product =
                productDoc.data();

            const price =
                Number(product.price) || 0;

            const quantity =
                Number(product.quantity) || 0;


            box.innerHTML += `

                <div class="product">

                    <h3>${product.name}</h3>

                    <p>
                        💰 Bei:
                        TZS ${price.toLocaleString()}
                    </p>

                    <p>
                        📦 Stock:
                        ${quantity}
                    </p>

                    <p>
                        🏷️ Category:
                        ${product.category || ""}
                    </p>

                    <p>
                        📍 ${product.location || ""}
                    </p>

                </div>

            `;

        });


    } catch (error) {

        console.error(error);

        box.innerHTML = `

            <p>❌ Bidhaa hazijapakiwa.</p>

            <p>${error.message}</p>

        `;

    }

}


// ======================================================
// LOAD SELLER ORDERS
// ======================================================

async function loadSellerOrders(uid) {

    const box =
        document.getElementById("sellerOrders");

    const count =
        document.getElementById("newOrders");

    const salesBox =
        document.getElementById("totalSales");


    if (!box) return;


    box.innerHTML =
        "<p>Inapakia oda... ⏳</p>";


    try {

        // TUNATAFUTA ODA ZA SELLER HUYU TU
        const ordersQuery = query(
            collection(db, "orders"),
            where("sellerId", "==", uid)
        );


        const snapshot =
            await getDocs(ordersQuery);


        box.innerHTML = "";


        let sellerOrderCount = 0;

        let totalSales = 0;


        // HAKUNA ODA
        if (snapshot.empty) {

            count.textContent = "0";

            salesBox.textContent =
                "TZS 0";

            box.innerHTML = `
                <p>
                    📭 Hakuna oda mpya kwa sasa.
                </p>
            `;

            return;
        }


        // LOOP ORDERS
        snapshot.forEach((orderDoc) => {

            const order =
                orderDoc.data();


            sellerOrderCount++;


            const items =
                order.items || [];


            let itemsHTML = "";

            let sellerTotal = 0;


            // BIDHAA
            items.forEach((item) => {

                const quantity =
                    Number(item.quantity) || 1;

                const price =
                    Number(item.price) || 0;

                const subtotal =
                    price * quantity;


                sellerTotal += subtotal;


                itemsHTML += `

                    <p>
                        🛒 ${item.name}
                        × ${quantity}
                    </p>

                    <p>
                        TSh ${subtotal.toLocaleString()}
                    </p>

                `;

            });


            totalSales += sellerTotal;


            const status =
                order.status || "pending";


            const riderInputId =
                `rider-${orderDoc.id}`;


            box.innerHTML += `

                <div class="product">

                    <h3>
                        📦 Oda #${orderDoc.id.substring(0, 8)}
                    </h3>


                    ${itemsHTML}


                    <hr>


                    <h3>
                        💰 Jumla:
                        TZS ${sellerTotal.toLocaleString()}
                    </h3>


                    <p>
                        📍 Delivery:
                        ${order.deliveryLocation || "Haijawekwa"}
                    </p>


                    <p>
                        📞 Simu:
                        ${order.phone || "Haijawekwa"}
                    </p>


                    <p>
                        💳 Malipo:
                        ${order.paymentMethod || "Haijawekwa"}
                    </p>


                    <p>
                        🟡 Status:
                        <strong>${status}</strong>
                    </p>


                    <p>
                        🚴 Rider ID:
                        <strong>
                            ${order.riderId || "Haijawekwa"}
                        </strong>
                    </p>


                    <input
                        type="text"
                        id="${riderInputId}"
                        placeholder="Weka Rider UID"
                        value="${order.riderId || ""}"
                    >


                    <br><br>


                    <button
                        onclick="assignRider('${orderDoc.id}')"
                    >
                        🚴 Mpa Rider
                    </button>


                    <button
                        onclick="acceptSellerOrder('${orderDoc.id}')"
                    >
                        ✅ Kubali Oda
                    </button>


                    <button
                        onclick="rejectSellerOrder('${orderDoc.id}')"
                    >
                        ❌ Kataa Oda
                    </button>

                </div>

                <br>

            `;

        });


        count.textContent =
            sellerOrderCount;


        salesBox.textContent =
            `TZS ${totalSales.toLocaleString()}`;


    } catch (error) {

        console.error(
            "SELLER ORDERS ERROR:",
            error
        );


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
// ASSIGN RIDER
// ======================================================

window.assignRider = async function(orderId) {

    const input =
        document.getElementById(
            `rider-${orderId}`
        );


    if (!input) {

        alert(
            "Rider UID haijapatikana."
        );

        return;
    }


    const riderId =
        input.value.trim();


    if (!riderId) {

        alert(
            "Weka Rider UID kwanza."
        );

        return;
    }


    try {

        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                riderId: riderId,

                status: "confirmed"

            }

        );


        alert(
            "Rider amepangiwa oda kikamilifu ✅"
        );


        location.reload();


    } catch (error) {

        console.error(error);

        alert(
            "Imeshindikana kumpa Rider oda: "
            + error.message
        );

    }

};


// ======================================================
// ACCEPT ORDER
// ======================================================

window.acceptSellerOrder =
async function(orderId) {

    try {

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
            "Oda haijakubaliwa: "
            + error.message
        );

    }

};


// ======================================================
// REJECT ORDER
// ======================================================

window.rejectSellerOrder =
async function(orderId) {

    const answer =
        confirm(
            "Una uhakika unataka kukataa oda hii?"
        );


    if (!answer) return;


    try {

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
            "Oda haijakataliwa: "
            + error.message
        );

    }

};