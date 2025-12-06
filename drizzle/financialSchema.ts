/**
 * FINANCIAL CHALLENGES MODULE
 * Evidence-based approach using Behavioral Economics, Financial Psychology, and Debt Recovery Research
 * Research sources: Dan Ariely (behavioral economics), Financial Therapy Association, Dave Ramsey's debt snowball research
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Financial Profiles
export const financialProfiles = mysqlTable("financial_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Financial Situation
  employmentStatus: mysqlEnum("employment_status", ["employed", "self_employed", "unemployed", "underemployed", "student", "retired"]),
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
  incomeStability: mysqlEnum("income_stability", ["stable", "variable", "unstable"]),
  
  // Debt Situation
  totalDebt: decimal("total_debt", { precision: 10, scale: 2 }),
  debtTypes: text("debt_types"), // JSON array: credit_card, student_loan, medical, personal, etc.
  
  // Financial Health
  hasEmergencyFund: boolean("has_emergency_fund").default(false),
  emergencyFundMonths: int("emergency_fund_months"), // How many months of expenses covered
  hasBudget: boolean("has_budget").default(false),
  tracksSpending: boolean("tracks_spending").default(false),
  
  // Financial Stress Level
  financialStressLevel: int("financial_stress_level"), // 1-10
  
  // Primary Financial Goal
  primaryGoal: mysqlEnum("primary_goal", [
    "get_out_of_debt",
    "build_emergency_fund",
    "increase_income",
    "stop_overspending",
    "save_for_goal",
    "invest_for_future",
    "improve_credit_score",
    "financial_literacy"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Money Mindset (psychological factors)
  moneyScripts: text("money_scripts"), // JSON array: beliefs about money from childhood
  financialTrauma: text("financial_trauma"), // Past financial hardships
  
  // Behavioral Patterns
  impulseBuyingTriggers: text("impulse_buying_triggers"), // JSON array
  emotionalSpendingTriggers: text("emotional_spending_triggers"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Debt Tracking (Debt Snowball/Avalanche Method)
export const debtAccounts = mysqlTable("debt_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  debtType: mysqlEnum("debt_type", [
    "credit_card",
    "student_loan",
    "car_loan",
    "personal_loan",
    "medical_debt",
    "payday_loan",
    "mortgage",
    "other"
  ]).notNull(),
  
  creditorName: varchar("creditor_name", { length: 255 }).notNull(),
  
  // Debt Details
  originalBalance: decimal("original_balance", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }), // APR
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }),
  
  // Payoff Strategy
  payoffMethod: mysqlEnum("payoff_method", ["snowball", "avalanche", "custom"]), // Snowball = smallest first, Avalanche = highest interest first
  payoffPriority: int("payoff_priority"), // 1 = pay off first
  
  // Tracking
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: decimal("last_payment_amount", { precision: 10, scale: 2 }),
  
  // Projections
  projectedPayoffDate: timestamp("projected_payoff_date"),
  totalInterestPaid: decimal("total_interest_paid", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("status", ["active", "in_collections", "paid_off", "settled"]),
  paidOffDate: timestamp("paid_off_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Debt Payments Log
export const debtPayments = mysqlTable("debt_payments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  debtAccountId: varchar("debt_account_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  paymentDate: timestamp("payment_date").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  
  principalPaid: decimal("principal_paid", { precision: 10, scale: 2 }),
  interestPaid: decimal("interest_paid", { precision: 10, scale: 2 }),
  
  balanceAfterPayment: decimal("balance_after_payment", { precision: 10, scale: 2 }),
  
  // Emotional Impact (behavioral economics)
  emotionalImpact: int("emotional_impact"), // 1-10 (how good did it feel?)
  motivationBoost: int("motivation_boost"), // 1-10
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget Tracking (Zero-Based Budgeting)
export const budgetCategories = mysqlTable("budget_categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  categoryType: mysqlEnum("category_type", [
    "housing",
    "utilities",
    "food",
    "transportation",
    "insurance",
    "debt_payments",
    "savings",
    "personal",
    "entertainment",
    "giving",
    "other"
  ]).notNull(),
  
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  
  // Budget Amounts
  plannedAmount: decimal("planned_amount", { precision: 10, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Tracking
  isEssential: boolean("is_essential").default(true), // Can't cut this
  isVariable: boolean("is_variable").default(false), // Amount changes monthly
  
  // Month
  budgetMonth: varchar("budget_month", { length: 7 }), // YYYY-MM format
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense Tracking
export const expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  expenseDate: timestamp("expense_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  categoryId: varchar("category_id", { length: 255 }),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  
  description: varchar("description", { length: 255 }),
  merchant: varchar("merchant", { length: 255 }),
  
  // Behavioral Tracking
  wasPlanned: boolean("was_planned"), // Was this in the budget?
  wasNecessary: boolean("was_necessary"), // Did you really need this?
  wasImpulse: boolean("was_impulse"), // Impulse purchase?
  
  emotionalState: varchar("emotional_state", { length: 100 }), // What were you feeling when you bought this?
  trigger: varchar("trigger", { length: 255 }), // What triggered this purchase?
  
  // Regret/Satisfaction
  satisfactionLevel: int("satisfaction_level"), // 1-10
  regretLevel: int("regret_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Income Tracking
export const incomeEntries = mysqlTable("income_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  incomeDate: timestamp("income_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  incomeType: mysqlEnum("income_type", [
    "salary",
    "hourly_wages",
    "freelance",
    "side_hustle",
    "passive_income",
    "bonus",
    "gift",
    "refund",
    "other"
  ]).notNull(),
  
  source: varchar("source", { length: 255 }),
  description: text("description"),
  
  isRecurring: boolean("is_recurring").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Savings Goals
export const savingsGoals = mysqlTable("savings_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  goalType: mysqlEnum("goal_type", [
    "emergency_fund",
    "down_payment",
    "vacation",
    "car",
    "education",
    "retirement",
    "wedding",
    "other"
  ]).notNull(),
  
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Goal Details
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Contribution Plan
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }),
  
  // Progress
  percentComplete: int("percent_complete").default(0),
  
  // Motivation
  whyItMatters: text("why_it_matters"),
  visualReminder: varchar("visual_reminder", { length: 255 }), // Image URL
  
  status: mysqlEnum("status", ["active", "paused", "completed", "abandoned"]),
  completedDate: timestamp("completed_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Wins (Celebrate Progress)
export const financialWins = mysqlTable("financial_wins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  winDate: timestamp("win_date").notNull(),
  
  winType: mysqlEnum("win_type", [
    "debt_paid_off",
    "emergency_fund_milestone",
    "savings_goal_reached",
    "budget_followed",
    "no_impulse_buys",
    "income_increased",
    "credit_score_improved",
    "financial_habit_built"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Impact
  amountInvolved: decimal("amount_involved", { precision: 10, scale: 2 }),
  emotionalImpact: int("emotional_impact"), // 1-10
  
  // Reflection
  whatYouLearned: text("what_you_learned"),
  whoYouBecame: text("who_you_became"), // Identity shift
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Money Mindset Reflections
export const moneyMindsetReflections = mysqlTable("money_mindset_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reflectionDate: timestamp("reflection_date").notNull(),
  
  // Reflection Prompts
  promptType: mysqlEnum("prompt_type", [
    "money_scripts", // What did you learn about money growing up?
    "scarcity_vs_abundance", // Do you operate from scarcity or abundance?
    "self_worth", // How is your self-worth tied to money?
    "comparison", // How does comparing yourself to others affect your spending?
    "emotional_spending", // What emotions trigger spending?
    "financial_fears", // What are you afraid of financially?
    "financial_dreams" // What would financial freedom look like?
  ]).notNull(),
  
  reflection: text("reflection").notNull(),
  
  // Insights
  insights: text("insights"),
  limitingBeliefs: text("limiting_beliefs"), // JSON array
  empoweringBeliefs: text("empowering_beliefs"), // JSON array
  
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Education Progress
export const financialEducation = mysqlTable("financial_education", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  topic: mysqlEnum("topic", [
    "budgeting_basics",
    "debt_payoff_strategies",
    "emergency_fund",
    "investing_101",
    "retirement_planning",
    "credit_scores",
    "tax_basics",
    "insurance",
    "real_estate",
    "behavioral_finance"
  ]).notNull(),
  
  resourceType: mysqlEnum("resource_type", ["article", "video", "course", "book", "podcast"]),
  resourceName: varchar("resource_name", { length: 255 }),
  resourceUrl: text("resource_url"),
  
  completedDate: timestamp("completed_date"),
  
  // Application
  keyTakeaways: text("key_takeaways"), // JSON array
  appliedLearning: text("applied_learning"), // How did you use this?
  
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]),
  
  createdAt: timestamp("created_at").defaultNow(),
});
