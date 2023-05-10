const textBox = document.getElementById("text-box")

var errors = ""


textBox.oninput = () => {
    console.log(textBox.value)
}

const button = document.getElementById("magic-button")

const scriptTemplate = `
document.getElementById("errors").innerHTML = ""
try {
    {code}
} catch (error) {
    document.getElementById("errors").innerHTML = error
}
`

// console.log = () => {}

button.onclick = () => {
    const script = document.createElement("script")
    script.onerror = (error) => {
        console.log(error)
    }
    script.innerHTML = textBox.value// scriptTemplate.replace("{code}", textBox.value)

    document.body.appendChild(script)
}

window.onerror = (error) => {
    document.getElementById("errors").innerHTML += error+"\n"
    var elem = document.getElementById('data');
  elem.scrollTop = elem.scrollHeight;
}