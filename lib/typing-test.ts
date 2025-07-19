export interface TypingStats {
  wpm: number
  accuracy: number
  mistakes: number
  correctChars: number
  totalChars: number
  timeElapsed: number
}

export interface TestResult {
  stats: TypingStats
  words: string[]
  userInput: string
  mistakes: Array<{
    position: number
    expected: string
    typed: string
  }>
}

export class TypingTest {
  private words: string[]
  private startTime: number | null
  private endTime: number | null
  private mistakes: Array<{ position: number; expected: string; typed: string }>

  constructor(words: string[]) {
    this.words = words
    this.startTime = null
    this.endTime = null
    this.mistakes = []
  }

  start(): void {
    this.startTime = Date.now()
    this.mistakes = []
  }

  end(): void {
    this.endTime = Date.now()
  }

  // Calculate WPM using standard formula: (characters typed / 5) / (time in minutes)
  calculateWPM(userInput: string): number {
    if (!this.startTime) return 0

    const timeElapsed = this.endTime
      ? (this.endTime - this.startTime) / 1000 / 60
      : (Date.now() - this.startTime) / 1000 / 60

    if (timeElapsed === 0) return 0

    const wordsTyped = userInput.length / 5 // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / timeElapsed)
  }

  // Calculate accuracy percentage
  calculateAccuracy(userInput: string, targetText: string): number {
    if (userInput.length === 0) return 100

    let correctChars = 0
    const minLength = Math.min(userInput.length, targetText.length)

    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++
      }
    }

    return Math.round((correctChars / userInput.length) * 100)
  }

  // Track mistakes in real-time
  trackMistakes(userInput: string, targetText: string): void {
    this.mistakes = []

    for (let i = 0; i < userInput.length; i++) {
      if (i >= targetText.length || userInput[i] !== targetText[i]) {
        this.mistakes.push({
          position: i,
          expected: targetText[i] || "",
          typed: userInput[i],
        })
      }
    }
  }

  // Get comprehensive statistics
  getStats(userInput: string): TypingStats {
    const targetText = this.words.join(" ")
    const timeElapsed = this.startTime ? (this.endTime || Date.now() - this.startTime) / 1000 : 0

    this.trackMistakes(userInput, targetText)

    const correctChars = userInput.length - this.mistakes.length

    return {
      wpm: this.calculateWPM(userInput),
      accuracy: this.calculateAccuracy(userInput, targetText),
      mistakes: this.mistakes.length,
      correctChars: Math.max(0, correctChars),
      totalChars: userInput.length,
      timeElapsed: Math.round(timeElapsed),
    }
  }

  // Get final test result
  getResult(userInput: string): TestResult {
    return {
      stats: this.getStats(userInput),
      words: this.words,
      userInput,
      mistakes: this.mistakes,
    }
  }

  getTargetText(): string {
    return this.words.join(" ")
  }

  getMistakes(): Array<{ position: number; expected: string; typed: string }> {
    return this.mistakes
  }
}
