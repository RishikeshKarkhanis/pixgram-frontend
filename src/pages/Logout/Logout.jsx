import { useEffect, useState } from 'react';

function Logout() {

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/logout", {method:"POST"});
            const json = await response.json();

            if (response.ok) {
                window.location.href = "/";
                console.log(response);
            }
            console.log("Hello, from logout!");
            
        }

        fetchUserData();
    }, []);

    return(
        <>

        </>
    );
}

export default Logout;