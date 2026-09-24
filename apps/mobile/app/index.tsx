import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>VISION ONE</Text>
        <Text style={styles.title}>Your money.{"\n"}One wallet.{"\n"}Everywhere.</Text>
        <Text style={styles.disclaimer}>Simulation only — no real funds.</Text>
        <View style={styles.actions}>
          <Pressable style={styles.primary} accessibilityRole="button">
            <Text style={styles.primaryText}>CREATE ACCOUNT</Text>
          </Pressable>
          <Pressable style={styles.secondary} accessibilityRole="button">
            <Text style={styles.secondaryText}>SIGN IN</Text>
          </Pressable>
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
  disclaimer: { color: '#A8B3C2', fontSize: 14, marginTop: 24 },
  actions: { gap: 12, marginTop: 48 },
  primary: { backgroundColor: '#B9F227', borderRadius: 16, padding: 18, alignItems: 'center' },
  primaryText: { color: '#08111F', fontWeight: '800' },
  secondary: { borderColor: '#344256', borderWidth: 1, borderRadius: 16, padding: 18, alignItems: 'center' },
  secondaryText: { color: '#F8FAFC', fontWeight: '800' },
});
