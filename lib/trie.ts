export class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  word?: string

  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

export class Trie {
  private root: TrieNode
  private words: string[]

  constructor() {
    this.root = new TrieNode()
    this.words = []
  }

  // Insert a word into the Trie - O(m) where m is word length
  insert(word: string): void {
    let current = this.root

    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }

    current.isEndOfWord = true
    current.word = word
    this.words.push(word)
  }

  // Search for a word in the Trie - O(m) where m is word length
  search(word: string): boolean {
    let current = this.root

    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return false
      }
      current = current.children.get(char)!
    }

    return current.isEndOfWord
  }

  // Get all words with a given prefix - O(p + n) where p is prefix length, n is number of results
  getWordsWithPrefix(prefix: string): string[] {
    let current = this.root

    // Navigate to the prefix
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)!
    }

    // Collect all words from this point
    const results: string[] = []
    this.collectWords(current, prefix, results)
    return results
  }

  private collectWords(node: TrieNode, prefix: string, results: string[]): void {
    if (node.isEndOfWord && node.word) {
      results.push(node.word)
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, results)
    }
  }

  // Get a random word - O(1) average case
  getRandomWord(): string {
    if (this.words.length === 0) return ""
    const randomIndex = Math.floor(Math.random() * this.words.length)
    return this.words[randomIndex]
  }

  // Get multiple random words efficiently
  getRandomWords(count: number): string[] {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(this.getRandomWord())
    }
    return words
  }

  // Get word count
  getWordCount(): number {
    return this.words.length
  }
}
