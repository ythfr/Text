import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

type Screen = 'welcome' | 'register' | 'login' | 'home';

export default function WelcomeScreen() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  if (screen === 'register' || screen === 'login') {
    const isRegister = screen === 'register';
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Pressable onPress={() => setScreen('welcome')}><Text style={styles.back}>‹ BACK</Text></Pressable>
          <Text style={styles.eyebrow}>VISION ONE</Text>
          <Text style={styles.heading}>{isRegister ? 'Create your account' : 'Welcome back'}</Text>
          {isRegister && <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#718096" style={styles.input} />}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#718096" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor="#718096" secureTextEntry style={styles.input} />
          <Pressable disabled={!email || (isRegister && !name)} onPress={() => { setSignedIn(true); setScreen('home'); }} style={[styles.primary, (!email || (isRegister && !name)) && styles.disabled]}>
            <Text style={styles.primaryText}>{isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}</Text>
          </Pressable>
          <Text style={styles.helper}>Connected mode will use Supabase Auth when configured.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'home' && signedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>VISION ONE</Text>
          <Text style={styles.heading}>Good to see you{ name ? `, ${name}` : '' }.</Text>
          <View style={styles.card}><Text style={styles.cardLabel}>TOTAL BALANCE</Text><Text style={styles.balance}>KSh 0.00</Text><Text style={styles.muted}>KES wallet · Ready to connect</Text></View>
          <Text style={styles.section}>QUICK ACTIONS</Text>
          <View style={styles.row}><Pressable style={styles.action}><Text style={styles.actionText}>ADD MONEY</Text></Pressable><Pressable style={styles.action}><Text style={styles.actionText}>SEND</Text></Pressable></View>
          <Pressable onPress={() => { setSignedIn(false); setScreen('welcome'); }} style={styles.secondary}><Text style={styles.secondaryText}>SIGN OUT</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>VISION ONE</Text>
        <Text style={styles.title}>Your money.{"\n"}One wallet.{"\n"}Everywhere.</Text>
        <Text style={styles.disclaimer}>Secure wallet foundation — connect providers when configured.</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => setScreen('register')} style={styles.primary}><Text style={styles.primaryText}>CREATE ACCOUNT</Text></Pressable>
          <Pressable onPress={() => setScreen('login')} style={styles.secondary}><Text style={styles.secondaryText}>SIGN IN</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08111F' },
  container: { flex: 1, justifyContent: 'center', padding: 28 },
  eyebrow: { color: '#B9F227', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#F8FAFC', fontSize: 42, lineHeight: 48, fontWeight: '800', marginTop: 24 },
  heading: { color: '#F8FAFC', fontSize: 30, lineHeight: 36, fontWeight: '800', marginTop: 22, marginBottom: 24 },
  disclaimer: { color: '#A8B3C2', fontSize: 14, marginTop: 24 },
  actions: { gap: 12, marginTop: 48 },
  primary: { backgroundColor: '#B9F227', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#08111F', fontWeight: '800' },
  secondary: { borderColor: '#344256', borderWidth: 1, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 },
  secondaryText: { color: '#F8FAFC', fontWeight: '800' },
  back: { color: '#B9F227', fontWeight: '800', marginBottom: 28 },
  input: { backgroundColor: '#111D2D', color: '#F8FAFC', borderColor: '#344256', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 12 },
  helper: { color: '#718096', fontSize: 12, marginTop: 18, lineHeight: 18 },
  disabled: { opacity: 0.45 },
  card: { backgroundColor: '#122238', borderRadius: 20, padding: 22, marginTop: 20 },
  cardLabel: { color: '#A8B3C2', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  balance: { color: '#F8FAFC', fontSize: 34, fontWeight: '800', marginTop: 12 },
  muted: { color: '#A8B3C2', marginTop: 8 },
  section: { color: '#A8B3C2', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 32 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  action: { flex: 1, backgroundColor: '#1A2C43', borderRadius: 14, padding: 16, alignItems: 'center' },
  actionText: { color: '#B9F227', fontSize: 12, fontWeight: '800' },
});
