//compare 2 categories/statuses, equalized for human readable vs database version
export function compare(value1: string, value2: string) {
    return value1.toLowerCase().replace("_", " ") == value2.toLowerCase().replace("_", " ")
}

//given database value and return formatted (capitalized, spaces instead of _)
export function formatted(value: string) {
    return capitalize(value.replace("_", " "))
}

export function dbFormatted(value: string) {
    return value.replace(" ", "_").toUpperCase()
}

export function capitalize(value: string) {
    let str = value[0].toUpperCase()
    for (let i = 1; i < value.length; i++) {
        if (value[i - 1] == " ") {
            str += value[i].toUpperCase()
        } else {
            str += value[i].toLowerCase()
        }
    }
    return str
}