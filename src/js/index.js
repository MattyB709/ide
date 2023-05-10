const textBox = document.getElementById("text-box")

var errors = ""

const button = document.getElementById("magic-button")

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
    script.innerHTML = scriptTemplate.replace("{code}", textBox.value)

    document.body.appendChild(script)
}

window.onerror = (error, url, lineNumber, column, errorObj) => {
    var elem = document.getElementById('errors');
    elem.innerHTML += `<div class="error">${error}</div><div class="error">At line ${lineNumber-6}</div>`
    elem.scrollTop = elem.scrollHeight;
}