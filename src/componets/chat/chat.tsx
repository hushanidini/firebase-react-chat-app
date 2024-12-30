import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/useChatStore";
import { useUserStore } from "../../lib/useUserStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

interface ChatMessage {
    senderId: string;
    text: string;
    createdAt: Date;
    img?: string;
}

interface Chat {
    messages: ChatMessage[];
}

const Chat = () => {
    const [chat, setChat] = useState<Chat | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);
    const [text, setText] = useState<string>("");
    const [img, setImg] = useState<{ file: File | null; url: string }>({
        file: null,
        url: "",
    });

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
        useChatStore();

    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
        if (!chatId) return;
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data() as Chat);
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e: { emoji: string }) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl: any = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userChats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(
                        (c: { chatId: string }) => c.chatId === chatId
                    );

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen =
                        id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
        } catch (err) {
            console.log(err);
        } finally {
            setImg({
                file: null,
                url: "",
            });

            setText("");
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor, sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div
                        className={
                            message.senderId === currentUser?.id ? "message own" : "message"
                        }
                        key={message.createdAt.toString()}
                    >
                        <div className="texts">
                            {message.img && <img src={message.img} alt="" />}
                            <p>{message.text}</p>
                            <span>{format(new Date(message.createdAt))}</span>
                        </div>
                    </div>
                ))}
                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="" />
                        </div>
                    </div>
                )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleImg}
                    />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input
                    type="text"
                    placeholder={
                        isCurrentUserBlocked || isReceiverBlocked
                            ? "You cannot send a message"
                            : "Type a message..."
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt=""
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button
                    className="sendButton"
                    onClick={handleSend}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;