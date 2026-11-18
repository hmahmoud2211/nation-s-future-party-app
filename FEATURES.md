# Features — مستقبل وطن | قطاع الأعمال

Everything the app does, grouped by area. Arabic labels in parentheses are the exact text on screen.

> **Demo build (frontend only).** No backend. The secretariat's leadership, bureau and committee officials are real people from the official decree and committee chart; their contact details are placeholders. Governorate assignments, proposals, budgets, meetings and regular members are sample data kept in memory, so everything resets on reload. Video calls are simulated and say so on screen.

---

## 1. Roles and permissions

Each person has **one role**. Committee responsibility (مسؤول اللجنة) is a **permission** attached to anyone: the list of committees they run. It is not a separate role. All rules live in one file (`src/utils/permissions.ts`): a role → capability table, plus checks scoped to a committee or governorate, ready to be enforced by a backend later.

| | الأمين | الأمين المساعد | عضو الهيئة | مسؤول اللجنة (permission) | عضو | مدير النظام |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| See all committees, activities, projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| See every proposal | ✓ | ✓ | ✓ | Own committee + achievements of others | Own committee + achievements of others | ✓ |
| Submit proposals | | If responsible | If responsible | Own committee | | ✓ |
| Decide on proposals (review / approve / reject) | ✓ | | | | | ✓ |
| Mark approved proposals in progress / completed | ✓ | | | Own committee | | ✓ |
| Financial overview and project budgets | ✓ | | | | | ✓ |
| Governorates | All | Assigned ones | | | | All + reassign |
| See all meetings | ✓ | Own + committees in scope | Own + committees in scope | Own + committee | Own + committee | ✓ |
| Create meetings | General + any committee | General + own committees | General + own committees | Own committee | | General + any committee |
| Start / join video calls | Start own, join any | Start own, join invited | Start own, join invited | Start own, join invited | Join invited | ✓ |
| Reports and statistics | ✓ | ✓ | ✓ | Own committee | | ✓ |
| Manage members, committees, settings | | | | | | ✓ |

"Achievements of others" means proposals that are approved, in progress or completed.

## 2. Navigation

Five tabs for everyone (الرئيسية • اللجان • المقترحات • الاجتماعات • المزيد); what each shows depends on permissions.
- **Live badges:**
  - المقترحات: proposals waiting for الأمين's decision.
  - الاجتماعات: meetings you can join right now.
  - المزيد: unread notifications.
- **المزيد (More)** holds the profile and role-specific tools:
  - Finance (الأمين/admin), governorates (assistant secretaries/الأمين), reports.
  - Projects, activities, announcements, notifications.
  - Inquiries and admin requests.
  - Admin tools.
  - Demo session: switch account, reset data, log out.

## 3. Home dashboards

A compact header (greeting, role badge such as "الأمين المساعد • مسؤول اللجنة", notifications, account switch) above a dashboard chosen by role:

| Dashboard | Shows |
|---|---|
| الأمين / admin | 4 KPIs (committees, active projects, proposals awaiting decision, upcoming meetings); financial summary; proposals awaiting decision; upcoming meetings; recent committee activities; quick actions |
| الأمين المساعد | Assigned governorates (with counts); their committees; proposals in their committees or governorates; upcoming meetings; activities in their governorates |
| عضو الهيئة | Quick actions; their committees; recent activities; latest proposals; upcoming meetings |
| مسؤول اللجنة | Committee card with stats; prominent **تقديم مقترح جديد** button; committee proposals; committee activities; upcoming meetings |
| عضو | Their committee; upcoming meetings; committee activities and proposals |

## 4. Proposals (المقترحات)

- **List:** search; committee filter (all / my committees / one committee); status chips with counts.
- **Short submission form:**
  - Required: committee, title, short description, objective.
  - Optional: governorate, supporting documents.
  - Only committees the person is responsible for are offered.
- **Statuses:** جديد → قيد المراجعة → تمت الموافقة / مرفوض → قيد التنفيذ → مكتمل.
- **Details:** committee, author, governorate, date, description, objective, attachments, status timeline, latest decision note.
  - Action buttons appear only for allowed moves. Rejecting requires a reason; approving takes an optional note.
  - "Send a note on this proposal" opens an inquiry linked to the proposal.
- **Notifications:**
  - A new proposal notifies الأمين, the committee's officials, and the assistant secretary for the target governorate.
  - A status change notifies the author and the committee's officials.

## 5. Committees (اللجان)

