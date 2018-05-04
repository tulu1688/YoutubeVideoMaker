NotifUtil = function () {};

// Alert types
// 1. alert-success
// 2. alert-info
// 3. alert-warning
// 4. alert-danger

NotifUtil.prototype.showNotification = function (message, alertType, containerId) {
    var node = document.createElement("div");
    node.className = "alert alert-dismissible fade show " + alertType;
    node.setAttribute("role", "alert");
    
    var button = document.createElement("BUTTON");
    button.className = "close";
    button.setAttribute("data-dismiss", "alert");
    button.setAttribute("aria-label", "Close");
    button.setAttribute("type", "button");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.appendChild(document.createTextNode("×"));
    button.appendChild(span);
    
    var newContent = document.createTextNode(message);
    node.appendChild(button);
    node.appendChild(newContent);

    document.getElementById(containerId).appendChild(node);
}

module.exports = new NotifUtil();
