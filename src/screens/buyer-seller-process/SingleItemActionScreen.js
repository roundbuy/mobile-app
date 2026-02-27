import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

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

    // TODO: We need to pull dynamic step info, but currently we default to 1
    // A future step will pass down or fetch the actual live status.
    let currentStepIndex = 1;

    const activeTab = type || 'buying';
    const displayRole = activeTab === 'selling' ? 'SELLING' : 'BUYING';
    const otherUserRole = activeTab === 'selling' ? 'Buyer' : 'Seller';
    const headerTitleParam = activeTab === 'selling' ? 'Seller Actions' : 'Buyer Actions';

    const buyingSteps = [
        { id: 1, title: 'Buyer enquiries', actionDesc: 'Action ask photos or info!', route: 'Step1EnquiryScreen' },
        { id: 2, title: 'Make a Buyer Offer', actionDesc: 'Action make an offer', route: 'Step2OfferScreen' },
        { id: 3, title: 'Buyer pays the item', actionDesc: 'Action Buy the item', route: 'Step3DeliverySelectionScreen' },
        { id: 4, title: 'Schedule a Pick Up', actionDesc: 'Action chat & Schedule meet up', route: 'Step4ScheduleScreen' },
        { id: 5, title: 'Deal confirmation', actionDesc: 'Action pick up, inspect & confirm', route: 'Step5DealConfirmationScreen' },
        { id: 6, title: 'Give Feedback', actionDesc: 'Action rate & give feedback', route: 'Step5DealConfirmationScreen' }
    ];

    const sellingSteps = [
        { id: 1, title: 'Seller responses', actionDesc: 'Action provide photos or info!', route: 'Step1EnquiryScreen' },
        { id: 2, title: 'Accept, Decline an Offer', actionDesc: 'Action provide photos or info!', route: 'Step2OfferScreen' },
        { id: 3, title: 'Sold the item (escrow)', actionDesc: 'Action ? Wait until Bought', route: 'Step3DeliverySelectionScreen' },
        { id: 4, title: 'Schedule a Pick Up', actionDesc: 'Action chat & schedule meet up', route: 'Step4ScheduleScreen' },
        { id: 5, title: 'Deal confirmation', actionDesc: 'Action pick up, inspect & confirm', route: 'Step5DealConfirmationScreen' },
        { id: 6, title: 'Give Feedback', actionDesc: 'Action rate & give feedback', route: 'Step5DealConfirmationScreen' }
    ];

    const stepsList = activeTab === 'selling' ? sellingSteps : buyingSteps;

    const handleStepPress = (step) => {
        // We will pass the required data to the individual step screens
        const baseParams = {
            conversationId,
            advertisementId,
            title: itemTitle,
            offerAmount: itemPrice
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

                {/* Steps List */}
                <View style={styles.stepsContainer}>
                    {stepsList.map((step) => {
                        // For mockup purposes, if id < currentStepIndex it's Done, else Undone.
                        const isDone = step.id < currentStepIndex;
                        const statusColor = isDone ? '#45FF4E' : 'red'; // Done in light green, Undone in red
                        const statusText = isDone ? 'Done' : 'Undone';

                        return (
                            <TouchableOpacity
                                key={step.id}
                                style={styles.stepCard}
                                onPress={() => handleStepPress(step)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.stepNumberContainer}>
                                    <View style={styles.stepBadge}>
                                        <Text style={styles.stepNumber}>{step.id}.</Text>
                                        <Text style={styles.stepTextSmall}>Step</Text>
                                    </View>
                                </View>

                                <View style={styles.stepInfoContainer}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepDesc}>{step.actionDesc}</Text>
                                    <Text style={styles.stepStatus}>
                                        Action status: <Text style={{ color: statusColor, fontWeight: 'bold' }}>{statusText}</Text>
                                    </Text>
                                </View>

                                <View style={styles.stepArrow}>
                                    <Ionicons name="chevron-forward" size={32} color="#000" />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

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
        alignItems: 'center',
        overflow: 'hidden',
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
