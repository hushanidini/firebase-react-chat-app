import { FormEvent, useState } from "react";
import { useUserStore } from "../../../../lib/useUserStore";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import "./addUser.css";

interface User {
    username: string;
    avatar?: string;
    id: string;
}

const AddUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const { currentUser } = useUserStore();

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));

            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data() as User);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userChats");
        try {
            const newChatRef = doc(chatRef)
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            if (user) {
                await updateDoc(doc(userChatRef, user.id), {
                    chats: arrayUnion({
                      chatId: newChatRef.id,
                      lastMessage: "",
                      receiverId: currentUser.id,
                  updatedAt: Date.now(),
                }),
              });

              await updateDoc(doc(userChatRef, currentUser.id), {
                chats: arrayUnion({
                  chatId: newChatRef.id,
                  lastMessage: "",
                  receiverId: user.id,
                  updatedAt: Date.now(),
                }),
              });
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>
            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={user.avatar || "./avatar.png"} alt="" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd}>Add User</button>
                </div>
            )}
        </div>
    )
}
export default AddUser;