function addCustomEventListener(selector, event, handler) {
    let rootElement = document.querySelector('body');
    //since the root element is set to be body for our current dealings
    rootElement.addEventListener(event, function (evt) {
            var targetElement = evt.target;
            while (targetElement != null) {
                if (targetElement.matches(selector)) {
                    handler(evt);
                    return;
                }
                targetElement = targetElement.parentElement;
            }
        },
        true
    );
}

addCustomEventListener(".dropdown .dropdown-toggle", 'click', (event) => {
    let menus = event.target.parentElement.getElementsByClassName("dropdown-menu");

    for (let menu of menus) {
        if (menu.classList.contains("show")) {
            menu.classList.remove("show");
        } else {
            menu.classList.add("show");
        }
    }
});