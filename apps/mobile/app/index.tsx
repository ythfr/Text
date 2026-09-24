import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { requireSupabase, supabase } from '../src/supabase';

type Screen = 'welcome' | 'register' | 'login' | 'home';
type Wallet = { currency_code: string; balance: number };

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUserId(data.session.user.id); setScreen('home'); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      if (session?.user) setScreen('home');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || !supabase) return;
    supabase.from('wallets').select('currency_code,balance').eq('user_id', userId).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setWallets((data ?? []) as Wallet[]);
    });
  }, [userId]);

  async function authenticate(register: boolean) {
    setError('');
    if (!email.trim() || !password || (register && !name.trim())) { setError('Complete all required fields.'); return; }
    setBusy(true);
    try {
      const client = requireSupabase();
      const result = register
        ? await client.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (!result.data.session) setError('Check your email, then sign in.');
      else setScreen('home');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUserId(null); setWallets([]); setScreen('welcome');
  }

  if (screen === 'register' || screen === 'login') {
    const register = screen === 'register';
    return <SafeAreaView style={styles.safe}><View style={styles.container}>
      <Pressable onPress={() => setScreen('welcome')}><Text style={styles.back}>‹ BACK</Text></Pressable>
      <Text style={styles.eyebrow}>VISION ONE</Text><Text style={styles.heading}>{register ? 'Create your account' : 'Welcome back'}</Text>
      {register && <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#718096" style={styles.input} />}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#718096" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#718096" secureTextEntry style={styles.input} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable disabled={busy} onPress={() => authenticate(register)} style={[styles.primary, busy && styles.disabled]}><Text style={styles.primaryText}>{busy ? 'PLEASE WAIT...' : register ? 'CREATE ACCOUNT' : 'SIGN IN'}</Text></Pressable>
    </View></SafeAreaView>;
  }

  if (screen === 'home' && userId) {
    const kes = wallets.find((wallet) => wallet.currency_code === 'KES');
    return <SafeAreaView style={styles.safe}><View style={styles.container}>
      <Text style={styles.eyebrow}>VISION ONE</Text><Text style={styles.heading}>Your wallet</Text>
      <View style={styles.card}><Text style={styles.label}>KES BALANCE</Text><Text style={styles.balance}>KSh {Number(kes?.balance ?? 0).toFixed(2)}</Text><Text style={styles.muted}>{wallets.length} wallets connected</Text></View>
      <Text style={styles.section}>WALLETS</Text>{wallets.map((wallet) => <View key={wallet.currency_code} style={styles.wallet}><Text style={styles.code}>{wallet.currency_code}</Text><Text style={styles.walletBalance}>{Number(wallet.balance).toFixed(2)}</Text></View>)}
      {!!error && <Text style={styles.error}>{error}</Text>}<Pressable onPress={signOut} style={styles.secondary}><Text style={styles.secondaryText}>SIGN OUT</Text></Pressable>
    </View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.eyebrow}>VISION ONE</Text><Text style={styles.title}>Your money.{"\n"}One wallet.{"\n"}Everywhere.</Text><Text style={styles.muted}>Secure multi-currency wallet.</Text><Pressable onPress={() => setScreen('register')} style={styles.primary}><Text style={styles.primaryText}>CREATE ACCOUNT</Text></Pressable><Pressable onPress={() => setScreen('login')} style={styles.secondary}><Text style={styles.secondaryText}>SIGN IN</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08111F' }, container: { flex: 1, justifyContent: 'center', padding: 28 }, eyebrow: { color: '#B9F227', fontSize: 14, fontWeight: '800', letterSpacing: 2 }, title: { color: '#F8FAFC', fontSize: 42, lineHeight: 48, fontWeight: '800', marginTop: 24 }, heading: { color: '#F8FAFC', fontSize: 30, fontWeight: '800', marginTop: 22, marginBottom: 24 }, muted: { color: '#A8B3C2', marginTop: 12 }, back: { color: '#B9F227', fontWeight: '800', marginBottom: 28 }, input: { backgroundColor: '#111D2D', color: '#F8FAFC', borderColor: '#344256', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 12 }, primary: { backgroundColor: '#B9F227', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16 }, primaryText: { color: '#08111F', fontWeight: '800' }, secondary: { borderColor: '#344256', borderWidth: 1, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 }, secondaryText: { color: '#F8FAFC', fontWeight: '800' }, disabled: { opacity: 0.5 }, error: { color: '#FF8A8A', marginTop: 14 }, card: { backgroundColor: '#122238', borderRadius: 20, padding: 22, marginTop: 20 }, label: { color: '#A8B3C2', fontSize: 12, fontWeight: '800' }, balance: { color: '#F8FAFC', fontSize: 34, fontWeight: '800', marginTop: 12 }, section: { color: '#A8B3C2', fontSize: 12, fontWeight: '800', marginTop: 32 }, wallet: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111D2D', padding: 16, borderRadius: 12, marginTop: 8 }, code: { color: '#B9F227', fontWeight: '800' }, walletBalance: { color: '#F8FAFC' }
});
