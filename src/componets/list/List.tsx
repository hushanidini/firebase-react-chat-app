import ChatList from "./ChatList/ChatList"
import "./list.css"
import Userinfo from "./Userinfo/Userinfo"

const List = () => {
    return (
        <div className='list'>
            <Userinfo />
            <ChatList />
        </div>
    )
}

export default List