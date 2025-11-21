# Purposeful Live Coaching - Complete Wellness Data Model

**Version:** 1.0  
**Status:** Schema Design Complete  
**Implementation Status:** Ready for Drizzle ORM Integration

---

## Overview

This document defines the complete data model for tracking all wellness metrics across the five categories (Spiritual, Mental, Emotional, Physical, Financial). The schema is designed to be flexible, scalable, and capable of accommodating new metrics as they emerge.

---

## Core Entity Relationships

```
Users (Base)
├── Coaches (extends Users)
├── Clients (managed by Coaches)
├── Subscriptions (payment tracking)
└── Wellness Profiles (5 categories)

Wellness Profiles
├── Spiritual Wellness Data
├── Mental Wellness Data
├── Emotional Wellness Data
├── Physical Wellness Data
└── Financial Wellness Data

Physical Wellness Data
├── Biometric Readings
├── Lab Results
├── Medical Records
├── Medication Tracking
├── Exercise Logs
├── Nutrition Logs
└── Sleep Records

Coaching & Sessions
├── Coaching Sessions
├── AI Chat Conversations
├── Progress Tracking
└── Recommendations

Partnerships & Products
├── Partner Companies
├── Products
├── Product Purchases
└── Revenue Tracking
```

---

## Database Schema Tables

### **1. USERS & AUTHENTICATION**

#### `users`
Core user table backing authentication and identity.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment primary key |
| openId | VARCHAR(64) | Manus OAuth identifier, unique |
| email | VARCHAR(320) | User email address |
| name | TEXT | Full name |
| phone | VARCHAR(50) | Phone number |
| dateOfBirth | TIMESTAMP | For age and health risk calculations |
| timezone | VARCHAR(50) | User's timezone for scheduling |
| loginMethod | VARCHAR(64) | oauth, email, phone, etc. |
| role | ENUM | user, coach, admin, partner |
| isActive | ENUM | true, false |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last profile update |
| lastSignedIn | TIMESTAMP | Last login date |

---

#### `coaches`
Extends users with coaching-specific information.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| specialization | TEXT | Areas of expertise (spiritual, mental, emotional, physical, financial) |
| bio | TEXT | Coach biography |
| certifications | TEXT | JSON array of certifications |
| yearsExperience | INT | Years of coaching experience |
| hourlyRate | INT | Rate in cents ($100 = 10000) |
| maxClients | INT | Maximum concurrent clients |
| currentClients | INT | Current client count |
| isActive | ENUM | true, false |
| verificationStatus | ENUM | unverified, pending, verified, rejected |
| backgroundCheckDate | TIMESTAMP | Last background check |
| createdAt | TIMESTAMP | Coach profile creation |
| updatedAt | TIMESTAMP | Last update |

---

#### `clients`
People being coached (may or may not be users).

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id (nullable if guest) |
| coachId | INT (FK) | References coaches.id |
| name | VARCHAR(255) | Client name |
| email | VARCHAR(320) | Client email |
| phone | VARCHAR(50) | Client phone |
| dateOfBirth | TIMESTAMP | For age and health risk |
| goals | TEXT | JSON array of wellness goals |
| notes | TEXT | Coach notes about client |
| status | ENUM | active, inactive, completed, paused |
| startDate | TIMESTAMP | Coaching start date |
| endDate | TIMESTAMP | Coaching end date (if completed) |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

---

### **2. WELLNESS PROFILES & CATEGORIES**

#### `wellnessProfiles`
Master profile for each user tracking across all five categories.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| clientId | INT (FK) | References clients.id (nullable) |
| spiritualScore | INT | 0-100 wellness score |
| mentalScore | INT | 0-100 wellness score |
| emotionalScore | INT | 0-100 wellness score |
| physicalScore | INT | 0-100 wellness score |
| financialScore | INT | 0-100 wellness score |
| overallWellnessScore | INT | 0-100 composite score |
| mortalityRiskScore | INT | 0-100 (Tony Braka style assessment) |
| biologicalAge | INT | Estimated biological age in years |
| chronologicalAge | INT | Actual age in years |
| lastAssessmentDate | TIMESTAMP | Last comprehensive assessment |
| nextAssessmentDate | TIMESTAMP | Recommended next assessment |
| createdAt | TIMESTAMP | Profile creation |
| updatedAt | TIMESTAMP | Last update |

---

