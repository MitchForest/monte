import { z } from "zod";
import {
  StudentSchema,
  ClassroomSchema,
  ObservationSchema,
  ActionSchema,
  HabitSchema,
  UserSchema,
  OrganizationSchema,
  RoleSchema,
} from "./schemas";

// API Response wrapper schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
  });

// Student API responses
export const StudentsListResponseSchema = ApiSuccessSchema(
  z.object({
    students: z.array(StudentSchema),
  })
);

export const StudentDetailResponseSchema = ApiSuccessSchema(
  z.object({
    student: StudentSchema,
  })
);

// Classroom API responses
export const ClassroomGuideSummarySchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
});

export const ClassroomWithGuidesSchema = ClassroomSchema.extend({
  guides: z.array(ClassroomGuideSummarySchema),
});

export const ClassroomsListResponseSchema = z.object({
  classrooms: z.array(ClassroomWithGuidesSchema),
});

export const ClassroomDetailResponseSchema = ApiSuccessSchema(
  z.object({
    classroom: ClassroomSchema,
    guides: z.array(UserSchema),
    students: z.array(StudentSchema),
  })
);

// Observation API responses
export const ObservationsListResponseSchema = ApiSuccessSchema(
  z.object({
    observations: z.array(ObservationSchema),
  })
);

export const ObservationDetailResponseSchema = ApiSuccessSchema(
  z.object({
    observation: ObservationSchema,
  })
);

// Action/Task API responses
export const ActionsListResponseSchema = ApiSuccessSchema(
  z.object({
    actions: z.array(ActionSchema),
  })
);

export const ActionDetailResponseSchema = ApiSuccessSchema(
  z.object({
    action: ActionSchema,
  })
);

// Habit API responses
export const HabitsListResponseSchema = ApiSuccessSchema(
  z.object({
    habits: z.array(HabitSchema),
  })
);

export const HabitDetailResponseSchema = ApiSuccessSchema(
  z.object({
    habit: HabitSchema,
  })
);

// Auth API responses
export const LoginResponseSchema = z.object({
  user: UserSchema,
  session: z.object({
    token: z.string(),
    expires_at: z.string(),
  }),
  organization: OrganizationSchema,
});

export const CurrentUserResponseSchema = z.object({
  user: UserSchema,
  organization: OrganizationSchema,
  role: z.enum(["super_admin", "admin", "guide"]),
});

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: RoleSchema,
});

export const TeamListResponseSchema = z.object({
  members: z.array(TeamMemberSchema),
});

// Type exports
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type StudentsListResponse = z.infer<typeof StudentsListResponseSchema>;
export type StudentDetailResponse = z.infer<typeof StudentDetailResponseSchema>;
export type ClassroomsListResponse = z.infer<typeof ClassroomsListResponseSchema>;
export type ClassroomWithGuides = z.infer<typeof ClassroomWithGuidesSchema>;
export type ClassroomDetailResponse = z.infer<typeof ClassroomDetailResponseSchema>;
export type ObservationsListResponse = z.infer<typeof ObservationsListResponseSchema>;
export type ObservationDetailResponse = z.infer<typeof ObservationDetailResponseSchema>;
export type ActionsListResponse = z.infer<typeof ActionsListResponseSchema>;
export type ActionDetailResponse = z.infer<typeof ActionDetailResponseSchema>;
export type HabitsListResponse = z.infer<typeof HabitsListResponseSchema>;
export type HabitDetailResponse = z.infer<typeof HabitDetailResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;
