import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { requireSupabase, supabase } from '../src/supabase';
import { simulatedDeposit, simulatedWithdrawal } from '../src/wallet-actions';

type Screen = 'welcome' | 'register' | 'login' | 'home';
type Wallet = { currency_code: string; balance: number };

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadWallets(id: string) {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from('wallets').select('currency_code,balance').eq('user_id', id);
    if (queryError) setError(queryError.message); else setWallets((data ?? []) as Wallet[]);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id;
      if (id) { setUserId(id); setScreen('home'); void loadWallets(id); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      setUserId(id);
      if (id) { setScreen('home'); void loadWallets(id); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

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
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }

  async function runAction(action: 'deposit' | 'withdrawal') {
    if (!userId) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError('Enter a positive amount.'); return; }
    setBusy(true); setError('');
    try {
      if (action === 'deposit') await simulatedDeposit(userId, 'KES', value);
      else await simulatedWithdrawal(userId, 'KES', value);
      setAmount(''); await loadWallets(userId);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Wallet action failed.'); }
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
      <View style={styles.card}><Text style={styles.label}>KES BALANCE</Text><Text style={styles.balance}>KSh {Number(kes?.balance ?? 0).toFixed(2)}</Text></View>
      <TextInput value={amount} onChangeText={setAmount} placeholder="Amount in KES" placeholderTextColor="#718096" keyboardType="decimal-pad" style={styles.input} />
      <View style={styles.row}><Pressable disabled={busy} onPress={() => runAction('deposit')} style={styles.action}><Text style={styles.actionText}>ADD MONEY</Text></Pressable><Pressable disabled={busy} onPress={() => runAction('withdrawal')} style={styles.action}><Text style={styles.actionText}>WITHDRAW</Text></Pressable></View>
      <Text style={styles.section}>WALLETS</Text>{wallets.map((wallet) => <View key={wallet.currency_code} style={styles.wallet}><Text style={styles.code}>{wallet.currency_code}</Text><Text style={styles.walletBalance}>{Number(wallet.balance).toFixed(2)}</Text></View>)}
      {!!error && <Text style={styles.error}>{error}</Text>}<Pressable onPress={signOut} style={styles.secondary}><Text style={styles.secondaryText}>SIGN OUT</Text></Pressable>
    </View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.eyebrow}>VISION ONE</Text><Text style={styles.title}>Your money.{"\n"}One wallet.{"\n"}Everywhere.</Text><Text style={styles.muted}>Secure multi-currency wallet.</Text><Pressable onPress={() => setScreen('register')} style={styles.primary}><Text style={styles.primaryText}>CREATE ACCOUNT</Text></Pressable><Pressable onPress={() => setScreen('login')} style={styles.secondary}><Text style={styles.secondaryText}>SIGN IN</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08111F' }, container: { flex: 1, justifyContent: 'center', padding: 28 }, eyebrow: { color: '#B9F227', fontSize: 14, fontWeight: '800', letterSpacing: 2 }, title: { color: '#F8FAFC', fontSize: 42, lineHeight: 48, fontWeight: '800', marginTop: 24 }, heading: { color: '#F8FAFC', fontSize: 30, fontWeight: '800', marginTop: 22, marginBottom: 24 }, muted: { color: '#A8B3C2', marginTop: 12 }, back: { color: '#B9F227', fontWeight: '800', marginBottom: 28 }, input: { backgroundColor: '#111D2D', color: '#F8FAFC', borderColor: '#344256', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 12 }, primary: { backgroundColor: '#B9F227', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16 }, primaryText: { color: '#08111F', fontWeight: '800' }, secondary: { borderColor: '#344256', borderWidth: 1, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 }, secondaryText: { color: '#F8FAFC', fontWeight: '800' }, disabled: { opacity: 0.5 }, error: { color: '#FF8A8A', marginTop: 14 }, card: { backgroundColor: '#122238', borderRadius: 20, padding: 22, marginTop: 20 }, label: { color: '#A8B3C2', fontSize: 12, fontWeight: '800' }, balance: { color: '#F8FAFC', fontSize: 34, fontWeight: '800', marginTop: 12 }, section: { color: '#A8B3C2', fontSize: 12, fontWeight: '800', marginTop: 32 }, wallet: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111D2D', padding: 16, borderRadius: 12, marginTop: 8 }, code: { color: '#B9F227', fontWeight: '800' }, walletBalance: { color: '#F8FAFC' }, row: { flexDirection: 'row', gap: 10, marginTop: 12 }, action: { flex: 1, backgroundColor: '#1A2C43', borderRadius: 14, padding: 16, alignItems: 'center' }, actionText: { color: '#B9F227', fontSize: 12, fontWeight: '800' }
});
