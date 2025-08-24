import { useEffect, useState } from 'react';

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