var errors = ""

const button = document.getElementById("magic-button")

const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")

const log = console.log

function onScroll()
{
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop

    // log(rawEditor.scrollTop + " " + stylizedCode.scrollTop)
}

function colorCode(text, color)
{
    return `<span style="color: ${color};">${text}</span>`
}

const validIdentifiers = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const stringStarters = "\"`'"

const keywordcolor = "red"
const termcolor = "blue"
const parenthesesColor = 'yellow'
const bracesColor = "purple" 
const operatorcolor = "orange"

const keywords = {
    // Keywords
    "for": keywordcolor,
    "foreach": keywordcolor,
    "let": keywordcolor,
    "const": keywordcolor,
    "var": keywordcolor,
    "function": keywordcolor,

    // Terms
    "document": termcolor,
    "console": termcolor,
    
    // Symbols
    "(": parenthesesColor,
    ")": parenthesesColor,
    "{": bracesColor,
    "}": bracesColor,

    // Operators
    "&": operatorcolor,
    "|": operatorcolor,
    "=": operatorcolor,
    "+": operatorcolor,
    "-": operatorcolor,
    "*": operatorcolor,
    "/": operatorcolor,
    ":": operatorcolor,
}

function isValid(text)
{
    return validIdentifiers.indexOf(text) != -1
}

function removeThans(value)
{
    return value.replaceAll("<", "&lt").replaceAll(">", "&gt")
}

function styleCode(code)
{
    let parts = []
    let i = 0;
    while (true)
    {
        let firstChar = code.substring(i, i+1)

        if (stringStarters.indexOf(firstChar)!=-1)
        {
            let str = firstChar
            let slashCancel
            while(code.length > i+1 && (code.substring(i+1, i+2) != firstChar || slashCancel))
            {
                if (slashCancel)
                    slashCancel = false
                else 
                    slashCancel = code.substring(i+1, i+2)=="\\"
                str += code.substring(i+1, i+2)
                i++;
            }

            if (code.length <= i+1)
            {
                parts.push(str)
                break
            } else {
                parts.push(str+firstChar)
                i += 1;
            }
        }
        else if (isValid(firstChar))
        {
            let indetifierString = firstChar
            while(code.length > i+1 && isValid(code.substring(i+1, i+2)))
            {
                indetifierString += code.substring(i+1, i+2)
                i++;
            }
            parts.push(indetifierString)
        } else {
            parts.push(firstChar)
        }

        i++;
        if (code.length <= i)
            break;

    }

    log(code)
    log(parts)

    let newcode = ""
    parts.map((part) => {

        if (stringStarters.indexOf(part.substring(0, 1)) != -1)
            newcode += colorCode(removeThans(part), "green")
        else if (keywords[part])
            newcode += colorCode(removeThans(part), keywords[part])
        else 
            newcode += removeThans(part)
    })


    return newcode
}

rawEditor.oninput = () => {
    onScroll()
    stylizedCode.innerHTML = styleCode(rawEditor.value) 
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