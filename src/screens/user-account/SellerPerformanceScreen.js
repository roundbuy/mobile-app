import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../services/api';

// ── Score colour helper ───────────────────────────────────────────────────────
const scoreColor = (s) => {
    if (s >= 80) return '#10b981';  // green
    if (s >= 60) return '#f59e0b';  // amber
    return '#ef4444';               // red
};
const scoreLabel = (s) => {
    if (s >= 80) return 'Elite';
    if (s >= 60) return 'Good';
    return 'At Risk';
};

// ── Metric row ────────────────────────────────────────────────────────────────
const MetricRow = ({ icon, label, value, barValue, barMax = 100, highlight }) => {
    const pct = Math.min((barValue / barMax) * 100, 100);
    const bar = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
                <View style={[styles.metricIcon, { backgroundColor: `${bar}18` }]}>
                    <Ionicons name={icon} size={18} color={bar} />
                </View>
                <View>
                    <Text style={styles.metricLabel}>{label}</Text>
                    <Text style={[styles.metricValue, highlight && { color: bar }]}>{value}</Text>
                </View>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: bar }]} />
            </View>
        </View>
    );
};

// ── Tip card ──────────────────────────────────────────────────────────────────
const TipCard = ({ tip, index }) => {
    const icons = {
        sales: 'pricetag-outline',
        reply: 'chatbubble-outline',
        response: 'notifications-outline',
        disputes: 'shield-checkmark-outline',
        pickup: 'bicycle-outline',
    };
    return (
        <View style={styles.tipCard}>
            <View style={styles.tipIconBox}>
                <Ionicons name={icons[tip.key] || 'bulb-outline'} size={20} color="#1e3a8a" />
            </View>
            <Text style={styles.tipText}>{tip.message}</Text>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const SellerPerformanceScreen = ({ navigation }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchMetrics = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/seller-metrics/me');
            setMetrics(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching seller performance:', err);
            setError('Could not load your performance data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchMetrics(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMetrics(true);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centred}>
                    <ActivityIndicator size="large" color={COLORS.primary || '#1e3a8a'} />
                    <Text style={styles.loadingText}>Loading your performance…</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !metrics) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centred}>
                    <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
                    <Text style={styles.errorText}>{error || 'No performance data found.'}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMetrics()}>
                        <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const score = parseFloat(metrics.seller_score || 0);
    const acceptanceRate = metrics.total_orders > 0
        ? Math.round((metrics.completed_orders / metrics.total_orders) * 100)
        : 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Performance</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                    <Ionicons name="refresh-outline" size={22} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e3a8a" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Score Hero */}
                <View style={[styles.scoreCard, { borderColor: `${scoreColor(score)}30` }]}>
                    <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor(score)}14` }]}>
                        <Text style={[styles.scoreBig, { color: scoreColor(score) }]}>
                            {score.toFixed(1)}
                        </Text>
                        <Text style={styles.scoreMax}>/100</Text>
                    </View>
                    <View style={styles.scoreRight}>
                        <Text style={styles.scoreName}>{metrics.full_name || 'Your Score'}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: scoreColor(score) }]}>
                            <Text style={styles.levelText}>{scoreLabel(score)} Seller</Text>
                        </View>
                        <Text style={styles.scoreSubtext}>
                            {metrics.completed_orders || 0} completed · {metrics.cancelled_orders || 0} cancelled orders
                        </Text>
                        {metrics.average_rating > 0 && (
                            <Text style={styles.ratingText}>
                                ★ {parseFloat(metrics.average_rating).toFixed(2)} avg buyer rating ({metrics.total_feedbacks || 0} reviews)
                            </Text>
                        )}
                    </View>
                </View>

                {/* Seller Score Formula explainer */}
                <View style={styles.formulaBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#64748b" />
                    <Text style={styles.formulaText}>
                        Score = 30% Sales + 25% Fast Reply + 25% Response Speed + 10% Disputes + 10% Pickup
                    </Text>
                </View>

                {/* KPI Breakdown */}
                <Text style={styles.sectionTitle}>KPI Breakdown</Text>
                <View style={styles.metricsCard}>
                    <MetricRow
                        icon="checkmark-circle-outline"
                        label="Successful Sales Rate"
                        value={`${parseFloat(metrics.successful_sales_rate || 0).toFixed(1)}%`}
                        barValue={metrics.successful_sales_rate || 0}
                        highlight
                    />
                    <View style={styles.divider} />
                    <MetricRow
                        icon="flash-outline"
                        label="Fast Reply Rate (≤ 2h)"
                        value={`${parseFloat(metrics.questions_answered_within_2h_rate || 0).toFixed(1)}%`}
                        barValue={metrics.questions_answered_within_2h_rate || 0}
                        highlight
                    />
                    <View style={styles.divider} />
                    <MetricRow
                        icon="time-outline"
                        label="Avg Response Time"
                        value={
                            metrics.avg_response_time_minutes < 60
                                ? `${metrics.avg_response_time_minutes} min`
                                : `${(metrics.avg_response_time_minutes / 60).toFixed(1)}h`
                        }
                        barValue={Math.max(0, 100 - Math.min(metrics.avg_response_time_minutes || 100, 100))}
                        highlight
                    />
                    <View style={styles.divider} />
                    <MetricRow
                        icon="shield-checkmark-outline"
                        label="Dispute Resolution Rate"
                        value={`${parseFloat(metrics.dispute_resolution_rate || 0).toFixed(1)}%`}
                        barValue={metrics.dispute_resolution_rate || 0}
                        highlight
                    />
                    <View style={styles.divider} />
                    <MetricRow
                        icon="bicycle-outline"
                        label="Pickup Attendance Rate"
                        value={`${parseFloat(metrics.pickup_meeting_attendance_rate || 0).toFixed(1)}%`}
                        barValue={metrics.pickup_meeting_attendance_rate || 0}
                        highlight
                    />
                    <View style={styles.divider} />
                    <MetricRow
                        icon="cart-outline"
                        label="Order Acceptance Rate"
                        value={`${acceptanceRate}%`}
                        barValue={acceptanceRate}
                        highlight
                    />
                </View>

                {/* Tips */}
                {metrics.tips && metrics.tips.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>💡 Tips to Improve Your Score</Text>
                        {metrics.tips.map((tip, i) => (
                            <TipCard key={tip.key} tip={tip} index={i} />
                        ))}
                    </>
                )}

                {metrics.tips && metrics.tips.length === 0 && (
                    <View style={styles.allGoodCard}>
                        <Ionicons name="trophy-outline" size={28} color="#10b981" />
                        <Text style={styles.allGoodText}>All KPIs in excellent shape! Keep it up.</Text>
                    </View>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
    errorText: { marginTop: 12, fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
    retryBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#1e3a8a', borderRadius: 8 },
    retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { padding: 4 },
    refreshBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },

    scroll: { padding: 16 },

    // Score hero
    scoreCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    scoreBadge: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 2 },
    scoreBig: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
    scoreMax: { fontSize: 14, color: '#94a3b8', fontWeight: '600', alignSelf: 'flex-end', marginBottom: 6 },
    scoreRight: { flex: 1 },
    scoreName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    levelBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
    levelText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
    scoreSubtext: { fontSize: 12, color: '#64748b' },
    ratingText: { fontSize: 12, color: '#f59e0b', fontWeight: '600', marginTop: 2 },

    // Formula
    formulaBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10, marginBottom: 20 },
    formulaText: { flex: 1, fontSize: 11, color: '#64748b', lineHeight: 16 },

    // Section
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10 },

    // Metrics card
    metricsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    metricRow: { paddingVertical: 10 },
    metricLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    metricIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    metricLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    metricValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    barTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 2 },

    // Tips
    tipCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#1e3a8a', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
    tipIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(30,58,138,0.08)', justifyContent: 'center', alignItems: 'center' },
    tipText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 20 },

    // All good
    allGoodCard: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    allGoodText: { flex: 1, fontSize: 14, color: '#166534', fontWeight: '600', lineHeight: 22 },
});

export default SellerPerformanceScreen;
