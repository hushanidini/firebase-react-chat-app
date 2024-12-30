import { useEffect } from 'react'
import Login from './componets/login/Login'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/useUserStore';
import List from './componets/list/List';
import Chat from './componets/chat/chat';
import Detail from './componets/details/details';
import Notification from './componets/notification/Notification'
import { useChatStore } from './lib/useChatStore';

function App() {
  const { currentUser, fetchUserInfo, isLoading } = useUserStore();
  const { chatId } = useChatStore();
  console.log('chatId--', chatId)
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(String(user?.uid))
    })
    return () => {
      unSub();
    }
  }, [fetchUserInfo])

  if (isLoading) return <div className="loading">Loading...</div>;
  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App
