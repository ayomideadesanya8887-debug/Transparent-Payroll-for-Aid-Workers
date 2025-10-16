# 🌍 Transparent Payroll for Aid Workers

Welcome to a decentralized payroll system built on the Stacks blockchain to ensure fair and transparent compensation for aid workers in high-risk or remote areas. This project uses Clarity smart contracts to manage payroll processes securely, providing trust and accountability for aid organizations, workers, and donors.

## ✨ Features

🔐 **Secure Worker Registration**: Register aid workers with verified identities.  
💸 **Transparent Payroll Funding**: Donors and organizations fund payroll with traceable contributions.  
⏰ **Timely Salary Disbursement**: Workers receive payments automatically based on predefined schedules.  
📊 **Immutable Audit Trail**: All transactions and payroll activities are recorded on-chain for transparency.  
⚖️ **Dispute Resolution**: A decentralized mechanism to resolve payment disputes fairly.  
✅ **Verification and Reporting**: Donors and organizations can verify payments and generate reports.  
🔒 **Access Control**: Role-based permissions for workers, organizations, and auditors.  
🚫 **Fraud Prevention**: Prevents double payments and unauthorized access.

## 🛠 How It Works

**For Aid Organizations**  
- Register the organization and authorized admins using the `organization-registry` contract.  
- Fund the payroll pool via the `payroll-funding` contract with STX or fungible tokens.  
- Define worker roles, schedules, and salary terms in the `worker-salary` contract.  

**For Aid Workers**  
- Register with a verified identity and wallet address using the `worker-registry` contract.  
- Receive automated salary payments through the `payroll-disbursement` contract.  
- Raise disputes for incorrect payments via the `dispute-resolution` contract.  

**For Donors**  
- Contribute funds to the payroll pool and track usage via the `payroll-funding` contract.  
- Verify payments and access transparency reports through the `transparency-report` contract.  

**For Auditors**  
- Use the `audit-log` contract to review immutable payroll records.  
- Verify compliance with funding and disbursement terms.

## 📂 Smart Contracts

1. **worker-registry.clar**  
   Registers aid workers with their wallet addresses, roles, and verified identities. Prevents duplicate registrations.  

2. **organization-registry.clar**  
   Registers aid organizations and their authorized admins. Manages organization-level permissions.  

3. **payroll-funding.clar**  
   Handles funding from donors and organizations into a secure payroll pool. Tracks contributions transparently.  

4. **worker-salary.clar**  
   Defines salary terms for workers, including payment schedules, amounts, and conditions.  

5. **payroll-disbursement.clar**  
   Automates salary payments to workers based on schedules and available funds.  

6. **dispute-resolution.clar**  
   Allows workers to raise payment disputes and organizations to resolve them with on-chain arbitration.  

7. **transparency-report.clar**  
   Generates immutable reports for donors and auditors to verify payroll activities.  

8. **audit-log.clar**  
   Maintains a tamper-proof log of all payroll-related transactions and actions for auditing.

## 🚀 Getting Started

### Prerequisites
- [Stacks CLI](https://docs.stacks.co/stacks-101/stacks-cli) for deploying and interacting with Clarity contracts.  
- [Hiro Wallet](https://www.hiro.so/wallet) for managing STX transactions.  
- Node.js and a Clarity development environment (e.g., Clarinet).  

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/transparent-payroll-aid-workers.git
   cd transparent-payroll-aid-workers
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy contracts using Clarinet:
   ```bash
   clarinet deploy
   ```

### Usage
1. **Register Organization**:
   - Call `organization-registry::register-org` with organization details and admin address.
2. **Register Workers**:
   - Use `worker-registry::register-worker` to add verified workers with their roles and wallet addresses.
3. **Fund Payroll**:
   - Donors or organizations call `payroll-funding::fund-payroll` to deposit STX or tokens.
4. **Set Salary Terms**:
   - Define worker salaries and schedules in `worker-salary::set-salary`.
5. **Disburse Payments**:
   - The `payroll-disbursement` contract automatically processes payments at scheduled intervals.
6. **Resolve Disputes**:
   - Workers can call `dispute-resolution::raise-dispute` to report issues; admins resolve via `resolve-dispute`.
7. **Generate Reports**:
   - Use `transparency-report::generate-report` to create verifiable payroll summaries.
8. **Audit Logs**:
   - Auditors query `audit-log::get-transaction-log` for a complete history.

## 🛡️ Security Considerations
- **Role-Based Access**: Only authorized addresses can perform specific actions (e.g., admins for organization tasks, workers for disputes).  
- **Immutable Records**: All actions are logged on-chain to prevent tampering.  
- **Fraud Prevention**: Contracts enforce checks to prevent double payments or unauthorized withdrawals.  
- **Emergency Pause**: Admins can pause disbursements in case of detected issues, pending dispute resolution.

## 📜 License
MIT License. See `LICENSE` for details.

## 🤝 Contributing
Contributions are welcome! Please submit pull requests or open issues on the repository.

