import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { feedbackService } from '../../services';

const UserFeedbacksScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { userId, userName } = route.params;
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserFeedbacks();
    }, []);

    const fetchUserFeedbacks = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch feedbacks for the specific user
            const response = await feedbackService.getUserFeedbacks(userId, 50, 0);

            if (response.success) {
                setFeedbacks(response.data.feedbacks || []);
                setStats(response.data.stats || {
                    totalFeedbacks: 0,
                    averageRating: 0,
                    positivePercentage: 0,
                    negativePercentage: 0,
                    neutralPercentage: 0
                });
            } else {
                setError(response.message || 'Failed to load feedbacks');
            }
        } catch (err) {
            console.error('Error fetching user feedbacks:', err);
            setError(err.message || 'Failed to load feedbacks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserFeedbacks();
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                    <Ionicons
                        key={index}
                        name={index < rating ? 'star' : 'star-outline'}
                        size={20}
                        color="#FFD700"
                    />
                ))}
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('Loading feedbacks...')}</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#999" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUserFeedbacks}>
                        <Text style={styles.retryButtonText}>{t('Retry')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Description */}
                <Text style={styles.description}>
                    Feedbacks received by {userName || 'this user'} from other users.
                </Text>

                {/* Stats Section */}
                {stats && stats.totalFeedbacks > 0 && (
                    <>
                        <View style={styles.statsSection}>
                            <Text style={styles.statsTitle}>{t('Feedbacks by type:')}</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>{t('Positive')}</Text>
                                    <Text style={styles.statValue}>{stats.positivePercentage}%</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>{t('Negative')}</Text>
                                    <Text style={styles.statValue}>{stats.negativePercentage}%</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>{t('Neutral')}</Text>
                                    <Text style={styles.statValue}>{stats.neutralPercentage}%</Text>
                                </View>
                            </View>
                        </View>

                        {/* Rating Section */}
                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingText}>Rating {parseFloat(stats.averageRating).toFixed(1)}</Text>
                            {renderStars(Math.round(parseFloat(stats.averageRating)))}
                        </View>
                    </>
                )}

                {/* Feedbacks List */}
                {feedbacks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#999" />
                        <Text style={styles.emptyTitle}>{t('No Feedbacks Yet')}</Text>
                        <Text style={styles.emptyText}>{t("This user hasn't received any feedbacks yet.")}</Text>
                    </View>
                ) : (
                    feedbacks.map((feedback) => (
                        <View key={feedback.id} style={styles.feedbackCard}>
                            {renderStars(feedback.rating)}
                            <Text style={styles.commentText}>{feedback.comment}</Text>
                            <View style={styles.userInfo}>
                                <View style={styles.userLeft}>
                                    <View style={styles.avatar}>
                                        <FontAwesome name="user-circle" size={40} color="#666" />
                                    </View>
                                    <View>
                                        <Text style={styles.username}>{feedback.reviewer.name}</Text>
                                        <Text style={styles.dateText}>
                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productLabel}>{t('Product')}</Text>
                                    <Text style={styles.productCode} numberOfLines={1}>
                                        {feedback.advertisement.title}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{userName}'s Feedbacks</Text>
                <View style={styles.headerRight} />
            </View>

            {renderContent()}
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
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: COLORS.primary,
        borderRadius: 6,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    statsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ratingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginRight: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    feedbackCard: {
        backgroundColor: '#f8f8f8',
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    commentText: {
        fontSize: 14,
        color: '#000',
        marginVertical: 12,
        lineHeight: 20,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        marginRight: 12,
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    productInfo: {
        alignItems: 'flex-end',
    },
    productLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    productCode: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        maxWidth: 120,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default UserFeedbacksScreen;
