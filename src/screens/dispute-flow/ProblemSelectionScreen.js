import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ProblemSelectionScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { disputeType } = route.params;
    const [selectedProblems, setSelectedProblems] = useState([]);

    // Different problems based on dispute type
    const getProblems = () => {
        switch (disputeType) {
            case 'transaction':
                return [
                    {
                        id: 'unauthorized_transaction',
                        title: 'Unauthorized transaction',
                        subtitle: 'An unauthorized payment was made by me',
                        icon: 'alert-circle',
                    },
                    {
                        id: 'duplicate_payment',
                        title: 'Duplicate payment',
                        subtitle: 'An extra payment for same amount on this charge',
                        icon: 'copy',
                    },
                    {
                        id: 'refund_buyer_fee',
                        title: "Request refund for buyer's fee",
                        subtitle: 'An exchange was not completed',
                        icon: 'cash',
                    },
                    {
                        id: 'refund_plan',
                        title: 'Request refund for a plan',
                        subtitle: 'An exchange was not completed',
                        icon: 'card',
                    },
                    {
                        id: 'refund_paid_ad',
                        title: 'Request refund for an paid ad',
                        subtitle: 'A refund for unpaid paid ads',
                        icon: 'megaphone',
                    },
                    {
                        id: 'something_else',
                        title: 'Something else?',
                        subtitle: 'A transaction problem of different kind',
                        icon: 'ellipsis-horizontal',
                    },
                ];
            case 'buyer_initiated':
                return [
                    {
                        id: 'item_not_described',
                        title: 'Item Not as Described',
                        subtitle: 'The received item is significantly different, damaged counterfeit, or misrepresented etc',
                        icon: 'alert-circle',
                    },
                    {
                        id: 'item_not_received',
                        title: 'Item Not Received',
                        subtitle: 'An item never exchanged, arrival due to loss, theft, delivery problems etc',
                        icon: 'cube',
                    },
                    {
                        id: 'refund_from_seller',
                        title: 'Request refund from the Seller',
                        subtitle: 'An exchange was not completed or an issues discovered after exchange & negotiation',
                        icon: 'cash',
                    },
                    {
                        id: 'missing_refund',
                        title: 'Missing refund or credit',
                        subtitle: 'Buyer didn\'t get expected refund or credit after return or cancellation',
                        icon: 'card',
                    },
                    {
                        id: 'change_of_mind',
                        title: 'Change of mind & cancellation',
                        subtitle: 'Buyer wants to cancel or return an item even if seller agreed',
                        icon: 'close-circle',
                    },
                    {
                        id: 'something_else',
                        title: 'Something else?',
                        subtitle: 'A transaction problem of different kind',
                        icon: 'ellipsis-horizontal',
                    },
                ];
            case 'seller_initiated':
                return [
                    {
                        id: 'buyer_not_paying',
                        title: 'Buyer Not Paying',
                        subtitle: 'Buyer committed to purchase but hasn\'t paid',
                        icon: 'cash',
                    },
                    {
                        id: 'buyer_returned_item',
                        title: 'Buyer Returned Item',
                        subtitle: 'Item was returned but refund not yet processed',
                        icon: 'return-down-back',
                    },
                    {
                        id: 'false_claim',
                        title: 'False Claim by Buyer',
                        subtitle: 'Buyer made false claims about item or transaction',
                        icon: 'alert-circle',
                    },
                    {
                        id: 'something_else',
                        title: 'Something else?',
                        subtitle: 'A transaction problem of different kind',
                        icon: 'ellipsis-horizontal',
                    },
                ];
            default:
                return [];
        }
    };

    const problems = getProblems();

    const toggleProblem = (problemId) => {
        if (selectedProblems.includes(problemId)) {
            setSelectedProblems(selectedProblems.filter(id => id !== problemId));
        } else {
            setSelectedProblems([...selectedProblems, problemId]);
        }
    };

    const handleContinue = () => {
        if (selectedProblems.length === 0) {
            Alert.alert(t('Selection Required'), t('Please select at least one problem to continue'));
            return;
        }

        navigation.navigate('ReviewEligibility1', {
            disputeType,
            problems: selectedProblems,
        });
    };

    const getTitle = () => {
        switch (disputeType) {
            case 'transaction':
                return 'Transaction Disputes';
            case 'buyer_initiated':
                return 'Buyer-initiated Disputes & Issues';
            case 'seller_initiated':
                return 'Seller-initiated Dispute & Issues';
            default:
                return 'Select Problem';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('Dispute an Issue')}</Text>
                    <Text style={styles.headerStep}>2/5</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                    <Ionicons name="swap-horizontal" size={20} color="#4169E1" />
                    <Text style={styles.categoryText}>{getTitle()}</Text>
                </View>

                <Text style={styles.instruction}>{t('Select at least one problem from below:')}</Text>

                {problems.map((problem) => (
                    <TouchableOpacity
                        key={problem.id}
                        style={[
                            styles.problemCard,
                            selectedProblems.includes(problem.id) && styles.problemCardSelected,
                        ]}
                        onPress={() => toggleProblem(problem.id)}
                    >
                        <View style={styles.problemIcon}>
                            <Ionicons name={problem.icon} size={24} color="#000" />
                        </View>
                        <View style={styles.problemContent}>
                            <Text style={styles.problemTitle}>{problem.title}</Text>
                            <Text style={styles.problemSubtitle}>{problem.subtitle}</Text>
                        </View>
                        <View style={styles.checkbox}>
                            {selectedProblems.includes(problem.id) ? (
                                <Ionicons name="close" size={20} color="#000" />
                            ) : (
                                <View style={styles.checkboxEmpty} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Info Link */}
                <TouchableOpacity style={styles.infoLink}>
                    <Text style={styles.infoLinkText}>
                        More information on Disputes & Resolution, <Text style={styles.linkText}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
                </TouchableOpacity>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        selectedProblems.length === 0 && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={selectedProblems.length === 0}
                >
                    <Text style={styles.continueButtonText}>{t('Continue')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerStep: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4169E1',
        marginLeft: 6,
    },
    instruction: {
        fontSize: 14,
        color: '#000',
        marginBottom: 20,
    },
    problemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        marginBottom: 12,
    },
    problemCardSelected: {
        borderColor: '#4169E1',
        backgroundColor: '#F0F7FF',
    },
    problemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    problemContent: {
        flex: 1,
    },
    problemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    problemSubtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkboxEmpty: {
        width: 16,
        height: 16,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    infoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    linkText: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 8,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    continueButton: {
        backgroundColor: '#4169E1',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#CCC',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default ProblemSelectionScreen;
