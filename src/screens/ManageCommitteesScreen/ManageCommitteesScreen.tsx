import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Building2, Plus, ShieldAlert } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { PressableScale } from '@/components/common/PressableScale';
import { EmptyState } from '@/components/feedback/States';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useUser } from '@/features/auth/hooks/useSession';
import { isAdmin } from '@/features/auth/services/permissions';
import { CommitteeIcon } from '@/features/committees/components/CommitteeCard';
import { COMMITTEE_ICON_LABELS } from '@/features/committees/components/committeeIcons';
import { useCommitteeActions, useCommittees } from '@/features/committees/hooks/useCommittees';
import type { CommitteeIconKey } from '@/features/committees/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import { CommitteeAdminRow } from './CommitteeAdminRow';
import { committeeColorKeys, manageCommitteesCopy as copy } from './ManageCommitteesScreen.data';
import { createStyles, PREVIEW_ICON_SIZE } from './ManageCommitteesScreen.styles';

export function ManageCommitteesScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colorOptions = useMemo(() => committeeColorKeys.map((k) => theme.identityColors[k]), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useCommittees();
  const { createCommittee } = useCommitteeActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<CommitteeIconKey>('investment');
  const [color, setColor] = useState(colorOptions[0]);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  const enabledCount = committees.filter((c) => c.enabled).length;

  const submit = () => {
    if (!name.trim()) {
      setError(copy.nameRequired);
      toast.error(copy.incompleteForm);
      return;
    }
    const res = createCommittee({ name, shortName, description, icon, color });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(copy.createSuccess);
    setOpen(false);
    setName('');
    setShortName('');
    setDescription('');
    setError(null);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title={copy.title}
          subtitle={copy.subtitle(enabledCount, committees.length)}
          actions={<IconButton icon={Plus} variant="glass" accessibilityLabel={copy.addCommitteeA11y} onPress={() => setOpen(true)} />}
        />
      }
    >
      <View style={styles.content}>
        {committees.map((c) => (
          <CommitteeAdminRow key={c.id} committee={c} />
        ))}
        <Button title={copy.newCommittee} icon={Building2} variant="secondary" onPress={() => setOpen(true)} />
      </View>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={copy.newCommittee} footer={<Button title={copy.saveCommittee} onPress={submit} fullWidth />}>
        <FormField label={copy.nameLabel} required error={error ?? undefined}>
          <AppInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            placeholder={copy.namePlaceholder}
            error={!!error}
          />
        </FormField>
        <FormField label={copy.shortNameLabel}>
          <AppInput value={shortName} onChangeText={setShortName} placeholder={copy.shortNamePlaceholder} />
        </FormField>
        <FormField label={copy.descriptionLabel}>
          <TextArea value={description} onChangeText={setDescription} placeholder={copy.descriptionPlaceholder} />
        </FormField>
        <FormField label={copy.iconLabel}>
          <ChoiceChips
            options={(Object.keys(COMMITTEE_ICON_LABELS) as CommitteeIconKey[]).map((k) => ({ value: k, label: COMMITTEE_ICON_LABELS[k] }))}
            value={icon}
            onChange={setIcon}
            columns={3}
          />
        </FormField>
        <FormField label={copy.colorLabel}>
          <View style={styles.colors}>
            {colorOptions.map((c) => (
              <PressableScale key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]} accessibilityLabel={copy.chooseColorA11y} />
            ))}
          </View>
        </FormField>
        <View style={styles.preview}>
          <CommitteeIcon committee={{ icon, color }} size={PREVIEW_ICON_SIZE} />
          <AppText variant="cardTitle" style={styles.previewName}>
            {name || copy.previewName}
          </AppText>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}
