-- =====================================================================
-- Family App — schema inicial
-- Tabelas, índices, funções RPC e Row Level Security (RLS)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabelas principais
-- ---------------------------------------------------------------------

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- profiles = membros da família. Um profile com user_id representa um
-- adulto com login próprio; um profile com user_id nulo representa um
-- perfil "criança" gerenciado por um administrador da família.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  family_id uuid references public.families (id) on delete cascade,
  full_name text not null default 'Usuário',
  avatar_url text,
  color text not null default '#3B82F6',
  is_child boolean not null default false,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families
  add constraint families_created_by_fkey foreign key (created_by)
  references public.profiles (id) on delete set null;

create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  code text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  max_uses int,
  uses_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  color text not null default '#64748B',
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  recurrence_rule text not null default 'none' check (recurrence_rule in ('none', 'daily', 'weekly', 'monthly')),
  reminder_minutes_before int,
  responsible_id uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  unique (event_id, profile_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  due_date date,
  due_time time,
  recurrence_rule text not null default 'none' check (recurrence_rule in ('none', 'daily', 'weekly', 'monthly')),
  reminder_minutes_before int,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  icon text,
  color text not null default '#3B82F6',
  assignee_id uuid references public.profiles (id) on delete set null,
  time_of_day time,
  days_of_week int[] not null default '{0,1,2,3,4,5,6}',
  reminder_enabled boolean not null default true,
  active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  completed_by uuid references public.profiles (id) on delete set null,
  completion_date date not null,
  completed_at timestamptz not null default now(),
  unique (routine_id, completion_date)
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  icon text,
  color text not null default '#3B82F6',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  name text not null,
  quantity text,
  is_checked boolean not null default false,
  checked_by uuid references public.profiles (id) on delete set null,
  checked_at timestamptz,
  position int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.family_posts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  content text not null,
  is_important boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  device_type text,
  created_at timestamptz not null default now(),
  unique (profile_id, expo_push_token)
);

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------

create index idx_profiles_family_id on public.profiles (family_id);
create index idx_profiles_user_id on public.profiles (user_id);
create index idx_family_invites_family_id on public.family_invites (family_id);
create index idx_family_invites_code on public.family_invites (code);
create index idx_categories_family_id on public.categories (family_id);
create index idx_events_family_id_start_at on public.events (family_id, start_at);
create index idx_event_participants_event_id on public.event_participants (event_id);
create index idx_event_participants_profile_id on public.event_participants (profile_id);
create index idx_tasks_family_id_due_date on public.tasks (family_id, due_date);
create index idx_tasks_assignee_id on public.tasks (assignee_id);
create index idx_routines_family_id on public.routines (family_id);
create index idx_routine_completions_routine_id_date on public.routine_completions (routine_id, completion_date);
create index idx_lists_family_id on public.lists (family_id);
create index idx_list_items_list_id on public.list_items (list_id);
create index idx_family_posts_family_id on public.family_posts (family_id, created_at desc);
create index idx_push_tokens_profile_id on public.push_tokens (profile_id);

-- ---------------------------------------------------------------------
-- Funções auxiliares (security definer, evitam recursão de RLS)
-- ---------------------------------------------------------------------

create or replace function public.my_profile_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.my_family_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where user_id = auth.uid() limit 1), false);
$$;

