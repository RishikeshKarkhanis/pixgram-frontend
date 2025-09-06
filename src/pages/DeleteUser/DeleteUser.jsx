import { useEffect, useState } from 'react';
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";

function DeleteUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/currentUser");
            const json = await response.json();
            if (response.ok) {
                setUser(json);
            }
        };
        fetchUserData();
    }, []);

    // recursive delete function
    const deleteFolderRecursive = async (folderRef) => {
        const res = await listAll(folderRef);

        // delete all files in current folder
        await Promise.all(res.items.map((itemRef) => {
            console.log("Deleting file:", itemRef.fullPath);
            return deleteObject(itemRef);
        }));

        // recurse into subfolders
        await Promise.all(res.prefixes.map((subfolderRef) => {
            console.log("Descending into folder:", subfolderRef.fullPath);
            return deleteFolderRecursive(subfolderRef);
        }));
    };

    useEffect(() => {
        if (!user) return;

        const deleteUser = async () => {
            try {
                const response = await fetch(`/users/delete/${user._id}`, { method: "DELETE" });

                if (response.ok) {
                    console.log("User deleted from DB");

                    const logoutResponse = await fetch("/users/logout", { method: "POST" });
                    if (logoutResponse.ok) {
                        console.log("User logged out");

                        const storage = getStorage();
                        const userFolderRef = ref(storage, user.username); // gs://.../username/

                        await deleteFolderRecursive(userFolderRef);

                        console.log(`✅ Deleted all Firebase files under ${user.username}/`);
                        window.location.href = "/";
                    }
                }
            } catch (err) {
                console.error("Error deleting user:", err);
            }
        };

        deleteUser();
    }, [user]);

    return null;
}

export default DeleteUser;
