import { useEffect, useState } from "react";
import { useUserStore } from "../../../lib/useUserStore";
import AddUser from "./addUser/addUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/useChatStore";
import "./chatList.css";

type Chat = {
    chatId: string;
    lastMessage: string;
    isSeen: boolean;
    updatedAt: number;
    user: User;
};

type ChatItem = {
    receiverId: string;
};

type User = {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    blocked: string[];
};
const ChatList = () => {
    const [chats, setChats] = useState<any[]>([]);
    const [addMode, setAddMode] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "userChats", currentUser.id),
            async (res: any) => {
                const data = res.data();
                if (!data || !data.chats) {
                    console.warn("No chats found for the current user.");
                    return; // Exit if no chats are found
                }
                const items: ChatItem[] = res.data().chats;

                const promises = items.map(async (item: ChatItem) => {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();

                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);

                setChats(chatData.sort((a: any, b: any) => b.updatedAt - a.updatedAt));
            }
        );
        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat: Chat) => {
        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(
            (item) => item.chatId === chat.chatId
        );

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userChats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }
    }

    const filteredChats = chats.filter((c) =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );
    return (
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <img
                    src={addMode ? "./minus.png" : "./plus.png"}
                    alt=""
                    className="add"
                    onClick={() => setAddMode((prev) => !prev)}
                />
            </div>
            {filteredChats.map((chat) => (
                <div
                    className="item"
                    key={chat.chatId}
                    onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                    }}
                >
                    <img
                        src={
                            chat.user.blocked.includes(currentUser.id)
                                ? "./avatar.png"
                                : chat.user.avatar || "./avatar.png"
                        }
                        alt=""
                    />
                    <div className="texts">
                        <span>
                            {chat.user.blocked.includes(currentUser.id)
                                ? "User"
                                : chat.user.username}
                        </span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}

            {addMode && <AddUser />}
        </div>
    );
}

export default ChatList;