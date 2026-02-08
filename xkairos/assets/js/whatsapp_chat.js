// WhatsApp Chat Integration
document.addEventListener('DOMContentLoaded', function() {
    // Create floating chat button
    const chatButton = document.createElement('div');
    chatButton.id = 'whatsapp-chat-button';
    chatButton.innerHTML = `
        <a href="https://wa.me/351912345678?text=Olá, preciso de ajuda com meu PC!" target="_blank" style="text-decoration: none;">
            <img src="https://img.icons8.com/color/48/000000/whatsapp.png" alt="WhatsApp" style="width: 50px; height: 50px;">
        </a>
    `;
    chatButton.style.position = 'fixed';
    chatButton.style.bottom = '20px';
    chatButton.style.right = '20px';
    chatButton.style.zIndex = '1000';
    chatButton.style.cursor = 'pointer';

    // Add notification badge
    const notificationBadge = document.createElement('div');
    notificationBadge.id = 'whatsapp-notification';
    notificationBadge.innerText = '1';
    notificationBadge.style.position = 'absolute';
    notificationBadge.style.top = '-10px';
    notificationBadge.style.right = '-10px';
    notificationBadge.style.backgroundColor = 'red';
    notificationBadge.style.color = 'white';
    notificationBadge.style.borderRadius = '50%';
    notificationBadge.style.width = '20px';
    notificationBadge.style.height = '20px';
    notificationBadge.style.display = 'flex';
    notificationBadge.style.alignItems = 'center';
    notificationBadge.style.justifyContent = 'center';
    notificationBadge.style.fontSize = '12px';
    notificationBadge.style.fontWeight = 'bold';
    chatButton.appendChild(notificationBadge);

    // Simulate real-time notification (for demo)
    setTimeout(() => {
        notificationBadge.style.display = 'none'; // Hide after 5 seconds
    }, 5000);

    // Append to body
    document.body.appendChild(chatButton);

    // Simulate message sending (for demo)
    chatButton.addEventListener('click', function() {
        console.log('Mensagem enviada para WhatsApp: Olá, preciso de ajuda com meu PC!');
        // In production, integrate with WhatsApp Business API for real-time messaging
    });
});
