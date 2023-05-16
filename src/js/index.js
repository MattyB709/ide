// Getting HTML Elements
const actionBar = document.getElementById("action-bar")
const runButton = document.getElementById("run-button")
const clearButton = document.getElementById("clear-button")

const sideBar = document.getElementById("side-bar")
const sideBarNewFile = document.getElementById('side-bar-new-file')

const editorWindow = document.getElementById("editor-window")
const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")
const lineNumbers = document.getElementById("line-numbers")

const terminalWindow = document.getElementById("terminal-window")
const terminalCode = document.getElementById("terminal-code")

//  Files and Tabs data setUp
const fileObjects = {};
const tabObjects = []

let currentTab;

let files;
const tabs = []

// The default files if no previous data exists
const defaultFiles = JSON.stringify({
    "starter-file.js": `console.log("Hello World!");`
})

// Storing the original log function as it will be overwritten later
const log = console.log

const storageKey = "key:0.0"

// Reading files
files = JSON.parse(window.localStorage.getItem(storageKey) || defaultFiles)

function fileUpdate(filename)
{
    // Storing data
    window.localStorage.setItem(storageKey, JSON.stringify(files))
}

function onScroll()
{
    // Matching Scroll values
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop
    lineNumbers.scrollTop = rawEditor.scrollTop
}

// Whenever to code tab is updated
function codeUpdate()
{
    // File saving
    files[currentTab.data.file] = rawEditor.value
    fileUpdate(currentTab.file)

    onScroll()

    // styling the tab
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
        // Updating the terminal
        terminalCode.innerHTML = tab.data.text
        terminalCode.scrollTop = terminalCode.scrollHeight;
    }
}

const visibleButtons = {
    "clear": {
        "button": clearButton,
        "terminal": true,
        "code": false
    },
    "run": {
        "button": runButton,
        "terminal": true,
        "code": true
    }
}

function setCurrentTab(tab)
{
    // Unselecting current tav
    if (currentTab)
        currentTab.tab.classList.remove("selected")

    currentTab = tab

    // Hiding the windows
    editorWindow.style.visibility = "hidden"
    terminalWindow.style.visibility = "hidden"
    // return

    let tabType = tab && tab.data.type

    Object.keys(visibleButtons).map((button) => {
        visibleButtons[button].button.style.visibility = visibleButtons[button][tabType]? "visible":"hidden"
    })

    if (tab == undefined)
        return
        

    tab.tab.classList.add("selected")

    switch (tabType)
    {
        case "code":
            // Code
            rawEditor.value = files[tab.data.file]
            codeUpdate()
            editorWindow.style.visibility = "visible"
            break;
        case "terminal":
            // Terminal
            updateTerminal();
            terminalWindow.style.visibility = "visible"
            break;
    }

    rawEditor.value = tab.text
}

setCurrentTab()

// Creating the sidebar file div
function createFileObj(filename)
{
    const div = document.createElement("div")
    div.classList.add("side-bar-file")
    div.innerHTML = filename

    // Select tab
    div.onclick = () => {
        // Checking if tab exists
        let tab;
        tabObjects.map((tabObj) => {
            if (tabObj.data.file == filename && tabObj.data.type == "code")
                tab = tabObj
        })

        if (tab != undefined)
        {
            // Already exists
            setCurrentTab(tab)
        } else {

            // If tab doesnt exist then create it

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
    // Tab data
    const data = {
        "tab": tab,
        "data": tabData
    }

    // X button on the side
    const xButton = document.createElement("div")
    xButton.classList.add("action-bar-tab-x")
    xButton.onclick = (e) => {
        tabs.splice(tabs.indexOf(tabData), 1)
        tabObjects.splice(tabObjects.indexOf(data), 1)
        tab.remove()

        e.stopPropagation()
        
        if (currentTab == data)
        {
            setCurrentTab()
        }
    }

    tab.appendChild(xButton)

    // On click switch to tab
    tab.onclick = () => setCurrentTab(data)

    tabObjects.push(data)

    return data
}

tabs.map(createTabObj)
Object.keys(files).map(createFileObj)

rawEditor.oninput = codeUpdate
rawEditor.onscroll = onScroll

// Template used when creating a script
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

// Clears a terminal
clearButton.onclick = () => {
    if (currentTab && currentTab.data.type == "terminal")
    {
        currentTab.data.text = ""
        updateTerminal(currentTab)
    }
}

function logTo(terminal, ...value)
{
    // Finding Terminal
    let tab
    tabObjects.map((ttab) => {
        if (terminal == ttab.data.file && ttab.data.type == "terminal")
            tab = ttab
    })

    // log(tab)

    if (!tab)
        return;

    tab.data.text += value+"\n"
    updateTerminal(tab)
}

// Creates the GUI for the creation of a new file
function newFileGui()
{
    let created = false
    const div = document.createElement("input")
    div.type = "text"
    div.classList.add("side-bar-file-creation")
    sideBar.appendChild(div)
    div.focus()
    
    // Creates the file
    function launchCreation()
    {
        if (div.value == "")
            return

        if (created)
            return
        created = true

        let fileName = NewFileName(files, div.value)

        files[fileName] = ""
        createFileObj(fileName)
        div.remove()
    }

    div.onkeydown = (e) => {
        if (e.key == "Enter")
            launchCreation()
    }
    div.onblur = launchCreation
}

sideBarNewFile.onclick = newFileGui

// When a script errors the terminal will pick it up
window.onerror = (error, url, lineNumber, column, errorObj) => {
    logTo(currentTab.data.file, `<div class="error">${error}</div><div class="error">At line ${lineNumber-5}</div>`)
}
