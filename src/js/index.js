var errors = ""

const button = document.getElementById("magic-button")

const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")

const log = console.log

function onScroll()
{
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop

    log(rawEditor.scrollTop + " " + stylizedCode.scrollTop)
}

rawEditor.oninput = () => {
    onScroll()
    stylizedCode.innerHTML = rawEditor.value
}

rawEditor.onscroll = onScroll



const scriptTemplate = `
console.log = (val) => {
    var elem = document.getElementById('errors');
    elem.innerHTML += val+"\\n"
    elem.scrollTop = elem.scrollHeight;
}
{code}
`
// console.log = () => {}

button.onclick = () => {
    const script = document.createElement("script")
    script.onerror = (error) => {
        console.log(error)
    }
    script.innerHTML = scriptTemplate.replace("{code}", rawEditor.value)

    document.body.appendChild(script)
}

window.onerror = (error, url, lineNumber, column, errorObj) => {
    var elem = document.getElementById('errors');
    elem.innerHTML += `<div class="error">${error}</div><div class="error">At line ${lineNumber-6}</div>`
    elem.scrollTop = elem.scrollHeight;
}