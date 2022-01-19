const socket = io()

//Elements
const $messageForm = document.querySelector("#msgForm")
const $messageInput = $messageForm.querySelector("input")
const $messageButton = $messageForm.querySelector("button")
const $URLButton = document.querySelector("#sendURL")
const $messages = document.querySelector("#messages")

//Templates
const msgTemplate = document.querySelector("#msgTemplate").innerHTML
const urlTemplate = document.querySelector("#urlTemplate").innerHTML
const boldTemplate = document.querySelector("#boldTemplate").innerHTML
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New element
    const $newMessage = $messages.lastElementChild
    
    //Get height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //scroll distance
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on("message", (message) => {
    var msg = message.text
    if(msg.indexOf("&") === 0){
        if(msg.charAt(1) === 'b'){
            msg = msg.slice(2)
            const html = Mustache.render(boldTemplate, {
                username: message.username,
                message: msg,
                createdAt: moment(message.createdAt).format("h:mm A")
            })
            $messages.insertAdjacentHTML("beforeend", html)
            autoscroll()
        }
    }else{
        //Render normal message
        const html = Mustache.render(msgTemplate, {
            username: message.username,
            message: msg,
            createdAt: moment(message.createdAt).format("h:mm A")
        })
        $messages.insertAdjacentHTML("beforeend", html)
        autoscroll()
    }
})

socket.on("URL", (message) => {
    //console.log(message)
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm A")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()

    $messageButton.setAttribute("disabled", "disabled")

    const msg = $messageInput.value

    socket.emit("sendMessage", msg, (error) => {
        $messageButton.removeAttribute("disabled")
        $messageInput.value = ""
        $messageInput.focus()

        if(error){
            return console.log(error)
        }
        //console.log("Message sent")
    })
})

$URLButton.addEventListener("click", (e) => {
    e.preventDefault()

    $URLButton.setAttribute("disabled", "disabled")

    const msg = $messageInput.value

    socket.emit("sendURL", msg, (error) => {
        $URLButton.removeAttribute("disabled")
        $messageInput.value = ""
        $messageInput.focus()

        if(error){
            return console.log(error)
        }
        //console.log("URL sent")
    })
})

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})

// socket.on("countUpdated", (count) => {
//     console.log("The Count has been updated!", count)
// })

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("Clicked")
//     socket.emit("increment")
// })
