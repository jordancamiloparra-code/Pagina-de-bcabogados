document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatWindow = document.getElementById('chat-window');
    const leadForm = document.getElementById('lead-form');
    const leadFormContainer = document.getElementById('lead-form-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatFooter = document.getElementById('chat-footer');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatBody = document.getElementById('chat-body');

    // --- Configuración OpenAI ---
    // Advertencia: Esta clave está expuesta en el Frontend.
    const OPENAI_API_KEY = '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';
    
    // Historial de conversación para dar contexto a la IA
    let conversationHistory = [
        {
            role: "system",
            content: `Eres un asistente virtual experto en leyes de la firma "BC Abogados" en Colombia (ubicados en el Centro Internacional de Bogotá, Oficina 101).
Tus áreas de especialidad son: Derecho Laboral, Derecho Pensional, Derecho Comercial/Empresas, Derecho de Familia y Documentos Jurídicos.
Tu objetivo principal es responder amablemente a las dudas legales del usuario, demostrar amplio conocimiento, pero SIEMPRE invitarlos a que soliciten una "asesoría gratis sin costo" a través de WhatsApp al número +57 3018344242 para revisar su caso a fondo.
Sé conciso, profesional y persuasivo.`
        }
    ];

    // --- Lógica UI: Abrir y Cerrar Chat ---
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // --- Lógica UI: Captura de Leads (Formulario) ---
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener datos (aquí se podrían enviar a una base de datos o correo si se deseara)
        const email = document.getElementById('chat-email').value;
        const phone = document.getElementById('chat-phone').value;
        
        console.log("Lead capturado:", { email, phone });

        // Ocultar formulario y mostrar chat
        leadFormContainer.style.display = 'none';
        chatMessages.style.display = 'flex';
        chatFooter.style.display = 'flex';
        
        // Enfocar el input
        setTimeout(() => chatInput.focus(), 100);
    });

    // --- Lógica del Chat ---
    const addMessageToChat = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    };

    const addTypingIndicator = () => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('typing-indicator');
        indicatorDiv.id = 'typing-indicator';
        indicatorDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicatorDiv);
        scrollToBottom();
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    const scrollToBottom = () => {
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const handleSendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Añadir mensaje del usuario
        addMessageToChat(text, 'user');
        chatInput.value = '';
        
        // Actualizar historial
        conversationHistory.push({ role: "user", content: text });

        // Mostrar indicador de "escribiendo"
        addTypingIndicator();

        try {
            // Llamada a la API de OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // Se puede usar gpt-4 si la key lo soporta
                    messages: conversationHistory,
                    max_tokens: 250,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('Error en la API de OpenAI');
            }

            const data = await response.json();
            const botReply = data.choices[0].message.content;

            // Remover indicador y mostrar respuesta
            removeTypingIndicator();
            addMessageToChat(botReply, 'bot');

            // Actualizar historial con la respuesta del bot
            conversationHistory.push({ role: "assistant", content: botReply });

        } catch (error) {
            console.error(error);
            removeTypingIndicator();
            addMessageToChat("Lo siento, estoy teniendo problemas de conexión en este momento. Por favor, contáctanos directamente a nuestro WhatsApp +57 3018344242 para tu asesoría gratis.", 'bot');
        }
    };

    // Eventos de envío
    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
