import { parseFeedContent } from "./feed"
import { getSheetByName, createSheetByName, strToSHA256 } from "./util"
import { postToDiscord } from "./webhook"
import { test } from "./test"

declare const global: { main: () => void; test: () => void }
// Functions or variables placed at the top level.
global.main = main
global.test = test

function main(): void {
    const sheet: { [key: string]: GoogleAppsScript.Spreadsheet.Sheet | null } = {}

    sheet.feed = getSheetByName("feed")

    if (!sheet.feed) {
        Logger.log("No sheet named \"feed\" was found.")
        return
    }

    const headers = sheet.feed.getRange(1, 1, 1, sheet.feed.getLastColumn()).getValues()[0]

    const idx = {
        username: headers.indexOf("NAME"),
        avatar_url: headers.indexOf("ICON"),
        url: headers.indexOf("URL"),
        webhook: headers.indexOf("WEBHOOK")
    }

    sheet.articles = getSheetByName("articles") ?? createSheetByName("articles")
    let articleData = sheet.articles.getRange(1, 1, sheet.articles.getDataRange().getLastRow(), 1).getValues()

    const values = sheet.feed.getRange(2, 1, sheet.feed.getDataRange().getLastRow() - 1, 4).getValues()

    let updateArticle: boolean = true

    for (const value of values) {
        if (value[idx.username].length < 0 || value[idx.avatar_url].length < 0 || value[idx.url].length < 0 || value[idx.webhook].length < 0) {
            continue
        }

        for (const entry of parseFeedContent(value[idx.url])) {
            articleData = updateArticle ? sheet.articles.getRange(1, 1, sheet.articles.getDataRange().getLastRow(), 1).getValues() : articleData

            updateArticle = false

            const content = `### **${entry.title}**\n\n${entry.link}`

            const updated = Utilities.formatDate(new Date(entry.updated), "JST", "yyyy-MM-dd'T'HH:mm:ssXXX")

            const hash = strToSHA256(content + updated)

            if (articleData.some((data) => data[0] === hash)) {
                continue
            }

            const result = postToDiscord(content, value[idx.username], value[idx.avatar_url], value[idx.webhook])

            if (result) {
                sheet.articles.appendRow([hash])
                updateArticle = true
            }
        }
    }
}
