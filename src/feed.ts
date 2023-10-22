import { XMLParser } from "fast-xml-parser"

export function* parseFeedContent(url: string) {
    const reg = {
        github: {
            commits: /https:\/\/github.com\/.*\/.*\/commits\/.*\.atom/
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
    const jobj = parser.parse(xml)

    switch (true) {
        case reg.github.commits.test(url):
            for (const entry of jobj.feed.entry.reverse()) {
                yield {
                    title: entry.title,
                    link: entry.link["@_href"],
                    author: entry.author["name"].length === 0 ? entry.author["email"] : entry.author["name"],
                    updated: entry.updated
                }
            }
            break
        default:
            Logger.log("No parser is defined for this URL.")
            break
    }
}
