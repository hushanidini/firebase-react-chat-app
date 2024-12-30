import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { auth, db } from './../../lib/firebase'
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import "./login.css";
// import upload from "../../lib/upload";

interface Avatar {
    file: File | null;
    url: string;
}

const Login = () => {
    const [newAvatar, setNewAvatar] = useState<Avatar>({ file: null, url: '' });
    const [isLoading, setIsLoading] = useState<boolean>(false);


    function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setNewAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    }
    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    const validatePassword = (password: string) => {
        const isValid = password.length >= 6;
        return isValid;
    };

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setIsLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const { email, password } = Object.fromEntries(formData) as { email: string; password: string };
            if (!validateEmail(String(email))) {
                toast.error("Please enter a valid email address.");
                return;
            }
            if (!validatePassword(String(password))) {
                toast.error("Password must be at least 6 characters long.");
                return;
            }
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log('error:', error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();


        const formData = new FormData(e.currentTarget);
        const { username, email, password } = Object.fromEntries(formData)

        if (!username || !email || !password) {
            return toast.warn("Please enter inputs!");
        }

        // if (!newAvatar.file) return toast.warn("Please upload an avatar!");
        if (!validateEmail(String(email))) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!validatePassword(String(password))) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        // Validate unique username
        const userRef = collection(db, 'users')
        const q = query(userRef, where("username", '==', username));
        const querySnapShot = await getDocs(q);

        if (!querySnapShot.empty) {
            return toast.error("Select another username");
        }
        setIsLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, String(email), String(password));

            // const imgUrl = await upload(newAvatar.file);
            // console.log('imgUrl--', imgUrl)
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                // avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            }),
                await setDoc(doc(db, "userChats", res.user.uid), {
                    chats: []
                })
            toast.success("Account created! You can login now!");
        } catch (error) {
            console.log('error:', error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-section">
            <div className="item">
                <h2>Login to your account</h2>
                <p>Please login to your account to get started!</p>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button >{"Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={newAvatar.url || "./avatar.png"} alt="" />
                        Upload an image
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleAvatarUpload}
                    />
                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={isLoading}>{isLoading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login;