- **Directory:** the 10 committees with all their officials, search, filters (all / mine / disabled).
- **Committee page:** overview (description, officials with role badges, key stats, upcoming meetings, announcements) plus tabs:
  - **المقترحات (proposals)** — with a submit button for its officials.
  - **المشروعات (projects)** and **الأنشطة (activities)**.
  - **الأعضاء (members)**.
  - **التقارير (reports)** — for people allowed to see them.
- Management shortcuts for the committee's officials: submit proposal, new activity, meeting, project, report.

## 6. Projects and finance

- **Projects:** visible to everyone.
  - Project page: description, lead, team, milestones (tick, add, overdue flag), admin notes thread, progress update, close as completed.
- **Finance card on the project page** (finance permission only):
  - Budget, spent, remaining, spend progress (red when over budget), expense lines.
  - **Set/edit budget** for الأمين.
- **Financial overview (الملخص المالي):**
  - Committee filter; summary cards (allocated budget, total spent, remaining, spend %).
  - "Spent by committee" bar chart.
  - Every project with budget/spent/remaining, a progress bar and an over-budget warning.
- Financial data is never shown to other roles.

## 7. Meetings and video conferencing

- **List:** upcoming (live first) and past. الأمين sees all; others see meetings they're invited to or that belong to their committees.
- **New / edit meeting:**
  - Title; committee **or general meeting (اجتماع عام)**; date and time; duration.
  - Type: video or in person (location only for in person).
  - Optional description; agenda.
  - **Participants from anyone**, with the committee's people pre-selected; "add bureau members" shortcut for general meetings. The organizer is added automatically.
- **Meeting page:**
  - Video section: not started / **live now** / ended.
  - **بدء الاجتماع (start)** for the organizer; **انضمام إلى الاجتماع (join)** while live; end for everyone.
  - Also: RSVP, minutes (marks it held), cancel, edit.
- **Call screen** (simulated):
  - Header and banner: meeting title, elapsed time, participant count, **تجريبي** badge, and a banner saying no audio or video is transmitted.
  - Participant tiles (you highlighted, muted mics shown), mic and camera toggles, participants list.
  - Leaving: the organizer chooses "end for everyone" or "leave only".
- **Provider-agnostic design:**
  - The UI talks only to a `VideoProvider` interface (`src/services/video`). Meetings store `{ provider, roomId, startedAt… }`.
  - A real provider can replace the mock without changing screens.

## 8. Governorates (المحافظات)

- **List:** all 27 governorates grouped by region.
  - Assistant secretaries see only theirs; الأمين/admin see all.
  - Each row shows the coordinator and counts of activities, proposals and projects.
- **Governorate page:**
  - Coordinating assistant secretary (admin can reassign).
  - Governorate secretaries and committee representatives with their responsibilities.
  - Activities, proposals and projects in that governorate.
- Governorate coordination is kept separate from committee membership. All assignments and governorate secretaries are labelled as sample data.

## 9. Other sections (kept, simplified)

- **Activities and events:** every committee's activities, with a committee filter; only a committee's officials can manage its activities. Registration, progress, images, completion report.
- **Reports and statistics:**
  - Sector KPIs; charts for proposal status, project progress by committee, project status and committee activity; workload.
  - Written committee reports with review.
- **Inquiries:** about proposals, projects or administrative matters. Threaded replies, follow-up statuses, all committee officials notified.
- **Admin requests:** data updates, inquiries, documents, tech support.
- **Announcements and notifications:**
  - Announcements per committee or sector-wide.
  - Notification filters: proposals, meetings, notes, announcements.
- **Members:**
  - Profile: role and responsibility badges, committees with role per committee, governorates, proposals, projects.
  - Admin form: one role + "responsible for committees" + supervised committees.
- **Admin:** committee management (enable, several officials, new committee), settings (demo hints, reset data).

## 10. Design

- Arabic-first and fully RTL, Cairo font.
- **Type scale:** screen titles 20, sections 16, card titles 14.5, body 14, secondary 12–13. Semibold instead of heavy bold; device text scaling respected (capped).
- **Layout:** compact headers and cards, subtle borders and shadows, no decorative rings, restrained colors. Clear empty, loading and "not authorized" states.

## 11. Removed

- Incentives and rewards, entirely: screens, approvals tab, statuses, notifications, mock data, labels and components.
- Tasks: screens, tabs, mock data, links from meetings and projects.
- The separate لجنتي and التقارير tabs. Their content now lives on the home dashboards, the committee page and المزيد.

## 12. Known limitations

- No backend, no persistence, no push notifications.
- Permissions are simulated in the UI.
- Video calls transmit no media.
- Governorate assignments and governorate secretaries are sample data.
- كاميليا محمد صابر أحمد السعدني has no committee in the chart.
