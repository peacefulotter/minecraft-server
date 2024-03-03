export default class Chat {
    public constructor(
        private type: ChatType,
        private value: string,
        private options?: ChatOptions
    ) {}

    public toString(): string {
        switch (this.type) {
            case ChatType.TEXT: {
                return JSON.stringify({ text: this.value, ...this.options })
            }

            case ChatType.TRANSLATE: {
                return JSON.stringify({
                    translate: this.value,
                    ...this.options,
                })
            }
        }
    }
}

export enum ChatType {
    TEXT = 'text',
    TRANSLATE = 'translate',
}

interface ChatOptions {
    with?: Chat | Array<string | object>
    color?: TextColor | string
    bold?: boolean
    italic?: boolean
    underlined?: boolean
    strikethrough?: boolean
    obfuscated?: boolean
    clickEvent?: ClickEvent
    hoverEvent?: HoverEvent
    insertion?: string
    font?: string // TODO: fix this
}

type TextColor =
    | 'black'
    | 'dark_blue'
    | 'dark_green'
    | 'dark_aqua'
    | 'dark_red'
    | 'dark_purple'
    | 'gold'
    | 'gray'
    | 'dark_gray'
    | 'blue'
    | 'green'
    | 'aqua'
    | 'red'
    | 'light_purple'
    | 'purple'
    | 'yellow'
    | 'white'

interface ClickEvent {}

interface HoverEvent {}
