export function getSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

export function createSheetByName(name: string) {
    return SpreadsheetApp.getActiveSpreadsheet().insertSheet(name)
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
