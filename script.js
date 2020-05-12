var splitCount = 0;
var finalcsv;

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
    return array;
}

function download(filename, text) {
    // https://www.bitdegree.org/learn/javascript-download#making-javascript-download-files-without-the-server
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function fillConfigDropdown(config) {
    let input = $('#input').val()
    if (input) {
        let objs = $.csv.toObjects(input)
        let arrays = $.csv.toArrays(input)
        let headers = arrays[0]

        if (!config) {
            config = $('#select-config')
            $('#div-config').css('display', 'block')
        }
        let n = 0;
        selectable = []
        for (i of headers) {
            if (i.toLowerCase() != 'name' && i.toLowerCase() != 'class') {
                selectable.push([i, n])
            }
            n += 1
        }

        const spliced = arrays.splice(1);
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
    let input = $('#input').val()
    let objs = $.csv.toObjects(input)
    let arrays = $.csv.toArrays(input)
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
                i.group = group + 1;

                if (groups[group].length >= splitVal[group]) {
                    group += 1
                }
            }
        }
    }

    let others = shuffleArray(objs.filter(x => {return x.group === undefined}))

    let splitVal = split(objs.length, noOfGroups);
    let group = 0
    for (i of others) {
        groups[group].push(i)
        i.group = group + 1;

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
    let newarr = [arrays[0]].concat(v)

    let table = $('#csv-table')
    table.html('')
    let header = true
    for (i of newarr) {
        let row = $('<tr>')
        for (j of i) {
            let col
            if (header) {
                col = $('<th>')
            }
            else {
                col = $('<td>')
            }
            col.text(j)
            row.append(col)
        }
        table.append(row)
        header = false;
    }

    $('#div-results').css('display', 'block')
    finalcsv = $.csv.fromArrays(newarr)
}