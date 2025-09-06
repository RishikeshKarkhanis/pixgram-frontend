import "./Profile.css";
import { useRef, useEffect, useState, } from 'react';
import { useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getStorage } from "firebase/storage";
import { storage } from "../../firebase.js";

function Profile() {

    const [user, setUser] = useState('');
    const [profileOwner, setProfileOwner] = useState('');
    const [post, setPost] = useState(null);
    const [myPost, setMyPost] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isPDropActive, setIsPDropActive] = useState(false);
    const [comment, setComment] = useState(null);
    const [currentPostId, setCurrentPostId] = useState(null);

    const [newPostImage, setNewPostImage] = useState("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/default%2FPosts%2Fdefault%2Fdefault.jpg?alt=media&token=88af68e1-119b-426f-807e-e5f49e05dfb0");
    const [newPostId, setNewPostId] = useState("");
    const [newPostCaption, setNewPostCaption] = useState("");

    const fileInputRef = useRef(null);

    const { username } = useParams();


    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;


        console.log("Selected file:", file);
        const storageRef = ref(storage, `${user.username}/Posts/${newPostId}/${newPostId}`);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);
        setNewPostImage(url);
    };


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
            if (json && json.profilePicture) {
                setProfilePicture(json.profilePicture);
            } else {
                setProfilePicture('default-profile-picture-url'); // Set a default picture if none exists
            }
            console.log("Profile Picture:", json.profilePicture);
        }

        fetchUserData();
    }, []);

    //Fetch User Uploaded Posts
    useEffect(() => {
        const fetchMyPostsData = async () => {
            if (!user || !user._id) return; // guard

            const profileUserIdResp = await fetch("/users/getid/" + username);
            const profileUserId = await profileUserIdResp.json();


            console.log("user id in fetchMyPostsData:", profileUserId.uid);

            const response = await fetch("/posts/myposts/" + profileUserId.uid);

            const json = await response.json();

            const profileOwnerResp = await fetch("/users/getuserbyid/" + profileUserId.uid);
            const profileOwnerLocal = await profileOwnerResp.json();

            console.log(profileOwnerLocal);
            setProfileOwner(profileOwnerLocal);


            if (!response.ok) {
                alert("Error Fetching Posts");
                console.log(response);
            }

            setMyPost(json);
            console.log("My Posts Data:", json);
        }

        fetchMyPostsData();
    }, [user]);

    useEffect(() => {
        const fetchFollowData = async () => {
            if (!user?._id || !profileOwner?._id) return;
            const response = await fetch("/follows/isfollowing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    follower: user._id,
                    following: profileOwner._id
                })
            });

            if (response.ok) {
                setIsFollowing(true);
            }

            const data = await response.json();
            console.log(data);

        }

        fetchFollowData();
    }, [profileOwner, user]);

    const handleProfileClick = () => {

        if (window.innerWidth > 600) return;

        const dropdown = document.querySelector('.dropdown');

        if (isPDropActive === true) {
            setIsPDropActive(false);
            dropdown.style.display = 'none';
        }
        if (isPDropActive === false) {
            setIsPDropActive(true);
            dropdown.style.display = 'flex';
        }
    }

    const handleLikeClick = async (postId) => {
        const heartLogo = await document.querySelector(`#heart-logo-${postId}`);
        const heartCrackLogo = await document.querySelector(`#heart-logo-crack-${postId}`);

        // const selfHeartLogo = await document.querySelector(`#self-heart-logo-${postId}`);
        // const selfHeartCrackLogo = await document.querySelector(`#self-heart-logo-crack-${postId}`);

        const reqObj = { userId: user._id, postId: postId };

        const data = await fetch('/likes/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqObj)
        });

        const json = await data.json();

        // update UI immediately
        // setPost((prevPosts) =>
        //     prevPosts.map((p) =>
        //         p._id === postId
        //             ? {
        //                 ...p,
        //                 hasLiked: !p.hasLiked,
        //                 likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
        //             }
        //             : p
        //     )
        // );

        // update UI immediately
        setMyPost((prevMyPosts) =>
            prevMyPosts.map((p) =>
                p._id === postId
                    ? {
                        ...p,
                        hasLiked: !p.hasLiked,
                        likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
                    }
                    : p
            )
        );

        // console.log(post);
        console.log(myPost);


        if (json.liked === true) {
            heartLogo.style.display = "block";
            // selfHeartLogo.style.display = "block";
            setTimeout(() => {
                heartLogo.style.display = "none";
                // selfHeartLogo.style.display = "none";
            }, 800);
        }

        if (json.liked === false) {
            heartCrackLogo.style.display = "block";
            // selfHeartCrackLogo.style.display = "block";
            setTimeout(() => {
                heartCrackLogo.style.display = "none";
                // selfHeartCrackLogo.style.display = "none";
            }, 800);
        }

        return json.liked;
    }

    const handleCommentClick = async (postId) => {
        const comments = await fetch('/comments/' + postId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await comments.json();
        setComment(json);
        document.querySelector(".commentsPane").style.display = "block";
        console.log("Comments Data:", json);
        setCurrentPostId(postId);
    }

    const handleDeleteComment = async (commentId, postId) => {

        const response = await fetch('/comments/delete/' + commentId, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: postId })
        }
        );

        const json = await response.json();
        if (!response.ok) {
            alert("Error Deleting Comment");
            console.log(response);
        }
        console.log("Deleted Comment:", json);
        // Remove the deleted comment from the UI
        setComment((prevComments) => prevComments.filter((c) => c._id !== commentId));
    }

    const handlePostComment = async (postId) => {
        const commentInput = document.getElementById('comment-input');
        const content = commentInput.value;
        const reqObj = { userId: user._id, postId: postId, content: content };
        const response = await fetch('/comments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqObj)
        });
        const json = await response.json();
        if (!response.ok) {
            alert("Error Posting Comment");
            console.log(response);
        }
        // console.log("Posted Comment:", json);

        const uidjson = json.userId;

        const replacement = { "_id": uidjson, "username": user.username, "profilePicture": user.profilePicture };
        json.userId = replacement;
        console.log("After Replacement:", json);

        // Add the new comment to the UI
        setComment((prevComments) => [json, ...prevComments]);
        commentInput.value = ''; // Clear the input field
    }

    const addPost = async () => {
        document.querySelector('.dropdown').style.display = 'none';
        setIsPDropActive(false);
        document.querySelector('.addPane').style.display = 'block';

        const data = await fetch('/posts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postedBy: user._id, imageUrl: newPostImage, caption: "No Caption" })
        });

        const json = await data.json();
        console.log("New Post Created:", json);
        setNewPostId(json._id);
    }

    const submitPost = async () => {
        const data = await fetch('/posts/update/' + newPostId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ caption: newPostCaption, imageUrl: newPostImage })
        });

        const json = await data.json();
        console.log("Post Updated:", json);
        // Optionally, you can refresh the feed to show the new post
        setNewPostImage("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/default%2FPosts%2Fdefault%2Fdefault.jpg?alt=media&token=88af68e1-119b-426f-807e-e5f49e05dfb0");
        setNewPostId("");
        setNewPostCaption("");
        document.querySelector('.addPane').style.display = 'none';
    }

    const cancelPost = async () => {
        document.querySelector('.addPane').style.display = 'none';

        // Delete the created post if user cancels
        if (newPostId) {
            const response = await fetch('/posts/delete/' + newPostId, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const json = await response.json();
            if (!response.ok) {
                alert("Error Deleting Post");
                console.log(response);
            }
            console.log("Deleted Post:", json);
            setNewPostId("");
            setNewPostImage("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/default%2FPosts%2Fdefault%2Fdefault.jpg?alt=media&token=88af68e1-119b-426f-807e-e5f49e05dfb0");
            setNewPostCaption("");
        }
    }

    const goToProfile = async () => {
        window.location.href = "/" + user.username;
    }

    const goToHome = async () => {
        window.location.href = "/";
    }

    const unfollow = async () => {
        const reqObj = {
            follower: user._id,
            following: profileOwner._id
        };

        console.log(reqObj);


        const response = await fetch('/follows/delete',
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqObj)
            });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            setIsFollowing(false);
        }

    }

    const follow = async () => {
        const reqObj = {
            follower: user._id,
            following: profileOwner._id
        };

        console.log(reqObj);


        const response = await fetch('/follows/create',
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqObj)
            });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            setIsFollowing(true);
        }

    }

    const deletePost = async (postId, userId) => {
        try {
            const response = await fetch(`/posts/delete/${postId}`, { method: "DELETE" });
            const data = await response.json();

            const uidResp = await fetch('/users/getuserbyid/' + userId);
            const uid = await uidResp.json();

            console.log(uid.username);

            if (response.ok) {
                // remove the deleted post from state
                setMyPost((prevPosts) => prevPosts.filter((post) => post._id !== postId));

                const storage = getStorage();
                const folderRef = ref(storage, `${uid.username}/Posts/${postId}`);

                const res = await listAll(folderRef);

                // delete each file inside the folder
                const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
                await Promise.all(deletePromises);

                console.log(`Deleted all files inside ${username}/Posts/${postId}`);

            } else {
                console.error("Failed to delete:", data.error);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const searchBoxActivate = async () => {
        alert("Search!");
    }

    return (
        <>
            <nav className="navbar">
                <div className="left">
                    <button className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </button>
                </div>
                <div className="right">

                    <div className="search-navbar">
                        <button onClick={searchBoxActivate}>
                            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: "21px" }}></i>
                        </button>
                    </div>

                    <div className="profile">

                        <img srcSet={profilePicture}
                            alt="Profile" onClick={handleProfileClick}
                            className="profile-picture" />

                        <div className="dropdown">
                            <ul>
                                <li><a onClick={goToHome}><i className="fa-solid fa-home"></i> Home</a></li>
                                <li><a onClick={goToProfile}><i className="fa-solid fa-user"></i> Profile</a></li>
                                <li><a href="/edit"><i className="fa-solid fa-pencil"></i> Edit</a></li>
                                <li><a onClick={addPost}><i className="fa-solid fa-circle-plus"></i> Add Post</a></li>
                                <li>
                                    <a style={{ color: "red", cursor: "pointer" }} href="/logout">
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>
            </nav>

            <div className="commentsPane" style={{ display: "none" }}>

                <div className="window">
                    <div className="dialog">
                        <div className="head">
                            <h3>Comments</h3>
                            <button onClick={() => document.querySelector(".commentsPane").style.display = "none"}>
                                <i className="fa-solid fa-xmark fa-2x"></i>
                            </button>
                        </div>
                        <div className="body">
                            {comment && comment.length > 0 ? (
                                comment.map((c) => (
                                    <div key={c._id} className="comment">

                                        <div className="top">
                                            <div className="left">
                                                <img srcSet={c.userId.profilePicture} alt="" />
                                                <p style={{ fontWeight: "bold" }}>
                                                    <a href={`/${c.userId.username}`}>
                                                        {c.userId.username}
                                                    </a>
                                                </p>
                                            </div>
                                            <div className="right">
                                                {c.userId._id === user._id ? (
                                                    <button id={"delete-" + c._id}
                                                        className="delete-comment"
                                                        style={{ display: "block" }}
                                                        onClick={() => handleDeleteComment(c._id, c.postId)}>
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="content">
                                            <p>{c.content}</p>
                                        </div>



                                    </div>
                                ))
                            ) : (
                                <h3>No comments available.</h3>
                            )}

                        </div>

                        <div className="addComment">
                            <div className="commentField">
                                <img src={profilePicture} />
                                <input type="text" name="comment-input" id="comment-input" />
                                <button onClick={() => handlePostComment(currentPostId)}><i className="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="addPane" style={{ display: "none" }}>
                <div className="window">
                    <div className="dialog">
                        <div className="head">
                            <h3>Add Post</h3>
                            <button onClick={cancelPost}>
                                <i className="fa-solid fa-xmark fa-2x"></i>
                            </button>
                        </div>
                        <div className="body">
                            <div className="postImageContainer">
                                <div style={{ backgroundImage: `url(${newPostImage})` }}
                                    id="post-image-preview" className="post-image-preview"
                                    onClick={handleImageUpload}>
                                    <i className="fa-solid fa-image fa-5x"></i>
                                </div>
                                <div className="hiddenFile">
                                    <input
                                        type="file"
                                        id="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        style={{ display: "none" }} />
                                </div>
                            </div>
                            <div className="postDetails">
                                <input type="text" id="newPostId" readOnly value={`Post ID : ${newPostId}`} />
                                <input type="text" id="newPostCaption" onChange={(e) => { setNewPostCaption(e.target.value) }} placeholder="Caption" />
                            </div>
                            <div className="addButtonPanel">
                                <button onClick={submitPost}>Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mainContentDivision">

                <div className="sidebar">
                    <ul>
                        <li onClick={goToHome}> <i className="fa-solid fa-home"></i> Home</li>
                        <li onClick={goToProfile}> <i className="fa-solid fa-user"></i> Profile</li>
                        <li onClick={searchBoxActivate}>
                            <i className="fa-solid fa-magnifying-glass"></i> Explore
                        </li>
                        <li><a href="/edit"><i className="fa-solid fa-pencil"></i> Edit</a></li>

                        <li onClick={addPost}>
                            <i className="fa-solid fa-circle-plus"></i> Create
                        </li>

                        <li className="logout-sidebar">
                            <a href="/logout"><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
                        </li>
                    </ul>
                </div>

                <div className="profilePane" style={{ display: 'flex' }}>

                    <div className="userPane">
                        <div className="userDialog">
                            <div className="bigProfile">
                                <img src={profileOwner.profilePicture} alt="Profile Picture" />
                            </div>
                            <div className="accountDetails">
                                <div className="userDetails">
                                    <div className="username">
                                        <h3>{username}</h3>
                                    </div>
                                    <div className="userButtons">
                                        {profileOwner._id === user._id ?
                                            (<button className="userEditBtn"
                                                style={{ width: "100px", fontSize: 18, height: 25 }}
                                                onClick={() => { window.location.href = "/edit" }}>Edit</button>) :
                                            (
                                                (isFollowing ?
                                                    (<button className="userFollowingBtn"
                                                        style={{ width: "100px", fontSize: 18, height: 25 }}
                                                        onClick={unfollow}>
                                                        Following
                                                    </button>
                                                    ) :
                                                    (<button className="userFollowBtn"
                                                        style={{ width: "100px", fontSize: 18, height: 25 }}
                                                        onClick={follow}>
                                                        Follow
                                                    </button>)
                                                )
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="followDetails">
                                    <p> {profileOwner.posts} Posts</p>
                                    <p> {profileOwner.followers} Followers</p>
                                    <p> {profileOwner.following} Following</p>
                                </div>
                                <div className="bioDetails">
                                    <p>{profileOwner.bio}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {myPost && myPost.length > 0 ? (
                        myPost.map((p) => (
                            <div key={p._id} className="post">
                                <div className="postedBy">
                                    <div className="topleft">
                                        <img srcSet={p.postedBy.profilePicture} alt="" />
                                        <h6><a href={`${p.postedBy.username}`}>{p.postedBy.username}</a></h6>
                                    </div>
                                    <div className="topright">
                                        {profileOwner._id === user._id ?
                                            (<button onClick={() => deletePost(p._id, p.postedBy._id)}>
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>) : (<></>)}
                                    </div>
                                </div>
                                <div className="imageContainer">
                                    <div onDoubleClick={() => handleLikeClick(p._id)}
                                        style={{ backgroundImage: `url(${p.imageUrl}` }}
                                        alt="Post" className="post-image">

                                        <i id={"heart-logo-" + p._id}
                                            className="fa-solid fa-heart fa-5x">
                                        </i>

                                        <i id={"heart-logo-crack-" + p._id}
                                            className="fa-solid fa-heart-crack fa-5x">
                                        </i>

                                    </div>
                                </div>
                                <div className="captionContainer">
                                    <p>{p.caption}</p>
                                </div>
                                <div className="optionContainer">

                                    <div className="likeContainer">
                                        <button id={"like-" + p._id}
                                            className="like-button" onClick={() => handleLikeClick(p._id)}>
                                            {p.hasLiked ? (
                                                <i className="fa-solid fa-heart" style={{ color: "crimson" }}></i>
                                            ) : (
                                                <i className="fa-regular fa-heart" style={{ color: "black" }}></i>
                                            )}
                                        </button>

                                        <div className="likeCount">
                                            <p>{p.likes}</p>
                                        </div>
                                    </div>

                                    <div className="commentContainer">
                                        <button className="comment-button" onClick={() => handleCommentClick(p._id)}>
                                            <i className="fa-regular fa-comment"></i>
                                        </button>

                                        <div className="commentCount">
                                            <p>{p.comments}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>

            </div>
        </>
    );
}

export default Profile;