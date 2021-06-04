const http=require('http');
const express = require ('express');
const path=require('path');
const botName="ADMIN"
const format =require ('./utiles/messages');
const socketio=require('socket.io')
const app= express();
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utiles/users')
const server=http.createServer(app);
const io=socketio(server);
//set static folder 
app.use(express.static(path.join(__dirname,'public')))
const PORT =3000 || process.env.PORT;
//Run when Client connects
io.on("connection",socket=>{
socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room)
   socket.join(user.room)


//Welcome current user
socket.emit("message",format(botName,"Welcome to Chat!"));

    //when a user connects
    socket.broadcast.to(user.room).emit('message',format(botName,`${user.username} has joined the chat`));
    //Send users and room info
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    })
})
  
 
    //List for chatMessage
    socket.on("chatMessage",(msg)=>{
        const user=getCurrentUser(socket.id)
   io.to(user.room).emit("message",format(user.username,msg))
    })

       //Runs when client disconnect
       socket.on("disconnect",()=>{
           const user=userLeave(socket.id);
           if(user){
               io.to(user.room).emit("message",format(botName,`${user.username} has left the chat`))
 //Send users and room info
 io.to(user.room).emit('roomUsers',{
    room:user.room,
    users:getRoomUsers(user.room)
})
           }
    })
})
// formatMessages("hbj","Welcome to Chat!")
server.listen(PORT,()=>console.log(`Server running on port ${PORT}`))