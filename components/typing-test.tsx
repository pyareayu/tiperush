"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { WordDatabase } from "../lib/word-database"
import { TypingTest, type TypingStats } from "../lib/typing-test"
import {
  RefreshCw,
  Play,
  Square,
  Volume2,
  VolumeX,
  Settings,
  Trophy,
  Target,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react"

interface ParticleEffect {
  id: number
  x: number
  y: number
  color: string
  text: string
}

export default function TypingTestGame() {
  const [wordDatabase] = useState(() => new WordDatabase())
  const [typingTest, setTypingTest] = useState<TypingTest | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    mistakes: 0,
    correctChars: 0,
    totalChars: 0,
    timeElapsed: 0,
  })
  const [words, setWords] = useState<string[]>([])
  const [particles, setParticles] = useState<ParticleEffect[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [wordCount, setWordCount] = useState([50])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const particleIdRef = useRef(0)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Play typing sounds
  const playSound = useCallback(
    (frequency: number, duration = 50) => {
      if (!soundEnabled || !audioContextRef.current) return

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000)
    },
    [soundEnabled],
  )

  // Create particle effect
  const createParticle = useCallback((text: string, color: string) => {
    const particle: ParticleEffect = {
      id: particleIdRef.current++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color,
      text,
    }

    setParticles((prev) => [...prev, particle])

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particle.id))
    }, 2000)
  }, [])

  // Initialize test with random words from Trie
  const initializeTest = useCallback(() => {
    const randomWords = wordDatabase.getRandomWords(wordCount[0])
    const newTest = new TypingTest(randomWords)
    setTypingTest(newTest)
    setWords(randomWords)
    setUserInput("")
    setIsActive(false)
    setIsCompleted(false)
    setCurrentWordIndex(0)
    setStreak(0)
    setStats({
      wpm: 0,
      accuracy: 100,
      mistakes: 0,
      correctChars: 0,
      totalChars: 0,
      timeElapsed: 0,
    })
  }, [wordDatabase, wordCount])

  // Start the typing test
  const startTest = useCallback(() => {
    if (!typingTest) return

    typingTest.start()
    setIsActive(true)
    setIsCompleted(false)

    intervalRef.current = setInterval(() => {
      if (typingTest) {
        const currentStats = typingTest.getStats(userInput)
        setStats(currentStats)
      }
    }, 100)

    inputRef.current?.focus()
    playSound(440, 100) // Start sound
  }, [typingTest, userInput, playSound])

  // Stop the typing test
  const stopTest = useCallback(() => {
    if (!typingTest) return

    typingTest.end()
    setIsActive(false)
    setIsCompleted(true)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const finalStats = typingTest.getStats(userInput)
    setStats(finalStats)

    // Achievement particles
    if (finalStats.wpm > 60) createParticle("🚀 Fast!", "#10b981")
    if (finalStats.accuracy > 95) createParticle("🎯 Accurate!", "#3b82f6")
    if (finalStats.mistakes === 0) createParticle("✨ Perfect!", "#f59e0b")

    playSound(523, 200) // Completion sound
  }, [typingTest, userInput, createParticle, playSound])

  // Handle input changes with enhanced feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const previousLength = userInput.length
    setUserInput(value)

    if (!isActive && value.length > 0) {
      startTest()
    }

    // Sound feedback for typing
    if (value.length > previousLength) {
      const targetText = typingTest?.getTargetText() || ""
      const lastChar = value[value.length - 1]
      const expectedChar = targetText[value.length - 1]

      if (lastChar === expectedChar) {
        playSound(800, 30) // Correct keystroke
        setStreak((prev) => {
          const newStreak = prev + 1
          if (newStreak > maxStreak) setMaxStreak(newStreak)

          // Streak milestones
          if (newStreak % 10 === 0) {
            createParticle(`🔥 ${newStreak}!`, "#ef4444")
          }

          return newStreak
        })
      } else {
        playSound(200, 100) // Incorrect keystroke
        setStreak(0)
      }
    }

    // Update current word index
    const spaceCount = value.split(" ").length - 1
    setCurrentWordIndex(Math.min(spaceCount, words.length - 1))

    // Check completion
    const targetText = typingTest?.getTargetText() || ""
    if (value.length >= targetText.length) {
      stopTest()
    }
  }

  // Enhanced text rendering with animations
  const renderText = () => {
    const targetText = typingTest?.getTargetText() || ""
    const mistakes = typingTest?.getMistakes() || []
    const mistakePositions = new Set(mistakes.map((m) => m.position))

    return (
      <div className="relative">
        {targetText.split("").map((char, index) => {
          let className = "transition-all duration-150 "

          if (index < userInput.length) {
            if (mistakePositions.has(index)) {
              className += "bg-red-200 text-red-800 animate-pulse scale-110"
            } else {
              className += "text-green-600 animate-pulse"
            }
          } else if (index === userInput.length) {
            className += "bg-blue-200 text-blue-800 animate-bounce"
          } else {
            className += "text-gray-400 hover:text-gray-600"
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          )
        })}
      </div>
    )
  }

  // Render interactive statistics
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[
        { value: stats.wpm, label: "WPM", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
        { value: `${stats.accuracy}%`, label: "Accuracy", icon: Target, color: "text-green-600", bg: "bg-green-50" },
        { value: stats.mistakes, label: "Mistakes", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
        { value: streak, label: "Streak", icon: Trophy, color: "text-purple-600", bg: "bg-purple-50" },
        { value: `${stats.timeElapsed}s`, label: "Time", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
      ].map((stat, index) => (
        <div
          key={index}
          className={`${stat.bg} p-4 rounded-lg text-center transform hover:scale-105 transition-all duration-200 cursor-pointer`}
        >
          <div className="flex items-center justify-center mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className={`text-2xl font-bold ${stat.color} animate-pulse`}>{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )

  // Initialize test on component mount
  useEffect(() => {
    initializeTest()
  }, [initializeTest])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const progress = typingTest ? (userInput.length / typingTest.getTargetText().length) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 relative">
      {/* Particle Effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-50 animate-bounce text-2xl font-bold"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            color: particle.color,
            animation: "float 2s ease-out forwards",
          }}
        >
          {particle.text}
        </div>
      ))}

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl">Typing Speed Test</span>
                <div className="text-sm text-gray-500">Max Streak: {maxStreak}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:scale-105 transition-transform"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="hover:scale-105 transition-transform"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={initializeTest}
                disabled={isActive}
                className="hover:scale-105 transition-transform"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Test
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="bg-gray-50 animate-in slide-in-from-top duration-300">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Word Count: {wordCount[0]}</label>
                  <Slider
                    value={wordCount}
                    onValueChange={setWordCount}
                    max={100}
                    min={10}
                    step={10}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sound Effects</label>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 animate-pulse" />
          </div>

          {/* Statistics */}
          {renderStats()}

          {/* Current Word Highlight */}
          {isActive && (
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm text-blue-600 font-medium">Current Word:</div>
              <div className="text-lg font-mono text-blue-800">{words[currentWordIndex] || ""}</div>
            </div>
          )}

          {/* Text Display */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
            <div className="font-mono text-lg leading-relaxed select-none">{renderText()}</div>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              placeholder="🚀 Start typing to begin the test..."
              className="w-full h-32 p-4 border-2 rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
              disabled={isCompleted}
            />

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 space-x-4">
                <span>
                  {userInput.length} / {typingTest?.getTargetText().length || 0} characters
                </span>
                <Badge variant="outline" className="animate-pulse">
                  Words: {wordDatabase.getWordCount()}
                </Badge>
              </div>

              <div className="flex gap-2">
                {!isActive && !isCompleted && (
                  <Button
                    onClick={startTest}
                    disabled={!typingTest}
                    className="hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                )}

                {isActive && (
                  <Button onClick={stopTest} variant="destructive" className="hover:scale-105 transition-transform">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Test
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {isCompleted && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 animate-in slide-in-from-bottom duration-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-green-800">Test Completed! 🎉</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { value: `${stats.wpm} WPM`, label: "Words per minute", color: "text-green-700" },
                    { value: `${stats.accuracy}%`, label: "Accuracy", color: "text-green-700" },
                    { value: `${stats.mistakes}`, label: "Total mistakes", color: "text-green-700" },
                    { value: `${stats.timeElapsed}s`, label: "Time taken", color: "text-green-700" },
                  ].map((result, index) => (
                    <div key={index} className="transform hover:scale-105 transition-transform">
                      <div className={`text-2xl font-bold ${result.color} animate-bounce`}>{result.value}</div>
                      <div className="text-sm text-green-600">{result.label}</div>
                    </div>
                  ))}
                </div>

                {/* Performance badges */}
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {stats.wpm > 40 && <Badge className="bg-blue-500 animate-pulse">Good Speed! 🚀</Badge>}
                  {stats.wpm > 60 && <Badge className="bg-purple-500 animate-pulse">Fast Typer! ⚡</Badge>}
                  {stats.accuracy > 95 && <Badge className="bg-green-500 animate-pulse">High Accuracy! 🎯</Badge>}
                  {stats.mistakes === 0 && <Badge className="bg-yellow-500 animate-pulse">Perfect! ✨</Badge>}
                  {maxStreak > 20 && <Badge className="bg-red-500 animate-pulse">Streak Master! 🔥</Badge>}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Information */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Data Structure & Algorithm Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">🌳 Trie Data Structure</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Insert: O(m) time complexity</li>
                <li>• Search: O(m) time complexity</li>
                <li>• Random retrieval: O(1) average</li>
                <li>• Prefix search: O(p + n)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">📊 Performance Metrics</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• WPM: (chars ÷ 5) ÷ minutes</li>
                <li>• Real-time accuracy tracking</li>
                <li>• Mistake detection: O(n)</li>
                <li>• 100ms update intervals</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">🎮 Interactive Features</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Audio feedback system</li>
                <li>• Particle effect animations</li>
                <li>• Real-time progress tracking</li>
                <li>• Streak counting system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
