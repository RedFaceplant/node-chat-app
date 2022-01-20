const socket = io()

//Elements
const $messageForm = document.querySelector("#msgForm")
const $messageInput = $messageForm.querySelector("input")
const $messageButton = $messageForm.querySelector("button")
const $messages = document.querySelector("#messages")

//Templates
const msgTemplate = document.querySelector("#msgTemplate").innerHTML
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//Help message
const helpMessage = `&h: Brings up this menu<br>&b: Bold text<br>&l: Make your text into a hyperlink<br>
    &i: Italic text<br>`

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
    const renderTemplate = (template) => {
        const html = Mustache.render(template, {
            username: message.username,
            message: msg,
            createdAt: moment(message.createdAt).format("h:mm A")
        })
        $messages.insertAdjacentHTML("beforeend", html)
        autoscroll()
    }

    var msg = message.text
    if(msg.indexOf("&") === 0){
        if(msg.charAt(1) === 'b'){
            //Bold message
            msg = msg.slice(2)
            msg = "<b>"+msg+"</b>"
        }
        if(msg.charAt(1) === 'i'){
            //Bold message
            msg = msg.slice(2)
            msg = "<em>"+msg+"</em>"
        }
        if(msg.charAt(1) === 'l'){
            //Link message
            msg = msg.slice(2)
            msg = '<a href='+msg+' target="_blank">'+msg+'</a>'
        }
        if(msg.charAt(1) === 'h'){
            //Help message
            message.username = "Server"
            msg = helpMessage
        }
    }
    //Normal message
    renderTemplate(msgTemplate)
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

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})
