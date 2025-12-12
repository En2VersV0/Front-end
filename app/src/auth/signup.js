import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { GENRES } from '../../constants/genres';

export default function Signup() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        favoriteGenres: [],
        firstBookTitle: '',
        firstBookAuthor: '',
        secondBookTitle: '',
        secondBookAuthor: '',
        birth: '',
        genre: '',
    });

    const handleGenreToggle = (genre) => {
        setFormData(prev => ({
            ...prev,
            favoriteGenres: prev.favoriteGenres.includes(genre)
                ? prev.favoriteGenres.filter(g => g !== genre)
                : [...prev.favoriteGenres, genre]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await signup(formData);
        } catch (error) {
            Alert.alert('Erreur', error.message);
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => /.+@.+\..+/.test(email);

    const handleNextFromStep1 = () => {
        if (!formData.fullname.trim()) return Alert.alert('Info manquante', 'Ton nom complet est requis.');
        if (!formData.username.trim() || formData.username.length < 5)
            return Alert.alert("Nom d'utilisateur", "Le nom d'utilisateur doit contenir au moins 5 caractères.");
        if (!formData.email.trim() || !isValidEmail(formData.email))
            return Alert.alert('Email invalide', "Merci d'indiquer un email valide.");
        if (!formData.password || formData.password.length < 6)
            return Alert.alert('Mot de passe', 'Le mot de passe doit contenir au moins 6 caractères.');
        if (formData.password !== formData.confirmPassword)
            return Alert.alert('Mot de passe', 'Les mots de passe ne correspondent pas.');
        setStep(2);
    };

    const handleNextFromStep2 = () => {
        if (formData.favoriteGenres.length < 3) {
            return Alert.alert('Sélectionne des genres', 'Choisis au moins 3 genres pour continuer.');
        }
        setStep(3);
    };

    const handleNextFromStep3 = () => {
        if (!formData.firstBookTitle.trim())
            return Alert.alert('Livre requis', 'Indique au moins un premier livre favori.');
        setStep(4);
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <Text style={styles.title}>Créer un compte</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom complet"
                            value={formData.fullname}
                            onChangeText={(val) => setFormData({...formData, fullname: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur (min. 5 caractères)"
                            value={formData.username}
                            onChangeText={(val) => setFormData({...formData, username: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={(val) => setFormData({...formData, email: val})}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChangeText={(val) => setFormData({...formData, password: val})}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            value={formData.confirmPassword}
                            onChangeText={(val) => setFormData({...formData, confirmPassword: val})}
                            secureTextEntry
                        />
                        <TouchableOpacity style={styles.button} onPress={handleNextFromStep1}>
                            <Text style={styles.buttonText}>Suivant</Text>
                        </TouchableOpacity>
                    </>
                );

            case 2:
                return (
                    <>
                        <Text style={styles.title}>Tes genres préférés</Text>
                        <Text style={styles.subtitle}>Sélectionne au moins 3 genres</Text>
                        <View style={styles.genresContainer}>
                            {GENRES.map((genre) => (
                                <TouchableOpacity
                                    key={genre}
                                    style={[
                                        styles.genreChip,
                                        formData.favoriteGenres.includes(genre) && styles.genreChipSelected
                                    ]}
                                    onPress={() => handleGenreToggle(genre)}
                                >
                                    <Text style={[
                                        styles.genreText,
                                        formData.favoriteGenres.includes(genre) && styles.genreTextSelected
                                    ]}>
                                        {genre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleNextFromStep2}>
                            <Text style={styles.buttonText}>Suivant</Text>
                        </TouchableOpacity>
                    </>
                );

            case 3:
                return (
                    <>
                        <Text style={styles.title}>Tes livres favoris</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Titre du 1er livre"
                            value={formData.firstBookTitle}
                            onChangeText={(val) => setFormData({...formData, firstBookTitle: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Auteur du 1er livre"
                            value={formData.firstBookAuthor}
                            onChangeText={(val) => setFormData({...formData, firstBookAuthor: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Titre du 2ème livre (optionnel)"
                            value={formData.secondBookTitle}
                            onChangeText={(val) => setFormData({...formData, secondBookTitle: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Auteur du 2ème livre (optionnel)"
                            value={formData.secondBookAuthor}
                            onChangeText={(val) => setFormData({...formData, secondBookAuthor: val})}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleNextFromStep3}>
                            <Text style={styles.buttonText}>Suivant</Text>
                        </TouchableOpacity>
                    </>
                );

            case 4:
                return (
                    <>
                        <Text style={styles.title}>Dernières infos</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Date de naissance (ex: 1990-05-21)"
                            value={formData.birth}
                            onChangeText={(val) => setFormData({...formData, birth: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Genre (ex: Femme, Homme, Autre)"
                            value={formData.genre}
                            onChangeText={(val) => setFormData({...formData, genre: val})}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Créer mon compte</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderStep()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F2EC' },
    scrollContent: { padding: 24 },
    title: { fontSize: 28, fontWeight: '700', color: '#5A2B18', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#7A7A7A', marginBottom: 20 },
    input: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    genresContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
    genreChip: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    genreChipSelected: { backgroundColor: '#8B4A2B', borderColor: '#8B4A2B' },
    genreText: { color: '#333' },
    genreTextSelected: { color: 'white' },
    button: { backgroundColor: '#8B4A2B', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
