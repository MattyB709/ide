const button = document.getElementById("magic-button")

const actionBar = document.getElementById("action-bar")
const runButton = document.getElementById("run-button")

const sideBar = document.getElementById("side-bar")

const editorWindow = document.getElementById("editor-window")
const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")
const lineNumbers = document.getElementById("line-numbers")

const terminalWindow = document.getElementById("terminal-window")
const terminalCode = document.getElementById("terminal-code")

const fileObjects = {}
const tabObjects = []

let currentTab;

const files = {
    "starter-file.js": `console.log("Hello World!");`
}

const tabs =[
    // {
    //     "title": "Untitled",
    //     "type": "code",
    //     "file": "starter-file.js",
    // },
    // {
    //     "title": "Terminal",
    //     "type": "terminal",
    //     "text": ""
    // }
]

var errors = ""

const log = console.log

function fileUpdate(filename)
{

}

function onScroll()
{
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop
    lineNumbers.scrollTop = rawEditor.scrollTop
}

function codeUpdate()
{
    files[currentTab.data.file] = rawEditor.value
    fileUpdate(currentTab.file)

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

function updateTerminal(tab)
{
    if (currentTab == tab)
    {
        terminalCode.innerHTML = tab.data.text
        terminalCode.scrollTop = terminalCode.scrollHeight;
    }
}

function setCurrentTab(tab)
{
    if (currentTab)
        currentTab.tab.classList.remove("selected")
    currentTab = tab
    tab.tab.classList.add("selected")

    editorWindow.style.visibility = "hidden"
    terminalWindow.style.visibility = "hidden"

    switch (tab.data.type)
    {
        case "code":
            rawEditor.value = files[tab.data.file]
            codeUpdate()
            editorWindow.style.visibility = "visible"
            break;
        case "terminal":
            updateTerminal();
            terminalWindow.style.visibility = "visible"
            break;
    }

    rawEditor.value = tab.text
}

function createFileObj(filename)
{
    const div = document.createElement("div")
    div.classList.add("side-bar-file")
    div.innerHTML = filename
    div.onclick = () => {
        // Checking if tab exists
        let tab;
        tabObjects.map((tabObj) => {
            if (tabObj.data.file == filename && tabObj.data.type == "code")
                tab = tabObj
        })

        if (tab != undefined)
        {
            // Already esistx
            setCurrentTab(tab)
        } else {
            const newTab = {
                "type": "code",
                "title": filename,
                "file": filename,
            }

            tabs.push(newTab)
            const tabObj = createTabObj(newTab)
            setCurrentTab(tabObj)
        }
    }

    sideBar.appendChild(div)
}

function createTabObj(tabData)
{
    const tab = document.createElement('span')
    tab.classList.add("edit-font")
    tab.classList.add("action-tab")
    actionBar.appendChild(tab)
    tab.innerHTML = tabData.title
    const data = {
        "tab": tab,
        "data": tabData
    }

    tab.onclick = () => setCurrentTab(data)

    tabObjects.push(data)

    return data
}

tabs.map(createTabObj)
Object.keys(files).map(createFileObj)

rawEditor.oninput = codeUpdate
rawEditor.onscroll = onScroll

const scriptTemplate = `
console.log = (val) => {
    logTo("{terminal}", val)
}
console.log("Started Running {terminal}\\n");
{code}
console.log("\\n{terminal} has Finished Running\\n");
`

runButton.onclick = () => {
    // Tab stuff
    let tab
    let fileToRun
    if (currentTab && currentTab.data.type == "terminal")
    {
        if (currentTab.data.file)
        {
            tab = currentTab
            fileToRun = currentTab.data.file
        }
    } else if (currentTab && currentTab.data.type == "code") {
        if (currentTab.data.file)
        {
            fileToRun = currentTab.data.file

            // Searching for tab
            tabObjects.map((ttab) => {
                if (ttab.data.type == "terminal" && ttab.data.file == fileToRun)   
                    tab = ttab
            })
            if (tab == undefined)
            {
                const newTab = {
                    "type": "terminal",
                    "title": "output:"+fileToRun,
                    "text": "",
                    "file": fileToRun
                }

                tab = createTabObj(newTab)
            }
        }
    }

    if (!tab || !fileToRun)
        return;
    
    setCurrentTab(tab)

    // Running File
    const script = document.createElement("script")
    let code = scriptTemplate.replaceAll("{code}", files[fileToRun])
    code = code.replaceAll("{terminal}",  fileToRun)
    script.innerHTML = code
    script.crossorigin = "test"
    document.body.appendChild(script)
}

function logTo(terminal, ...value)
{
    // Finding Terminal
    let tab
    tabObjects.map((ttab) => {
        if (terminal == ttab.data.file && ttab.data.type == "terminal")
        {
            tab = ttab
        }
    })

    log(tab)

    if (!tab)
        return;

    tab.data.text += value+"\n"
    updateTerminal(tab)
}

window.onerror = (error, url, lineNumber, column, errorObj) => {
    logTo(currentTab.data.file, `<div class="error">${error}</div><div class="error">At line ${lineNumber-5}</div>`)
}