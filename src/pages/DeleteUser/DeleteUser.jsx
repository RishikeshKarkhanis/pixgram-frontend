import { useEffect, useState } from 'react';
import { ref, getStorage, listAll, deleteObject } from "firebase/storage";

function DeleteUser() {

    const [user, setUser] = useState("");
    const [uid, setUid] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/currentUser");
            const json = await response.json();

            if (response.ok) {
                console.log(response);
            }

            console.log("Fetched user:", json);
            setUser(json);
            setUid(json._id);
        }

        fetchUserData();
    }, []);

    useEffect(() => {
        if (!uid) {
            console.log("!uid");
        };

        const deleteUser = async () => {

            const response = await fetch("/users/delete/" + `${uid}`, { method: "DELETE" });
            const json = await response.json();

            if (response.ok) {
                console.log("User Deleted: ", response);
                const logoutResponse = await fetch("/users/logout", { method: "POST" });
                if (logoutResponse.ok) {
                    console.log("User logged out");

                    const storage = getStorage();
                    const folderRef = ref(storage, `${uid.username}`);

                    const res = await listAll(folderRef);

                    // delete each file inside the folder
                    const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
                    await Promise.all(deletePromises);

                    window.location.href = "/";
                }
            }
        }

        deleteUser();
    }, [uid]);

    return (
        <>

        </>
    );
}

export default DeleteUser;