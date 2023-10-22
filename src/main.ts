import { parseFeedContent } from "./feed"
import { getSheetByName, createSheetByName } from "./util"
import { postToDiscord } from "./webhook"

declare const global: { main: () => void }
// Functions or variables placed at the top level.
global.main = main

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

    const values = sheet.feed.getRange(2, 1, sheet.feed.getDataRange().getLastRow() - 1, 4).getValues()

    for (const value of values) {
        for (const entry of parseFeedContent(value[idx.url])) {
            const articleData = sheet.articles.getRange(1, 1, sheet.articles.getDataRange().getLastRow(), 4).getValues()

            const updated = Utilities.formatDate(new Date(entry.updated), "JST", "yyyy-MM-dd'T'HH:mm:ssXXX")

            if (articleData.some((data) => data[0] === value[idx.webhook] && data[1] === entry.title && data[2] === entry.link && data[3] === updated)) {
                continue
            }

            const content = "**" + entry.author + " | " + entry.title + "**" + "\n\n" + entry.link

            const result = postToDiscord(content, value[idx.username], value[idx.avatar_url], value[idx.webhook])

            if (result) {
                sheet.articles.appendRow([value[idx.webhook], entry.title, entry.link, updated])
            }
        }
    }
}
