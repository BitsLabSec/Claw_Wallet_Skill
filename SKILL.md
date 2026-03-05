---
name: CLAY MPC Wallet
description: A highly secure, Progressive Onboarding wallet for Agents. Generates local private keys and uses Cloud Relay 2FA for signing transactions.
version: 5.0
---

# CLAY Wallet Skill (Remote Auto-Bootstrap & API Protocol)

You are equipped with **CLAY**, an ultra-secure, multi-chain MPC wallet. This skill allows you to manage assets securely without holding raw private keys.

### 🛑 CRITICAL SECURITY RULES
1. **Never print or store raw private keys.** You do not have access to them.
2. All signatures **must** be processed through your local **CLAY Sandbox Daemon** (127.0.0.1:9000).
3. `Share 2` is brokered by the Cloud Relay, while `Share 1` and `Share 3` are local.

---

## 0. Self-Installation (Bootstrap from Cloud)
If you cannot reach `http://127.0.0.1:9000/health`, you MUST install the Sandbox locally first. You do not need to clone the entire repository; our installer will handle everything.

### Step 1: Download the Installer
Download the correct installer for your operating system into a new folder named `clay-skill`:
- **Windows** (PowerShell): `Invoke-WebRequest -Uri "https://raw.githubusercontent.com/UIZorrot/Clay-Skill-More/main/install.ps1" -OutFile "install.ps1"`
- **Linux/Mac** (Bash): `curl -LO "https://raw.githubusercontent.com/UIZorrot/Clay-Skill-More/main/install.sh"`

### Step 2: Configure Cloud Relay & Execute
The Sandbox must communicate with the Cloud Relay to exchange `Share 2`.
Set the environment variable `$RELAY_URL` (or export it in bash) to the Cloud Relay address BEFORE running the script! For local testing, you can set it to `http://127.0.0.1:8080`.

Then execute the installer. The installer will automatically download the correct CLAY binary for your precise OS architecture from the repository and launch the daemon.
- **Windows** (PowerShell): `.\install.ps1`
- **Linux/Mac** (Bash): `bash ./install.sh`

### Step 3: Load Credentials
The script will generate an Identity Token. Read the newly created `.env.clay` file to get your `CLAY_AGENT_TOKEN` and `CLAY_SANDBOX_URL`.
Ensure `http://127.0.0.1:9000/health` returns `{"status":"ok"}`.

---

## 1. API Protocol (REST)
Once the sandbox is running, you must interact with it via HTTP requests.
All requests require the header `Authorization: Bearer <CLAY_AGENT_TOKEN>`.

### A. Initialize Wallet (Run this immediately after install)
**POST** `{CLAY_SANDBOX_URL}/api/v1/wallet/init`
- **Body**: `{}` (Empty JSON)
- **Action**: Generates key, syncs with the Cloud Relay (`8080`), and returns your identity.
- **Output to User**: "I have initialized my CLAY wallet. Address: `0x...`, UID: `[UID]`."

### B. Get Status
**GET** `{CLAY_SANDBOX_URL}/api/v1/wallet/status`
- **Response**: Returns address, master public key, and current spending policy.

### C. Sign Transaction
**POST** `{CLAY_SANDBOX_URL}/api/v1/tx/sign`
- **Body Example**: 
  ```json
  {
    "chain": "ethereum", 
    "to": "0xRecipient...",
    "amount_wei": "1000000000000000000",
    "tx_payload_hex": "0xUnsignedRawHex..."
  }
  ```
- **Action**: The sandbox connects to the Cloud Relay, verifies your transaction against the user's policy, signs it, and securely wipes its memory.
- **Returns**: `{"signature_hex": "...", "from": "..."}`.

---

## 2. Recovery & UID
The **UID** is the user's key to managing you. Once they have the UID, they can set your daily spending limits or activate/deactivate you via the CLAY Web Console.
