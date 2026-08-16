import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    collection,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ======================================================
// RIDER DASHBOARD
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Tafadhali login kwanza.");

        window.location.href = "login.html";

        return;
    }

    console.log("Rider UID:", user.uid);

    await loadRiderProfile(user.uid);

    await loadRiderOrders(user.uid);

});


// ======================================================
// RIDER PROFILE
// ======================================================

async function loadRiderProfile(uid) {

    try {

        const userRef = doc(db, "users", uid);

        const userDoc = await getDoc(userRef);


        if (!userDoc.exists()) {

            document.getElementById("riderName").textContent =
                "Haijulikani";

            document.getElementById("riderPhone").textContent =
                "Haijulikani";

            return;
        }


        const data = userDoc.data();


        // CHECK ROLE

        if (data.role !== "rider") {

            alert("Akaunti hii si ya Rider.");

            console.log("Role iliyopo:", data.role);

            return;
        }


        document.getElementById("riderName").textContent =
            data.fullName || "Haijulikani";


        document.getElementById("riderPhone").textContent =
            data.phone || "Haijulikani";


    } catch (error) {

        console.error(
            "Rider profile error:",
            error
        );

    }

}


// ======================================================
// LOAD RIDER ORDERS
// ======================================================

async function loadRiderOrders(uid) {

    const availableBox =
        document.getElementById("riderOrders");

    const myDeliveryBox =
        document.getElementById("myDeliveryOrders");

    const availableCount =
        document.getElementById("availableOrders");

    const myDeliveryCount =
        document.getElementById("myDeliveries");


    if (!availableBox || !myDeliveryBox) {

        console.error(
            "Rider order containers hazipatikani."
        );

        return;
    }


    try {

        // ==============================================
        // PATA ODA ZOTE
        // ==============================================

        const snapshot = await getDocs(
            collection(db, "orders")
        );


        availableBox.innerHTML = "";

        myDeliveryBox.innerHTML = "";


        let available = 0;

        let myDeliveries = 0;


        // ==============================================
        // PITIA ODA ZOTE
        // ==============================================

        snapshot.forEach((orderDoc) => {

            const order = orderDoc.data();

            const orderId = orderDoc.id;


            // ==========================================
            // ODA ILIYOTHIBITISHWA NA SELLER
            // ==========================================

            if (
                order.status === "confirmed" &&
                !order.riderId
            ) {

                available++;


                let itemsHTML = "";


                if (Array.isArray(order.items)) {

                    order.items.forEach((item) => {

                        itemsHTML += `

                            <p>
                                🛒 ${item.name || "Bidhaa"}
                                × ${item.quantity || 0}
                            </p>

                        `;

                    });

                }


                availableBox.innerHTML += `

                    <div class="product">

                        <h3>
                            📦 Oda #${orderId}
                        </h3>

                        ${itemsHTML}

                        <p>
                            💰 Jumla:
                            TZS ${Number(
                                order.total || 0
                            ).toLocaleString()}
                        </p>

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
                            🟢 Status:
                            <strong>
                                ${order.status}
                            </strong>
                        </p>


                        <button
                            onclick="takeOrder('${orderId}')"
                        >
                            🚴 Chukua Oda
                        </button>

                    </div>

                `;

            }


            // ==========================================
            // ODA AMBAZO RIDER HUYU AMEZICHUKUA
            // ==========================================

            if (
                order.riderId === uid &&
                (
                    order.status === "picked_up" ||
                    order.status === "on_the_way"
                )
            ) {

                myDeliveries++;


                let itemsHTML = "";


                if (Array.isArray(order.items)) {

                    order.items.forEach((item) => {

                        itemsHTML += `

                            <p>
                                🛒 ${item.name || "Bidhaa"}
                                × ${item.quantity || 0}
                            </p>

                        `;

                    });

                }


                // ======================================
                // BUTTON KULINGANA NA STATUS
                // ======================================

                let actionButton = "";


                if (order.status === "picked_up") {

                    actionButton = `

                        <button
                            onclick="startDelivery('${orderId}')"
                        >
                            🚴 Anza Delivery
                        </button>

                    `;

                }


                if (order.status === "on_the_way") {

                    actionButton = `

                        <button
                            onclick="completeDelivery('${orderId}')"
                        >
                            ✅ Imewasilishwa
                        </button>

                    `;

                }


                myDeliveryBox.innerHTML += `

                    <div class="product">

                        <h3>
                            📦 Oda #${orderId}
                        </h3>

                        ${itemsHTML}

                        <p>
                            💰 Jumla:
                            TZS ${Number(
                                order.total || 0
                            ).toLocaleString()}
                        </p>

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
                            <strong>
                                ${order.status}
                            </strong>
                        </p>

                        ${actionButton}

                    </div>

                `;

            }

        });


        // ==============================================
        // UPDATE COUNTS
        // ==============================================

        if (availableCount) {

            availableCount.textContent =
                available;

        }


        if (myDeliveryCount) {

            myDeliveryCount.textContent =
                myDeliveries;

        }


        // ==============================================
        // HAKUNA ODA MPYA
        // ==============================================

        if (available === 0) {

            availableBox.innerHTML = `

                <p>
                    Hakuna oda mpya kwa sasa. 📭
                </p>

            `;

        }


        // ==============================================
        // HAKUNA DELIVERY
        // ==============================================

        if (myDeliveries === 0) {

            myDeliveryBox.innerHTML = `

                <p>
                    Huna delivery inayoendelea.
                </p>

            `;

        }


    } catch (error) {

        console.error(
            "Load rider orders error:",
            error
        );


        availableBox.innerHTML = `

            <p>
                ❌ Oda hazijapakiwa.
            </p>

            <p>
                ${error.message}
            </p>

        `;


        myDeliveryBox.innerHTML = `

            <p>
                ❌ Delivery haijapakiwa.
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


// ======================================================
// CHUKUA ODA
// ======================================================

async function takeOrder(orderId) {

    const user = auth.currentUser;


    if (!user) {

        alert(
            "Tafadhali login kwanza."
        );

        return;

    }


    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        // ==========================================
        // HAKIKISHA ODA BADO AVAILABLE
        // ==========================================

        const orderDoc =
            await getDoc(orderRef);


        if (!orderDoc.exists()) {

            alert(
                "Oda hii haipo."
            );

            return;

        }


        const order =
            orderDoc.data();


        if (order.status !== "confirmed") {

            alert(
                "Oda hii tayari imechukuliwa au imebadilishwa."
            );

            location.reload();

            return;

        }


        if (order.riderId) {

            alert(
                "Oda hii tayari imepewa Rider mwingine."
            );

            location.reload();

            return;

        }


        // ==========================================
        // MPA RIDER ODA
        // ==========================================

        await updateDoc(

            orderRef,

            {

                riderId: user.uid,

                status: "picked_up"

            }

        );


        alert(
            "Oda imechukuliwa na Rider! 🚴"
        );


        location.reload();


    } catch (error) {

        console.error(
            "Take order error:",
            error
        );


        alert(
            "Oda haijachukuliwa: " +
            error.message
        );

    }

}


window.takeOrder =
    takeOrder;


// ======================================================
// ANZA DELIVERY
// ======================================================

async function startDelivery(orderId) {

    const user = auth.currentUser;


    if (!user) {

        alert(
            "Tafadhali login kwanza."
        );

        return;

    }


    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        const orderDoc =
            await getDoc(orderRef);


        if (!orderDoc.exists()) {

            alert(
                "Oda haipo."
            );

            return;

        }


        const order =
            orderDoc.data();


        // ==========================================
        // HAKIKI RIDER
        // ==========================================

        if (order.riderId !== user.uid) {

            alert(
                "Oda hii siyo yako."
            );

            return;

        }


        if (order.status !== "picked_up") {

            alert(
                "Oda haipo kwenye hatua ya picked_up."
            );

            return;

        }


        // ==========================================
        // BADILI STATUS
        // ==========================================

        await updateDoc(

            orderRef,

            {

                status: "on_the_way"

            }

        );


        alert(
            "Delivery imeanza! 🚴‍♂️"
        );


        location.reload();


    } catch (error) {

        console.error(
            "Start delivery error:",
            error
        );


        alert(
            "Imeshindikana kuanza delivery: " +
            error.message
        );

    }

}


window.startDelivery =
    startDelivery;


// ======================================================
// DELIVERY IMEWASILISHWA
// ======================================================

async function completeDelivery(orderId) {

    const user = auth.currentUser;


    if (!user) {

        alert(
            "Tafadhali login kwanza."
        );

        return;

    }


    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        const orderDoc =
            await getDoc(orderRef);


        if (!orderDoc.exists()) {

            alert(
                "Oda haipo."
            );

            return;

        }


        const order =
            orderDoc.data();


        // ==========================================
        // HAKIKI RIDER
        // ==========================================

        if (order.riderId !== user.uid) {

            alert(
                "Oda hii siyo yako."
            );

            return;

        }


        if (order.status !== "on_the_way") {

            alert(
                "Anza delivery kwanza."
            );

            return;

        }


        // ==========================================
        // MALIZA DELIVERY
        // ==========================================

        await updateDoc(

            orderRef,

            {

                status: "delivered"

            }

        );


        alert(
            "Oda imewasilishwa kikamilifu! ✅"
        );


        location.reload();


    } catch (error) {

        console.error(
            "Complete delivery error:",
            error
        );


        alert(
            "Imeshindikana kukamilisha oda: " +
            error.message
        );

    }

}


window.completeDelivery =
    completeDelivery;