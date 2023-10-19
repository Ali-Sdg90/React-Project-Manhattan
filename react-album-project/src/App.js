import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
} from "firebase/firestore";

import React, { useEffect, useState } from "react";

import "./App.css";
import Auth from "./components/Auth";
import Login from "./components/Login";
import urlEncoder from "./helper/urlEncoder";
import urlDecoder from "./helper/urlDecoder";

import { db } from "./config/firebase";
import { Route, Routes } from "react-router-dom";

export const AppContext = React.createContext();

const accountsCollectionRef = collection(db, "Accounts");

document.title = "React login page";

const App = () => {
    const [encryptedEmailAdrs, setEncryptedEmailAdrs] = useState("");
    const [loginInfo, setLoginInfo] = useState({});
    const [allowRedirect, setAllowRedirect] = useState(false);

    const imgCollectionRef = collection(db, "Accounts");

    const validEmail = async (loginInfo) => {
        try {
            // check if email is new or not
            const accountsQuery = query(
                accountsCollectionRef,
                where("email", "==", loginInfo.email)
            );
            const accountsSnapshot = await getDocs(accountsQuery);

            if (accountsSnapshot.size === 0) {
                const newAccountData = {
                    email: loginInfo.email,
                    UserInfo: loginInfo,
                    UserTodo: [],
                };

                // Use the email as the document ID
                const newAccountRef = doc(
                    accountsCollectionRef,
                    loginInfo.email
                );

                await setDoc(newAccountRef, newAccountData);
            }

            const data = await getDocs(imgCollectionRef);
            const filteredData = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            if (filteredData.length > 0) {
                const firstDocumentRef = doc(
                    imgCollectionRef,
                    filteredData[0].id
                );
                await updateDoc(firstDocumentRef, { UserInfo: loginInfo });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        console.log("=>", loginInfo.email);
        if (loginInfo.email) {
            validEmail(JSON.parse(JSON.stringify(loginInfo))).then(() => {
                setEncryptedEmailAdrs(urlEncoder(loginInfo.email));

                console.log("Ready to SEND");
            });
        }
    }, [loginInfo]);

    useEffect(() => {
        if (encryptedEmailAdrs) {
            console.log("DecodedURL:", urlDecoder(encryptedEmailAdrs));
            console.log("encryptedURL:", encryptedEmailAdrs);
            console.log("AllowRedirect:", allowRedirect);
            if (allowRedirect) {
                console.log("Redirect To Todo App!!!");
                window.location.href =
                    "http://localhost:5000/" + encryptedEmailAdrs;
            }
        }
    }, [encryptedEmailAdrs]);

    return (
        <div>
            <AppContext.Provider
                value={{
                    loginInfo,
                    setLoginInfo,
                    encryptedEmailAdrs,
                    setAllowRedirect,
                }}
            >
                <Auth method={"reload"} />
                <Routes>
                    <Route path="/React-login-page/" element={<Login />} />
                    <Route path="/React-login-page/*" element={<Login />} />
                </Routes>
            </AppContext.Provider>
        </div>
    );
};

export default App;
