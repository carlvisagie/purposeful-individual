CREATE TABLE `dbt_skills_practice` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`module` enum('mindfulness','distress_tolerance','emotion_regulation','interpersonal_effectiveness') NOT NULL,
	`skill_name` varchar(255) NOT NULL,
	`situation` text,
	`emotion_before` varchar(255),
	`intensity_before` int,
	`skill_steps_used` text,
	`effectiveness` int,
	`emotion_after` varchar(255),
	`intensity_after` int,
	`what_worked` text,
	`what_didnt_work` text,
	`next_time` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `dbt_skills_practice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_health_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`primary_diagnosis` varchar(255),
	`secondary_diagnoses` text,
	`diagnosis_date` timestamp,
	`treatment_history` text,
	`current_severity` enum('mild','moderate','severe','crisis'),
	`in_treatment` boolean DEFAULT false,
	`medication_list` text,
	`therapy_type` varchar(255),
	`suicidal_ideation` boolean DEFAULT false,
	`self_harm_risk` enum('none','low','moderate','high'),
	`crisis_contact_info` text,
	`recovery_goals` text,
	`current_phase` enum('crisis_stabilization','active_treatment','maintenance','recovery'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mental_health_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_logs` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`overall_mood` int,
	`anxiety` int,
	`depression` int,
	`irritability` int,
	`energy` int,
	`sleep_quality` int,
	`symptoms` text,
	`self_care_completed` boolean,
	`social_interaction` boolean,
	`physical_activity` boolean,
	`substance_use` boolean,
	`triggers` text,
	`coping_strategies_used` text,
	`coping_effectiveness` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mood_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recovery_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('symptom_free_days','therapy_completion','medication_stabilization','return_to_work','social_reconnection','self_care_consistency','crisis_management','skill_mastery') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`target_date` timestamp,
	`achieved_date` timestamp,
	`progress` int,
	`status` enum('not_started','in_progress','achieved','on_hold'),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `recovery_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safety_plans` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`warning_signs` text,
	`internal_coping_strategies` text,
	`social_distractions` text,
	`support_contacts` text,
	`professional_contacts` text,
	`crisis_hotlines` text,
	`emergency_services` text,
	`means_restriction` text,
	`reasons_for_living` text,
	`last_reviewed` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `safety_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `thought_records` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`record_date` timestamp NOT NULL,
	`situation` text NOT NULL,
	`automatic_thought` text NOT NULL,
	`emotions_before` text,
	`evidence_for` text,
	`evidence_against` text,
	`cognitive_distortions` text,
	`balanced_thought` text,
	`emotions_after` text,
	`behavioral_response` text,
	`effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `thought_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `breakup_recovery` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`breakup_date` timestamp,
	`relationship_duration` int,
	`initiator` enum('me','them','mutual'),
	`reason` text,
	`current_phase` enum('denial','anger','bargaining','depression','acceptance','growth'),
	`no_contact_active` boolean DEFAULT false,
	`no_contact_start_date` timestamp,
	`no_contact_duration` int,
	`healing_activities` text,
	`support_system` text,
	`days_without_contact` int DEFAULT 0,
	`good_days_count` int DEFAULT 0,
	`bad_days_count` int DEFAULT 0,
	`lessons_learned` text,
	`personal_growth` text,
	`future_goals` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `breakup_recovery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_logs` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`conversation_type` enum('conflict','difficult_topic','check_in','quality_time','repair_attempt') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`context` text,
	`emotion_before` varchar(255),
	`intensity_before` int,
	`used_soft_startup` boolean,
	`expressed_needs` boolean,
	`listened_actively` boolean,
	`validated_partner` boolean,
	`found_compromise` boolean,
	`used_criticism` boolean,
	`used_contempt` boolean,
	`used_defensiveness` boolean,
	`used_stonewalling` boolean,
	`outcome` enum('resolved','partially_resolved','unresolved','escalated'),
	`emotion_after` varchar(255),
	`intensity_after` int,
	`what_worked` text,
	`what_to_improve` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `communication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connection_bids` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`bid_date` timestamp NOT NULL,
	`bid_type` enum('conversation','affection','humor','help','quality_time') NOT NULL,
	`bid_description` text,
	`response` enum('turned_toward','turned_away','turned_against') NOT NULL,
	`response_description` text,
	`emotional_impact` int,
	`connection_strength` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `connection_bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `love_language_actions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`action_date` timestamp NOT NULL,
	`action_type` enum('given','received') NOT NULL,
	`love_language` enum('words_of_affirmation','quality_time','receiving_gifts','acts_of_service','physical_touch') NOT NULL,
	`action_description` text NOT NULL,
	`emotional_impact` int,
	`connection_felt` int,
	`partner_response` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `love_language_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `love_maps` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`partner_dreams` text,
	`partner_fears` text,
	`partner_stressors` text,
	`partner_joys` text,
	`partner_daily_routine` text,
	`partner_favorites` text,
	`partner_pet_peeves` text,
	`how_we_met` text,
	`best_memories` text,
	`hardest_moments` text,
	`shared_goals` text,
	`individual_goals` text,
	`last_updated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `love_maps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relationship_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`relationship_type` enum('dating','committed','engaged','married','separated','divorced','post_breakup') NOT NULL,
	`relationship_status` enum('active','on_break','ending','ended') NOT NULL,
	`relationship_duration` int,
	`partner_involved` boolean DEFAULT false,
	`partner_user_id` varchar(255),
	`attachment_style` enum('secure','anxious','avoidant','fearful_avoidant'),
	`partner_attachment_style` enum('secure','anxious','avoidant','fearful_avoidant','unknown'),
	`primary_love_language` enum('words_of_affirmation','quality_time','receiving_gifts','acts_of_service','physical_touch'),
	`secondary_love_language` enum('words_of_affirmation','quality_time','receiving_gifts','acts_of_service','physical_touch'),
	`partner_primary_love_language` enum('words_of_affirmation','quality_time','receiving_gifts','acts_of_service','physical_touch','unknown'),
	`partner_secondary_love_language` enum('words_of_affirmation','quality_time','receiving_gifts','acts_of_service','physical_touch','unknown'),
	`primary_goal` enum('improve_communication','rebuild_trust','increase_intimacy','resolve_conflict','heal_from_infidelity','navigate_breakup','co_parenting','find_new_relationship') NOT NULL,
	`specific_goals` text,
	`main_challenges` text,
	`conflict_frequency` enum('rare','occasional','frequent','constant'),
	`criticism_level` int,
	`contempt_level` int,
	`defensiveness_level` int,
	`stonewalling_level` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `relationship_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relationship_rituals` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`ritual_type` enum('daily_check_in','weekly_date','monthly_adventure','morning_routine','evening_routine','appreciation_practice','conflict_resolution_ritual') NOT NULL,
	`ritual_name` varchar(255) NOT NULL,
	`description` text,
	`frequency` enum('daily','weekly','monthly','as_needed'),
	`last_completed` timestamp,
	`completion_count` int DEFAULT 0,
	`current_streak` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`connection_impact` int,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `relationship_rituals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repair_attempts` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`attempt_date` timestamp NOT NULL,
	`conflict_description` text,
	`repair_strategy` enum('apology','taking_responsibility','expressing_needs','asking_for_break','humor','affection','compromise_offer') NOT NULL,
	`repair_details` text,
	`partner_response` enum('accepted','rejected','mixed','no_response'),
	`conflict_resolved` boolean,
	`connection_restored` boolean,
	`effectiveness` int,
	`what_learned` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `repair_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_experiments` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`experiment_type` enum('informational_interview','job_shadowing','freelance_project','volunteer_work','side_project','online_course','industry_event') NOT NULL,
	`experiment_name` varchar(255) NOT NULL,
	`description` text,
	`hypothesis` text,
	`success_criteria` text,
	`start_date` timestamp,
	`end_date` timestamp,
	`what_you_learned` text,
	`what_you_liked` text,
	`what_you_disliked` text,
	`conclusion` text,
	`next_steps` text,
	`status` enum('planned','in_progress','completed'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `career_experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('job_offer','promotion','skill_mastery','certification','project_completion','network_milestone','business_launch','revenue_milestone') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`target_date` timestamp,
	`achieved_date` timestamp,
	`progress` int,
	`status` enum('not_started','in_progress','achieved'),
	`impact` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `career_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`employment_status` enum('employed_full_time','employed_part_time','self_employed','unemployed','student','career_transition','retired') NOT NULL,
	`current_role` varchar(255),
	`current_industry` varchar(255),
	`years_experience` int,
	`primary_goal` enum('find_first_job','career_change','advancement','entrepreneurship','find_purpose','work_life_balance','skill_development','leadership_role') NOT NULL,
	`target_role` varchar(255),
	`target_industry` varchar(255),
	`target_timeline` int,
	`what_you_love` text,
	`what_youre_good_at` text,
	`what_world_needs` text,
	`what_you_can_be_paid_for` text,
	`purpose_statement` text,
	`core_values` text,
	`current_skills` text,
	`skills_to_learn` text,
	`strengths` text,
	`main_barriers` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `career_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_search_activities` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`activity_date` timestamp NOT NULL,
	`activity_type` enum('application_submitted','networking_event','informational_interview','phone_screen','interview','follow_up','offer_received','rejection') NOT NULL,
	`company_name` varchar(255),
	`job_title` varchar(255),
	`job_url` text,
	`application_method` varchar(255),
	`referral_source` varchar(255),
	`interview_type` enum('phone','video','in_person','panel','technical'),
	`interview_round` int,
	`interview_notes` text,
	`status` enum('pending','interviewing','offered','rejected','accepted','declined'),
	`next_steps` text,
	`follow_up_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `job_search_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networking_contacts` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255),
	`company` varchar(255),
	`industry` varchar(255),
	`how_met` text,
	`connection_strength` enum('weak','moderate','strong'),
	`email` varchar(255),
	`linkedin` varchar(255),
	`phone` varchar(50),
	`last_contact` timestamp,
	`contact_frequency` enum('monthly','quarterly','yearly','as_needed'),
	`how_they_can_help` text,
	`how_you_can_help` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `networking_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purpose_activities` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`activity_date` timestamp NOT NULL,
	`activity_type` enum('values_clarification','life_review','peak_experiences','ideal_day_visualization','legacy_reflection','contribution_mapping','meaning_making') NOT NULL,
	`insights` text,
	`patterns` text,
	`emotions` text,
	`passions` text,
	`strengths` text,
	`values` text,
	`impact` text,
	`action_steps` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `purpose_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_development` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`skill_name` varchar(255) NOT NULL,
	`skill_category` enum('technical','soft_skill','leadership','industry_specific'),
	`current_level` enum('beginner','intermediate','advanced','expert'),
	`target_level` enum('beginner','intermediate','advanced','expert'),
	`learning_resources` text,
	`practice_activities` text,
	`hours_invested` decimal(10,2) DEFAULT '0',
	`completed_milestones` text,
	`projects_used` text,
	`certifications_earned` text,
	`start_date` timestamp,
	`target_completion_date` timestamp,
	`completion_date` timestamp,
	`status` enum('not_started','in_progress','completed','on_hold'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `skill_development_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_completions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`challenge_category` enum('physical','mental','emotional','social','service','financial','creative') NOT NULL,
	`challenge_name` varchar(255) NOT NULL,
	`description` text,
	`start_date` timestamp,
	`completion_date` timestamp,
	`what_you_learned` text,
	`how_you_grew` text,
	`badge_earned` varchar(255),
	`status` enum('in_progress','completed','abandoned'),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `challenge_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `developmental_assets` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`family_support` int,
	`positive_family_communication` int,
	`other_adult_relationships` int,
	`caring_neighborhood` int,
	`community_values_youth` int,
	`youth_as_resources` int,
	`service_to_others` int,
	`safety` int,
	`family_boundaries` int,
	`school_boundaries` int,
	`neighborhood_boundaries` int,
	`adult_role_models` int,
	`positive_peer_influence` int,
	`high_expectations` int,
	`creative_activities` int,
	`youth_programs` int,
	`religious_community` int,
	`time_at_home` int,
	`achievement_motivation` int,
	`school_engagement` int,
	`homework` int,
	`bonding_to_school` int,
	`reading_for_pleasure` int,
	`caring` int,
	`equality` int,
	`social_justice` int,
	`integrity` int,
	`honesty` int,
	`responsibility` int,
	`restraint` int,
	`planning_decision_making` int,
	`interpersonal_competence` int,
	`cultural_competence` int,
	`resistance_skills` int,
	`peaceful_conflict_resolution` int,
	`personal_power` int,
	`self_esteem` int,
	`sense_of_purpose` int,
	`positive_view_of_future` int,
	`total_assets` int,
	`assessment_date` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `developmental_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `life_skills_development` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`skill_category` enum('financial_literacy','cooking_nutrition','personal_hygiene','home_maintenance','car_maintenance','time_management','communication','conflict_resolution','job_skills','emotional_regulation') NOT NULL,
	`skill_name` varchar(255) NOT NULL,
	`current_level` enum('none','beginner','intermediate','proficient'),
	`target_level` enum('beginner','intermediate','proficient','expert'),
	`learning_method` enum('video_tutorial','mentor_teaching','practice','course','reading'),
	`resources` text,
	`practice_count` int DEFAULT 0,
	`last_practiced` timestamp,
	`mastery_achieved` boolean DEFAULT false,
	`mastery_date` timestamp,
	`status` enum('not_started','learning','practicing','mastered'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `life_skills_development_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `masculinity_reflections` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reflection_date` timestamp NOT NULL,
	`prompt_type` enum('what_is_a_man','role_models','emotions','relationships','strength','vulnerability','responsibility','purpose') NOT NULL,
	`reflection` text NOT NULL,
	`insights` text,
	`action_steps` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `masculinity_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorship_connections` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`mentor_type` enum('platform_mentor','real_life_mentor','virtual_role_model','peer_mentor') NOT NULL,
	`mentor_name` varchar(255),
	`mentor_area` varchar(255),
	`connection_date` timestamp,
	`meeting_frequency` enum('weekly','biweekly','monthly','as_needed'),
	`focus_areas` text,
	`sessions_completed` int DEFAULT 0,
	`last_meeting` timestamp,
	`next_meeting` timestamp,
	`impact_rating` int,
	`key_learnings` text,
	`status` enum('active','on_hold','completed'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mentorship_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `young_men_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('first_job','financial_independence','moved_out','graduated','learned_critical_skill','overcame_fear','helped_someone','found_purpose','built_discipline') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achieved_date` timestamp,
	`why_it_matters` text,
	`who_you_became` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `young_men_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `young_men_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`living_situation` enum('with_parents','single_parent_home','foster_care','independent','homeless','other'),
	`education_status` enum('in_school','dropped_out','graduated_hs','in_college','working'),
	`employment_status` enum('student','employed','unemployed','seeking_work'),
	`has_father_figure` boolean DEFAULT false,
	`has_mother_figure` boolean DEFAULT false,
	`has_mentor` boolean DEFAULT false,
	`has_male_role_model` boolean DEFAULT false,
	`role_model_gaps` text,
	`primary_needs` text,
	`primary_goal` enum('find_direction','build_confidence','learn_life_skills','career_guidance','emotional_regulation','healthy_relationships','financial_independence','overcome_trauma') NOT NULL,
	`specific_goals` text,
	`main_challenges` text,
	`strengths` text,
	`interests` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `young_men_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_categories` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`category_type` enum('housing','utilities','food','transportation','insurance','debt_payments','savings','personal','entertainment','giving','other') NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`planned_amount` decimal(10,2) NOT NULL,
	`actual_amount` decimal(10,2) DEFAULT '0',
	`is_essential` boolean DEFAULT true,
	`is_variable` boolean DEFAULT false,
	`budget_month` varchar(7),
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_accounts` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`debt_type` enum('credit_card','student_loan','car_loan','personal_loan','medical_debt','payday_loan','mortgage','other') NOT NULL,
	`creditor_name` varchar(255) NOT NULL,
	`original_balance` decimal(10,2) NOT NULL,
	`current_balance` decimal(10,2) NOT NULL,
	`interest_rate` decimal(5,2),
	`minimum_payment` decimal(10,2),
	`payoff_method` enum('snowball','avalanche','custom'),
	`payoff_priority` int,
	`last_payment_date` timestamp,
	`last_payment_amount` decimal(10,2),
	`projected_payoff_date` timestamp,
	`total_interest_paid` decimal(10,2) DEFAULT '0',
	`status` enum('active','in_collections','paid_off','settled'),
	`paid_off_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `debt_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` varchar(255) NOT NULL,
	`debt_account_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`payment_date` timestamp NOT NULL,
	`payment_amount` decimal(10,2) NOT NULL,
	`principal_paid` decimal(10,2),
	`interest_paid` decimal(10,2),
	`balance_after_payment` decimal(10,2),
	`emotional_impact` int,
	`motivation_boost` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expense_date` timestamp NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category_id` varchar(255),
	`category_name` varchar(255) NOT NULL,
	`description` varchar(255),
	`merchant` varchar(255),
	`was_planned` boolean,
	`was_necessary` boolean,
	`was_impulse` boolean,
	`emotional_state` varchar(100),
	`trigger` varchar(255),
	`satisfaction_level` int,
	`regret_level` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_education` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`topic` enum('budgeting_basics','debt_payoff_strategies','emergency_fund','investing_101','retirement_planning','credit_scores','tax_basics','insurance','real_estate','behavioral_finance') NOT NULL,
	`resource_type` enum('article','video','course','book','podcast'),
	`resource_name` varchar(255),
	`resource_url` text,
	`completed_date` timestamp,
	`key_takeaways` text,
	`applied_learning` text,
	`status` enum('not_started','in_progress','completed'),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `financial_education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`employment_status` enum('employed','self_employed','unemployed','underemployed','student','retired'),
	`monthly_income` decimal(10,2),
	`income_stability` enum('stable','variable','unstable'),
	`total_debt` decimal(10,2),
	`debt_types` text,
	`has_emergency_fund` boolean DEFAULT false,
	`emergency_fund_months` int,
	`has_budget` boolean DEFAULT false,
	`tracks_spending` boolean DEFAULT false,
	`financial_stress_level` int,
	`primary_goal` enum('get_out_of_debt','build_emergency_fund','increase_income','stop_overspending','save_for_goal','invest_for_future','improve_credit_score','financial_literacy') NOT NULL,
	`specific_goals` text,
	`money_scripts` text,
	`financial_trauma` text,
	`impulse_buying_triggers` text,
	`emotional_spending_triggers` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `financial_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_wins` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`win_date` timestamp NOT NULL,
	`win_type` enum('debt_paid_off','emergency_fund_milestone','savings_goal_reached','budget_followed','no_impulse_buys','income_increased','credit_score_improved','financial_habit_built') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`amount_involved` decimal(10,2),
	`emotional_impact` int,
	`what_you_learned` text,
	`who_you_became` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `financial_wins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `income_entries` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`income_date` timestamp NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`income_type` enum('salary','hourly_wages','freelance','side_hustle','passive_income','bonus','gift','refund','other') NOT NULL,
	`source` varchar(255),
	`description` text,
	`is_recurring` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `income_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `money_mindset_reflections` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reflection_date` timestamp NOT NULL,
	`prompt_type` enum('money_scripts','scarcity_vs_abundance','self_worth','comparison','emotional_spending','financial_fears','financial_dreams') NOT NULL,
	`reflection` text NOT NULL,
	`insights` text,
	`limiting_beliefs` text,
	`empowering_beliefs` text,
	`action_steps` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `money_mindset_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`goal_type` enum('emergency_fund','down_payment','vacation','car','education','retirement','wedding','other') NOT NULL,
	`goal_name` varchar(255) NOT NULL,
	`description` text,
	`target_amount` decimal(10,2) NOT NULL,
	`current_amount` decimal(10,2) DEFAULT '0',
	`start_date` timestamp,
	`target_date` timestamp,
	`monthly_contribution` decimal(10,2),
	`percent_complete` int DEFAULT 0,
	`why_it_matters` text,
	`visual_reminder` varchar(255),
	`status` enum('active','paused','completed','abandoned'),
	`completed_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `savings_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autismDailyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`date` timestamp NOT NULL,
	`mood` int NOT NULL,
	`sleepQuality` int NOT NULL,
	`sleepHours` int,
	`meltdownCount` int NOT NULL DEFAULT 0,
	`communicationAttempts` int NOT NULL DEFAULT 0,
	`wins` text,
	`challenges` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autismDailyLogs_id` PRIMARY KEY(`id`)
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
CREATE TABLE `compassion_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`practice_type` enum('loving_kindness_self','loving_kindness_loved_one','loving_kindness_neutral','loving_kindness_difficult','loving_kindness_all_beings','compassion_for_suffering','self_compassion','forgiveness_practice','acts_of_kindness') NOT NULL,
	`duration` int,
	`target` varchar(255),
	`emotion_before` varchar(255),
	`emotion_after` varchar(255),
	`warmth_level` int,
	`resistance_level` int,
	`insights` text,
	`action_taken` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `compassion_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gratitude_entries` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`entry_date` timestamp NOT NULL,
	`gratitude_1` text NOT NULL,
	`gratitude_2` text,
	`gratitude_3` text,
	`gratitude_4` text,
	`gratitude_5` text,
	`gratitude_depth` enum('surface','moderate','deep'),
	`emotional_impact` int,
	`savoring_time` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `gratitude_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`practice_type` enum('mindfulness','loving_kindness','body_scan','breath_awareness','walking_meditation','transcendental','visualization','mantra','open_awareness','compassion','gratitude','prayer') NOT NULL,
	`guided_or_silent` enum('guided','silent','hybrid'),
	`guide_source` varchar(255),
	`planned_duration` int,
	`actual_duration` int,
	`focus_level` int,
	`distraction_level` int,
	`peace_level` int,
	`insight_level` int,
	`emotion_before` varchar(255),
	`stress_level_before` int,
	`emotion_after` varchar(255),
	`stress_level_after` int,
	`experiences` text,
	`insights` text,
	`challenges` text,
	`completed` boolean DEFAULT true,
	`effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `meditation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mindfulness_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`practice_type` enum('mindful_eating','mindful_walking','mindful_listening','mindful_breathing','mindful_observation','mindful_movement','mindful_work','mindful_conversation','pause_practice','gratitude_practice','loving_kindness_moment') NOT NULL,
	`duration` int,
	`activity` varchar(255),
	`location` varchar(255),
	`presence_level` int,
	`awareness_level` int,
	`what_you_noticed` text,
	`how_it_felt` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mindfulness_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purpose_explorations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`exploration_date` timestamp NOT NULL,
	`exploration_type` enum('ikigai_reflection','values_clarification','life_review','peak_experiences','legacy_reflection','suffering_meaning','contribution_mapping','death_meditation','gratitude_reflection','awe_experience') NOT NULL,
	`prompt` text,
	`reflection` text NOT NULL,
	`insights` text,
	`patterns` text,
	`passions` text,
	`strengths` text,
	`values` text,
	`contribution` text,
	`clarity_level` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `purpose_explorations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spiritual_engine_analytics` (
	`id` varchar(255) NOT NULL,
	`practice_type` varchar(100) NOT NULL,
	`avg_stress_reduction` decimal(5,2),
	`avg_peace_increase` decimal(5,2),
	`avg_completion_rate` decimal(5,2),
	`optimal_duration` int,
	`optimal_time_of_day` varchar(50),
	`most_effective_for` text,
	`session_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `spiritual_engine_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spiritual_experiences` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`experience_date` timestamp NOT NULL,
	`experience_type` enum('peak_experience','flow_state','awe_experience','mystical_experience','synchronicity','insight','connection','transcendence','presence','oneness') NOT NULL,
	`context` text,
	`trigger` varchar(255),
	`description` text NOT NULL,
	`intensity` int,
	`duration` int,
	`emotional_impact` int,
	`meaningfulness` int,
	`life_changing` boolean DEFAULT false,
	`insights` text,
	`how_it_changed_you` text,
	`actions_taken` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `spiritual_experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spiritual_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('meditation_streak','retreat_completed','practice_deepened','purpose_discovered','forgiveness_achieved','peace_found','compassion_breakthrough','spiritual_awakening','habit_established') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achieved_date` timestamp,
	`significance` text,
	`how_you_grew` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `spiritual_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spiritual_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`spiritual_background` enum('religious','spiritual_not_religious','secular','agnostic','atheist','exploring','prefer_not_to_say'),
	`religious_tradition` varchar(255),
	`has_meditation_practice` boolean DEFAULT false,
	`meditation_experience` enum('none','beginner','intermediate','advanced'),
	`current_practices` text,
	`primary_goal` enum('reduce_stress','find_peace','discover_purpose','connect_with_something_greater','develop_compassion','increase_awareness','heal_spiritually','deepen_practice') NOT NULL,
	`specific_goals` text,
	`barriers` text,
	`preferred_practice_time` enum('morning','afternoon','evening','night','flexible'),
	`preferred_duration` int,
	`preferred_style` text,
	`most_effective_practices` text,
	`optimal_practice_time` int,
	`best_time_of_day` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `spiritual_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brain_training_exercises` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`exercise_date` timestamp NOT NULL,
	`exercise_type` enum('working_memory','attention','processing_speed','cognitive_flexibility','problem_solving','pattern_recognition','spatial_reasoning','verbal_fluency') NOT NULL,
	`exercise_name` varchar(255),
	`score` int,
	`accuracy` int,
	`speed` int,
	`difficulty_level` int,
	`duration` int,
	`personal_best` boolean,
	`improvement_from_last` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `brain_training_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cognitive_performance` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`assessment_date` timestamp NOT NULL,
	`mental_clarity` int,
	`focus_ability` int,
	`memory_sharpness` int,
	`processing_speed` int,
	`decision_quality` int,
	`creativity` int,
	`brain_fog` int,
	`mental_fatigue` int,
	`sleep_quality` int,
	`sleep_hours` decimal(3,1),
	`exercise_today` boolean,
	`stress_level` int,
	`hydration` enum('poor','moderate','good'),
	`nutrition` enum('poor','moderate','good'),
	`caffeine_intake` int,
	`alcohol_yesterday` boolean,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cognitive_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `focus_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`session_type` enum('deep_work','pomodoro','flow_session','time_blocking','focused_learning','creative_work','problem_solving') NOT NULL,
	`task` varchar(255) NOT NULL,
	`task_type` enum('learning','creating','analyzing','writing','coding','planning'),
	`planned_duration` int,
	`actual_duration` int,
	`location` varchar(255),
	`noise_level` enum('silent','quiet','moderate','noisy'),
	`used_noise_blocking` boolean,
	`energy_before` int,
	`focus_before` int,
	`stress_before` int,
	`focus_quality` int,
	`flow_state` boolean,
	`distraction_count` int,
	`distraction_types` text,
	`energy_after` int,
	`focus_after` int,
	`satisfaction_level` int,
	`productivity_rating` int,
	`output_quality` int,
	`what_helped` text,
	`what_hindered` text,
	`effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `focus_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`topic` varchar(255) NOT NULL,
	`subject` varchar(255),
	`learning_method` enum('reading','video','course','practice','teaching_others','project_based','discussion','experimentation') NOT NULL,
	`duration` int,
	`engagement_level` int,
	`comprehension_level` int,
	`techniques_used` text,
	`notes_created` boolean,
	`practice_completed` boolean,
	`taught_to_someone` boolean,
	`immediate_recall` int,
	`will_review` boolean,
	`next_review_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `learning_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`practice_type` enum('spaced_repetition','memory_palace','chunking','mnemonics','visualization','association','active_recall','elaboration','interleaving') NOT NULL,
	`content_type` enum('facts','concepts','skills','names','numbers','language','other'),
	`topic` varchar(255),
	`duration` int,
	`items_reviewed` int,
	`items_recalled` int,
	`recall_accuracy` int,
	`confidence_level` int,
	`difficulty` enum('easy','moderate','hard'),
	`next_review_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_breaks` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`break_date` timestamp NOT NULL,
	`break_type` enum('micro_break','short_break','long_break','walk_break','meditation_break','nap','nature_break','social_break') NOT NULL,
	`duration` int,
	`activity` varchar(255),
	`mental_fatigue_before` int,
	`mental_fatigue_after` int,
	`restoration_level` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mental_breaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_engine_analytics` (
	`id` varchar(255) NOT NULL,
	`technique_type` varchar(100) NOT NULL,
	`avg_focus_improvement` decimal(5,2),
	`avg_productivity_score` decimal(5,2),
	`avg_flow_state_rate` decimal(5,2),
	`optimal_duration` int,
	`optimal_time_of_day` varchar(50),
	`optimal_break_frequency` int,
	`most_effective_for` text,
	`session_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mental_engine_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`mental_clarity` int,
	`focus_ability` int,
	`memory_quality` int,
	`cognitive_energy` int,
	`primary_challenges` text,
	`primary_goal` enum('improve_focus','enhance_memory','increase_clarity','learn_faster','reduce_brain_fog','boost_creativity','improve_decision_making','mental_performance') NOT NULL,
	`learning_style` text,
	`best_learning_time` varchar(50),
	`sleep_quality` int,
	`exercise_frequency` enum('none','1-2x_week','3-4x_week','5+x_week'),
	`screen_time_hours` int,
	`cognitive_supplements` text,
	`medications` text,
	`peak_focus_hours` text,
	`optimal_work_duration` int,
	`most_effective_techniques` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mental_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`content_type` enum('book','article','research_paper','documentation','news'),
	`title` varchar(255),
	`author` varchar(255),
	`pages_read` int,
	`duration` int,
	`words_per_minute` int,
	`comprehension_level` int,
	`retention_level` int,
	`active_reading` boolean,
	`speed_reading` boolean,
	`skimming` boolean,
	`notes_taken` boolean,
	`summary_written` boolean,
	`value_rating` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reading_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `act_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`act_process` enum('acceptance','cognitive_defusion','present_moment','self_as_context','values','committed_action') NOT NULL,
	`technique` varchar(255),
	`situation` text,
	`difficult_thought` text,
	`difficult_emotion` varchar(100),
	`acceptance_level` int,
	`defusion_level` int,
	`value_identified` varchar(255),
	`action_taken` text,
	`psychological_flexibility` int,
	`effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `act_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotion_entries` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`entry_date` timestamp NOT NULL,
	`primary_emotion` varchar(100) NOT NULL,
	`secondary_emotions` text,
	`intensity` int,
	`valence` int,
	`arousal` int,
	`trigger` text,
	`situation` text,
	`thoughts` text,
	`physical_sensations` text,
	`urge` text,
	`actual_behavior` text,
	`duration_minutes` int,
	`regulation_used` boolean,
	`regulation_strategy` varchar(255),
	`regulation_effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotion_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotion_regulation_strategies` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`use_date` timestamp NOT NULL,
	`strategy_type` enum('reappraisal','suppression','distraction','acceptance','problem_solving','social_support','expressive_writing','physical_release','relaxation','mindfulness','opposite_action') NOT NULL,
	`emotion` varchar(100) NOT NULL,
	`intensity_before` int,
	`trigger` text,
	`what_you_did` text,
	`duration` int,
	`intensity_after` int,
	`emotion_changed` boolean,
	`new_emotion` varchar(100),
	`immediate_effectiveness` int,
	`long_term_helpful` boolean,
	`side_effects` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotion_regulation_strategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_engine_analytics` (
	`id` varchar(255) NOT NULL,
	`strategy_type` varchar(100) NOT NULL,
	`emotion_type` varchar(100) NOT NULL,
	`avg_intensity_reduction` decimal(5,2),
	`avg_effectiveness_rating` decimal(5,2),
	`success_rate` decimal(5,2),
	`optimal_duration` int,
	`most_effective_for` text,
	`use_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotional_engine_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_processing` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`processing_date` timestamp NOT NULL,
	`emotion_to_process` varchar(100) NOT NULL,
	`related_event` text,
	`processing_method` enum('journaling','talking_to_someone','therapy_session','somatic_experiencing','EMDR','expressive_art','movement','crying','meditation','ritual') NOT NULL,
	`what_came_up` text,
	`physical_sensations` text,
	`processing_depth` enum('surface','moderate','deep'),
	`feeling_after` varchar(100),
	`resolution_level` int,
	`insights` text,
	`action_steps` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotional_processing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`baseline_emotional_state` varchar(100),
	`emotional_range` enum('narrow','moderate','wide'),
	`emotional_intensity` enum('low','moderate','high'),
	`regulation_skill_level` int,
	`awareness_level` int,
	`primary_challenges` text,
	`primary_goal` enum('regulate_emotions','reduce_reactivity','increase_awareness','process_trauma','build_resilience','feel_more','feel_less_overwhelmed','emotional_stability') NOT NULL,
	`common_triggers` text,
	`common_emotions` text,
	`emotional_cycles` text,
	`most_effective_strategies` text,
	`least_effective_strategies` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotional_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_wins` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`win_date` timestamp NOT NULL,
	`win_type` enum('regulated_successfully','felt_emotion_fully','set_boundary','expressed_emotion_healthily','processed_trauma','resilience_moment','emotional_breakthrough','pattern_broken') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`significance` text,
	`how_you_grew` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotional_wins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resilience_activities` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`activity_date` timestamp NOT NULL,
	`activity_type` enum('social_connection','meaning_making','optimism_practice','self_efficacy','emotion_regulation','cognitive_flexibility','physical_health','spirituality','growth_mindset','gratitude','self_compassion') NOT NULL,
	`activity` varchar(255) NOT NULL,
	`description` text,
	`duration` int,
	`resilience_impact` int,
	`emotional_impact` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `resilience_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `body_measurements` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`measurement_date` timestamp NOT NULL,
	`weight` decimal(5,2),
	`body_fat_percentage` decimal(4,1),
	`muscle_mass` decimal(5,2),
	`neck` decimal(4,1),
	`chest` decimal(4,1),
	`waist` decimal(4,1),
	`hips` decimal(4,1),
	`bicep_left` decimal(4,1),
	`bicep_right` decimal(4,1),
	`thigh_left` decimal(4,1),
	`thigh_right` decimal(4,1),
	`calf_left` decimal(4,1),
	`calf_right` decimal(4,1),
	`front_photo` varchar(255),
	`side_photo` varchar(255),
	`back_photo` varchar(255),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `body_measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cardio_sessions` (
	`id` varchar(255) NOT NULL,
	`workout_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`activity_type` enum('running','cycling','swimming','rowing','walking','hiking','elliptical','stair_climbing','jump_rope','other') NOT NULL,
	`duration` int,
	`distance` decimal(6,2),
	`avg_heart_rate` int,
	`max_heart_rate` int,
	`heart_rate_zones` text,
	`avg_pace` varchar(50),
	`avg_speed` decimal(5,2),
	`elevation_gain` int,
	`calories_burned` int,
	`performance_rating` int,
	`recovery_heart_rate` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cardio_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` varchar(255) NOT NULL,
	`workout_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`exercise_name` varchar(255) NOT NULL,
	`exercise_type` enum('compound','isolation','cardio','plyometric','isometric','mobility','balance'),
	`muscle_group` varchar(255),
	`sets` int,
	`reps` text,
	`weight` text,
	`rest_between_sets` int,
	`tempo` varchar(50),
	`range_of_motion` enum('full','partial','limited'),
	`form_quality` int,
	`difficulty` int,
	`progression_from_last` varchar(255),
	`pain_during` boolean,
	`pain_location` varchar(255),
	`pain_level` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mobility_work` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_date` timestamp NOT NULL,
	`session_type` enum('stretching','foam_rolling','yoga','dynamic_warmup','mobility_drills','joint_prep') NOT NULL,
	`areas_worked` text,
	`duration` int,
	`range_of_motion_before` int,
	`range_of_motion_after` int,
	`pain_before` int,
	`pain_after` int,
	`techniques_used` text,
	`effectiveness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mobility_work_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `physical_engine_analytics` (
	`id` varchar(255) NOT NULL,
	`workout_type` varchar(100) NOT NULL,
	`avg_recovery_score` decimal(5,2),
	`avg_progression_rate` decimal(5,2),
	`injury_rate` decimal(5,2),
	`optimal_frequency` int,
	`optimal_duration` int,
	`optimal_intensity` varchar(50),
	`avg_recovery_time` int,
	`most_effective_for` text,
	`workout_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `physical_engine_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `physical_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`fitness_level` enum('sedentary','beginner','intermediate','advanced','athlete'),
	`height` int,
	`weight` decimal(5,2),
	`body_fat_percentage` decimal(4,1),
	`primary_goal` enum('lose_weight','build_muscle','increase_strength','improve_endurance','enhance_mobility','athletic_performance','general_health','injury_recovery','longevity') NOT NULL,
	`specific_goals` text,
	`injuries` text,
	`injury_history` text,
	`limitations` text,
	`experience_level` text,
	`preferred_exercise_types` text,
	`available_equipment` text,
	`time_available` int,
	`optimal_training_frequency` int,
	`optimal_session_duration` int,
	`best_recovery_strategies` text,
	`injury_risk_factors` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `physical_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recovery_tracking` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`tracking_date` timestamp NOT NULL,
	`recovery_score` int,
	`resting_heart_rate` int,
	`hrv` int,
	`sleep_quality` int,
	`sleep_hours` decimal(3,1),
	`overall_soreness` int,
	`sore_areas` text,
	`energy_level` int,
	`readiness_to_train` int,
	`stress_level` int,
	`recovery_strategies` text,
	`recommended_action` enum('full_training','light_training','active_recovery','rest_day','deload'),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `recovery_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strength_benchmarks` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`test_date` timestamp NOT NULL,
	`exercise` varchar(255) NOT NULL,
	`test_type` enum('1RM','3RM','5RM','max_reps','time_to_failure') NOT NULL,
	`weight` decimal(6,2),
	`reps` int,
	`duration` int,
	`bodyweight_ratio` decimal(4,2),
	`improvement_from_last` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `strength_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`workout_date` timestamp NOT NULL,
	`workout_type` enum('strength_training','cardio','HIIT','yoga','mobility','sports','walking','running','cycling','swimming','martial_arts','dance','other') NOT NULL,
	`primary_focus` enum('upper_body','lower_body','full_body','core','push','pull','legs','cardio','flexibility','balance'),
	`duration` int,
	`intensity` enum('low','moderate','high','max'),
	`perceived_exertion` int,
	`energy_before` int,
	`soreness_before` int,
	`motivation_before` int,
	`performance_rating` int,
	`personal_records` text,
	`energy_after` int,
	`soreness_after` int,
	`satisfaction_level` int,
	`location` varchar(255),
	`temperature` int,
	`notes` text,
	`completed` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_nutrition_summary` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`summary_date` timestamp NOT NULL,
	`total_calories` int,
	`total_protein` decimal(6,1),
	`total_carbs` decimal(6,1),
	`total_fat` decimal(6,1),
	`total_fiber` decimal(5,1),
	`water_intake` decimal(4,1),
	`calorie_adherence` int,
	`protein_adherence` int,
	`vegetable_servings` int,
	`fruit_servings` int,
	`processed_food_servings` int,
	`nutrition_quality` int,
	`adherence_rating` int,
	`avg_energy_level` int,
	`sleep_quality` int,
	`workout_performance` int,
	`bowel_movements` int,
	`digestive_comfort` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_nutrition_summary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_reactions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reaction_date` timestamp NOT NULL,
	`suspected_food` varchar(255) NOT NULL,
	`reaction_type` enum('digestive','skin','respiratory','energy','mood','headache','other') NOT NULL,
	`symptoms` text,
	`severity` enum('mild','moderate','severe'),
	`onset_time` int,
	`duration` int,
	`consistent_reaction` boolean,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `food_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hydration_logs` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`water_intake` decimal(4,2),
	`coffee` int,
	`tea` int,
	`alcohol` int,
	`urine_color` enum('clear','pale_yellow','yellow','dark_yellow','amber'),
	`headache` boolean,
	`fatigue` boolean,
	`dry_mouth` boolean,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `hydration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`plan_name` varchar(255) NOT NULL,
	`start_date` timestamp,
	`end_date` timestamp,
	`meals` text,
	`shopping_list` text,
	`prep_notes` text,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `meal_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`meal_date` timestamp NOT NULL,
	`meal_type` enum('breakfast','lunch','dinner','snack','pre_workout','post_workout') NOT NULL,
	`foods` text,
	`total_calories` int,
	`total_protein` decimal(5,1),
	`total_carbs` decimal(5,1),
	`total_fat` decimal(5,1),
	`total_fiber` decimal(5,1),
	`total_sugar` decimal(5,1),
	`location` varchar(255),
	`social_context` enum('alone','family','friends','work'),
	`eating_speed` enum('slow','moderate','fast'),
	`mindful_eating` boolean,
	`distractions` text,
	`hunger_before` int,
	`hunger_after` int,
	`satisfaction_level` int,
	`emotion_before` varchar(100),
	`emotional_eating` boolean,
	`energy_after` int,
	`digestion_quality` int,
	`bloating` int,
	`meal_photo` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_engine_analytics` (
	`id` varchar(255) NOT NULL,
	`food_category` varchar(100) NOT NULL,
	`avg_energy_impact` decimal(5,2),
	`avg_digestive_impact` decimal(5,2),
	`avg_workout_impact` decimal(5,2),
	`optimal_meal_timing` varchar(100),
	`most_beneficial_for` text,
	`meal_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `nutrition_engine_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_experiments` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`experiment_name` varchar(255) NOT NULL,
	`experiment_type` enum('elimination_diet','macro_cycling','meal_timing','supplement_trial','food_introduction','calorie_cycling','other') NOT NULL,
	`hypothesis` text,
	`start_date` timestamp,
	`end_date` timestamp,
	`protocol` text,
	`baseline_weight` decimal(5,2),
	`baseline_energy` int,
	`baseline_digestion` int,
	`end_weight` decimal(5,2),
	`end_energy` int,
	`end_digestion` int,
	`findings` text,
	`conclusion` text,
	`will_continue` boolean,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `nutrition_experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`current_weight` decimal(5,2),
	`target_weight` decimal(5,2),
	`height` int,
	`primary_goal` enum('lose_fat','build_muscle','maintain_weight','improve_health','increase_energy','gut_health','athletic_performance','disease_management') NOT NULL,
	`dietary_approach` enum('balanced','low_carb','keto','paleo','vegan','vegetarian','mediterranean','intermittent_fasting','carnivore','whole30','flexible_dieting'),
	`allergies` text,
	`intolerances` text,
	`restrictions` text,
	`health_conditions` text,
	`medications` text,
	`target_calories` int,
	`target_protein` int,
	`target_carbs` int,
	`target_fat` int,
	`target_fiber` int,
	`meals_per_day` int,
	`fasting_window` int,
	`eating_window` int,
	`optimal_macro_ratio` text,
	`energy_optimal_foods` text,
	`trigger_foods` text,
	`best_meal_timing` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `nutrition_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplement_logs` (
	`id` varchar(255) NOT NULL,
	`supplement_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`taken` boolean DEFAULT true,
	`dosage` varchar(255),
	`timing` varchar(100),
	`with_food` boolean,
	`perceived_effect` int,
	`side_effects` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `supplement_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplements` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`supplement_name` varchar(255) NOT NULL,
	`brand` varchar(255),
	`purpose` enum('vitamin_mineral','protein','performance','recovery','gut_health','cognitive','immune','joint_health','other') NOT NULL,
	`dosage` varchar(255),
	`unit` varchar(50),
	`frequency` enum('daily','twice_daily','as_needed','weekly'),
	`timing` enum('morning','afternoon','evening','with_meal','before_bed','pre_workout','post_workout'),
	`active` boolean DEFAULT true,
	`start_date` timestamp,
	`end_date` timestamp,
	`perceived_effectiveness` int,
	`side_effects` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `supplements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biomarkers` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`test_date` timestamp NOT NULL,
	`fasting_glucose` decimal(5,2),
	`hba1c` decimal(4,2),
	`fasting_insulin` decimal(5,2),
	`homa_ir` decimal(5,2),
	`total_cholesterol` int,
	`ldl_cholesterol` int,
	`hdl_cholesterol` int,
	`triglycerides` int,
	`apo_b` int,
	`lp_a` int,
	`hs_crp` decimal(5,2),
	`alt` int,
	`ast` int,
	`ggt` int,
	`creatinine` decimal(4,2),
	`egfr` int,
	`bun` int,
	`tsh` decimal(5,3),
	`free_t3` decimal(4,2),
	`free_t4` decimal(4,2),
	`testosterone` int,
	`estradiol` int,
	`cortisol` decimal(5,2),
	`dhea` int,
	`vitamin_d` decimal(5,2),
	`vitamin_b12` int,
	`folate` decimal(5,2),
	`iron` int,
	`ferritin` int,
	`magnesium` decimal(4,2),
	`wbc` decimal(4,2),
	`rbc` decimal(4,2),
	`hemoglobin` decimal(4,1),
	`hematocrit` decimal(4,1),
	`platelets` int,
	`homocysteine` decimal(5,2),
	`uric_acid` decimal(4,2),
	`test_source` varchar(255),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `biomarkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_health_metrics` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`metric_date` timestamp NOT NULL,
	`resting_heart_rate` int,
	`hrv` int,
	`blood_pressure_systolic` int,
	`blood_pressure_diastolic` int,
	`oxygen_saturation` int,
	`body_temperature` decimal(4,2),
	`weight` decimal(5,2),
	`body_fat` decimal(4,1),
	`sleep_duration` decimal(3,1),
	`sleep_quality` int,
	`deep_sleep_minutes` int,
	`rem_sleep_minutes` int,
	`energy_level` int,
	`mental_clarity` int,
	`physical_performance` int,
	`stress_level` int,
	`recovery_score` int,
	`symptoms` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_health_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('biomarker_optimized','disease_reversed','medication_reduced','biological_age_decreased','fitness_milestone','health_goal_achieved') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achieved_date` timestamp,
	`significance` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_optimization_analytics` (
	`id` varchar(255) NOT NULL,
	`intervention_type` varchar(100) NOT NULL,
	`target_biomarker` varchar(100),
	`avg_biomarker_improvement` decimal(6,2),
	`success_rate` decimal(5,2),
	`optimal_duration` int,
	`optimal_dosage` varchar(255),
	`most_effective_for` text,
	`protocol_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_optimization_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_optimization_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`overall_health` int,
	`chronological_age` int,
	`estimated_biological_age` int,
	`primary_goal` enum('longevity','disease_prevention','optimize_biomarkers','increase_healthspan','reverse_aging','peak_performance','disease_management') NOT NULL,
	`family_history` text,
	`current_conditions` text,
	`risk_factors` text,
	`current_medications` text,
	`smoking_status` enum('never','former','current'),
	`alcohol_consumption` enum('none','light','moderate','heavy'),
	`active_protocols` text,
	`most_effective_interventions` text,
	`biomarker_trends` text,
	`health_trajectory` enum('improving','stable','declining'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_optimization_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_protocols` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`protocol_name` varchar(255) NOT NULL,
	`protocol_type` enum('supplement_stack','dietary_intervention','exercise_protocol','sleep_optimization','stress_management','cold_exposure','heat_exposure','fasting','red_light_therapy','breathwork','other') NOT NULL,
	`description` text,
	`protocol` text,
	`target_biomarker` varchar(255),
	`target_condition` varchar(255),
	`start_date` timestamp,
	`planned_duration` int,
	`end_date` timestamp,
	`baseline_measurement` text,
	`end_measurement` text,
	`effectiveness` int,
	`side_effects` text,
	`will_continue` boolean,
	`status` enum('active','completed','discontinued') DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_protocols_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_screenings` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`screening_date` timestamp NOT NULL,
	`screening_type` enum('blood_work','DEXA_scan','VO2_max','coronary_calcium_score','colonoscopy','mammogram','skin_check','eye_exam','dental_checkup','genetic_testing','microbiome_test','other') NOT NULL,
	`screening_name` varchar(255),
	`results` text,
	`abnormal_findings` text,
	`follow_up_needed` boolean,
	`follow_up_date` timestamp,
	`provider` varchar(255),
	`results_file` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_screenings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `longevity_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`practice_type` enum('time_restricted_eating','caloric_restriction','cold_exposure','heat_exposure','zone_2_cardio','strength_training','VO2_max_training','red_light_therapy','breathwork','meditation','social_connection','purpose_work') NOT NULL,
	`duration` int,
	`intensity` enum('low','moderate','high'),
	`specific_metrics` text,
	`how_it_felt` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `longevity_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`sleep_date` timestamp NOT NULL,
	`bed_time` timestamp,
	`wake_time` timestamp,
	`total_time_in_bed` int,
	`total_sleep_time` int,
	`sleep_efficiency` int,
	`awake_duration` int,
	`light_sleep_duration` int,
	`deep_sleep_duration` int,
	`rem_sleep_duration` int,
	`sleep_quality` int,
	`times_to_wake` int,
	`time_to_fall_asleep` int,
	`caffeine_after_2pm` boolean,
	`alcohol_before_bed` boolean,
	`screen_time_before_bed` int,
	`exercise_today` boolean,
	`stress_level` int,
	`room_temperature` int,
	`noise_level` enum('silent','quiet','moderate','loud'),
	`light_level` enum('dark','dim','moderate','bright'),
	`morning_energy` int,
	`morning_mood` varchar(100),
	`data_source` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_recovery_logs` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`perceived_stress` int,
	`stress_sources` text,
	`morning_hrv` int,
	`recovery_score` int,
	`resting_heart_rate` int,
	`daily_strain` decimal(4,1),
	`recovery_strategies` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_recovery_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_affirmations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`affirmation_date` timestamp NOT NULL,
	`affirmations` text,
	`practice_method` enum('spoken_aloud','written','visualization','mirror_work','meditation'),
	`repetitions` int,
	`belief_level` int,
	`impact_on_mood` int,
	`impact_on_behavior` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_affirmations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identity_transformations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`old_identity_statement` text,
	`old_behaviors` text,
	`old_beliefs` text,
	`new_identity_statement` text,
	`new_behaviors` text,
	`new_beliefs` text,
	`supporting_principles` text,
	`transformation_progress` int,
	`evidence_of_change` text,
	`start_date` timestamp,
	`target_date` timestamp,
	`status` enum('in_progress','achieved','evolving') DEFAULT 'in_progress',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `identity_transformations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `principle_goals` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`goal_title` varchar(255) NOT NULL,
	`goal_description` text,
	`primary_principle` varchar(255) NOT NULL,
	`supporting_principles` text,
	`identity_statement` text,
	`target_date` timestamp,
	`milestones` text,
	`progress` int,
	`why_it_matters` text,
	`status` enum('active','achieved','abandoned') DEFAULT 'active',
	`achieved_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `principle_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `principle_practices` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`principle_id` varchar(255) NOT NULL,
	`principle_number` int NOT NULL,
	`practice_type` enum('reading','reflection','action','meditation','affirmation','habit_practice') NOT NULL,
	`time_spent` int,
	`completed` boolean DEFAULT true,
	`reflection_notes` text,
	`insights` text,
	`actions_taken` text,
	`challenges_faced` text,
	`wins_achieved` text,
	`impact_on_day` int,
	`embodiment_level` int,
	`mood_before` varchar(100),
	`mood_after` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `principle_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `principle_progress` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`principle_id` varchar(255) NOT NULL,
	`mastery_level` int,
	`total_practices` int,
	`current_streak` int,
	`longest_streak` int,
	`avg_embodiment_level` decimal(4,2),
	`avg_life_impact` decimal(4,2),
	`life_areas_improved` text,
	`milestones` text,
	`last_practiced` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `principle_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `principles` (
	`id` varchar(255) NOT NULL,
	`principle_number` int NOT NULL,
	`principle_name` varchar(255) NOT NULL,
	`identity_statement` varchar(255) NOT NULL,
	`core_teaching` text,
	`why_it_matters` text,
	`daily_practice` text,
	`reflection_prompts` text,
	`key_habits` text,
	`life_applications` text,
	`research_basis` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `principles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transformative_moments` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`moment_date` timestamp NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`related_principle` varchar(255),
	`moment_type` enum('breakthrough','embodiment','identity_shift','challenge_overcome','pattern_broken','new_behavior','peak_experience') NOT NULL,
	`significance` int,
	`life_areas_affected` text,
	`insights` text,
	`lessons_learned` text,
	`how_to_maintain` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `transformative_moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transformative_principles_analytics` (
	`id` varchar(255) NOT NULL,
	`principle_id` varchar(255) NOT NULL,
	`avg_life_impact` decimal(5,2),
	`avg_embodiment_level` decimal(5,2),
	`relationship_improvement` decimal(5,2),
	`career_improvement` decimal(5,2),
	`health_improvement` decimal(5,2),
	`mental_health_improvement` decimal(5,2),
	`optimal_practice_frequency` varchar(100),
	`optimal_practice_format` varchar(100),
	`most_effective_for` text,
	`practice_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `transformative_principles_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transformative_principles_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`overall_growth` int,
	`primary_principle` enum('discipline','resilience','purpose','presence','gratitude','persistence','compassion','courage','growth','authenticity','connection','wholeness'),
	`preferred_practice_time` enum('morning','midday','evening','night'),
	`practice_frequency` enum('daily','weekdays','custom'),
	`reminders_enabled` boolean DEFAULT true,
	`reminder_time` varchar(10),
	`most_impactful_principles` text,
	`optimal_practice_format` text,
	`principle_life_correlations` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `transformative_principles_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_principle_reviews` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`week_start_date` timestamp NOT NULL,
	`overall_growth` int,
	`focus_principle` varchar(255),
	`biggest_wins` text,
	`principles_embodied` text,
	`biggest_challenges` text,
	`principles_needed` text,
	`key_insights` text,
	`lessons_learned` text,
	`focus_for_next_week` varchar(255),
	`commitments` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `weekly_principle_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_challenges` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`challenge_name` varchar(255) NOT NULL,
	`challenge_type` enum('number_memorization','name_recall','card_memorization','word_list','dates_events','vocabulary','custom') NOT NULL,
	`item_count` int,
	`time_limit` int,
	`items_recalled` int,
	`accuracy` decimal(5,2),
	`time_used` int,
	`score` int,
	`personal_best` boolean,
	`attempt_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_items` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`item_type` enum('fact','concept','name_face','vocabulary','number','date','formula','procedure','quote','list','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`category` varchar(255),
	`tags` text,
	`encoding_technique` enum('rote_repetition','spaced_repetition','memory_palace','chunking','elaboration','dual_coding','mnemonic','story','acronym','rhyme','visualization'),
	`palace_location` varchar(255),
	`visual_image` text,
	`mnemonic_device` text,
	`related_items` text,
	`existing_knowledge` text,
	`importance` int,
	`ease_factor` decimal(4,2) DEFAULT '2.5',
	`interval` int DEFAULT 1,
	`repetitions` int DEFAULT 0,
	`next_review_date` timestamp,
	`total_reviews` int DEFAULT 0,
	`successful_recalls` int DEFAULT 0,
	`retention_rate` decimal(5,2),
	`mastered` boolean DEFAULT false,
	`mastered_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_mastery_analytics` (
	`id` varchar(255) NOT NULL,
	`technique` varchar(100) NOT NULL,
	`item_type` varchar(100),
	`avg_retention_rate` decimal(5,2),
	`avg_recall_speed` decimal(6,2),
	`optimal_review_interval` int,
	`optimal_session_duration` int,
	`most_effective_for` text,
	`review_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_mastery_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_mastery_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`self_assessed_memory` int,
	`primary_goal` enum('improve_retention','learn_faster','remember_names','study_efficiency','professional_knowledge','language_learning','prevent_decline','peak_performance') NOT NULL,
	`preferred_techniques` text,
	`learning_style` enum('visual','auditory','kinesthetic','reading_writing','mixed'),
	`daily_review_time` varchar(10),
	`weekly_goal_minutes` int,
	`optimal_review_time` varchar(100),
	`personal_forgetting_curve` text,
	`most_effective_techniques` text,
	`optimal_review_intervals` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_mastery_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('items_mastered','retention_rate','streak','technique_mastered','challenge_completed','palace_created','personal_record') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achieved_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_palaces` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`palace_name` varchar(255) NOT NULL,
	`description` text,
	`locations` text,
	`purpose` varchar(255),
	`item_count` int DEFAULT 0,
	`avg_recall_rate` decimal(5,2),
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_palaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_reviews` (
	`id` varchar(255) NOT NULL,
	`item_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`review_date` timestamp NOT NULL,
	`review_type` enum('scheduled','cramming','reinforcement','test') NOT NULL,
	`recalled` boolean NOT NULL,
	`recall_speed` enum('instant','quick','slow','failed'),
	`confidence` int,
	`difficulty_rating` enum('again','hard','good','easy') NOT NULL,
	`time_to_recall` int,
	`review_context` varchar(255),
	`distractions` boolean,
	`next_interval` int,
	`next_review_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_technique_practice` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`technique` enum('memory_palace','chunking','peg_system','major_system','link_method','acronym','visualization','dual_coding','elaboration','active_recall') NOT NULL,
	`practice_type` varchar(255),
	`duration` int,
	`items_attempted` int,
	`items_recalled` int,
	`accuracy_rate` decimal(5,2),
	`difficulty` int,
	`improvement_from_last` decimal(6,2),
	`notes` text,
	`challenges_faced` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `memory_technique_practice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `name_face_memory` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`person_name` varchar(255) NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`face_photo` varchar(255),
	`outstanding_feature` text,
	`name_association` text,
	`substitute_word` varchar(255),
	`mental_link` text,
	`where_met` varchar(255),
	`when_met` timestamp,
	`relationship` varchar(255),
	`occupation` varchar(255),
	`interests` text,
	`mutual_connections` text,
	`conversation_topics` text,
	`total_encounters` int DEFAULT 1,
	`successful_recalls` int DEFAULT 0,
	`last_encounter` timestamp,
	`importance` int,
	`mastered` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `name_face_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `name_recall_practice` (
	`id` varchar(255) NOT NULL,
	`name_face_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`practice_type` enum('face_to_name','name_to_face','feature_identification','association_review') NOT NULL,
	`recalled` boolean,
	`recall_speed` enum('instant','quick','slow','failed'),
	`confidence` int,
	`time_to_recall` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `name_recall_practice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `number_memory` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`number` varchar(255) NOT NULL,
	`number_type` enum('phone','pin','date','address','credit_card','id_number','mathematical_constant','other') NOT NULL,
	`label` varchar(255),
	`phonetic_words` text,
	`visual_story` text,
	`chunks` text,
	`total_recalls` int DEFAULT 0,
	`successful_recalls` int DEFAULT 0,
	`mastered` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `number_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_memory_tracking` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`tracking_date` timestamp NOT NULL,
	`studied_before_sleep` boolean,
	`study_topics` text,
	`study_duration` int,
	`sleep_quality` int,
	`sleep_duration` decimal(3,1),
	`deep_sleep_minutes` int,
	`morning_recall_test` boolean,
	`morning_recall_accuracy` decimal(5,2),
	`consolidation_effect` decimal(6,2),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_memory_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_formation_analytics` (
	`id` varchar(255) NOT NULL,
	`strategy` varchar(100) NOT NULL,
	`habit_category` varchar(100),
	`avg_success_rate` decimal(5,2),
	`avg_time_to_automaticity` int,
	`avg_streak_length` int,
	`optimal_cue_type` varchar(100),
	`optimal_time_of_day` varchar(50),
	`most_effective_for` text,
	`habit_count` int,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_formation_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_milestones` (
	`id` varchar(255) NOT NULL,
	`habit_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('first_completion','streak_milestone','automaticity_achieved','identity_shift','mastery') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achieved_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_obstacles` (
	`id` varchar(255) NOT NULL,
	`habit_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`obstacle_description` text NOT NULL,
	`obstacle_type` enum('time','energy','motivation','environment','other_people','self_doubt','competing_priority','physical_limitation','lack_of_skill'),
	`frequency` enum('rare','occasional','frequent','constant'),
	`if_then_plan` text,
	`solution_effectiveness` int,
	`resolved` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_obstacles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`total_active_habits` int DEFAULT 0,
	`total_mastered_habits` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`preferred_habit_time` enum('morning','midday','evening','night','flexible'),
	`most_successful_cues` text,
	`optimal_habit_stack_sequence` text,
	`personal_success_factors` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_stacks` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`stack_name` varchar(255) NOT NULL,
	`description` text,
	`time_of_day` enum('morning','midday','evening','night'),
	`habit_sequence` text,
	`estimated_duration` int,
	`total_completions` int DEFAULT 0,
	`current_streak` int DEFAULT 0,
	`success_rate` decimal(5,2),
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_stacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_tracking` (
	`id` varchar(255) NOT NULL,
	`habit_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`tracking_date` timestamp NOT NULL,
	`completed` boolean NOT NULL,
	`duration` int,
	`intensity` int,
	`time_of_day` varchar(50),
	`location` varchar(255),
	`cue_present` boolean,
	`cue_effectiveness` int,
	`resistance_level` int,
	`ease_of_completion` int,
	`reward_experienced` boolean,
	`reward_satisfaction` int,
	`felt_automatic` boolean,
	`mood_before` varchar(100),
	`mood_after` varchar(100),
	`energy_before` int,
	`energy_after` int,
	`notes` text,
	`challenges` text,
	`wins` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `habit_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`habit_name` varchar(255) NOT NULL,
	`habit_description` text,
	`identity_statement` varchar(255),
	`habit_type` enum('build','break','replace') NOT NULL,
	`category` enum('health','fitness','nutrition','sleep','mental_health','relationships','career','finance','learning','spiritual','productivity','other') NOT NULL,
	`tiny_version` varchar(255),
	`full_version` varchar(255),
	`cue` varchar(255) NOT NULL,
	`cue_type` enum('time','location','preceding_action','emotional_state','other_people'),
	`routine` varchar(255) NOT NULL,
	`reward` varchar(255),
	`anchor_habit` varchar(255),
	`stacking_formula` varchar(255),
	`implementation_intention` varchar(255),
	`environment_changes` text,
	`target_frequency` enum('daily','weekdays','weekends','weekly','custom') NOT NULL,
	`custom_frequency` text,
	`target_duration` int,
	`difficulty` int,
	`current_streak` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`total_completions` int DEFAULT 0,
	`success_rate` decimal(5,2),
	`automaticity_level` int,
	`status` enum('active','paused','mastered','abandoned') DEFAULT 'active',
	`start_date` timestamp NOT NULL,
	`mastered_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_pattern_practice` (
	`id` varchar(255) NOT NULL,
	`pattern_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`situation` text,
	`caught_old_pattern` boolean,
	`used_new_pattern` boolean,
	`impact_on_mood` int,
	`impact_on_action` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `language_pattern_practice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_patterns` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`pattern_type` enum('limiting_belief','empowering_belief','fixed_mindset','growth_mindset','victim_language','ownership_language','obligation_language','choice_language') NOT NULL,
	`original_statement` text,
	`reframed_statement` text,
	`context` varchar(255),
	`related_habit_id` varchar(255),
	`belief_in_old` int,
	`belief_in_new` int,
	`impact_on_behavior` int,
	`status` enum('working_on','integrated','mastered') DEFAULT 'working_on',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `language_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_habit_reviews` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`week_start_date` timestamp NOT NULL,
	`overall_success_rate` decimal(5,2),
	`total_habits_completed` int,
	`biggest_wins` text,
	`habits_getting_easier` text,
	`biggest_challenges` text,
	`habits_struggling_with` text,
	`limiting_language_caught` int,
	`empowering_language_used` int,
	`key_insights` text,
	`lessons_learned` text,
	`adjustments_planned` text,
	`new_habits_to_start` text,
	`habits_to_modify` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `weekly_habit_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_analytics` (
	`id` varchar(255) NOT NULL,
	`practice` varchar(100) NOT NULL,
	`avg_sleep_quality_improvement` decimal(5,2),
	`avg_sleep_duration_improvement` decimal(5,2),
	`optimal_implementation_time` varchar(100),
	`most_effective_for` text,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_experiments` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`experiment_name` varchar(255) NOT NULL,
	`hypothesis` text,
	`variable` varchar(255) NOT NULL,
	`start_date` timestamp,
	`end_date` timestamp,
	`duration` int,
	`baseline_sleep_quality` decimal(4,2),
	`baseline_sleep_duration` decimal(4,2),
	`avg_sleep_quality_during_experiment` decimal(4,2),
	`avg_sleep_duration_during_experiment` decimal(4,2),
	`improvement` decimal(6,2),
	`conclusion` text,
	`keep_practice` boolean,
	`status` enum('planning','active','completed') DEFAULT 'planning',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_hygiene_practices` (
	`id` varchar(255) NOT NULL,
	`sleep_tracking_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`practice_date` timestamp NOT NULL,
	`no_screens_1_hour_before` boolean,
	`dim_lights_evening` boolean,
	`cool_room_temp` boolean,
	`dark_room` boolean,
	`quiet_environment` boolean,
	`consistent_bedtime` boolean,
	`consistent_wake_time` boolean,
	`no_caffeine_after_2pm` boolean,
	`no_alcohol` boolean,
	`no_heavy_meal_before_3_hours` boolean,
	`morning_light_exposure` boolean,
	`exercised_today` boolean,
	`no_naps_after_3pm` boolean,
	`relaxation_practice` enum('none','meditation','breathing','reading','stretching','warm_bath','journaling'),
	`supplements` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_hygiene_practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_insights` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`insight_type` enum('pattern_detected','recommendation','warning','achievement','correlation_found') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`supporting_data` text,
	`action_recommended` text,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`acknowledged` boolean DEFAULT false,
	`action_taken` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_performance_correlations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`performance_area` enum('cognitive','physical','emotional','productivity','creativity','social') NOT NULL,
	`correlation_coefficient` decimal(4,3),
	`optimal_sleep_duration` decimal(3,1),
	`optimal_sleep_quality` int,
	`data_points` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_performance_correlations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`target_sleep_duration` decimal(3,1),
	`target_bedtime` varchar(10),
	`target_wake_time` varchar(10),
	`chronotype` enum('early_bird','night_owl','intermediate','unknown'),
	`sleep_issues` text,
	`tracking_method` enum('manual','wearable','app'),
	`wearable_device` varchar(100),
	`personal_sleep_need` decimal(3,1),
	`optimal_bedtime` varchar(10),
	`optimal_wake_time` varchar(10),
	`sleep_performance_correlations` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_tracking` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`sleep_date` timestamp NOT NULL,
	`bedtime` timestamp,
	`wake_time` timestamp,
	`time_in_bed` decimal(4,2),
	`actual_sleep_duration` decimal(4,2),
	`sleep_efficiency` decimal(5,2),
	`light_sleep_minutes` int,
	`deep_sleep_minutes` int,
	`rem_sleep_minutes` int,
	`awake_minutes` int,
	`sleep_quality` int,
	`sleep_score` int,
	`times_to_wake_up` int,
	`time_to_fall_asleep` int,
	`resting_heart_rate` int,
	`hrv` int,
	`respiratory_rate` decimal(4,2),
	`body_temperature` decimal(4,2),
	`recovery_score` int,
	`readiness_score` int,
	`morning_mood` varchar(100),
	`morning_energy` int,
	`morning_focus` int,
	`hygiene_score` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sleep_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accountability_partnerships` (
	`id` varchar(255) NOT NULL,
	`user1_id` varchar(255) NOT NULL,
	`user2_id` varchar(255) NOT NULL,
	`shared_goals` text,
	`check_in_frequency` enum('daily','weekly','biweekly','monthly'),
	`last_check_in` timestamp,
	`total_check_ins` int DEFAULT 0,
	`partnership_satisfaction` int,
	`helpfulness_rating` int,
	`status` enum('active','paused','ended') DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `accountability_partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_participants` (
	`id` varchar(255) NOT NULL,
	`challenge_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`current_streak` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`completion_rate` decimal(5,2),
	`last_update` timestamp,
	`completed` boolean DEFAULT false,
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `challenge_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cover_image` varchar(500),
	`community_type` enum('mental_health_recovery','addiction_recovery','autism_parents','young_men','relationships','career_growth','fitness','spiritual_growth','general_support') NOT NULL,
	`privacy` enum('public','private','invite_only') DEFAULT 'public',
	`moderator_ids` text,
	`guidelines` text,
	`member_count` int DEFAULT 0,
	`active_members` int DEFAULT 0,
	`total_posts` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_analytics` (
	`id` varchar(255) NOT NULL,
	`support_type` varchar(100) NOT NULL,
	`avg_user_retention` decimal(5,2),
	`avg_goal_achievement` decimal(5,2),
	`avg_satisfaction` decimal(4,2),
	`optimal_check_in_frequency` varchar(50),
	`optimal_group_size` int,
	`most_effective_for` text,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_challenges` (
	`id` varchar(255) NOT NULL,
	`community_id` varchar(255),
	`challenge_name` varchar(255) NOT NULL,
	`description` text,
	`challenge_type` enum('habit_building','goal_achievement','streak','transformation') NOT NULL,
	`start_date` timestamp,
	`end_date` timestamp,
	`duration` int,
	`participant_count` int DEFAULT 0,
	`status` enum('upcoming','active','completed') DEFAULT 'upcoming',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_comments` (
	`id` varchar(255) NOT NULL,
	`post_id` varchar(255) NOT NULL,
	`author_id` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`likes_count` int DEFAULT 0,
	`flagged` boolean DEFAULT false,
	`visible` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_memberships` (
	`id` varchar(255) NOT NULL,
	`community_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`role` enum('member','moderator','admin') DEFAULT 'member',
	`last_active_at` timestamp,
	`posts_count` int DEFAULT 0,
	`comments_count` int DEFAULT 0,
	`notifications_enabled` boolean DEFAULT true,
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` varchar(255) NOT NULL,
	`community_id` varchar(255) NOT NULL,
	`author_id` varchar(255) NOT NULL,
	`post_type` enum('win','struggle','question','check_in','milestone','gratitude','resource','discussion') NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`images` text,
	`tags` text,
	`likes_count` int DEFAULT 0,
	`comments_count` int DEFAULT 0,
	`supports_count` int DEFAULT 0,
	`flagged` boolean DEFAULT false,
	`flag_reason` text,
	`visible` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`display_name` varchar(100) NOT NULL,
	`bio` text,
	`profile_photo` varchar(500),
	`share_progress` boolean DEFAULT true,
	`share_struggles` boolean DEFAULT true,
	`share_wins` boolean DEFAULT true,
	`primary_challenges` text,
	`primary_goals` text,
	`role` enum('member','mentor','moderator','admin') DEFAULT 'member',
	`available_as_mentor` boolean DEFAULT false,
	`mentorship_areas` text,
	`total_posts` int DEFAULT 0,
	`total_comments` int DEFAULT 0,
	`total_supports_given` int DEFAULT 0,
	`total_supports_received` int DEFAULT 0,
	`helpfulness_score` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `community_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_check_ins` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`check_in_date` timestamp NOT NULL,
	`mood` varchar(100),
	`energy` int,
	`today_goals` text,
	`grateful_for` text,
	`struggling_with` text,
	`need_support` boolean DEFAULT false,
	`wins_today` text,
	`share_with_community` boolean DEFAULT true,
	`supports_received` int DEFAULT 0,
	`comments_received` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorships` (
	`id` varchar(255) NOT NULL,
	`mentor_id` varchar(255) NOT NULL,
	`mentee_id` varchar(255) NOT NULL,
	`focus_area` varchar(255) NOT NULL,
	`meeting_frequency` enum('weekly','biweekly','monthly'),
	`total_sessions` int DEFAULT 0,
	`last_session` timestamp,
	`mentee_progress` int,
	`mentee_satisfaction` int,
	`status` enum('active','paused','completed') DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mentorships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_check_ins` (
	`id` varchar(255) NOT NULL,
	`partnership_id` varchar(255) NOT NULL,
	`initiator_id` varchar(255) NOT NULL,
	`check_in_date` timestamp NOT NULL,
	`user1_progress` text,
	`user1_struggles` text,
	`user1_wins` text,
	`user1_next_steps` text,
	`user2_progress` text,
	`user2_struggles` text,
	`user2_wins` text,
	`user2_next_steps` text,
	`encouragement_given` text,
	`helpfulness` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `partner_check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` varchar(255) NOT NULL,
	`achievement_name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`category` enum('habits','goals','streaks','community','learning','health','transformation') NOT NULL,
	`difficulty` enum('bronze','silver','gold','platinum','legendary'),
	`requirements` text,
	`experience_points` int NOT NULL,
	`rarity` enum('common','uncommon','rare','epic','legendary'),
	`total_unlocked` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` varchar(255) NOT NULL,
	`badge_name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`category` varchar(100),
	`rarity` enum('common','uncommon','rare','epic','legendary'),
	`how_to_earn` text,
	`total_awarded` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` varchar(255) NOT NULL,
	`challenge_name` varchar(255) NOT NULL,
	`description` text,
	`challenge_type` enum('daily','weekly','one_time','recurring') NOT NULL,
	`difficulty` int,
	`requirements` text,
	`experience_points` int,
	`badge_id` varchar(255),
	`start_date` timestamp,
	`end_date` timestamp,
	`total_attempts` int DEFAULT 0,
	`total_completions` int DEFAULT 0,
	`success_rate` decimal(5,2),
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_rewards` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reward_date` timestamp NOT NULL,
	`consecutive_days` int,
	`streak_bonus` int,
	`tasks_completed` int,
	`completion_bonus` int,
	`total_experience_points` int,
	`claimed` boolean DEFAULT false,
	`claimed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_points_log` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`source` enum('habit_completion','daily_check_in','goal_achievement','milestone_reached','challenge_completed','helping_others','consistency_bonus','level_up') NOT NULL,
	`source_id` varchar(255),
	`points_earned` int NOT NULL,
	`description` varchar(255),
	`earned_at` timestamp DEFAULT (now()),
	CONSTRAINT `experience_points_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gamification_analytics` (
	`id` varchar(255) NOT NULL,
	`element_type` varchar(100) NOT NULL,
	`avg_engagement_increase` decimal(5,2),
	`avg_retention_impact` decimal(5,2),
	`avg_goal_completion_impact` decimal(5,2),
	`optimal_difficulty` int,
	`optimal_reward_timing` varchar(100),
	`most_effective_for` text,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `gamification_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gamification_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`total_experience_points` int DEFAULT 0,
	`current_level` int DEFAULT 1,
	`experience_to_next_level` int DEFAULT 100,
	`current_streak` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`total_days_active` int DEFAULT 0,
	`total_achievements` int DEFAULT 0,
	`total_badges` int DEFAULT 0,
	`total_milestones` int DEFAULT 0,
	`motivation_type` enum('autonomy_driven','competence_driven','relatedness_driven','mixed'),
	`likes_competition` boolean DEFAULT false,
	`likes_collaboration` boolean DEFAULT true,
	`likes_challenges` boolean DEFAULT true,
	`likes_rewards` boolean DEFAULT true,
	`most_motivating_rewards` text,
	`optimal_challenge_difficulty` int,
	`motivation_patterns` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `gamification_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_entries` (
	`id` varchar(255) NOT NULL,
	`leaderboard_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`rank` int,
	`score` int,
	`opted_in` boolean DEFAULT false,
	`last_updated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `leaderboard_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` varchar(255) NOT NULL,
	`leaderboard_name` varchar(255) NOT NULL,
	`description` text,
	`leaderboard_type` enum('overall_xp','current_streak','goals_achieved','habits_mastered','community_support','transformation') NOT NULL,
	`time_period` enum('all_time','monthly','weekly'),
	`opt_in_only` boolean DEFAULT true,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `leaderboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('first_day','first_week','first_month','100_days','1_year','first_goal','10_goals','first_habit_mastered','level_milestone','transformation_milestone') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`experience_points` int,
	`related_to` varchar(255),
	`achieved_at` timestamp DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motivation_boosts` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`trigger_type` enum('streak_at_risk','low_engagement','goal_stalled','achievement_close','milestone_approaching') NOT NULL,
	`boost_type` enum('encouragement','reminder','challenge','reward_preview','social_proof') NOT NULL,
	`message` text,
	`action_suggested` varchar(255),
	`opened` boolean DEFAULT false,
	`action_taken` boolean DEFAULT false,
	`sent_at` timestamp DEFAULT (now()),
	CONSTRAINT `motivation_boosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` varchar(255) NOT NULL,
	`achievement_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`progress` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`unlocked_at` timestamp,
	`display_on_profile` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` varchar(255) NOT NULL,
	`badge_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`awarded_for` text,
	`display_on_profile` boolean DEFAULT true,
	`awarded_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenges` (
	`id` varchar(255) NOT NULL,
	`challenge_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`progress` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`started_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	`attempts` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`event_data` text,
	`session_id` varchar(255),
	`event_timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_learning` (
	`id` varchar(255) NOT NULL,
	`insight_type` varchar(100) NOT NULL,
	`avg_view_rate` decimal(5,2),
	`avg_action_rate` decimal(5,2),
	`avg_helpfulness_rating` decimal(4,2),
	`avg_behavior_change` decimal(5,2),
	`optimal_timing` varchar(100),
	`optimal_frequency` varchar(100),
	`most_effective_for` text,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_learning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`preferred_view` enum('overview','detailed','minimal') DEFAULT 'overview',
	`preferred_chart_type` enum('line','bar','area','mixed') DEFAULT 'line',
	`tracking_frequency` enum('daily','weekly','monthly'),
	`insight_frequency` enum('daily','weekly','monthly'),
	`insight_types` text,
	`most_actionable_insights` text,
	`preferred_metrics` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comparative_analytics` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`comparison_type` enum('week_over_week','month_over_month','quarter_over_quarter','year_over_year','best_week_vs_current','worst_week_vs_current') NOT NULL,
	`metric` varchar(255) NOT NULL,
	`current_value` decimal(10,2),
	`comparison_value` decimal(10,2),
	`absolute_change` decimal(10,2),
	`percent_change` decimal(6,2),
	`trend` enum('improving','stable','declining'),
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `comparative_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `correlations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`variable1` varchar(255) NOT NULL,
	`variable2` varchar(255) NOT NULL,
	`correlation_coefficient` decimal(4,3),
	`p_value` decimal(6,5),
	`relationship` enum('strong_positive','moderate_positive','weak_positive','no_correlation','weak_negative','moderate_negative','strong_negative'),
	`insight` text,
	`actionable` boolean DEFAULT false,
	`data_points` int,
	`confidence_level` decimal(5,2),
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `correlations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_snapshots` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`snapshot_date` timestamp NOT NULL,
	`overall_wellness_score` int,
	`physical_score` int,
	`mental_score` int,
	`emotional_score` int,
	`spiritual_score` int,
	`habits_completed` int,
	`habits_total` int,
	`habit_completion_rate` decimal(5,2),
	`sleep_duration` decimal(4,2),
	`sleep_quality` int,
	`avg_mood` int,
	`avg_energy` int,
	`productivity_score` int,
	`stress_level` int,
	`recovery_score` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`insight_type` enum('pattern_detected','correlation_found','trend_alert','achievement_close','recommendation','warning','celebration') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`supporting_data` text,
	`actionable` boolean DEFAULT false,
	`suggested_action` text,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`viewed` boolean DEFAULT false,
	`viewed_at` timestamp,
	`action_taken` boolean DEFAULT false,
	`action_taken_at` timestamp,
	`helpful` boolean,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_reports` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`month_start_date` timestamp NOT NULL,
	`transformation_score` int,
	`habits_started` int,
	`habits_mastered` int,
	`habits_abandoned` int,
	`avg_habit_success_rate` decimal(5,2),
	`goals_set` int,
	`goals_achieved` int,
	`goal_achievement_rate` decimal(5,2),
	`physical_trend` enum('improving','stable','declining'),
	`mental_trend` enum('improving','stable','declining'),
	`emotional_trend` enum('improving','stable','declining'),
	`spiritual_trend` enum('improving','stable','declining'),
	`community_engagement` int,
	`supports_given` int,
	`supports_received` int,
	`achievements_unlocked` int,
	`milestones_reached` int,
	`identity_shift_score` int,
	`month_summary` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `monthly_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`prediction_type` enum('goal_achievement','habit_sustainability','wellness_trajectory','risk_assessment','optimal_intervention') NOT NULL,
	`target_id` varchar(255),
	`target_name` varchar(255),
	`prediction` text,
	`confidence` decimal(5,2),
	`timeframe` varchar(100),
	`key_factors` text,
	`recommendation` text,
	`actual_outcome` text,
	`prediction_accurate` boolean,
	`created_at` timestamp DEFAULT (now()),
	`validated_at` timestamp,
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_milestones` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_type` enum('first_improvement','10_percent_improvement','50_percent_improvement','100_percent_improvement','goal_halfway','goal_75_percent','goal_achieved','consistency_milestone','transformation_milestone') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`metric` varchar(255),
	`baseline_value` decimal(10,2),
	`current_value` decimal(10,2),
	`improvement_percent` decimal(6,2),
	`related_to` varchar(255),
	`achieved_at` timestamp DEFAULT (now()),
	CONSTRAINT `progress_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`week_start_date` timestamp NOT NULL,
	`overall_score` int,
	`score_change` decimal(6,2),
	`avg_habit_completion_rate` decimal(5,2),
	`habits_completion_change` decimal(6,2),
	`avg_sleep_duration` decimal(4,2),
	`avg_sleep_quality` decimal(4,2),
	`sleep_consistency` decimal(5,2),
	`avg_mood` decimal(4,2),
	`avg_energy` decimal(4,2),
	`mood_stability` decimal(5,2),
	`goals_achieved` int,
	`goals_in_progress` int,
	`biggest_wins` text,
	`biggest_challenges` text,
	`key_insights` text,
	`recommendations` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `weekly_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_stress_logs` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`log_date` timestamp NOT NULL,
	`avg_stress_level` int,
	`peak_stress_level` int,
	`morning_hrv` decimal(6,2),
	`avg_hrv` decimal(6,2),
	`hrv_trend` enum('improving','stable','declining'),
	`avg_resting_hr` int,
	`peak_hr` int,
	`morning_cortisol` enum('low','normal','high'),
	`evening_cortisol` enum('low','normal','high'),
	`cortisol_rhythm` enum('healthy','disrupted'),
	`symptoms` text,
	`symptom_severity` int,
	`sleep_quality` int,
	`sleep_duration` decimal(4,2),
	`irritability` int,
	`concentration` int,
	`appetite` enum('low','normal','high','stress_eating'),
	`interventions_used` text,
	`intervention_effectiveness` int,
	`recovery_quality` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_stress_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hrv_measurements` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`measurement_time` timestamp NOT NULL,
	`measurement_type` enum('morning','pre_workout','post_workout','evening','random'),
	`rmssd` decimal(6,2),
	`sdnn` decimal(6,2),
	`pnn50` decimal(5,2),
	`avg_heart_rate` int,
	`hrv_score` int,
	`recovery_status` enum('recovered','recovering','not_recovered'),
	`sleep_quality_prior_night` int,
	`stress_level_prior_day` int,
	`exercise_intensity_prior_day` enum('none','light','moderate','intense'),
	`measurement_device` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `hrv_measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_analytics` (
	`id` varchar(255) NOT NULL,
	`intervention_type` varchar(100) NOT NULL,
	`avg_stress_reduction` decimal(5,2),
	`avg_effectiveness_rating` decimal(4,2),
	`success_rate` decimal(5,2),
	`optimal_duration` int,
	`optimal_timing` varchar(100),
	`most_effective_for_stress_type` text,
	`most_effective_for_user_type` text,
	`user_count` int,
	`total_uses` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_events` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`stress_level` int NOT NULL,
	`event_timestamp` timestamp NOT NULL,
	`trigger` varchar(255),
	`trigger_category` enum('work','relationships','financial','health','family','traffic','technology','uncertainty','time_pressure','conflict','other'),
	`location` varchar(255),
	`activity` varchar(255),
	`social_context` enum('alone','with_others','crowd'),
	`heart_rate` int,
	`physical_symptoms` text,
	`primary_emotion` enum('anxiety','anger','frustration','overwhelm','fear','sadness','irritation'),
	`thoughts` text,
	`cognitive_distortions` text,
	`response_type` enum('fight','flight','freeze','fawn'),
	`intervention_used` varchar(255),
	`intervention_effective` boolean,
	`recovery_time` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_interventions` (
	`id` varchar(255) NOT NULL,
	`intervention_name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('breathing','movement','mindfulness','cognitive','social','sensory','rest','creative','other') NOT NULL,
	`research_backed` boolean DEFAULT false,
	`research_sources` text,
	`duration_minutes` int,
	`instructions` text,
	`best_for` text,
	`avg_effectiveness_rating` decimal(4,2),
	`total_uses` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_predictions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`prediction_type` enum('stress_spike_risk','burnout_risk','recovery_needed','optimal_intervention') NOT NULL,
	`prediction` text,
	`confidence` decimal(5,2),
	`timeframe` varchar(100),
	`factors` text,
	`recommendation` text,
	`actual_outcome` text,
	`prediction_accurate` boolean,
	`created_at` timestamp DEFAULT (now()),
	`validated_at` timestamp,
	CONSTRAINT `stress_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`baseline_stress_level` int,
	`baseline_hrv` decimal(6,2),
	`baseline_resting_hr` int,
	`stress_resilience_score` int,
	`recovery_capacity` int,
	`stress_mindset` enum('stress_is_harmful','stress_is_enhancing','mixed'),
	`dominant_response` enum('fight','flight','freeze','fawn'),
	`common_triggers` text,
	`common_symptoms` text,
	`preferred_interventions` text,
	`stress_patterns` text,
	`optimal_recovery_time` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_recovery_sessions` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_type` enum('nsdr','yoga_nidra','progressive_relaxation','meditation','breathwork','cold_exposure','sauna','massage','nature_walk','creative_activity') NOT NULL,
	`duration_minutes` int,
	`stress_level_before` int,
	`hrv_before` decimal(6,2),
	`stress_level_after` int,
	`hrv_after` decimal(6,2),
	`recovery_score` int,
	`notes` text,
	`session_date` timestamp DEFAULT (now()),
	CONSTRAINT `stress_recovery_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stress_triggers` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`trigger_name` varchar(255) NOT NULL,
	`trigger_category` varchar(100),
	`occurrence_count` int DEFAULT 0,
	`last_occurrence` timestamp,
	`avg_stress_level` decimal(4,2),
	`avg_recovery_time` int,
	`time_patterns` text,
	`context_patterns` text,
	`avoidable` boolean,
	`effective_strategies` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `stress_triggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_intervention_logs` (
	`id` varchar(255) NOT NULL,
	`intervention_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`stress_event_id` varchar(255),
	`stress_level_before` int,
	`duration_minutes` int,
	`completed_fully` boolean DEFAULT true,
	`stress_level_after` int,
	`effectiveness_rating` int,
	`side_effects` text,
	`notes` text,
	`used_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_intervention_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_accountability` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`accountability_type` enum('self_tracking','accountability_partner','group','public_commitment','coach','financial_stake') NOT NULL,
	`partner_id` varchar(255),
	`check_in_frequency` enum('daily','weekly','biweekly','monthly'),
	`last_check_in` timestamp,
	`next_check_in` timestamp,
	`adherence_rate` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goal_accountability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_analytics` (
	`id` varchar(255) NOT NULL,
	`goal_type` varchar(100) NOT NULL,
	`avg_achievement_rate` decimal(5,2),
	`avg_time_to_completion` int,
	`avg_abandonment_rate` decimal(5,2),
	`optimal_difficulty` int,
	`optimal_timeframe` int,
	`optimal_accountability_type` varchar(100),
	`success_factors` text,
	`failure_factors` text,
	`user_count` int,
	`total_goals` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goal_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_milestones` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`milestone_name` varchar(255) NOT NULL,
	`description` text,
	`target_value` decimal(10,2),
	`target_date` timestamp,
	`achieved` boolean DEFAULT false,
	`achieved_at` timestamp,
	`sequence_order` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_obstacles` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`obstacle_name` varchar(255) NOT NULL,
	`description` text,
	`obstacle_type` enum('internal','external','skill','environmental','social'),
	`severity` int,
	`occurrence_count` int DEFAULT 0,
	`last_occurrence` timestamp,
	`solution` text,
	`solution_effective` boolean,
	`overcome` boolean DEFAULT false,
	`overcame_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goal_obstacles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_predictions` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`prediction_type` enum('success_probability','completion_date','obstacle_likelihood','optimal_adjustment') NOT NULL,
	`prediction` text,
	`confidence` decimal(5,2),
	`factors` text,
	`recommendation` text,
	`actual_outcome` text,
	`prediction_accurate` boolean,
	`created_at` timestamp DEFAULT (now()),
	`validated_at` timestamp,
	CONSTRAINT `goal_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`total_goals_set` int DEFAULT 0,
	`total_goals_achieved` int DEFAULT 0,
	`total_goals_abandoned` int DEFAULT 0,
	`achievement_rate` decimal(5,2),
	`preferred_framework` enum('smart','okr','woop','habit_based','identity_based'),
	`optimal_goal_difficulty` int,
	`optimal_timeframe` varchar(100),
	`optimal_goal_count` int,
	`motivation_type` enum('outcome_focused','process_focused','identity_focused','mixed'),
	`needs_accountability` boolean DEFAULT false,
	`preferred_accountability_type` enum('self','partner','group','public','coach'),
	`success_patterns` text,
	`failure_patterns` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goal_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_progress_logs` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`current_value` decimal(10,2) NOT NULL,
	`progress_percent` decimal(5,2),
	`notes` text,
	`momentum` enum('accelerating','steady','slowing','stalled'),
	`log_date` timestamp DEFAULT (now()),
	CONSTRAINT `goal_progress_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_reflections` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reflection_type` enum('weekly_review','monthly_review','achievement_reflection','obstacle_reflection','abandonment_reflection') NOT NULL,
	`what_worked` text,
	`what_didnt_work` text,
	`lessons_learned` text,
	`adjustments_needed` text,
	`confidence_level` int,
	`motivation_level` int,
	`reflection_date` timestamp DEFAULT (now()),
	CONSTRAINT `goal_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`goal_name` varchar(255) NOT NULL,
	`description` text,
	`goal_type` enum('outcome','process','performance','learning','avoidance','identity') NOT NULL,
	`framework` enum('smart','okr','woop','habit_based','identity_based'),
	`specific` boolean DEFAULT false,
	`measurable` boolean DEFAULT false,
	`achievable` boolean DEFAULT false,
	`relevant` boolean DEFAULT false,
	`time_bound` boolean DEFAULT false,
	`category` enum('health','fitness','career','financial','relationships','personal_growth','learning','creative','spiritual','other'),
	`difficulty` int,
	`start_date` timestamp,
	`target_date` timestamp,
	`metric_type` enum('number','percentage','boolean','custom'),
	`current_value` decimal(10,2),
	`target_value` decimal(10,2),
	`unit` varchar(50),
	`progress_percent` decimal(5,2),
	`status` enum('not_started','in_progress','on_track','at_risk','behind','achieved','abandoned') DEFAULT 'not_started',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`is_public` boolean DEFAULT false,
	`related_habit_id` varchar(255),
	`related_goal_id` varchar(255),
	`completed_at` timestamp,
	`abandoned_at` timestamp,
	`abandon_reason` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `implementation_intentions` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`if_condition` text NOT NULL,
	`then_action` text NOT NULL,
	`intention_type` enum('initiation','execution','obstacle_management','recovery'),
	`times_triggered` int DEFAULT 0,
	`times_executed` int DEFAULT 0,
	`execution_rate` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `implementation_intentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `key_results` (
	`id` varchar(255) NOT NULL,
	`okr_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`key_result` text NOT NULL,
	`current_value` decimal(10,2),
	`target_value` decimal(10,2),
	`unit` varchar(50),
	`progress_percent` decimal(5,2),
	`status` enum('not_started','in_progress','achieved') DEFAULT 'not_started',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `key_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `okrs` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`objective` text NOT NULL,
	`time_period` enum('quarterly','annual','custom'),
	`start_date` timestamp,
	`end_date` timestamp,
	`overall_progress` decimal(5,2),
	`status` enum('not_started','in_progress','achieved','abandoned') DEFAULT 'not_started',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `okrs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `woop_plans` (
	`id` varchar(255) NOT NULL,
	`goal_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`wish` text NOT NULL,
	`outcome` text NOT NULL,
	`outcome_visualization` text,
	`obstacle` text NOT NULL,
	`obstacle_anticipation` text,
	`plan` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `woop_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `best_possible_self_entries` (
	`id` varchar(255) NOT NULL,
	`journal_entry_id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`timeframe` enum('1_year','5_years','10_years','end_of_life') NOT NULL,
	`personal_life` text,
	`relationships` text,
	`career` text,
	`health` text,
	`contributions` text,
	`who_you_are` text,
	`how_you_feel` text,
	`entry_date` timestamp DEFAULT (now()),
	CONSTRAINT `best_possible_self_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_reviews` (
	`id` varchar(255) NOT NULL,
	`journal_entry_id` varchar(255),
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`review_date` timestamp NOT NULL,
	`went_well` text,
	`why_it_went_well` text,
	`didnt_go_well` text,
	`why_it_didnt_go_well` text,
	`lessons_learned` text,
	`tomorrow_focus` text,
	`day_rating` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `daily_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_patterns` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`pattern_type` enum('recurring_emotion','trigger_pattern','time_pattern','context_pattern','cycle_pattern') NOT NULL,
	`pattern_name` varchar(255) NOT NULL,
	`description` text,
	`occurrence_count` int DEFAULT 0,
	`first_detected` timestamp,
	`last_detected` timestamp,
	`associated_emotions` text,
	`associated_triggers` text,
	`associated_contexts` text,
	`insight` text,
	`actionable` boolean DEFAULT false,
	`suggested_action` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `emotional_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_analytics` (
	`id` varchar(255) NOT NULL,
	`entry_type` varchar(100) NOT NULL,
	`avg_mood_improvement` decimal(4,2),
	`avg_insights_generated` decimal(4,2),
	`avg_behavior_change` decimal(5,2),
	`optimal_word_count` int,
	`optimal_duration` int,
	`optimal_time_of_day` varchar(100),
	`most_effective_for` text,
	`user_count` int,
	`total_entries` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `journal_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`entry_type` enum('free_form','gratitude','reflective','expressive','goal_reflection','best_possible_self','daily_review','crisis_processing') NOT NULL,
	`prompt_id` varchar(255),
	`prompt_text` text,
	`mood_before` int,
	`mood_after` int,
	`primary_emotion` enum('joy','gratitude','peace','excitement','hope','sadness','anxiety','anger','frustration','fear','shame','guilt','neutral'),
	`emotion_intensity` int,
	`secondary_emotions` text,
	`themes` text,
	`cognitive_distortions` text,
	`ai_insights` text,
	`word_count` int,
	`writing_duration_minutes` int,
	`privacy` enum('private','shared_with_coach','shared_with_community') DEFAULT 'private',
	`is_favorite` boolean DEFAULT false,
	`tags` text,
	`related_goal_id` varchar(255),
	`related_event_id` varchar(255),
	`entry_date` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_insights` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`insight_type` enum('emotional_trend','growth_detected','pattern_identified','cognitive_distortion','strength_recognized','value_clarified','goal_alignment') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`supporting_entries` text,
	`actionable` boolean DEFAULT false,
	`suggested_action` text,
	`viewed` boolean DEFAULT false,
	`viewed_at` timestamp,
	`helpful` boolean,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `journal_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`total_entries` int DEFAULT 0,
	`current_streak` int DEFAULT 0,
	`longest_streak` int DEFAULT 0,
	`preferred_journal_type` enum('free_form','gratitude','reflective','expressive','goal_focused','mixed'),
	`preferred_time` enum('morning','afternoon','evening','night','flexible'),
	`default_privacy` enum('private','shared_with_coach','shared_with_community') DEFAULT 'private',
	`enable_ai_insights` boolean DEFAULT true,
	`enable_emotion_detection` boolean DEFAULT true,
	`enable_pattern_recognition` boolean DEFAULT true,
	`most_beneficial_prompts` text,
	`emotional_patterns` text,
	`growth_areas` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `journal_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_prompts` (
	`id` varchar(255) NOT NULL,
	`prompt_text` text NOT NULL,
	`description` text,
	`category` enum('gratitude','reflection','goal_setting','emotional_processing','relationships','career','health','personal_growth','creativity','spirituality','crisis_support') NOT NULL,
	`research_backed` boolean DEFAULT false,
	`research_source` text,
	`best_for` text,
	`difficulty` enum('beginner','intermediate','advanced'),
	`avg_helpfulness_rating` decimal(4,2),
	`total_uses` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `journal_prompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_reflections` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`period_type` enum('weekly','monthly','quarterly','yearly') NOT NULL,
	`period_start` timestamp NOT NULL,
	`period_end` timestamp NOT NULL,
	`overall_themes` text,
	`emotional_journey` text,
	`growth_areas` text,
	`challenge_areas` text,
	`surprises` text,
	`gratitudes` text,
	`intentions_forward` text,
	`reflection_date` timestamp DEFAULT (now()),
	CONSTRAINT `journal_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prompt_effectiveness` (
	`id` varchar(255) NOT NULL,
	`prompt_id` varchar(255) NOT NULL,
	`total_uses` int DEFAULT 0,
	`avg_word_count` decimal(8,2),
	`avg_writing_duration` decimal(6,2),
	`avg_mood_improvement` decimal(4,2),
	`avg_helpfulness_rating` decimal(4,2),
	`avg_insights_generated` decimal(4,2),
	`most_effective_for_emotions` text,
	`most_effective_for_situations` text,
	`user_count` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `prompt_effectiveness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_streaks` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`streak_length` int,
	`active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `writing_streaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chart_interactions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`widget_id` varchar(255),
	`interaction_type` enum('viewed','clicked','filtered','exported','shared','customized') NOT NULL,
	`view_duration` int,
	`action_taken` boolean DEFAULT false,
	`action_type` varchar(100),
	`interaction_timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `chart_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comparison_views` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`comparison_type` enum('week_over_week','month_over_month','quarter_over_quarter','year_over_year','best_vs_current','baseline_vs_current') NOT NULL,
	`metric` varchar(255) NOT NULL,
	`current_period_start` timestamp NOT NULL,
	`current_period_end` timestamp NOT NULL,
	`current_value` decimal(10,2),
	`comparison_period_start` timestamp NOT NULL,
	`comparison_period_end` timestamp NOT NULL,
	`comparison_value` decimal(10,2),
	`absolute_change` decimal(10,2),
	`percent_change` decimal(6,2),
	`interpretation` enum('improved','stable','declined'),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `comparison_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_reports` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`report_name` varchar(255) NOT NULL,
	`description` text,
	`report_type` enum('progress_summary','goal_review','wellness_assessment','habit_analysis','correlation_report','custom') NOT NULL,
	`metrics` text,
	`time_range` text,
	`visualizations` text,
	`scheduled` boolean DEFAULT false,
	`schedule_frequency` enum('daily','weekly','monthly'),
	`export_format` enum('pdf','csv','json'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `custom_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_configurations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`dashboard_name` varchar(255) NOT NULL,
	`description` text,
	`layout` text,
	`widgets` text,
	`is_default` boolean DEFAULT false,
	`is_public` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `dashboard_configurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heatmap_data` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`heatmap_type` enum('habit_consistency','mood_patterns','energy_patterns','stress_patterns','productivity_patterns') NOT NULL,
	`date` timestamp NOT NULL,
	`intensity` int,
	`day_of_week` int,
	`hour_of_day` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `heatmap_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestone_visualizations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`timeline_type` enum('goal_journey','transformation_journey','habit_mastery','wellness_journey') NOT NULL,
	`related_id` varchar(255),
	`milestones` text,
	`current_position` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `milestone_visualizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_celebrations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`celebration_type` enum('goal_achieved','milestone_reached','streak_milestone','level_up','achievement_unlocked','personal_best','transformation_marker') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`color` varchar(50),
	`animation` varchar(100),
	`related_id` varchar(255),
	`related_type` varchar(100),
	`displayed` boolean DEFAULT false,
	`displayed_at` timestamp,
	`celebration_date` timestamp DEFAULT (now()),
	CONSTRAINT `progress_celebrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_snapshots` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`snapshot_date` timestamp NOT NULL,
	`overall_score` int,
	`physical_score` int,
	`mental_score` int,
	`emotional_score` int,
	`spiritual_score` int,
	`habit_completion_rate` decimal(5,2),
	`active_habits` int,
	`goals_on_track` int,
	`goals_at_risk` int,
	`goals_achieved_this_period` int,
	`avg_sleep_duration` decimal(4,2),
	`avg_sleep_quality` decimal(4,2),
	`avg_stress_level` decimal(4,2),
	`avg_hrv` decimal(6,2),
	`avg_mood` decimal(4,2),
	`avg_energy` decimal(4,2),
	`days_active` int,
	`journal_entries` int,
	`achievements_unlocked` int,
	`experience_points` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `progress_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_generations` (
	`id` varchar(255) NOT NULL,
	`report_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`generated_at` timestamp DEFAULT (now()),
	`report_data` text,
	`file_path` varchar(500),
	`status` enum('generating','completed','failed') DEFAULT 'generating',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `report_generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trend_data` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`metric_name` varchar(255) NOT NULL,
	`metric_category` varchar(100),
	`period_type` enum('daily','weekly','monthly') NOT NULL,
	`period_start` timestamp NOT NULL,
	`period_end` timestamp NOT NULL,
	`value` decimal(10,2),
	`trend_direction` enum('up','down','stable'),
	`change_percent` decimal(6,2),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `trend_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualization_analytics` (
	`id` varchar(255) NOT NULL,
	`widget_type` varchar(100) NOT NULL,
	`avg_view_duration` decimal(6,2),
	`avg_views_per_user` decimal(6,2),
	`action_rate` decimal(5,2),
	`avg_behavior_change` decimal(5,2),
	`avg_helpfulness_rating` decimal(4,2),
	`optimal_time_range` varchar(100),
	`optimal_update_frequency` varchar(100),
	`most_effective_for` text,
	`user_count` int,
	`total_views` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `visualization_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualization_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`default_dashboard` enum('overview','wellness','goals','habits','trends','custom') DEFAULT 'overview',
	`preferred_chart_types` text,
	`default_time_range` enum('week','month','quarter','year','all_time') DEFAULT 'month',
	`show_comparisons` boolean DEFAULT true,
	`show_trendlines` boolean DEFAULT true,
	`show_goal_lines` boolean DEFAULT true,
	`most_viewed_charts` text,
	`most_actionable_charts` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `visualization_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualization_widgets` (
	`id` varchar(255) NOT NULL,
	`widget_name` varchar(255) NOT NULL,
	`description` text,
	`widget_type` enum('line_chart','bar_chart','area_chart','pie_chart','donut_chart','heatmap','calendar_view','progress_bar','radial_chart','timeline','scorecard','table','custom') NOT NULL,
	`data_source` varchar(255) NOT NULL,
	`data_query` text,
	`configuration` text,
	`refresh_interval` int,
	`total_uses` int DEFAULT 0,
	`avg_helpfulness_rating` decimal(4,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `visualization_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_coach_feedback` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`conversation_id` varchar(255),
	`message_id` varchar(255),
	`feedback_type` enum('helpful','not_helpful','too_pushy','too_passive','off_topic','insightful','generic','perfect') NOT NULL,
	`feedback_text` text,
	`rating` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_coach_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_coach_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`preferred_coaching_style` enum('motivational','socratic','solution_focused','cognitive_behavioral','directive','mixed'),
	`preferred_tone` enum('supportive','challenging','balanced') DEFAULT 'balanced',
	`verbosity` enum('concise','moderate','detailed') DEFAULT 'moderate',
	`proactive_checkins` boolean DEFAULT true,
	`daily_check_in` boolean DEFAULT false,
	`weekly_review` boolean DEFAULT true,
	`data_sharing` boolean DEFAULT true,
	`effective_question_types` text,
	`effective_intervention_types` text,
	`optimal_check_in_timing` text,
	`trust_level` int,
	`satisfaction_level` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_coach_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_recommendations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`recommendation_type` enum('habit_suggestion','goal_suggestion','intervention_suggestion','resource_suggestion','adjustment_suggestion','timing_suggestion','connection_suggestion') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reasoning` text,
	`supporting_data` text,
	`confidence` decimal(5,2),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`status` enum('pending','accepted','declined','deferred') DEFAULT 'pending',
	`user_feedback` text,
	`helpfulness_rating` int,
	`implemented` boolean DEFAULT false,
	`implemented_at` timestamp,
	`outcome_positive` boolean,
	`created_at` timestamp DEFAULT (now()),
	`responded_at` timestamp,
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_conversations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`conversation_title` varchar(255),
	`conversation_type` enum('check_in','goal_setting','obstacle_solving','reflection','crisis_support','celebration','exploration','accountability') NOT NULL,
	`status` enum('active','paused','completed') DEFAULT 'active',
	`insights_generated` int DEFAULT 0,
	`actions_identified` int DEFAULT 0,
	`helpfulness_rating` int,
	`started_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_effectiveness` (
	`id` varchar(255) NOT NULL,
	`element_type` varchar(100) NOT NULL,
	`element_value` varchar(255) NOT NULL,
	`avg_engagement_rate` decimal(5,2),
	`avg_insight_rate` decimal(5,2),
	`avg_action_rate` decimal(5,2),
	`avg_helpfulness_rating` decimal(4,2),
	`avg_behavior_change` decimal(5,2),
	`optimal_context` text,
	`optimal_user_type` text,
	`user_count` int,
	`total_uses` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_effectiveness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_goals` (
	`id` varchar(255) NOT NULL,
	`conversation_id` varchar(255),
	`goal_id` varchar(255),
	`user_id` varchar(255) NOT NULL,
	`initial_clarity` int,
	`final_clarity` int,
	`ai_contribution` text,
	`obstacles_identified` text,
	`strategies_developed` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_insights` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`insight_type` enum('pattern_recognition','strength_identification','blind_spot','opportunity','risk_alert','progress_highlight','connection','discrepancy') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`evidence` text,
	`actionable` boolean DEFAULT false,
	`suggested_action` text,
	`viewed` boolean DEFAULT false,
	`viewed_at` timestamp,
	`resonated` boolean,
	`action_taken` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_questions` (
	`id` varchar(255) NOT NULL,
	`question_text` text NOT NULL,
	`question_type` enum('open_ended','scaling','miracle','exception','coping','values','strengths','future_focused','clarifying','challenging') NOT NULL,
	`category` varchar(100),
	`best_for` text,
	`research_backed` boolean DEFAULT false,
	`research_source` text,
	`avg_insight_rate` decimal(5,2),
	`avg_action_rate` decimal(5,2),
	`avg_helpfulness_rating` decimal(4,2),
	`total_uses` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_resources` (
	`id` varchar(255) NOT NULL,
	`resource_name` varchar(255) NOT NULL,
	`description` text,
	`resource_type` enum('article','video','exercise','worksheet','book','podcast','course','tool') NOT NULL,
	`url` varchar(500),
	`category` varchar(100),
	`research_backed` boolean DEFAULT false,
	`recommend_for` text,
	`avg_helpfulness_rating` decimal(4,2),
	`total_recommendations` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `coaching_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` varchar(255) NOT NULL,
	`conversation_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`sender` enum('user','ai_coach') NOT NULL,
	`message_text` text NOT NULL,
	`message_type` enum('question','reflection','insight','suggestion','encouragement','challenge','information','summary'),
	`coaching_technique` enum('open_question','scaling_question','miracle_question','exception_finding','reframing','socratic_questioning','motivational_interviewing','cognitive_restructuring','strengths_identification'),
	`context_data` text,
	`user_engaged` boolean,
	`user_insight` boolean,
	`user_action` boolean,
	`sent_at` timestamp DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proactive_check_ins` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`check_in_type` enum('daily_check_in','weekly_review','goal_progress','habit_check','wellness_check','obstacle_check','celebration','motivation_boost') NOT NULL,
	`trigger_type` enum('scheduled','pattern_detected','goal_milestone','streak_at_risk','low_engagement','stress_spike','achievement') NOT NULL,
	`message` text,
	`responded` boolean DEFAULT false,
	`responded_at` timestamp,
	`response_quality` enum('brief','engaged','insightful'),
	`helpful` boolean,
	`sent_at` timestamp DEFAULT (now()),
	CONSTRAINT `proactive_check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_resource_interactions` (
	`id` varchar(255) NOT NULL,
	`resource_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`viewed` boolean DEFAULT false,
	`viewed_at` timestamp,
	`completed` boolean DEFAULT false,
	`completed_at` timestamp,
	`helpful` boolean,
	`helpfulness_rating` int,
	`action_taken` boolean DEFAULT false,
	`impact_description` text,
	`recommended_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_resource_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_rate_limits` (
	`id` varchar(255) NOT NULL,
	`user_integration_id` varchar(255) NOT NULL,
	`requests_per_hour` int,
	`requests_per_day` int,
	`requests_this_hour` int DEFAULT 0,
	`requests_today` int DEFAULT 0,
	`hour_reset_at` timestamp,
	`day_reset_at` timestamp,
	`throttled` boolean DEFAULT false,
	`throttled_until` timestamp,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `api_rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `available_integrations` (
	`id` varchar(255) NOT NULL,
	`integration_name` varchar(255) NOT NULL,
	`description` text,
	`provider` varchar(255) NOT NULL,
	`category` enum('wearable','sleep_tracking','fitness','meditation','productivity','health','nutrition','mental_health','finance','communication','other') NOT NULL,
	`auth_type` enum('oauth2','api_key','webhook','manual') NOT NULL,
	`capabilities` text,
	`data_types_supported` text,
	`supports_realtime` boolean DEFAULT false,
	`supports_bidirectional` boolean DEFAULT false,
	`api_endpoint` varchar(500),
	`api_documentation` varchar(500),
	`rate_limit_per_hour` int,
	`active` boolean DEFAULT true,
	`beta` boolean DEFAULT false,
	`total_users` int DEFAULT 0,
	`avg_satisfaction_rating` decimal(4,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `available_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_mapping_rules` (
	`id` varchar(255) NOT NULL,
	`integration_id` varchar(255) NOT NULL,
	`source_field` varchar(255) NOT NULL,
	`source_data_type` varchar(100),
	`destination_table` varchar(255) NOT NULL,
	`destination_field` varchar(255) NOT NULL,
	`transformation_rule` text,
	`validation_rule` text,
	`required` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_mapping_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `export_requests` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`export_type` enum('full_data_export','module_export','date_range_export','custom_export') NOT NULL,
	`export_format` enum('json','csv','pdf','xlsx') NOT NULL,
	`filters` text,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`file_path` varchar(500),
	`file_size` int,
	`download_url` varchar(500),
	`expires_at` timestamp,
	`error_message` text,
	`requested_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `export_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exported_data` (
	`id` varchar(255) NOT NULL,
	`user_integration_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`data_type` varchar(100) NOT NULL,
	`source_id` varchar(255) NOT NULL,
	`source_type` varchar(100) NOT NULL,
	`data_payload` text,
	`destination_id` varchar(255),
	`status` enum('pending','sent','confirmed','failed') DEFAULT 'pending',
	`error_message` text,
	`exported_at` timestamp DEFAULT (now()),
	`confirmed_at` timestamp,
	CONSTRAINT `exported_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imported_data` (
	`id` varchar(255) NOT NULL,
	`user_integration_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`data_type` enum('sleep','hrv','heart_rate','activity','steps','calories','workout','nutrition','weight','mood','meditation','task','calendar_event','transaction','other') NOT NULL,
	`source_id` varchar(255),
	`data_payload` text,
	`data_timestamp` timestamp NOT NULL,
	`mapped_to_id` varchar(255),
	`mapped_to_type` varchar(100),
	`data_quality` enum('high','medium','low'),
	`validation_errors` text,
	`imported_at` timestamp DEFAULT (now()),
	CONSTRAINT `imported_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_analytics` (
	`id` varchar(255) NOT NULL,
	`integration_id` varchar(255) NOT NULL,
	`total_users` int DEFAULT 0,
	`active_users` int DEFAULT 0,
	`avg_syncs_per_day` decimal(6,2),
	`avg_records_per_sync` decimal(8,2),
	`success_rate` decimal(5,2),
	`avg_data_quality` decimal(4,2),
	`avg_satisfaction_rating` decimal(4,2),
	`avg_behavior_impact` decimal(5,2),
	`optimal_sync_frequency` varchar(100),
	`common_errors` text,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `integration_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`auto_sync_enabled` boolean DEFAULT true,
	`sync_frequency` enum('realtime','hourly','daily','manual') DEFAULT 'daily',
	`data_sharing` enum('minimal','standard','full') DEFAULT 'standard',
	`total_integrations` int DEFAULT 0,
	`active_integrations` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `integration_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_recommendations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`integration_id` varchar(255) NOT NULL,
	`reason` text,
	`potential_value` text,
	`confidence` decimal(5,2),
	`status` enum('pending','accepted','declined','deferred') DEFAULT 'pending',
	`user_feedback` text,
	`created_at` timestamp DEFAULT (now()),
	`responded_at` timestamp,
	CONSTRAINT `integration_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` varchar(255) NOT NULL,
	`user_integration_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`sync_type` enum('import','export','bidirectional') NOT NULL,
	`status` enum('started','in_progress','completed','failed') DEFAULT 'started',
	`records_processed` int DEFAULT 0,
	`records_successful` int DEFAULT 0,
	`records_failed` int DEFAULT 0,
	`started_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	`duration_seconds` int,
	`error_message` text,
	`error_details` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_integrations` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`integration_id` varchar(255) NOT NULL,
	`status` enum('connected','disconnected','error','pending_auth','expired') DEFAULT 'pending_auth',
	`access_token` varchar(500),
	`refresh_token` varchar(500),
	`token_expires_at` timestamp,
	`api_key` varchar(500),
	`sync_enabled` boolean DEFAULT true,
	`sync_frequency` enum('realtime','hourly','daily','manual') DEFAULT 'daily',
	`last_sync_at` timestamp,
	`next_sync_at` timestamp,
	`data_types_to_sync` text,
	`total_syncs` int DEFAULT 0,
	`total_records_imported` int DEFAULT 0,
	`total_records_exported` int DEFAULT 0,
	`last_error` text,
	`error_count` int DEFAULT 0,
	`satisfaction_rating` int,
	`connected_at` timestamp DEFAULT (now()),
	`disconnected_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` varchar(255) NOT NULL,
	`webhook_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`event_payload` text,
	`processed` boolean DEFAULT false,
	`processed_at` timestamp,
	`processing_error` text,
	`received_at` timestamp DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(255) NOT NULL,
	`user_integration_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`webhook_url` varchar(500) NOT NULL,
	`webhook_secret` varchar(255),
	`event_types` text,
	`active` boolean DEFAULT true,
	`total_received` int DEFAULT 0,
	`last_received_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_queue` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`notification_id` varchar(255),
	`to_email` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`body_html` text,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('pending','sending','sent','failed') DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`opened` boolean DEFAULT false,
	`opened_at` timestamp,
	`clicked` boolean DEFAULT false,
	`clicked_at` timestamp,
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_analytics` (
	`id` varchar(255) NOT NULL,
	`notification_type` varchar(100) NOT NULL,
	`avg_view_rate` decimal(5,2),
	`avg_click_rate` decimal(5,2),
	`avg_action_rate` decimal(5,2),
	`avg_dismiss_rate` decimal(5,2),
	`optimal_time_of_day` varchar(100),
	`optimal_day_of_week` varchar(100),
	`best_channel` varchar(100),
	`channel_performance` text,
	`avg_behavior_change` decimal(5,2),
	`fatigue_threshold` int,
	`user_count` int,
	`total_sent` int,
	`last_calculated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_batches` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`batch_type` enum('daily_digest','weekly_digest','smart_batch') NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text,
	`notification_count` int DEFAULT 0,
	`scheduled_for` timestamp,
	`sent_at` timestamp,
	`status` enum('pending','sent','failed') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`notification_type` enum('habit_reminder','goal_reminder','task_reminder','encouragement','celebration','insight','alert','social','system') NOT NULL,
	`enabled` boolean DEFAULT true,
	`email_enabled` boolean DEFAULT true,
	`push_enabled` boolean DEFAULT true,
	`sms_enabled` boolean DEFAULT false,
	`in_app_enabled` boolean DEFAULT true,
	`frequency` enum('realtime','daily_digest','weekly_digest','never') DEFAULT 'realtime',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`notifications_enabled` boolean DEFAULT true,
	`quiet_hours_enabled` boolean DEFAULT true,
	`quiet_hours_start` varchar(10),
	`quiet_hours_end` varchar(10),
	`email_enabled` boolean DEFAULT true,
	`push_enabled` boolean DEFAULT true,
	`sms_enabled` boolean DEFAULT false,
	`in_app_enabled` boolean DEFAULT true,
	`batching_enabled` boolean DEFAULT true,
	`batching_window` int DEFAULT 60,
	`max_notifications_per_day` int DEFAULT 10,
	`optimal_times` text,
	`effective_channels` text,
	`notification_fatigue_risk` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`notification_type` enum('habit_reminder','goal_reminder','task_reminder','encouragement','celebration','insight','alert','social','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text,
	`action_url` varchar(500),
	`action_text` varchar(100),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`channels` text,
	`scheduled_for` timestamp,
	`status` enum('pending','scheduled','sent','delivered','failed','cancelled') DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`viewed` boolean DEFAULT false,
	`viewed_at` timestamp,
	`clicked` boolean DEFAULT false,
	`clicked_at` timestamp,
	`dismissed` boolean DEFAULT false,
	`dismissed_at` timestamp,
	`action_taken` boolean DEFAULT false,
	`related_id` varchar(255),
	`related_type` varchar(100),
	`batch_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_tokens` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`token` varchar(500) NOT NULL,
	`platform` enum('ios','android','web') NOT NULL,
	`device_id` varchar(255),
	`device_name` varchar(255),
	`active` boolean DEFAULT true,
	`last_used_at` timestamp,
	`registered_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `push_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminder_occurrences` (
	`id` varchar(255) NOT NULL,
	`reminder_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`scheduled_for` timestamp NOT NULL,
	`status` enum('pending','sent','completed','snoozed','missed','cancelled') DEFAULT 'pending',
	`snoozed_until` timestamp,
	`snooze_count` int DEFAULT 0,
	`completed_at` timestamp,
	`notification_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `reminder_occurrences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` varchar(255) NOT NULL,
	`profile_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reminder_type` enum('habit','goal','task','medication','appointment','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`related_id` varchar(255),
	`related_type` varchar(100),
	`schedule_type` enum('once','daily','weekly','monthly','custom') NOT NULL,
	`reminder_time` varchar(10),
	`days_of_week` text,
	`day_of_month` int,
	`custom_recurrence` text,
	`lead_time_minutes` int,
	`snooze_enabled` boolean DEFAULT true,
	`snooze_duration_minutes` int DEFAULT 10,
	`active` boolean DEFAULT true,
	`next_occurrence` timestamp,
	`total_sent` int DEFAULT 0,
	`total_completed` int DEFAULT 0,
	`total_snoozed` int DEFAULT 0,
	`completion_rate` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_queue` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`notification_id` varchar(255),
	`to_phone` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','sending','sent','failed') DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sms_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_notification_feedback` (
	`id` varchar(255) NOT NULL,
	`notification_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`feedback_type` enum('helpful','not_helpful','too_frequent','wrong_time','irrelevant','perfect') NOT NULL,
	`feedback_text` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_notification_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accessibility_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`screen_reader_enabled` boolean DEFAULT false,
	`high_contrast` boolean DEFAULT false,
	`large_text` boolean DEFAULT false,
	`color_blind_mode` enum('none','protanopia','deuteranopia','tritanopia') DEFAULT 'none',
	`reduce_motion` boolean DEFAULT false,
	`keyboard_navigation` boolean DEFAULT false,
	`sticky_keys` boolean DEFAULT false,
	`simplified_interface` boolean DEFAULT false,
	`reduced_distractions` boolean DEFAULT false,
	`closed_captions` boolean DEFAULT false,
	`audio_descriptions` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `accessibility_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `accessibility_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `account_deletion_requests` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`reason` text,
	`feedback` text,
	`status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
	`scheduled_for` timestamp,
	`completed_at` timestamp,
	`requested_at` timestamp DEFAULT (now()),
	CONSTRAINT `account_deletion_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_settings` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`ai_coach_enabled` boolean DEFAULT true,
	`ai_insights_enabled` boolean DEFAULT true,
	`ai_recommendations_enabled` boolean DEFAULT true,
	`ai_predictions_enabled` boolean DEFAULT true,
	`auto_habit_tracking` boolean DEFAULT false,
	`auto_goal_suggestions` boolean DEFAULT true,
	`auto_progress_reports` boolean DEFAULT true,
	`proactive_check_ins` boolean DEFAULT true,
	`proactive_interventions` boolean DEFAULT true,
	`ai_tone` enum('supportive','challenging','balanced') DEFAULT 'balanced',
	`ai_verbosity` enum('concise','moderate','detailed') DEFAULT 'moderate',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `appearance_settings` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`theme` enum('light','dark','auto') DEFAULT 'auto',
	`accent_color` varchar(50) DEFAULT '#3B82F6',
	`sidebar_position` enum('left','right') DEFAULT 'left',
	`compact_mode` boolean DEFAULT false,
	`font_size` enum('small','medium','large','extra_large') DEFAULT 'medium',
	`font_family` varchar(100) DEFAULT 'system',
	`high_contrast` boolean DEFAULT false,
	`reduce_motion` boolean DEFAULT false,
	`screen_reader_optimized` boolean DEFAULT false,
	`default_dashboard` varchar(100) DEFAULT 'overview',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `appearance_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appearance_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `beta_features` (
	`id` varchar(255) NOT NULL,
	`feature_name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('development','beta','stable','deprecated') DEFAULT 'development',
	`available_to_all` boolean DEFAULT false,
	`requires_opt_in` boolean DEFAULT true,
	`total_opt_ins` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `beta_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_users` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`blocked_user_id` varchar(255) NOT NULL,
	`reason` text,
	`blocked_at` timestamp DEFAULT (now()),
	CONSTRAINT `blocked_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`consent_type` enum('terms_of_service','privacy_policy','data_processing','marketing_emails','research_participation','ai_features') NOT NULL,
	`consented` boolean NOT NULL,
	`policy_version` varchar(50),
	`ip_address` varchar(50),
	`user_agent` text,
	`consented_at` timestamp DEFAULT (now()),
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_settings` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`auto_backup_enabled` boolean DEFAULT true,
	`backup_frequency` enum('daily','weekly','monthly') DEFAULT 'weekly',
	`last_backup_at` timestamp,
	`data_retention_period` enum('30_days','90_days','1_year','forever') DEFAULT 'forever',
	`export_format` enum('json','csv','pdf') DEFAULT 'json',
	`storage_used` int DEFAULT 0,
	`storage_limit` int DEFAULT 1073741824,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `module_preferences` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`module_name` varchar(100) NOT NULL,
	`enabled` boolean DEFAULT true,
	`show_in_dashboard` boolean DEFAULT true,
	`dashboard_order` int,
	`module_settings` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `module_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacy_settings` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`profile_visibility` enum('private','friends','public') DEFAULT 'private',
	`share_data_for_research` boolean DEFAULT false,
	`share_data_for_ai` boolean DEFAULT true,
	`share_progress_with_community` boolean DEFAULT false,
	`show_activity_feed` boolean DEFAULT false,
	`show_goals` boolean DEFAULT false,
	`show_achievements` boolean DEFAULT true,
	`show_stats` boolean DEFAULT false,
	`allow_friend_requests` boolean DEFAULT true,
	`allow_messages` boolean DEFAULT true,
	`searchable` boolean DEFAULT false,
	`allow_analytics_cookies` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `privacy_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `privacy_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `session_preferences` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_id` varchar(255) NOT NULL,
	`preferences` text,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `session_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings_change_log` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`setting_category` varchar(100) NOT NULL,
	`setting_name` varchar(100) NOT NULL,
	`old_value` text,
	`new_value` text,
	`changed_by` varchar(100),
	`ip_address` varchar(50),
	`changed_at` timestamp DEFAULT (now()),
	CONSTRAINT `settings_change_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_beta_opt_ins` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`beta_feature_id` varchar(255) NOT NULL,
	`feedback` text,
	`rating` int,
	`opted_in_at` timestamp DEFAULT (now()),
	`opted_out_at` timestamp,
	CONSTRAINT `user_beta_opt_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_feature_flags` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`feature_name` varchar(100) NOT NULL,
	`enabled` boolean DEFAULT false,
	`enabled_at` timestamp,
	`enabled_by` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_feature_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`display_name` varchar(255),
	`bio` text,
	`avatar_url` varchar(500),
	`email` varchar(255),
	`phone_number` varchar(50),
	`timezone` varchar(100) DEFAULT 'UTC',
	`country` varchar(100),
	`language` varchar(10) DEFAULT 'en',
	`measurement_system` enum('metric','imperial') DEFAULT 'metric',
	`temperature_unit` enum('celsius','fahrenheit') DEFAULT 'celsius',
	`date_format` varchar(50) DEFAULT 'YYYY-MM-DD',
	`time_format` enum('12h','24h') DEFAULT '24h',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `active_sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`session_token` varchar(500) NOT NULL,
	`device_id` varchar(255),
	`device_name` varchar(255),
	`device_type` enum('desktop','mobile','tablet','other'),
	`ip_address` varchar(50),
	`country` varchar(100),
	`city` varchar(100),
	`user_agent` text,
	`browser` varchar(100),
	`os` varchar(100),
	`active` boolean DEFAULT true,
	`last_activity_at` timestamp DEFAULT (now()),
	`expires_at` timestamp,
	`mfa_verified` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`terminated_at` timestamp,
	CONSTRAINT `active_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `active_sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`key_name` varchar(255) NOT NULL,
	`key_hash` varchar(500) NOT NULL,
	`key_prefix` varchar(20),
	`permissions` text,
	`ip_whitelist` text,
	`rate_limit` int,
	`active` boolean DEFAULT true,
	`last_used_at` timestamp,
	`total_requests` int DEFAULT 0,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`revoked_at` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_request_logs` (
	`id` varchar(255) NOT NULL,
	`api_key_id` varchar(255),
	`user_id` varchar(255),
	`method` varchar(10) NOT NULL,
	`endpoint` varchar(500) NOT NULL,
	`status_code` int NOT NULL,
	`response_time` int,
	`ip_address` varchar(50),
	`user_agent` text,
	`error_message` text,
	`request_timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `api_request_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`event_type` varchar(100) NOT NULL,
	`event_category` enum('authentication','authorization','data_access','data_modification','settings_change','security_event','system_event','compliance_event') NOT NULL,
	`action` varchar(255) NOT NULL,
	`resource` varchar(255),
	`resource_id` varchar(255),
	`details` text,
	`success` boolean NOT NULL,
	`error_message` text,
	`ip_address` varchar(50),
	`user_agent` text,
	`session_id` varchar(255),
	`severity` enum('info','warning','error','critical') DEFAULT 'info',
	`event_timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_reports` (
	`id` varchar(255) NOT NULL,
	`report_type` enum('gdpr','hipaa','soc2','iso27001','custom') NOT NULL,
	`report_period_start` timestamp NOT NULL,
	`report_period_end` timestamp NOT NULL,
	`status` enum('generating','completed','failed') DEFAULT 'generating',
	`findings` text,
	`file_path` varchar(500),
	`generated_by` varchar(255),
	`generated_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `compliance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_access_logs` (
	`id` varchar(255) NOT NULL,
	`accessed_by` varchar(255) NOT NULL,
	`accessed_by_type` enum('user','admin','system','api') NOT NULL,
	`data_type` varchar(100) NOT NULL,
	`data_id` varchar(255),
	`data_owner_id` varchar(255),
	`access_method` varchar(100),
	`purpose` varchar(255),
	`ip_address` varchar(50),
	`accessed_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encryption_keys` (
	`id` varchar(255) NOT NULL,
	`key_id` varchar(255) NOT NULL,
	`key_type` enum('master','data','session') NOT NULL,
	`algorithm` varchar(100) NOT NULL,
	`active` boolean DEFAULT true,
	`rotation_schedule` enum('never','monthly','quarterly','yearly'),
	`last_rotated_at` timestamp,
	`next_rotation_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`retired_at` timestamp,
	CONSTRAINT `encryption_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `encryption_keys_key_id_unique` UNIQUE(`key_id`)
);
--> statement-breakpoint
CREATE TABLE `login_history` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`login_method` enum('password','oauth','magic_link','sso') NOT NULL,
	`success` boolean NOT NULL,
	`failure_reason` varchar(255),
	`ip_address` varchar(50),
	`country` varchar(100),
	`city` varchar(100),
	`user_agent` text,
	`mfa_required` boolean DEFAULT false,
	`mfa_completed` boolean DEFAULT false,
	`risk_score` int,
	`risk_factors` text,
	`login_at` timestamp DEFAULT (now()),
	CONSTRAINT `login_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`identifier_type` enum('user_id','ip_address','api_key') NOT NULL,
	`endpoint` varchar(500),
	`requests_per_minute` int,
	`requests_per_hour` int,
	`requests_per_day` int,
	`requests_this_minute` int DEFAULT 0,
	`requests_this_hour` int DEFAULT 0,
	`requests_today` int DEFAULT 0,
	`minute_reset_at` timestamp,
	`hour_reset_at` timestamp,
	`day_reset_at` timestamp,
	`throttled` boolean DEFAULT false,
	`throttled_until` timestamp,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_alerts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`alert_type` enum('new_login','new_device','password_changed','mfa_disabled','suspicious_activity','data_export','settings_changed') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`message` text,
	`action_required` boolean DEFAULT false,
	`action_url` varchar(500),
	`acknowledged` boolean DEFAULT false,
	`acknowledged_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `security_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_incidents` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`incident_type` enum('unauthorized_access','data_breach','account_takeover','brute_force_attack','suspicious_activity','malware_detected','dos_attack','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text,
	`detected_by` varchar(100),
	`detection_method` varchar(255),
	`status` enum('detected','investigating','contained','resolved','false_positive') DEFAULT 'detected',
	`response_actions` text,
	`impact_assessment` text,
	`affected_users` int,
	`data_compromised` boolean DEFAULT false,
	`resolved_by` varchar(255),
	`resolution_notes` text,
	`detected_at` timestamp DEFAULT (now()),
	`resolved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `security_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`mfa_enabled` boolean DEFAULT false,
	`mfa_method` enum('totp','sms','email','authenticator_app'),
	`mfa_secret` varchar(500),
	`mfa_backup_codes` text,
	`password_hash` varchar(500) NOT NULL,
	`password_salt` varchar(255),
	`password_last_changed` timestamp,
	`password_expires_at` timestamp,
	`require_password_change` boolean DEFAULT false,
	`security_questions` text,
	`account_locked` boolean DEFAULT false,
	`account_locked_until` timestamp,
	`account_locked_reason` text,
	`failed_login_attempts` int DEFAULT 0,
	`last_failed_login_at` timestamp,
	`suspicious_activity_detected` boolean DEFAULT false,
	`suspicious_activity_count` int DEFAULT 0,
	`ip_whitelist_enabled` boolean DEFAULT false,
	`ip_whitelist` text,
	`max_active_sessions` int DEFAULT 5,
	`session_timeout` int DEFAULT 3600,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `security_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `security_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trusted_devices` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`device_id` varchar(255) NOT NULL,
	`device_name` varchar(255),
	`device_type` enum('desktop','mobile','tablet'),
	`device_fingerprint` varchar(500),
	`trusted` boolean DEFAULT true,
	`last_seen_at` timestamp,
	`last_seen_ip` varchar(50),
	`trusted_at` timestamp DEFAULT (now()),
	`untrusted_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `trusted_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_actions` (
	`id` varchar(255) NOT NULL,
	`admin_user_id` varchar(255) NOT NULL,
	`action_type` varchar(100) NOT NULL,
	`action_category` enum('user_management','content_moderation','system_configuration','data_access','support','security') NOT NULL,
	`target_type` varchar(100),
	`target_id` varchar(255),
	`description` text,
	`changes` text,
	`ip_address` varchar(50),
	`action_timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `admin_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_notifications` (
	`id` varchar(255) NOT NULL,
	`notification_type` enum('new_ticket','urgent_ticket','security_alert','system_error','user_report','feature_request','bug_report') NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text,
	`action_url` varchar(500),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`read` boolean DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `admin_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`role` enum('super_admin','admin','moderator','support_agent','analyst','developer') NOT NULL,
	`permissions` text,
	`active` boolean DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `article_feedback` (
	`id` varchar(255) NOT NULL,
	`article_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`helpful` boolean NOT NULL,
	`feedback` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `article_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bug_reports` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`steps_to_reproduce` text,
	`expected_behavior` text,
	`actual_behavior` text,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`browser` varchar(100),
	`os` varchar(100),
	`device_type` varchar(100),
	`screenshots` text,
	`logs` text,
	`status` enum('new','confirmed','in_progress','fixed','cannot_reproduce','wont_fix') DEFAULT 'new',
	`assigned_to` varchar(255),
	`fixed_in` varchar(100),
	`fixed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `bug_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` varchar(255) NOT NULL,
	`flag_name` varchar(255) NOT NULL,
	`description` text,
	`enabled` boolean DEFAULT false,
	`rollout_percentage` int DEFAULT 0,
	`target_user_ids` text,
	`target_roles` text,
	`environments` text,
	`last_modified_by` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_flag_name_unique` UNIQUE(`flag_name`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base_articles` (
	`id` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`category` varchar(100),
	`tags` text,
	`slug` varchar(500) NOT NULL,
	`meta_description` text,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`author_id` varchar(255),
	`public` boolean DEFAULT true,
	`helpful_count` int DEFAULT 0,
	`not_helpful_count` int DEFAULT 0,
	`view_count` int DEFAULT 0,
	`published_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `knowledge_base_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_base_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `platform_metrics` (
	`id` varchar(255) NOT NULL,
	`metric_date` timestamp NOT NULL,
	`total_users` int,
	`active_users` int,
	`new_users` int,
	`churned_users` int,
	`avg_session_duration` decimal(10,2),
	`avg_daily_active_users` int,
	`avg_weekly_active_users` int,
	`avg_monthly_active_users` int,
	`total_goals` int,
	`total_habits` int,
	`total_journal_entries` int,
	`open_tickets` int,
	`avg_ticket_resolution_time` decimal(10,2),
	`avg_satisfaction_rating` decimal(4,2),
	`api_requests` int,
	`avg_response_time` decimal(8,2),
	`error_rate` decimal(5,2),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `platform_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`ticket_number` varchar(50) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`description` text,
	`category` enum('technical_issue','billing','feature_request','bug_report','account_issue','data_privacy','general_inquiry','other') NOT NULL,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`status` enum('new','open','in_progress','waiting_on_user','waiting_on_team','resolved','closed') DEFAULT 'new',
	`assigned_to` varchar(255),
	`assigned_at` timestamp,
	`resolved_by` varchar(255),
	`resolved_at` timestamp,
	`resolution_notes` text,
	`satisfaction_rating` int,
	`satisfaction_feedback` text,
	`first_response_at` timestamp,
	`first_response_sla` int,
	`resolution_sla` int,
	`sla_breached` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	`closed_at` timestamp,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_tickets_ticket_number_unique` UNIQUE(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `system_announcements` (
	`id` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`announcement_type` enum('maintenance','new_feature','update','alert','info') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`target_audience` enum('all_users','specific_users','admins') DEFAULT 'all_users',
	`target_user_ids` text,
	`display_location` text,
	`dismissible` boolean DEFAULT true,
	`start_date` timestamp,
	`end_date` timestamp,
	`active` boolean DEFAULT true,
	`created_by` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` varchar(255) NOT NULL,
	`ticket_id` varchar(255) NOT NULL,
	`sender_id` varchar(255) NOT NULL,
	`sender_type` enum('user','admin','system') NOT NULL,
	`message` text NOT NULL,
	`attachments` text,
	`internal_note` boolean DEFAULT false,
	`sent_at` timestamp DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`feedback_type` enum('feature_request','bug_report','general_feedback','complaint','praise') NOT NULL,
	`title` varchar(500),
	`description` text NOT NULL,
	`page` varchar(255),
	`feature` varchar(255),
	`attachments` text,
	`status` enum('new','under_review','planned','in_progress','completed','declined') DEFAULT 'new',
	`upvotes` int DEFAULT 0,
	`admin_response` text,
	`responded_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_reports` (
	`id` varchar(255) NOT NULL,
	`reported_by` varchar(255) NOT NULL,
	`reported_type` enum('user','post','comment','message','other') NOT NULL,
	`reported_id` varchar(255) NOT NULL,
	`reason` enum('spam','harassment','inappropriate_content','misinformation','hate_speech','violence','other') NOT NULL,
	`description` text,
	`status` enum('pending','under_review','action_taken','dismissed') DEFAULT 'pending',
	`reviewed_by` varchar(255),
	`reviewed_at` timestamp,
	`review_notes` text,
	`action_taken` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_reports_id` PRIMARY KEY(`id`)
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
CREATE TABLE `aiChatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(255),
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
CREATE TABLE `authSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `authSessions_token_unique` UNIQUE(`token`)
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`name` text,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`passwordSalt` varchar(64),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
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
ALTER TABLE `autismDailyLogs` ADD CONSTRAINT `autismDailyLogs_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autismOutcomeTracking` ADD CONSTRAINT `autismOutcomeTracking_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autismProfiles` ADD CONSTRAINT `autismProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dietaryInterventions` ADD CONSTRAINT `dietaryInterventions_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interventionPlans` ADD CONSTRAINT `interventionPlans_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplementTracking` ADD CONSTRAINT `supplementTracking_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `therapySessions` ADD CONSTRAINT `therapySessions_profileId_autismProfiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `autismProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `adaptiveOutcomeTracking` ADD CONSTRAINT `adaptiveOutcomeTracking_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendationFeedback` ADD CONSTRAINT `recommendationFeedback_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyCheckins` ADD CONSTRAINT `dailyCheckins_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `disciplineEvents` ADD CONSTRAINT `disciplineEvents_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `habitCompletions` ADD CONSTRAINT `habitCompletions_habitId_habits_id_fk` FOREIGN KEY (`habitId`) REFERENCES `habits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `identityProfiles` ADD CONSTRAINT `identityProfiles_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `microHabits` ADD CONSTRAINT `microHabits_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiChatConversations` ADD CONSTRAINT `aiChatConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiChatConversations` ADD CONSTRAINT `aiChatConversations_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiChatMessages` ADD CONSTRAINT `aiChatMessages_conversationId_aiChatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `aiChatConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiInsights` ADD CONSTRAINT `aiInsights_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authSessions` ADD CONSTRAINT `authSessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE `sessionReminders` ADD CONSTRAINT `sessionReminders_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessionTypes` ADD CONSTRAINT `sessionTypes_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_coachId_coaches_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_sessionTypeId_sessionTypes_id_fk` FOREIGN KEY (`sessionTypeId`) REFERENCES `sessionTypes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `similarCases` ADD CONSTRAINT `similarCases_createdBy_coaches_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `coaches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;