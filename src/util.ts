export function getSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

export function createSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().insertSheet(name)
}
