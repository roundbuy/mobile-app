import React from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const IssueDisputeSellerReasonsScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { issueId, issueNumber } = route.params || {};

    const handleNext = () => {
        navigation.navigate('IssueDisputeEligibility', { issueId, issueNumber });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dispute {issueNumber}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <FontAwesome name="clipboard" size={60} color="#666" />
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{t('Reason for Seller Disputes')}</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{t('Find out the eligibility criteria for Buyer to Buyer Disputes')}</Text>

                {/* Information List */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionHeader}>{t('The buyer can escalate the exchange into a dispute if:')}</Text>

                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('The buyer has not responded to the exchange request within the specified timeframe (e.g., 3 days).')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Significantly different: The item is not as what was described in the exchange listing.')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t("The buyer's response does not address the seller's concerns or is not satisfactory.")}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Condition Mismatched: Received an item that is in a significantly worse condition than it was described in the exchange listing.')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Communication breakdown: The buyer is unresponsive or unwilling to cooperate in resolving the issue.')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Evidence of fraud or misrepresentation by the buyer.')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('The seller has provided all necessary evidence and documentation to support their claim.')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Escalate Delayed & Incorrect product: Allegations where the seller did not receive the item or received an item that was not as described.')}</Text>
                    </View>
                </View>

                {/* Info Link */}
                <View style={styles.infoLinkContainer}>
                    <Text style={styles.infoLinkText}>
                        More information on Issues & Disputes,{' '}
                        <Text style={styles.infoLinkHighlight}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                </View>

                {/* Progress Dots */}
                <View style={styles.progressContainer}>
                    <View key="dot-1" style={styles.dot} />
                    <View key="dot-2" style={styles.dot} />
                    <View key="dot-3" style={[styles.dot, styles.dotActive]} />
                    <View key="dot-4" style={styles.dot} />
                </View>

                {/* Read More Button */}
                <TouchableOpacity style={styles.readMoreButton} onPress={handleNext}>
                    <Text style={styles.readMoreText}>{t('Read more')}</Text>
                </TouchableOpacity>

                {/* Note */}
                <Text style={styles.note}>{t('Only one is shown for dispute escalation shown in the')}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerBackButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 28,
        right: '38%',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    infoSection: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    bullet: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    infoLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 24,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
    },
    infoLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 6,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#CCC',
    },
    dotActive: {
        backgroundColor: '#666',
    },
    readMoreButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    readMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    note: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
});

export default IssueDisputeSellerReasonsScreen;
