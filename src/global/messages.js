var messagePanels = [ ];

function findPanel(channel) {
    return messagePanels.find((p) => p.channel == channel);
}

loginCallbacks.push((account) => {
    var channels = account.channels;
    var i = 0;
    
    channels.forEach((channel) => {
        var messagePanelContents = $(`<div class="message-panel-list"></div>`);
        var messagePanelInput = $(`<input type="text" class="message-panel-input learnplus-input-1 learnplus-mt-20" placeholder="Message...">`);
        var messagePanelWrapper = $(`<div class="message-panel-wrapper"></div>`);
        messagePanelWrapper.append(messagePanelContents);
        messagePanelWrapper.append(messagePanelInput);

        var messagePanel = new Panel($(window).width() / 2 - 200, $(window).height() / 2 - 200, 400, 400, 'Message', messagePanelWrapper.html());
        messagePanel.create();
        messagePanel.channel = channels[i];

        var panelInput = messagePanel.panel.find('.message-panel-input');
        panelInput.on('keydown', (e) => {
            if (e.key == 'Enter') {
                console.log("test", messagePanel.channel, e.target.value);
                sendMessage(messagePanel.channel, e.target.value);
                e.target.value = '';
            }
        });

        getMessages(channels[i], 50, (messages) => {
            var newContents = $(`<div class="message-panel-list"></div>`);
            messagePanel.panel.find('.message-panel-list').replaceWith(newContents);
            messagePanelContents = newContents;

            for (var i = 0; i < messages.length; i++) {
                console.log(messages[i])
                var message = $(`<div class="message-panel-message learnplus-mt-10"></div>`);
                var messageText = $(`<div class="message-panel-message-text"></div>`);
                var messageAuthor = $(`<div class="message-panel-message-author"></div>`);
                messageText.text(messages[i].message);
                messageAuthor.text(messages[i].username);
                message.append(messageAuthor);
                message.append(messageText);
                messagePanelContents.append(message);
                messagePanelContents.parent().scrollTop(messagePanelContents.height());    
            }
        });

        messagePanels.push({
            channel: channels[i],
            panel: messagePanel
        });

        i++;
    });
});

socket.on('newMessage', (data) => {
    var panel = findPanel(data.channel);
    
    if (panel) {
        var message = $(`<div class="message-panel-message learnplus-mt-10"></div>`);
        var messageText = $(`<div class="message-panel-message-text"></div>`);
        var messageAuthor = $(`<div class="message-panel-message-author"></div>`);
        messageText.text(data.message);
        messageAuthor.text(data.username);
        message.append(messageAuthor);
        message.append(messageText);
        
        var messagePanelContents = panel.panel.panel.find('.message-panel-list');
        messagePanelContents.append(message);
        messagePanelContents.parent().scrollTop(messagePanelContents.height());
    }
});

function sendMessage(channel, message) {
    socket.emit('sendMessage', { id: channel, message: message }, (res) => { });
}

function getMessages(channel, amount, callback) {
    socket.emit('getMessages', { id: channel, amount: amount }, (res) => {
        if (res.success) callback(res.data);
    });
}
