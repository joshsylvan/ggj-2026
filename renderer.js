const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
    const response = await window.versions.ping();
    console.log(response);

    window.buzz.setLED(true, true, true, true);
}

func();

const onUpdate = async () => {
    console.log(await window.buzz.getState());
    requestAnimationFrame(() => onUpdate());
};

window.addEventListener('keydown', (event) => {
    window.buzz.onKeyDown(event.code);
});

window.addEventListener('keyup', (event) => {
    window.buzz.onKeyUp(event.code);
});
