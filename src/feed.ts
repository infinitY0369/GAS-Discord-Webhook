import { XMLParser } from "fast-xml-parser"
import { parse } from "node-html-parser"
import { decode } from "html-entities"

export function* parseFeedContent(url: string) {
    const reg = {
        discordstatus: {
            history: {
                atom: /https:\/\/discordstatus\.com\/history\.atom/,
                rss: /https:\/\/discordstatus\.com\/history\.rss/
            }
        },
        github: {
            commits: /https:\/\/github\.com\/.*\/.*\/commits\/.*\.atom/,
            releases: /https:\/\/github\.com\/.*\/.*\/releases\.atom/
        },
        microsoft: {
            devblogs: {
                visualstudio: /https:\/\/devblogs\.microsoft\.com\/visualstudio\/feed\/?/
            }
        },
        monsterhunter: {
            news: /https:\/\/www\.monsterhunter\.com\/(ja\/)?news\/?/
        },
        youtube: {
            channel_id: /https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=UC[\w|-]{22}/
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
        case reg.discordstatus.history.atom.test(url): {
            const jobj = parser.parse(xml)
            for (const entry of jobj.feed.entry.reverse()) {
                yield {
                    title: entry.title,
                    link: entry.link["@_href"],
                    author: null,
                    updated: entry.updated
                }
            }
            break
        }
        case reg.discordstatus.history.rss.test(url): {
            const jobj = parser.parse(xml)
            for (const item of jobj.rss.channel.item.reverse()) {
                yield {
                    title: item.title,
                    link: item.link,
                    author: null,
                    updated: item.pubDate
                }
            }
            break
        }
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
        case reg.github.releases.test(url): {
            const jobj = parser.parse(xml)
            for (const entry of jobj.feed.entry.reverse()) {
                yield {
                    title: entry.title,
                    link: entry.link["@_href"],
                    author: entry.author.name,
                    updated: entry.updated
                }
            }
            break
        }
        case reg.microsoft.devblogs.visualstudio.test(url): {
            const jobj = parser.parse(xml)
            for (const item of jobj.rss.channel.item.reverse()) {
                yield {
                    title: decode(item.title),
                    link: item.guid["#text"],
                    author: item["dc:creator"],
                    updated: item.pubDate
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
                    author: null,
                    updated: item.querySelector("li > figure > figcaption > div.info > div.date")?.innerText.trim()
                }
            }
            break
        }
        case reg.youtube.channel_id.test(url): {
            const jobj = parser.parse(xml)
            for (const entry of jobj.feed.entry.reverse()) {
                yield {
                    title: entry.title,
                    link: entry.link["@_href"],
                    author: entry.author.name,
                    updated: entry.updated
                }
            }
            break
        }
        default:
            Logger.log("No parser is defined for this URL.")
            break
    }
}