create or replace function public.is_family_member(_family_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select _family_id is not null and _family_id = public.my_family_id();
$$;

create or replace function public.same_family_profile(_profile_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = _profile_id and p.family_id = public.my_family_id() and public.my_family_id() is not null
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger set_updated_at before update on public.events for each row execute function public.touch_updated_at();
create trigger set_updated_at before update on public.tasks for each row execute function public.touch_updated_at();
create trigger set_updated_at before update on public.routines for each row execute function public.touch_updated_at();
create trigger set_updated_at before update on public.lists for each row execute function public.touch_updated_at();
create trigger set_updated_at before update on public.family_posts for each row execute function public.touch_updated_at();

-- Cria automaticamente um profile ao cadastrar um novo usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    (array['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#0EA5E9'])[1 + (floor(random() * 6))::int]
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Semeia categorias padrão para uma família nova
create or replace function public.seed_default_categories()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.categories (family_id, name, color) values
    (new.id, 'Casa', '#0EA5E9'),
    (new.id, 'Escola', '#8B5CF6'),
    (new.id, 'Saúde', '#EF4444'),
    (new.id, 'Finanças', '#10B981'),
    (new.id, 'Outro', '#64748B');
  return new;
end;
$$;

create trigger on_family_created
  after insert on public.families
  for each row execute function public.seed_default_categories();

-- ---------------------------------------------------------------------
-- RPCs de família (fluxo de criação / convite / entrada)
-- ---------------------------------------------------------------------

create or replace function public.create_family(p_name text)
returns public.families
language plpgsql security definer set search_path = public as $$
declare
  v_family public.families;
  v_profile_id uuid;
  v_current_family uuid;
begin
  select id, family_id into v_profile_id, v_current_family from public.profiles where user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'Perfil não encontrado';
  end if;
  if v_current_family is not null then
    raise exception 'Você já pertence a uma família';
  end if;

  insert into public.families (name, created_by) values (p_name, v_profile_id) returning * into v_family;
  update public.profiles set family_id = v_family.id, role = 'admin' where id = v_profile_id;
  return v_family;
end;
$$;

create or replace function public.create_family_invite(p_expires_hours int default 168)
returns public.family_invites
language plpgsql security definer set search_path = public as $$
declare
  v_family_id uuid;
  v_invite public.family_invites;
  v_code text;
begin
  v_family_id := public.my_family_id();
  if v_family_id is null then
    raise exception 'Você precisa pertencer a uma família';
  end if;
  if not public.is_admin() then
    raise exception 'Apenas administradores podem gerar convites';
  end if;

  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  insert into public.family_invites (family_id, code, created_by, expires_at)
  values (v_family_id, v_code, public.my_profile_id(), now() + make_interval(hours => p_expires_hours))
  returning * into v_invite;
  return v_invite;
end;
$$;

create or replace function public.join_family_with_code(p_code text)
returns public.families
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.family_invites;
  v_family public.families;
  v_profile_id uuid;
  v_current_family uuid;
begin
  select id, family_id into v_profile_id, v_current_family from public.profiles where user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'Perfil não encontrado';
  end if;
  if v_current_family is not null then
    raise exception 'Você já pertence a uma família';
  end if;

  select * into v_invite from public.family_invites
    where code = upper(trim(p_code))
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses_count < max_uses)
  limit 1;

  if v_invite.id is null then
    raise exception 'Convite inválido ou expirado';
  end if;

  update public.profiles set family_id = v_invite.family_id, role = 'member' where id = v_profile_id;
  update public.family_invites set uses_count = uses_count + 1 where id = v_invite.id;
  select * into v_family from public.families where id = v_invite.family_id;
  return v_family;
end;
$$;

create or replace function public.add_child_profile(p_full_name text, p_color text default '#F97316', p_avatar_url text default null)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  v_family_id uuid;
  v_profile public.profiles;
begin
  v_family_id := public.my_family_id();
  if v_family_id is null or not public.is_admin() then
    raise exception 'Apenas administradores podem adicionar membros';
  end if;

  insert into public.profiles (family_id, full_name, color, avatar_url, is_child, role)
  values (v_family_id, p_full_name, p_color, p_avatar_url, true, 'member')
  returning * into v_profile;
  return v_profile;
end;
$$;

create or replace function public.complete_routine(p_routine_id uuid, p_date date default current_date)
returns public.routine_completions
language plpgsql security definer set search_path = public as $$
declare
  v_completion public.routine_completions;
begin
  if not exists (select 1 from public.routines r where r.id = p_routine_id and r.family_id = public.my_family_id()) then
    raise exception 'Rotina não encontrada';
  end if;

  insert into public.routine_completions (routine_id, completed_by, completion_date)
  values (p_routine_id, public.my_profile_id(), p_date)
  on conflict (routine_id, completion_date) do nothing
  returning * into v_completion;

  if v_completion.id is null then
    select * into v_completion from public.routine_completions where routine_id = p_routine_id and completion_date = p_date;
  end if;
  return v_completion;
end;
$$;

create or replace function public.uncomplete_routine(p_routine_id uuid, p_date date default current_date)
returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.routine_completions
  where routine_id = p_routine_id
    and completion_date = p_date
    and routine_id in (select id from public.routines where family_id = public.my_family_id());
end;
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.family_invites enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.tasks enable row level security;
alter table public.routines enable row level security;
alter table public.routine_completions enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.family_posts enable row level security;
alter table public.push_tokens enable row level security;

-- families
create policy "families_select_member" on public.families for select
  using (public.is_family_member(id));
create policy "families_update_admin" on public.families for update
  using (public.is_family_member(id) and public.is_admin())
  with check (public.is_family_member(id) and public.is_admin());
create policy "families_insert_authenticated" on public.families for insert
  with check (auth.uid() is not null);

-- profiles
create policy "profiles_select_self_or_family" on public.profiles for select
  using (user_id = auth.uid() or public.same_family_profile(id));
create policy "profiles_insert_self" on public.profiles for insert
  with check (user_id = auth.uid());
create policy "profiles_update_self_or_admin_child" on public.profiles for update
  using (user_id = auth.uid() or (public.is_admin() and family_id = public.my_family_id() and user_id is null))
  with check (user_id = auth.uid() or (public.is_admin() and family_id = public.my_family_id() and user_id is null));
create policy "profiles_delete_admin_child" on public.profiles for delete
  using (public.is_admin() and family_id = public.my_family_id() and user_id is null);

-- family_invites
create policy "invites_select_family" on public.family_invites for select
  using (public.is_family_member(family_id));
create policy "invites_insert_admin" on public.family_invites for insert
  with check (public.is_family_member(family_id) and public.is_admin());
create policy "invites_delete_admin" on public.family_invites for delete
  using (public.is_family_member(family_id) and public.is_admin());

-- categories
create policy "categories_select_family" on public.categories for select
  using (public.is_family_member(family_id));
create policy "categories_write_family" on public.categories for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- events
create policy "events_select_family" on public.events for select
  using (public.is_family_member(family_id));
create policy "events_write_family" on public.events for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- event_participants
create policy "event_participants_select_family" on public.event_participants for select
  using (exists (select 1 from public.events e where e.id = event_id and public.is_family_member(e.family_id)));
create policy "event_participants_write_family" on public.event_participants for all
  using (exists (select 1 from public.events e where e.id = event_id and public.is_family_member(e.family_id)))
  with check (exists (select 1 from public.events e where e.id = event_id and public.is_family_member(e.family_id)));

-- tasks
create policy "tasks_select_family" on public.tasks for select
  using (public.is_family_member(family_id));
create policy "tasks_write_family" on public.tasks for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- routines
create policy "routines_select_family" on public.routines for select
  using (public.is_family_member(family_id));
create policy "routines_write_family" on public.routines for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- routine_completions
create policy "routine_completions_select_family" on public.routine_completions for select
  using (exists (select 1 from public.routines r where r.id = routine_id and public.is_family_member(r.family_id)));
create policy "routine_completions_write_family" on public.routine_completions for all
  using (exists (select 1 from public.routines r where r.id = routine_id and public.is_family_member(r.family_id)))
  with check (exists (select 1 from public.routines r where r.id = routine_id and public.is_family_member(r.family_id)));

-- lists
create policy "lists_select_family" on public.lists for select
  using (public.is_family_member(family_id));
create policy "lists_write_family" on public.lists for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- list_items
create policy "list_items_select_family" on public.list_items for select
  using (exists (select 1 from public.lists l where l.id = list_id and public.is_family_member(l.family_id)));
create policy "list_items_write_family" on public.list_items for all
  using (exists (select 1 from public.lists l where l.id = list_id and public.is_family_member(l.family_id)))
  with check (exists (select 1 from public.lists l where l.id = list_id and public.is_family_member(l.family_id)));

-- family_posts
create policy "posts_select_family" on public.family_posts for select
  using (public.is_family_member(family_id));
create policy "posts_insert_family" on public.family_posts for insert
  with check (public.is_family_member(family_id));
create policy "posts_update_author_or_admin" on public.family_posts for update
  using (public.is_family_member(family_id) and (author_id = public.my_profile_id() or public.is_admin()))
  with check (public.is_family_member(family_id));
create policy "posts_delete_author_or_admin" on public.family_posts for delete
  using (public.is_family_member(family_id) and (author_id = public.my_profile_id() or public.is_admin()));

-- push_tokens
create policy "push_tokens_owner" on public.push_tokens for all
  using (profile_id = public.my_profile_id())
  with check (profile_id = public.my_profile_id());

-- ---------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table public.list_items;
alter publication supabase_realtime add table public.lists;
alter publication supabase_realtime add table public.family_posts;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.routine_completions;
