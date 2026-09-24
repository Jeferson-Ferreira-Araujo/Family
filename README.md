# Ohana — Gerenciamento de Rotina Familiar

MVP funcional de ponta a ponta de um aplicativo mobile para famílias organizarem calendário, tarefas, rotinas, listas e recados compartilhados — com dados reais persistidos no Supabase (Auth + PostgreSQL + Realtime).

## Stack

- **React Native** + **TypeScript** + **Expo SDK 54** + **Expo Router**
- **Supabase**: Auth, PostgreSQL (com Row Level Security), Realtime
- **Expo Notifications** (lembretes locais + estrutura para push)
- `date-fns` (datas em pt-BR), `@react-native-community/datetimepicker`

Nenhum dado é mockado: todas as telas leem e escrevem no Supabase através de `services/` e `hooks/`.

## Estrutura do projeto

```
app/                     # rotas (Expo Router)
  (auth)/                # login, cadastro, recuperar senha
  (onboarding)/          # criar família / entrar com código
  (tabs)/                # Hoje, Calendário, Tarefas, Listas, Mais
  events/ tasks/ lists/  # telas de criação/edição/detalhe
  routines/ mural/ family/ account/ categories/ notifications/
components/ui/           # componentes reutilizáveis (Button, Card, Chip, ...)
context/app-context.tsx  # sessão, perfil, família e membros (estado global)
services/                # toda a comunicação com Supabase (CRUD + RPC)
hooks/                   # hooks de dados por domínio (com Realtime onde faz sentido)
lib/supabase.ts          # cliente Supabase configurado com AsyncStorage
types/                   # tipos gerados do banco (database.ts) + modelos de domínio
supabase/migrations/     # SQL completo (schema, RLS, funções) já aplicado ao projeto
```

## Banco de dados (Supabase)

Já existe um projeto Supabase provisionado e configurado para este app (`family-app`, região `sa-east-1`). O schema completo está em [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e já foi aplicado.

Tabelas: `profiles`, `families`, `family_invites`, `categories`, `events`, `event_participants`, `tasks`, `routines`, `routine_completions`, `lists`, `list_items`, `family_posts`, `push_tokens`.

### Como o modelo de família funciona

- `profiles` representa cada **membro** da família. Quando `user_id` está preenchido, é um adulto com login próprio. Quando `user_id` é nulo, é um **perfil infantil** gerenciado por um administrador (sem necessidade de login).
- Cada `profile` pertence a **no máximo uma família** (`family_id`), com um `role` (`admin` ou `member`).
- Um trigger em `auth.users` cria automaticamente um `profile` ao cadastrar um novo usuário.
- A criação de família, geração/uso de código de convite e adição de perfis infantis passam por **funções RPC `SECURITY DEFINER`** (`create_family`, `create_family_invite`, `join_family_with_code`, `add_child_profile`), que validam regras de negócio no banco — o app nunca decide sozinho quem pode entrar em qual família.

### Row Level Security

RLS está habilitado em **todas** as tabelas. As policies usam funções auxiliares (`my_family_id()`, `is_admin()`, `is_family_member()`, `same_family_profile()`) para garantir que:

- um usuário só enxerga/edita dados da **sua própria família** (comparando sempre `family_id` com a família do usuário autenticado, nunca confiando em valores vindos do cliente);
- apenas administradores podem gerar convites, remover perfis infantis ou renomear a família;
- qualquer membro pode criar/editar eventos, tarefas, rotinas, listas e recados da própria família (app colaborativo);
- `push_tokens` só é visível/editável pelo próprio dono do perfil.

Os avisos do linter de segurança do Supabase foram revisados: funções auxiliares internas tiveram `EXECUTE` revogado de `anon`/`authenticated` (só são chamadas internamente pelas policies), e apenas as RPCs destinadas ao app (`create_family`, `join_family_with_code`, etc.) continuam expostas para usuários autenticados.

## Configuração

### 1. Variáveis de ambiente

Crie um arquivo `.env` na raiz (use `.env.example` como modelo):

```
EXPO_PUBLIC_SUPABASE_URL=https://yfnzzpgthcteuzdkvfcf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key do projeto>
```

> A `anon key` é segura para ficar no app: ela só concede acesso ao que as políticas de RLS permitem. A `service_role key` **nunca** deve ser usada no app — ela não é usada em nenhum lugar deste projeto.

Se quiser usar seu **próprio** projeto Supabase em vez do já provisionado:

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Rode o SQL de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) no SQL Editor do seu projeto.
3. Copie a URL e a `anon key` (Project Settings → API) para o `.env`.

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar o app localmente

