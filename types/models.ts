import type { Tables } from '@/types/database';

export type Profile = Tables<'profiles'>;
export type Family = Tables<'families'>;
export type FamilyInvite = Tables<'family_invites'>;
export type Category = Tables<'categories'>;
export type Event = Tables<'events'>;
export type EventParticipant = Tables<'event_participants'>;
export type Task = Tables<'tasks'>;
export type Routine = Tables<'routines'>;
export type RoutineCompletion = Tables<'routine_completions'>;
export type List = Tables<'lists'>;
export type ListItem = Tables<'list_items'>;
export type FamilyPost = Tables<'family_posts'>;
export type PushToken = Tables<'push_tokens'>;

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly';

export type EventWithParticipants = Event & {
  responsible: Profile | null;
  participants: Profile[];
};

export type TaskWithRelations = Task & {
  assignee: Profile | null;
  category: Category | null;
};

export type RoutineWithStatus = Routine & {
  assignee: Profile | null;
  completedToday: boolean;
};

export type ListWithProgress = List & {
  totalItems: number;
  checkedItems: number;
};

export type PostWithAuthor = FamilyPost & {
  author: Profile | null;
};
