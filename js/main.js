// Inicializar Artyom
const artyom = new Artyom();

artyom.addCommands({
    indexes: ['*'], // Captura cualquier entrada de voz
    smart: true,
    action: function(i, wildcard) {
        const userInputField = document.getElementById('user-input');
        userInputField.value = wildcard.trim(); // Actualiza el campo de entrada con la palabra reconocida
        console.log(`Palabra reconocida: ${wildcard}`);
        sendMessage(); // Envía el mensaje después de cada palabra reconocida    
    }
});

function startArtyom() {
    artyom.initialize({
        lang: "es-ES",
        continuous: false,
        listen: true,
        debug: true,
        speed: 1
    }).then(function() {
        console.log("Artyom ha comenzado a escuchar.");
    }).catch(function(err) {
        console.error("Ocurrió un error al iniciar Artyom:", err);
    });
}

// Función para enviar el post al modelo de Ollama usando AJAX
function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    console.log(`Enviar mensaje: ${userInput}`);

    if (userInput.trim() === "") {
        alert("Por favor, ingresa un mensaje antes de enviar.");
        return;
    }

    var chatMessages = document.getElementById('chat-messages');

    var userMessage = document.createElement('div');
    userMessage.className = 'message user-message';

    var userAvatar = document.createElement('img');
    userAvatar.className = 'avatar';
    userAvatar.src = './logo.png'; // URL de la imagen del avatar del usuario

    var userMessageContent = document.createElement('div');

    var userMessageText = document.createElement('span');
    userMessageText.textContent = userInput;

    var timeElement = document.createElement('span');
    timeElement.className = 'message-time';
    timeElement.textContent = getCurrentTime();

    userMessageContent.appendChild(userMessageText);
    userMessage.appendChild(userAvatar);
    userMessage.appendChild(userMessageContent);
    userMessage.appendChild(timeElement);

    chatMessages.appendChild(userMessage);
    scrollChatToBottom();

    enviarPost(userInput);
}

function enviarPost(inputText) {
    artyom.listen = false;
    console.log(`Enviar post con texto: ${inputText}`);
    artyom.continuous = false;

    const postData = {
        model: "TheBloke/CodeLlama-7B-Instruct-GGUF",
        messages: [
            { role: "system", content: "Eres el doctor Ollama, un especialista en todos los campos de la medicina, tu deber es remplazar a un médico resetando medicamentos, dando posibles diagnosticos y respondiendo preguntas. Responde siempre en español" },
            { role: "user", content: inputText }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
    };

    const jsonData = JSON.stringify(postData);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:1234/v1/chat/completions', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            if (response.choices && response.choices[0] && response.choices[0].message) {
                const respuesta = response.choices[0].message.content.trim();
                console.log("Respuesta del servidor:", respuesta);

                var chatMessages = document.getElementById('chat-messages');

                var doctorMessage = document.createElement('div');
                doctorMessage.className = 'message doctor-message';

                var doctorAvatar = document.createElement('img');
                doctorAvatar.className = 'avatar';
                doctorAvatar.src = './salud.png'; // Avatar del doctor

                var doctorMessageContent = document.createElement('div');

                var doctorMessageText = document.createElement('span');
                doctorMessageText.textContent = respuesta;

                var timeElement = document.createElement('span');
                timeElement.className = 'message-time';
                timeElement.textContent = getCurrentTime();
                doctorMessageContent.appendChild(doctorMessageText);
                doctorMessage.appendChild(doctorAvatar);
                doctorMessage.appendChild(doctorMessageContent);
                doctorMessage.appendChild(timeElement);
                chatMessages.appendChild(doctorMessage);
                scrollChatToBottom();

                artyom.say(respuesta, {
                    onStart: function() {
                        console.log("Artyom ha comenzado a hablar.");
                    },
                    onEnd: function() {
                        console.log("Artyom ha terminado de hablar.");
                        // Reanudar la escucha de Artyom después de que haya terminado de hablar
                        artyom.initialize({
                            continuous: true,
                            obeyKeyword: "voz" // Este es el comando que inicia la escucha
                        });
                    }
                });
            } else {
                console.error("No se encontró texto en la respuesta.");
            }
        } else {
            console.error("Error al enviar el post:", xhr.statusText);
        }
    };

    xhr.send(jsonData);
    artyom.initialize({
        continuous: false,
        obeyKeyword: null
    });
}

function scrollChatToBottom() {
    var chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getCurrentTime() {
    var now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
}

// Event listener para iniciar Artyom cuando se haga clic en el botón de voz
document.getElementById('voz').addEventListener('click', startArtyom);

function startCamera() {
    var cameraStream = document.getElementById('camera-stream');
    cameraStream.src = "http://localhost:8000/video";
}
