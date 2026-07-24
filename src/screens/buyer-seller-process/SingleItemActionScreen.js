import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

const SingleItemActionScreen = ({ navigation, route }) => {
    const {
        conversationId,
        advertisementId,
        itemTitle,
        itemPrice,
        itemImage,
        otherUserName,
        type
    } = route?.params || {};

    const handleBack = () => {
        navigation.goBack();
    };

    if (!conversationId) return <View />;

    const [actionStatus, setActionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (conversationId) {
            fetchActionStatus();
        }
    }, [conversationId]);

    const fetchActionStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/buyer-seller/action-status/${conversationId}`);
            if (res.data.success) {
                setActionStatus(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch action status:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeTab = type || 'buying';
    const displayRole = activeTab === 'selling' ? 'SELLING' : 'BUYING';
    const otherUserRole = activeTab === 'selling' ? 'Buyer' : 'Seller';
    const headerTitleParam = activeTab === 'selling' ? 'Seller Actions' : 'Buyer Actions';

    const buyingSteps = [
        { id: 1, title: 'Buyer enquiries', actionDesc: 'Action ask photos or info!', route: 'Step1EnquiryScreen' },
        { id: 2, title: 'Make a Buyer Offer', actionDesc: 'Action make an offer', route: 'Step1EnquiryScreen' },
        { id: 3, title: 'Buyer pays the item', actionDesc: 'Action Buy the item', route: 'Step3DeliverySelectionScreen' },
        { id: 4, title: 'Schedule a Pick Up', actionDesc: 'Action chat & Schedule meet up', route: 'Step4ScheduleScreen' },
        { id: 5, title: 'Deal confirmation', actionDesc: 'Action pick up, inspect & confirm', route: 'Step5DealConfirmationScreen' },
        { id: 6, title: 'Give Feedback', actionDesc: 'Action rate & give feedback', route: 'GiveFeedbackForm' }
    ];

    const sellingSteps = [
        { id: 1, title: 'Seller responses', actionDesc: 'Action provide photos or info!', route: 'Step1EnquiryScreen' },
        { id: 2, title: 'Accept, Decline an Offer', actionDesc: 'Action provide photos or info!', route: 'Step1EnquiryScreen' },
        { id: 3, title: 'Sold the item (escrow)', actionDesc: 'Action ? Wait until Bought', route: 'Step3DeliverySelectionScreen' },
        { id: 4, title: 'Schedule a Pick Up', actionDesc: 'Action chat & schedule meet up', route: 'Step4ScheduleScreen' },
        { id: 5, title: 'Deal confirmation', actionDesc: 'Action pick up, inspect & confirm', route: 'Step5DealConfirmationScreen' },
        { id: 6, title: 'Give Feedback', actionDesc: 'Action rate & give feedback', route: 'GiveFeedbackForm' }
    ];

    const allSteps = activeTab === 'selling' ? sellingSteps : buyingSteps;

    // Merge pairs: [1+2], [3+4], [5+6]
    const mergedSteps = [
        { id: 1, sub: [allSteps[0], allSteps[1]] },
        { id: 2, sub: [allSteps[2], allSteps[3]] },
        { id: 3, sub: [allSteps[4], allSteps[5]] },
    ];

    const handleStepPress = (step) => {
        // Validation: Step 4 (Schedule Pick Up) is only available if 'pickup' was selected
        if (step.id === 4 && actionStatus?.meta?.deliveryOption && actionStatus.meta.deliveryOption !== 'pickup') {
            Alert.alert(
                "Pick Up Unavailable",
                "This order was checked out using a different delivery method (e.g. Courier), so pick up scheduling is disabled."
            );
            return;
        }

        // Validation: Rule 7 (Step 6 is locked until Step 5 is complete)
        if (step.id === 6 && actionStatus && !actionStatus.step5) {
            Alert.alert(
                "Action Required",
                "You cannot leave feedback until the Deal Confirmation (Step 5) is completed by both parties."
            );
            return;
        }

        // We will pass the required data to the individual step screens
        const baseParams = {
            conversationId,
            advertisementId,
            title: itemTitle,
            offerAmount: itemPrice,
            itemImage,
            role: activeTab, // 'buying' or 'selling'
            otherUserName,
            // Mapped attributes for legacy screens (Step 4 and Step 6)
            offerId: actionStatus?.meta?.offerId,
            advertisementTitle: itemTitle,
            reviewedUserId: activeTab === 'buying' ? actionStatus?.meta?.sellerId : actionStatus?.meta?.buyerId,
            transactionType: activeTab === 'buying' ? 'buy' : 'sell',
            images: [itemImage]
        };

        navigation.navigate(step.route, baseParams);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    <Text style={styles.headerTitle}>{headerTitleParam}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Product Info */}
                        <View style={styles.productHeader}>
                            <Image source={{ uri: itemImage || 'https://via.placeholder.com/80' }} style={styles.productImage} />
                            <View style={styles.productDetails}>
                                <Text style={styles.productTitle} numberOfLines={2}>{itemTitle}</Text>
                                <Text style={styles.productPrice}>£{itemPrice || '0.00'}</Text>
                                <Text style={styles.productUser}>{otherUserRole}: {otherUserName}</Text>
                            </View>
                        </View>

                        {/* Role Label */}
                        <Text style={styles.roleLabel}>{displayRole}</Text>

                        {/* Steps List — merged pairs */}
                        <View style={styles.stepsContainer}>
                            {mergedSteps.map((mergedStep) => (
                                <View key={mergedStep.id} style={styles.stepCard}>
                                    {/* Step number column — spans full card height */}
                                    <View style={styles.stepNumberContainer}>
                                        <View style={styles.stepBadge}>
                                            <Text style={styles.stepNumber}>{mergedStep.id}.</Text>
                                            <Text style={styles.stepTextSmall}>Step</Text>
                                        </View>
                                    </View>

                                    {/* Sub-steps column */}
                                    <View style={styles.subStepsColumn}>
                                        {mergedStep.sub.map((sub, idx) => {
                                            const isDone = actionStatus ? actionStatus[`step${sub.id}`] : false;
                                            return (
                                                <TouchableOpacity
                                                    key={sub.id}
                                                    style={[styles.subStepRow, idx > 0 && styles.subStepDivider]}
                                                    onPress={() => handleStepPress(sub)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.stepInfoContainer}>
                                                        <Text style={styles.stepTitle}>{sub.title}</Text>
                                                        <Text style={styles.stepDesc}>{sub.actionDesc}</Text>
                                                        <Text style={styles.stepStatus}>
                                                            Action status:{' '}
                                                            <Text style={{ color: isDone ? '#45FF4E' : 'red', fontWeight: 'bold' }}>
                                                                {isDone ? 'Done' : 'Undone'}
                                                            </Text>
                                                        </Text>
                                                    </View>
                                                    <View style={styles.stepArrow}>
                                                        <Ionicons name="chevron-forward" size={28} color="#000" />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Read our <Text style={styles.footerLinkText}>Safety Guidelines & Disclaimers</Text>
                    </Text>
                </View>
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
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    productHeader: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    productDetails: {
        marginLeft: 16,
        justifyContent: 'center',
        flex: 1,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    productUser: {
        fontSize: 14,
        color: '#666',
    },
    roleLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    stepsContainer: {
        marginBottom: 30,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
        overflow: 'hidden',
    },
    subStepsColumn: {
        flex: 1,
    },
    subStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    subStepDivider: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    stepNumberContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        alignSelf: 'stretch',
    },
    stepBadge: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    stepTextSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    stepInfoContainer: {
        flex: 1,
        padding: 12,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    stepDesc: {
        fontSize: 12,
        color: '#444',
        marginBottom: 4,
    },
    stepStatus: {
        fontSize: 12,
        color: '#000',
    },
    stepArrow: {
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    footerLink: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#000',
    },
    footerLinkText: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
});

export default SingleItemActionScreen;