#### `spiritualWellnessData`
Tracking spiritual practices, purpose, and meaning.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| meditationMinutesDaily | INT | Daily meditation minutes |
| meditationMinutesWeekly | INT | Weekly total |
| meditationMinutesMonthly | INT | Monthly total |
| meditationStreak | INT | Days in current streak |
| spiritualPractices | TEXT | JSON array of practices |
| purposeStatement | TEXT | Personal purpose statement |
| purposeAlignmentScore | INT | 1-10 alignment with daily actions |
| meaningAndFulfillmentRating | INT | 1-10 self-reported |
| communityConnectionFrequency | INT | Times per week |
| valuesAlignment | INT | 1-10 alignment with core values |
| gratitudePractice | INT | Times per week |
| spiritualGoals | TEXT | JSON array of goals |
| lastUpdate | TIMESTAMP | Last data entry |

---

#### `mentalWellnessData`
Tracking cognitive health, stress, sleep, and mental clarity.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| stressLevel | INT | 1-10 current level |
| stressLevelDaily | TEXT | JSON array of daily readings |
| anxietyLevel | INT | 1-10 current level |
| anxietyLevelDaily | TEXT | JSON array of daily readings |
| sleepDurationHours | DECIMAL(4,2) | Hours slept last night |
| sleepDurationWeeklyAvg | DECIMAL(4,2) | Weekly average |
| sleepQuality | INT | 1-10 quality rating |
| sleepStages | TEXT | JSON {rem: %, deep: %, light: %} |
| cognitivePerformance | INT | 1-10 self-reported |
| focusAndConcentration | INT | 1-10 rating |
| memoryPerformance | INT | 1-10 rating |
| blueLight ExposureMinutes | INT | Minutes of blue light exposure |
| screenTimeMinutes | INT | Daily screen time |
| therapySessionsCompleted | INT | Total sessions |
| medicationTracking | TEXT | JSON array of medications |
| mentalHealthGoals | TEXT | JSON array of goals |
| lastUpdate | TIMESTAMP | Last data entry |

---

#### `emotionalWellnessData`
Tracking emotions, relationships, and resilience.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| currentMood | VARCHAR(50) | joy, sadness, anger, fear, neutral, etc. |
| moodIntensity | INT | 1-10 intensity |
| emotionalRegulationScore | INT | 1-10 ability to regulate |
| emotionalResilienceScore | INT | 1-10 resilience |
| emotionalTriggers | TEXT | JSON array of known triggers |
| copingStrategiesUsed | TEXT | JSON array of strategies |
| copingStrategyEffectiveness | INT | 1-10 average effectiveness |
| relationshipQuality | INT | 1-10 overall satisfaction |
| relationshipStress | INT | 1-10 stress level |
| communicationSkills | INT | 1-10 self-rated |
| authenticityScore | INT | 1-10 living authentically |
| vulnerabilityComfort | INT | 1-10 comfort with vulnerability |
| emotionalGoals | TEXT | JSON array of goals |
| journalEntriesCount | INT | Total entries written |
| lastUpdate | TIMESTAMP | Last data entry |

---

### **3. PHYSICAL WELLNESS - BIOMETRIC TRACKING**

#### `biometricReadings`
Real-time biometric data from wearables and devices.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| readingDate | TIMESTAMP | When reading was taken |
| heartRate | INT | Beats per minute |
| heartRateVariability | INT | HRV in milliseconds |
| bloodPressureSystolic | INT | Top number (mmHg) |
| bloodPressureDiastolic | INT | Bottom number (mmHg) |
| bloodOxygen | DECIMAL(5,2) | SpO2 percentage |
| bodyTemperature | DECIMAL(5,2) | Celsius |
| respiratoryRate | INT | Breaths per minute |
| weight | DECIMAL(6,2) | Kilograms |
| bodyFatPercent | DECIMAL(5,2) | Percentage |
| muscleMassPercent | DECIMAL(5,2) | Percentage |
| waistCircumference | DECIMAL(6,2) | Centimeters |
| bloodGlucose | INT | mg/dL (for diabetics) |
| deviceSource | VARCHAR(100) | Apple Watch, Fitbit, Oura, etc. |
| createdAt | TIMESTAMP | Record creation |

---

