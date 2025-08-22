import "./Home.css";
import { useEffect, useState } from 'react';

function Home () {

    const [user, setUser] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/currentUser");
            const json = await response.json();

            if (!response.ok) {
                window.location.href = "/login";
                console.log(response);
            }

            setUser(json);
            console.log(json);
            console.log(response);
        }

        fetchUserData();
    }, []);
    


    return (
        <>
            <h1>{user ? `Hello, ${user._doc.username}` : 'Loading...'}</h1>
        </>
    );
}

export default Home;