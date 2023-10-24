import { XMLParser } from "fast-xml-parser"
import { parse } from "node-html-parser"

export function* parseFeedContent(url: string) {
    const reg = {
        github: {
            commits: /https:\/\/github.com\/.*\/.*\/commits\/.*\.atom/
        },
        monsterhunter: {
            news: /https:\/\/www.monsterhunter.com\/j?a?\/?news\/?/
        }
    }

    const xml = UrlFetchApp.fetch(url).getContentText()

    // XMLparseOptions (https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md)
    const parserOptions = {
        preserveOrder: false,
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        parseTagValue: true,
        parseAttributeValue: true,
        ignoreDeclaration: true
    }

    const parser = new XMLParser(parserOptions)

    switch (true) {
        case reg.github.commits.test(url): {
            const jobj = parser.parse(xml)

            for (const entry of jobj.feed.entry.reverse()) {
                yield {
                    title: entry.title,
                    link: entry.link["@_href"],
                    author: entry.author["name"].length === 0 ? entry.author["email"] : entry.author["name"],
                    updated: entry.updated
                }
            }
            break
        }
        case reg.monsterhunter.news.test(url): {
            const jobj = parse(xml)

            for (const item of jobj.querySelectorAll("#latest > div > ul > a").reverse()) {
                yield {
                    title: item.querySelector("li > figure > figcaption > div.text")?.innerText.trim(),
                    link: item.getAttribute("href"),
                    author: item.querySelector("li > figure > figcaption > div.info > div.category")?.innerText,
                    updated: item.querySelector("li > figure > figcaption > div.info > div.date")?.innerText.trim()
                }
            }
            break
        }
        default:
            Logger.log("No parser is defined for this URL.")
            break
    }
}
