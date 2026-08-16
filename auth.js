// ==================================================
// SOKOHUB - AUTHENTICATION
// ==================================================

import {
    auth,
    db
} from "./firebase.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==================================================
// REGISTER USER
// ==================================================

async function registerUser() {

    try {

        // ------------------------------------------
        // GET FORM VALUES
        // ------------------------------------------

        const fullName =
            document
                .getElementById("fullName")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const role =
            document
                .getElementById("role")
                .value;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (
            !fullName ||
            !phone ||
            !email ||
            !password ||
            !role
        ) {

            alert(
                "⚠️ Tafadhali jaza taarifa zote."
            );

            return;
        }


        if (password.length < 6) {

            alert(
                "⚠️ Password lazima iwe na angalau characters 6."
            );

            return;
        }


        // ------------------------------------------
        // CREATE FIREBASE ACCOUNT
        // ------------------------------------------

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // ------------------------------------------
        // SAVE USER PROFILE
        // ------------------------------------------

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                fullName:
                    fullName,

                phone:
                    phone,

                email:
                    email,

                role:
                    role,

                uid:
                    user.uid

            }

        );


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        alert(
            "✅ Usajili umefanikiwa!"
        );


        // ------------------------------------------
        // REDIRECT
        // ------------------------------------------

        goToDashboard(role);


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        let message =
            error.message;


        // Firebase error messages
        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "Email hii tayari ina account.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email uliyoingiza si sahihi.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password ni dhaifu. Tumia angalau characters 6.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Hakuna internet au connection imekatika.";

        }


        alert(
            "❌ Usajili umeshindikana:\n\n" +
            message
        );

    }

}


// ==================================================
// LOGIN USER
// ==================================================

async function loginUser() {

    try {

        // ------------------------------------------
        // GET LOGIN VALUES
        // ------------------------------------------

        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!email || !password) {

            alert(
                "⚠️ Weka email na password."
            );

            return;
        }


        // ------------------------------------------
        // LOGIN FIREBASE
        // ------------------------------------------

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "LOGIN UID:",
            user.uid
        );


        // ------------------------------------------
        // GET USER PROFILE
        // ------------------------------------------

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userDoc =
            await getDoc(userRef);


        if (!userDoc.exists()) {

            alert(
                "❌ Account imeingia Firebase Authentication, lakini taarifa zake hazipo kwenye users."
            );

            await signOut(auth);

            return;
        }


        const userData =
            userDoc.data();


        const role =
            userData.role;


        console.log(
            "USER ROLE:",
            role
        );


        // ------------------------------------------
        // CHECK ROLE
        // ------------------------------------------

        if (!role) {

            alert(
                "❌ Role ya account hii haijawekwa."
            );

            return;
        }


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        alert(
            "✅ Umefanikiwa kuingia!"
        );


        // ------------------------------------------
        // DASHBOARD
        // ------------------------------------------

        goToDashboard(role);


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        let message =
            error.message;


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Email au password si sahihi.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "Account hii haijapatikana.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Password si sahihi.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email uliyoingiza si sahihi.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Hakuna internet au connection imekatika.";

        }


        alert(
            "❌ Login imeshindikana:\n\n" +
            message
        );

    }

}


// ==================================================
// DASHBOARD REDIRECT
// ==================================================

function goToDashboard(role) {

    switch (role) {

        case "customer":

            window.location.href =
                "customer.html";

            break;


        case "farmer":

            window.location.href =
                "farmer.html";

            break;


        case "supplier":

            window.location.href =
                "seller.html";

            break;


        case "retailer":

            window.location.href =
                "seller.html";

            break;


        case "rider":

            window.location.href =
                "rider.html";

            break;


        default:

            alert(
                "❌ Role ya mtumiaji haijulikani: " +
                role
            );

    }

}


// ==================================================
// LOGOUT
// ==================================================

async function logoutUser() {

    try {

        await signOut(auth);


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );


        alert(
            "❌ Imeshindikana kutoka: " +
            error.message
        );

    }

}


// ==================================================
// CHECK CURRENT USER
// ==================================================

function getCurrentUser() {

    return auth.currentUser;

}


// ==================================================
// AUTH STATE LISTENER
// ==================================================

function watchAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// ==================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==================================================

window.registerUser =
    registerUser;


window.loginUser =
    loginUser;


window.logoutUser =
    logoutUser;


// ==================================================
// EXPORT FUNCTIONS
// ==================================================

export {

    registerUser,
    loginUser,
    logoutUser,
    goToDashboard,
    getCurrentUser,
    watchAuthState

};