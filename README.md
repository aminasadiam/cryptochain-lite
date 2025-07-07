# CryptoChain Lite ⛓️

A lightweight Proof-of-Work blockchain implementation in JavaScript.  
Includes dynamic difficulty adjustment, mining, block validation, inter-node synchronization via Redis Pub/Sub, and full test coverage — perfect for learning or prototyping.

---

## 🚀 Features

- ⛏️ Proof-of-Work mining mechanism
- ⚙️ Dynamic difficulty adjustment based on block mining time
- 🔗 Block linkage and hash validation
- 🔄 Redis Pub/Sub-based multi-node blockchain sync
- 🧪 Comprehensive unit tests using Jest
- 🛡️ Protection against hash tampering and difficulty manipulation
- 📦 Easy-to-read modular codebase

---

## 📦 Installation

```bash
git clone https://github.com/aminasadiam/cryptochain-lite.git
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
├── blockchain.js         # Blockchain logic and validation
├── pubsub.js             # Redis Pub/Sub sync logic
├── config.js             # Genesis block and constants
├── crypto-hash.js        # Hash utility using SHA-256
├── index.js              # Express server + node boot logic
├── __tests__/            # All unit tests
```

---

## 🔄 Multi-Node Sync (via Redis)

- Each node connects to Redis and subscribes to `BLOCKCHAIN` channel
- After mining, the new chain is broadcasted to peers
- When a node starts on a different port, it auto-syncs from root node (port 3000)
- Prevents difficulty jump or hash tampering on sync

---

## 🧠 How It Works

- Each new block must pass a Proof-of-Work check: its hash must have a certain number of leading zeros in binary.
- Difficulty increases/decreases based on how fast the previous block was mined.
- The chain verifies hashes, difficulty limits (±1), and linkage between blocks.

---

## 📡 Try It Locally

Run first node (root):

```bash
node index.js
```

Then open another terminal and run a peer node (auto-picks different port):

```bash
node index.js
```

Mine a block:

```bash
curl -X POST http://localhost:3000/api/mine -H "Content-Type: application/json" -d '{"data":"Hello"}'
```

Fetch chain:

```bash
curl http://localhost:3000/api/blocks
```

---

## 🛠️ Potential Extensions

- 🔐 Wallets and signed transactions
- 🌐 REST API using Express (expansion)
- 📡 Peer-to-peer sync with WebSockets (instead of Redis)
- 🧰 Explorer UI or CLI dashboard
- 🐳 Docker + Redis Compose setup

---

## 👨‍💻 Author

Made with 💻 by [Amin Asadi](https://github.com/aminasadiam)  
Built as a learning project to understand blockchain internals from scratch.

---

## 📄 License

MIT License
