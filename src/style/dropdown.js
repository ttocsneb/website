
let dropdowns = document.getElementsByClassName("dropdown");

for (let dropdown of dropdowns) {
    let toggles = dropdown.getElementsByClassName("dropdown-toggle");
    let menus = dropdown.getElementsByClassName("dropdown-menu");

    let toggleShow = function() {
        for (let menu of menus) {
            if (menu.classList.contains("show")) {
                menu.classList.remove("show");
            } else {
                menu.classList.add("show");
            }
        }
    }

    for (let toggle of toggles) {
        // When any toggle is clicked
        toggle.addEventListener("click", (event) => {
            toggleShow();
        });

    }
}