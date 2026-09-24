export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          created_at: string;
          family_id: string;
          id: string;
          name: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          family_id: string;
          id?: string;
          name: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      event_participants: {
        Row: {
          event_id: string;
          id: string;
          profile_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          profile_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participants_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participants_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          all_day: boolean;
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_at: string | null;
          family_id: string;
          id: string;
          location: string | null;
          recurrence_rule: string;
          reminder_minutes_before: number | null;
          responsible_id: string | null;
          start_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          all_day?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_at?: string | null;
          family_id: string;
          id?: string;
          location?: string | null;
          recurrence_rule?: string;
          reminder_minutes_before?: number | null;
          responsible_id?: string | null;
          start_at: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          all_day?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_at?: string | null;
          family_id?: string;
          id?: string;
          location?: string | null;
          recurrence_rule?: string;
          reminder_minutes_before?: number | null;
          responsible_id?: string | null;
          start_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_responsible_id_fkey';
            columns: ['responsible_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      families: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'families_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      family_invites: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          family_id: string;
          id: string;
          max_uses: number | null;
          uses_count: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          family_id: string;
          id?: string;
          max_uses?: number | null;
          uses_count?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          family_id?: string;
          id?: string;
          max_uses?: number | null;
          uses_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'family_invites_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'family_invites_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      family_posts: {
        Row: {
          author_id: string | null;
          content: string;
          created_at: string;
          family_id: string;
          id: string;
          is_important: boolean;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          created_at?: string;
          family_id: string;
          id?: string;
          is_important?: boolean;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          is_important?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'family_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'family_posts_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      list_items: {
        Row: {
          checked_at: string | null;
          checked_by: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          is_checked: boolean;
          list_id: string;
          name: string;
          position: number;
          quantity: string | null;
        };
        Insert: {
          checked_at?: string | null;
          checked_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_checked?: boolean;
          list_id: string;
          name: string;
          position?: number;
          quantity?: string | null;
        };
        Update: {
          checked_at?: string | null;
          checked_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_checked?: boolean;
          list_id?: string;
          name?: string;
          position?: number;
          quantity?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'list_items_checked_by_fkey';
            columns: ['checked_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_items_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_items_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      lists: {
        Row: {
          color: string;
          created_at: string;
          created_by: string | null;
          family_id: string;
          icon: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          created_by?: string | null;
          family_id: string;
          icon?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          created_by?: string | null;
          family_id?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lists_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lists_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          color: string;
          created_at: string;
          family_id: string | null;
          full_name: string;
          id: string;
          is_child: boolean;
          role: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          color?: string;
          created_at?: string;
          family_id?: string | null;
          full_name?: string;
          id?: string;
          is_child?: boolean;
          role?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          color?: string;
          created_at?: string;
          family_id?: string | null;
          full_name?: string;
          id?: string;
          is_child?: boolean;
          role?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      push_tokens: {
        Row: {
          created_at: string;
          device_type: string | null;
          expo_push_token: string;
          id: string;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          device_type?: string | null;
          expo_push_token: string;
          id?: string;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          device_type?: string | null;
          expo_push_token?: string;
          id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'push_tokens_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      routine_completions: {
        Row: {
          completed_at: string;
          completed_by: string | null;
          completion_date: string;
          id: string;
          routine_id: string;
        };
        Insert: {
          completed_at?: string;
          completed_by?: string | null;
          completion_date: string;
          id?: string;
          routine_id: string;
        };
        Update: {
          completed_at?: string;
          completed_by?: string | null;
          completion_date?: string;
          id?: string;
          routine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_completions_completed_by_fkey';
            columns: ['completed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'routine_completions_routine_id_fkey';
            columns: ['routine_id'];
            isOneToOne: false;
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
        ];
      };
      routines: {
        Row: {
          active: boolean;
          assignee_id: string | null;
          color: string;
          created_at: string;
          created_by: string | null;
          days_of_week: number[];
          family_id: string;
          icon: string | null;
          id: string;
          reminder_enabled: boolean;
          time_of_day: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          assignee_id?: string | null;
          color?: string;
          created_at?: string;
          created_by?: string | null;
          days_of_week?: number[];
          family_id: string;
          icon?: string | null;
          id?: string;
          reminder_enabled?: boolean;
          time_of_day?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          assignee_id?: string | null;
          color?: string;
          created_at?: string;
          created_by?: string | null;
          days_of_week?: number[];
          family_id?: string;
          icon?: string | null;
          id?: string;
          reminder_enabled?: boolean;
          time_of_day?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routines_assignee_id_fkey';
            columns: ['assignee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'routines_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'routines_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          assignee_id: string | null;
          category_id: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          due_time: string | null;
          family_id: string;
          id: string;
          recurrence_rule: string;
          reminder_minutes_before: number | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          category_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          family_id: string;
          id?: string;
          recurrence_rule?: string;
          reminder_minutes_before?: number | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          category_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          family_id?: string;
          id?: string;
          recurrence_rule?: string;
          reminder_minutes_before?: number | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assignee_id_fkey';
            columns: ['assignee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_child_profile: {
        Args: { p_avatar_url?: string; p_color?: string; p_full_name: string };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
      complete_routine: {
        Args: { p_date?: string; p_routine_id: string };
        Returns: Database['public']['Tables']['routine_completions']['Row'];
      };
      create_family: {
        Args: { p_name: string };
        Returns: Database['public']['Tables']['families']['Row'];
      };
      create_family_invite: {
        Args: { p_expires_hours?: number };
        Returns: Database['public']['Tables']['family_invites']['Row'];
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_family_member: { Args: { _family_id: string }; Returns: boolean };
      join_family_with_code: {
        Args: { p_code: string };
        Returns: Database['public']['Tables']['families']['Row'];
      };
      my_family_id: { Args: Record<string, never>; Returns: string };
      my_profile_id: { Args: Record<string, never>; Returns: string };
      same_family_profile: { Args: { _profile_id: string }; Returns: boolean };
      uncomplete_routine: {
        Args: { p_date?: string; p_routine_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
