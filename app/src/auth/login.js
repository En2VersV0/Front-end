import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);

    // TODO: Remplacer par tes vrais Client IDs Google (Console Google Cloud)
    const GOOGLE_CONFIG = {
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    };

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: GOOGLE_CONFIG.iosClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        webClientId: GOOGLE_CONFIG.webClientId,
        scopes: ['profile', 'email'],
    });

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Remplis tous les champs');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (error) {
            Alert.alert('Erreur', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success' && response.authentication?.accessToken) {
                try {
                    setGoogleLoading(true);
                    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                        headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
                    });
                    const profile = await res.json();
                    const prefillEmail = profile.email || '';
                    const prefillName = profile.name || profile.given_name || '';
                    router.push({ pathname: '/(auth)/signup', params: { prefillEmail, prefillName } });
                } catch (e) {
                    Alert.alert('Google', "Impossible de récupérer ton profil Google.");
                } finally {
                    setGoogleLoading(false);
                }
            }
        };
        handleGoogleResponse();
    }, [response]);

    const handleGoogleLogin = async () => {
        // Vérifie que les Client IDs sont configurés
        if (
            GOOGLE_CONFIG.iosClientId.startsWith('YOUR_') ||
            GOOGLE_CONFIG.androidClientId.startsWith('YOUR_') ||
            GOOGLE_CONFIG.webClientId.startsWith('YOUR_')
        ) {
            Alert.alert('Configuration requise', "Renseigne les Client IDs Google (EXPO_PUBLIC_GOOGLE_* dans app.config ou .env) pour activer la connexion Google.");
            return;
        }
        try {
            await promptAsync();
        } catch (e) {
            Alert.alert('Google', 'La connexion Google a échoué.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bon retour sur En 2 Vers</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Se connecter</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={handleGoogleLogin}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <ActivityIndicator color="#5A2B18" />
                ) : (
                    <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                )}
            </TouchableOpacity>

            <Link href="/(auth)/signup" style={styles.link}>
                Pas encore de compte ? Inscris-toi
            </Link>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F2EC',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#5A2B18',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        backgroundColor: '#8B4A2B',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
    },
    googleButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#8B4A2B',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    googleButtonText: {
        color: '#8B4A2B',
        fontSize: 18,
        fontWeight: '600',
    },
    link: {
        color: '#8B4A2B',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 15,
    },
});