#### `labResults`
Medical lab test results and blood work.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| testDate | TIMESTAMP | When test was performed |
| labName | VARCHAR(255) | Lab that performed test |
| testType | VARCHAR(100) | CBC, CMP, lipid panel, thyroid, etc. |
| results | TEXT | JSON object with all test values |
| referenceRanges | TEXT | JSON object with normal ranges |
| interpretation | TEXT | Doctor's interpretation |
| doctorName | VARCHAR(255) | Ordering physician |
| nextTestDate | TIMESTAMP | Recommended next test |
| createdAt | TIMESTAMP | Record creation |

---

#### `medicationTracking`
Medications, supplements, and treatments.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| medicationName | VARCHAR(255) | Drug or supplement name |
| type | ENUM | prescription, otc, supplement, herbal, nootropic |
| dosage | VARCHAR(100) | e.g., "500mg" |
| frequency | VARCHAR(100) | e.g., "twice daily" |
| startDate | TIMESTAMP | When started |
| endDate | TIMESTAMP | When stopped (nullable) |
| reason | TEXT | Why taking it |
| sideEffects | TEXT | Observed side effects |
| effectiveness | INT | 1-10 rating |
| prescribedBy | VARCHAR(255) | Doctor name |
| isActive | ENUM | true, false |
| createdAt | TIMESTAMP | Record creation |

---

#### `exerciseLogs`
Detailed exercise and activity tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| exerciseDate | TIMESTAMP | When exercise occurred |
| exerciseType | VARCHAR(100) | running, cycling, weight training, yoga, etc. |
| durationMinutes | INT | Total duration |
| intensity | ENUM | light, moderate, vigorous |
| caloriesBurned | INT | Estimated calories |
| distance | DECIMAL(8,2) | Distance in kilometers (if applicable) |
| avgHeartRate | INT | Average heart rate during exercise |
| maxHeartRate | INT | Maximum heart rate reached |
| notes | TEXT | How felt, observations |
| deviceSource | VARCHAR(100) | Apple Watch, Fitbit, Strava, etc. |
| createdAt | TIMESTAMP | Record creation |

---

#### `nutritionLogs`
Detailed nutrition and dietary tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| logDate | TIMESTAMP | Date of log |
| mealType | ENUM | breakfast, lunch, dinner, snack |
| foodItems | TEXT | JSON array of foods eaten |
| calories | INT | Total calories |
| protein | DECIMAL(6,2) | Grams |
| carbohydrates | DECIMAL(6,2) | Grams |
| fat | DECIMAL(6,2) | Grams |
| fiber | DECIMAL(6,2) | Grams |
| sugar | DECIMAL(6,2) | Grams |
| sodium | INT | Milligrams |
| waterIntakeOunces | INT | Ounces of water consumed |
| vitaminDMicrograms | DECIMAL(6,2) | Vitamin D intake |
| vitaminB12Micrograms | DECIMAL(6,2) | Vitamin B12 intake |
| ironMilligrams | DECIMAL(6,2) | Iron intake |
| zincMilligrams | DECIMAL(6,2) | Zinc intake |
| magnesiumMilligrams | DECIMAL(6,2) | Magnesium intake |
| notes | TEXT | Observations, how felt |
| createdAt | TIMESTAMP | Record creation |

---

#### `sleepRecords`
Detailed sleep tracking and analysis.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| sleepDate | TIMESTAMP | Date of sleep |
| bedtime | TIMESTAMP | When went to bed |
| wakeTime | TIMESTAMP | When woke up |
| totalSleepMinutes | INT | Total sleep duration |
| remSleepMinutes | INT | REM sleep duration |
| deepSleepMinutes | INT | Deep sleep duration |
| lightSleepMinutes | INT | Light sleep duration |
| awakeMinutes | INT | Time awake during night |
| sleepQuality | INT | 1-10 quality rating |
| sleepEnvironmentTemp | DECIMAL(5,2) | Room temperature (Celsius) |
| sleepEnvironmentNoise | INT | Noise level (dB) |
| screenTimeBeforeBed | INT | Minutes of screen time before bed |
| blueLight BlockingUsed | ENUM | true, false |
| exerciseTimeBeforeBed | INT | Hours since last exercise |
| caffeineBefore Bed | ENUM | true, false |
| alcoholBefore Bed | ENUM | true, false |
| meditationBefore Bed | INT | Minutes of meditation |
| sleepAids | TEXT | JSON array of aids used |
| deviceSource | VARCHAR(100) | Oura Ring, Apple Watch, etc. |
| createdAt | TIMESTAMP | Record creation |

---

