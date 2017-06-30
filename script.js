$('input').onchange = function () {
  const val = this.value
  const trimed = val.trim()
  if (val !== trimed) this.value = trimed
  try {
    convert(trimed)
  } catch (err) {
    alert('Convert failed')
    throw err
  }
}

$('input').onfocus = function () {
  this.select()
}

window.onload = function () {
  const val = 'U+1F40E'
  $('input').value = val
  convert(val)
}

function convert(input) {
  if (!input) {
    output(null)
    return
  }

  // unicode notation
  if (/^u\+[0-9a-f]+/i.test(input)) {
    output(input.slice(2))
    return
  }

  // JavaScript string escape notation
  if (/^\\u[0-9a-f]+/i.test(input)) {
    const match = input.match(/^\\u\{?([0-9A-Fa-f]+)\}?$/)
    if (match) {
      output(match[1])
      return
    }

    const str = eval(`'"${input}"'`)
    input = str.slice(1, -1)
  }
  // Hexadecimal numeric character reference
  else if (/^&#x?[0-9a-f]+;$/i.test(input)) {
    input = input.toUpperCase()
    if (input[2].toLowerCase() === 'x') {
      output(input.slice(3, -1))
    } else {
      const d = parseInt(input.slice(2, -1), 10)
      output(d.toString(16))
    }
    return
  }
  // Decimal numeric character reference
  else if (/^&[a-z]+;$/i.test(input)) {
    $('char').innerHTML = input
    input = $('char').textContent
  }

  const hex = input.codePointAt(0).toString(16)
  output(hex)
}

function output(codePoint) {
  if (codePoint == null) {
    $('result').innerHTML = ''
    $('char').textContent = ''
  }

  const [h, s, d] = parse(codePoint)
  const table = `
<table>
  <tr>
    <td>Unicode</td>
    <td><a href="http://www.fileformat.info/info/unicode/char/${s}/index.htm">U+${s}</a></td>
  </tr>
  <tr>
    <td>JavaScript</td>
    <td>'\\u{${h}}' ${jsu()}</td>
  </tr>
  <tr>
    <td>HTML</td>
    <td>&amp;#x${h}; <br> &amp;#${d};</td>
  </tr>
</table>
`

  function jsu() {
    if (h.length < 5) {
      let str = `<br> '\\u${h}'`
      if (h.length < 3) str = str +  `<br> '\\x${h}'`
      return str
    }

    return `<br> '${toUTF16(d)}'`
  }

  $('result').innerHTML = table
  $('char').innerHTML = `&#x${s};`
}

function parse(str) {
  const d = parseInt(str, 16)
  const h = d.toString(16).toUpperCase() // hex string
  const s = h.padStart(4, '0')
  return [h, s, d]
}

// http://2ality.com/2013/09/javascript-unicode.html
function toUTF16(codePoint) {
  const TEN_BITS = parseInt('1111111111', 2)
  function u(codeUnit) {
    return '\\u' + codeUnit.toString(16).toUpperCase()
  }

  if (codePoint <= 0xFFFF) {
    return u(codePoint)
  }
  codePoint -= 0x10000

  // Shift right to get to most significant 10 bits
  const leadSurrogate = 0xD800 + (codePoint >> 10)

  // Mask to get least significant 10 bits
  const tailSurrogate = 0xDC00 + (codePoint & TEN_BITS)

  return u(leadSurrogate) + u(tailSurrogate)
}

function $(id) {
  return document.getElementById(id)
}
