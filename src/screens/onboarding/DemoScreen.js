import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../context/TranslationContext';

const DemoScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const handleStartDemo = () => {
        // Navigate to the main app or tutorial
        navigation.replace('ATTPrompt');
    };

    const handleBackToInfo = () => {
        navigation.goBack();
    };

    return (
        <SafeScreenContainer>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackToInfo} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Demo Mode')}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="play-circle" size={80} color={COLORS.primary} />
                    </View>

                    <Text style={styles.title}>{t('Experience RoundBuy')}</Text>

                    <Text style={styles.description}>{t('Explore the app with sample data and see how RoundBuy can help you save money while shopping.')}</Text>

                    <View style={styles.featuresContainer}>
                        <View style={styles.demoFeature}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                            <Text style={styles.demoFeatureText}>{t('Browse sample products')}</Text>
                        </View>

                        <View style={styles.demoFeature}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                            <Text style={styles.demoFeatureText}>{t('See how round-up savings work')}</Text>
                        </View>

                        <View style={styles.demoFeature}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                            <Text style={styles.demoFeatureText}>{t('Test the buying process')}</Text>
                        </View>

                        <View style={styles.demoFeature}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                            <Text style={styles.demoFeatureText}>{t('Explore all features')}</Text>
                        </View>
                    </View>

                    <View style={styles.noteContainer}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.noteText}>{t('Demo mode uses sample data. No real transactions will be made.')}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartDemo}
                    >
                        <Text style={styles.startButtonText}>{t('Start Demo')}</Text>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBackToInfo}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelButtonText}>{t('Back')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        marginBottom: SPACING.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        fontWeight: '400',
        color: '#4a4a4a',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.sm,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: SPACING.xl,
    },
    demoFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    demoFeatureText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
        marginLeft: SPACING.md,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f7ff',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#4a4a4a',
        marginLeft: SPACING.sm,
        lineHeight: 20,
    },
    footer: {
        paddingTop: SPACING.lg,
        marginTop: 'auto',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        gap: SPACING.sm,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    cancelButton: {
        width: '100%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 26,
        marginBottom: SPACING.md,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        letterSpacing: 0.2,
    },
});

export default DemoScreen;
