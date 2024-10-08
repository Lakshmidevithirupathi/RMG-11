import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';



var stompClient =null;
const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
      });
    useEffect(() => {
      console.log(userData);
    }, [userData]);

    // const connect =()=>{
    //     let Sock = new SockJS('http://localhost:8080/ws');
    //     stompClient = over(Sock);
    //     stompClient.connect({},onConnected, onError);
    // }

    const connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    
        // Request notification permission
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.log("Notification permission denied");
                }
            });
        }
    };
    

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
          var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

   


    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
    
        switch (payloadData.status) {
            case "JOIN":
                // When a user joins, show a message in the public chat
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
    
                // Add a join message to the public chat
                setPublicChats(prevChats => [
                    ...prevChats,
                    {
                        senderName: "Player",
                        message: `${payloadData.senderName} has joined the chat!`,
                        status: "JOIN",
                    }
                ]);


                
                  
                break;
    
            case "MESSAGE":
                // Add a regular message to the public chat
                
                setPublicChats(prevChats => [
                    ...prevChats,
                    payloadData
                ]);
                break;
        }
    };
    
    
    
    
    const onPrivateMessage = (payload)=>{
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

   
    
    

    const onError = (err) => {
        console.log(err);
        
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }
    const sendValue=()=>{
            if (stompClient) {
              var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
              };
              console.log(chatMessage);
              stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    

    const registerUser=()=>{
        connect();
    }
    return (
    <div className="container">
        {userData.connected?
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                    ))}
                </ul>
            </div>
            {tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {publicChats.map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendValue}>send</button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                </div>
            </div>}
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>}
    </div>
    )
}





// export default ChatRoom;



// import React, { useEffect, useState } from 'react';
// import { over } from 'stompjs';
// import SockJS from 'sockjs-client';


// interface ChatMessage {
//   senderName: string;
//   message: string;
//   status: string;
//   receiverName?: string;
// }

// interface UserData {
//   username: string;
//   receivername: string;
//   connected: boolean;
//   message: string;
// }

// var stompClient: any = null;

// const ChatRoom: React.FC = () => {
//   const [privateChats, setPrivateChats] = useState<Map<string, ChatMessage[]>>(new Map());
//   const [publicChats, setPublicChats] = useState<ChatMessage[]>([]);
//   const [tab, setTab] = useState<string>("CHATROOM");
//   const [userData, setUserData] = useState<UserData>({
//     username: '',
//     receivername: '',
//     connected: false,
//     message: ''
//   });

//   useEffect(() => {
//     console.log(userData);
//   }, [userData]);

//   const connect = () => {
//     let Sock = new SockJS('http://localhost:8080/ws');
//     stompClient = over(Sock);
//     stompClient.connect({}, onConnected, onError);

//     if (Notification.permission !== "granted") {
//       Notification.requestPermission().then(permission => {
//         if (permission !== "granted") {
//           console.log("Notification permission denied");
//         }
//       });
//     }
//   };

//   const onConnected = () => {
//     setUserData({ ...userData, connected: true });
//     stompClient.subscribe('/chatroom/public', onMessageReceived);
//     stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);
//     userJoin();
//   };

//   const userJoin = () => {
//     var chatMessage: ChatMessage = {
//       senderName: userData.username,
//       message: '',
//       status: "JOIN"
//     };
//     stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//   };

//   const onMessageReceived = (payload: any) => {
//     var payloadData: ChatMessage = JSON.parse(payload.body);

//     switch (payloadData.status) {
//       case "JOIN":
//         if (!privateChats.get(payloadData.senderName)) {
//           privateChats.set(payloadData.senderName, []);
//           setPrivateChats(new Map(privateChats));
//         }
//         setPublicChats(prevChats => [
//           ...prevChats,
//           {
//             senderName: "Player",
//             message: `${payloadData.senderName} has joined the chat!`,
//             status: "JOIN"
//           }
//         ]);
//         break;

//       case "MESSAGE":
//         setPublicChats(prevChats => [...prevChats, payloadData]);
//         break;
//     }
//   };

//   const onPrivateMessage = (payload: any) => {
//     var payloadData: ChatMessage = JSON.parse(payload.body);
//     if (privateChats.get(payloadData.senderName)) {
//       privateChats.get(payloadData.senderName)?.push(payloadData);
//       setPrivateChats(new Map(privateChats));
//     } else {
//       let list: ChatMessage[] = [];
//       list.push(payloadData);
//       privateChats.set(payloadData.senderName, list);
//       setPrivateChats(new Map(privateChats));
//     }
//   };

//   const onError = (err: any) => {
//     console.log(err);
//   };

//   const handleMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = event.target;
//     setUserData({ ...userData, message: value });
//   };

//   const sendValue = () => {
//     if (stompClient) {
//       var chatMessage: ChatMessage = {
//         senderName: userData.username,
//         message: userData.message,
//         status: "MESSAGE"
//       };
//       stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//       setUserData({ ...userData, message: "" });
//     }
//   };

//   const sendPrivateValue = () => {
//     if (stompClient) {
//       var chatMessage: ChatMessage = {
//         senderName: userData.username,
//         receiverName: tab,
//         message: userData.message,
//         status: "MESSAGE"
//       };

//       if (userData.username !== tab) {
//         privateChats.get(tab)?.push(chatMessage);
//         setPrivateChats(new Map(privateChats));
//       }
//       stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
//       setUserData({ ...userData, message: "" });
//     }
//   };

//   const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = event.target;
//     setUserData({ ...userData, username: value });
//   };

//   const registerUser = () => {
//     connect();
//   };

