declare module 'sentiment' {
  interface Analysis {
    score: number
    comparative: number
    calculation: Array<Record<string, number>>
    tokens: string[]
    words: string[]
    positive: string[]
    negative: string[]
  }

  interface Options {
    extras?: Record<string, number>
  }

  class Sentiment {
    analyze(text: string, options?: Options): Analysis
  }

  export = Sentiment
}
