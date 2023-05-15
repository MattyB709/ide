const fileRegex = /(\d+)/

function NewFileName(names, text)
{
  if (names[text] == undefined)
    return text;
  if (fileRegex.test(text.substring(text.lastIndexOf("("))))
  {
    const index = parseInt(text.substring(text.lastIndexOf("(")+1, text.length-1))
    console.log(index)
    return NewFileName(names, text.substring(0, text.lastIndexOf("(")) + `(${index+1})`)
  } else {
    return NewFileName(names, text + " (1)")
  }
}