#### `medicalRecords`
Medical conditions, diagnoses, and procedures.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| recordType | ENUM | diagnosis, procedure, surgery, vaccination, allergy |
| name | VARCHAR(255) | Condition or procedure name |
| dateOccurred | TIMESTAMP | When it occurred |
| description | TEXT | Details |
| severity | ENUM | mild, moderate, severe, critical |
| status | ENUM | active, resolved, managed |
| treatedBy | VARCHAR(255) | Healthcare provider |
| notes | TEXT | Additional notes |
| createdAt | TIMESTAMP | Record creation |

---

#### `environmentalTracking`
Environmental factors affecting health.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| trackingDate | TIMESTAMP | Date of tracking |
| airQualityIndex | INT | AQI score |
| airQualityCategory | VARCHAR(50) | Good, Moderate, Unhealthy, etc. |
| pollutants | TEXT | JSON {pm25, pm10, o3, no2, so2, co} |
| temperature | DECIMAL(5,2) | Celsius |
| humidity | INT | Percentage |
| weatherCondition | VARCHAR(100) | Sunny, rainy, cloudy, etc. |
| uvIndex | INT | 0-11 scale |
| naturalLightExposure | INT | Minutes of natural light |
| sleepEnvironmentQuality | INT | 1-10 rating |
| workEnvironmentQuality | INT | 1-10 rating |
| createdAt | TIMESTAMP | Record creation |

---

#### `advancedTherapies`
Tracking of advanced wellness therapies.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| therapyType | ENUM | stem_cell, iv_therapy, ozone, hyperbaric, cryo, sauna, ice_bath, plant_medicine |
| therapyDate | TIMESTAMP | When therapy occurred |
| provider | VARCHAR(255) | Provider name |
| location | VARCHAR(255) | Where therapy occurred |
| protocol | TEXT | Specific protocol used |
| dosage | VARCHAR(100) | If applicable |
| cost | INT | Cost in cents |
| results | TEXT | Observed results and effects |
| sideEffects | TEXT | Any side effects |
| followUpDate | TIMESTAMP | Recommended follow-up |
| notes | TEXT | Additional notes |
| createdAt | TIMESTAMP | Record creation |

---

### **4. FINANCIAL WELLNESS**

#### `financialWellnessData`
Comprehensive financial tracking and goals.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| monthlyIncome | INT | Monthly income in cents |
| monthlyExpenses | INT | Monthly expenses in cents |
| savingsRate | DECIMAL(5,2) | Percentage saved |
| netWorth | INT | Total net worth in cents |
| investmentPortfolioValue | INT | Total investments in cents |
| debtTotal | INT | Total debt in cents |
| emergencyFundMonths | DECIMAL(4,2) | Months of expenses saved |
| financialStressLevel | INT | 1-10 rating |
| financialGoals | TEXT | JSON array of goals |
| financialLiteracyScore | INT | 1-10 self-rated |
| lastUpdate | TIMESTAMP | Last data entry |

---

#### `incomeTracking`
Detailed income tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| incomeDate | TIMESTAMP | When income received |
| incomeType | ENUM | salary, bonus, side_income, investment_return, other |
| amount | INT | Amount in cents |
| source | VARCHAR(255) | Source of income |
| notes | TEXT | Additional notes |
| createdAt | TIMESTAMP | Record creation |

---

#### `expenseTracking`
Detailed expense tracking by category.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| expenseDate | TIMESTAMP | When expense occurred |
| category | VARCHAR(100) | housing, food, transport, health, entertainment, etc. |
| amount | INT | Amount in cents |
| description | VARCHAR(255) | Description |
| recurring | ENUM | true, false |
| notes | TEXT | Additional notes |
| createdAt | TIMESTAMP | Record creation |

---

### **5. COACHING & SESSIONS**

#### `coachingSessions`
Records of all coaching sessions.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| coachId | INT (FK) | References coaches.id |
| clientId | INT (FK) | References clients.id |
| sessionDate | TIMESTAMP | When session occurred |
| durationMinutes | INT | Session length |
| sessionType | ENUM | spiritual, mental, emotional, physical, financial |
| format | ENUM | video, phone, in_person, group |
| topicsCovered | TEXT | JSON array of topics |
| clientProgress | TEXT | Notes on client progress |
| coachNotes | TEXT | Coach observations |
| homeworkAssigned | TEXT | Homework or action items |
| nextSessionDate | TIMESTAMP | Scheduled next session |
| status | ENUM | scheduled, completed, cancelled, no_show |
| paymentStatus | ENUM | pending, paid, refunded |
| cost | INT | Session cost in cents |
| createdAt | TIMESTAMP | Record creation |

