import React from 'react';
import { AssistantDashboard, BoardDashboard, MemberDashboard, ResponsibleDashboard, SecretaryDashboard } from '@/features/home/Dashboards';
import { useUser } from '@/store';
import { dashboardFor } from '@/utils/permissions';

/** Role-based home: each role sees only what matters to it. */
export default function HomeTab() {
  const user = useUser();
  switch (dashboardFor(user)) {
    case 'secretary':
      return <SecretaryDashboard />;
    case 'assistant':
      return <AssistantDashboard />;
    case 'board':
      return <BoardDashboard />;
    case 'responsible':
      return <ResponsibleDashboard />;
    default:
      return <MemberDashboard />;
  }
}
