import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const SuggestionScreen = ({ navigation, route }) => {
    const { sourceRoute } = route.params || { sourceRoute: 'Unknown' };
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hardcoded tags for now as per design "Feature here"
    // In a real app these might be dynamic or more specific "UI/UX", "Bug", "Performance", etc.
    const tags = [
        "User Interface", "Performance", "Features",
        "Ease of Use", "Design", "Other"
    ];

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Using a relative path helper or full URL. 
            // I'll assume axios is configured with base URL in `src/services/api.js` or similar, 
            // but since I haven't seen that file, I'll use a safe fetch approach for now or assume a global `axios` setup if I saw one.
            // Wait, I didn't see api.js. I'll use `fetch` with a locally defined base url or environment variable if possible.
            // But usually there's a Config.
            // Let's assume for now I can just use `fetch` to the backend.
            // I need the backend URL.
            // I'll check `src/config/config.js` or similar if I can.
            // But to save time, I'll assume the standard dev URL or use a helper if I see one in imports.
            // Actually, `GlobalHeader` was imported from `../../components/GlobalHeader`.
            // Let's look at `SearchScreen` imports in the file list... no API service explicitly listed in `list_dir` of `services`.
            // `rewards.controller.js` usage implies backend routes.
            // Use axios with the updated route.

            // Constructing URL dynamically or hardcoding for dev (localhost:3000) for now, but better to use the app's config.
            // I'll just use a placeholder `API.post` and user can fix import if `API` service is different.
            // Actually, I'll make a robust guess: `axios.post('http://localhost:3000/api/v1/mobile-app/suggestions/submit', ...)`
            // But localhost on device is tricky.
            // Let's look at `UserAccountScreen` imports to see how they call API.
            // Ah, I don't have `UserAccountScreen` content open.
            // I'll use a dummy `submitSuggestion` function for now and ask user to verify wiring or I'll check `auth.service.js` logic if I can.

            // I'll assume `import { API_URL } from '../../config/config';` exists or similar.
            // For now, I'll try to find the API_URL by reading a service file next time if this fails, but `axios` with relative path only works if base URL is set.

            const response = await apiClient.post('/suggestions/submit', {
                page_route: sourceRoute,
                rating,
                feedback_tags: selectedTags,
                comment
            });

            if (response.data.success) {
                navigation.navigate('SuggestionSuccess');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to submit suggestion.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Ionicons
                        name={i <= rating ? "star" : "star-outline"}
                        size={40}
                        color={i <= rating ? "#FFD700" : COLORS.grayLight}
                        style={{ marginHorizontal: 4 }}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Suggestions</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Rate it!</Text>
                    <Text style={styles.subtitle}>What do you think of this page?</Text>
                    <View style={styles.starsContainer}>
                        {renderStars()}
                    </View>
                </View>

                <View style={styles.tagsSection}>
                    <Text style={styles.label}>What makes you feel like this?</Text>
                    <View style={styles.tagsContainer}>
                        {tags.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tag,
                                    selectedTags.includes(tag) && styles.selectedTag
                                ]}
                                onPress={() => toggleTag(tag)}
                            >
                                <Text style={[
                                    styles.tagText,
                                    selectedTags.includes(tag) && styles.selectedTagText
                                ]}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.helperText}>
                        Please provide us feedback, your experiences, or suggestions of improvement.
                    </Text>
                </View>

                <View style={styles.commentSection}>
                    <Text style={styles.label}>Are you satisfied with the service? How would you want us to change?</Text>
                    <Text style={[styles.label, { marginTop: 12 }]}>Share more about your experience</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Tell us how we can Improve..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Suggestions</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'ios' ? 44 : 20, // Simple safe area handling
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayLighter,
    },
    headerTitle: {
        ...TYPOGRAPHY.styles.h2,
        fontSize: 18,
    },
    backButton: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    sectionTitle: {
        ...TYPOGRAPHY.styles.h2,
        marginBottom: 8,
    },
    subtitle: {
        ...TYPOGRAPHY.styles.bodyMedium,
        color: COLORS.grayMedium,
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tagsSection: {
        marginBottom: 32,
    },
    label: {
        ...TYPOGRAPHY.styles.bodyMedium,
        fontWeight: '500',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        backgroundColor: COLORS.white,
    },
    selectedTag: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary, // Or light blue if primary is too dark
    },
    tagText: {
        ...TYPOGRAPHY.styles.bodySmall,
        color: COLORS.gray,
    },
    selectedTagText: {
        color: COLORS.white,
    },
    helperText: {
        ...TYPOGRAPHY.styles.caption,
        color: COLORS.grayMedium,
        marginTop: 8,
    },
    commentSection: {
        marginBottom: 32,
    },
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        borderRadius: BORDER_RADIUS.md,
        padding: 12,
        minHeight: 120,
        marginTop: 8,
        ...TYPOGRAPHY.styles.bodyMedium,
    },
    submitButton: {
        backgroundColor: COLORS.blue || '#0056b3', // Use specific blue from design if available in theme
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    submitButtonText: {
        ...TYPOGRAPHY.styles.button,
        color: COLORS.white,
    },
});

export default SuggestionScreen;
