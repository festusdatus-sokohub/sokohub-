import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ===============================
// AUTO LOGIN / CHECK USER
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (user) {

        console.log("User tayari ame-login:", user.email);

        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        if (userDoc.exists()) {

            const userData = userDoc.data();

            console.log("Role:", userData.role);

        }

    } else {

        console.log("Hakuna user aliye-login.");

    }

});


// ===============================
// LOGOUT
// ===============================

async function logoutUser() {

    try {

        await signOut(auth);

        alert("Umetoka kwenye account.");

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        alert("Logout imeshindikana: " + error.message);

    }

}

window.logoutUser = logoutUser;