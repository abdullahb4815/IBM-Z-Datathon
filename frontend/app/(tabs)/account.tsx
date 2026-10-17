// Account: profile picture at the top, then editable personal details. Stored on-device only.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardTypeOptions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EMPTY_PROFILE, getProfile, Profile, saveProfile } from '../../src/storage';
import { colors } from '../../src/theme';

function ageFromDob(dob: string): string {
  const d = new Date(dob);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || isNaN(d.getTime())) return '—';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return String(age);
}

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  function update(field: keyof Profile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const next = { ...profile, photoUri: result.assets[0].uri };
      setProfile(next);
      await saveProfile(next);
    }
  }

  async function onSave() {
    await saveProfile(profile);
    Alert.alert('Saved', 'Your details have been updated.');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.avatarWrap} onPress={pickPhoto}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <MaterialCommunityIcons name="account" size={64} color={colors.muted} />
          </View>
        )}
        <Text style={styles.changePhoto}>Change photo</Text>
      </Pressable>

      <Field label="Name" value={profile.name} onChange={(v) => update('name', v)} />
      <Field label="Date of birth" value={profile.dob} placeholder="YYYY-MM-DD" onChange={(v) => update('dob', v)} />
      <View style={styles.field}>
        <Text style={styles.label}>Age</Text>
        <Text style={styles.readonly}>{ageFromDob(profile.dob)}</Text>
      </View>
      <Field label="Email" value={profile.email} keyboardType="email-address" onChange={(v) => update('email', v)} />
      <Field label="Phone number" value={profile.phone} keyboardType="phone-pad" onChange={(v) => update('phone', v)} />

      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        autoCapitalize={props.keyboardType === 'email-address' ? 'none' : 'sentences'}
        onChangeText={props.onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarEmpty: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  changePhoto: { marginTop: 8, color: colors.primary, fontWeight: '600' },
  field: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  label: { fontSize: 12, color: colors.muted },
  input: { fontSize: 16, color: colors.text, paddingVertical: 4 },
  readonly: { fontSize: 16, color: colors.text, paddingVertical: 4 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
