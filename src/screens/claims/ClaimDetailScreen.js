import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import claimService from '../../services/claimService';

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const RadioButton = ({ selected, color = '#808080', size = 22 }) => (
    <View style={[radioSt.outer, { width: size, height: size, borderRadius: size / 2 }]}>
        {selected && (
            <View style={[radioSt.inner, {
                backgroundColor: color,
                width: size * 0.55,
                height: size * 0.55,
                borderRadius: size * 0.275,
            }]} />
        )}
    </View>
);
const radioSt = StyleSheet.create({
    outer: { borderWidth: 2, borderColor: '#BBBBBB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
    inner: {},
});

const SectionHeader = ({ title, time }) => (
    <View style={s.sectionHeader}>
        <Text style={s.sectionCaps}>{title}</Text>
        {time ? <Text style={s.sectionTime}>{time}</Text> : null}
    </View>
);

const Bubble = ({ text }) => (
    <View style={s.bubble}>
        <Text style={s.bubbleText}>{text}</Text>
    </View>
);

const ULink = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress || (() => { })} activeOpacity={0.7}>
        <Text style={s.link}>{label}</Text>
    </TouchableOpacity>
);

// Clipboard icon with checkmark
const ClaimIcon = () => (
    <View style={s.iconWrap}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={52} color="#404040" />
        <View style={s.checkBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#404040" />
        </View>
    </View>
);

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

const ClaimDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { claimId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [claim, setClaim] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Form states
    const [sellerResponseText, setSellerResponseText] = useState('');
    const [sellerDecisionChoice, setSellerDecisionChoice] = useState(null);
    const [ackChecked, setAckChecked] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');
    const [myResDecision, setMyResDecision] = useState(null);

    useEffect(() => {
        loadUser().then(loadClaim);
    }, []);

    const loadUser = async () => {
        try {
            const raw = await AsyncStorage.getItem('@roundbuy:user_data');
            if (raw) setCurrentUserId(JSON.parse(raw).id);
        } catch (e) { }
    };

    const loadClaim = async () => {
        try {
            const res = await claimService.getClaimById(claimId);
            if (res?.success) setClaim(res.data);
        } catch (e) {
            Alert.alert('Error', 'Failed to load claim');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadClaim(); };

    const ago = (d) => {
        if (!d) return '';
        const h = Math.floor((Date.now() - new Date(d)) / 3600000);
        if (h < 1) return 'Just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    // ── Action handlers ──

    const sendSellerResponse = async () => {
        if (!sellerResponseText.trim()) return Alert.alert('Error', 'Enter your response');
        if (!sellerDecisionChoice) return Alert.alert('Error', 'Select a decision');
        setActionLoading(true);
        try {
            await claimService.updateClaimSellerResponse(claimId, sellerResponseText, sellerDecisionChoice);
            loadClaim();
        } catch (e) {
            Alert.alert('Error', 'Failed to send response');
        } finally { setActionLoading(false); }
    };

    const sendSuggestion = async () => {
        if (!suggestionText.trim()) return Alert.alert('Error', 'Enter your suggestion');
        setActionLoading(true);
        try {
            await claimService.submitNegotiationSuggestion(claimId, suggestionText);
            setSuggestionText('');
            loadClaim();
        } catch (e) {
            Alert.alert('Error', 'Failed to send suggestion');
        } finally { setActionLoading(false); }
    };

    const submitResDecision = async () => {
        if (!myResDecision) return Alert.alert('Select Decision', 'Please select accept or decline');
        if (!ackChecked) return Alert.alert('Required', 'Please confirm you have read the recommendation');
        setActionLoading(true);
        try {
            await claimService.submitNegotiationDecision(claimId, myResDecision);
            loadClaim();
        } catch (e) {
            Alert.alert('Error', 'Failed to submit decision');
        } finally { setActionLoading(false); }
    };

    const closeClaim = () => {
        Alert.alert('Close Claim', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Close', style: 'destructive', onPress: async () => {
                    try {
                        await claimService.closeClaim(claim.id);
                        navigation.goBack();
                    } catch (e) { Alert.alert('Error', 'Failed to close'); }
                }
            },
        ]);
    };

    const showRecommendation = () => navigation.navigate('ResolutionRecommendation', { claimId, claim });
    const proceedToResolution = () => navigation.navigate('ResolutionRecommendation', { claimId, claim });

    // ── Loading / error ──
    if (loading) {
        return (
            <SafeAreaView style={s.container} edges={['top']}>
                <View style={s.center}><ActivityIndicator size="large" color="#000" /></View>
            </SafeAreaView>
        );
    }
    if (!claim) {
        return (
            <SafeAreaView style={s.container} edges={['top']}>
                <View style={s.center}><Text>Claim not found</Text></View>
            </SafeAreaView>
        );
    }

    // ── Derived states ──
    const isSeller = currentUserId && claim.seller_id && Number(currentUserId) === Number(claim.seller_id);
    const isBuyer = currentUserId && claim.user_id && Number(currentUserId) === Number(claim.user_id);

    const sellerDecision = claim.seller_decision;   // null | 'accept' | 'decline' | 'negotiate'
    const hasResponded = !!sellerDecision;
    const isAccept = sellerDecision === 'accept';
    const isNegotiate = sellerDecision === 'negotiate';
    const isDecline = sellerDecision === 'decline';
    const isNegotiating = claim.status === 'negotiating';

    const buyerSugg = claim.buyer_suggestion;
    const sellerSugg = claim.seller_suggestion;
    const bothSuggest = !!(buyerSugg && sellerSugg);
    const mySugg = isBuyer ? buyerSugg : sellerSugg;

    const negBuyerDec = claim.negotiation_buyer_decision;
    const negSellerDec = claim.negotiation_seller_decision;
    const myNegDec = isBuyer ? negBuyerDec : negSellerDec;
    const hasMyNegDec = !!myNegDec;

    const isStatusRes = bothSuggest || !!(negBuyerDec || negSellerDec);
    const bothAccept = negBuyerDec === 'accept' && negSellerDec === 'accept';
    const anyDecline = negBuyerDec === 'decline' || negSellerDec === 'decline';
    const showFail = !bothAccept && anyDecline;
    const isSettled = claim.status === 'settled' || bothAccept;
    const isClosed = claim.status === 'closed';

    const acceptColor = bothAccept ? '#000' : (negBuyerDec === 'accept' || negSellerDec === 'accept') ? '#4CAF50' : null;
    const declineColor = anyDecline ? '#F44336' : null;

    const headerTitle = `Claim #${claim.claim_number?.replace('CLM', '')}`;

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{headerTitle}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                style={s.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={s.iconCenter}>
                    <ClaimIcon />
                    <TouchableOpacity style={s.guideCenter} activeOpacity={0.7} onPress={showRecommendation}>
                        <Text style={s.guideText}>{'ROUNDBUY CLAIM GUIDELINES & RES. RECOMMENDATION'}</Text>
                        <Ionicons name="information-circle-outline" size={28} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Created row */}
                <View style={s.createdRow}>
                    <Text style={s.createdLabel}>{`Claim #${claim.claim_number?.replace('CLM', '')} was created`}</Text>
                    <Text style={s.createdTime}>{ago(claim.created_at)}</Text>
                </View>

                {/* Info table */}
                <View style={s.infoTable}>
                    {[
                        ['Item:', claim.ad_title || 'N/A'],
                        ['Complainant:', claim.buyer_name || 'N/A'],
                        ['Respondent:', claim.seller_name || 'N/A'],
                    ].map(([label, val]) => (
                        <View style={s.infoRow} key={label}>
                            <Text style={s.infoLabel}>{label}</Text>
                            <Text style={s.infoVal}>{val}</Text>
                        </View>
                    ))}
                </View>

                <View style={s.divider} />

                {/* BUYER'S CLAIM */}
                <SectionHeader title={"BUYER'S CLAIM"} time={ago(claim.created_at)} />
                <ULink label="View Claim & Demand" />
                <ULink label="View Uploaded evidence" />

                <View style={{ height: 16 }} />

                {/* ═══════════════════════════════════════════
                    STATE 1 – SELLER PENDING (no response yet)
                ═══════════════════════════════════════════ */}
                {isSeller && !hasResponded && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time="" />
                        <Text style={s.fieldLabel}>{'Response to the Claim:'}</Text>
                        <View style={s.bubbleInput}>
                            <TextInput
                                style={s.textArea}
                                placeholder="Enter your response..."
                                placeholderTextColor="#AAA"
                                multiline
                                numberOfLines={5}
                                value={sellerResponseText}
                                onChangeText={setSellerResponseText}
                                maxLength={1000}
                            />
                        </View>
                        <Text style={s.evidLabel}>{'Evidence for the Issue:'}</Text>
                        <ULink label="Upload evidence" />
                        <ULink label="Upload evidence" />

                        <Text style={s.decisionCaps}>{"SELLER'S DECISION"}</Text>
                        {[
                            { k: 'accept', l: 'I Accept the Demand and Cancel the deal!' },
                            { k: 'decline', l: 'I decline the Demand and keep to the Agreement!' },
                            { k: 'negotiate', l: 'Continue and Negotiate to find a solution.' },
                        ].map(({ k, l }) => (
                            <TouchableOpacity key={k} style={s.radioRow} onPress={() => setSellerDecisionChoice(k)}>
                                <Text style={s.radioLabel}>{l}</Text>
                                <RadioButton selected={sellerDecisionChoice === k} color="#505050" />
                            </TouchableOpacity>
                        ))}
                        <Text style={s.note}>{"Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!"}</Text>


                        <TouchableOpacity
                            style={[s.btn, (!sellerDecisionChoice || !sellerResponseText.trim()) && s.btnDisabled]}
                            onPress={sendSellerResponse}
                            disabled={!sellerDecisionChoice || !sellerResponseText.trim() || actionLoading}
                        >
                            <Text style={s.btnTxt}>{actionLoading ? 'Sending...' : 'Send Response to Buyer'}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Buyer waiting state */}
                {isBuyer && !hasResponded && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time="" />
                        <Text style={s.statusNeutral}>{'Awaiting seller response...'}</Text>
                        <Text style={s.decisionCaps}>{"SELLER'S DECISION"}</Text>
                        {[
                            'I Accept the Demand and Cancel the deal!',
                            'I decline the Demand and keep to the Agreement!',
                            'Continue and Negotiate to find a solution.',
                        ].map(l => (
                            <View key={l} style={s.radioRow}>
                                <Text style={s.radioLabel}>{l}</Text>
                                <RadioButton selected={false} />
                            </View>
                        ))}
                        <TouchableOpacity style={[s.btn, s.btnDisabled]} disabled>
                            <Text style={s.btnTxt}>{'Proceed to Resolution'}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* ═══════════════════════════════════════════
                    STATE 2 – SELLER ACCEPTED
                ═══════════════════════════════════════════ */}
                {hasResponded && isAccept && !isStatusRes && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time={ago(claim.updated_at)} />
                        <Text style={s.fieldLabel}>{'Response to the Claim:'}</Text>
                        <Bubble text={claim.seller_response || ''} />

                        <Text style={s.evidLabel}>{'Evidence for the Issue:'}</Text>
                        <ULink label="Upload evidence" />
                        <ULink label="Upload evidence" />

                        <Text style={s.decisionCaps}>{"SELLER'S DECISION"}</Text>
                        <View style={s.radioRow}>
                            <Text style={s.radioLabel}>{'I Accept the Demand and Cancel the deal!'}</Text>
                            <RadioButton selected={true} color="#505050" />
                        </View>
                        <Text style={s.note}>{"Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!"}</Text>

                        <Text style={s.successTxt}>{'The Claim has been settled successfully!'}</Text>
                        <Text style={s.successSub}>{"Buyer's Fee will be returned in 2-4 days to Buyer."}</Text>

                        {isBuyer && (
                            <TouchableOpacity style={s.btn} onPress={proceedToResolution}>
                                <Text style={s.btnTxt}>{'Proceed to Resolution'}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════
                    STATE 3 – SELLER NEGOTIATES
                ═══════════════════════════════════════════ */}
                {hasResponded && isNegotiate && isNegotiating && !isStatusRes && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time={ago(claim.updated_at)} />
                        <Text style={s.fieldLabel}>{'Response to the Claim:'}</Text>
                        <Bubble text={claim.seller_response || ''} />

                        <Text style={s.evidLabel}>{'Evidence for the Issue:'}</Text>
                        <ULink label="Upload evidence" />
                        <ULink label="Upload evidence" />

                        <Text style={s.decisionCaps}>{"SELLER'S DECISION"}</Text>
                        <View style={s.radioRow}>
                            <Text style={s.radioLabel}>{'Continue and Negotiate to find a solution.'}</Text>
                            <RadioButton selected={true} color="#505050" />
                        </View>

                        {!mySugg ? (
                            <>
                                <Text style={s.fieldLabel}>{isBuyer ? "Buyer's suggestion for settlement:" : "Seller's suggestion for resolution:"}</Text>
                                <View style={s.bubbleInput}>
                                    <TextInput
                                        style={s.textArea}
                                        placeholder="Describe your suggestion..."
                                        placeholderTextColor="#AAA"
                                        multiline
                                        value={suggestionText}
                                        onChangeText={setSuggestionText}
                                    />
                                </View>
                                <Text style={s.evidLabel}>{'Additional evidence for the Claim:'}</Text>
                                <ULink label="Upload evidence" />
                                <ULink label="Upload evidence" />
                                <TouchableOpacity
                                    style={[s.btn, (!suggestionText.trim() || actionLoading) && s.btnDisabled]}
                                    onPress={sendSuggestion}
                                    disabled={!suggestionText.trim() || actionLoading}
                                >
                                    <Text style={s.btnTxt}>{actionLoading ? 'Sending...' : 'Give your Suggestion'}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={s.waitBanner}>
                                <Text style={s.waitTxt}>{'Your suggestion has been submitted. Waiting for the other party...'}</Text>
                            </View>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════
                    STATE 4 – STATUS RESOLUTIONS
                ═══════════════════════════════════════════ */}
                {isStatusRes && !isSettled && !isClosed && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time={ago(claim.updated_at)} />
                        <ULink label="View Response to the Claim" />
                        <ULink label="View Uploaded evidence" />

                        {buyerSugg && (
                            <>
                                <Text style={s.fieldLabel}>{"Buyer's suggestion for settlement:"}</Text>
                                <Bubble text={buyerSugg} />
                                <Text style={s.evidLabel}>{'Additional evidence for the Claim:'}</Text>
                                <ULink label="Upload evidence" />
                                <ULink label="Upload evidence" />
                            </>
                        )}
                        {sellerSugg && (
                            <>
                                <Text style={s.fieldLabel}>{"Seller's suggestion for resolution:"}</Text>
                                <Bubble text={sellerSugg} />
                                <Text style={s.evidLabel}>{'Additional evidence for the Claim:'}</Text>
                                <ULink label="Upload evidence" />
                                <ULink label="Upload evidence" />
                            </>
                        )}

                        <Text style={s.decisionCaps}>{'DECISIONS BY SELLER AND BUYER'}</Text>

                        {/* Seller's decision row */}
                        <TouchableOpacity
                            style={s.radioRow}
                            onPress={() => !hasMyNegDec && setMyResDecision('accept')}
                        >
                            <Text style={s.radioLabel}>
                                {'SELLER: '}
                                <Text style={s.radioLabelNormal}>
                                    {negSellerDec === 'accept' ? 'I Accept the negotiated resolution!' :
                                     negSellerDec === 'decline' ? 'I decline the negotiated resolution!' :
                                     'Awaiting seller decision...'}
                                </Text>
                            </Text>
                            <RadioButton selected={!!negSellerDec} color={'#505050'} />
                        </TouchableOpacity>

                        {/* Buyer's decision row */}
                        <TouchableOpacity
                            style={s.radioRow}
                            onPress={() => !hasMyNegDec && isBuyer && setMyResDecision('accept')}
                        >
                            <Text style={s.radioLabel}>
                                {'BUYER: '}
                                <Text style={s.radioLabelNormal}>
                                    {negBuyerDec === 'accept' ? 'I Accept the negotiated resolution!' :
                                     negBuyerDec === 'decline' ? 'I decline the negotiated resolution!' :
                                     (!hasMyNegDec && isBuyer && myResDecision ?
                                         (myResDecision === 'accept' ? 'I Accept the negotiated resolution!' : 'I decline the negotiated resolution!') :
                                         'Awaiting your decision...')}
                                </Text>
                            </Text>
                            <RadioButton
                                selected={!!(negBuyerDec || (!hasMyNegDec && myResDecision))}
                                color={'#505050'}
                            />
                        </TouchableOpacity>
                        <Text style={s.note}>{"Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!"}</Text>

                        <Text style={s.decisionCaps}>{'RESOLUTION RECOMMENDATION'}</Text>
                        <TouchableOpacity style={s.radioRow} onPress={() => setAckChecked(!ackChecked)}>
                            <Text style={[s.radioLabel, { flex: 1, paddingRight: 12 }]}>
                                {'I confirm I have read the Resolution Recommendation and made my decision after carefully weighing the best resolution, which is fair for both of the parties.'}
                            </Text>
                            <RadioButton selected={ackChecked} color="#505050" />
                        </TouchableOpacity>
                        <ULink label="View Resolution Recommendations" onPress={showRecommendation} />

                        {showFail && (
                            <>
                                <Text style={s.failTxt}>{'The Claim has not been settled!'}</Text>
                                <Text style={s.failSub}>{'Consider further negotiation or admin review'}</Text>
                            </>
                        )}

                        {!hasMyNegDec && (
                            <TouchableOpacity
                                style={[s.btn, (!myResDecision || actionLoading) && s.btnDisabled]}
                                onPress={submitResDecision}
                                disabled={!myResDecision || actionLoading}
                            >
                                <Text style={s.btnTxt}>{actionLoading ? 'Submitting...' : 'Give your Suggestion'}</Text>
                            </TouchableOpacity>
                        )}

                        {isBuyer && showFail && (
                            <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={closeClaim}>
                                <Text style={s.btnOutlineTxt}>{'Close the Claim'}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════
                    STATE 4B – BOTH ACCEPTED (settled)
                ═══════════════════════════════════════════ */}
                {isSettled && !isClosed && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time={ago(claim.updated_at)} />
                        <ULink label="View Response to the Claim" />
                        <ULink label="View Uploaded evidence" />

                        <Text style={s.decisionCaps}>{'DECISIONS BY SELLER AND BUYER'}</Text>
                        <View style={s.radioRow}>
                            <Text style={s.radioLabel}>
                                {'SELLER: '}<Text style={s.radioLabelNormal}>{'I Accept the negotiated resolution!'}</Text>
                            </Text>
                            <RadioButton selected={true} color="#000" />
                        </View>
                        <View style={s.radioRow}>
                            <Text style={s.radioLabel}>
                                {'BUYER: '}<Text style={s.radioLabelNormal}>{'I Accept the negotiated resolution!'}</Text>
                            </Text>
                            <RadioButton selected={true} color="#000" />
                        </View>
                        <Text style={s.note}>{"Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!"}</Text>

                        <Text style={s.decisionCaps}>{'RESOLUTION RECOMMENDATION'}</Text>
                        <View style={s.radioRow}>
                            <Text style={[s.radioLabel, { flex: 1, paddingRight: 12 }]}>
                                {'I confirm I have read the Resolution Recommendation and made my decision after carefully weighing the best resolution, which is fair for both of the parties.'}
                            </Text>
                            <RadioButton selected={true} color="#505050" />
                        </View>
                        <ULink label="View Resolution Recommendations" onPress={showRecommendation} />

                        <Text style={s.successTxt}>{'The Claim has been settled successfully!'}</Text>
                        <Text style={s.successSub}>{"Buyer's Fee will be returned in 2-4 days to Buyer."}</Text>
                        <TouchableOpacity style={s.btn} onPress={closeClaim}>
                            <Text style={s.btnTxt}>{'Close the Claim'}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* ═══════════════════════════════════════════
                    STATE 5 – SELLER DECLINED
                ═══════════════════════════════════════════ */}
                {hasResponded && isDecline && !isStatusRes && (
                    <>
                        <SectionHeader title={"SELLER'S DEFENCE"} time={ago(claim.updated_at)} />
                        <ULink label="View Response to the Claim" />
                        <ULink label="View Uploaded evidence" />

                        <View style={s.radioRow}>
                            <Text style={s.radioLabel}>
                                {'SELLER: '}<Text style={s.radioLabelNormal}>{'I decline the Demand and keep to the Agreement!'}</Text>
                            </Text>
                            <RadioButton selected={true} color="#505050" />
                        </View>
                        <Text style={s.note}>{"Please note! Accepting cancels the deal and returns Buyer's Fee to Buyer!"}</Text>

                        {isSeller && (
                            <View style={s.waitBanner}>
                                <Text style={s.waitTxt}>{'You have declined the claim. The buyer may negotiate or wait for admin review.'}</Text>
                            </View>
                        )}
                        {isBuyer && (
                            <>
                                <Text style={s.failTxt}>{'The Claim has not been settled!'}</Text>
                                <Text style={s.failSub}>{'The support team will review the defense'}</Text>
                                <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={closeClaim}>
                                    <Text style={s.btnOutlineTxt}>{'Close the Claim'}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}

                {/* Footer */}
                <View style={s.footer}>
                    <Text style={s.footerTxt}>
                        {'More on '}
                        <Text style={s.footerLink} onPress={showRecommendation}>{'Claim Resolution'}</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scroll: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: 4 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#000', paddingLeft: 8 },

    iconCenter: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
    iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    checkBadge: { position: 'absolute', bottom: -4, right: -8 },
    guideCenter: { alignItems: 'center', paddingHorizontal: 20, marginTop: 8 },
    guideText: { fontSize: 12, fontWeight: '700', color: '#404040', letterSpacing: 0.3, textAlign: 'center', marginBottom: 4 },

    createdRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, marginBottom: 8 },
    createdLabel: { fontSize: 14, fontWeight: '600', color: '#000' },
    createdTime: { fontSize: 12, color: '#808080' },

    infoTable: { paddingHorizontal: 20, marginBottom: 10 },
    infoRow: { flexDirection: 'row', marginBottom: 2 },
    infoLabel: { width: 110, fontSize: 14, fontWeight: '700', color: '#000' },
    infoVal: { flex: 1, fontSize: 14, color: '#505050' },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20, marginVertical: 8 },

    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 20, marginBottom: 6, marginTop: 4,
    },
    sectionCaps: { fontSize: 13, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
    sectionTime: { fontSize: 12, color: '#808080' },
    decisionCaps: {
        fontSize: 13, fontWeight: '800', color: '#000',
        letterSpacing: 0.5, paddingHorizontal: 20,
        marginTop: 16, marginBottom: 6,
    },

    link: { fontSize: 14, color: '#1A4FDB', textDecorationLine: 'underline', paddingHorizontal: 20, marginBottom: 4 },

    bubble: { marginHorizontal: 20, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, marginBottom: 8 },
    bubbleText: { fontSize: 16, color: '#333', lineHeight: 22 },
    bubbleInput: { marginHorizontal: 20, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, marginBottom: 8 },
    textArea: { fontSize: 16, color: '#000', minHeight: 90, textAlignVertical: 'top' },

    fieldLabel: { fontSize: 15, fontWeight: '600', color: '#000', paddingHorizontal: 20, marginTop: 10, marginBottom: 6 },
    evidLabel: { fontSize: 15, fontWeight: '600', color: '#000', paddingHorizontal: 20, marginTop: 10, marginBottom: 4 },
    note: { fontSize: 12, color: '#808080', paddingHorizontal: 20, marginBottom: 8 },

    radioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 9 },
    radioLabel: { fontSize: 16, fontWeight: '700', color: '#000', flex: 1, paddingRight: 14 },
    radioLabelNormal: { fontSize: 16, fontWeight: '400', color: '#000' },

    statusNeutral: { fontSize: 14, color: '#808080', paddingHorizontal: 20, marginBottom: 10, fontStyle: 'italic' },
    successTxt: { fontSize: 16, fontWeight: '700', color: '#00C853', textAlign: 'center', marginTop: 16, paddingHorizontal: 20 },
    successSub: { fontSize: 13, color: '#00C853', textAlign: 'center', marginBottom: 4 },
    failTxt: { fontSize: 16, fontWeight: '700', color: '#000', textAlign: 'center', marginTop: 16, paddingHorizontal: 20 },
    failSub: { fontSize: 14, fontWeight: '600', color: '#505050', textAlign: 'center', marginBottom: 4 },

    btn: {
        backgroundColor: '#D8D8D8',
        marginHorizontal: 20, marginTop: 14,
        paddingVertical: 16, borderRadius: 32,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.45 },
    btnTxt: { color: '#000', fontSize: 17, fontWeight: '700' },
    btnOutline: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#C0C0C0' },
    btnOutlineTxt: { color: '#333', fontSize: 15, fontWeight: '700' },

    waitBanner: { backgroundColor: '#F8F8F8', marginHorizontal: 20, borderRadius: 12, padding: 14, marginTop: 10 },
    waitTxt: { fontSize: 14, color: '#505050', textAlign: 'center' },

    footer: { alignItems: 'center', paddingTop: 24 },
    footerTxt: { fontSize: 12, color: '#505050' },
    footerLink: { color: '#1A4FDB', textDecorationLine: 'underline', fontWeight: '600' },
});

export default ClaimDetailScreen;