```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou rode em um emulador:

```bash
npm run android
npm run ios     # requer macOS
```

## Gerar um APK/IPA para instalar no celular (EAS Build)

O projeto já está configurado com [`eas.json`](eas.json) e vinculado a um projeto EAS (`@jaraujodeveloper/ohana-family`). As variáveis `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` já estão cadastradas nos ambientes do EAS (`preview`, `production`, `development`), então builds na nuvem funcionam sem configuração extra.

```bash
npx eas-cli login                 # se ainda não estiver logado
npx eas-cli build --platform android --profile preview
```

Ao final, o EAS gera um link para baixar o `.apk` diretamente no celular (não precisa de loja de apps). Para iOS, é necessário uma conta Apple Developer configurada (`eas build --platform ios --profile preview`).

Para desenvolvimento com hot-reload de código nativo, use o profile `development` (gera um dev client) em vez do Expo Go.

## Funcionalidades implementadas

- **Autenticação**: cadastro, login, logout, recuperação de senha, persistência de sessão (AsyncStorage).
- **Família**: criar família, entrar via código de convite, gerar convites (admin), adicionar perfis infantis, ver membros.
- **Hoje**: saudação, membros, próximos compromissos, tarefas do dia, rotinas do dia, recados importantes — tudo com dados reais e pull-to-refresh.
- **Calendário**: visualização Dia / Semana / Mês, CRUD completo de eventos (responsável, participantes, recorrência, lembrete, local).
- **Tarefas**: CRUD completo, filtros Hoje/Amanhã/Próximas/Concluídas, categorias, responsável, recorrência, lembrete.
- **Rotinas**: recorrência por dias da semana, conclusão diária registrada em `routine_completions` (a rotina nunca é destruída — ela "reaparece" automaticamente no próximo dia configurado).
- **Listas**: criação/edição/exclusão, itens com progresso ("7 de 12 comprados"), **Realtime** (alterações de outro membro aparecem sem precisar atualizar a tela).
- **Mural**: recados com autor, data e marcação de importante, também em Realtime.
- **Notificações**: lembretes locais agendados por evento/tarefa (Expo Notifications) e estrutura de `push_tokens` pronta para push remoto entre membros.
- **Mais**: conta, membros da família, mural, rotinas, categorias, notificações, sair.

## Fluxo de ponta a ponta

1. Usuário A cria conta → cria a família "Silva".
2. Usuário A gera um código de convite em **Mais → Membros da família → Convidar por código**.
3. Usuário B cria conta e entra com o código em **Entrar em família**.
4. Ambos veem os mesmos membros, eventos, tarefas, rotinas, listas e mural — em tempo real onde aplicável.
5. Qualquer um cria/edita eventos, tarefas, listas e rotinas; lembretes locais são agendados automaticamente conforme configurado em cada item.

## Notas técnicas

- Toda comunicação com o Supabase passa por `services/*.ts` — as telas nunca fazem `supabase.from(...)` diretamente.
- `hooks/*.ts` encapsulam carregamento, loading/erro e (quando faz sentido) subscriptions Realtime — usadas apenas em Listas e Mural, onde a colaboração em tempo real importa mais.
- Estados de loading, vazio e erro são tratados em todas as telas principais; ações destrutivas (excluir evento, tarefa, lista, rotina, recado, membro) pedem confirmação.
- Tema fixo em modo claro, paleta azul, cantos arredondados, sem aparência infantil — datas e horários em formato brasileiro (`dd/MM/yyyy`, `HH:mm`).
