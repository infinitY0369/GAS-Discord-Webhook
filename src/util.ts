export function getSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

export function createSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().insertSheet(name)
}

export function getLastRowIndex(column: number, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const maxRowNum = sheet.getMaxRows()
    const range = sheet.getRange(maxRowNum, column)
    if (range.getValue()) {
        return maxRowNum
    }

    const rowIndex = range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow()

    if (sheet.getRange(rowIndex, column).getValue()) {
        return rowIndex
    }

    return 0
}

export function getLastColumnIndex(row: number, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    const maxColumnNum = sheet.getMaxColumns()
    const range = sheet.getRange(row, maxColumnNum)
    if (range.getValue()) {
        return maxColumnNum
    }

    const columnIndex = range.getNextDataCell(SpreadsheetApp.Direction.PREVIOUS).getColumn()

    if (sheet.getRange(row, columnIndex).getValue()) {
        return columnIndex
    }

    return 0
}

export function strToSHA256(input: string): string {
    const rawHashNum = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8)

    let hashStr: string = ""
    let hashNum: number = 0x0

    for (let i: number = 0x0; i < rawHashNum.length; i++) {
        hashNum = rawHashNum[i]
        if (hashNum < 0x0) {
            hashNum += 0x100
        }
        if (hashNum.toString(0x10).length == 0x1) {
            hashStr += "0"
        }
        hashStr += hashNum.toString(0x10)
    }
    return hashStr
}
