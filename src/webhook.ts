export function postToDiscord(content: string, username: string, avatar_url: string, url: string): boolean {
    if (content.length > 2000) {
        Logger.log("Content can be up to 2000 characters.")
        return false
    }

    const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        "method": "post",
        "headers": { "Content-Type": "application/json" },
        "payload": JSON.stringify({
            "content": content,
            "username": username,
            "avatar_url": avatar_url,
            "tts": undefined,
            "embeds": undefined,
            "allowed_mentions": undefined,
            "components": undefined,
            "files[n]": undefined,
            "payload_json": undefined,
            "attachments": undefined,
            "flags": undefined,
            "thread_name": undefined
        }),
        "muteHttpExceptions": true
    }

    let response: GoogleAppsScript.URL_Fetch.HTTPResponse
    let retry: boolean = false
    let retryAfter: number

    do {
        try {
            response = UrlFetchApp.fetch(url, params)

            retry = response.getResponseCode() === 429

            if (retry) {
                const result = JSON.parse(response.getContentText())
                retryAfter = result?.retry_after ?? 2

                Utilities.sleep(retryAfter * 1000)
            } else {
                return true
            }
        } catch (error) {
            Logger.log(error)
            return false
        }
    } while (retry)

    return false
}
