let pwShown = false;

function toggle(field) {
    const element = document.getElementById(field);
    pwShown = !pwShown || false;
    element.setAttribute('type', pwShown ? 'text' : 'password');
}