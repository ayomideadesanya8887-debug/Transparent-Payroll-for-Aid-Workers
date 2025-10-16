import { describe, it, expect, beforeEach } from "vitest";
import { uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INSUFFICIENT_FUNDS = 101;
const ERR_INVALID_WORKER = 102;
const ERR_DISPUTE_ACTIVE = 103;
const ERR_PAUSED = 104;
const ERR_INVALID_AMOUNT = 105;
const ERR_INVALID_SCHEDULE = 106;
const ERR_ALREADY_DISBURSED = 107;
const ERR_INVALID_TIMESTAMP = 108;
const ERR_CONTRACT_NOT_SET = 109;
const ERR_INVALID_STATUS = 110;
const ERR_MAX_DISBURSEMENTS_EXCEEDED = 111;
const ERR_INVALID_PAYROLL_POOL = 112;
const ERR_INVALID_ADMIN = 113;
const ERR_INVALID_WORKER_ROLE = 114;
const ERR_INVALID_CURRENCY = 115;
const ERR_INVALID_GRACE_PERIOD = 116;
const ERR_INVALID_PENALTY_RATE = 117;
const ERR_INVALID_VOTING_THRESHOLD = 118;
const ERR_INVALID_LOCATION = 119;
const ERR_INVALID_GROUP_ID = 120;

interface Disbursement {
  worker: string;
  amount: number;
  timestamp: number;
  status: boolean;
}

interface WorkerSchedule {
  schedule: number;
  lastDisbursed: number;
  amount: number;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class PayrollDisbursementMock {
  state: {
    contractAdmin: string;
    isPaused: boolean;
    maxDisbursements: number;
    payrollPoolBalance: number;
    nextDisbursementId: number;
    workerRegistryContract: string | null;
    payrollFundingContract: string | null;
    disputeResolutionContract: string | null;
    auditLogContract: string | null;
    transparencyReportContract: string | null;
    disbursements: Map<number, Disbursement>;
    workerSchedules: Map<string, WorkerSchedule>;
    workerRoles: Map<string, string>;
    disbursementHistory: Map<string, number[]>;
    payrollGroups: Map<number, { name: string; members: string[] }>;
    groupAdmins: Map<number, string>;
    currencies: Map<string, boolean>;
    gracePeriods: Map<string, number>;
    penaltyRates: Map<string, number>;
    votingThresholds: Map<number, number>;
    locations: Map<string, string>;
  } = this.resetState();
  blockHeight: number = 0;
  caller: string = "ST1ADMIN";
  stxTransfers: Array<{ amount: number; from: string; to: string }> = [];

  private resetState() {
    return {
      contractAdmin: "ST1ADMIN",
      isPaused: false,
      maxDisbursements: 1000,
      payrollPoolBalance: 0,
      nextDisbursementId: 0,
      workerRegistryContract: null,
      payrollFundingContract: null,
      disputeResolutionContract: null,
      auditLogContract: null,
      transparencyReportContract: null,
      disbursements: new Map(),
      workerSchedules: new Map(),
      workerRoles: new Map(),
      disbursementHistory: new Map(),
      payrollGroups: new Map(),
      groupAdmins: new Map(),
      currencies: new Map(),
      gracePeriods: new Map(),
      penaltyRates: new Map(),
      votingThresholds: new Map(),
      locations: new Map(),
    };
  }

  reset() {
    this.state = this.resetState();
    this.blockHeight = 0;
    this.caller = "ST1ADMIN";
    this.stxTransfers = [];
  }

  setWorkerRegistry(contract: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.workerRegistryContract = contract;
    return { ok: true, value: true };
  }

  setPayrollFunding(contract: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.payrollFundingContract = contract;
    return { ok: true, value: true };
  }

  setDisputeResolution(contract: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.disputeResolutionContract = contract;
    return { ok: true, value: true };
  }

  setAuditLog(contract: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.auditLogContract = contract;
    return { ok: true, value: true };
  }

  setTransparencyReport(contract: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.transparencyReportContract = contract;
    return { ok: true, value: true };
  }

  pauseContract(): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.isPaused = true;
    return { ok: true, value: true };
  }

  unpauseContract(): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.isPaused = false;
    return { ok: true, value: true };
  }

  setMaxDisbursements(newMax: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.maxDisbursements = newMax;
    return { ok: true, value: true };
  }

  addCurrency(currency: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.currencies.set(currency, true);
    return { ok: true, value: true };
  }

  setWorkerSchedule(worker: string, schedule: number, amount: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (schedule <= 0) return { ok: false, value: ERR_INVALID_SCHEDULE };
    if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
    this.state.workerSchedules.set(worker, { schedule, lastDisbursed: 0, amount });
    return { ok: true, value: true };
  }

  setWorkerRole(worker: string, role: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.workerRoles.set(worker, role);
    return { ok: true, value: true };
  }

  createPayrollGroup(groupId: number, name: string, members: string[]): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.payrollGroups.set(groupId, { name, members });
    this.state.groupAdmins.set(groupId, this.caller);
    return { ok: true, value: true };
  }

  setGracePeriod(worker: string, period: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (period > 30) return { ok: false, value: ERR_INVALID_GRACE_PERIOD };
    this.state.gracePeriods.set(worker, period);
    return { ok: true, value: true };
  }

  setPenaltyRate(worker: string, rate: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (rate > 100) return { ok: false, value: ERR_INVALID_PENALTY_RATE };
    this.state.penaltyRates.set(worker, rate);
    return { ok: true, value: true };
  }

  setVotingThreshold(groupId: number, threshold: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (threshold <= 0 || threshold > 100) return { ok: false, value: ERR_INVALID_VOTING_THRESHOLD };
    this.state.votingThresholds.set(groupId, threshold);
    return { ok: true, value: true };
  }

  setLocation(worker: string, loc: string): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!loc || loc.length > 100) return { ok: false, value: ERR_INVALID_LOCATION };
    this.state.locations.set(worker, loc);
    return { ok: true, value: true };
  }

  disburseSalary(worker: string): Result<number> {
    if (this.state.isPaused) return { ok: false, value: ERR_PAUSED };
    if (this.state.nextDisbursementId >= this.state.maxDisbursements) return { ok: false, value: ERR_MAX_DISBURSEMENTS_EXCEEDED };
    if (!this.state.workerSchedules.has(worker)) return { ok: false, value: ERR_INVALID_WORKER };
    const sched = this.state.workerSchedules.get(worker)!;
    if (this.blockHeight < sched.lastDisbursed + sched.schedule) return { ok: false, value: ERR_ALREADY_DISBURSED };
    if (this.state.payrollPoolBalance < sched.amount) return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
    this.state.payrollPoolBalance -= sched.amount;
    const id = this.state.nextDisbursementId;
    this.state.disbursements.set(id, { worker, amount: sched.amount, timestamp: this.blockHeight, status: true });
    this.state.workerSchedules.set(worker, { ...sched, lastDisbursed: this.blockHeight });
    const history = this.state.disbursementHistory.get(worker) || [];
    this.state.disbursementHistory.set(worker, [...history, id]);
    this.stxTransfers.push({ amount: sched.amount, from: "contract", to: worker });
    this.state.nextDisbursementId++;
    return { ok: true, value: id };
  }

  updatePoolBalance(amount: number): Result<boolean> {
    if (!this.state.payrollFundingContract || this.caller !== this.state.payrollFundingContract) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.payrollPoolBalance += amount;
    return { ok: true, value: true };
  }

  withdrawFunds(amount: number): Result<boolean> {
    if (this.caller !== this.state.contractAdmin) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (this.state.payrollPoolBalance < amount) return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
    this.state.payrollPoolBalance -= amount;
    this.stxTransfers.push({ amount, from: "contract", to: this.state.contractAdmin });
    return { ok: true, value: true };
  }

  getPayrollPoolBalance(): Result<number> {
    return { ok: true, value: this.state.payrollPoolBalance };
  }

  getNextDisbursementId(): Result<number> {
    return { ok: true, value: this.state.nextDisbursementId };
  }
}

