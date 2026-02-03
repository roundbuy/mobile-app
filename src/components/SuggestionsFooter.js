import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/TranslationContext';

const SuggestionsFooter = ({ sourceRoute }) => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <View style={styles.suggestionsFooter}>
            <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionsTitle}>{t('account.suggestions_title', 'How can we improve?')}</Text>
                <Text style={styles.suggestionsSubtitle}>{t('account.suggestions_desc', 'We welcome your feedback.')}</Text>
            </View>
            <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => navigation.navigate('Suggestion', { sourceRoute: sourceRoute || 'Unknown' })}
            >
                <Text style={styles.suggestionButtonText}>{t('account.give_suggestion', 'Give Suggestion')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    suggestionsFooter: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
    },
    suggestionTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    suggestionsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    suggestionsSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    suggestionButton: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    suggestionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SuggestionsFooter;
