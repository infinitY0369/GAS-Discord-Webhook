import { parseFeedContent } from "./feed"
import { getSheetByName, createSheetByName, getLastRowIndex, getLastColumnIndex, strToSHA256 } from "./util"
import { postToDiscord } from "./webhook"
import { test } from "./test"

declare const global: { main: () => void; test: () => void }

// Functions or variables placed at the top level.
global.main = main
global.test = test

function main(): void {
    const sheet: { [key: string]: GoogleAppsScript.Spreadsheet.Sheet | null } = {}

    // Get the "feed" sheet.
    sheet.feed = getSheetByName("feed")

    if (!sheet.feed) {
        Logger.log("No sheet named \"feed\" was found.")
        return
    }

    // Get the header row of the "feed" sheet.
    const feedHeader = sheet.feed.getRange(1, 1, 1, getLastColumnIndex(1, sheet.feed)).getValues()[0]

    if (!feedHeader) {
        throw new Error("Failed to get header of feed sheet.")
    }

    const idx = {
        username: feedHeader.indexOf("NAME"),
        avatar_url: feedHeader.indexOf("ICON"),
        url: feedHeader.indexOf("URL"),
        max: feedHeader.indexOf("MAX"),
        webhook: feedHeader.indexOf("WEBHOOK")
    }

    // Get the "articles" sheet or create it if it doesn't exist.
    sheet.articles = getSheetByName("articles") ?? createSheetByName("articles")

    const feedData = sheet.feed.getRange(2, 1, sheet.feed.getLastRow() - 1, getLastColumnIndex(1, sheet.feed)).getValues()

    for (const data of feedData) {
        if (!data[idx.username] || !data[idx.avatar_url] || !data[idx.url] || !data[idx.webhook]) {
            continue
        }

        let init: boolean = false

        const webhookHash = strToSHA256(data[idx.url] + data[idx.webhook])

        const headerColumnIndex = getLastColumnIndex(1, sheet.articles)

        const articlesHeader = headerColumnIndex === 0 ? [] : sheet.articles.getRange(1, 1, 1, headerColumnIndex).getValues()[0]

        let headerIndex = articlesHeader.indexOf(webhookHash) + 1

        if (headerIndex === 0) {
            const newIndex: number = getLastColumnIndex(1, sheet.articles) + 1
            sheet.articles.getRange(1, newIndex).setValue(webhookHash)
            headerIndex = newIndex
            init = true
        }

        const rowIndex = getLastRowIndex(headerIndex, sheet.articles) - 1

        let articlesData = rowIndex === 0 ? [] : sheet.articles.getRange(2, headerIndex, rowIndex, 1).getValues()

        for (const entry of parseFeedContent(data[idx.url])) {
            const contentHash = strToSHA256(entry.title + entry.link + entry.author + entry.updated)

            if (articlesData.some((articles) => articles[0] === contentHash)) {
                continue
            }

            const content = `**${entry.title.replace(/\n/, "**\n**")}**\n\n${entry.link}`

            const result = !init ? postToDiscord(content, data[idx.username], data[idx.avatar_url], data[idx.webhook]) : false

            if (result || init) {
                articlesData.push([contentHash])
            }
        }

        sheet.articles.getRange(2, headerIndex, articlesData.length, 1).clear()

        const max: number = Number(data[idx.max])
        if (max && max > 0 && articlesData.length > max) {
            articlesData = articlesData.slice(articlesData.length - max, articlesData.length)
        }

        if (articlesData.length < 0) {
            Logger.log("The number of rows in the range must be at least 1.")
            continue
        }

        sheet.articles.getRange(2, headerIndex, articlesData.length, 1).setValues(articlesData)
    }
}