describe("PayrollDisbursement", () => {
  let contract: PayrollDisbursementMock;

  beforeEach(() => {
    contract = new PayrollDisbursementMock();
    contract.reset();
  });

  it("sets worker registry successfully", () => {
    const result = contract.setWorkerRegistry("ST2REG");
    expect(result.ok).toBe(true);
    expect(contract.state.workerRegistryContract).toBe("ST2REG");
  });

  it("rejects set worker registry by non-admin", () => {
    contract.caller = "ST3FAKE";
    const result = contract.setWorkerRegistry("ST2REG");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("sets payroll funding successfully", () => {
    const result = contract.setPayrollFunding("ST3FUND");
    expect(result.ok).toBe(true);
    expect(contract.state.payrollFundingContract).toBe("ST3FUND");
  });

  it("pauses contract successfully", () => {
    const result = contract.pauseContract();
    expect(result.ok).toBe(true);
    expect(contract.state.isPaused).toBe(true);
  });

  it("unpauses contract successfully", () => {
    contract.pauseContract();
    const result = contract.unpauseContract();
    expect(result.ok).toBe(true);
    expect(contract.state.isPaused).toBe(false);
  });

  it("sets max disbursements successfully", () => {
    const result = contract.setMaxDisbursements(2000);
    expect(result.ok).toBe(true);
    expect(contract.state.maxDisbursements).toBe(2000);
  });

  it("adds currency successfully", () => {
    const result = contract.addCurrency("STX");
    expect(result.ok).toBe(true);
    expect(contract.state.currencies.get("STX")).toBe(true);
  });

  it("sets worker schedule successfully", () => {
    const result = contract.setWorkerSchedule("ST4WORKER", 30, 1000);
    expect(result.ok).toBe(true);
    const sched = contract.state.workerSchedules.get("ST4WORKER");
    expect(sched?.schedule).toBe(30);
    expect(sched?.amount).toBe(1000);
  });

  it("rejects invalid worker schedule", () => {
    const result = contract.setWorkerSchedule("ST4WORKER", 0, 1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_SCHEDULE);
  });

  it("sets worker role successfully", () => {
    const result = contract.setWorkerRole("ST4WORKER", "aid-worker");
    expect(result.ok).toBe(true);
    expect(contract.state.workerRoles.get("ST4WORKER")).toBe("aid-worker");
  });

  it("creates payroll group successfully", () => {
    const result = contract.createPayrollGroup(1, "GroupA", ["ST4WORKER"]);
    expect(result.ok).toBe(true);
    const group = contract.state.payrollGroups.get(1);
    expect(group?.name).toBe("GroupA");
    expect(group?.members).toEqual(["ST4WORKER"]);
  });

  it("sets grace period successfully", () => {
    const result = contract.setGracePeriod("ST4WORKER", 10);
    expect(result.ok).toBe(true);
    expect(contract.state.gracePeriods.get("ST4WORKER")).toBe(10);
  });

  it("rejects invalid grace period", () => {
    const result = contract.setGracePeriod("ST4WORKER", 31);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_GRACE_PERIOD);
  });

  it("sets penalty rate successfully", () => {
    const result = contract.setPenaltyRate("ST4WORKER", 5);
    expect(result.ok).toBe(true);
    expect(contract.state.penaltyRates.get("ST4WORKER")).toBe(5);
  });

  it("rejects invalid penalty rate", () => {
    const result = contract.setPenaltyRate("ST4WORKER", 101);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PENALTY_RATE);
  });

  it("sets voting threshold successfully", () => {
    const result = contract.setVotingThreshold(1, 50);
    expect(result.ok).toBe(true);
    expect(contract.state.votingThresholds.get(1)).toBe(50);
  });

  it("rejects invalid voting threshold", () => {
    const result = contract.setVotingThreshold(1, 101);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_VOTING_THRESHOLD);
  });

  it("sets location successfully", () => {
    const result = contract.setLocation("ST4WORKER", "HighRiskArea");
    expect(result.ok).toBe(true);
    expect(contract.state.locations.get("ST4WORKER")).toBe("HighRiskArea");
  });

  it("rejects invalid location", () => {
    const longLoc = "a".repeat(101);
    const result = contract.setLocation("ST4WORKER", longLoc);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_LOCATION);
  });

  it("disburses salary successfully", () => {
    contract.setWorkerSchedule("ST4WORKER", 30, 1000);
    contract.state.payrollPoolBalance = 2000;
    contract.blockHeight = 30;
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);
    expect(contract.state.payrollPoolBalance).toBe(1000);
    const disp = contract.state.disbursements.get(0);
    expect(disp?.amount).toBe(1000);
    expect(contract.stxTransfers).toEqual([{ amount: 1000, from: "contract", to: "ST4WORKER" }]);
  });

  it("rejects disbursement when paused", () => {
    contract.pauseContract();
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_PAUSED);
  });

  it("rejects disbursement over max", () => {
    contract.state.maxDisbursements = 0;
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_DISBURSEMENTS_EXCEEDED);
  });

  it("rejects disbursement for invalid worker", () => {
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_WORKER);
  });

  it("rejects early disbursement", () => {
    contract.setWorkerSchedule("ST4WORKER", 30, 1000);
    contract.state.payrollPoolBalance = 1000;
    contract.blockHeight = 10;
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_ALREADY_DISBURSED);
  });

  it("rejects disbursement with insufficient funds", () => {
    contract.setWorkerSchedule("ST4WORKER", 30, 1000);
    contract.state.payrollPoolBalance = 500;
    contract.blockHeight = 30;
    const result = contract.disburseSalary("ST4WORKER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INSUFFICIENT_FUNDS);
  });

  it("updates pool balance successfully", () => {
    contract.setPayrollFunding("ST3FUND");
    contract.caller = "ST3FUND";
    const result = contract.updatePoolBalance(2000);
    expect(result.ok).toBe(true);
    expect(contract.state.payrollPoolBalance).toBe(2000);
  });

  it("rejects update pool by unauthorized", () => {
    const result = contract.updatePoolBalance(2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("withdraws funds successfully", () => {
    contract.state.payrollPoolBalance = 2000;
    const result = contract.withdrawFunds(1000);
    expect(result.ok).toBe(true);
    expect(contract.state.payrollPoolBalance).toBe(1000);
    expect(contract.stxTransfers).toEqual([{ amount: 1000, from: "contract", to: "ST1ADMIN" }]);
  });

  it("rejects withdraw by non-admin", () => {
    contract.caller = "ST3FAKE";
    const result = contract.withdrawFunds(1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("rejects withdraw with insufficient funds", () => {
    contract.state.payrollPoolBalance = 500;
    const result = contract.withdrawFunds(1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INSUFFICIENT_FUNDS);
  });

  it("gets payroll pool balance", () => {
    contract.state.payrollPoolBalance = 1500;
    const result = contract.getPayrollPoolBalance();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(1500);
  });

  it("gets next disbursement id", () => {
    contract.state.nextDisbursementId = 5;
    const result = contract.getNextDisbursementId();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(5);
  });

  it("uses Clarity types for amounts", () => {
    const amountCV = uintCV(1000);
    expect(amountCV.value).toEqual(BigInt(1000));
  });
});