//   return (
//     <div className="container">
//       {userData.connected ? (
//         <div className="chat-box">
//           <div className="member-list">
//             <ul>
//               <li onClick={() => setTab("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"}`}>
//                 Chatroom
//               </li>
//               {[...privateChats.keys()].map((name, index) => (
//                 <li onClick={() => setTab(name)} className={`member ${tab === name && "active"}`} key={index}>
//                   {name}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {tab === "CHATROOM" && (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {publicChats.map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">{chat.message}</div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>

//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                 />
//                 <button type="button" className="send-button" onClick={sendValue}>
//                   send
//                 </button>
//               </div>
//             </div>
//           )}

//           {tab !== "CHATROOM" && (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {[...privateChats.get(tab)!].map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">{chat.message}</div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>

//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                 />
//                 <button type="button" className="send-button" onClick={sendPrivateValue}>
//                   send
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="register">
//           <input
//             id="user-name"
//             placeholder="Enter your name"
//             name="userName"
//             value={userData.username}
//             onChange={handleUsername}
//             // margin="normal"
//           />
//           <button type="button" onClick={registerUser}>
//             connect
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatRoom;












// import React, { useEffect, useState } from 'react';
// import { over } from 'stompjs';
// import SockJS from 'sockjs-client';

// let stompClient: any = null;

// const ChatRoom: React.FC = () => {
//   const [privateChats, setPrivateChats] = useState<Map<string, any[]>>(new Map());
//   const [publicChats, setPublicChats] = useState<any[]>([]);
//   const [tab, setTab] = useState<string>("CHATROOM");
//   const [userData, setUserData] = useState({
//     username: '',
//     receivername: '',
//     connected: false,
//     message: ''
//   });

//   useEffect(() => {
//     console.log(userData);
//   }, [userData]);

//   // Connect function
//   const connect = () => {
//     let Sock = new SockJS('http://localhost:8080/ws');
//     stompClient = over(Sock);
//     stompClient.connect({}, onConnected, onError);
//   };

//   const onConnected = () => {
//     setUserData({ ...userData, connected: true });
//     stompClient.subscribe('/chatroom/public', onMessageReceived);
//     stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);
//     userJoin();
//   };

//   const userJoin = () => {
//     const chatMessage = {
//       senderName: userData.username,
//       status: "JOIN"
//     };
//     stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//   };

//   const onMessageReceived = (payload: any) => {
//     const payloadData = JSON.parse(payload.body);

//     switch (payloadData.status) {
//       case "JOIN":
//         if (!privateChats.get(payloadData.senderName)) {
//           privateChats.set(payloadData.senderName, []);
//           setPrivateChats(new Map(privateChats));
//         }
//         setPublicChats(prevChats => [
//           ...prevChats,
//           { senderName: "Player", message: `${payloadData.senderName} has joined the chat!`, status: "JOIN" }
//         ]);
//         break;
//       case "MESSAGE":
//         setPublicChats(prevChats => [...prevChats, payloadData]);
//         break;
//       default:
//         break;
//     }
//   };

//   const onPrivateMessage = (payload: any) => {
//     const payloadData = JSON.parse(payload.body);
//     if (privateChats.get(payloadData.senderName)) {
//       privateChats.get(payloadData.senderName)?.push(payloadData);
//       setPrivateChats(new Map(privateChats));
//     } else {
//       let list = [];
//       list.push(payloadData);
//       privateChats.set(payloadData.senderName, list);
//       setPrivateChats(new Map(privateChats));
//     }
//   };

//   const onError = (err: any) => {
//     console.error(err);
//   };

//   const handleMessage = (event: any) => {
//     const { value } = event.target;
//     setUserData({ ...userData, message: value });
//   };

//   const sendValue = () => {
//     if (stompClient) {
//       const chatMessage = {
//         senderName: userData.username,
//         message: userData.message,
//         status: "MESSAGE"
//       };
//       stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//       setUserData({ ...userData, message: "" });
//     }
//   };

//   const sendPrivateValue = () => {
//     if (stompClient) {
//       const chatMessage = {
//         senderName: userData.username,
//         receiverName: tab,
//         message: userData.message,
//         status: "MESSAGE"
//       };

//       if (userData.username !== tab) {
//         privateChats.get(tab)?.push(chatMessage);
//         setPrivateChats(new Map(privateChats));
//       }
//       stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
//       setUserData({ ...userData, message: "" });
//     }
//   };

//   const handleUsername = (event: any) => {
//     const { value } = event.target;
//     setUserData({ ...userData, username: value });
//   };

//   const registerUser = () => {
//     connect();
//   };

//   return (
//     <div className="container">
//       {userData.connected ? (
//         <div className="chat-box">
//           <div className="member-list">
//             <ul>
//               <li onClick={() => setTab("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"}`}>
//                 Chatroom
//               </li>
//               {[...privateChats.keys()].map((name, index) => (
//                 <li
//                   onClick={() => setTab(name)}
//                   className={`member ${tab === name && "active"}`}
//                   key={index}
//                 >
//                   {name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           {tab === "CHATROOM" && (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {publicChats.map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">{chat.message}</div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>
//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="Enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                 />
//                 <button type="button" className="send-button" onClick={sendValue}>
//                   Send
//                 </button>
//               </div>
//             </div>
//           )}
//           {tab !== "CHATROOM" && (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {[...privateChats.get(tab)!].map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">{chat.message}</div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>
//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="Enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                 />
//                 <button type="button" className="send-button" onClick={sendPrivateValue}>
//                   Send
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="register">
//           <input
//             id="user-name"
//             placeholder="Enter your name"
//             name="userName"
//             value={userData.username}
//             onChange={handleUsername}
//             // margin="normal"
//           />
//           <button type="button" onClick={registerUser}>
//             Connect
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatRoom;
