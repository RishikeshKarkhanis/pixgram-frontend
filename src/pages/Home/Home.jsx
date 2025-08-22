import "./Home.css";
import { useEffect, useState } from 'react';

function Home () {

    const [user, setUser] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

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
            if (json._doc && json._doc.profilePicture) {
                setProfilePicture(json._doc.profilePicture);
            } else {
                setProfilePicture('default-profile-picture-url'); // Set a default picture if none exists
            }
            console.log("Profile Picture:", json._doc.profilePicture);
        }

        fetchUserData();
    }, []);

    return (
        <>
            <h1>{user ? `Hello, ${user._doc.username}` : 'Loading...'}</h1>
            <img srcset={profilePicture} />
        </>
    );
}

export default Home;