import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../context/TranslationContext';
import GlobalHeader from '../../components/GlobalHeader';

const GenericInfoScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { title, sections = [] } = route.params || {};

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={title || t('Information')}
                navigation={navigation}
                showBackButton={true}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {sections.length > 0 ? (
                    sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.heading}</Text>
                            <Text style={styles.sectionText}>{section.text}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>{t('No information available.')}</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 26,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 40,
    }
});

export default GenericInfoScreen;
