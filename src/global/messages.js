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

        var messagePanel = new Panel($(window).width() / 2 - 200, $(window).height() / 2 - 200, 400, 400, 'Messages - ' + channel.name, messagePanelWrapper.html());
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

        var isPanelOpen = panel.panel.panel.css('opacity') == 1;
        if (!isPanelOpen) {
            showAlert("New Message", "<div class='learnplus-text-2'>You have a new message in " + data.channel + ".</div>");
        }
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

var createChannelPanel = new Panel($(window).width() / 2 - 200, $(window).height() / 2 - 200, 400, 400, 'Create Channel', `
    <div class="create-channel-panel">
        <div class="create-channel-panel-title learnplus-text-1 learnplus-text-large">Create Channel</div>
        <div class="create-channel-panel-inputs">
            <div class="create-channel-panel-input learnplus-mt-20">
                <div class="create-channel-panel-input-title learnplus-text-2">Channel Name</div>
                <input type="text" class="create-channel-panel-input-input learnplus-input-1" placeholder="Channel Name">
            </div>
            <div class="create-channel-panel-input learnplus-mt-10">
                <div class="create-channel-panel-input-title learnplus-text-2">Channel Password (Optional)</div>
                <input type="text" class="create-channel-panel-input-input learnplus-input-1" placeholder="Channel Password">
            </div>
        </div>
        <div class="create-channel-panel-buttons">
            <div class="create-channel-panel-button learnplus-button-1">Create Channel</div>
        </div>
    </div>
`);

createChannelPanel.create();

function createChannel() {
    var name = $('.create-channel-panel-input-input').eq(0).val();
    var password = $('.create-channel-panel-input-input').eq(1).val();

    socket.emit('createChannel', { name: name, password: password }, (res) => {
        console.log(res);
        if (res.success) {
            createChannelPanel.close();
            socket.emit('joinChannel', { id: "" + res, password: password }, (res) => {
                if (res.success) {
                    showAlert("Information", `
                    <div style="display: flex; flex-direction: column">
                        <div class='learnplus-text-2'>New channel created!\n</div>
                        <div class='learnplus-text-3'>Please refresh the page to see the new channel.</div>
                    </div>
                    `);
                } else {
                    showAlert("Error", "<div class='learnplus-text-2'>" + res.error + "</div>");
                }
            });
        } else {
            showAlert("Error", "<div class='learnplus-text-2'>" + res.error + "</div>");
        }
    });
}

var button = createChannelPanel.panel.find('.create-channel-panel-button');
button.on('click', () => {
    createChannel();
});
