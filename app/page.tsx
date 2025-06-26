import TypingTestGame from "../components/typing-test"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Typing Speed Test</h1>
          <p className="text-gray-600">Test your typing speed and accuracy with our Trie-powered word engine</p>
        </div>
        <TypingTestGame />
      </div>
    </main>
  )
}
