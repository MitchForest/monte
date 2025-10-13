export declare const curriculumUnits: {
    id: string;
    domainId: string;
    name: string;
    summary: string;
    ritRange: {
        min: number;
        max: number;
    };
    primaryCcss: string[];
    topicOrder: string[];
}[];
export declare const curriculumTopics: {
    id: string;
    unitId: string;
    name: string;
    description: string;
    ritRange: {
        min: number;
        max: number;
    };
    ccssFocus: string[];
    priority: number;
    prerequisiteTopicIds: string[];
}[];
export declare const curriculumDomains: {
    id: string;
    name: string;
    description: string;
    canonicalOrder: number;
    ccssClusters: string[];
    ritBands: {
        min: number;
        max: number;
    }[];
}[];
export declare const curriculumLessonPlans: {
    readonly kindergarten: {
        id: string;
        topicId: string;
        name: string;
        materialId: string;
        skills: string[];
        segments: {
            type: string;
            representation: string;
        }[];
        prerequisiteLessonIds: string[];
        notes: string;
    }[];
    readonly grade1: {
        id: string;
        topicId: string;
        name: string;
        materialId: string;
        skills: string[];
        segments: {
            type: string;
            representation: string;
        }[];
        prerequisiteLessonIds: string[];
        notes: string;
    }[];
    readonly grade2: {
        id: string;
        topicId: string;
        name: string;
        materialId: string;
        skills: string[];
        segments: {
            type: string;
            representation: string;
        }[];
        prerequisiteLessonIds: string[];
        notes: string;
    }[];
    readonly grade3: {
        id: string;
        topicId: string;
        name: string;
        materialId: string;
        skills: string[];
        segments: {
            type: string;
            representation: string;
        }[];
        prerequisiteLessonIds: string[];
        notes: string;
    }[];
};
export declare const curriculumFluencyPrograms: {
    readonly drills: {
        id: string;
        name: string;
        gradeBand: string;
        ritRange: {
            min: number;
            max: number;
        };
        focusSkills: string[];
        spiralSkills: string[];
        phases: {
            label: string;
            durationSeconds: number;
            itemMix: {
                skillIds: string[];
                difficultyWeights: {
                    easy: number;
                    medium: number;
                    hard: number;
                };
            };
        }[];
        triggerRules: {
            onSkillProficiency: string[];
            spacedInterval: {
                initialDays: number;
                growthFactor: number;
            };
            masteryFloor: number;
            priorityWeight: number;
        };
        successCriteria: {
            minItems: number;
            minAccuracy: number;
            maxMedianLatencySec: number;
        };
    }[];
    readonly questionSeeds: never[];
    readonly masteryQuizzes: ({
        id: string;
        name: string;
        type: string;
        gradeBand: string;
        ritRange: {
            min: number;
            max: number;
        };
        targetSkills: string[];
        itemBlueprint: {
            totalItems: number;
            mix: {
                category: string;
                count: number;
                skillIds: string[];
            }[];
        };
        triggerRules: {
            onTopicCompletion: string;
            requiredMasteryProbability: number;
            spacedInterval: {
                initialDays: number;
                growthFactor: number;
            };
            onUnitCompletion?: undefined;
            requiredTopicPasses?: undefined;
            cadenceDays?: undefined;
            priorityWeight?: undefined;
        };
        successCriteria: {
            minAccuracy: number;
            minConceptualCorrect: number;
            autoRemediation: {
                ifConceptualMiss: string[];
                ifMentalMiss: string[];
                ifApplicationMiss?: undefined;
            };
            minMentalCorrect?: undefined;
            maxMedianLatencySec?: undefined;
        };
    } | {
        id: string;
        name: string;
        type: string;
        gradeBand: string;
        ritRange: {
            min: number;
            max: number;
        };
        targetSkills: string[];
        itemBlueprint: {
            totalItems: number;
            mix: {
                category: string;
                count: number;
                skillIds: string[];
            }[];
        };
        triggerRules: {
            onTopicCompletion: string;
            requiredMasteryProbability: number;
            spacedInterval: {
                initialDays: number;
                growthFactor: number;
            };
            onUnitCompletion?: undefined;
            requiredTopicPasses?: undefined;
            cadenceDays?: undefined;
            priorityWeight?: undefined;
        };
        successCriteria: {
            minAccuracy: number;
            minMentalCorrect: number;
            autoRemediation: {
                ifMentalMiss: string[];
                ifApplicationMiss: string[];
                ifConceptualMiss?: undefined;
            };
            minConceptualCorrect?: undefined;
            maxMedianLatencySec?: undefined;
        };
    } | {
        id: string;
        name: string;
        type: string;
        gradeBand: string;
        ritRange: {
            min: number;
            max: number;
        };
        targetSkills: string[];
        itemBlueprint: {
            totalItems: number;
            mix: {
                category: string;
                count: number;
                skillIds: string[];
            }[];
        };
        triggerRules: {
            onUnitCompletion: string;
            requiredTopicPasses: string[];
            spacedInterval: {
                initialDays: number;
                growthFactor: number;
            };
            onTopicCompletion?: undefined;
            requiredMasteryProbability?: undefined;
            cadenceDays?: undefined;
            priorityWeight?: undefined;
        };
        successCriteria: {
            minAccuracy: number;
            minMentalCorrect: number;
            autoRemediation: {
                ifMentalMiss: string[];
                ifApplicationMiss: string[];
                ifConceptualMiss?: undefined;
            };
            minConceptualCorrect?: undefined;
            maxMedianLatencySec?: undefined;
        };
    } | {
        id: string;
        name: string;
        type: string;
        gradeBand: string;
        ritRange: {
            min: number;
            max: number;
        };
        targetSkills: string[];
        itemBlueprint: {
            totalItems: number;
            mix: {
                category: string;
                count: number;
                skillIds: string[];
            }[];
        };
        triggerRules: {
            cadenceDays: number;
            requiredMasteryProbability: number;
            spacedInterval: {
                initialDays: number;
                growthFactor: number;
            };
            priorityWeight: number;
            onTopicCompletion?: undefined;
            onUnitCompletion?: undefined;
            requiredTopicPasses?: undefined;
        };
        successCriteria: {
            minAccuracy: number;
            maxMedianLatencySec: number;
            autoRemediation: {
                ifMentalMiss: string[];
                ifApplicationMiss: string[];
                ifConceptualMiss?: undefined;
            };
            minConceptualCorrect?: undefined;
            minMentalCorrect?: undefined;
        };
    })[];
};
export declare const curriculumDomainGraphs: {
    readonly 'number-sense-place-value': {
        readonly skills: ({
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible: boolean;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible?: undefined;
        })[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
    readonly 'operations-algebraic-thinking': {
        readonly skills: ({
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible: boolean;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible?: undefined;
        })[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
    readonly 'fractions-rational-numbers': {
        readonly skills: ({
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            type?: undefined;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            type: string;
        })[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
    readonly 'geometry-spatial-reasoning': {
        readonly skills: {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
        }[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
    readonly 'measurement-data': {
        readonly skills: ({
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible?: undefined;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible: boolean;
        })[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
    readonly 'patterns-algebraic-thinking': {
        readonly skills: ({
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            type: string;
            mentalMathEligible?: undefined;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            mentalMathEligible: boolean;
            type?: undefined;
        } | {
            id: string;
            name: string;
            description: string;
            domainId: string;
            unitId: string;
            topicId: string;
            ccss: string[];
            ritBand: {
                min: number;
                max: number;
            };
            representations: string[];
            practice: {
                easy: string[];
                medium: string[];
                hard: string[];
            };
            type?: undefined;
            mentalMathEligible?: undefined;
        })[];
        readonly edges: {
            id: string;
            sourceSkillId: string;
            targetSkillId: string;
            type: string;
            rationale: string;
        }[];
    };
};
export type CurriculumUnit = (typeof curriculumUnits)[number];
export type CurriculumTopic = (typeof curriculumTopics)[number];
export type CurriculumDomain = (typeof curriculumDomains)[number];
export type LessonPlanGradeLevel = keyof typeof curriculumLessonPlans;
export type CurriculumLessonPlan = (typeof curriculumLessonPlans)[LessonPlanGradeLevel][number];
export type CurriculumDomainKey = keyof typeof curriculumDomainGraphs;
export type CurriculumDomainGraph = (typeof curriculumDomainGraphs)[CurriculumDomainKey];
export declare const curriculumContent: {
    readonly domains: {
        id: string;
        name: string;
        description: string;
        canonicalOrder: number;
        ccssClusters: string[];
        ritBands: {
            min: number;
            max: number;
        }[];
    }[];
    readonly domainGraphs: {
        readonly 'number-sense-place-value': {
            readonly skills: ({
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible: boolean;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible?: undefined;
            })[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
        readonly 'operations-algebraic-thinking': {
            readonly skills: ({
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible: boolean;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible?: undefined;
            })[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
        readonly 'fractions-rational-numbers': {
            readonly skills: ({
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                type?: undefined;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                type: string;
            })[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
        readonly 'geometry-spatial-reasoning': {
            readonly skills: {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
            }[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
        readonly 'measurement-data': {
            readonly skills: ({
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible?: undefined;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible: boolean;
            })[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
        readonly 'patterns-algebraic-thinking': {
            readonly skills: ({
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                type: string;
                mentalMathEligible?: undefined;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                mentalMathEligible: boolean;
                type?: undefined;
            } | {
                id: string;
                name: string;
                description: string;
                domainId: string;
                unitId: string;
                topicId: string;
                ccss: string[];
                ritBand: {
                    min: number;
                    max: number;
                };
                representations: string[];
                practice: {
                    easy: string[];
                    medium: string[];
                    hard: string[];
                };
                type?: undefined;
                mentalMathEligible?: undefined;
            })[];
            readonly edges: {
                id: string;
                sourceSkillId: string;
                targetSkillId: string;
                type: string;
                rationale: string;
            }[];
        };
    };
    readonly fluency: {
        readonly drills: {
            id: string;
            name: string;
            gradeBand: string;
            ritRange: {
                min: number;
                max: number;
            };
            focusSkills: string[];
            spiralSkills: string[];
            phases: {
                label: string;
                durationSeconds: number;
                itemMix: {
                    skillIds: string[];
                    difficultyWeights: {
                        easy: number;
                        medium: number;
                        hard: number;
                    };
                };
            }[];
            triggerRules: {
                onSkillProficiency: string[];
                spacedInterval: {
                    initialDays: number;
                    growthFactor: number;
                };
                masteryFloor: number;
                priorityWeight: number;
            };
            successCriteria: {
                minItems: number;
                minAccuracy: number;
                maxMedianLatencySec: number;
            };
        }[];
        readonly questionSeeds: never[];
        readonly masteryQuizzes: ({
            id: string;
            name: string;
            type: string;
            gradeBand: string;
            ritRange: {
                min: number;
                max: number;
            };
            targetSkills: string[];
            itemBlueprint: {
                totalItems: number;
                mix: {
                    category: string;
                    count: number;
                    skillIds: string[];
                }[];
            };
            triggerRules: {
                onTopicCompletion: string;
                requiredMasteryProbability: number;
                spacedInterval: {
                    initialDays: number;
                    growthFactor: number;
                };
                onUnitCompletion?: undefined;
                requiredTopicPasses?: undefined;
                cadenceDays?: undefined;
                priorityWeight?: undefined;
            };
            successCriteria: {
                minAccuracy: number;
                minConceptualCorrect: number;
                autoRemediation: {
                    ifConceptualMiss: string[];
                    ifMentalMiss: string[];
                    ifApplicationMiss?: undefined;
                };
                minMentalCorrect?: undefined;
                maxMedianLatencySec?: undefined;
            };
        } | {
            id: string;
            name: string;
            type: string;
            gradeBand: string;
            ritRange: {
                min: number;
                max: number;
            };
            targetSkills: string[];
            itemBlueprint: {
                totalItems: number;
                mix: {
                    category: string;
                    count: number;
                    skillIds: string[];
                }[];
            };
            triggerRules: {
                onTopicCompletion: string;
                requiredMasteryProbability: number;
                spacedInterval: {
                    initialDays: number;
                    growthFactor: number;
                };
                onUnitCompletion?: undefined;
                requiredTopicPasses?: undefined;
                cadenceDays?: undefined;
                priorityWeight?: undefined;
            };
            successCriteria: {
                minAccuracy: number;
                minMentalCorrect: number;
                autoRemediation: {
                    ifMentalMiss: string[];
                    ifApplicationMiss: string[];
                    ifConceptualMiss?: undefined;
                };
                minConceptualCorrect?: undefined;
                maxMedianLatencySec?: undefined;
            };
        } | {
            id: string;
            name: string;
            type: string;
            gradeBand: string;
            ritRange: {
                min: number;
                max: number;
            };
            targetSkills: string[];
            itemBlueprint: {
                totalItems: number;
                mix: {
                    category: string;
                    count: number;
                    skillIds: string[];
                }[];
            };
            triggerRules: {
                onUnitCompletion: string;
                requiredTopicPasses: string[];
                spacedInterval: {
                    initialDays: number;
                    growthFactor: number;
                };
                onTopicCompletion?: undefined;
                requiredMasteryProbability?: undefined;
                cadenceDays?: undefined;
                priorityWeight?: undefined;
            };
            successCriteria: {
                minAccuracy: number;
                minMentalCorrect: number;
                autoRemediation: {
                    ifMentalMiss: string[];
                    ifApplicationMiss: string[];
                    ifConceptualMiss?: undefined;
                };
                minConceptualCorrect?: undefined;
                maxMedianLatencySec?: undefined;
            };
        } | {
            id: string;
            name: string;
            type: string;
            gradeBand: string;
            ritRange: {
                min: number;
                max: number;
            };
            targetSkills: string[];
            itemBlueprint: {
                totalItems: number;
                mix: {
                    category: string;
                    count: number;
                    skillIds: string[];
                }[];
            };
            triggerRules: {
                cadenceDays: number;
                requiredMasteryProbability: number;
                spacedInterval: {
                    initialDays: number;
                    growthFactor: number;
                };
                priorityWeight: number;
                onTopicCompletion?: undefined;
                onUnitCompletion?: undefined;
                requiredTopicPasses?: undefined;
            };
            successCriteria: {
                minAccuracy: number;
                maxMedianLatencySec: number;
                autoRemediation: {
                    ifMentalMiss: string[];
                    ifApplicationMiss: string[];
                    ifConceptualMiss?: undefined;
                };
                minConceptualCorrect?: undefined;
                minMentalCorrect?: undefined;
            };
        })[];
    };
    readonly lessonPlans: {
        readonly kindergarten: {
            id: string;
            topicId: string;
            name: string;
            materialId: string;
            skills: string[];
            segments: {
                type: string;
                representation: string;
            }[];
            prerequisiteLessonIds: string[];
            notes: string;
        }[];
        readonly grade1: {
            id: string;
            topicId: string;
            name: string;
            materialId: string;
            skills: string[];
            segments: {
                type: string;
                representation: string;
            }[];
            prerequisiteLessonIds: string[];
            notes: string;
        }[];
        readonly grade2: {
            id: string;
            topicId: string;
            name: string;
            materialId: string;
            skills: string[];
            segments: {
                type: string;
                representation: string;
            }[];
            prerequisiteLessonIds: string[];
            notes: string;
        }[];
        readonly grade3: {
            id: string;
            topicId: string;
            name: string;
            materialId: string;
            skills: string[];
            segments: {
                type: string;
                representation: string;
            }[];
            prerequisiteLessonIds: string[];
            notes: string;
        }[];
    };
    readonly topics: {
        id: string;
        unitId: string;
        name: string;
        description: string;
        ritRange: {
            min: number;
            max: number;
        };
        ccssFocus: string[];
        priority: number;
        prerequisiteTopicIds: string[];
    }[];
    readonly units: {
        id: string;
        domainId: string;
        name: string;
        summary: string;
        ritRange: {
            min: number;
            max: number;
        };
        primaryCcss: string[];
        topicOrder: string[];
    }[];
};
export type CurriculumContent = typeof curriculumContent;
//# sourceMappingURL=content.d.ts.map