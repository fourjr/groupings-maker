var splitCount = 0
var finalcsv
var csvData

function split(objSize, noOfGroups) {
    let division = Math.floor(objSize / noOfGroups)
    let remainder = objSize % noOfGroups
    splitted = Array(noOfGroups).fill(division)
    for (let i = 0; i < remainder; i++){
        splitted[i] += 1
    }

    if (splitCount % 2 == 0) {
        splitted = splitted.reverse()
    }
    splitCount += 1
    return splitted
}

function shuffleArray(array) {
    // https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

function download(filename, text) {
    // https://www.bitdegree.org/learn/javascript-download#making-javascript-download-files-without-the-server
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plaincharset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
}

function fillConfigDropdown(config) {
    if (csvData) {
        let arrays = $.csv.toArrays(csvData).filter(i => i[0] && i[1])
        let table = $('#data-table')
        drawTable(arrays, table, true)
        updateFromTable()
        for (i of $('.data-table-row')) {i.setAttribute('contenteditable', 'false')}

        let headers = arrays[0]

        if (!config) {
            config = $('#select-config')
            $('#div-config').css('display', 'block')
            $('#div-after-csv').css('display', 'none')
        }
        let n = 0
        selectable = []
        for (i of headers) {
            if (i.toLowerCase() != 'name' && i.toLowerCase() != 'class') {
                selectable.push([i, n])
            }
            n += 1
        }

        const spliced = arrays.splice(1)
        for (i of selectable) {
            let option = $('<option>')
            option.html(i[0])
            option.attr('disabled', 1)
            config.append(option)

            let choices = new Set()
            for (j of spliced) {
                choices.add(j[i[1]])
            }
            for (j of choices) {
                if (j) {
                    let option = $('<option>')
                    option.attr('class', 'option-config')
                    option.attr('header', i[0])
                    option.attr('value', j)
                    option.html(j)
                    config.append(option)
                }
            }
        }
    }
}

function newConfigDropdown(obj) {
    if (obj.value) {
        if (obj == $('#div-config select')[$('#div-config select').length - 1]) {
            let div = $('<div>')
            div.attr('class', 'config-options')
            let select = $('<select>')
            select.attr('class', 'config')
            select.attr('onchange', 'newConfigDropdown(this)')
            select.append($('<option>'))
            fillConfigDropdown(select)
            div.append(select)
            $('#div-options').append(div)
        }
    }
    else {
        obj.parentNode.removeChild(obj)
    }
}

function parseGroupings() {
    let objs = $.csv.toObjects(csvData)
    let arrays = $.csv.toArrays(csvData)
    const noOfGroups = parseInt($('#no-of-group').val())
    let limitations = {}
    for (i of $('.config')) {
        if (i.value) {
            let header = $('[value="' + i.value + '"]').attr('header')
            if (limitations[header]) {
                limitations[header].push(i.value)
            }
            else {
                limitations[header] = [i.value]
            }
        }
    }
    let groups = Array.from({length: noOfGroups}, e => [])
    
    for (i of Object.keys(limitations)) {
        for (j of limitations[i]) {
            let toSort = shuffleArray(objs.filter(x => {return x[i] == j}))
            let splitVal = split(toSort.length, noOfGroups)

            let group = 0
            for (i of toSort) {
                groups[group].push(i)
                i.group = group + 1

                if (groups[group].length >= splitVal[group]) {
                    group += 1
                }
            }
        }
    }

    let others = shuffleArray(objs.filter(x => {return x.group === undefined}))

    let splitVal = split(objs.length, noOfGroups)
    let group = 0
    for (i of others) {
        groups[group].push(i)
        i.group = group + 1

        if (groups[group].length >= splitVal[group]) {
            group += 1
        }
    }

    arrays[0].push('Group')
    let v = arrays.splice(1).map((x, n) => {
        x.push(objs[n].group)
        return x
    })
    v.sort((a, b) => a[2] > b[2]) // cca
    v.sort((a, b) => a[3] > b[3]) // board
    v.sort((a, b) => a[4] > b[4]) // group

    let n = 1
    for (i of v) {
        i[0] = n
        n += 1
    }
    let newarr = arrays.concat(v)

    let table = $('#csv-table')
    drawTable(newarr, table)

    $('#div-results').css('display', 'block')
    finalcsv = $.csv.fromArrays(newarr)
}

function loadDataTable() {
    $('#div-after-csv').css('display', 'block')
    let table = $('#data-table')
    drawTable($.csv.toArrays(csvData), table, true)
}

function updateFromTable() {
    let data = []
    for (i of $('table#data-table').children()) {
        let arr = []
        for (c of i.children) {
            arr.push(c.textContent)
        }
        data.push(arr)
    }
    csvData = $.csv.fromArrays(data)
}

function addRow() {
    let data = $.csv.toArrays(csvData)
    data.push(Array.from({length: data[0].length}, e => ''))

    let v = data.splice(1)
    let n = 1
    for (i of v) {
        i[0] = n
        n += 1
    }
    let newarr = data.concat(v)

    let table = $('#data-table')
    drawTable(newarr, table, true)
    updateFromTable()
}

function removeRow() {
    let data = $.csv.toArrays(csvData)
    let index = parseInt($('#remove-row').val())
    if (index > 0 && index < data.length) {
        data.splice(index, 1)

        let v = data.splice(1)
        let n = 1
        for (i of v) {
            i[0] = n
            n += 1
        }
        let newarr = data.concat(v)

        let table = $('#data-table')
        drawTable(newarr, table, true)
        updateFromTable()
    }
    else {
        alert('Error removing row')
    }
}

function drawTable(array, table, editable) {
    let header = true
    table.html('')
    for (i of array) {
        let row = $('<tr>')
        for (j of i) {
            let col
            if (header) {
                col = $('<th>')
            }
            else {
                col = $('<td>')
            }
            if (editable) {
                col.attr('contenteditable', 'true')
                col.attr('class', 'data-table-row')
                col.attr('onkeyup', 'updateFromTable()')
            }
            col.text(j)
            row.append(col)
        }
        table.append(row)
        header = false
    }
}

// The event listener for the file upload
function parseFileUpload(file) {
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onload = function(event) {
        let data = $.csv.toArrays(event.target.result)
        data[0].unshift('No.')
        let n = 1
        let v = data.splice(1)
        for (i of v) {
            i.unshift(n)
            n += 1
        }
        let newarr = data.concat(v)
        csvData = $.csv.fromArrays(newarr)
        loadDataTable()
    }
    reader.onerror = function() {
        alert('Unable to read ' + file.fileName)
    }
}