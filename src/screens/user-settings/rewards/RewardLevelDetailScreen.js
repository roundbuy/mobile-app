import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Clipboard,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { rewardsService } from '../../../services/rewardsService';
import { getUserAdvertisements } from '../../../services/advertisementService';

const RewardLevelDetailScreen = ({ navigation, route }) => {
    const { reward } = route.params || {};
    const [activeTab, setActiveTab] = useState('Guide'); // Guide, Referral Code, Status, Redeem

    const [referralCode, setReferralCode] = useState('');
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(false);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                setLoading(true);
                const res = await rewardsService.getReferrals();
                if (res.success && res.data) {
                    setReferralCode(res.data.referralCode || '');
                    setReferrals(res.data.referrals || []);
                }
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReferrals();
    }, []);

    // Calculate progress (Max 5 for UI display)
    const requiredReferrals = reward?.requiredReferrals || 5;
    const progressCount = Math.min(reward?.progressCount || 0, requiredReferrals);
    const progressPercent = (progressCount / requiredReferrals) * 100;

    const generateStatusSteps = () => {
        // Find how many referrals we have
        const currentReferrals = referrals.length;

        // Create steps
        return Array.from({ length: requiredReferrals }).map((_, i) => {
            const referral = referrals[i];

            // Logic for text based on position
            let text = "Pending..."; // default
            if (referral) {
                text = "REFERRAL BINDING";
            } else if (i === currentReferrals) {
                // This is the EXACT next one they need
                const remaining = requiredReferrals - currentReferrals;
                text = `You need ${remaining} more`;
            }

            return {
                id: i + 1,
                text: text,
                username: referral ? referral.username : '',
                completed: !!referral,
                isNextNeeded: i === currentReferrals
            };
        });
    };

    const statusSteps = generateStatusSteps();

    const handleRedeemClick = async () => {
        setModalVisible(true);
        setLoadingAds(true);
        try {
            const response = await getUserAdvertisements({ status: 'active', limit: 20 });
            if (response.success && response.data) {
                setUserAds(response.data.advertisements || []);
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
            Alert.alert('Error', 'Failed to load your advertisements.');
        } finally {
            setLoadingAds(false);
        }
    };

    const confirmRedemption = async (productId) => {
        setRedeeming(true);
        try {
            const res = await rewardsService.redeemLevelReward(reward.id, productId);
            if (res.success) {
                Alert.alert("Success", "Visibility Boost applied successfully!");
                setModalVisible(false);
                // Ideally refresh reward state or go back
                navigation.goBack();
            } else {
                Alert.alert("Error", res.message || "Failed to redeem reward.");
            }
        } catch (error) {
            console.error('Error redeeming:', error);
            Alert.alert("Error", "Something went wrong during redemption.");
        } finally {
            setRedeeming(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const copyToClipboard = () => {
        Clipboard.setString(referralCode);
        Alert.alert("Copied", "Referral code copied to clipboard!");
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {['Guide', 'Referral Code', 'Status', 'Redeem'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderGuide = () => (
        <View style={styles.contentSection}>
            <Text style={styles.guideTitleLeft}>Start enjoying the full benefits now!</Text>
            <Text style={styles.guideSubtitleLeft}>
                Including: 2x additional product locations to advertise and for extra visibility. Cheaper prices. Plus much more!
            </Text>

            <View style={styles.guideStepCentered}>
                <View style={styles.stepCircleCentered}><Text style={styles.stepNumberCentered}>1</Text></View>
                <View style={styles.stepContentCentered}>
                    <Text style={styles.stepTitleCentered}>Become a Green member</Text>
                    <Text style={styles.stepDescriptionCentered}>
                        Register, create yourself a User Account, and start inviting your friends.
                    </Text>
                </View>
            </View>

            <View style={styles.guideStepCentered}>
                <View style={styles.stepCircleCentered}><Text style={styles.stepNumberCentered}>2</Text></View>
                <View style={styles.stepContentCentered}>
                    <Text style={styles.stepTitleCentered}>Give your Referral code to 5 friends</Text>
                    <Text style={styles.stepDescriptionCentered}>
                        Get five friends to subscribe for Green membership for free.
                    </Text>
                </View>
            </View>

            <View style={styles.guideStepCentered}>
                <View style={styles.stepCircleCentered}><Text style={styles.stepNumberCentered}>3</Text></View>
                <View style={styles.stepContentCentered}>
                    <Text style={styles.stepTitleCentered}>Earn reward, get Gold membership</Text>
                    <Text style={styles.stepDescriptionCentered}>
                        As you get your friends to subscribe, you earn a reward for yourself.
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.learnMoreLinkCenter}>
                <Text style={styles.learnMoreText}>Learn more about <Text style={styles.linkHighlight}>Rewards</Text></Text>
                <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginTop: 2 }} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setActiveTab('Referral Code')}
            >
                <Text style={styles.actionButtonText}>Start now</Text>
            </TouchableOpacity>
        </View>
    );

    const renderReferralCode = () => (
        <View style={styles.contentSection}>
            <Text style={styles.guideTitleLeft}>Start enjoying the full benefits now!</Text>
            <Text style={styles.guideSubtitleLeft}>
                Including: 2x additional product locations to advertise and for extra visibility. Cheaper prices. Plus much more!
            </Text>

            <View style={{ marginTop: 24 }}>
                <Text style={styles.guideTitleLeft}>Referral code</Text>
                <Text style={styles.guideSubtitleLeft}>
                    Give this referral code to 5 friends, and receive GOLD membership for free of charge.
                </Text>

                <View style={styles.codeContainer}>
                    <View style={styles.dashedLine} />
                    <View style={styles.scissorIconContainer}>
                        <Ionicons name="cut-outline" size={32} color="#505050" style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    <Text style={styles.codeText}>{referralCode || 'RB543229'}</Text>
                    <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                        {/* Optionally add a copy icon if desired, otherwise omitted as screenshot doesn't show it but functionality is useful */}
                    </TouchableOpacity>
                </View>
                <Text style={styles.uniqueLinkText}>Your unique referral code!</Text>
            </View>

            <TouchableOpacity style={styles.learnMoreLinkCenter}>
                <Text style={styles.learnMoreText}>Learn more about <Text style={styles.linkHighlight}>Rewards</Text></Text>
                <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginTop: 2 }} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setActiveTab('Status')}
            >
                <Text style={styles.actionButtonText}>Start now</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStatus = () => (
        <View style={styles.contentSection}>
            <View style={styles.levelProgressHeader}>
                <View style={styles.levelProgressBarBgV2}>
                    <View style={[styles.levelProgressBarFillV2, { width: `${progressPercent}%` }]} />
                    <View style={styles.levelProgressTextContainer}>
                        <Text style={styles.levelProgressTextV2}>{progressCount} of {requiredReferrals}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusListContainer}>
                {statusSteps.map((step, index) => (
                    <View key={step.id} style={styles.statusRow}>
                        <View style={styles.statusRowCircle}>
                            <Text style={styles.statusRowNumber}>{step.id}</Text>
                        </View>
                        <View style={styles.statusContent}>
                            {step.completed ? (
                                <>
                                    <Text style={styles.statusRowTitle}>REFERRAL CODE {referralCode ? referralCode.toUpperCase() : 'RBVYJFH9'}</Text>
                                    <Text style={styles.statusRowSubtitle}>username: {step.username || 'test11222'}</Text>
                                </>
                            ) : (
                                <Text style={styles.statusRowTextPending}>{step.text}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.learnMoreLinkCenter}>
                <Text style={styles.learnMoreText}>Learn more about <Text style={styles.linkHighlight}>Rewards</Text></Text>
                <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginTop: 2, marginLeft: 4 }} />
            </TouchableOpacity>
        </View>
    );

    const renderRedeem = () => (
        <View style={styles.contentSection}>
            <View style={styles.levelProgressHeader}>
                <View style={styles.levelProgressBarBgV2}>
                    <View style={[styles.levelProgressBarFillV2, { width: `${progressPercent}%` }]} />
                    <View style={styles.levelProgressTextContainer}>
                        <Text style={styles.levelProgressTextV2}>{progressCount} of {requiredReferrals}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusListContainer}>
                {statusSteps.map((step, index) => (
                    <View key={step.id} style={styles.statusRow}>
                        <View style={styles.statusRowCircle}>
                            <Text style={styles.statusRowNumber}>{step.id}</Text>
                        </View>
                        <View style={styles.statusContent}>
                            {step.completed ? (
                                <>
                                    <Text style={styles.statusRowTitle}>REFERRAL CODE {referralCode ? referralCode.toUpperCase() : 'RBVYJFH9'}</Text>
                                    <Text style={styles.statusRowSubtitle}>username: {step.username || 'test11222'}</Text>
                                </>
                            ) : (
                                <Text style={styles.statusRowTextPending}>{step.text}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.learnMoreLinkCenter}>
                <Text style={styles.learnMoreText}>Learn more about <Text style={styles.linkHighlight}>Rewards</Text></Text>
                <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginTop: 2, marginLeft: 4 }} />
            </TouchableOpacity>

            {progressCount >= requiredReferrals && !reward?.isRedeemed && (
                <>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <View style={styles.successIconContainerV2}>
                            <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            progressCount < requiredReferrals && { backgroundColor: '#ccc' }
                        ]}
                        disabled={progressCount < requiredReferrals || redeeming}
                        onPress={handleRedeemClick}
                    >
                        {redeeming ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.actionButtonText}>Redeem your reward</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}

            {reward?.isRedeemed && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View style={styles.successIconContainerV2}>
                        <Ionicons name="checkmark-circle" size={50} color="#ccc" />
                    </View>
                    <Text style={{ marginTop: 10, color: '#505050' }}>Already Redeemed</Text>
                </View>
            )}
        </View>
    );

    const renderAdModal = () => (
        <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select an Ad to Boost</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loadingAds ? (
                        <View style={styles.modalLoading}>
                            <ActivityIndicator size="large" color="#001F5F" />
                        </View>
                    ) : userAds.length === 0 ? (
                        <Text style={styles.noAdsText}>No active ads found to boost.</Text>
                    ) : (
                        <FlatList
                            data={userAds}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.adSelectionItem}
                                    onPress={() => confirmRedemption(item.id)}
                                    disabled={redeeming}
                                >
                                    {item.images && item.images.length > 0 ? (
                                        <Image source={{ uri: item.images[0].url }} style={styles.adThumbnail} />
                                    ) : (
                                        <View style={styles.adThumbnailPlaceholder}>
                                            <Ionicons name="image-outline" size={24} color="#ccc" />
                                        </View>
                                    )}
                                    <View style={styles.adInfo}>
                                        <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.adPrice}>£{item.price}</Text>
                                    </View>
                                    <View style={styles.adSelectBtn}>
                                        <Text style={styles.adSelectBtnText}>Select</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.adListContent}
                        />
                    )}

                    {redeeming && (
                        <View style={styles.redeemingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.redeemingText}>Redeeming...</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {reward?.title || 'Reward Details'} {reward?.points} pts
                </Text>
                <View style={{ width: 32 }} />
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'Guide' && renderGuide()}
                {activeTab === 'Referral Code' && renderReferralCode()}
                {activeTab === 'Status' && renderStatus()}
                {activeTab === 'Redeem' && renderRedeem()}
            </ScrollView>

            <TouchableOpacity style={styles.policyFooter}>
                <Text style={styles.policyText}>Read our <Text style={styles.policyLink}>Rewards Policy & Disclaimers</Text></Text>
                <Ionicons name="information-circle-outline" size={16} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {renderAdModal()}

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
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTabButton: {
        borderBottomWidth: 3,
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: '#909090',
    },
    activeTabText: {
        color: '#000',
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 20,
    },
    contentSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: '#505050',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    guideTitleLeft: {
        fontSize: 16,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#505050',
        marginBottom: 4,
        textAlign: 'left',
    },
    guideSubtitleLeft: {
        fontSize: 13,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: '#505050',
        textAlign: 'left',
        marginBottom: 32,
        lineHeight: 18,
    },
    guideStepCentered: {
        alignItems: 'center',
        marginBottom: 24,
    },
    stepCircleCentered: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#505050',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    stepNumberCentered: {
        fontSize: 22,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#303030',
    },
    stepContentCentered: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    stepTitleCentered: {
        fontSize: 15,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepDescriptionCentered: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: '#505050',
        lineHeight: 20,
        textAlign: 'center',
    },
    actionButton: {
        backgroundColor: '#001F5F', // Dark Blue
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 32,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    codeContainer: {
        backgroundColor: '#fff',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    dashedLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 1.5,
        borderColor: '#505050',
        borderStyle: 'dashed',
        borderRadius: 4,
    },
    scissorIconContainer: {
        position: 'absolute',
        top: -16,
        left: '50%',
        marginLeft: -20, // Half of expected width to truly center
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        zIndex: 10,
    },
    codeText: {
        fontSize: 36,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '900',
        color: '#505050',
        letterSpacing: 1,
    },
    copyButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        padding: 8,
    },
    uniqueLinkText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#505050',
        marginBottom: 20,
    },
    learnMoreLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    learnMoreText: {
        fontSize: 12,
        color: '#505050',
        marginRight: 4,
    },
    linkHighlight: {
        color: COLORS.primary, // Blue
        textDecorationLine: 'underline',
    },
    learnMoreLinkCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    levelProgressHeader: {
        marginBottom: 24,
    },
    levelProgressBarBgV2: {
        height: 44,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#a0a0a0',
        position: 'relative',
        overflow: 'hidden',
    },
    levelProgressBarFillV2: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#9e9e9e',
    },
    levelProgressTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    levelProgressTextV2: {
        fontSize: 18,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#000',
    },
    statusListContainer: {
        paddingVertical: 10,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    statusRowCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#505050',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    statusRowNumber: {
        fontSize: 18,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '800',
        color: '#303030',
    },
    statusContent: {
        flex: 1,
        justifyContent: 'center',
    },
    statusRowTitle: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '700',
        color: '#303030',
        marginBottom: 4,
    },
    statusRowSubtitle: {
        fontSize: 13,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: '#505050',
    },
    statusRowTextPending: {
        fontSize: 15,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        fontWeight: '700',
        color: '#505050',
    },
    successIconContainerV2: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        backgroundColor: '#fafafa',
        borderRadius: 12,
        marginVertical: 16,
    },
    policyFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    policyText: {
        fontSize: 10,
        color: '#909090',
    },
    policyLink: {
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '70%',
        paddingVertical: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    modalLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noAdsText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#505050',
    },
    adListContent: {
        padding: 20,
    },
    adSelectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    adThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    adThumbnailPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    adInfo: {
        flex: 1,
    },
    adTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    adPrice: {
        fontSize: 14,
        color: '#4CAF50', // Green
        fontWeight: '700',
    },
    adSelectBtn: {
        backgroundColor: '#001F5F',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    adSelectBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    redeemingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,31,95,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    redeemingText: {
        color: '#fff',
        marginTop: 12,
        fontWeight: '600',
    }
});

export default RewardLevelDetailScreen;
