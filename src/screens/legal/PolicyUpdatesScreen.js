import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const PolicyUpdatesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [policyUpdates, setPolicyUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        // Simulate fetching policy updates
        // In production, this would fetch from an API
        fetchPolicyUpdates();
    }, []);

    const fetchPolicyUpdates = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock data - in production, this would come from backend
            const updates = [
                {
                    id: 1,
                    policyName: 'Privacy Policy',
                    updateDate: '2026-01-16',
                    version: '3.2',
                    changes: [
                        'Chapter 11 changed - Updated data retention policies',
                        'Added new section on AI-powered features',
                        'Clarified third-party data sharing practices',
                        'Updated contact information for data protection officer',
                    ],
                    isImportant: true,
                },
                {
                    id: 2,
                    policyName: 'Terms & Conditions',
                    updateDate: '2026-01-10',
                    version: '2.8',
                    changes: [
                        'Section 5.3 modified - Updated refund policy',
                        'Added new dispute resolution procedures',
                        'Clarified user responsibilities for content',
                    ],
                    isImportant: false,
                },
                {
                    id: 3,
                    policyName: 'Cookies Policy',
                    updateDate: '2026-01-05',
                    version: '1.5',
                    changes: [
                        'Updated list of cookies used',
                        'Added information about analytics cookies',
                        'Clarified cookie consent management',
                    ],
                    isImportant: false,
                },
                {
                    id: 4,
                    policyName: 'Content & Moderation Policy',
                    updateDate: '2025-12-20',
                    version: '2.1',
                    changes: [
                        'Enhanced community guidelines',
                        'Updated prohibited content categories',
                        'Added AI moderation disclosure',
                    ],
                    isImportant: false,
                },
                {
                    id: 5,
                    policyName: 'Subscriptions & Billing Policy',
                    updateDate: '2025-12-15',
                    version: '1.9',
                    changes: [
                        'Removed Google Pay as payment method',
                        'Updated billing cycle information',
                        'Clarified auto-renewal terms',
                    ],
                    isImportant: true,
                },
            ];

            setPolicyUpdates(updates);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching policy updates:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleViewPolicy = (policyName) => {
        // Map policy names to policy types
        const policyTypeMap = {
            'Privacy Policy': 'privacy',
            'Terms & Conditions': 'terms',
            'Cookies Policy': 'cookies',
            'Content & Moderation Policy': 'content_moderation',
            'Subscriptions & Billing Policy': 'subscriptions',
        };

        const policyType = policyTypeMap[policyName];
        if (policyType) {
            navigation.navigate('PolicyDetail', { policyType, title: policyName });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Policy Updates')}</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Policy Updates')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Policy List */}
                <View style={styles.policiesContainer}>
                    {policyUpdates.map((update) => (
                        <View key={update.id} style={styles.policyCard}>
                            {/* Main Item */}
                            <TouchableOpacity
                                style={styles.policyItem}
                                onPress={() => toggleExpand(update.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.policyInfo}>
                                    <View style={styles.policyTitleRow}>
                                        <Text style={styles.policyText}>{update.policyName}</Text>
                                        {update.isImportant && (
                                            <View style={styles.importantBadge}>
                                                <Text style={styles.importantText}>{t('Important')}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.policyMeta}>
                                        <Text style={styles.updateDate}>Updated {formatDate(update.updateDate)}</Text>
                                        <Text style={styles.versionText}>v{update.version}</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={expandedId === update.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#191919ff"
                                />
                            </TouchableOpacity>

                            {/* Expanded Content */}
                            {expandedId === update.id && (
                                <View style={styles.expandedContent}>
                                    <Text style={styles.changesTitle}>{t('What Changed:')}</Text>
                                    {update.changes.map((change, index) => (
                                        <View key={index} style={styles.changeItem}>
                                            <View style={styles.bulletPoint} />
                                            <Text style={styles.changeText}>{change}</Text>
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={styles.viewPolicyButton}
                                        onPress={() => handleViewPolicy(update.policyName)}
                                    >
                                        <Text style={styles.viewPolicyText}>{t('View Full Policy')}</Text>
                                        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{t('You will be notified of significant policy changes via email and in-app notifications.')}</Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 32,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    policiesContainer: {
        marginBottom: 20,
    },
    policyCard: {
        marginBottom: 0,
    },
    policyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    policyInfo: {
        flex: 1,
    },
    policyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    policyText: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
    },
    importantBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    importantText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#F57C00',
    },
    policyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    updateDate: {
        fontSize: 13,
        color: '#191919ff',
    },
    versionText: {
        fontSize: 12,
        color: 'rgba(153, 153, 153, 1)919ff',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    expandedContent: {
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    changesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    changeItem: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    bulletPoint: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.primary,
        marginTop: 6,
        marginRight: 10,
    },
    changeText: {
        flex: 1,
        fontSize: 13,
        color: '#191919ff',
        lineHeight: 20,
    },
    viewPolicyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 6,
        gap: 6,
    },
    viewPolicyText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        padding: 14,
        borderRadius: 6,
        marginBottom: 20,
        gap: 10,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#191919ff',
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default PolicyUpdatesScreen;