---

#### `aiChatConversations`
24/7 AI coaching conversations.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| conversationDate | TIMESTAMP | When conversation started |
| wellnessCategory | ENUM | spiritual, mental, emotional, physical, financial |
| messages | TEXT | JSON array of messages |
| sentiment | VARCHAR(50) | Overall sentiment |
| emotionalState | VARCHAR(50) | Detected emotional state |
| topicsDiscussed | TEXT | JSON array of topics |
| aiRecommendations | TEXT | Recommendations provided |
| escalationNeeded | ENUM | true, false |
| escalationReason | TEXT | Why escalation needed |
| humanCoachAssigned | INT | Coach ID if escalated |
| createdAt | TIMESTAMP | Record creation |

---

#### `progressTracking`
Tracking progress toward wellness goals.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| goalId | INT (FK) | References wellness goals |
| trackingDate | TIMESTAMP | When tracked |
| progressPercentage | INT | 0-100% complete |
| metricsAchieved | TEXT | JSON array of metrics met |
| obstacles | TEXT | Obstacles encountered |
| nextSteps | TEXT | Next steps |
| coachFeedback | TEXT | Coach feedback |
| createdAt | TIMESTAMP | Record creation |

---

### **6. PARTNERSHIPS & PRODUCTS**

#### `partnerCompanies`
Partner companies and vendors.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| companyName | VARCHAR(255) | Partner company name |
| category | VARCHAR(100) | wearables, supplements, services, equipment, etc. |
| contactEmail | VARCHAR(320) | Primary contact |
| contactPhone | VARCHAR(50) | Phone number |
| commissionPercentage | DECIMAL(5,2) | Commission % (e.g., 15.00) |
| partnershipStatus | ENUM | active, inactive, pending, rejected |
| contractStartDate | TIMESTAMP | Partnership start date |
| contractEndDate | TIMESTAMP | Partnership end date |
| notes | TEXT | Partnership terms and notes |
| createdAt | TIMESTAMP | Record creation |

---

#### `products`
Products available through the marketplace.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| partnerId | INT (FK) | References partnerCompanies.id |
| productName | VARCHAR(255) | Product name |
| category | VARCHAR(100) | wearables, supplements, equipment, services |
| description | TEXT | Product description |
| price | INT | Price in cents |
| commissionPercentage | DECIMAL(5,2) | Commission % |
| affiliateLink | VARCHAR(500) | Affiliate link |
| productUrl | VARCHAR(500) | Product URL |
| wellnessCategory | ENUM | spiritual, mental, emotional, physical, financial |
| isActive | ENUM | true, false |
| createdAt | TIMESTAMP | Record creation |

---

#### `productPurchases`
Tracking of product purchases and revenue.

| Field | Type | Notes |
|-------|------|-------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | References users.id |
| productId | INT (FK) | References products.id |
| purchaseDate | TIMESTAMP | When purchased |
| purchasePrice | INT | Price paid in cents |
| commissionAmount | INT | Commission earned in cents |
| paymentStatus | ENUM | pending, paid, refunded |
| referralSource | VARCHAR(100) | How user found product |
| notes | TEXT | Additional notes |
| createdAt | TIMESTAMP | Record creation |

---

## Implementation Notes

**Data Privacy & Security:**
- All health data encrypted at rest
- HIPAA-compliant access controls
- Audit logging for all data access
- User consent tracking for data usage
- Regular security audits

**Data Quality:**
- Validation rules for all inputs
- Outlier detection for biometric data
- Data completeness tracking
- Automatic data cleaning
- Version control for historical data

**Scalability:**
- Partitioned by user for performance
- Indexed for common queries
- Archive strategy for historical data
- Real-time data ingestion capability
- Support for high-frequency data (wearables)

**Integration Points:**
- Wearable device APIs (Apple Health, Google Fit, Fitbit, Oura, etc.)
- Lab testing platforms
- EHR systems
- Payment processors
- Email and notification systems
- AI/ML platforms

---

## Next Steps

This data model is ready for implementation in Drizzle ORM. The next phase will create the actual TypeScript schema definitions and database migrations.

See the **Agent Onboarding Guide** for instructions on implementing specific data features.
