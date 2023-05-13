var errors = ""

const button = document.getElementById("magic-button")

const rawEditor = document.getElementById("editing")
const stylizedCode = document.getElementById("code")
const lineNumbers = document.getElementById("line-numbers")

const log = console.log

function onScroll()
{
    stylizedCode.scrollLeft = rawEditor.scrollLeft
    stylizedCode.scrollTop = rawEditor.scrollTop
    lineNumbers.scrollTop = rawEditor.scrollTop

    // log(rawEditor.scrollTop + " " + stylizedCode.scrollTop)
}

function colorCode(text, color)
{
    return `<span style="color: ${color};">${text}</span>`
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
  
  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

const validIdentifiers = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const stringStarters = "\"`'"

const keywordcolor = "red"
const termcolor = "blue"
const parenthesesColor = 'yellow'
const bracesColor = "#ae3fbf" 
const operatorcolor = "orange"
const stringColor = "#86eb93"
const commentColor = "grey"
const propertyColor = "#86ceeb"
const lineColor = "red"

const keywords = {
    // Keywords
    "for": keywordcolor,
    "foreach": keywordcolor,
    "let": keywordcolor,
    "const": keywordcolor,
    "var": keywordcolor,
    "function": keywordcolor,
    "if": keywordcolor,
    "else": keywordcolor,
    "return": keywordcolor,

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
    ".": operatorcolor,
    ";": operatorcolor,
}

function isValidChar(text)
{
    return validIdentifiers.indexOf(text) != -1
}

function isValidString(text)
{
    for (let i = 0; i < text.length; i++)
    {
        if (!isValidChar(text.substring(i, i+1)))
            return false;
    }
    return true
}

function removeThans(value)
{
    return value.replaceAll("<", "&lt").replaceAll(">", "&gt")
}

const commentEndings = {"//": "\n", "/*": "*/"}

function styleCode(code)
{
    let parts = []
    let i = 0;
    while (true)
    {
        let firstChar = code.substring(i, i+1)

        
        // Comments
        if (code.length > i+1 && commentEndings[code.substring(i, i+2)] != undefined)
        {
            let ending = commentEndings[code.substring(i, i+2)]
            let end = code.indexOf(ending, i)

            if (end == -1)
            {
                // Sad ending
                let str = code.substring(i, code.length)
                parts.push(str)
                i+=str.length;
            } else {
                let str = code.substring(i, end+ending.length)
                parts.push(str)
                i+=str.length-1;
            }
        }
        // Strings
        else if (stringStarters.indexOf(firstChar)!=-1)
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
        else if (isValidChar(firstChar))
        {
            let indetifierString = firstChar
            while(code.length > i+1 && isValidChar(code.substring(i+1, i+2)))
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

    // log(code)
    // log(parts)

    let newcode = ""
    for (let i = 0; i < parts.length; i++)
    {
        const part = parts[i]
        const prepart = i > 0 && parts[i-1]
        if (part.length > 1 && commentEndings[part.substring(0, 2)])
            newcode += colorCode(removeThans(part), commentColor)
        else if (stringStarters.indexOf(part.substring(0, 1)) != -1)
            // Strings
            newcode += colorCode(removeThans(part), stringColor)
        else if (keywords[part])
            // Keywords and stuff
            newcode += colorCode(removeThans(part), keywords[part])
        else if (isValidString(part) && prepart==".")
            // Stuff after the dot
            newcode += colorCode(removeThans(part), propertyColor)
        else 
            // Normal
            newcode += removeThans(part)
    }

    // Line Numbers
    const lineCount = (newcode.match(/\n/g) || []).length+1;
    const spaceCount = Math.ceil(Math.log10(lineCount))
    let lined = ""
    log(spaceCount)
    for (let i = 0; i < lineCount; i++)
    {
        // Getting number of spaces needed
        let lineTag = ``
        for (let j = `${i+1}`.length; j < spaceCount; j++)
            lineTag += " "

        lineTag += `${i+1}  `

        lined += lineTag+"\n"
    }

    let spaceBuffer = ""
    for (let i = 0; i < spaceCount+2; i++)
    {
        spaceBuffer += " "
    }

    const textWidth = getTextWidth(spaceBuffer, getCanvasFont(document.getElementById("code")))
    // lineNumbers.style.width = `calc(${textWidth}px)`
    lineNumbers.innerHTML = colorCode(lined, lineColor)

    rawEditor.style.width    = `calc(100% - ${textWidth}px)`
    stylizedCode.style.width = `calc(100% - ${textWidth}px)`
    rawEditor.style.left     = `${textWidth}px`
    stylizedCode.style.left  = `${textWidth}px`

    newcode += "\n\n\n"

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