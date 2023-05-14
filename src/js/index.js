const button = document.getElementById("magic-button")

const actionBar = document.getElementById("action-bar")

const editorWindow = document.getElementById("editor-window")
const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")
const lineNumbers = document.getElementById("line-numbers")

const terminalWindow = document.getElementById("terminal-window")
const terminalCode = document.getElementById("terminal-code")

const files = [{
    "name": "starter-file",
    "tabs": [
        {
            "title": "Untitled",
            "type": "code",
            "text": ""
        },
        {
            "title": "Terminal",
            "type": "terminal",
            "text": ""
        }
    ]
}]

var errors = ""

const log = console.log

function onScroll()
{
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop
    lineNumbers.scrollTop = rawEditor.scrollTop
}

function codeUpdate()
{
    onScroll()
    const styles = styleCode(rawEditor.value) 

    lineNumbers.innerHTML = styles.lined

    rawEditor.style.width    = styles.editorWidth
    stylizedCode.style.width = styles.editorWidth
    rawEditor.style.left     = styles.editorLeft
    stylizedCode.style.left  = styles.editorLeft

    stylizedCode.innerHTML = styles.code

    currentTab.text = rawEditor.value
}

let currentTab;
function setCurrentTab(tab)
{
    currentTab.tab.classList.remove("selected")
    currentTab = tab
    tab.tab.classList.add("selected")

    editorWindow.style.visibility = "hidden"
    terminalWindow.style.visibility = "hidden"

    switch (tab.type)
    {
        case "code":
            rawEditor.value = tab.text
            codeUpdate()
            editorWindow.style.visibility = "visible"
            break;
        case "terminal":
            terminalWindow.style.visibility = "visible"
            break;
    }

    rawEditor.value = tab.text
}

function createTab(tabData)
{
    const tab = document.createElement('span')
    tab.classList.add("edit-font")
    tab.classList.add("action-tab")
    actionBar.appendChild(tab)
    tab.innerHTML = tabData.title
    const data = {
        "tab": tab,
        ...tabData
    }

    tab.onclick = () => setCurrentTab(data)

    tabs.push(data)
}

const tabs = []

files[0].tabs.map(createTab)

currentTab = tabs[0]
setCurrentTab(tabs[0])

rawEditor.oninput = codeUpdate
rawEditor.onscroll = onScroll



const scriptTemplate = `
console.log = (val) => {
    var elem = document.getElementById('errors');
    elem.innerHTML += val+"\\n"
    elem.scrollTop = elem.scrollHeight;
}
{code}
`

button.onclick = () => {
    const script = document.createElement("script")
    script.onerror = (error) => {
        // console.log(error)
    }
    script.innerHTML = scriptTemplate.replace("{code}", rawEditor.value)

    document.body.appendChild(script)
}

window.onerror = (error, url, lineNumber, column, errorObj) => {
    var elem = document.getElementById('errors');
    elem.innerHTML += `<div class="error">${error}</div><div class="error">At line ${lineNumber-6}</div>`
    elem.scrollTop = elem.scrollHeight;
}