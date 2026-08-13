/**
 * useNPSTrigger
 * ─────────────────────────────────────────────────────────────────────────────
 * Fires the NPS survey after key KPI milestones, per the 2026 Marketplace KPI
 * Guide recommendation: collect buyer NPS and seller NPS separately.
 *
 * Rules:
 *  - Buyer:  show after their 3rd completed order
 *  - Seller: show after their 1st completed sale
 *  - Both:   never show more than once every 30 days
 *
 * Usage:
 *   const { checkNPSTrigger } = useNPSTrigger();
 *   // Call after an order status changes to 'completed':
 *   await checkNPSTrigger({ role: 'buyer', completedOrderCount: 3 });
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NPS_LAST_SHOWN_KEY = 'nps_last_shown_at';
const NPS_COOLDOWN_DAYS = 30;

/**
 * Returns true if the NPS survey should be shown based on cooldown.
 */
const shouldShowNPS = async () => {
    try {
        const lastShown = await AsyncStorage.getItem(NPS_LAST_SHOWN_KEY);
        if (!lastShown) return true;
        const daysSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
        return daysSince >= NPS_COOLDOWN_DAYS;
    } catch {
        return false;
    }
};

/**
 * Records that the NPS survey was shown now.
 */
const markNPSShown = async () => {
    try {
        await AsyncStorage.setItem(NPS_LAST_SHOWN_KEY, String(Date.now()));
    } catch { /* non-blocking */ }
};

/**
 * @param {object} opts
 * @param {'buyer'|'seller'} opts.role         - User's primary role
 * @param {number} opts.completedOrderCount    - Total completed orders/sales so far
 * @param {boolean} [opts.force]               - Skip cooldown check (for testing)
 */
const useNPSTrigger = () => {
    const navigation = useNavigation();

    const checkNPSTrigger = useCallback(async ({ role, completedOrderCount, force = false }) => {
        try {
            const isBuyerMilestone = role === 'buyer' && completedOrderCount === 3;
            const isSellerMilestone = role === 'seller' && completedOrderCount === 1;

            if (!isBuyerMilestone && !isSellerMilestone) return;

            const canShow = force || (await shouldShowNPS());
            if (!canShow) return;

            await markNPSShown();

            // Navigate to NPS survey with the appropriate role pre-selected
            navigation.navigate('NPSSurvey', { role });
        } catch (err) {
            // NPS trigger should never break the main flow
            console.warn('[useNPSTrigger] Non-critical error:', err?.message);
        }
    }, [navigation]);

    return { checkNPSTrigger };
};

export default useNPSTrigger;
