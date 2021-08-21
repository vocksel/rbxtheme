import Table from 'cli-table3'

// Split the array into an array of arrays, where each sub-array has the first
// `columns` number of elements from the first array. This is used to build the
// grid of theme names.
const arrayToTable = (array, columns = 3) => {
    let rows = 0
    return array.reduce((acc, value, index) => {
        const columnIndex = index % columns

        if (columnIndex === 0) {
            acc.push([value])
            rows++
        } else {
            acc[rows - 1].push(value)
        }

        return acc
    }, [])
}

const logArray = (array) => {
    const table = new Table()

    table.push(
        ...arrayToTable(array, 3)
    )

    console.log(table.toString())
}

export default logArray