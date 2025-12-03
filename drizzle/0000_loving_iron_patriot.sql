CREATE TABLE `aiChatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`title` varchar(255),
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiChatConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiChatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`emotionDetected` varchar(100),
	`crisisFlag` enum('none','low','medium','high','critical') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiChatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiInsights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`insightDate` timestamp NOT NULL DEFAULT (now()),
	`insightType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`actionable` text,
	`isRead` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiInsights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availabilityExceptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availabilityExceptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`dateOfBirth` timestamp,
	`goals` text,
	`notes` text,
	`status` enum('active','inactive','completed') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coachAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coachAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coachGuidance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`guidanceType` enum('suggest','alert','reference','technique','crisis') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL,
	`message` text NOT NULL,
	`context` text,
	`timestamp` timestamp NOT NULL,
	`wasFollowed` enum('true','false') DEFAULT 'false',
	CONSTRAINT `coachGuidance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coachNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`notificationType` enum('escalation','compliance_flag','crisis_alert','new_client','session_reminder') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`relatedId` int,
	`isRead` enum('true','false') NOT NULL DEFAULT 'false',
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coachNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`specialization` text,
	`bio` text,
	`certifications` text,
	`yearsExperience` int,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int NOT NULL,
	`flagType` enum('medical_advice','diagnosis','prescription','legal_advice','financial_advice','harmful_content') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`flaggedContent` text NOT NULL,
	`aiResponse` text,
	`reviewStatus` enum('pending','reviewed','dismissed','escalated') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceFlags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copingStrategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`strategyName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`timesUsed` int NOT NULL DEFAULT 0,
	`averageEffectiveness` int,
	`lastUsed` timestamp,
	`isRecommended` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copingStrategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discountCodeUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discountCodeId` int NOT NULL,
	`userId` int,
	`sessionId` int,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discountCodeUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discountCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercent` int NOT NULL,
	`discountAmount` int,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discountCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discountCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `emotionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`journalEntryId` int,
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`emotionType` varchar(100) NOT NULL,
	`intensity` int NOT NULL,
	`trigger` text,
	`physicalSensations` text,
	`thoughts` text,
	`behaviors` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalationQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`escalationType` enum('crisis','client_request','ai_uncertainty','compliance_flag','complex_issue') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`reason` text NOT NULL,
	`context` text,
	`status` enum('pending','assigned','in_progress','resolved','closed') NOT NULL DEFAULT 'pending',
	`assignedTo` int,
	`assignedAt` timestamp,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`notificationSent` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalationQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`entryDate` timestamp NOT NULL DEFAULT (now()),
	`content` text NOT NULL,
	`mood` varchar(50),
	`moodIntensity` int,
	`emotions` text,
	`triggers` text,
	`copingStrategies` text,
	`copingEffectiveness` int,
	`resilienceScore` int,
	`isPrivate` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liveSessionTranscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`speaker` enum('client','coach') NOT NULL,
	`text` text NOT NULL,
	`timestamp` timestamp NOT NULL,
	CONSTRAINT `liveSessionTranscripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aiCoachingEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`reminderType` enum('24_hour','1_hour') NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`duration` int NOT NULL,
	`price` int NOT NULL,
	`stripePriceId` varchar(255),
	`oneTimePriceId` varchar(255),
	`subscriptionPrice` int,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessionTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`clientId` int NOT NULL,
	`sessionTypeId` int,
	`scheduledDate` timestamp NOT NULL,
	`duration` int NOT NULL,
	`price` int,
	`sessionType` varchar(100),
	`notes` text,
	`status` enum('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
	`paymentStatus` enum('pending','paid','refunded','failed') DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `similarCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseTitle` varchar(255) NOT NULL,
	`caseDescription` text NOT NULL,
	`clientIssues` text NOT NULL,
	`interventions` text NOT NULL,
	`outcome` text NOT NULL,
	`successRating` int NOT NULL,
	`timeToResolution` int,
	`coachNotes` text,
	`tags` text,
	`isPublic` enum('true','false') NOT NULL DEFAULT 'false',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `similarCases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`stripeCustomerId` varchar(255),
	`stripePriceId` varchar(255),
	`productId` varchar(64) NOT NULL,
	`status` enum('active','cancelled','past_due','unpaid') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoTestimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`quote` text NOT NULL,
	`metric` varchar(255) NOT NULL,
	`metricValue` varchar(100) NOT NULL,
	`videoUrl` text,
	`videoKey` varchar(500),
	`thumbnailUrl` text,
	`thumbnailKey` varchar(500),
	`duration` int,
	`isPublished` enum('true','false') NOT NULL DEFAULT 'false',
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoTestimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyCheckins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`checkinDate` timestamp NOT NULL DEFAULT (now()),
	`sleptWell` enum('yes','no') NOT NULL,
	`ateWell` enum('yes','no') NOT NULL,
	`movedBody` enum('yes','no') NOT NULL,
	`emotionalState` int NOT NULL,
	`followedPlan` enum('yes','no') NOT NULL,
	`controlledImpulses` enum('yes','no') NOT NULL,
	`actedLikeTargetIdentity` enum('yes','no') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyCheckins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disciplineEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`eventDate` timestamp NOT NULL DEFAULT (now()),
	`eventType` enum('impulse_controlled','impulse_failed','discipline_win','discipline_fail') NOT NULL,
	`situation` text,
	`response` text,
	`outcome` text,
	`reinforcedIdentity` enum('yes','no') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disciplineEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habitCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`habitId` int NOT NULL,
	`completionDate` timestamp NOT NULL DEFAULT (now()),
	`completed` enum('yes','no') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habitCompletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`habitName` varchar(255) NOT NULL,
	`habitDescription` text,
	`identityConnection` text,
	`frequency` enum('daily','weekly','custom') NOT NULL DEFAULT 'daily',
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identityProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`currentIdentity` text,
	`targetIdentity` text,
	`identityGaps` text,
	`coreValues` text,
	`lifeMission` text,
	`longTermVision` text,
	`identityWins` text,
	`identityContradictions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identityProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `microHabits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`microHabitName` varchar(255) NOT NULL,
	`trigger` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`identityReinforcement` text,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `microHabits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adaptiveOutcomeTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`baselineDate` timestamp NOT NULL,
	`baselineEmotionalState` int NOT NULL,
	`baselineFunctioning` int NOT NULL,
	`baselineGoals` text,
	`currentEmotionalState` int,
	`currentFunctioning` int,
	`goalsAchieved` text,
	`emotionalImprovement` int,
	`functioningImprovement` int,
	`daysInCoaching` int,
	`sleepImproved` enum('yes','no','unknown'),
	`relationshipsImproved` enum('yes','no','unknown'),
	`workPerformanceImproved` enum('yes','no','unknown'),
	`physicalHealthImproved` enum('yes','no','unknown'),
	`attributedToCoaching` enum('yes','no','partially'),
	`mostHelpfulAspect` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adaptiveOutcomeTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientPatterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patternName` varchar(255) NOT NULL,
	`patternDescription` text NOT NULL,
	`patternType` varchar(100) NOT NULL,
	`occurrenceCount` int NOT NULL DEFAULT 1,
	`affectedClientCount` int NOT NULL DEFAULT 1,
	`commonTriggers` text,
	`effectiveSolutions` text,
	`relatedPatterns` text,
	`isValidated` enum('true','false') NOT NULL DEFAULT 'false',
	`confidenceScore` int NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientPatterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendationFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`recommendationType` varchar(100) NOT NULL,
	`recommendationContent` text NOT NULL,
	`context` text,
	`wasUsed` enum('yes','no') NOT NULL,
	`wasHelpful` enum('yes','no','somewhat'),
	`rating` int,
	`feedbackNotes` text,
	`problemResolved` enum('yes','no','partially'),
	`timeToResolution` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendationFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategyAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adjustmentType` varchar(100) NOT NULL,
	`adjustmentDescription` text NOT NULL,
	`triggeringData` text,
	`expectedImprovement` text,
	`implementedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`measuredImprovement` text,
	`wasSuccessful` enum('yes','no','unknown'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategyAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `techniqueEffectiveness` (
	`id` int AUTO_INCREMENT NOT NULL,
	`techniqueName` varchar(255) NOT NULL,
	`techniqueCategory` varchar(100) NOT NULL,
	`techniqueDescription` text,
	`problemType` varchar(255) NOT NULL,
	`clientDemographic` text,
	`timesRecommended` int NOT NULL DEFAULT 0,
	`timesUsed` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`failureCount` int NOT NULL DEFAULT 0,
	`averageRating` int,
	`lastRecommended` timestamp,
	`confidenceScore` int NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `techniqueEffectiveness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trendDetection` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trendName` varchar(255) NOT NULL,
	`trendDescription` text NOT NULL,
	`trendCategory` varchar(100) NOT NULL,
	`affectedPercentage` int NOT NULL,
	`totalClientsAnalyzed` int NOT NULL,
	`affectedClientCount` int NOT NULL,
	`suggestedContent` text,
	`suggestedApproach` text,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`isAddressed` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trendDetection_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autismOutcomeTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`assessmentDate` timestamp NOT NULL,
	`atecScore` int,
	`carsScore` int,
	`communicationLevel` enum('nonverbal','minimally_verbal','verbal'),
	`behaviorScore` int,
	`adaptiveFunctionScore` int,
	`giSymptomScore` int,
	`sleepScore` int,
	`familyQOL` int,
	`parentStress` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autismOutcomeTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autismPatternDetection` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfile` text NOT NULL,
	`interventionCombination` text NOT NULL,
	`outcomeData` text NOT NULL,
	`patternType` enum('high_responder','moderate_responder','non_responder'),
	`confidence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autismPatternDetection_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autismProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childName` varchar(255) NOT NULL,
	`dateOfBirth` timestamp NOT NULL,
	`diagnosisDate` timestamp,
	`severity` enum('mild','moderate','severe') NOT NULL,
	`atecScore` int,
	`carsScore` int,
	`communicationLevel` enum('nonverbal','minimally_verbal','verbal') NOT NULL,
	`giSymptoms` text,
	`sleepIssues` text,
	`sensoryProfile` text,
	`behaviorChallenges` text,
	`familyResources` text,
	`treatmentPriorities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autismProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autismProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerType` enum('ABA','OT','speech','FMT_clinic','neurofeedback') NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`phone` varchar(50),
	`email` varchar(320),
	`website` varchar(500),
	`rating` int,
	`reviewCount` int,
	`acceptsInsurance` enum('true','false') NOT NULL,
	`costRange` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autismProviders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dietaryInterventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`dietType` enum('GFCF','ketogenic','SCD') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`adherence` int,
	`giSymptomChanges` text,
	`behaviorChanges` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dietaryInterventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interventionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`tier1Interventions` text NOT NULL,
	`tier2Interventions` text,
	`tier3Interventions` text,
	`tier4Interventions` text,
	`currentPhase` enum('foundation','biomedical','behavioral','advanced') NOT NULL,
	`startDate` timestamp NOT NULL,
	`providerDirectory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interventionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplementTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`supplementName` varchar(255) NOT NULL,
	`dosage` varchar(255) NOT NULL,
	`frequency` enum('daily','twice_daily','every_3_days') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`adherence` int,
	`sideEffects` text,
	`perceivedBenefit` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplementTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapySessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`therapyType` enum('ABA','OT','speech','Floortime','neurofeedback') NOT NULL,
	`sessionDate` timestamp NOT NULL,
	`duration` int NOT NULL,
	`goalsAddressed` text,
	`progress` text,
	`parentFeedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `therapySessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiChatConversations` ADD CONSTRAINT `aiChatConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiChatConversations` ADD CONSTRAINT `aiChatConversations_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiChatMessages` ADD CONSTRAINT `aiChatMessages_conversationId_aiChatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `aiChatConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiInsights` ADD CONSTRAINT `aiInsights_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `availabilityExceptions` ADD CONSTRAINT `availabilityExceptions_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coachAvailability` ADD CONSTRAINT `coachAvailability_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coachNotifications` ADD CONSTRAINT `coachNotifications_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaches` ADD CONSTRAINT `coaches_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceFlags` ADD CONSTRAINT `complianceFlags_conversationId_aiChatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `aiChatConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceFlags` ADD CONSTRAINT `complianceFlags_messageId_aiChatMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `aiChatMessages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceFlags` ADD CONSTRAINT `complianceFlags_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `copingStrategies` ADD CONSTRAINT `copingStrategies_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodeUsage` ADD CONSTRAINT `discountCodeUsage_discountCodeId_discountCodes_id_fk` FOREIGN KEY (`discountCodeId`) REFERENCES `discountCodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodeUsage` ADD CONSTRAINT `discountCodeUsage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodeUsage` ADD CONSTRAINT `discountCodeUsage_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCodes` ADD CONSTRAINT `discountCodes_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotionLogs` ADD CONSTRAINT `emotionLogs_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotionLogs` ADD CONSTRAINT `emotionLogs_journalEntryId_journalEntries_id_fk` FOREIGN KEY (`journalEntryId`) REFERENCES `journalEntries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalationQueue` ADD CONSTRAINT `escalationQueue_conversationId_aiChatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `aiChatConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalationQueue` ADD CONSTRAINT `escalationQueue_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalationQueue` ADD CONSTRAINT `escalationQueue_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalationQueue` ADD CONSTRAINT `escalationQueue_assignedTo_coaches_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntries` ADD CONSTRAINT `journalEntries_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessionReminders` ADD CONSTRAINT `sessionReminders_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessionTypes` ADD CONSTRAINT `sessionTypes_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_sessionTypeId_sessionTypes_id_fk` FOREIGN KEY (`sessionTypeId`) REFERENCES `sessionTypes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `similarCases` ADD CONSTRAINT `similarCases_createdBy_coaches_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyCheckins` ADD CONSTRAINT `dailyCheckins_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `disciplineEvents` ADD CONSTRAINT `disciplineEvents_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `habitCompletions` ADD CONSTRAINT `habitCompletions_habitId_habits_id_fk` FOREIGN KEY (`habitId`) REFERENCES `habits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `habits` ADD CONSTRAINT `habits_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identityProfiles` ADD CONSTRAINT `identityProfiles_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `microHabits` ADD CONSTRAINT `microHabits_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `adaptiveOutcomeTracking` ADD CONSTRAINT `adaptiveOutcomeTracking_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendationFeedback` ADD CONSTRAINT `recommendationFeedback_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autismOutcomeTracking` ADD CONSTRAINT `autismOutcomeTracking_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autismProfiles` ADD CONSTRAINT `autismProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dietaryInterventions` ADD CONSTRAINT `dietaryInterventions_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interventionPlans` ADD CONSTRAINT `interventionPlans_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplementTracking` ADD CONSTRAINT `supplementTracking_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `therapySessions` ADD CONSTRAINT `therapySessions_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;