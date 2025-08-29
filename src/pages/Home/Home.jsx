import "./Home.css";
import { useRef, useEffect, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase.js";

function Home() {

    const [user, setUser] = useState('');
    const [post, setPost] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isPDropActive, setIsPDropActive] = useState(false);
    const [comment, setComment] = useState(null);
    const [currentPostId, setCurrentPostId] = useState(null);

    const [newPostImage, setNewPostImage] = useState("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/Post%2FDefault%2FDefaut-Post.jpg?alt=media&token=ea458c51-a8ba-446c-8f43-4461707e2f54");
    const [newPostId, setNewPostId] = useState("");
    const [newPostCaption, setNewPostCaption] = useState("");

    const fileInputRef = useRef(null);

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;


        console.log("Selected file:", file);
        const storageRef = ref(storage, `Post/${user.username}/${newPostId}/${newPostId}`);

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

    //Fetch Posts Of People User Follows

    useEffect(() => {
        const fetchPostsData = async () => {
            if (!user || !user._id) return; // guard

            console.log("user id in fetchPostsData:", user._id);

            const response = await fetch("/posts/feed/" + user._id);

            const json = await response.json();

            if (!response.ok) {
                alert("Error Fetching Posts");
                console.log(response);
            }

            setPost(json);
            console.log("Posts Data:", json);
        }

        fetchPostsData();
    }, [user]);

    const handleProfileClick = () => {
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
        const heartLogo = document.querySelector(`#heart-logo-${postId}`);
        const heartCrackLogo = document.querySelector(`#heart-logo-crack-${postId}`);

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
        setPost((prevPosts) =>
            prevPosts.map((p) =>
                p._id === postId
                    ? {
                        ...p,
                        hasLiked: !p.hasLiked,
                        likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
                    }
                    : p
            )
        );

        if (json.liked === true) {
            heartLogo.style.display = "block";
            setTimeout(() => {
                heartLogo.style.display = "none";
            }, 800);
        }

        if (json.liked === false) {
            heartCrackLogo.style.display = "block";
            setTimeout(() => {
                heartCrackLogo.style.display = "none";
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
        setNewPostImage("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/Post%2FDefault%2FDefaut-Post.jpg?alt=media&token=ea458c51-a8ba-446c-8f43-4461707e2f54");
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
            setNewPostImage("https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/Post%2FDefault%2FDefaut-Post.jpg?alt=media&token=ea458c51-a8ba-446c-8f43-4461707e2f54");
            setNewPostCaption("");
        }
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
                    <div className="profile">

                        <img srcSet={profilePicture}
                            alt="Profile" onClick={handleProfileClick}
                            className="profile-picture" />

                        <div className="dropdown">
                            <ul>
                                <li><a href="/edit">Edit</a></li>
                                <li><a onClick={addPost}>Add Post</a></li>
                                <li>
                                    <a style={{ color: "red", cursor: "pointer" }}
                                        href="/logout">
                                        Logout
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
                                        style={{ display: "none" }}/>
                                </div>
                            </div>
                            <div className="postDetails">
                                <input type="text" readOnly value={`Post ID : ${newPostId}`} />
                                <input type="text" onChange={(e) => {setNewPostCaption(e.target.value)}} placeholder="Caption" />
                            </div>
                            <div className="addButtonPanel">
                                <button onClick={submitPost}>Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contentPane">
                {post && post.length > 0 ? (
                    post.map((p) => (
                        <div key={p._id} className="post">
                            <div className="postedBy">
                                <img srcSet={p.postedBy.profilePicture} alt="" />
                                <h6><a href={`${p.postedBy.username}`}>{p.postedBy.username}</a></h6>
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
        </>
    );
}

export default Home;