# CryptoChain Lite ⛓️

A lightweight Proof-of-Work blockchain implementation in JavaScript.  
Includes dynamic difficulty adjustment, mining, block validation, and full test coverage — perfect for learning or prototyping.

---

## 🚀 Features

- ⛏️ Proof-of-Work mining mechanism
- ⚙️ Dynamic difficulty adjustment based on block mining time
- 🔗 Block linkage and hash validation
- 🧪 Comprehensive unit tests using Jest
- 🛡️ Protection against hash tampering and difficulty manipulation
- 📦 Easy-to-read modular codebase

---

## 📦 Installation

```bash
git clone https://github.com/your-username/cryptochain-lite.git
cd cryptochain-lite
npm install
```

---

## 🧪 Running Tests

```bash
npm test
```

> All core functionalities including mining, difficulty, and chain validation are fully covered with unit tests.

---

## 📁 Project Structure

```
cryptochain-lite/
├── block.js              # Block class with Proof-of-Work
├── blockchain.js         # Blockchain class and validation logic
├── config.js             # Genesis block and constants
├── crypto-hash.js        # Hash utility using SHA-256
├── __tests__/            # All unit tests for blocks and chain
```

---

## 🧠 How It Works

- Each new block must pass a Proof-of-Work check: its hash must have a certain number of leading zeros in binary.
- The difficulty increases if blocks are mined too quickly, or decreases if too slowly — auto-balanced via `adjustDifficulty()`.
- The blockchain verifies every block's hash, data, and linkage (`previousHash`) — and rejects any block with an unnatural difficulty jump (±1 max).
- A simple yet secure and educational blockchain model.

---

## 🛠️ Potential Extensions

- 🔐 Wallets and signed transactions
- 🌐 REST API using Express
- 📡 Peer-to-peer sync with WebSockets
- 🧰 Explorer UI or CLI interface

---

## 👨‍💻 Author

Made with 💻 by Amin Asadi  
Based on real blockchain mechanics — simplified for learning and extension.

---

## 📄 License

MIT License
