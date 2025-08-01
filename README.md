# Tiperush

Tiperush is a fast and interactive typing test game built with React, TypeScript, and Tailwind CSS. The game challenges users to type words or sentences as quickly and accurately as possible, providing instant feedback and score tracking. Tiperush leverages a Trie data structure for efficient word lookup and validation, ensuring smooth gameplay even with large word lists. The application is deployed on Vercel for lightning-fast access and seamless user experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Trie Data Structure](#trie-data-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

Tiperush is designed for anyone looking to improve their typing speed and accuracy. Whether you're a beginner or a seasoned typist, Tiperush offers an engaging way to practice and track your progress. The use of a Trie data structure ensures that word validation is both fast and scalable, making the game responsive even with extensive word datasets.

## Features

- Real-time typing speed and accuracy tracking
- Dynamic word lists with instant validation using Trie
- Responsive UI built with Tailwind CSS
- Fully typed React codebase leveraging TypeScript
- Seamless deployment on Vercel for optimal performance
- Clean, modern design and intuitive gameplay

## Demo

Check out the live app: [https://tiperush.vercel.app](https://tiperush.vercel.app)

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Data Structure:** Trie (for efficient word lookup)
- **Deployment:** Vercel

## Getting Started

These instructions will help you set up Tiperush locally for development or testing.

### Prerequisites

- Node.js (v16 or newer recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pyareayu/tiperush.git
   ```
2. **Navigate to the project directory**
   ```bash
   cd tiperush
   ```
3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## Usage

To run Tiperush locally:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play the game locally.

## Trie Data Structure

Tiperush uses a Trie data structure to manage its word list. This enables rapid word validation and supports features like autocomplete or prefix search if extended in the future. The Trie ensures that as you type, the game can instantly check the validity of partial and complete words without performance lag, even with thousands of entries.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request describing your changes.

Please follow the code style in the project and add tests or documentation as needed.

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

## Contact

- **Author:** [pyareayu](https://github.com/pyareayu)
- **Project Link:** [https://github.com/pyareayu/tiperush](https://github.com/pyareayu/tiperush)

---

_Built with React, TypeScript, Tailwind CSS, and the power of Trie!_
