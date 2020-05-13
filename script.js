var splitCount = 0
var finalcsv
var csvData

var examples = [
`Name,Class,Favorite Word
Laronda Muto,D,heir
Catrice Mojica,B,absorption
Rachele Senter,D,heir
Ruthie Holm,C,direction
Charity Munger,D,direction
Julene Petrosino,A,direction
Torrie Dossantos,E,absorption
Delaine Wetherell,B,absorption
Leta Cinnamon,E,heir
Wally Bode,A,market
Verda Scroggs,A,heir
Michelle Celestin,D,heir
Preston Desper,C,statement
Orlando Wilker,D,direction
Stephnie Clink,B,absorption
Garland Kelch,D,absorption
Garry Creek,D,absorption
Chung Bonds,B,absorption
Obdulia Porche,E,direction
Ettie Saner,E,market
Shannan Byron,C,market
Trent Capp,E,direction
Zackary Beer,D,direction
Jessika Polite,A,market
Magnolia Daddario,C,heir
Stanford Dillahunt,E,market
Vincent Laford,D,market
Amee Peltier,B,direction
Fredia Brock,D,direction
Raleigh Perez,E,statement
Doloris Yager,B,heir
Stormy Clatterbuck,B,heir
Vernon Gatts,D,heir
Hayden Show,B,market
Annie Delorme,D,direction
Zenaida Kisling,D,heir
Christene Coache,C,direction
Leisha Hodak,E,absorption
Nan Croft,A,absorption
Elyse Smyre,B,direction
Alix Pick,B,absorption
Dallas Mohney,A,absorption
Ora Dangerfield,E,absorption
Pamila Hardin,D,absorption
Eloy Watt,C,direction
Diedra Lighty,A,market
Bert Hanline,D,heir
Darlene Shalash,A,absorption
Houston Gowins,D,market
Margart Grignon,B,heir`,
`Name,Class
,`
]

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
        let arrays = $.csv.toArrays(csvData)

        // sanitise data
        let set = new Set(arrays[0])
        if (set.size != arrays[0].length) {
            alert('Headers must have unique values')
            return
        }
        if (set.has('')) {
            alert('Headers cannot be empty')
            return
        }

        arrays = arrays.filter(i => i[1] && i[2]) //remove those without name and class
        //remove extra columns
        let arrLength = arrays[0].length
        let deletedColumns = 0
        for (let i = 0; i < arrLength; i++) {
            let set = new Set(arrays.map(x => x[i - deletedColumns]))
            if (set.has('') && set.size == 2) {
                for(k of arrays) {
                    k.splice(i - deletedColumns, 1)
                }
                deletedColumns += 1
            }
        }

        let table = $('#data-table')
        drawTable(arrays, table, true)
        updateFromTable()

        for (i of $('.data-table-row')) {
            i.setAttribute('contenteditable', 'false'
        )}

        let headers = arrays[0]

        if (!config) {
            config = $('#select-config')
            $('#div-config').css('display', 'block')
            $('#div-after-csv').css('display', 'none')
            $('#file-upload').css('display', 'none')
        }
        let n = 0
        selectable = []
        for (i of headers) {
            if (i.toLowerCase() != 'name' && i.toLowerCase() != 'class' && i.toLowerCase() != 'no.') {
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
    let editObjs = objs;
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
    let doneObjs = []
    
    for (i of Object.keys(limitations)) {
        for (j of limitations[i]) {
            let toSort = shuffleArray(editObjs.filter(x => {return x[i] == j}))
            doneObjs = doneObjs.concat(toSort)
            let splitVal = split(doneObjs.length, noOfGroups)

            let group = 0
            for (i of toSort) {
                groups[group].push(i)
                i.group = group + 1

                if (groups[group].length >= splitVal[group]) {
                    group += 1
                }
            }
            editObjs = editObjs.filter(x => {return x.group === undefined})
        }
    }

    editObjs = shuffleArray(editObjs)

    let splitVal = split(objs.length, noOfGroups)
    let group = 0
    for (i of editObjs) {
        groups[group].push(i)
        i.group = group + 1

        if (groups[group].length >= splitVal[group]) {
            group += 1
        }
    }

    let groupIndex = arrays[0].push('Group') -1
    let v = arrays.splice(1).map((x, n) => {
        x.push(objs[n].group)
        return x
    })
    v.sort((a, b) => a[groupIndex] > b[groupIndex]) // group

    let n = 1
    let prevGroup = 0;
    for (i of v) {
        if (prevGroup != i[groupIndex]) {
            n = 1
            prevGroup = i[groupIndex]
        }
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
    let array = $.csv.toArrays(csvData)
    drawTable(array, table, true)
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
    let set = new Set(data[0])
    if (set.size != data[0].length) {
        alert('Headers must have unique values')
    }
    if (set.has('')) {
        alert('Headers cannot be empty')
    }
    csvData = $.csv.fromArrays(data)


    fillRemoveColumnDropdown()
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

function addColumn() {
    let data = $.csv.toArrays(csvData)
    let title = $('#add-column').val()
    if (title) {
        if (data[0].includes(title)) {
            alert('Header has to be unique')
        }
        else {
            for (i of data) {
                i.push('')
            }
            data[0][data[0].length - 1] = title

            let table = $('#data-table')
            drawTable(data, table, true)
            updateFromTable()
        }
    }
    else {
        alert('Include name of header')
    }
}

function removeColumn() {
    let data = $.csv.toArrays(csvData)
    let index = data[0].indexOf($('#remove-column').val())
    if (index > 0 && index < data[0].length) {
        for (i of data) {
            i.splice(index, 1)
        }

        let table = $('#data-table')
        drawTable(data, table, true)
        updateFromTable()
    }
}

function drawTable(array, table, editable) {
    let header = true
    table.html('')
    for (i of array) {
        let row = $('<tr>')
        let n = 0
        for (j of i) {
            let col
            if (header) {
                col = $('<th>')
            }
            else {
                col = $('<td>')
            }
            if (editable) {
                if (!((header && (j.toLowerCase() == 'No.' || j.toLowerCase() == 'name' || j.toLowerCase() == 'class')) || n == 0)) {
                    col.attr('contenteditable', 'true')
                }
                col.attr('class', 'data-table-row')
                col.attr('onkeyup', 'updateFromTable()')
            }
            col.text(j)
            row.append(col)
            n += 1
        }
        table.append(row)
        header = false
    }
    
    if (editable) {
        fillRemoveColumnDropdown()
    }
}

function fillRemoveColumnDropdown() {
    let array = $.csv.toArrays(csvData)
    let select = $('#remove-column')
    select.html('')
    select.text('')
    for(i of array[0].splice(3)) {
        let option = $('<option>')
        option.html(i)
        select.append(option)
    }
}

// The event listener for the file upload
function parseFileUpload(file) {
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onload = function(event) {
        let data = $.csv.toArrays(event.target.result)
        if (data[0].includes('Name') && data[0].includes('Class')) {
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
        else {
            alert('File must have headers "Name" and "Class"')
        }
    }
    reader.onerror = function() {
        alert('Unable to read ' + file.fileName)
    }
}

function example(index) {
    let data = $.csv.toArrays(examples[index])

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