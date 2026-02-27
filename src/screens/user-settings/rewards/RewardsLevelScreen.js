import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { rewardsService } from '../../../services/rewardsService';

const { width } = Dimensions.get('window');

const RewardsLevelScreen = ({ navigation }) => {
    // Dynamic Data States
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("User");
    const [userPoints, setUserPoints] = useState(0);
    const [lifetimePoints, setLifetimePoints] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1); // 1: Beginner, 2: Advanced, 3: Exclusive

    const [rewardsData, setRewardsData] = useState({
        beginner: [],
        advanced: [],
        exclusive: []
    });

    // Accordion State
    const [expandedLevels, setExpandedLevels] = useState({
        1: true,
        2: false,
        3: false,
    });

    const fetchLevelData = async () => {
        try {
            setLoading(true);
            const statusRes = await rewardsService.getLevelStatus();
            const rewardsRes = await rewardsService.getLevelRewards();

            if (statusRes.success && statusRes.data) {
                // Map level string to number for UI consistency
                const lv = statusRes.data.currentLevel;
                const levelNum = lv === 'exclusive' ? 3 : (lv === 'advanced' ? 2 : 1);

                setUserPoints(statusRes.data.currentPoints);
                setLifetimePoints(statusRes.data.lifetimePoints);
                setCurrentLevel(levelNum);
                if (statusRes.data.userName) {
                    setUserName(statusRes.data.userName);
                }

                // Keep the current level open by default
                setExpandedLevels({ 1: levelNum === 1, 2: levelNum === 2, 3: levelNum === 3 });
            }

            if (rewardsRes.success && rewardsRes.data) {
                setRewardsData({
                    beginner: rewardsRes.data.beginner || [],
                    advanced: rewardsRes.data.advanced || [],
                    exclusive: rewardsRes.data.exclusive || []
                });
            }
        } catch (error) {
            console.error('Error fetching level data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLevelData();
        }, [])
    );

    const toggleLevel = (level) => {
        setExpandedLevels((prev) => ({
            ...prev,
            [level]: !prev[level],
        }));
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderProgressBar = () => {
        // Determine progress based on points (Logic can be refined later)
        // For now, static 1000 pts for Level 2 view
        const maxPoints = 1000;
        const progress = Math.min(userPoints / maxPoints, 1);

        return (
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                    {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((val, index) => (
                        <Text key={index} style={styles.progressLabelText}>{val}</Text>
                    ))}
                </View>
            </View>
        );
    };

    const renderRewardItem = (item) => {
        const isComplete = item.progressCount >= item.requiredReferrals;
        const isEarnableOnceRedeemed = item.isEarnableOnce && item.isRedeemed;

        let ActionComponent = null;
        if (isEarnableOnceRedeemed) {
            ActionComponent = <Text style={styles.earnableOnceText}>Earnable once</Text>;
        } else if (isComplete && !item.isRedeemed) {
            ActionComponent = <Text style={styles.redeemNowText}>Redeem now!</Text>;
        } else if (!item.isEarnableOnce && item.isRedeemed) {
            ActionComponent = <Text style={styles.earnableOnceText}>Earnable repeatedly</Text>;
        }

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.rewardItem, isEarnableOnceRedeemed && styles.rewardItemDisabled]}
                onPress={() => {
                    if (!isEarnableOnceRedeemed) {
                        if (item.type === 'level_reward' || item.type === 'level') {
                            navigation.navigate('RewardLevelDetail', { reward: item });
                        } else if (item.type === 'lottery') {
                            navigation.navigate('RewardCategoryDetail', { category: { ...item, name: item.title, description: item.subtitle } });
                        } else {
                            navigation.navigate('RewardCategoryDetail', { category: { ...item, name: item.title, description: item.subtitle } });
                        }
                    }
                }}
                activeOpacity={isEarnableOnceRedeemed ? 1 : 0.7}
            >
                <View style={[styles.pointsBadge, isEarnableOnceRedeemed && styles.pointsBadgeDisabled]}>
                    <Text style={styles.pointsBadgeValue}>{item.points}</Text>
                    <Text style={styles.pointsBadgeLabel}>pts</Text>
                </View>
                <View style={styles.rewardContent}>
                    <View style={styles.rewardTitleRow}>
                        <Text style={styles.rewardTitle}>{item.title}</Text>
                        {ActionComponent}
                    </View>
                    <Text style={styles.rewardSubtitle}>{item.subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderLevelSection = (level, title, description, rewards) => {
        const isExpanded = expandedLevels[level];

        return (
            <View style={styles.levelSection}>
                <TouchableOpacity
                    style={styles.levelHeader}
                    onPress={() => toggleLevel(level)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.levelHeaderTitle}>{title}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#000"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.levelBody}>
                        <Text style={styles.levelDescription}>{description}</Text>
                        {rewards.map(renderRewardItem)}
                    </View>
                )}
            </View>
        );
    };

    // Removed dummy rewards data array definitions

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Welcome {userName} to collect{'\n'}points and earn rewards
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Points Balance Section */}
                <View style={styles.balanceSection}>
                    <Text style={styles.sectionTitle}>Points Balance</Text>

                    <View style={styles.balanceRow}>
                        <View>
                            <Text style={[styles.levelText, currentLevel === 1 && styles.activeLevelText]}>
                                Level 1: Beginner
                            </Text>
                            <Text style={[styles.levelText, currentLevel === 2 && styles.activeLevelText]}>
                                Level 2: Advanced
                            </Text>
                            <Text style={[styles.levelText, currentLevel === 3 && styles.activeLevelText]}>
                                Level 3: Exclusive
                            </Text>
                        </View>
                        <View style={styles.pointsDisplay}>
                            <Text style={styles.pointsValue}>{userPoints} <Text style={styles.ptsLabel}>pts</Text></Text>
                            <Text style={styles.pointsLabel}>Current Points</Text>
                            {lifetimePoints > 0 && (
                                <Text style={styles.lifetimePointsLabel}>{lifetimePoints} Lifetime Pts</Text>
                            )}
                        </View>
                    </View>

                    {renderProgressBar()}
                </View>

                {/* Rewards Section */}
                <View style={styles.rewardsSection}>
                    <Text style={styles.sectionTitle}>Rewards you can earn with points</Text>

                    {renderLevelSection(
                        1,
                        "LEVEL 1: BEGINNER",
                        "Level 1 Beginner starts earning points from zero. You have six different rewards. There is no order of completion. Some you can earn once, while others repeatedly. Begin by choosing one below:",
                        rewardsData.beginner
                    )}

                    {renderLevelSection(
                        2,
                        "LEVEL 2: ADVANCED",
                        "Advanced Level unlocks better rewards. Maintain points every year to stay here.",
                        rewardsData.advanced
                    )}

                    {renderLevelSection(
                        3,
                        "LEVEL 3: EXCLUSIVE",
                        "Exclusive rewards for top tier members.",
                        rewardsData.exclusive
                    )}
                </View>

                {/* Footer Link */}
                <TouchableOpacity style={styles.policyFooter}>
                    <Text style={styles.policyText}>Read our <Text style={styles.policyLink}>Rewards Policy & Disclaimers</Text></Text>
                    <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginLeft: 4 }} />
                </TouchableOpacity>

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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 0,
        marginTop: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        flex: 1,
        lineHeight: 24,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    balanceSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    levelText: {
        fontSize: 14,
        color: '#505050',
        marginBottom: 4,
    },
    activeLevelText: {
        color: '#45FF4E', // Green color
        fontWeight: '700',
    },
    pointsDisplay: {
        alignItems: 'flex-end',
    },
    pointsValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000',
    },
    ptsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    pointsLabel: {
        fontSize: 12,
        color: '#505050',
    },
    lifetimePointsLabel: {
        fontSize: 10,
        color: '#909090',
        marginTop: 2,
    },
    progressBarContainer: {
        marginTop: 10,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#000', // Black progress bar as per design
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        fontSize: 8,
        color: '#909090',
    },
    rewardsSection: {
        padding: 20,
    },
    levelSection: {
        marginBottom: 24,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    levelHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        textTransform: 'uppercase',
    },
    levelDescription: {
        fontSize: 13,
        color: '#505050',
        lineHeight: 18,
        marginBottom: 16,
    },
    levelBody: {
        // 
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
    },
    pointsBadge: {
        width: 48,
        height: 48,
        backgroundColor: '#001F5F', // Dark Blue
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pointsBadgeValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pointsBadgeLabel: {
        color: '#fff',
        fontSize: 10,
    },
    rewardContent: {
        flex: 1,
    },
    rewardTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        flexShrink: 1,
        marginRight: 8,
    },
    rewardSubtitle: {
        fontSize: 11,
        color: '#505050',
        lineHeight: 14,
    },
    redeemNowText: {
        color: '#45FF4E',
        fontWeight: '700',
        fontSize: 12,
    },
    earnableOnceText: {
        color: '#909090',
        fontWeight: '600',
        fontSize: 12,
    },
    rewardItemDisabled: {
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
    },
    pointsBadgeDisabled: {
        backgroundColor: '#a0a0a0',
    },
    policyFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    policyText: {
        fontSize: 12,
        color: '#000',
    },
    policyLink: {
        textDecorationLine: 'underline',
        fontWeight: '600',
    }
});

export default RewardsLevelScreen;
